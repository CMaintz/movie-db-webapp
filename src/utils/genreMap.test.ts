import { describe, expect, it } from 'vitest'
import {
  GENRES,
  getGenreMapping,
  getGenreName,
  getMovieGenreId,
  getTVGenreId,
} from './genreMap'

describe('getMovieGenreId', () => {
  it('returns the TMDB movie id for a known genre', () => {
    expect(getMovieGenreId('Action')).toBe(28)
    expect(getMovieGenreId('Horror')).toBe(27)
  })

  it('returns undefined for an unknown genre', () => {
    expect(getMovieGenreId('Musical')).toBeUndefined()
  })

  it('is case sensitive', () => {
    expect(getMovieGenreId('action')).toBeUndefined()
  })
})

describe('getTVGenreId', () => {
  it('returns the TV id, which differs from the movie id for some genres', () => {
    expect(getTVGenreId('Action')).toBe(10759)
    expect(getMovieGenreId('Action')).not.toBe(getTVGenreId('Action'))
  })

  it('returns the same id as movies where TMDB shares one', () => {
    expect(getTVGenreId('Comedy')).toBe(35)
    expect(getMovieGenreId('Comedy')).toBe(35)
  })

  it('returns undefined for an unknown genre', () => {
    expect(getTVGenreId('Musical')).toBeUndefined()
  })
})

describe('getGenreMapping', () => {
  it('returns the whole mapping object', () => {
    expect(getGenreMapping('Comedy')).toEqual({
      name: 'Comedy',
      movieId: 35,
      tvId: 35,
    })
  })

  it('returns undefined for an unknown genre', () => {
    expect(getGenreMapping('Musical')).toBeUndefined()
  })
})

describe('getGenreName', () => {
  it('resolves a name when both ids match the same genre', () => {
    expect(getGenreName(28, 10759)).toBe('Action')
  })

  it('requires BOTH ids to match — a valid movie id with the wrong tv id resolves to nothing', () => {
    // 28 is Action's movie id, 35 is Comedy's tv id. Neither genre matches both.
    expect(getGenreName(28, 35)).toBeUndefined()
  })

  it('returns undefined when neither id is known', () => {
    expect(getGenreName(-1, -1)).toBeUndefined()
  })
})

describe('GENRES table', () => {
  it('round-trips every entry through the id lookups', () => {
    for (const genre of GENRES) {
      expect(getMovieGenreId(genre.name)).toBe(genre.movieId)
      expect(getTVGenreId(genre.name)).toBe(genre.tvId)
      expect(getGenreName(genre.movieId, genre.tvId)).toBe(genre.name)
    }
  })

  it('has no duplicate genre names, so lookups are unambiguous', () => {
    const names = GENRES.map((g) => g.name)
    expect(new Set(names).size).toBe(names.length)
  })
})
