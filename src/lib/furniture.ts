export type FurnitureFamily = 'cabinet' | 'shelf' | 'desk'
export type FurnitureTheme = 'oak' | 'walnut' | 'ash'
export type ModuleLayout = 'single' | 'split' | 'grid'
export type FrontStyle = 'open' | 'doors'
export type DeskTopStyle = 'rect' | 'rounded'

export interface FurnitureConfig {
  family: FurnitureFamily
  width: number
  height: number
  depth: number
  modules: number
  layout: ModuleLayout
  theme: FurnitureTheme
  frontStyle: FrontStyle
  shelfCount: number
  deskTopStyle: DeskTopStyle
}

export interface ThemeDefinition {
  label: string
  body: string
  accent: string
}

export interface GeneratedPart {
  name: string
  dimensions: string
  quantity: number
}

export interface GeometryNode {
  key: string
  size: [number, number, number]
  position: [number, number, number]
  color: string
}

export interface GeneratedModel {
  nodes: GeometryNode[]
  bounds: [number, number, number]
}

export const FAMILY_LABELS: Record<FurnitureFamily, string> = {
  cabinet: 'Storage cabinet',
  shelf: 'Shelving bay',
  desk: 'Work desk',
}

export const THEMES: Record<FurnitureTheme, ThemeDefinition> = {
  oak: { label: 'Warm oak', body: '#caa06e', accent: '#ede1cf' },
  walnut: { label: 'Dark walnut', body: '#7c563a', accent: '#d3c0af' },
  ash: { label: 'Pale ash', body: '#d6c9b7', accent: '#fbf7ef' },
}

const FAMILY_BOUNDS: Record<
  FurnitureFamily,
  { width: [number, number]; height: [number, number]; depth: [number, number]; modules: [number, number] }
> = {
  cabinet: { width: [900, 2600], height: [720, 2400], depth: [320, 700], modules: [1, 4] },
  shelf: { width: [700, 2400], height: [1000, 2600], depth: [240, 520], modules: [1, 5] },
  desk: { width: [1000, 2400], height: [720, 980], depth: [500, 900], modules: [1, 3] },
}

const BOARD_THICKNESS = 18
const MM_TO_SCENE = 0.001

export function createDefaultConfig(family: FurnitureFamily): FurnitureConfig {
  switch (family) {
    case 'cabinet':
      return {
        family,
        width: 1800,
        height: 920,
        depth: 560,
        modules: 3,
        layout: 'split',
        theme: 'oak',
        frontStyle: 'doors',
        shelfCount: 2,
        deskTopStyle: 'rect',
      }
    case 'shelf':
      return {
        family,
        width: 1400,
        height: 2100,
        depth: 340,
        modules: 4,
        layout: 'grid',
        theme: 'ash',
        frontStyle: 'open',
        shelfCount: 4,
        deskTopStyle: 'rect',
      }
    case 'desk':
      return {
        family,
        width: 1600,
        height: 760,
        depth: 700,
        modules: 2,
        layout: 'split',
        theme: 'walnut',
        frontStyle: 'open',
        shelfCount: 1,
        deskTopStyle: 'rounded',
      }
  }
}

export function clampConfig(input: FurnitureConfig): FurnitureConfig {
  const base = createDefaultConfig(input.family)
  const bounds = FAMILY_BOUNDS[input.family]

  const width = clamp(snap(clamp(input.width, ...bounds.width), 50), ...bounds.width)
  const depth = clamp(snap(clamp(input.depth, ...bounds.depth), 20), ...bounds.depth)
  const heightStep = input.family === 'desk' ? 10 : 50
  const height = clamp(snap(clamp(input.height, ...bounds.height), heightStep), ...bounds.height)
  const modules = clamp(Math.round(input.modules), ...bounds.modules)
  const layout = validLayouts(input.family).includes(input.layout) ? input.layout : base.layout
  const frontStyle = input.family === 'shelf' ? 'open' : input.frontStyle === 'doors' ? 'doors' : 'open'
  const shelfLimit = input.family === 'desk' ? 2 : input.family === 'cabinet' ? 4 : 6
  const shelfCount = clamp(Math.round(input.shelfCount), 0, shelfLimit)
  const deskTopStyle = input.family === 'desk' ? input.deskTopStyle ?? base.deskTopStyle : 'rect'

  return {
    ...input,
    width,
    depth,
    height,
    modules,
    layout,
    frontStyle,
    shelfCount,
    deskTopStyle,
  }
}

export function validLayouts(family: FurnitureFamily): ModuleLayout[] {
  if (family === 'desk') {
    return ['single', 'split']
  }

  return ['single', 'split', 'grid']
}

