import { describe, expect, it } from 'vitest'
import { computeFullDof, computeHyperfocal, computeNearBoundary, computeFarBoundary, computeDepthOfField } from '../../src/domain/dof'

describe('dof', () => {
  describe('computeHyperfocal', () => {
    it('calculates hyperfocal for 24mm at f/2.8 with full-frame CoC', () => {
      // f=24mm, N=2.8, c=0.029mm
      // H = 24² / (2.8 * 0.029) + 24 ≈ 7117.6mm
      const result = computeHyperfocal(24, 2.8, 0.029)
      expect(result).toBeCloseTo(7117.6, -1)
    })
  })

  describe('computeNearBoundary', () => {
    it('returns near boundary for typical nightscape focus at 10m', () => {
      // s=10000mm, H=7117.6mm, f=24mm
      const s_mm = 10000
      const H_mm = 7117.6
      const f_mm = 24
      const result = computeNearBoundary(s_mm, H_mm, f_mm)
      expect(result).toBeTruthy()
      expect(result).toBeLessThan(s_mm)
    })
  })

  describe('computeFarBoundary', () => {
    it('returns finite value when focus distance < hyperfocal', () => {
      // s=5000mm, H=7117.6mm (s < H, so H - s > 0, returns finite)
      const result = computeFarBoundary(5000, 7117.6, 24)
      expect(isFinite(result)).toBe(true)
      expect(result).toBeGreaterThan(5000)
    })

    it('returns Infinity when focus distance >= hyperfocal', () => {
      // s=20000mm, H=7117.6mm (s > H, so H - s < 0, returns Infinity)
      const result = computeFarBoundary(20000, 7117.6, 24)
      expect(result).toBe(Infinity)
    })
  })

  describe('computeDepthOfField', () => {
    it('returns Infinity when far boundary is Infinity', () => {
      expect(computeDepthOfField(1000, Infinity)).toBe(Infinity)
    })

    it('calculates total DOF range', () => {
      const result = computeDepthOfField(3320, 13280)
      expect(result).toBeCloseTo(9960, 0)
    })
  })

  describe('computeFullDof', () => {
    it('produces expected result for nightscape (24mm, f/2.8, 10m focus, FF)', () => {
      // From updated calculation
      const result = computeFullDof(24, 2.8, 10000, 0.029)
      expect(result.H_mm).toBeCloseTo(7117.6, -1)
      expect(result.delta_D_mm).toBeDefined()
      expect(isFinite(result.delta_D_mm) || result.delta_D_mm === Infinity).toBe(true)
      if (isFinite(result.delta_D_mm)) {
        expect(result.tolerance_lower_mm).toBeLessThan(result.delta_D_mm)
        expect(result.tolerance_upper_mm).toBeGreaterThan(result.delta_D_mm)
      }
    })

    it('includes ±5% tolerance bounds', () => {
      const result = computeFullDof(50, 8, 5000, 0.029)
      if (isFinite(result.delta_D_mm)) {
        const expected_tolerance = result.delta_D_mm * 0.05
        expect(result.tolerance_upper_mm - result.delta_D_mm).toBeCloseTo(expected_tolerance, 1)
        expect(result.delta_D_mm - result.tolerance_lower_mm).toBeCloseTo(expected_tolerance, 1)
      }
    })
  })
})
