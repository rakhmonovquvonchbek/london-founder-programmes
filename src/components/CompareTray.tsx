import type { Programme } from '../data/programmes'

type CompareTrayProps = {
  programmes: Programme[]
  onOpen: () => void
  onRemove: (name: string) => void
  onClear: () => void
}

export default function CompareTray({ programmes, onOpen, onRemove, onClear }: CompareTrayProps) {
  if (programmes.length === 0) return null

  return (
    <div className="tray">
      <div className="tray__list">
        {programmes.map((programme) => (
          <span key={programme.name} className="tray__chip">
            {programme.name}
            <button type="button" onClick={() => onRemove(programme.name)} aria-label={`Remove ${programme.name}`}>
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="tray__actions">
        <button type="button" className="text-btn" onClick={onClear}>
          Clear
        </button>
        <button type="button" className="primary-btn" onClick={onOpen}>
          Compare {programmes.length}
        </button>
      </div>
    </div>
  )
}
