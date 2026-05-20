import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { HoldAccelerator } from '../../src/utils/holdAccelerator'

describe('HoldAccelerator', () => {
  let clock: ReturnType<typeof vi.useFakeTimers>
  beforeEach(() => {
    clock = vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('calls callback immediately and repeats after delay', () => {
    const cb = vi.fn()
    const h = new HoldAccelerator(cb)
    h.start()
    expect(cb).toHaveBeenCalledTimes(1)

    // advance past initial delay (400ms)
    clock.advanceTimersByTime(400)
    // first interval tick
    clock.advanceTimersByTime(200)
    expect(cb).toHaveBeenCalled()

    h.stop()
  })
})
