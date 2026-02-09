import type { Ball } from '../types/ball'
import { createBall } from './ballGenerator'
import { GameState } from '../types/gameState'
import { BuffSystem } from './buffSystem'
import { ComboSystem } from './comboSystem'
import { DifficultySystem } from './difficultySystem'
import { GameTimer } from './gameTimer'
import { BALL_RESPAWN_OFFSET, BALL_RADIUS } from '../constants/ball'
import type { GameConfig, TelemetryEvent } from "@/types/api.ts";
import { Application } from "pixi.js";

export class GameEngine {
  private app: Application
  private gameState: GameState
  private buffSystem: BuffSystem
  private comboSystem: ComboSystem
  private difficultySystem: DifficultySystem
  private gameTimer: GameTimer

  private balls: Ball[] = []
  private resizeObserver: ResizeObserver | null = null

  private onScoreChange?: (score: number) => void
  private onLivesChange?: (lives: number) => void
  private onGameOver?: (score: number) => void
  private onTelemetryEvent?: (event: TelemetryEvent) => void

  constructor(
    private canvasContainer: HTMLElement,
    private gameConfig: GameConfig,
    private timerElement: HTMLElement,
    private difficultyElement: HTMLElement,
    private comboElement: HTMLElement,
    private buffTimerElement?: HTMLElement,
    telemetryCallback?: (event: TelemetryEvent) => void,
  ) {
    this.app = new Application()
    this.buffSystem = new BuffSystem({ buffTimerElement: this.buffTimerElement })
    this.gameTimer = new GameTimer({ timerElement: this.timerElement })
    this.difficultySystem = new DifficultySystem({ difficultyElement: this.difficultyElement })
    this.comboSystem = new ComboSystem({ comboElement: this.comboElement })

    this.gameState = new GameState({ maxLives: gameConfig.maxLives })
    this.onTelemetryEvent = telemetryCallback
    this.setupGameStateCallbacks()
  }

  private setupGameStateCallbacks(): void {
    this.gameState.setScoreChangeCallback((score) => {
      this.onScoreChange?.(score)
    })

    this.gameState.setLivesChangeCallback((lives) => {
      this.onLivesChange?.(lives)
    })

    this.gameState.setStatusChangeCallback((status) => {
      if (status === 'gameOver') {
        this.onGameOver?.(this.gameState.score)
      }
    })
  }

  setScoreCallback(callback: (score: number) => void): void {
    this.onScoreChange = callback
  }

  setLivesCallback(callback: (lives: number) => void): void {
    this.onLivesChange = callback
  }

  setGameOverCallback(callback: (score: number) => void): void {
    this.onGameOver = callback
  }

  async initialize(): Promise<void> {
    await this.app.init({
      width: this.canvasContainer.clientWidth,
      height: this.canvasContainer.clientHeight,
    })

    this.canvasContainer.appendChild(this.app.canvas)
    this.setupResizeObserver()
    this.setupClickHandler()
    this.initializeBalls()
    this.startGameLoop()
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(() => {
      const width = this.canvasContainer.clientWidth
      const height = this.canvasContainer.clientHeight
      this.app.renderer.resize(width, height)
    })
    this.resizeObserver.observe(this.canvasContainer)
  }

  private setupClickHandler(): void {
    this.app.canvas.addEventListener('click', (event) => {
      if (!this.gameState.isRunning) return

      const rect = this.app.canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      this.handleClick(x, y)
    })
  }

  private handleClick(x: number, y: number): void {
    let hitBall = false

    this.balls.forEach((ball, index) => {
      const dx = x - ball.gfx.x
      const dy = y - ball.gfx.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance <= BALL_RADIUS) {
        hitBall = true
        this.handleBallHit(ball, index)
      }
    })

