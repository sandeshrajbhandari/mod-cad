import clsx from 'clsx'
import {
  type FurnitureConfig,
  type FurnitureFamily,
  type FurnitureTheme,
  FAMILY_LABELS,
  validLayouts,
} from '../lib/furniture'

interface ConfiguratorPanelProps {
  config: FurnitureConfig
  families: [FurnitureFamily, string][]
  themes: Record<FurnitureTheme, { label: string; body: string; accent: string }>
  shareState: 'idle' | 'copied'
  onConfigChange: (partial: Partial<FurnitureConfig>) => void
  onFamilyChange: (family: FurnitureFamily) => void
  onShare: () => void
}

const LAYOUT_COPY = {
  single: 'One wide bay',
  split: 'Balanced compartments',
  grid: 'Stacked modular rhythm',
} as const

export function ConfiguratorPanel({
  config,
  families,
  themes,
  shareState,
  onConfigChange,
  onFamilyChange,
  onShare,
}: ConfiguratorPanelProps) {
  const layouts = validLayouts(config.family)

  return (
    <aside className="panel-card control-panel">
      <div className="panel-heading">
        <div>
          <p>Configurator</p>
          <h2>Build the concept</h2>
        </div>
        <span className="pill">{FAMILY_LABELS[config.family]}</span>
      </div>

      <div className="control-group">
        <label>Furniture family</label>
        <div className="family-tabs">
          {families.map(([family, label]) => (
            <button
              key={family}
              type="button"
              className={clsx('tab-button', family === config.family && 'is-active')}
              onClick={() => onFamilyChange(family)}
            >
              <strong>{label}</strong>
              <span>{family === 'cabinet' ? 'storage' : family === 'shelf' ? 'display' : 'workspace'}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="control-group">
        <div className="range-header">Overall dimensions (mm)</div>
        <div className="range-row">
          <DimensionCard
            label="Width"
            value={config.width}
            min={config.family === 'cabinet' ? 900 : config.family === 'shelf' ? 700 : 1000}
            max={2600}
            step={50}
            onChange={(value) => onConfigChange({ width: value })}
          />
          <DimensionCard
            label="Height"
            value={config.height}
            min={config.family === 'desk' ? 720 : config.family === 'cabinet' ? 720 : 1000}
            max={config.family === 'desk' ? 980 : 2600}
            step={config.family === 'desk' ? 10 : 50}
            onChange={(value) => onConfigChange({ height: value })}
          />
          <DimensionCard
            label="Depth"
            value={config.depth}
            min={config.family === 'shelf' ? 240 : config.family === 'desk' ? 500 : 320}
            max={config.family === 'desk' ? 900 : config.family === 'cabinet' ? 700 : 520}
            step={20}
            onChange={(value) => onConfigChange({ depth: value })}
          />
        </div>
      </div>

      <div className="control-group">
        <div className="stepper">
          <div>
            <div className="stepper-label">Module count</div>
            <span className="stepper-value">{config.modules}</span>
          </div>
          <div className="stepper-controls">
            <button
              type="button"
              aria-label="Decrease modules"
              onClick={() => onConfigChange({ modules: config.modules - 1 })}
            >
              -
            </button>
            <button
              type="button"
              aria-label="Increase modules"
              onClick={() => onConfigChange({ modules: config.modules + 1 })}
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="control-group">
        <label>Layout logic</label>
        <div className="toggle-group">
          {layouts.map((layout) => (
            <button
              key={layout}
              type="button"
              className={clsx('toggle-button', config.layout === layout && 'is-active')}
              onClick={() => onConfigChange({ layout })}
            >
              <strong>{layout}</strong>
              <span>{LAYOUT_COPY[layout]}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="control-group">
        <label>Material preset</label>
        <div className="theme-grid">
          {Object.entries(themes).map(([theme, definition]) => (
            <button
              key={theme}
              type="button"
              className={clsx('theme-button', config.theme === theme && 'is-active')}
              onClick={() => onConfigChange({ theme: theme as FurnitureTheme })}
            >
              <strong>{definition.label}</strong>
              <span>{definition.body}</span>
            </button>
          ))}
        </div>
      </div>

      {config.family !== 'shelf' && (
        <div className="control-group">
          <label>Front style</label>
          <div className="toggle-group">
            {(['open', 'doors'] as const).map((frontStyle) => (
              <button
                key={frontStyle}
                type="button"
                className={clsx('toggle-button', config.frontStyle === frontStyle && 'is-active')}
                onClick={() => onConfigChange({ frontStyle })}
              >
                <strong>{frontStyle === 'open' ? 'Open frame' : 'Door fronts'}</strong>
                <span>{frontStyle === 'open' ? 'Fast concept review' : 'Enclosed joinery language'}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="control-group">
        <label htmlFor="shelves">Shelf density</label>
        <input
          id="shelves"
          type="range"
          min={0}
          max={config.family === 'shelf' ? 6 : config.family === 'desk' ? 2 : 4}
          step={1}
          value={config.shelfCount}
          onChange={(event) => onConfigChange({ shelfCount: Number(event.target.value) })}
        />
        <span className="pill">{config.shelfCount} shelf levels</span>
      </div>

      {config.family === 'desk' && (
        <div className="control-group">
          <label>Top profile</label>
          <div className="toggle-group">
            {(['rect', 'rounded'] as const).map((deskTopStyle) => (
              <button
                key={deskTopStyle}
                type="button"
                className={clsx('toggle-button', config.deskTopStyle === deskTopStyle && 'is-active')}
                onClick={() => onConfigChange({ deskTopStyle })}
              >
                <strong>{deskTopStyle === 'rect' ? 'Rectilinear' : 'Soft radius'}</strong>
                <span>{deskTopStyle === 'rect' ? 'Workshop clean lines' : 'More domestic feel'}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="share-row">
        <button type="button" className="share-button" onClick={onShare}>
          {shareState === 'copied' ? 'Link copied' : 'Copy share link'}
        </button>
        <button type="button" className="reset-button" onClick={() => onFamilyChange(config.family)}>
          Reset family
        </button>
      </div>
    </aside>
  )
}

interface DimensionCardProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}

function DimensionCard({ label, value, min, max, step, onChange }: DimensionCardProps) {
  return (
    <div className="range-card">
      <label>
        {label}
        <output>{value}</output>
      </label>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  )
}
