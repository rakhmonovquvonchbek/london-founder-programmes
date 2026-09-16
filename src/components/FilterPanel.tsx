import { SECTION_META, SECTION_ORDER, TAG_GROUPS, type Section } from '../data/meta'
import type { SortKey, ViewKey } from '../lib/urlState'

type FilterPanelProps = {
  open: boolean
  sections: Section[]
  tags: string[]
  hideClosed: boolean
  savedOnly: boolean
  sort: SortKey
  view: ViewKey
  onToggleSection: (section: Section) => void
  onToggleTag: (tag: string) => void
  onHideClosed: (value: boolean) => void
  onSavedOnly: (value: boolean) => void
  onSort: (value: SortKey) => void
  onView: (value: ViewKey) => void
  onClear: () => void
  onClose: () => void
}

export default function FilterPanel({
  open,
  sections,
  tags,
  hideClosed,
  savedOnly,
  sort,
  view,
  onToggleSection,
  onToggleTag,
  onHideClosed,
  onSavedOnly,
  onSort,
  onView,
  onClear,
  onClose,
}: FilterPanelProps) {
  return (
    <>
      {open && (
        <button type="button" className="scrim scrim--filters" onClick={onClose} aria-label="Close filters" />
      )}
      <aside
        className={`filters${open ? ' is-open' : ''}`}
        aria-label="Filters"
        {...(open ? { role: 'dialog', 'aria-modal': true, 'aria-labelledby': 'filters-title' } : {})}
      >
        <div className="filters__head">
          <h2 id="filters-title">Filters</h2>
          <button type="button" className="text-btn" onClick={onClear}>
            Reset
          </button>
          <button type="button" className="icon-btn filters__close" onClick={onClose} aria-label="Close filters">
            ×
          </button>
        </div>

        <fieldset>
          <legend>Section</legend>
          <div className="chip-row">
            {SECTION_ORDER.map((section) => {
              const pressed = sections.includes(section)
              return (
                <button
                  key={section}
                  type="button"
                  className={`chip${pressed ? ' is-on' : ''}`}
                  aria-pressed={pressed}
                  onClick={() => onToggleSection(section)}
                >
                  <span className="chip__letter">{section}</span>
                  {SECTION_META[section].title}
                </button>
              )
            })}
          </div>
        </fieldset>

        {TAG_GROUPS.map((group) => (
          <fieldset key={group.id}>
            <legend>{group.label}</legend>
            <div className="chip-row">
              {group.tags.map((tag) => {
                const pressed = tags.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    className={`chip${pressed ? ' is-on' : ''}`}
                    aria-pressed={pressed}
                    onClick={() => onToggleTag(tag)}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          </fieldset>
        ))}

        <fieldset>
          <legend>Sort and view</legend>
          <div className="chip-row">
            <button
              type="button"
              className={`chip${sort === 'section' ? ' is-on' : ''}`}
              aria-pressed={sort === 'section'}
              onClick={() => onSort('section')}
            >
              By section
            </button>
            <button
              type="button"
              className={`chip${sort === 'name' ? ' is-on' : ''}`}
              aria-pressed={sort === 'name'}
              onClick={() => onSort('name')}
            >
              A–Z
            </button>
            <button
              type="button"
              className={`chip${view === 'grid' ? ' is-on' : ''}`}
              aria-pressed={view === 'grid'}
              onClick={() => onView('grid')}
            >
              Grid
            </button>
            <button
              type="button"
              className={`chip${view === 'list' ? ' is-on' : ''}`}
              aria-pressed={view === 'list'}
              onClick={() => onView('list')}
            >
              List
            </button>
          </div>
        </fieldset>

        <label className="toggle">
          <input
            type="checkbox"
            checked={hideClosed}
            onChange={(event) => onHideClosed(event.target.checked)}
          />
          Hide closed and out-of-scope
        </label>
        <label className="toggle">
          <input
            type="checkbox"
            checked={savedOnly}
            onChange={(event) => onSavedOnly(event.target.checked)}
          />
          Saved only
        </label>
      </aside>
    </>
  )
}
