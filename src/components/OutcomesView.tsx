import { PROGRAMMES } from '../../1-programmes-9318b0b6.ts'
import { buildOutcomes } from '../lib/outcomes'

const outcomes = buildOutcomes(PROGRAMMES)

export default function OutcomesView() {
  const { kinds, total, named, alumniClaims, cohortRates, sparsityNote, unknownOrBlank } = outcomes

  return (
    <section className="panel" aria-labelledby="outcomes-title">
      <header className="panel__head">
        <p className="masthead__kicker">Evidence, not a league table</p>
        <h2 id="outcomes-title">Alumni outcomes in the notes</h2>
        <p className="panel__lede">{sparsityNote}</p>
      </header>

      <ul className="coverage">
        <li>
          <strong>{named.length}</strong>
          <span>rows name at least one alumnus</span>
        </li>
        <li>
          <strong>{kinds.aggregateClaim}</strong>
          <span>rows only repeat aggregate claims</span>
        </li>
        <li>
          <strong>{kinds.unknown}</strong>
          <span>rows say UNKNOWN</span>
        </li>
        <li>
          <strong>{kinds.notApplicable}</strong>
          <span>rows say N/A</span>
        </li>
        <li>
          <strong>{kinds.historical}</strong>
          <span>historical / closed notes</span>
        </li>
        <li>
          <strong>{kinds.networkOnly}</strong>
          <span>network or ecosystem pointers</span>
        </li>
      </ul>
      <p className="panel__note">
        Coverage: {total - unknownOrBlank} of {total} entries have some alumni text beyond UNKNOWN/N/A.
        This app does not add companies, raise amounts, or acceptance rates that are not already written in the
        dataset.
      </p>

      <h3>Named alumni (as written)</h3>
      <div className="table-scroll" tabIndex={0} aria-label="Named alumni table. Scroll sideways on small screens.">
        <p className="scroll-hint">Scroll sideways to see the excerpt column.</p>
        <table className="data-table">
          <thead>
            <tr>
              <th scope="col">Programme</th>
              <th scope="col">Names copied from the alumni field</th>
              <th scope="col">Alumni field (verbatim)</th>
            </tr>
          </thead>
          <tbody>
            {named.map((row) => (
              <tr key={row.programme}>
                <th scope="row">{row.programme}</th>
                <td>{row.names.join(', ')}</td>
                <td>{row.excerpt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>Source-stated aggregate claims</h3>
      <p className="panel__note">
        These figures appear in the alumni notes. They are claims in the source, not calculations by this app.
      </p>
      <ul className="claim-list">
        {alumniClaims.map((row) => (
          <li key={`${row.programme}-${row.excerpt}`}>
            <strong>{row.programme}</strong>
            <span>{row.excerpt}</span>
          </li>
        ))}
      </ul>

      <h3>Acceptance / cohort rates already written down</h3>
      <p className="panel__note">
        Only rows whose cohort field already contains a percent or the word “acceptance”. Unknown rates stay unknown.
      </p>
      <ul className="claim-list">
        {cohortRates.map((row) => (
          <li key={row.programme}>
            <strong>{row.programme}</strong>
            <span>{row.excerpt}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
