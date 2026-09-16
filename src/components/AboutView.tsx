import { PROGRAMMES } from '../../1-programmes-9318b0b6.ts'
import { SECTION_ORDER } from '../data/meta'

export default function AboutView() {
  return (
    <section className="panel" aria-labelledby="about-title">
      <header className="panel__head">
        <p className="masthead__kicker">Methodology</p>
        <h2 id="about-title">About the data</h2>
      </header>
      <dl className="spec">
        <div>
          <dt>Research currency</dt>
          <dd>August 2026. This site does not refresh itself against live programme pages.</dd>
        </div>
        <div>
          <dt>Entry count</dt>
          <dd>
            {PROGRAMMES.length} programmes across sections {SECTION_ORDER.join(', ')}, imported directly from{' '}
            <code>1-programmes-9318b0b6.ts</code>.
          </dd>
        </div>
        <div>
          <dt>What the notes are</dt>
          <dd>
            Desk-research snapshots: type, eligibility, funding, equity, timing, alumni fragments, caveats, and tags.
            Fields often say UNKNOWN, N/A, or “confirm”. Caveats are part of the record.
          </dd>
        </div>
        <div>
          <dt>Limitations</dt>
          <dd>
            Windows close. Investment terms change. UKSPF-backed programmes may be time-boxed. Alumni lists are
            incomplete. Named companies and raise claims in the notes are not independently verified here. Section E
            is closed, paused, defunct, or not London.
          </dd>
        </div>
        <div>
          <dt>What this app will not do</dt>
          <dd>
            It will not scrape the web, call a hosted model, invent acceptance rates, or update “as of today”
            automatically. Verify live terms on the programme site before applying.
          </dd>
        </div>
      </dl>
    </section>
  )
}
