import type { Programme } from '../../1-programmes-9318b0b6.ts'

export type Section = Programme['section']

export const SECTION_META: Record<
  Section,
  { title: string; short: string }
> = {
  A: {
    title: 'Accelerators & venture',
    short: 'Equity programmes, studios and talent investors',
  },
  B: {
    title: 'Corporate & equity-free hubs',
    short: 'Bank labs, cloud credits and memberships',
  },
  C: {
    title: 'University founder schemes',
    short: 'Incubators, TTOs and student pathways',
  },
  D: {
    title: 'Public & specialist pathways',
    short: 'GLA, NHS, social and civic support',
  },
  E: {
    title: 'Closed or out of scope',
    short: 'Paused, defunct, or not London',
  },
}

export const SECTION_ORDER: Section[] = ['A', 'B', 'C', 'D', 'E']

export const TAG_GROUPS = [
  {
    id: 'stage',
    label: 'Stage',
    tags: ['pre-idea', 'mvp', 'scaleup'],
  },
  {
    id: 'funding',
    label: 'Funding',
    tags: ['equity', 'non-dilutive'],
  },
  {
    id: 'who',
    label: 'Who',
    tags: ['student', 'alumni', 'youth'],
  },
  {
    id: 'focus',
    label: 'Focus',
    tags: ['fintech', 'climate', 'social', 'research spinout'],
  },
] as const

export const DETAIL_FIELDS: { key: keyof Programme; label: string }[] = [
  { key: 'type', label: 'Type' },
  { key: 'forWho', label: 'Who it is for' },
  { key: 'ageElig', label: 'Age / eligibility' },
  { key: 'requirements', label: 'Requirements' },
  { key: 'funding', label: 'Funding' },
  { key: 'equity', label: 'Equity' },
  { key: 'duration', label: 'Duration' },
  { key: 'timing', label: 'Timing' },
  { key: 'focus', label: 'Focus' },
  { key: 'cohort', label: 'Cohort' },
  { key: 'howIn', label: 'How in' },
  { key: 'contact', label: 'Contact' },
  { key: 'alumni', label: 'Alumni' },
  { key: 'caveats', label: 'Caveats' },
]

export { COMPARE_LIMIT } from '../lib/ids'
