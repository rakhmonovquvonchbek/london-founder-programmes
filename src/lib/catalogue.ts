import type { Programme } from '../../1-programmes-9318b0b6.ts'
import type { QueryState } from './query'
import { matchesProgramme } from './query'
import type { SortKey } from './urlState'

export function sortProgrammes(programmes: Programme[], sort: SortKey): Programme[] {
  return [...programmes].sort((a, b) => {
    if (sort === 'name') return a.name.localeCompare(b.name)
    return a.section.localeCompare(b.section) || a.name.localeCompare(b.name)
  })
}

export function filterAndSort(
  programmes: Programme[],
  query: QueryState,
  sort: SortKey,
): Programme[] {
  return sortProgrammes(
    programmes.filter((programme) => matchesProgramme(programme, query)),
    sort,
  )
}

const FAV_KEY = 'lfp:favourites:v1'

export function readFavourites(): string[] {
  try {
    const raw = localStorage.getItem(FAV_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : []
  } catch {
    return []
  }
}

export function writeFavourites(ids: string[]): void {
  localStorage.setItem(FAV_KEY, JSON.stringify(ids))
}

export function toggleFavourite(ids: string[], id: string): string[] {
  return ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id]
}
