import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { PROGRAMMES, type Programme } from '../1-programmes-9318b0b6.ts'
import { SECTION_META, SECTION_ORDER, type Section } from './data/meta'
import AboutView from './components/AboutView'
import AppNav from './components/AppNav'
import AssistantView from './components/AssistantView'
import CompareTray from './components/CompareTray'
import CompareView from './components/CompareView'
import DetailDrawer from './components/DetailDrawer'
import FilterPanel from './components/FilterPanel'
import OutcomesView from './components/OutcomesView'
import ProgrammeCard from './components/ProgrammeCard'
import { filterAndSort, readFavourites, toggleFavourite, writeFavourites } from './lib/catalogue'
import { COMPARE_LIMIT, findProgramme, nextCompareList, programmeId } from './lib/ids'
import { matchesProgramme, toggleValue } from './lib/query'
import {
  DEFAULT_URL_STATE,
  decodeUrlState,
  encodeUrlState,
  type AppTab,
  type SortKey,
  type UrlState,
  type ViewKey,
} from './lib/urlState'

const liveCount = PROGRAMMES.filter((programme) => programme.section !== 'E').length
const closedCount = PROGRAMMES.length - liveCount

function readWindowState(): UrlState {
  return typeof window === 'undefined' ? DEFAULT_URL_STATE : decodeUrlState(window.location.search)
}

