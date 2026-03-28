import type { FurnitureFamily, GeneratedPart } from '../lib/furniture'

interface PartsPanelProps {
  family: FurnitureFamily
  parts: GeneratedPart[]
}

export function PartsPanel({ family, parts }: PartsPanelProps) {
  const totalItems = parts.reduce((sum, part) => sum + part.quantity, 0)

  return (
    <section className="parts-card">
      <div className="parts-header">
        <div>
          <p>Structured output</p>
          <h2>Concept parts list</h2>
        </div>
        <span className="pill">{totalItems} components</span>
      </div>

      <table className="parts-table">
        <thead>
          <tr>
            <th>Part</th>
            <th>Dimensions</th>
            <th>Qty</th>
          </tr>
        </thead>
        <tbody>
          {parts.map((part) => (
            <tr key={`${family}-${part.name}`}>
              <td>{part.name}</td>
              <td>{part.dimensions}</td>
              <td>{part.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="parts-summary">
        <span className="pill">{family}</span>
        <span className="pill">{parts.length} unique part types</span>
        <span className="pill">deterministic output</span>
      </div>
    </section>
  )
}