export function generateParts(config: FurnitureConfig): GeneratedPart[] {
  const safe = clampConfig(config)
  const moduleWidth = Math.floor(safe.width / safe.modules)
  const carcassHeight = safe.family === 'desk' ? 360 : safe.height
  const topThickness = safe.family === 'desk' ? 28 : BOARD_THICKNESS

  const parts: GeneratedPart[] = [
    {
      name: 'Top panel',
      dimensions: `${safe.width} × ${safe.depth} × ${topThickness} mm`,
      quantity: 1,
    },
    {
      name: 'Base panel',
      dimensions: `${safe.width} × ${safe.depth} × ${BOARD_THICKNESS} mm`,
      quantity: safe.family === 'desk' ? 0 : 1,
    },
    {
      name: 'Side panel',
      dimensions: `${carcassHeight} × ${safe.depth} × ${BOARD_THICKNESS} mm`,
      quantity: 2,
    },
    {
      name: 'Vertical divider',
      dimensions: `${carcassHeight} × ${safe.depth} × ${BOARD_THICKNESS} mm`,
      quantity: Math.max(0, safe.modules - 1),
    },
    {
      name: safe.family === 'desk' ? 'Interior box shelf' : 'Adjustable shelf',
      dimensions: `${moduleWidth - BOARD_THICKNESS * 2} × ${safe.depth - 30} × ${BOARD_THICKNESS} mm`,
      quantity: Math.max(0, safe.shelfCount * safe.modules),
    },
  ]

  if (safe.family === 'cabinet' && safe.frontStyle === 'doors') {
    parts.push({
      name: 'Door front',
      dimensions: `${Math.floor(moduleWidth / 2) - 6} × ${safe.height - 32} × 20 mm`,
      quantity: safe.modules * 2,
    })
  }

  if (safe.family === 'shelf') {
    parts.push({
      name: 'Back brace',
      dimensions: `${safe.width} × 90 × 18 mm`,
      quantity: 2,
    })
  }

  if (safe.family === 'desk') {
    parts.push(
      {
        name: 'Leg panel',
        dimensions: `${safe.height - 28} × ${safe.depth - 120} × ${BOARD_THICKNESS} mm`,
        quantity: 2,
      },
      {
        name: 'Cable rail',
        dimensions: `${Math.max(600, safe.width - 220)} × 80 × 18 mm`,
        quantity: 1,
      },
    )
  }

  return parts.filter((part) => part.quantity > 0)
}

export function generateModel(config: FurnitureConfig): GeneratedModel {
  const safe = clampConfig(config)
  const bodyColor = THEMES[safe.theme].body
  const accentColor = THEMES[safe.theme].accent
  const nodes: GeometryNode[] = []
  const width = safe.width * MM_TO_SCENE
  const height = safe.height * MM_TO_SCENE
  const depth = safe.depth * MM_TO_SCENE
  const thickness = BOARD_THICKNESS * MM_TO_SCENE
  const moduleWidth = width / safe.modules
  const legHeight = Math.max(0.68, height - 0.028)

  const addNode = (
    key: string,
    size: [number, number, number],
    position: [number, number, number],
    color = bodyColor,
  ) => {
    nodes.push({ key, size, position, color })
  }

  if (safe.family === 'desk') {
    addNode('top', [width, 0.028, depth], [0, height - 0.014, 0])
    addNode('left-leg', [0.06, legHeight, depth - 0.14], [-(width / 2) + 0.08, legHeight / 2, 0], accentColor)
    addNode('right-leg', [0.06, legHeight, depth - 0.14], [(width / 2) - 0.08, legHeight / 2, 0], accentColor)
    addNode('rail', [width - 0.24, 0.08, 0.04], [0, height - 0.14, -(depth / 2) + 0.06])

    const boxWidth = Math.min(moduleWidth * 0.9, 0.38)
    for (let index = 0; index < safe.modules; index += 1) {
      const centerX = safe.modules === 1 ? 0 : -width / 4 + index * (width / 2)
      addNode(`desk-box-${index}`, [boxWidth, 0.3, depth - 0.18], [centerX, 0.45, 0], bodyColor)
      for (let shelfIndex = 0; shelfIndex < safe.shelfCount; shelfIndex += 1) {
        addNode(
          `desk-shelf-${index}-${shelfIndex}`,
          [boxWidth - 0.03, 0.018, depth - 0.22],
          [centerX, 0.34 + shelfIndex * 0.12, 0],
          accentColor,
        )
      }
    }

    return { nodes, bounds: [width, height, depth] }
  }

  addNode('top', [width, thickness, depth], [0, height - thickness / 2, 0])
  addNode('base', [width, thickness, depth], [0, thickness / 2, 0])
  addNode('left-side', [thickness, height, depth], [-(width / 2) + thickness / 2, height / 2, 0])
  addNode('right-side', [thickness, height, depth], [(width / 2) - thickness / 2, height / 2, 0])

  for (let divider = 1; divider < safe.modules; divider += 1) {
    const x = -width / 2 + divider * moduleWidth
    addNode(`divider-${divider}`, [thickness, height, depth], [x, height / 2, 0])
  }

  const shelfLevels = safe.family === 'shelf' ? safe.shelfCount + 1 : safe.shelfCount
  for (let col = 0; col < safe.modules; col += 1) {
    const x = -width / 2 + moduleWidth * col + moduleWidth / 2
    for (let shelf = 0; shelf < shelfLevels; shelf += 1) {
      const y = ((shelf + 1) / (shelfLevels + 1)) * (height - 0.05)
      addNode(
        `shelf-${col}-${shelf}`,
        [moduleWidth - thickness * 1.4, thickness, depth - 0.03],
        [x, y, 0],
        accentColor,
      )
    }

    if (safe.family === 'cabinet' && safe.frontStyle === 'doors') {
      addNode(
        `door-left-${col}`,
        [moduleWidth / 2 - 0.01, height - 0.04, 0.02],
        [x - moduleWidth / 4, height / 2, depth / 2 + 0.012],
        accentColor,
      )
      addNode(
        `door-right-${col}`,
        [moduleWidth / 2 - 0.01, height - 0.04, 0.02],
        [x + moduleWidth / 4, height / 2, depth / 2 + 0.012],
        accentColor,
      )
    }
  }

  if (safe.family === 'shelf') {
    addNode('brace-top', [width - 0.06, 0.09, 0.02], [0, height - 0.16, -(depth / 2) + 0.02], accentColor)
    addNode('brace-base', [width - 0.06, 0.09, 0.02], [0, 0.16, -(depth / 2) + 0.02], accentColor)
  }

  return { nodes, bounds: [width, height, depth] }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function snap(value: number, step: number) {
  return Math.round(value / step) * step
}
