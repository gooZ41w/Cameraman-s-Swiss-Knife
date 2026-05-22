import { describe, expect, it } from 'vitest'
import { formatShutterDisplay, formatShutterRangeDisplay } from '../../src/presentation/formatters/exposureFormat'

describe('presentation formatters', () => {
  it('formats sub-second shutters to common denominators', () => {
    expect(formatShutterDisplay(0.004)).toBe('1/250s')
    expect(formatShutterDisplay(0.002)).toBe('1/500s')
    expect(formatShutterDisplay(1 / 40)).toBe('1/40s')
    expect(formatShutterDisplay(1 / 50)).toBe('1/50s')
  })

  it('formats >=1s as seconds with one decimal', () => {
    expect(formatShutterDisplay(4)).toBe('4.0s')
  })

  it('formats tolerance ranges using same strategy', () => {
    const range = formatShutterRangeDisplay(4.096, 5, 25)
    expect(range).toMatch(/4\.\d+s/)
    expect(range).toContain('3')
  })
})
