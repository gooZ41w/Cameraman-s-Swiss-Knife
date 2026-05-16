export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function kelvinToRgb(kelvin: number): [number, number, number] {
  const temperature = clamp(kelvin, 1000, 40000) / 100

  let red: number
  let green: number
  let blue: number

  if (temperature <= 66) {
    red = 255
    green = 99.4708025861 * Math.log(temperature) - 161.1195681661
    blue = temperature <= 19 ? 0 : 138.5177312231 * Math.log(temperature - 10) - 305.0447927307
  } else {
    red = 329.698727446 * Math.pow(temperature - 60, -0.1332047592)
    green = 288.1221695283 * Math.pow(temperature - 60, -0.0755148492)
    blue = 255
  }

  return [red, green, blue].map((channel) => Math.round(clamp(channel, 0, 255))) as [number, number, number]
}
