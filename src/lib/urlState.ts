import type { Section } from '../data/meta'
import { SECTION_ORDER } from '../data/meta'

export type AppTab = 'directory' | 'outcomes' | 'assistant' | 'about'
export type SortKey = 'section' | 'name'
export type ViewKey = 'grid' | 'list'

export type UrlState = {
  search: string
  sections: Section[]
  tags: string[]
  hideClosed: boolean
  sort: SortKey
  view: ViewKey
  tab: AppTab
  compare: string[]
  selected: string | null
  savedOnly: boolean
  ask: string
}

export const DEFAULT_URL_STATE: UrlState = {
  search: '',
  sections: [],
  tags: [],
  hideClosed: true,
  sort: 'section',
  view: 'grid',
  tab: 'directory',
  compare: [],
  selected: null,
  savedOnly: false,
  ask: '',
}

const TABS: AppTab[] = ['directory', 'outcomes', 'assistant', 'about']
const SORTS: SortKey[] = ['section', 'name']
const VIEWS: ViewKey[] = ['grid', 'list']

function csv(value: string | null): string[] {
  if (!value) return []
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}

function isSection(value: string): value is Section {
  return (SECTION_ORDER as string[]).includes(value)
}

function isTab(value: string): value is AppTab {
  return (TABS as string[]).includes(value)
}

function isSort(value: string): value is SortKey {
  return (SORTS as string[]).includes(value)
}

function isView(value: string): value is ViewKey {
  return (VIEWS as string[]).includes(value)
}

export function decodeUrlState(search: string): UrlState {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const sections = csv(params.get('sections')).filter(isSection)
  const sortRaw = params.get('sort') ?? ''
  const viewRaw = params.get('view') ?? ''
  const tabRaw = params.get('tab') ?? ''

  return {
    search: params.get('q') ?? '',
    sections,
    tags: csv(params.get('tags')),
    hideClosed: params.get('closed') !== '1',
    sort: isSort(sortRaw) ? sortRaw : 'section',
    view: isView(viewRaw) ? viewRaw : 'grid',
    tab: isTab(tabRaw) ? tabRaw : 'directory',
    compare: csv(params.get('compare')),
    selected: params.get('p') || null,
    savedOnly: params.get('saved') === '1',
    ask: params.get('ask') ?? '',
  }
}

export function encodeUrlState(state: UrlState): string {
  const params = new URLSearchParams()
  if (state.search.trim()) params.set('q', state.search.trim())
  if (state.sections.length) params.set('sections', state.sections.join(','))
  if (state.tags.length) params.set('tags', state.tags.join(','))
  if (!state.hideClosed) params.set('closed', '1')
  if (state.sort !== 'section') params.set('sort', state.sort)
  if (state.view !== 'grid') params.set('view', state.view)
  if (state.tab !== 'directory') params.set('tab', state.tab)
  if (state.compare.length) params.set('compare', state.compare.join(','))
  if (state.selected) params.set('p', state.selected)
  if (state.savedOnly) params.set('saved', '1')
  if (state.ask.trim() && state.tab === 'assistant') params.set('ask', state.ask.trim())
  const encoded = params.toString()
  return encoded ? `?${encoded}` : ''
}

export function urlStatesEqual(a: UrlState, b: UrlState): boolean {
  return encodeUrlState(a) === encodeUrlState(b)
}

export function pathWithSearch(pathname: string, search: string): string {
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`
  return `${path}${search.replace(/^\?/, '?')}`.replace(/\?$/, '')
}
