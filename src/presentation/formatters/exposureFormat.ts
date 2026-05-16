function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function computeExposureTolerance(value: number, percent: number): [number, number] {
  const ratio = clamp(percent, 0, 100) / 100
  return [value * (1 - ratio), value * (1 + ratio)]
}

function formatExposureSeconds(seconds: number): string {
  if (!isFinite(seconds)) {
    return '∞'
  }

  if (seconds < 1) {
    const ideal = 1 / seconds
    const commonDenominators = [
      1,
      2,
      3,
      4,
      5,
      6,
      8,
      10,
      13,
      15,
      20,
      25,
      30,
      40,
      50,
      60,
      80,
      100,
      125,
      160,
      200,
      250,
      320,
      400,
      500,
      640,
      800,
      1000,
      1250,
      1600,
      2000,
      2500,
      3200,
      4000,
      5000,
      6400,
      8000,
    ]
    let nearest = commonDenominators.reduce((prev, cur) => (Math.abs(cur - ideal) < Math.abs(prev - ideal) ? cur : prev), commonDenominators[0])
    // if ideal is beyond our table, fall back to rounded value
    if (ideal > commonDenominators[commonDenominators.length - 1]) {
      nearest = Math.round(ideal)
    }
    return `1/${nearest}s`
  }

  return `${seconds.toFixed(1)}s`
}

export function formatShutterDisplay(seconds: number): string {
  return formatExposureSeconds(seconds)
}

export function formatShutterRangeDisplay(seconds: number, lowerPercent: number, upperPercent: number): string {
  const [lower, upper] = computeExposureTolerance(seconds, lowerPercent)
  const [wideLower, wideUpper] = computeExposureTolerance(seconds, upperPercent)
  return `${formatShutterDisplay(seconds)} (${formatExposureSeconds(lower)}-${formatExposureSeconds(upper)} / ${formatExposureSeconds(wideLower)}-${formatExposureSeconds(wideUpper)})`
}

export function formatSolvedAperture(aperture: number): string {
  return `f/${aperture.toFixed(1)}`
}

export function formatSolvedIso(iso: number): string {
  return `${Math.round(iso)}`
}

export default null
