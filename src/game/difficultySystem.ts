export const DIFFICULTY_INCREASE_INTERVAL = 5000
export const SPEED_INCREASE_PERCENT = 0.02

export class DifficultySystem {
  private _difficultyElement: HTMLElement | undefined
  private _speedMultiplier: number = 1.0
  private _difficultyLevel: number = 1
  private updateInterval?: number

  constructor(props: { difficultyElement?: HTMLElement }) {
    const { difficultyElement } = props
    if (difficultyElement) this.setDifficultyElement({ difficultyElement })
  }

  get speedMultiplier(): number {
    return this._speedMultiplier
  }

  setDifficultyElement(props: { difficultyElement: HTMLElement }) {
    this._difficultyElement = props.difficultyElement
    this.updateDifficultyDisplay()
  }

  updateDifficultyDisplay(): void {
    if (this._difficultyElement) {
      this._difficultyElement.textContent = this._difficultyLevel.toString()
    }
  }

  start(): void {
    this.updateInterval = window.setInterval(() => {
      this.increment()
    }, DIFFICULTY_INCREASE_INTERVAL)
  }

  increment(): void {
    this._speedMultiplier += SPEED_INCREASE_PERCENT
    this._difficultyLevel++
    this.updateDifficultyDisplay()
  }

  stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = undefined
    }
  }

  reset(): void {
    this._speedMultiplier = 1.0
    this._difficultyLevel = 1
    this.updateDifficultyDisplay()
  }
}
