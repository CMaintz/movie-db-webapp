import { describe, expect, it } from 'vitest'
import type { MediaDetails } from '../../types'
import { getCreators, getDirector, type CrewMember } from './credits'

const crew = (...jobs: Array<[string, string]>): CrewMember[] =>
  jobs.map(([name, job], i) => ({
    id: i + 1,
    name,
    job,
    profile_path: '',
    department: 'Production',
  }))

const media = (
  mediaType: 'movie' | 'tv',
  crewList: CrewMember[] = [],
): MediaDetails =>
  ({ media_type: mediaType, credits: { cast: [], crew: crewList } }) as unknown as MediaDetails

describe('getDirector', () => {
  it('finds the director of a film', () => {
    const m = media('movie', crew(['Denis Villeneuve', 'Director'], ['Someone', 'Editor']))
    expect(getDirector(m)?.name).toBe('Denis Villeneuve')
  })

  it('returns null for a film with no director credited', () => {
    expect(getDirector(media('movie', crew(['Someone', 'Editor'])))).toBeNull()
  })

  it('returns null for a series, which has no single director', () => {
    const m = media('tv', crew(['Someone', 'Director']))
    expect(getDirector(m)).toBeNull()
  })

  it('returns null when the crew list is missing entirely', () => {
    expect(getDirector({ media_type: 'movie' } as unknown as MediaDetails)).toBeNull()
  })
})

describe('getCreators', () => {
  it('accepts all three job titles TMDB spreads the credit across', () => {
    const m = media(
      'tv',
      crew(['A', 'Creator'], ['B', 'Executive Producer'], ['C', 'Showrunner']),
    )
    expect(getCreators(m).map((p) => p.name)).toEqual(['A', 'B', 'C'])
  })

  it('excludes unrelated crew jobs', () => {
    const m = media('tv', crew(['A', 'Creator'], ['B', 'Costume Design'], ['C', 'Gaffer']))
    expect(getCreators(m).map((p) => p.name)).toEqual(['A'])
  })

  it('preserves TMDB ordering rather than sorting by job', () => {
    const m = media('tv', crew(['B', 'Executive Producer'], ['A', 'Creator']))
    expect(getCreators(m).map((p) => p.name)).toEqual(['B', 'A'])
  })

  it('returns an empty array for a film', () => {
    expect(getCreators(media('movie', crew(['A', 'Creator'])))).toEqual([])
  })

  it('returns an empty array when the crew list is missing entirely', () => {
    expect(getCreators({ media_type: 'tv' } as unknown as MediaDetails)).toEqual([])
  })
})
