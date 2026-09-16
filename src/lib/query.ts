import type { Programme } from '../../1-programmes-9318b0b6.ts'
import type { Section } from '../data/meta'

export type QueryState = {
  search: string
  sections: Section[]
  tags: string[]
  hideClosed: boolean
}

const SEARCH_FIELDS: (keyof Programme)[] = [
  'name',
  'type',
  'forWho',
  'ageElig',
  'requirements',
  'funding',
  'cohort',
  'focus',
  'duration',
  'alumni',
  'howIn',
  'contact',
  'equity',
  'timing',
  'caveats',
  'url',
]

export function programmeKey(programme: Programme): string {
  return programme.name
}

export function matchesProgramme(programme: Programme, query: QueryState): boolean {
  if (
    query.hideClosed &&
    programme.section === 'E' &&
    !query.sections.includes('E')
  ) {
    return false
  }

  if (query.sections.length > 0 && !query.sections.includes(programme.section)) {
    return false
  }

  if (query.tags.length > 0 && !query.tags.every((tag) => programme.tags.includes(tag))) {
    return false
  }

  const search = query.search.trim().toLowerCase()
  if (!search) return true

  const haystack = [
    ...SEARCH_FIELDS.map((field) => String(programme[field])),
    programme.tags.join(' '),
    programme.section,
  ]
    .join('\n')
    .toLowerCase()

  return search.split(/\s+/).every((token) => haystack.includes(token))
}

export function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}
