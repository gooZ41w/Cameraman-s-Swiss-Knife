import { useEffect, useRef, useState } from 'react'
import { formatShutterDisplay, formatShutterRangeDisplay } from '../formatters/exposureFormat'

export function BulbTimer({ seconds, onComplete }: { seconds: number; onComplete?: () => void }) {
  const [running, setRunning] = useState(false)
  const [remaining, setRemaining] = useState(seconds)

  // keep track of elapsed when pausing
  const startedAtRef = useRef<number | null>(null)
  const pausedElapsedRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    // reset when target seconds changes
    setRemaining(seconds)
    pausedElapsedRef.current = 0
    startedAtRef.current = null
    setRunning(false)
  }, [seconds])

  useEffect(() => {
    function tick() {
      if (!running) return
      const now = Date.now()
      if (startedAtRef.current == null) startedAtRef.current = now
      const elapsed = (now - startedAtRef.current) / 1000 + pausedElapsedRef.current
      const left = Math.max(0, seconds - elapsed)
      setRemaining(left)
      if (left <= 0) {
        setRunning(false)
        startedAtRef.current = null
        pausedElapsedRef.current = 0
        if (onComplete) onComplete()
      } else {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    if (running) {
      rafRef.current = requestAnimationFrame(tick)
    }

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [running, seconds, onComplete])

  const handleStartStop = () => {
    if (!running) {
      // start or resume
      startedAtRef.current = Date.now()
      setRunning(true)
    } else {
      // pause
      if (startedAtRef.current != null) {
        pausedElapsedRef.current += (Date.now() - startedAtRef.current) / 1000
      }
      startedAtRef.current = null
      setRunning(false)
    }
  }

  const handleReset = () => {
    startedAtRef.current = null
    pausedElapsedRef.current = 0
    setRemaining(seconds)
    setRunning(false)
  }

  return (
    <div data-testid="exposure-bulb-timer" className="bulb-timer">
      <div className="bulb-note">Bulb 倒计时模式</div>
      <div data-testid="bulb-remaining" className="bulb-remaining">{formatShutterDisplay(remaining)}</div>
      <div className="bulb-desc">当前 ND 组合后的目标快门已超过 4 秒。</div>

      <div className="bulb-actions">
        <button
          data-testid="bulb-start-btn"
          onClick={handleStartStop}
          className={`btn ${running ? 'btn-danger' : 'btn-primary'}`}
        >
          {running ? '停止' : '开始'}
        </button>
        <button data-testid="bulb-reset-btn" onClick={handleReset} className="btn btn-dark">重置</button>
      </div>
      <div className="bulb-range">{formatShutterRangeDisplay(seconds, 5, 25)}</div>
    </div>
  )
}

export default BulbTimer
