/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest'
import { isTV } from './platform'

declare global {
  interface Window {
    webOS?: unknown
  }
}

afterEach(() => {
  delete window.webOS
})

describe('isTV', () => {
  it('is false in a plain browser environment', () => {
    expect(isTV()).toBe(false)
  })

  it('is true once the webOS bridge is present', () => {
    window.webOS = { deviceInfo: () => undefined }
    expect(isTV()).toBe(true)
  })

  it('treats an explicitly undefined bridge as absent', () => {
    window.webOS = undefined
    expect(isTV()).toBe(false)
  })
})
