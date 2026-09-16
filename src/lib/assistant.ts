import type { Programme } from '../../1-programmes-9318b0b6.ts'
import { looksOpenForApply } from './deadlines'

export type ConstraintId =
  | 'free'
  | 'ai'
  | 'student'
  | 'openWindow'
  | 'climate'
  | 'fintech'
  | 'social'
  | 'equity'
  | 'university'
  | 'youth'
  | 'spinout'

export type ParsedQuery = {
  raw: string
  constraints: ConstraintId[]
  tokens: string[]
}

export type MatchReason = {
  constraint: ConstraintId
  matched: boolean
  evidence: string
}

export type AssistantHit = {
  programme: Programme
  score: number
  matched: number
  missing: ConstraintId[]
  reasons: MatchReason[]
  complete: boolean
}

export type AssistantAnswer = {
  disclaimer: string
  parsed: ParsedQuery
  hits: AssistantHit[]
  mode: 'complete' | 'partial' | 'none'
  summary: string
}

const SUGGESTIONS = [
  'Free AI programme for a student with an open deadline',
  'Non-dilutive climate programme that is still rolling',
  'University incubator with 0% equity for alumni',
  'Fintech accelerator that takes equity',
  'Named alumni in a London accelerator',
]

export const ASSISTANT_SUGGESTIONS = SUGGESTIONS

const STOP = new Set([
  'the',
  'and',
  'for',
  'with',
  'that',
  'this',
  'from',
  'into',
  'onto',
  'are',
  'was',
  'has',
  'have',
  'not',
  'but',
  'any',
  'our',
  'you',
  'your',
])

const CONSTRAINT_LABEL: Record<ConstraintId, string> = {
  free: 'free / non-dilutive',
  ai: 'AI',
  student: 'student',
  openWindow: 'open or rolling window',
  climate: 'climate',
  fintech: 'fintech',
  social: 'social / impact',
  equity: 'takes equity',
  university: 'university scheme',
  youth: 'youth',
  spinout: 'research spinout',
}

export function constraintLabel(id: ConstraintId): string {
  return CONSTRAINT_LABEL[id]
}

function haystack(programme: Programme): string {
  return [
    programme.name,
    programme.type,
    programme.forWho,
    programme.ageElig,
    programme.requirements,
    programme.funding,
    programme.equity,
    programme.focus,
    programme.timing,
    programme.alumni,
    programme.tags.join(' '),
    programme.section,
  ]
    .join('\n')
    .toLowerCase()
}

export function isNonDilutive(programme: Programme): boolean {
  if (programme.tags.includes('non-dilutive')) return true
  const text = `${programme.equity} ${programme.funding}`.toLowerCase()
  if (programme.tags.includes('equity') && !/\b0%/.test(text)) return false
  return /\b0%\b/.test(text) || /equity-free/.test(text) || /no equity/.test(text)
}

export function mentionsAi(programme: Programme): boolean {
  return /\bai\b|genai|artificial intelligence/.test(haystack(programme))
}

export function isStudentFacing(programme: Programme): boolean {
  if (programme.tags.includes('student')) return true
  return /\bstudent/.test(`${programme.forWho} ${programme.ageElig} ${programme.type}`.toLowerCase())
}

function fieldEvidence(programme: Programme, predicate: (value: string) => boolean): string {
  const fields: [string, string][] = [
    ['equity', programme.equity],
    ['funding', programme.funding],
    ['timing', programme.timing],
    ['focus', programme.focus],
    ['forWho', programme.forWho],
    ['type', programme.type],
    ['tags', programme.tags.join(', ')],
    ['ageElig', programme.ageElig],
    ['alumni', programme.alumni],
  ]
  const hit = fields.find(([, value]) => predicate(value.toLowerCase()))
  if (!hit) return programme.name
  return `${hit[0]}: ${hit[1]}`
}

export function parseAssistantQuery(raw: string): ParsedQuery {
  const text = raw.toLowerCase()
  const constraints: ConstraintId[] = []

  if (/\bfree\b|equity-free|non-dilutive|\b0%\b|no equity/.test(text)) constraints.push('free')
  if (/\bai\b|genai|artificial intelligence/.test(text)) constraints.push('ai')
  if (/\bstudent|\bundergrad|\bphd\b|university student/.test(text)) constraints.push('student')
  if (/\bopen deadline|\brolling\b|always open|\bopen window|\bdeadline/.test(text)) {
    constraints.push('openWindow')
  }
  if (/\bclimate|\bgreen\b|\bnet.?zero/.test(text)) constraints.push('climate')
  if (/\bfintech|\bfinancial/.test(text)) constraints.push('fintech')
  if (/\bsocial\b|\bimpact\b|\bnonprofit/.test(text)) constraints.push('social')
  if (/\btakes equity|\bfor equity|\bequity programme/.test(text) && !constraints.includes('free')) {
    constraints.push('equity')
  }
  if (/\buniversity|\bincubator on campus|\bhatchery|\bcollege/.test(text)) constraints.push('university')
  if (/\byouth|\byoung people/.test(text)) constraints.push('youth')
  if (/\bspinout|\bspin-out|\bresearch/.test(text)) constraints.push('spinout')

  const tokens = text
    .split(/[^a-z0-9%]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 2 && !STOP.has(token))

  return { raw, constraints, tokens }
}

