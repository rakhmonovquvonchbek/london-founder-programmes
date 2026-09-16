import { useMemo, useState, type FormEvent } from 'react'
import type { Programme } from '../../1-programmes-9318b0b6.ts'
import {
  ASSISTANT_SUGGESTIONS,
  answerAssistant,
  constraintLabel,
} from '../lib/assistant'
import { programmeId } from '../lib/ids'

type AssistantViewProps = {
  programmes: Programme[]
  ask: string
  onAsk: (value: string) => void
  onOpen: (id: string) => void
  onCompare: (programme: Programme) => void
}

export default function AssistantView({
  programmes,
  ask,
  onAsk,
  onOpen,
  onCompare,
}: AssistantViewProps) {
  const [draft, setDraft] = useState(ask)
  const answer = useMemo(() => answerAssistant(ask, programmes), [ask, programmes])

  function submit(event: FormEvent) {
    event.preventDefault()
    onAsk(draft)
  }

  return (
    <section className="panel assistant" aria-labelledby="assistant-title">
      <header className="panel__head">
        <p className="masthead__kicker">Local directory scan</p>
        <h2 id="assistant-title">Ask this directory</h2>
        <p className="panel__lede">{answer.disclaimer}</p>
      </header>

      <form className="assistant__form" onSubmit={submit}>
        <label htmlFor="assistant-ask">Question</label>
        <textarea
          id="assistant-ask"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          rows={3}
          placeholder="e.g. free AI programme for a student with an open deadline"
        />
        <button type="submit" className="primary-btn">
          Scan the directory
        </button>
      </form>

      <p className="panel__note">Try a prompt:</p>
      <div className="chip-row">
        {ASSISTANT_SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            className="chip"
            onClick={() => {
              setDraft(suggestion)
              onAsk(suggestion)
            }}
          >
            {suggestion}
          </button>
        ))}
      </div>

      <div className="assistant__result" aria-live="polite">
        <p className="assistant__summary">{answer.summary}</p>
        {answer.parsed.constraints.length > 0 && (
          <p className="panel__note">
            Constraints detected: {answer.parsed.constraints.map(constraintLabel).join(', ')}.
          </p>
        )}

        {answer.mode === 'none' && ask.trim() && (
          <div className="empty">
            <h3>No match in this directory</h3>
            <p>
              Nothing in the embedded notes answers that. This assistant will not invent a programme, a deadline, or
              an alumni outcome.
            </p>
          </div>
        )}

        <ul className="assistant__hits">
          {answer.hits.map((hit) => (
            <li key={hit.programme.name} className="assistant-card">
              <div>
                <p className="card__section">
                  {hit.complete ? 'Full constraint match' : `Partial · missing ${hit.missing.map(constraintLabel).join(', ') || 'none'}`}
                </p>
                <h3>{hit.programme.name}</h3>
                <p className="card__type">{hit.programme.type}</p>
                <ul className="reason-list">
                  {hit.reasons.map((reason) => (
                    <li key={reason.constraint}>
                      <span className={reason.matched ? 'ok' : 'miss'}>
                        {reason.matched ? 'Match' : 'Miss'} · {constraintLabel(reason.constraint)}
                      </span>
                      <span>{reason.evidence}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="assistant-card__actions">
                <button type="button" className="ghost-btn" onClick={() => onOpen(programmeId(hit.programme.name))}>
                  Open note
                </button>
                <button type="button" className="compare-btn" onClick={() => onCompare(hit.programme)}>
                  Compare
                </button>
                <a href={hit.programme.url} target="_blank" rel="noreferrer">
                  Source site
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
