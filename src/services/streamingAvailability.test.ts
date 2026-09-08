/**
 * @vitest-environment jsdom
 * config.ts reads window.__APP_CONFIG__ at module evaluation time, so importing
 * anything that depends on it needs a DOM.
 */
import { describe, expect, it } from 'vitest'
import {
  findDeepLinkForProvider,
  getServiceIdForProvider,
  getTmdbProviderForService,
  type DeepLinkResult,
} from './streamingAvailability'

const deepLink = (over: Partial<DeepLinkResult> = {}): DeepLinkResult => ({
  serviceId: 'netflix',
  serviceName: 'Netflix',
  link: 'https://netflix.com/title/1',
  type: 'subscription',
  ...over,
})

describe('getTmdbProviderForService', () => {
  it('maps a known service to its TMDB provider id', () => {
    expect(getTmdbProviderForService('netflix')).toBe(8)
    expect(getTmdbProviderForService('disney')).toBe(337)
  })

  it('returns null for an unknown service', () => {
    expect(getTmdbProviderForService('nebula')).toBeNull()
  })
})

describe('getServiceIdForProvider', () => {
  it('maps a TMDB provider id back to its service', () => {
    expect(getServiceIdForProvider(8)).toBe('netflix')
    expect(getServiceIdForProvider(337)).toBe('disney')
  })

  it('returns null for an unmapped provider id', () => {
    expect(getServiceIdForProvider(999999)).toBeNull()
  })

  it('round-trips with getTmdbProviderForService', () => {
    for (const service of ['netflix', 'prime', 'disney', 'apple', 'max', 'hulu']) {
      const providerId = getTmdbProviderForService(service)
      expect(providerId).not.toBeNull()
      expect(getServiceIdForProvider(providerId as number)).toBe(service)
    }
  })
})

describe('findDeepLinkForProvider', () => {
  it('finds the link whose service matches the TMDB provider', () => {
    const links = [deepLink({ serviceId: 'hulu' }), deepLink()]
    expect(findDeepLinkForProvider(links, 8)?.serviceId).toBe('netflix')
  })

  it('returns null when the provider id maps to no known service', () => {
    expect(findDeepLinkForProvider([deepLink()], 999999)).toBeNull()
  })

  it('returns null when the mapped service is absent from the results', () => {
    // 337 is Disney+, which is a known service but not present here.
    expect(findDeepLinkForProvider([deepLink()], 337)).toBeNull()
  })

  it('returns null for an empty result set', () => {
    expect(findDeepLinkForProvider([], 8)).toBeNull()
  })
})
