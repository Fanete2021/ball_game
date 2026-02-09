import { sessionService } from '../api/services/sessionService'
import { telemetryService } from '../api/services/telemetryService'
import { scoreService } from '../api/services/scoreService'
import { configService } from '../api/services/configService'
import { createGameOverModal } from '../ui/gameOverModal'
import { createLeaderboardModal } from '../ui/leaderboardModal'
import { GameEngine } from "@/game/gameEngine.ts";
import type { GameConfig, TelemetryEvent } from "@/types/api.ts";
import { initGameConfig } from "@/constants/game.ts";
import { getHeaderUI, type headerUI, updateLivesDisplay } from "@/ui/header.ts";
import { leaderboardService } from "@/api/services/leaderboardService.ts";

export class GameManager {
  private gameEngine: GameEngine | null = null
  private gameOverModal = createGameOverModal()
  private leaderboardModal = createLeaderboardModal()
  private uiElements: headerUI | null = null;

  private sessionId: string | null = null
  private nickname: string = 'Гость'
  private gameConfig: GameConfig

  private telemetryEvents: TelemetryEvent[] = []
  private telemetryIntervalId: number | null = null

  constructor(
    private canvasContainer: HTMLElement,
    private clientVersion: string,
    private telemetryInterval: number,
    private maxEventsPerRequest: number
  ) {
    this.gameConfig = initGameConfig
    document.body.appendChild(this.gameOverModal.modal)
    document.body.appendChild(this.leaderboardModal.modal)

    const appContainer = document.getElementById('app')!
    this.uiElements = getHeaderUI({ app: appContainer })
  }

  async initialize(): Promise<void> {
    await this.loadGameConfig()
    await this.initializeGameEngine()
    this.setupEventListeners()
    this.startTelemetryTimer()
  }

  private async loadGameConfig(): Promise<void> {
    try {
      this.gameConfig = await configService.getConfig()
    } catch (error) {
      console.error('Ошибка загрузки конфигурации:', error)
    }
  }

  private async initializeGameEngine(): Promise<void> {
    if (!this.uiElements) return;

    this.gameEngine = new GameEngine(
      this.canvasContainer,
      this.gameConfig,
      this.uiElements.timerElement,
      this.uiElements.difficultyElement,
      this.uiElements.comboValueElement,
      this.uiElements.buffTimerElement,
      (event) => this.addTelemetryEvent(event),
    )

    this.gameEngine.setScoreCallback((score) => {
      this.uiElements!.scoreElement.textContent = score.toFixed(1)
    })

    this.gameEngine.setLivesCallback((lives) => {
      updateLivesDisplay({
        livesElement: this.uiElements!.livesElement,
        maxLives: this.gameConfig.maxLives,
        lives
      })
      this.addTelemetryEvent({
        t: Date.now(),
        type: 'life_lost',
        hit: false,
      })
    })

    this.gameEngine.setGameOverCallback((score) => {
      this.handleGameOver(score)
    })

    await this.gameEngine.initialize()
  }

  private addTelemetryEvent(event: TelemetryEvent): void {
    this.telemetryEvents.push(event)

    if (this.telemetryEvents.length >= this.maxEventsPerRequest) {
      this.sendTelemetryNow()
    }
  }

  private startTelemetryTimer(): void {
    if (this.telemetryIntervalId) {
      clearInterval(this.telemetryIntervalId)
    }

    this.telemetryIntervalId = window.setInterval(() => {
      if (this.telemetryEvents.length > 0) {
        this.sendTelemetryNow()
      }
    }, this.telemetryInterval)
  }

  private async sendTelemetryNow(): Promise<void> {
    if (this.telemetryEvents.length === 0 || !this.sessionId) {
      return
    }

    const eventsToSend = [...this.telemetryEvents]
    this.telemetryEvents = []

    try {
      if (eventsToSend.length > this.maxEventsPerRequest) {
        await telemetryService.sendEvents({ sessionId: this.sessionId, events: eventsToSend.slice(0, this.maxEventsPerRequest )})
      } else {
        await telemetryService.sendEvents({ sessionId: this.sessionId, events: eventsToSend })
      }
    } catch (error) {
      console.error('Ошибка отправки телеметрии', error)
      this.telemetryEvents = [...eventsToSend.slice(-50), ...this.telemetryEvents]
    }
  }

  private async createGameSession(playerName: string): Promise<void> {
    try {
      const response = await sessionService.createSession(playerName, this.clientVersion)
      this.sessionId = response.sessionId
      this.nickname = playerName
    } catch (error) {
      console.error('Ошибка создания сессии:', error)
      this.sessionId = null
      this.nickname = playerName
    }
  }

  private async submitFinalScore(score: number): Promise<void> {
    if (!this.sessionId) return

    try {
      const response = await scoreService.submitScore(this.sessionId, score)
      this.gameOverModal.scoreElement.textContent = `${score} (Ранг: ${response.rank})`
    } catch (error) {
      console.error('Ошибка отправки счёта', error)
    }
  }

  private handleGameOver(score: number): void {
    if (!this.uiElements) return;

    this.uiElements.startButton.textContent = 'РЕСТАРТ'
    this.submitFinalScore(score)

    if (this.telemetryEvents.length > 0) {
      this.sendTelemetryNow()
    }

    this.gameOverModal.show(score)
  }

  private setupEventListeners(): void {
    if (!this.uiElements) return;

    this.uiElements.startButton.addEventListener('click', () => this.handleStartButton())
    this.uiElements.leaderboardButton.addEventListener('click', () => this.showLeaderboard())
    this.gameOverModal.restartButton.addEventListener('click', () => this.restartGame())
  }

  private async handleStartButton(): Promise<void> {
    if (!this.gameEngine) return

    if (this.gameEngine.isGameOver) {
      this.restartGame()
      return
    }

    if (this.gameEngine.isRunning) {
      this.gameEngine.pause()
      this.uiElements!.startButton.textContent = 'СТАРТ'
    } else {
      if (!this.sessionId) {
        const playerName = prompt('Введите ваш никнейм:', this.nickname)
        if (playerName && playerName.trim()) {
          await this.createGameSession(playerName.trim())
        } else {
          alert('Никнейм обязателен для игры')
          return
        }
      }

      this.gameEngine.start()
      this.uiElements!.startButton.textContent = 'ПАУЗА'
    }
  }

  private async showLeaderboard(): Promise<void> {
    try {
      const response = await leaderboardService.getLeaderboard(10)
      this.leaderboardModal.show(response)
    } catch (error) {
      console.error('Ошибка загрузки лидерборда', error)
      alert('Не удалось загрузить таблицу лидеров')
    }
  }

  private restartGame(): void {
    if (!this.gameEngine || !this.uiElements) return

    this.gameEngine.restart()
    updateLivesDisplay({
      livesElement: this.uiElements.livesElement,
      maxLives: this.gameConfig.maxLives,
      lives: this.gameConfig.maxLives
    })
    this.uiElements.scoreElement.textContent = '0.0'
    this.uiElements.startButton.textContent = 'СТАРТ'
    this.gameOverModal.close()

    this.telemetryEvents = []
  }

  destroy(): void {
    if (this.telemetryIntervalId) {
      clearInterval(this.telemetryIntervalId)
      this.telemetryIntervalId = null
    }

    if (this.telemetryEvents.length > 0 && this.sessionId) {
      this.sendTelemetryNow()
    }

    if (this.gameEngine) {
      this.gameEngine.destroy()
    }
  }
}
