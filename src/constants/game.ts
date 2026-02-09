import type {GameConfig} from "@/types/api.ts";

export type GameStatus = 'idle' | 'running' | 'gameOver'

export enum START_BUTTON_TEXTS {
  START = 'СТАРТ',
  PAUSE = 'ПАУЗА',
  RESTART = 'РЕСТАРТ',
}

export const initGameConfig: GameConfig = {
  maxBalls: 10,
  ballChances: {
    normal: 0.5,
    bad: 0.41,
    doublePoints: 0.03,
    bomb: 0.03,
    heal: 0.03
  },
  maxLives: 3,
  bonusDurations: {
    doublePoints: 10
  },
  scores: {
    normal: 1
  },
  ballSpeed: {
    min: 0.8,
    max: 1.5
  }
}