function reasonFor(
  programme: Programme,
  constraint: ConstraintId,
): MatchReason {
  switch (constraint) {
    case 'free':
      return {
        constraint,
        matched: isNonDilutive(programme),
        evidence: fieldEvidence(
          programme,
          (value) => value.includes('0%') || value.includes('non-dilutive') || value.includes('equity-free'),
        ),
      }
    case 'ai':
      return {
        constraint,
        matched: mentionsAi(programme),
        evidence: fieldEvidence(programme, (value) => /\bai\b|genai|artificial intelligence/.test(value)),
      }
    case 'student':
      return {
        constraint,
        matched: isStudentFacing(programme),
        evidence: fieldEvidence(programme, (value) => value.includes('student')),
      }
    case 'openWindow':
      return {
        constraint,
        matched: looksOpenForApply(programme.timing),
        evidence: `timing: ${programme.timing}`,
      }
    case 'climate':
      return {
        constraint,
        matched: programme.tags.includes('climate') || /climate/.test(haystack(programme)),
        evidence: fieldEvidence(programme, (value) => value.includes('climate')),
      }
    case 'fintech':
      return {
        constraint,
        matched: programme.tags.includes('fintech') || /fintech/.test(haystack(programme)),
        evidence: fieldEvidence(programme, (value) => value.includes('fintech')),
      }
    case 'social':
      return {
        constraint,
        matched: programme.tags.includes('social') || /social|impact/.test(haystack(programme)),
        evidence: fieldEvidence(programme, (value) => /social|impact/.test(value)),
      }
    case 'equity':
      return {
        constraint,
        matched: programme.tags.includes('equity') || /for \d+%|\d+% common|\d+% \+/.test(programme.equity.toLowerCase()),
        evidence: `equity: ${programme.equity}`,
      }
    case 'university':
      return {
        constraint,
        matched: programme.section === 'C' || /university|ucl|imperial|king's|lse/.test(haystack(programme)),
        evidence: `section ${programme.section}; type: ${programme.type}`,
      }
    case 'youth':
      return {
        constraint,
        matched: programme.tags.includes('youth') || /youth/.test(haystack(programme)),
        evidence: fieldEvidence(programme, (value) => value.includes('youth')),
      }
    case 'spinout':
      return {
        constraint,
        matched: programme.tags.includes('research spinout') || /spinout/.test(haystack(programme)),
        evidence: fieldEvidence(programme, (value) => /spinout/.test(value)),
      }
  }
}

function tokenScore(programme: Programme, tokens: string[]): number {
  const text = haystack(programme)
  return tokens.reduce((sum, token) => sum + (text.includes(token) ? 1 : 0), 0)
}

export function answerAssistant(
  raw: string,
  programmes: Programme[],
): AssistantAnswer {
  const parsed = parseAssistantQuery(raw)
  const disclaimer =
    'Based on this directory only. Answers are a deterministic scan of the embedded programme notes (research currency August 2026). No live web search, no language model, and no invented alumni, fundraising, or acceptance figures.'

  if (!raw.trim()) {
    return {
      disclaimer,
      parsed,
      hits: [],
      mode: 'none',
      summary: 'Ask a question about programmes in this directory.',
    }
  }

  const scored = programmes.map((programme) => {
    const reasons = parsed.constraints.map((constraint) => reasonFor(programme, constraint))
    const matched = reasons.filter((reason) => reason.matched).length
    const missing = reasons.filter((reason) => !reason.matched).map((reason) => reason.constraint)
    const extra = tokenScore(programme, parsed.tokens)
    const allTokens =
      parsed.tokens.length > 0 && extra === parsed.tokens.length
    const complete =
      parsed.constraints.length > 0 ? missing.length === 0 : allTokens
    const score = matched * 10 + extra + (programme.section === 'E' ? -20 : 0)
    return { programme, score, matched, missing, reasons, complete }
  })

  const completeHits = scored
    .filter((hit) => hit.complete && hit.score > 0)
    .sort((a, b) => b.score - a.score || a.programme.name.localeCompare(b.programme.name))

  if (completeHits.length > 0) {
    const hits = completeHits.slice(0, 8)
    return {
      disclaimer,
      parsed,
      hits,
      mode: 'complete',
      summary: `${hits.length} director${hits.length === 1 ? 'y match' : 'y matches'} for the stated constraints. Why-lines quote fields already in the dataset.`,
    }
  }

  if (parsed.constraints.length > 0) {
    const partial = scored
      .filter((hit) => hit.matched > 0)
      .sort((a, b) => b.matched - a.matched || b.score - a.score || a.programme.name.localeCompare(b.programme.name))
      .slice(0, 6)

    if (partial.length > 0) {
      return {
        disclaimer,
        parsed,
        hits: partial,
        mode: 'partial',
        summary: `No programme matches every constraint (${parsed.constraints.map(constraintLabel).join(', ')}). Showing closest directory rows and the constraints they miss.`,
      }
    }
  }

  const tokenHits = scored
    .filter((hit) => {
      if (parsed.tokens.length === 0) return false
      const extra = tokenScore(hit.programme, parsed.tokens)
      return extra >= 2 && extra / parsed.tokens.length >= 0.75
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  if (tokenHits.length > 0) {
    return {
      disclaimer,
      parsed,
      hits: tokenHits,
      mode: 'partial',
      summary: 'No structured constraints matched fully. These rows only share words with your question — still directory text, not recommendations.',
    }
  }

  return {
    disclaimer,
    parsed,
    hits: [],
    mode: 'none',
    summary:
      'No directory row matches that question. Try a suggestion below, or search the directory for a programme name. This assistant cannot invent programmes or outcomes.',
  }
}
