export class GameTimer {
  private _timerElement: HTMLElement | undefined
  private startTime: number = 0
  private elapsedTime: number = 0
  private isRunning: boolean = false
  private intervalId?: number

  constructor(props: { timerElement?: HTMLElement }) {
    const { timerElement } = props
    if (timerElement) this.setTimerElement({ timerElement })
  }

  setTimerElement(props: { timerElement: HTMLElement }) {
    this._timerElement = props.timerElement
    this.updateTimerDisplay()
  }

  updateTimerDisplay(): void {
    if (this._timerElement) {
      const seconds = this.getTime()
      const minutes = Math.floor(seconds / 60)
      const secs = seconds % 60
      this._timerElement.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`
    }
  }

  start(): void {
    if (this.isRunning) return

    this.isRunning = true
    this.startTime = Date.now() - this.elapsedTime

    this.intervalId = window.setInterval(() => {
      this.updateTimerDisplay()
    }, 1000)
  }

  stop(): void {
    if (!this.isRunning) return

    this.isRunning = false
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
    }
    this.updateTimerDisplay()
  }

  reset(): void {
    this.stop()
    this.elapsedTime = 0
    this.updateTimerDisplay()
  }

  getTime(): number {
    if (this.isRunning) {
      return Math.floor((Date.now() - this.startTime) / 1000)
    }
    return Math.floor(this.elapsedTime / 1000)
  }
}
