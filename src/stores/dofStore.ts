import { create } from 'zustand'
import { SENSOR_FORMATS, SensorFormat } from '../domain/types'

export interface DofStoreState {
  sensorFormat: SensorFormat
  focalLength_mm: number
  aperture: number
  focusDistance_m: number

  setSensorFormat: (format: SensorFormat) => void
  setFocalLength: (f: number) => void
  setAperture: (N: number) => void
  setFocusDistance: (d: number) => void
}

export const useDofStore = create<DofStoreState>((set) => ({
  sensorFormat: SENSOR_FORMATS.full_frame,
  focalLength_mm: 24,
  aperture: 2.8,
  focusDistance_m: 10,

  setSensorFormat: (format) => set({ sensorFormat: format }),
  setFocalLength: (f) => set({ focalLength_mm: f }),
  setAperture: (N) => set({ aperture: N }),
  setFocusDistance: (d) => set({ focusDistance_m: d }),
}))
