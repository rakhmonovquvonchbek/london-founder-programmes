import type { AppTab } from '../lib/urlState'

const TABS: { id: AppTab; label: string }[] = [
  { id: 'directory', label: 'Directory' },
  { id: 'outcomes', label: 'Outcomes' },
  { id: 'assistant', label: 'Assistant' },
  { id: 'about', label: 'About the data' },
]

type AppNavProps = {
  tab: AppTab
  onTab: (tab: AppTab) => void
}

export default function AppNav({ tab, onTab }: AppNavProps) {
  return (
    <nav className="app-nav" aria-label="Primary">
      {TABS.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`app-nav__btn${tab === item.id ? ' is-on' : ''}`}
          aria-current={tab === item.id ? 'page' : undefined}
          onClick={() => onTab(item.id)}
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}
