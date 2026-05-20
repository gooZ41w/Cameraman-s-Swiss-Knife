import { useRef, useCallback } from 'react'

type UseDragSnapOptions = {
  threshold?: number
}

export function useDragSnap(onPrev: () => void, onNext: () => void, opts?: UseDragSnapOptions) {
  const startX = useRef<number | null>(null)
  const threshold = opts?.threshold ?? 36

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // capture pointer for robustness
    try {
      ;(e.target as Element).setPointerCapture?.((e as any).pointerId)
    } catch (_) {}
    startX.current = e.clientX
  }, [])

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    // no-op; we only need start position and end delta for snap detection
    // could add live feedback later
  }, [])

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (startX.current == null) return
    const dx = e.clientX - startX.current
    if (dx > threshold) {
      onPrev()
    } else if (dx < -threshold) {
      onNext()
    }
    try {
      ;(e.target as Element).releasePointerCapture?.((e as any).pointerId)
    } catch (_) {}
    startX.current = null
  }, [onPrev, onNext, threshold])

  return { onPointerDown, onPointerMove, onPointerUp }
}

export default useDragSnap
