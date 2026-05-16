import { describe, expect, it } from 'vitest'
import {
  computeApertureFromEvIso,
  computeEvIso,
  computeEv100,
  computeExposurePlan,
  computeExposureTolerance,
  computeIsoFromEvIso,
  computeNdMultiplier,
  computeShutterFromEvIso,
  formatExposureSeconds,
  resolveNdStops,
} from '../../src/domain/exposure'

describe('exposure', () => {
  it('computes EV100 and EVISO consistently', () => {
    const ev100 = computeEv100(8, 0.004)
    const evIso = computeEvIso(8, 0.004, 100)

    expect(ev100).toBeCloseTo(14, 1)
    expect(evIso).toBeCloseTo(14, 1)
  })

  it('solves shutter, aperture, and ISO from EVISO', () => {
    const evIso = computeEvIso(8, 0.004, 100)

    expect(computeShutterFromEvIso(evIso, 8, 100)).toBeCloseTo(0.004, 3)
    expect(computeApertureFromEvIso(evIso, 0.004, 100)).toBeCloseTo(8, 1)
    expect(computeIsoFromEvIso(evIso, 8, 0.004)).toBeCloseTo(100, 0)
  })

  it('resolves ND1000 as 10 stops', () => {
    expect(resolveNdStops('ND1000')).toBe(10)
    expect(computeNdMultiplier(10)).toBe(1024)
  })

  it('falls back to custom ND factor', () => {
    expect(resolveNdStops('custom', 32000)).toBeCloseTo(14.9658, 3)
  })

  it('computes exposure tolerances for the documented example', () => {
    const [tightLower, tightUpper] = computeExposureTolerance(4, 5)
    const [wideLower, wideUpper] = computeExposureTolerance(4, 25)

    expect(formatExposureSeconds(4)).toBe('4.0s')
    expect(tightLower).toBeCloseTo(3.8, 1)
    expect(tightUpper).toBeCloseTo(4.2, 1)
    expect(wideLower).toBeCloseTo(3.0, 1)
    expect(wideUpper).toBeCloseTo(5.0, 1)
  })

  it('computes the sample ND1000 long exposure plan', () => {
    const plan = computeExposurePlan({
      aperture: 8,
      shutterSeconds: 0.004,
      iso: 100,
      compensationEv: 0,
      ndPreset: 'ND1000',
      solveFor: 'shutter',
    })

    expect(plan.compensatedShutterSeconds).toBeCloseTo(0.004, 3)
    expect(plan.ndAdjustedShutterSeconds).toBeCloseTo(4.096, 3)
    expect(plan.isBulbMode).toBe(true)
  })
})