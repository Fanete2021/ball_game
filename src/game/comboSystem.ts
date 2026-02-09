export const COMBO_MULTIPLIER_PER_STEP = 0.1

export class ComboSystem {
  private _comboElement: HTMLElement | undefined
  private _combo: number = 0

  constructor(props: { comboElement?: HTMLElement }) {
    const { comboElement } = props
    if (comboElement) this.setComboElement({ comboElement })
  }

  get multiplier(): number {
    return 1 + this._combo * COMBO_MULTIPLIER_PER_STEP
  }

  setComboElement(props: { comboElement: HTMLElement }) {
    this._comboElement = props.comboElement
    this.changeComboElementText({ value: this.multiplier })
  }

  changeComboElementText(props: { value: number }) {
    if (this._comboElement) this._comboElement.textContent = props.value.toFixed(1)
  }

  increment(): void {
    this._combo++
    this.changeComboElementText({ value: this.multiplier })
  }

  reset(): void {
    if (this._combo > 0) {
      this._combo = 0
      this.changeComboElementText({ value: this.multiplier })
    }
  }

  clear(): void {
    this._combo = 0
    this.changeComboElementText({ value: this.multiplier })
  }
}
