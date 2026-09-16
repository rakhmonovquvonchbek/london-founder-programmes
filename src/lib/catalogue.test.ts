import { describe, expect, it } from 'vitest'
import { PROGRAMMES } from '../../1-programmes-9318b0b6.ts'
import { COMPARE_LIMIT, nextCompareList, programmeId } from './ids'
import { decodeUrlState, encodeUrlState } from './urlState'
import { answerAssistant, parseAssistantQuery } from './assistant'
import { buildOutcomes, classifyAlumni } from './outcomes'
import { matchesProgramme } from './query'

describe('dataset integrity', () => {
  it('keeps 100 unique programmes from the original file', () => {
    expect(PROGRAMMES).toHaveLength(100)
    const names = PROGRAMMES.map((programme) => programme.name)
    expect(new Set(names).size).toBe(100)
    expect(new Set(names.map(programmeId)).size).toBe(100)
  })
})

describe('compare limit', () => {
  it('allows four identifiers and refuses a fifth', () => {
    expect(COMPARE_LIMIT).toBe(4)
    const four = ['a', 'b', 'c', 'd']
    expect(nextCompareList(four, 'e')).toEqual(four)
    expect(nextCompareList(['a', 'b'], 'c')).toEqual(['a', 'b', 'c'])
    expect(nextCompareList(['a', 'b', 'c'], 'b')).toEqual(['a', 'c'])
  })
})

describe('url state', () => {
  it('round-trips search, filters, sort, view, tab, closed, compare', () => {
    const encoded = encodeUrlState({
      search: 'techstars',
      sections: ['C'],
      tags: ['student', 'non-dilutive'],
      hideClosed: false,
      sort: 'name',
      view: 'list',
      tab: 'outcomes',
      compare: ['techstars-london', 'ucl-hatchery', 'antler-uk-london-residency', 'seedcamp'],
      selected: 'ucl-hatchery',
      savedOnly: true,
      ask: '',
    })
    expect(encoded).toContain('q=techstars')
    expect(encoded).toContain('sections=C')
    expect(encoded).toContain('tags=student%2Cnon-dilutive')
    expect(encoded).toContain('closed=1')
    expect(encoded).toContain('sort=name')
    expect(encoded).toContain('view=list')
    expect(encoded).toContain('tab=outcomes')
    expect(encoded).toContain('compare=')
    expect(encoded).toContain('saved=1')
    const decoded = decodeUrlState(encoded)
    expect(decoded.search).toBe('techstars')
    expect(decoded.sections).toEqual(['C'])
    expect(decoded.tags).toEqual(['student', 'non-dilutive'])
    expect(decoded.hideClosed).toBe(false)
    expect(decoded.sort).toBe('name')
    expect(decoded.view).toBe('list')
    expect(decoded.tab).toBe('outcomes')
    expect(decoded.compare).toHaveLength(4)
    expect(decoded.selected).toBe('ucl-hatchery')
    expect(decoded.savedOnly).toBe(true)
  })

  it('omits default directory params', () => {
    expect(encodeUrlState(decodeUrlState(''))).toBe('')
  })
})

describe('filter/search', () => {
  it('finds Techstars by search and hides section E by default', () => {
    const hits = PROGRAMMES.filter((programme) =>
      matchesProgramme(programme, {
        search: 'techstars',
        sections: [],
        tags: [],
        hideClosed: true,
      }),
    )
    expect(hits.map((programme) => programme.name)).toEqual(['Techstars London'])
    const live = PROGRAMMES.filter((programme) =>
      matchesProgramme(programme, { search: '', sections: [], tags: [], hideClosed: true }),
    )
    expect(live).toHaveLength(91)
    expect(live.every((programme) => programme.section !== 'E')).toBe(true)
  })

  it('ANDs tags', () => {
    const hits = PROGRAMMES.filter((programme) =>
      matchesProgramme(programme, {
        search: '',
        sections: ['C'],
        tags: ['student', 'non-dilutive'],
        hideClosed: true,
      }),
    )
    expect(hits.length).toBeGreaterThan(0)
    expect(hits.every((programme) => programme.section === 'C')).toBe(true)
    expect(hits.every((programme) => programme.tags.includes('student'))).toBe(true)
    expect(hits.every((programme) => programme.tags.includes('non-dilutive'))).toBe(true)
  })
})

describe('outcomes evidence', () => {
  it('does not invent alumni counts beyond source notes', () => {
    const outcomes = buildOutcomes(PROGRAMMES)
    expect(outcomes.total).toBe(100)
    expect(
      outcomes.kinds.named +
        outcomes.kinds.aggregateClaim +
        outcomes.kinds.unknown +
        outcomes.kinds.notApplicable +
        outcomes.kinds.historical +
        outcomes.kinds.networkOnly,
    ).toBe(100)
    expect(outcomes.named.length).toBe(outcomes.kinds.named)
    for (const row of outcomes.named) {
      const source = PROGRAMMES.find((programme) => programme.name === row.programme)
      expect(source?.alumni).toBe(row.excerpt)
      for (const name of row.names) {
        expect(row.excerpt).toContain(name.split('(')[0].trim().slice(0, 4))
      }
    }
    expect(classifyAlumni('UNKNOWN')).toBe('unknown')
    expect(classifyAlumni('N/A')).toBe('notApplicable')
    expect(classifyAlumni('Cleo, Tractable, AccuRx')).toBe('named')
  })
})

describe('local assistant', () => {
  it('handles a multi-constraint student/AI/free/open question using only directory fields', () => {
    const answer = answerAssistant(
      'free AI programme for a student with an open deadline',
      PROGRAMMES,
    )
    expect(parseAssistantQuery(answer.parsed.raw).constraints).toEqual(
      expect.arrayContaining(['free', 'ai', 'student', 'openWindow']),
    )
    expect(answer.disclaimer.toLowerCase()).toContain('based on this directory')
    expect(answer.disclaimer.toLowerCase()).toContain('no language model')
    for (const hit of answer.hits) {
      expect(PROGRAMMES.some((programme) => programme.name === hit.programme.name)).toBe(true)
      expect(hit.reasons.every((reason) => typeof reason.evidence === 'string' && reason.evidence.length > 0)).toBe(
        true,
      )
    }
    const fabricated = JSON.stringify(answer)
    expect(fabricated).not.toMatch(/\$10bn|unicorn factory|invented cohort/i)
  })

  it('returns a clear no-match for nonsense', () => {
    const answer = answerAssistant('quantum banana visa accelerator on mars 2999', PROGRAMMES)
    expect(answer.mode).toBe('none')
    expect(answer.hits).toHaveLength(0)
    expect(answer.summary.toLowerCase()).toContain('no directory row')
  })

  it('does not invent fundraising when asked about alumni', () => {
    const answer = answerAssistant('named alumni in a London accelerator', PROGRAMMES)
    const blob = JSON.stringify(answer)
    expect(blob).not.toMatch(/total funds raised: £/i)
    for (const hit of answer.hits) {
      const source = PROGRAMMES.find((programme) => programme.name === hit.programme.name)
      expect(source).toBeTruthy()
    }
  })
})
