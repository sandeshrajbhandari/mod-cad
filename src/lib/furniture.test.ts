import { describe, expect, it } from 'vitest'
import { clampConfig, createDefaultConfig, generateParts } from './furniture'

describe('furniture config', () => {
  it('clamps invalid cabinet dimensions and normalizes restricted fields', () => {
    const clamped = clampConfig({
      ...createDefaultConfig('cabinet'),
      width: 9999,
      height: 111,
      depth: 999,
      modules: 12,
      shelfCount: 9,
    })

    expect(clamped.width).toBe(2600)
    expect(clamped.height).toBe(720)
    expect(clamped.depth).toBe(700)
    expect(clamped.modules).toBe(4)
    expect(clamped.shelfCount).toBe(4)
  })

  it('forces shelf family to remain open-fronted', () => {
    const clamped = clampConfig({
      ...createDefaultConfig('shelf'),
      frontStyle: 'doors',
    })

    expect(clamped.frontStyle).toBe('open')
  })
})

describe('generateParts', () => {
  it('returns deterministic parts for the same config', () => {
    const config = createDefaultConfig('desk')
    expect(generateParts(config)).toEqual(generateParts(config))
  })

  it('includes family-specific parts', () => {
    expect(generateParts(createDefaultConfig('cabinet')).some((part) => part.name === 'Door front')).toBe(true)
    expect(generateParts(createDefaultConfig('shelf')).some((part) => part.name === 'Back brace')).toBe(true)
    expect(generateParts(createDefaultConfig('desk')).some((part) => part.name === 'Cable rail')).toBe(true)
  })
})
