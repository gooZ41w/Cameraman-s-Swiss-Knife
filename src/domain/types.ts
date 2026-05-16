export interface SensorFormat {
  name: string
  width_mm: number
  height_mm: number
  diagonal_mm?: number
  coc_mm?: number
}

export const SENSOR_FORMATS: Record<string, SensorFormat> = {
  full_frame: {
    name: 'Full Frame',
    width_mm: 36.0,
    height_mm: 24.0,
    diagonal_mm: 43.27,
    coc_mm: 0.029,
  },
  aps_c_std: {
    name: 'APS-C (Sony/Fuji/Nikon)',
    width_mm: 23.5,
    height_mm: 15.6,
    diagonal_mm: 28.21,
    coc_mm: 0.019,
  },
  aps_c_canon: {
    name: 'APS-C (Canon)',
    width_mm: 22.3,
    height_mm: 14.9,
    diagonal_mm: 26.82,
    coc_mm: 0.018,
  },
  m43: {
    name: 'Micro Four Thirds',
    width_mm: 17.3,
    height_mm: 13.0,
    diagonal_mm: 21.64,
    coc_mm: 0.014,
  },
  one_inch: {
    name: '1 Inch',
    width_mm: 13.2,
    height_mm: 8.8,
    diagonal_mm: 15.86,
    coc_mm: 0.011,
  },
}

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
