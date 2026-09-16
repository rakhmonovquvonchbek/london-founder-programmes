import type { Programme } from '../../1-programmes-9318b0b6.ts'

export type AlumniKind =
  | 'named'
  | 'aggregateClaim'
  | 'unknown'
  | 'notApplicable'
  | 'historical'
  | 'networkOnly'

export type NamedAlumnus = {
  programme: string
  excerpt: string
  names: string[]
}

export type QuotedClaim = {
  programme: string
  field: 'alumni' | 'cohort'
  excerpt: string
}

const SKIP_NAME = /unknown|n\/a|historical|claim|claimed|network|ecosystem|community|portfolio|alumni|winners|pathway|houses hatchery|via amplify|national sul|gla-stated|aggregate|confirm|regional/i

export function classifyAlumni(alumni: string): AlumniKind {
  const text = alumni.trim()
  const low = text.toLowerCase()

  if (low === 'n/a') return 'notApplicable'
  if (low === 'regional') return 'networkOnly'
  if (/^historical\b/i.test(text) || low === 'historical gap') return 'historical'

  const names = extractNamedAlumni(text)
  const hasUnknown = /\bunknown\b/i.test(text)
  const hasClaim =
    /\bclaim\b|\bclaimed\b|\braised\b|\bsupported since\b|\b\d[\d,]*\+?\s+(businesses|companies|startups|women)/i.test(
      text,
    )

  if (names.length > 0) return 'named'
  if (hasUnknown) return 'unknown'
  if (hasClaim) return 'aggregateClaim'
  if (/network|ecosystem|community|portfolio on|alumni network|winners pages|counters/i.test(text)) {
    return 'networkOnly'
  }
  return 'networkOnly'
}

export function extractNamedAlumni(alumni: string): string[] {
  const parts = alumni
    .split(/[,;]/)
    .map((part) => part.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

  return parts.filter((part) => {
    if (SKIP_NAME.test(part)) return false
    if (/^https?:/i.test(part)) return false
    if (/^\d/.test(part) && /raised|companies|businesses|founders/.test(part.toLowerCase())) return false
    const letters = part.replace(/[^a-zA-Z]/g, '')
    return letters.length >= 2
  })
}

export function buildOutcomes(programmes: Programme[]) {
  const kinds: Record<AlumniKind, number> = {
    named: 0,
    aggregateClaim: 0,
    unknown: 0,
    notApplicable: 0,
    historical: 0,
    networkOnly: 0,
  }

  const named: NamedAlumnus[] = []
  const alumniClaims: QuotedClaim[] = []
  const cohortRates: QuotedClaim[] = []

  for (const programme of programmes) {
    const kind = classifyAlumni(programme.alumni)
    kinds[kind] += 1
    if (kind === 'named') {
      named.push({
        programme: programme.name,
        excerpt: programme.alumni,
        names: extractNamedAlumni(programme.alumni),
      })
    }
    if (kind === 'aggregateClaim' || /\bclaim\b|\bclaimed\b/i.test(programme.alumni)) {
      alumniClaims.push({
        programme: programme.name,
        field: 'alumni',
        excerpt: programme.alumni,
      })
    }
    if (/%/.test(programme.cohort) || /\bacceptance\b/i.test(programme.cohort)) {
      cohortRates.push({
        programme: programme.name,
        field: 'cohort',
        excerpt: programme.cohort,
      })
    }
  }

  const total = programmes.length
  const evidenceBearing = kinds.named + kinds.aggregateClaim + kinds.networkOnly + kinds.historical

  return {
    total,
    kinds,
    named,
    alumniClaims,
    cohortRates,
    evidenceBearing,
    unknownOrBlank: kinds.unknown + kinds.notApplicable,
    sparsityNote:
      'Alumni notes in this directory are sparse and uneven. Many entries only say UNKNOWN, N/A, or point at a network. Named companies and fundraising figures below are copied from the source notes — they are not verified outcomes, not a ranking, and not a complete alumni census.',
  }
}