export default function App() {
  const [state, setState] = useState<UrlState>(readWindowState)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [compareOpen, setCompareOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [favourites, setFavourites] = useState<string[]>(() =>
    typeof window === 'undefined' ? [] : readFavourites(),
  )
  const searchRef = useRef<HTMLInputElement>(null)
  const historyMode = useRef<'push' | 'replace'>('replace')
  const applyingPop = useRef(false)

  const {
    search,
    sections,
    tags,
    hideClosed,
    sort,
    view,
    tab,
    compare,
    selected,
    savedOnly,
    ask,
  } = state

  function patch(partial: Partial<UrlState>, mode: 'push' | 'replace' = 'push') {
    historyMode.current = mode
    setState((current) => ({ ...current, ...partial }))
  }

  useEffect(() => {
    function onPop() {
      applyingPop.current = true
      setState(decodeUrlState(window.location.search))
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    const searchString = encodeUrlState(state)
    const next = `${window.location.pathname}${searchString}`
    const current = `${window.location.pathname}${window.location.search}`
    if (applyingPop.current) {
      applyingPop.current = false
      return
    }
    if (next === current) return
    if (historyMode.current === 'replace') history.replaceState(state, '', next)
    else history.pushState(state, '', next)
  }, [state])

  useEffect(() => {
    writeFavourites(favourites)
  }, [favourites])

  const filtered = useMemo(() => {
    const rows = filterAndSort(PROGRAMMES, { search, sections, tags, hideClosed }, sort)
    if (!savedOnly) return rows
    return rows.filter((programme) => favourites.includes(programmeId(programme.name)))
  }, [favourites, hideClosed, savedOnly, search, sections, sort, tags])

  const selectedProgramme = useMemo(
    () => (selected ? findProgramme(PROGRAMMES, selected) ?? null : null),
    [selected],
  )

  const compareList = useMemo(
    () =>
      compare
        .map((id) => findProgramme(PROGRAMMES, id))
        .filter((programme): programme is Programme => Boolean(programme)),
    [compare],
  )

  const activeFilterCount =
    sections.length +
    tags.length +
    (hideClosed ? 0 : 1) +
    (search.trim() ? 1 : 0) +
    (savedOnly ? 1 : 0)

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === '/' && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) {
        event.preventDefault()
        searchRef.current?.focus()
        patch({ tab: 'directory' })
        return
      }
      if (event.key !== 'Escape') return
      if (compareOpen) {
        setCompareOpen(false)
        return
      }
      if (selected) {
        patch({ selected: null }, 'replace')
        return
      }
      if (filtersOpen) setFiltersOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [compareOpen, filtersOpen, selected])

  useEffect(() => {
    document.body.style.overflow = compareOpen || selected || filtersOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [compareOpen, filtersOpen, selected])

  function toggleSection(section: Section) {
    patch({ sections: toggleValue(sections, section) })
  }

  function toggleTag(tag: string) {
    patch({ tags: toggleValue(tags, tag) })
  }

  function toggleCompare(programme: Programme) {
    patch({ compare: nextCompareList(compare, programmeId(programme.name)) })
  }

  function clearFilters() {
    patch({
      search: '',
      sections: [],
      tags: [],
      hideClosed: true,
      savedOnly: false,
      sort: 'section',
      view: 'grid',
    })
  }

  function onSearchSubmit(event: FormEvent) {
    event.preventDefault()
    patch({ tab: 'directory' }, 'replace')
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  const showingLabel = `${filtered.length} programme${filtered.length === 1 ? '' : 's'}`

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

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
            <dd data-testid="showing-count">{tab === 'directory' ? filtered.length : PROGRAMMES.length}</dd>
          </div>
        </dl>
      </header>

      <div className="toolbar">
        <AppNav tab={tab} onTab={(next: AppTab) => patch({ tab: next })} />
        <button type="button" className="ghost-btn" onClick={() => void copyLink()}>
          {copied ? 'Link copied' : 'Copy link'}
        </button>
      </div>

      {tab === 'directory' && (
        <form className="search-bar" onSubmit={onSearchSubmit} role="search">
          <label className="sr-only" htmlFor="programme-search">
            Search programmes
          </label>
          <input
            id="programme-search"
            ref={searchRef}
            value={search}
            onChange={(event) => patch({ search: event.target.value }, 'replace')}
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
      )}

      {tab === 'directory' ? (
        <div className="layout">
          <FilterPanel
            open={filtersOpen}
            sections={sections}
            tags={tags}
            hideClosed={hideClosed}
            savedOnly={savedOnly}
            sort={sort}
            view={view}
            onToggleSection={toggleSection}
            onToggleTag={toggleTag}
            onHideClosed={(value) => patch({ hideClosed: value })}
            onSavedOnly={(value) => patch({ savedOnly: value })}
            onSort={(value: SortKey) => patch({ sort: value })}
            onView={(value: ViewKey) => patch({ view: value })}
            onClear={clearFilters}
            onClose={() => setFiltersOpen(false)}
          />

          <main id="main" className="results">
            <div className="results__meta">
              <p>
                {showingLabel}
                {sections.length > 0 && (
                  <> in {sections.map((section) => SECTION_META[section].title).join(', ')}</>
                )}
              </p>
              {(sections.length > 0 || tags.length > 0 || search.trim() || !hideClosed || savedOnly) && (
                <button type="button" className="text-btn" onClick={clearFilters}>
                  Clear filters
                </button>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="empty">
                <h2>Nothing matches that cut.</h2>
                <p>Try a broader search, drop a tag, include closed programmes, or clear saved-only.</p>
                <button type="button" className="primary-btn" onClick={clearFilters}>
                  Reset directory
                </button>
              </div>
            ) : (
              <ul className={`card-grid${view === 'list' ? ' card-grid--list' : ''}`}>
                {filtered.map((programme) => {
                  const id = programmeId(programme.name)
                  return (
                    <li key={id}>
                      <ProgrammeCard
                        programme={programme}
                        view={view}
                        compared={compare.includes(id)}
                        compareDisabled={!compare.includes(id) && compare.length >= COMPARE_LIMIT}
                        saved={favourites.includes(id)}
                        onOpen={() => patch({ selected: id })}
                        onToggleCompare={() => toggleCompare(programme)}
                        onToggleSaved={() => setFavourites((current) => toggleFavourite(current, id))}
                      />
                    </li>
                  )
                })}
              </ul>
            )}
          </main>
        </div>
      ) : (
        <main id="main">
          {tab === 'outcomes' && <OutcomesView />}
          {tab === 'assistant' && (
            <AssistantView
              programmes={PROGRAMMES.filter((programme) =>
                matchesProgramme(programme, { search: '', sections: [], tags: [], hideClosed }),
              )}
              ask={ask}
              onAsk={(value) => patch({ ask: value, tab: 'assistant' })}
              onOpen={(id) => patch({ selected: id, tab: 'directory' })}
              onCompare={toggleCompare}
            />
          )}
          {tab === 'about' && <AboutView />}
        </main>
      )}

      <DetailDrawer
        programme={selectedProgramme}
        compared={selectedProgramme ? compare.includes(programmeId(selectedProgramme.name)) : false}
        compareDisabled={
          selectedProgramme !== null &&
          !compare.includes(programmeId(selectedProgramme.name)) &&
          compare.length >= COMPARE_LIMIT
        }
        saved={selectedProgramme ? favourites.includes(programmeId(selectedProgramme.name)) : false}
        onClose={() => patch({ selected: null }, 'replace')}
        onToggleCompare={() => {
          if (selectedProgramme) toggleCompare(selectedProgramme)
        }}
        onToggleSaved={() => {
          if (selectedProgramme) {
            const id = programmeId(selectedProgramme.name)
            setFavourites((current) => toggleFavourite(current, id))
          }
        }}
      />

      <CompareTray
        programmes={compareList}
        onOpen={() => setCompareOpen(true)}
        onRemove={(name) => patch({ compare: compare.filter((id) => id !== programmeId(name)) })}
        onClear={() => patch({ compare: [] })}
      />

      {compareOpen && (
        <CompareView
          programmes={compareList}
          onClose={() => setCompareOpen(false)}
          onRemove={(name) => patch({ compare: compare.filter((id) => id !== programmeId(name)) })}
        />
      )}

      <footer className="site-foot">
        <p>
          {PROGRAMMES.length} entries across {SECTION_ORDER.length} sections. Research currency August 2026 — not
          auto-updated. Verify live terms before applying.
        </p>
      </footer>
    </div>
  )
}
