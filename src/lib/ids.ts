import type { Programme } from '../../1-programmes-9318b0b6.ts'

export function programmeId(name: string): string {
  return name
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function findProgramme(
  programmes: Programme[],
  idOrName: string,
): Programme | undefined {
  return programmes.find(
    (programme) => programme.name === idOrName || programmeId(programme.name) === idOrName,
  )
}

export const COMPARE_LIMIT = 4

export function nextCompareList(current: string[], candidate: string): string[] {
  if (current.includes(candidate)) return current.filter((item) => item !== candidate)
  if (current.length >= COMPARE_LIMIT) return current
  return [...current, candidate]
}
