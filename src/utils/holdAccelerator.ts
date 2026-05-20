export type Callback = () => void

export class HoldAccelerator {
  private cb: Callback
  private timeoutId: ReturnType<typeof setTimeout> | null = null
  private intervalId: ReturnType<typeof setInterval> | null = null
  private step = 200
  private running = false

  constructor(cb: Callback) {
    this.cb = cb
  }

  start() {
    if (this.running) return
    this.running = true
    // immediate trigger
    this.cb()

    // after initial delay, start repeating and accelerate
    this.timeoutId = setTimeout(() => {
      this.intervalId = setInterval(() => {
        this.cb()
        if (this.step > 50) this.step = Math.max(50, this.step - 30)
        if (this.intervalId) {
          clearInterval(this.intervalId)
          this.intervalId = setInterval(() => {
            this.cb()
          }, this.step)
        }
      }, this.step)
    }, 400)
  }

  stop() {
    this.running = false
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = null
    }
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.step = 200
  }
}

export default HoldAccelerator