    if (!hitBall) {
      this.comboSystem.reset()
      this.onTelemetryEvent?.({
        t: Date.now(),
        type: 'miss',
        hit: false,
      })
    }
  }

  private handleBallHit(ball: Ball, index: number): void {
    this.app.stage.removeChild(ball.gfx)

    this.onTelemetryEvent?.({
      t: Date.now(),
      type: 'ball_hit',
      ballId: ball.type,
      kind: ball.type,
      hit: true,
    })

    const buffMultiplier = this.buffSystem.isX2ScoreActive() ? 2 : 1
    const comboMultiplier = this.comboSystem.multiplier
    const totalMultiplier = buffMultiplier * comboMultiplier

    switch (ball.type) {
      case "doublePoints":
        this.buffSystem.activateX2Score({ duration: this.gameConfig.bonusDurations.doublePoints })
        break
      case "bomb":
        this.handleBombExplosion(totalMultiplier)
        break
      case "heal":
        this.gameState.addLife()
        break
      case "normal":
        this.gameState.addScore(this.gameConfig.scores.normal * totalMultiplier)
        break
      case "bad":
        this.gameState.loseLife()
        break
    }

    if (ball.type === "bad") this.comboSystem.reset()
    else this.comboSystem.increment()

    this.balls[index] = this.createNewBall()
  }

  private handleBombExplosion(multiplier: number): void {
    let bombScore = 0
    this.balls.forEach((ball, i) => {
      if (ball.type === "normal" && ball.gfx.parent) {
        this.app.stage.removeChild(ball.gfx)
        bombScore += this.gameConfig.scores.normal
        this.balls[i] = this.createNewBall()
      }
    })
    this.gameState.addScore(bombScore * multiplier)
  }

  private initializeBalls(): void {
    this.clearBalls()
    for (let i = 0; i < this.gameConfig.maxBalls; i++) {
      this.balls.push(this.createNewBall())
    }
  }

  private createNewBall(): Ball {
    const ball = createBall({
      widthContainer: this.app.renderer.width,
      heightContainer: this.app.renderer.height,
      gameConfig: this.gameConfig
    })
    this.app.stage.addChild(ball.gfx)
    return ball
  }

  private clearBalls(): void {
    this.balls.forEach(ball => {
      if (ball.gfx.parent) {
        this.app.stage.removeChild(ball.gfx)
      }
    })
    this.balls = []
  }

  private startGameLoop(): void {
    this.app.ticker.add(() => {
      if (!this.gameState.isRunning) return

      this.updateBalls()
      this.buffSystem.update()
    })
  }

  private updateBalls(): void {
    this.balls.forEach((ball, index) => {
      const adjustedSpeed = ball.speed * this.difficultySystem.speedMultiplier
      ball.gfx.y -= adjustedSpeed

      if (ball.gfx.y < BALL_RESPAWN_OFFSET) {
        this.app.stage.removeChild(ball.gfx)

        if (ball.type === "normal") {
          this.gameState.loseLife()
          this.comboSystem.reset()

          this.onTelemetryEvent?.({
            t: Date.now(),
            type: 'ball_missed',
            ballId: ball.type,
            kind: ball.type,
            hit: false,
          })
        }

        this.balls[index] = this.createNewBall()
      }
    })
  }

  start(): void {
    this.gameState.start()
    this.difficultySystem.start()
    this.gameTimer.start()
  }

  pause(): void {
    this.gameState.pause()
    this.difficultySystem.stop()
    this.gameTimer.stop()
  }

  restart(): void {
    this.gameState.reset()
    this.buffSystem.clear()
    this.comboSystem.clear()
    this.difficultySystem.reset()
    this.gameTimer.reset()
    this.initializeBalls()
  }

  destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
    }

    if (this.app.ticker) {
      this.app.ticker.stop()
    }

    if (this.app.stage) {
      this.app.stage.removeChildren()
    }

    const canvas = this.app.renderer?.canvas
    if (this.canvasContainer && canvas && canvas.parentNode) {
      this.canvasContainer.removeChild(canvas)
    }

    if (this.app.renderer) {
      this.app.renderer.destroy()
    }
  }

  get isRunning(): boolean {
    return this.gameState.isRunning
  }

  get isGameOver(): boolean {
    return this.gameState.isGameOver
  }
}
