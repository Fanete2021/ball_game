import type { BallType } from '../types/ball'

export const BALL_RADIUS = 30
export const BALL_RESPAWN_OFFSET = -50 // Позиция для пересоздания шарика (когда уходит за верх экрана)

export const BALL_COLORS: Record<BallType, number> = {
  normal: 0xffffff,
  bad: 0xff0000,
  doublePoints: 0x00ff00,
  bomb: 0xffa500,
  heal: 0x00ffff,
}

export const BALL_ICONS: Record<BallType, string> = {
  normal: '',
  bad: '',
  doublePoints: '⚡',
  bomb: '💣',
  heal: '💚',
}
