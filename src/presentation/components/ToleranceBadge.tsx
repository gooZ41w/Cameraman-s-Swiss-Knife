interface ToleranceBadgeProps {
  value: number
  lower: number
  upper: number
  unit: string
  precision?: number
}

export function ToleranceBadge({ value, lower, upper, unit, precision = 2 }: ToleranceBadgeProps) {
  const format = (n: number) => {
    if (!isFinite(n)) return '∞'
    return n.toFixed(precision)
  }

  return (
    <div className="tolerance-container">
      <div className="tolerance-value">{format(value)} {unit}</div>
      <div className="tolerance-range">
        <span className="tolerance-range-label">容差较大值</span>
        <span className="tolerance-upper">{format(upper)} {unit}</span>
        <span className="tolerance-range-sep">·</span>
        <span className="tolerance-range-label">较小值</span>
        <span className="tolerance-lower">{format(lower)} {unit}</span>
      </div>
    </div>
  )
}
