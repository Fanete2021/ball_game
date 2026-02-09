import type { GameStatus } from '../constants/game'

export class GameState {
  private _score: number = 0
  private _lives: number
  private _maxLives: number
  private _status: GameStatus = 'idle'

  private onScoreChange?: (score: number) => void
  private onLivesChange?: (lives: number) => void
  private onStatusChange?: (status: GameStatus) => void

  constructor(props: { maxLives: number }) {
    this._lives = props.maxLives;
    this._maxLives = props.maxLives;
  }

  get score(): number {
    return this._score
  }

  get isRunning(): boolean {
    return this._status === 'running'
  }

  get isGameOver(): boolean {
    return this._status === 'gameOver'
  }

  setScoreChangeCallback(callback: (score: number) => void): void {
    this.onScoreChange = callback
  }

  setLivesChangeCallback(callback: (lives: number) => void): void {
    this.onLivesChange = callback
  }

  setStatusChangeCallback(callback: (status: GameStatus) => void): void {
    this.onStatusChange = callback
  }

  addScore(points: number): void {
    this._score += points
    this.onScoreChange?.(this._score)
  }

  loseLife(): void {
    if (this._lives > 0) {
      this._lives--
      this.onLivesChange?.(this._lives)

      if (this._lives === 0) {
        this._status = 'gameOver'
        this.onStatusChange?.(this._status)
      }
    }
  }

  addLife(): void {
    if (this._lives < this._maxLives) {
      this._lives++
      this.onLivesChange?.(this._lives)
    }
  }

  start(): void {
    if (this._status === 'idle') {
      this._status = 'running'
      this.onStatusChange?.(this._status)
    }
  }

  pause(): void {
    if (this._status === 'running') {
      this._status = 'idle'
      this.onStatusChange?.(this._status)
    }
  }

  reset(): void {
    this._score = 0
    this._lives = this._maxLives
    this._status = 'idle'
    this.onScoreChange?.(this._score)
    this.onLivesChange?.(this._lives)
    this.onStatusChange?.(this._status)
  }
}
