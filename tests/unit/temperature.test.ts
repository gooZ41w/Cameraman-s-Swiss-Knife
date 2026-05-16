import { describe, expect, it } from 'vitest'
import { kelvinToRgb } from '../../src/domain/temperature'

describe('kelvinToRgb', () => {
  it('returns a stable RGB tuple for 6500K', () => {
    expect(kelvinToRgb(6500)).toEqual([255, 254, 250])
  })
})
