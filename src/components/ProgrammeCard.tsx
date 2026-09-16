import type { Programme } from '../../1-programmes-9318b0b6.ts'
import { SECTION_META } from '../data/meta'

type ProgrammeCardProps = {
  programme: Programme
  compared: boolean
  compareDisabled: boolean
  onOpen: () => void
  onToggleCompare: () => void
}

export default function ProgrammeCard({
  programme,
  compared,
  compareDisabled,
  onOpen,
  onToggleCompare,
}: ProgrammeCardProps) {
  return (
    <article className="card">
      <button type="button" className="card__hit" onClick={onOpen}>
        <span className="card__section">
          {programme.section} · {SECTION_META[programme.section].title}
        </span>
        <h3>{programme.name}</h3>
        <p className="card__type">{programme.type}</p>
        <p className="card__focus">{programme.focus}</p>
        <p className="card__funding">{programme.funding}</p>
      </button>
      <div className="card__foot">
        <ul className="tags">
          {programme.tags.slice(0, 4).map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        <button
          type="button"
          className={`compare-btn${compared ? ' is-on' : ''}`}
          disabled={compareDisabled}
          onClick={onToggleCompare}
        >
          {compared ? 'In compare' : 'Compare'}
        </button>
      </div>
    </article>
  )
}
