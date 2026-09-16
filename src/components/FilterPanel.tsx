import { SECTION_META, SECTION_ORDER, TAG_GROUPS, type Section } from '../data/meta'

type FilterPanelProps = {
  open: boolean
  sections: Section[]
  tags: string[]
  hideClosed: boolean
  onToggleSection: (section: Section) => void
  onToggleTag: (tag: string) => void
  onHideClosed: (value: boolean) => void
  onClear: () => void
  onClose: () => void
}

export default function FilterPanel({
  open,
  sections,
  tags,
  hideClosed,
  onToggleSection,
  onToggleTag,
  onHideClosed,
  onClear,
  onClose,
}: FilterPanelProps) {
  return (
    <>
      {open && <button type="button" className="scrim scrim--filters" onClick={onClose} aria-label="Close filters" />}
      <aside className={`filters${open ? ' is-open' : ''}`} aria-label="Filters">
        <div className="filters__head">
          <h2>Filters</h2>
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

        <label className="toggle">
          <input
            type="checkbox"
            checked={hideClosed}
            onChange={(event) => onHideClosed(event.target.checked)}
          />
          Hide closed and out-of-scope
        </label>
      </aside>
    </>
  )
}
