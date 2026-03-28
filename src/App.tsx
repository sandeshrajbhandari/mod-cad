import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import './App.css'
import {
  type FurnitureConfig,
  type FurnitureFamily,
  FAMILY_LABELS,
  THEMES,
  clampConfig,
  createDefaultConfig,
  generateModel,
  generateParts,
} from './lib/furniture'
import { deserializeConfig, serializeConfig } from './lib/urlState'
import { ConfiguratorPanel } from './components/ConfiguratorPanel'
import { PartsPanel } from './components/PartsPanel'

const FAMILY_OPTIONS = Object.entries(FAMILY_LABELS) as [FurnitureFamily, string][]
const FurnitureViewport = lazy(() =>
  import('./components/FurnitureViewport').then((module) => ({
    default: module.FurnitureViewport,
  })),
)

function App() {
  const [config, setConfig] = useState<FurnitureConfig>(() =>
    deserializeConfig(window.location.search) ?? createDefaultConfig('cabinet'),
  )
  const [shareState, setShareState] = useState<'idle' | 'copied'>('idle')

  useEffect(() => {
    const nextSearch = serializeConfig(config)
    const nextUrl = `${window.location.pathname}${nextSearch}`
    window.history.replaceState({}, '', nextUrl)
  }, [config])

  useEffect(() => {
    if (shareState !== 'copied') {
      return undefined
    }

    const timeout = window.setTimeout(() => setShareState('idle'), 1600)
    return () => window.clearTimeout(timeout)
  }, [shareState])

  const model = useMemo(() => generateModel(config), [config])
  const parts = useMemo(() => generateParts(config), [config])
  const totalParts = parts.reduce((sum, part) => sum + part.quantity, 0)

  const updateConfig = (partial: Partial<FurnitureConfig>) => {
    setConfig((current) => clampConfig({ ...current, ...partial }))
  }

  const setFamily = (family: FurnitureFamily) => {
    setConfig((current) =>
      clampConfig({
        ...createDefaultConfig(family),
        theme: current.theme,
      }),
    )
  }

  const handleShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}${serializeConfig(config)}`

    try {
      await navigator.clipboard.writeText(url)
      setShareState('copied')
    } catch {
      window.prompt('Copy this share link', url)
    }
  }

  return (
    <main className="app-shell">
      <section className="app-intro">
        <div>
          <p className="eyebrow">Modular furniture prototype</p>
          <h1>Design practical furniture concepts that feel ready to pitch.</h1>
        </div>
        <p className="intro-copy">
          Configure cabinet, shelf, and desk systems with constrained dimensions,
          material presets, and a live 3D preview. Every change updates the
          parts list for an easy, demo-friendly manufacturing story.
        </p>
      </section>

      <section className="studio-grid">
        <ConfiguratorPanel
          config={config}
          families={FAMILY_OPTIONS}
          themes={THEMES}
          onConfigChange={updateConfig}
          onFamilyChange={setFamily}
          onShare={handleShare}
          shareState={shareState}
        />

        <section className="viewer-column">
          <div className="viewer-card">
            <div className="viewer-topbar">
              <div>
                <p className="viewer-label">Live 3D preview</p>
                <h2>{FAMILY_LABELS[config.family]} concept</h2>
              </div>
              <div className="viewer-stats">
                <span>{config.modules} modules</span>
                <span>{totalParts} parts</span>
                <span>{THEMES[config.theme].label}</span>
              </div>
            </div>
            <Suspense fallback={<ViewerFallback />}>
              <FurnitureViewport config={config} model={model} />
            </Suspense>
          </div>

          <PartsPanel parts={parts} family={config.family} />
        </section>
      </section>
    </main>
  )
}

function ViewerFallback() {
  return (
    <div className="canvas-shell canvas-shell-loading">
      <div className="viewer-loader">
        <span className="viewer-loader-orb" />
        <p>Loading 3D workspace</p>
      </div>
    </div>
  )
}

export default App
