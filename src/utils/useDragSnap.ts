import { useRef, useCallback } from 'react'

type UseDragSnapOptions = {
  threshold?: number
  onMove?: (dx: number) => void
}

export function useDragSnap(onPrev: () => void, onNext: () => void, opts?: UseDragSnapOptions) {
  const startX = useRef<number | null>(null)
  const threshold = opts?.threshold ?? 36
  const onMove = opts?.onMove

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
    if (dx > threshold) {
      onPrev()
    } else if (dx < -threshold) {
      onNext()
    }
    if (onMove) onMove(0)
    try {
      ;(e.target as Element).releasePointerCapture?.((e as any).pointerId)
    } catch (_) {}
    startX.current = null
  }, [onPrev, onNext, threshold, onMove])

  return { onPointerDown, onPointerMove, onPointerUp }
}

export default useDragSnap
