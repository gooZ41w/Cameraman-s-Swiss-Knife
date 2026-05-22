import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { HoldAccelerator } from '../../src/utils/holdAccelerator'

describe('HoldAccelerator', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('calls callback immediately, repeats, and accelerates', () => {
    const cb = vi.fn()
    const h = new HoldAccelerator(cb)
    h.start()
    expect(cb).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(400)
    expect(cb).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(200)
    expect(cb).toHaveBeenCalledTimes(2)

    vi.advanceTimersByTime(170)
    expect(cb).toHaveBeenCalledTimes(3)

    h.stop()
    vi.advanceTimersByTime(1000)
    expect(cb).toHaveBeenCalledTimes(3)
  })

  it('ignores repeated start calls while running', () => {
    const cb = vi.fn()
    const h = new HoldAccelerator(cb)

    h.start()
    h.start()

    expect(cb).toHaveBeenCalledTimes(1)
  })
})
