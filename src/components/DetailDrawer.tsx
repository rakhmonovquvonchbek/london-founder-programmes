import { useEffect, useRef } from 'react'
import type { Programme } from '../../1-programmes-9318b0b6.ts'
import { DETAIL_FIELDS, SECTION_META } from '../data/meta'

type DetailDrawerProps = {
  programme: Programme | null
  compared: boolean
  compareDisabled: boolean
  onClose: () => void
  onToggleCompare: () => void
}

export default function DetailDrawer({
  programme,
  compared,
  compareDisabled,
  onClose,
  onToggleCompare,
}: DetailDrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (programme) closeRef.current?.focus()
  }, [programme])

  if (!programme) return null

  return (
    <div className="drawer-root">
      <button type="button" className="scrim" onClick={onClose} aria-label="Close programme details" />
      <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
        <div className="drawer__toolbar">
          <button ref={closeRef} type="button" className="text-btn" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className={`compare-btn${compared ? ' is-on' : ''}`}
            disabled={compareDisabled}
            onClick={onToggleCompare}
          >
            {compared ? 'In compare' : 'Add to compare'}
          </button>
        </div>

        <p className="drawer__section">
          Section {programme.section} · {SECTION_META[programme.section].title}
        </p>
        <h2 id="drawer-title">{programme.name}</h2>
        <p className="drawer__type">{programme.type}</p>

        {programme.tags.length > 0 && (
          <ul className="tags tags--lg">
            {programme.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        )}

        <dl className="spec">
          {DETAIL_FIELDS.map((field) => (
            <div key={field.key}>
              <dt>{field.label}</dt>
              <dd>{String(programme[field.key])}</dd>
            </div>
          ))}
        </dl>

        <a className="primary-btn drawer__link" href={programme.url} target="_blank" rel="noreferrer">
          Open programme site
        </a>
      </aside>
    </div>
  )
}
