import type { Programme } from '../../1-programmes-9318b0b6.ts'
import { SECTION_META } from '../data/meta'
import { classifyTiming, timingLabel } from '../lib/deadlines'
import { COMPARE_LIMIT } from '../lib/ids'

type ProgrammeCardProps = {
  programme: Programme
  compared: boolean
  compareDisabled: boolean
  saved: boolean
  view: 'grid' | 'list'
  onOpen: () => void
  onToggleCompare: () => void
  onToggleSaved: () => void
}

export default function ProgrammeCard({
  programme,
  compared,
  compareDisabled,
  saved,
  view,
  onOpen,
  onToggleCompare,
  onToggleSaved,
}: ProgrammeCardProps) {
  const timing = classifyTiming(programme.timing)

  return (
    <article className={`card${view === 'list' ? ' card--list' : ''}`} data-testid="programme-card">
      <button type="button" className="card__hit" onClick={onOpen}>
        <span className="card__section">
          {programme.section} · {SECTION_META[programme.section].title}
        </span>
        <h3>{programme.name}</h3>
        <p className="card__type">{programme.type}</p>
        {view === 'grid' && <p className="card__focus">{programme.focus}</p>}
        <p className="card__funding">{programme.funding}</p>
        <p className={`deadline deadline--${timing}`}>{timingLabel(timing)}</p>
      </button>
      <div className="card__foot">
        <ul className="tags">
          {programme.tags.slice(0, 4).map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        <div className="card__actions">
          <button
            type="button"
            className={`icon-chip${saved ? ' is-on' : ''}`}
            aria-pressed={saved}
            aria-label={saved ? `Remove ${programme.name} from saved` : `Save ${programme.name}`}
            onClick={onToggleSaved}
          >
            {saved ? 'Saved' : 'Save'}
          </button>
          <button
            type="button"
            className={`compare-btn${compared ? ' is-on' : ''}`}
            disabled={compareDisabled}
            title={compareDisabled ? `Compare up to ${COMPARE_LIMIT}` : 'Add to compare'}
            onClick={onToggleCompare}
          >
            {compared ? 'In compare' : 'Compare'}
          </button>
        </div>
      </div>
    </article>
  )
}
