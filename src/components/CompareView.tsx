import type { Programme } from '../../1-programmes-9318b0b6.ts'
import { DETAIL_FIELDS, SECTION_META } from '../data/meta'
import { COMPARE_LIMIT } from '../lib/ids'
import FocusLock from './FocusLock'

type CompareViewProps = {
  programmes: Programme[]
  onClose: () => void
  onRemove: (name: string) => void
}

export default function CompareView({ programmes, onClose, onRemove }: CompareViewProps) {
  return (
    <div
      className="compare-root"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-title"
      onClick={onClose}
    >
      <FocusLock active>
        <div className="compare-sheet" onClick={(event) => event.stopPropagation()}>
          <header className="compare-sheet__head">
            <div>
              <p className="masthead__kicker">Side by side · up to {COMPARE_LIMIT}</p>
              <h2 id="compare-title">Compare programmes</h2>
            </div>
            <button type="button" className="ghost-btn" onClick={onClose}>
              Close
            </button>
          </header>

          {programmes.length === 0 ? (
            <p className="empty-inline">Add programmes from the directory to compare them here.</p>
          ) : (
            <div className="compare-table-wrap" tabIndex={0} aria-label="Comparison table">
              <p className="scroll-hint">
                Scroll sideways to see all {programmes.length} columns. This is the only place horizontal scroll is used.
              </p>
              <table className="compare-table">
                <thead>
                  <tr>
                    <th scope="col">Field</th>
                    {programmes.map((programme) => (
                      <th key={programme.name} scope="col">
                        <div className="compare-table__name">
                          <span>{programme.name}</span>
                          <button type="button" className="text-btn" onClick={() => onRemove(programme.name)}>
                            Remove
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Section</th>
                    {programmes.map((programme) => (
                      <td key={programme.name}>
                        {programme.section} · {SECTION_META[programme.section].title}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row">Tags</th>
                    {programmes.map((programme) => (
                      <td key={programme.name}>{programme.tags.join(', ') || '—'}</td>
                    ))}
                  </tr>
                  {DETAIL_FIELDS.map((field) => (
                    <tr key={field.key}>
                      <th scope="row">{field.label}</th>
                      {programmes.map((programme) => (
                        <td key={programme.name}>{String(programme[field.key])}</td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <th scope="row">Website</th>
                    {programmes.map((programme) => (
                      <td key={programme.name}>
                        <a href={programme.url} target="_blank" rel="noreferrer">
                          Visit site
                        </a>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </FocusLock>
    </div>
  )
}
