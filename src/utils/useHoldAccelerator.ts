import { useRef, useEffect } from 'react'
import HoldAccelerator from './holdAccelerator'

export function useHoldAccelerator(cb: () => void) {
  const ref = useRef<HoldAccelerator | null>(null)

  useEffect(() => {
    ref.current = new HoldAccelerator(cb)
    return () => ref.current?.stop()
  }, [cb])

  return {
    start: () => ref.current?.start(),
    stop: () => ref.current?.stop(),
  }
}

export default useHoldAccelerator
