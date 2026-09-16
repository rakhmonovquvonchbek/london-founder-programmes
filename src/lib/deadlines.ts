export type TimingKind = 'rolling' | 'dated' | 'closed' | 'unknown' | 'dead'

const MONTHS: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
}

const DATE_RE =
  /\b(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(20\d{2})\b/gi
const MONTH_YEAR_RE = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(20\d{2})\b/gi

export function classifyTiming(timing: string): TimingKind {
  const text = timing.trim()
  const low = text.toLowerCase()

  if (
    /\bdead\b/.test(low) ||
    /\bdefunct\b/.test(low) ||
    /\bpaused\b/.test(low) ||
    /\bnot active\b/.test(low) ||
    /\bclosed to new\b/.test(low) ||
    /\brevamping\b/.test(low) ||
    /^n\/a$/.test(low)
  ) {
    return 'dead'
  }

  if (
    /\bcompleted\b/.test(low) ||
    /\bnot recruiting\b/.test(low) ||
    /\bapps closed\b/.test(low) ||
    /\bcurrent cohort closed\b/.test(low) ||
    /\bmarked closed\b/.test(low)
  ) {
    return 'closed'
  }

  if (/\balways open\b/.test(low) || /\brolling\b/.test(low) || /\bongoing\b/.test(low)) {
    return 'rolling'
  }

  const hasDayDate = [...text.matchAll(DATE_RE)].length > 0
  const hasMonthYear = [...text.matchAll(MONTH_YEAR_RE)].length > 0

  if (/\bunknown\b/.test(low) && !hasDayDate && !hasMonthYear) {
    return 'unknown'
  }

  if (hasDayDate || hasMonthYear) return 'dated'
  if (/\bunknown\b|\bconfirm\b|\bwatch\b|\bmonitor\b/.test(low)) return 'unknown'
  return 'dated'
}

export function extractDates(timing: string): Date[] {
  const dates: Date[] = []
  const seen = new Set<string>()

  for (const match of timing.matchAll(DATE_RE)) {
    const day = Number(match[1])
    const month = MONTHS[match[2].toLowerCase().slice(0, 3)]
    const year = Number(match[3])
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    if (!seen.has(iso)) {
      seen.add(iso)
      dates.push(new Date(Date.UTC(year, month, day)))
    }
  }

  return dates
}

export function timingLabel(kind: TimingKind): string {
  switch (kind) {
    case 'rolling':
      return 'Rolling / always-on (as written)'
    case 'dated':
      return 'Dated window (as written)'
    case 'closed':
      return 'Closed or completed (as written)'
    case 'dead':
      return 'Dead / paused / out of scope (as written)'
    default:
      return 'Timing unknown or unconfirmed'
  }
}

export function looksOpenForApply(timing: string): boolean {
  const kind = classifyTiming(timing)
  if (kind === 'rolling') return true
  if (kind === 'dead' || kind === 'closed') return false
  if (kind === 'unknown') return false
  const low = timing.toLowerCase()
  if (/\blisted open\b|\bopen at research\b|\balways open\b/.test(low)) return true
  if (/\bapps closed\b|\bnot recruiting\b|\bcompleted\b/.test(low) && !/\brolling\b/.test(low)) {
    return false
  }
  return kind === 'dated'
}
