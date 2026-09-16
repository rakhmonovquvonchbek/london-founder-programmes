import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { PROGRAMMES, type Programme } from './data/programmes'
import {
  COMPARE_LIMIT,
  SECTION_META,
  SECTION_ORDER,
  type Section,
} from './data/meta'
import { matchesProgramme, programmeKey, toggleValue } from './lib/query'
import CompareTray from './components/CompareTray'
import CompareView from './components/CompareView'
import DetailDrawer from './components/DetailDrawer'
import FilterPanel from './components/FilterPanel'
import ProgrammeCard from './components/ProgrammeCard'

const liveCount = PROGRAMMES.filter((programme) => programme.section !== 'E').length
const closedCount = PROGRAMMES.length - liveCount

export default function App() {
  const [search, setSearch] = useState('')
  const [sections, setSections] = useState<Section[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [hideClosed, setHideClosed] = useState(true)
  const [selectedName, setSelectedName] = useState<string | null>(null)
  const [compareNames, setCompareNames] = useState<string[]>([])
  const [compareOpen, setCompareOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    const query = { search, sections, tags, hideClosed }
    return PROGRAMMES.filter((programme) => matchesProgramme(programme, query)).sort(
      (a, b) => a.section.localeCompare(b.section) || a.name.localeCompare(b.name),
    )
  }, [hideClosed, search, sections, tags])

  const selected = useMemo(
    () => PROGRAMMES.find((programme) => programme.name === selectedName) ?? null,
    [selectedName],
  )

  const compareList = useMemo(
    () =>
      compareNames
        .map((name) => PROGRAMMES.find((programme) => programme.name === name))
        .filter((programme): programme is Programme => Boolean(programme)),
    [compareNames],
  )

  const activeFilterCount =
    sections.length + tags.length + (hideClosed ? 0 : 1) + (search.trim() ? 1 : 0)

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === '/' && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) {
        event.preventDefault()
        searchRef.current?.focus()
        return
      }
      if (event.key !== 'Escape') return
      if (compareOpen) {
        setCompareOpen(false)
        return
      }
      if (selectedName) {
        setSelectedName(null)
        return
      }
      if (filtersOpen) setFiltersOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [compareOpen, filtersOpen, selectedName])

  useEffect(() => {
    document.body.style.overflow = compareOpen || selectedName || filtersOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [compareOpen, filtersOpen, selectedName])

  function toggleSection(section: Section) {
    setSections((current) => toggleValue(current, section))
  }

  function toggleTag(tag: string) {
    setTags((current) => toggleValue(current, tag))
  }

  function toggleCompare(programme: Programme) {
    const key = programmeKey(programme)
    setCompareNames((current) => {
      if (current.includes(key)) return current.filter((name) => name !== key)
      if (current.length >= COMPARE_LIMIT) return current
      return [...current, key]
    })
  }

  function clearFilters() {
    setSearch('')
    setSections([])
    setTags([])
    setHideClosed(true)
  }

  function onSearchSubmit(event: FormEvent) {
    event.preventDefault()
  }

  return (
    <div className="app">
      <header className="masthead">
        <div className="masthead__brand">
          <span className="masthead__mark" aria-hidden="true">
            LF
          </span>
          <div>
            <p className="masthead__kicker">Research desk · August 2026</p>
            <h1>London Founder Programmes</h1>
            <p className="masthead__lede">
              A searchable directory of accelerators, university founder schemes and public pathways.
            </p>
          </div>
        </div>
        <dl className="masthead__stats">
          <div>
            <dt>Live</dt>
            <dd>{liveCount}</dd>
          </div>
          <div>
            <dt>Closed</dt>
            <dd>{closedCount}</dd>
          </div>
          <div>
            <dt>Showing</dt>
            <dd>{filtered.length}</dd>
          </div>
        </dl>
      </header>

      <form className="search-bar" onSubmit={onSearchSubmit} role="search">
        <label className="sr-only" htmlFor="programme-search">
          Search programmes
        </label>
        <input
          id="programme-search"
          ref={searchRef}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, funding, alumni, focus…"
          autoComplete="off"
        />
        <p className="search-bar__hint">
          Press <kbd>/</kbd> to search
        </p>
        <button
          type="button"
          className="ghost-btn filters-toggle"
          onClick={() => setFiltersOpen(true)}
        >
          Filters{activeFilterCount > 0 ? ` · ${activeFilterCount}` : ''}
        </button>
      </form>

      <div className="layout">
        <FilterPanel
          open={filtersOpen}
          sections={sections}
          tags={tags}
          hideClosed={hideClosed}
          onToggleSection={toggleSection}
          onToggleTag={toggleTag}
          onHideClosed={setHideClosed}
          onClear={clearFilters}
          onClose={() => setFiltersOpen(false)}
        />

        <main className="results">
          <div className="results__meta">
            <p>
              {filtered.length} programme{filtered.length === 1 ? '' : 's'}
              {sections.length > 0 && (
                <>
                  {' '}
                  in {sections.map((section) => SECTION_META[section].title).join(', ')}
                </>
              )}
            </p>
            {(sections.length > 0 || tags.length > 0 || search.trim() || !hideClosed) && (
              <button type="button" className="text-btn" onClick={clearFilters}>
                Clear filters
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="empty">
              <h2>Nothing matches that cut.</h2>
              <p>Try a broader search, drop a tag, or include closed programmes.</p>
              <button type="button" className="primary-btn" onClick={clearFilters}>
                Reset directory
              </button>
            </div>
          ) : (
            <ul className="card-grid">
              {filtered.map((programme) => {
                const key = programmeKey(programme)
                return (
                  <li key={key}>
                    <ProgrammeCard
                      programme={programme}
                      compared={compareNames.includes(key)}
                      compareDisabled={
                        !compareNames.includes(key) && compareNames.length >= COMPARE_LIMIT
                      }
                      onOpen={() => setSelectedName(key)}
                      onToggleCompare={() => toggleCompare(programme)}
                    />
                  </li>
                )
              })}
            </ul>
          )}
        </main>
      </div>

      <DetailDrawer
        programme={selected}
        compared={selected ? compareNames.includes(programmeKey(selected)) : false}
        compareDisabled={
          selected !== null &&
          !compareNames.includes(programmeKey(selected)) &&
          compareNames.length >= COMPARE_LIMIT
        }
        onClose={() => setSelectedName(null)}
        onToggleCompare={() => {
          if (selected) toggleCompare(selected)
        }}
      />

      <CompareTray
        programmes={compareList}
        onOpen={() => setCompareOpen(true)}
        onRemove={(name) => setCompareNames((current) => current.filter((item) => item !== name))}
        onClear={() => setCompareNames([])}
      />

      {compareOpen && (
        <CompareView
          programmes={compareList}
          onClose={() => setCompareOpen(false)}
          onRemove={(name) => setCompareNames((current) => current.filter((item) => item !== name))}
        />
      )}

      <footer className="site-foot">
        <p>
          {PROGRAMMES.length} entries across {SECTION_ORDER.length} sections. Research currency August
          2026 — verify live terms before applying.
        </p>
      </footer>
    </div>
  )
}
