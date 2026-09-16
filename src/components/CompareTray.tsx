import type { Programme } from '../../1-programmes-9318b0b6.ts'
import { COMPARE_LIMIT } from '../lib/ids'

type CompareTrayProps = {
  programmes: Programme[]
  onOpen: () => void
  onRemove: (name: string) => void
  onClear: () => void
}

export default function CompareTray({ programmes, onOpen, onRemove, onClear }: CompareTrayProps) {
  if (programmes.length === 0) return null

  return (
    <div className="tray" role="region" aria-label="Compare tray">
      <div className="tray__list">
        {programmes.map((programme) => (
          <span key={programme.name} className="tray__chip">
            {programme.name}
            <button
              type="button"
              className="tray__remove"
              onClick={() => onRemove(programme.name)}
              aria-label={`Remove ${programme.name}`}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="tray__actions">
        <p className="tray__count">
          {programmes.length}/{COMPARE_LIMIT}
        </p>
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
