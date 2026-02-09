import type {GameConfig} from "@/types/api.ts";

export type BuffType = keyof GameConfig['bonusDurations'];

export class BuffSystem {
  private _buffTimerElement: HTMLElement | undefined
  private activeBuffs: Map<BuffType, number> = new Map()
  private lastDisplayedTime: number = 0

  constructor(props: { buffTimerElement?: HTMLElement }) {
    const { buffTimerElement } = props
    if (buffTimerElement) this.setBuffTimerElement({ buffTimerElement })
  }

  setBuffTimerElement(props: { buffTimerElement: HTMLElement }) {
    this._buffTimerElement = props.buffTimerElement
    this.lastDisplayedTime = this.calculateTimeLeft()
    this.updateBuffTimerDisplay()
  }

  private calculateTimeLeft(): number {
    const endTime = this.activeBuffs.get('doublePoints')
    if (!endTime) return 0

    const timeLeft = Math.max(0, Math.ceil((endTime - Date.now()) / 1000))
    if (timeLeft === 0) {
      this.activeBuffs.clear()
    }
    return timeLeft
  }

  updateBuffTimerDisplay(): void {
    if (!this._buffTimerElement) return

    const currentTimeLeft = this.calculateTimeLeft()

    if (currentTimeLeft !== this.lastDisplayedTime) {
      this._buffTimerElement.textContent = currentTimeLeft.toString()
      this.lastDisplayedTime = currentTimeLeft
    }
  }

  activateX2Score(props: { duration: number }): void {
    const endTime = Date.now() + props.duration * 1000
    this.activeBuffs.set('doublePoints', endTime)
    this.updateBuffTimerDisplay()
  }

  isX2ScoreActive(): boolean {
    const endTime = this.activeBuffs.get('doublePoints')
    if (!endTime) {
      this.updateBuffTimerDisplay()
      return false
    }

    if (Date.now() >= endTime) {
      this.activeBuffs.delete('doublePoints')
      this.updateBuffTimerDisplay()
      return false
    }

    return true
  }

  getX2ScoreTimeLeft(): number {
    return this.calculateTimeLeft()
  }

  clear(): void {
    this.activeBuffs.clear()
    this.lastDisplayedTime = 0
    this.updateBuffTimerDisplay()
  }

  update(): void {
    this.updateBuffTimerDisplay()
  }
}
