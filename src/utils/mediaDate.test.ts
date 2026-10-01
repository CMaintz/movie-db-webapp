import { describe, expect, it } from 'vitest'
import type { Media, MovieDetails, SeriesDetails } from '../types'
import {
  formatMediaDateRange,
  formatMediaRuntime,
  formatSeasonYear,
} from './mediaDate'

/** Minimal stand-ins — these helpers only read a handful of fields. */
const movie = (over: Partial<MovieDetails> = {}): Media =>
  ({ media_type: 'movie', release_date: '2010-07-16', ...over }) as unknown as Media

const series = (over: Partial<SeriesDetails> = {}): Media =>
  ({
    media_type: 'tv',
    first_air_date: '2008-01-20',
    last_air_date: '2013-09-29',
    status: 'Ended',
    ...over,
  }) as unknown as Media

describe('formatMediaDateRange', () => {
  it('returns the release year for a movie', () => {
    expect(formatMediaDateRange(movie())).toBe(2010)
  })

  it('returns an empty string for a movie with no release date', () => {
    expect(formatMediaDateRange(movie({ release_date: undefined }))).toBe('')
  })

  it('returns only the start year for a series by default', () => {
    expect(formatMediaDateRange(series())).toBe(2008)
  })

  it('returns a full range for an ended series when explicitly requested', () => {
    expect(formatMediaDateRange(series(), true)).toBe('2008 - 2013')
  })

  it('returns a full range for a canceled series too', () => {
    expect(formatMediaDateRange(series({ status: 'Canceled' }), true)).toBe(
      '2008 - 2013',
    )
  })

  it('returns only the start year for a still-running series, even when a range is requested', () => {
    expect(
      formatMediaDateRange(series({ status: 'Returning Series' }), true),
    ).toBe(2008)
  })

  it('falls back to the start year when an ended series has no last air date', () => {
    expect(formatMediaDateRange(series({ last_air_date: undefined }), true)).toBe(
      2008,
    )
  })

  it('returns an empty string for a series with no first air date', () => {
    expect(formatMediaDateRange(series({ first_air_date: undefined }))).toBe('')
  })
})

describe('formatMediaRuntime', () => {
  it('formats a movie runtime as hours and minutes', () => {
    expect(formatMediaRuntime(movie({ runtime: 142 }))).toBe('2h 22m')
  })

  it('keeps a zero minute component', () => {
    expect(formatMediaRuntime(movie({ runtime: 120 }))).toBe('2h 0m')
  })

  it('reports sub-hour runtimes as 0h', () => {
    expect(formatMediaRuntime(movie({ runtime: 45 }))).toBe('0h 45m')
  })

  it('returns null for a series, which has no top-level runtime', () => {
    expect(formatMediaRuntime(series())).toBeNull()
  })

  it('returns null for a movie with no runtime', () => {
    expect(formatMediaRuntime(movie({ runtime: undefined }))).toBeNull()
  })

  // Documents current behaviour: runtime 0 is falsy and so is treated as absent
  // rather than formatted as "0h 0m".
  it('returns null for a zero runtime', () => {
    expect(formatMediaRuntime(movie({ runtime: 0 }))).toBeNull()
  })
})

describe('formatSeasonYear', () => {
  it('extracts the year as a string', () => {
    expect(formatSeasonYear('2011-04-17')).toBe('2011')
  })

  it('returns an empty string for an empty date', () => {
    expect(formatSeasonYear('')).toBe('')
  })
})
