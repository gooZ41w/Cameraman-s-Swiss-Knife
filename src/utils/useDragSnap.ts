import { useRef, useCallback } from 'react'

type UseDragSnapOptions = {
  threshold?: number
  maxSteps?: number
  onMove?: (dx: number) => void
  onSnap?: (steps: number) => void
}

export function useDragSnap(onPrev: () => void, onNext: () => void, opts?: UseDragSnapOptions) {
  const startX = useRef<number | null>(null)
  const threshold = opts?.threshold ?? 36
  const maxSteps = opts?.maxSteps ?? 1
  const onMove = opts?.onMove
  const onSnap = opts?.onSnap

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    try {
      ;(e.target as Element).setPointerCapture?.((e as any).pointerId)
    } catch (_) {}
    startX.current = e.clientX
    if (onMove) onMove(0)
  }, [onMove])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (startX.current == null) return
    const dx = e.clientX - startX.current
    if (onMove) onMove(dx)
  }, [onMove])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (startX.current == null) return
    const dx = e.clientX - startX.current
    const steps = Math.min(maxSteps, Math.floor(Math.abs(dx) / threshold))
    if (steps > 0) {
      if (onSnap) {
        onSnap(dx > 0 ? -steps : steps)
      } else {
        const action = dx > 0 ? onPrev : onNext
        for (let i = 0; i < steps; i += 1) action()
      }
    }
    if (onMove) onMove(0)
    try {
      ;(e.target as Element).releasePointerCapture?.((e as any).pointerId)
    } catch (_) {}
    startX.current = null
  }, [onPrev, onNext, threshold, maxSteps, onMove, onSnap])

  return { onPointerDown, onPointerMove, onPointerUp }
}

export default useDragSnap
