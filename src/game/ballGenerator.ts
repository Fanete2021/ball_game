import { Graphics, Text } from 'pixi.js'
import {type Ball, type BallType} from '../types/ball'
import {
  BALL_RADIUS,
  BALL_COLORS,
  BALL_ICONS,
} from '../constants/ball'
import type {GameConfig} from "@/types/api.ts";

//Перебираем ключи у объекта и суммируем до шанса
const getRandomBallType = (props: { gameConfig: GameConfig }): BallType => {
  const { gameConfig } = props;
  const random = Math.random() * 100
  let accumulatedChance = 0

  const ballTypes = Object.entries(gameConfig.ballChances) as Array<[BallType, number]>

  for (const [type, chance] of ballTypes) {
    accumulatedChance += chance * 100
    if (random < accumulatedChance) {
      return type
    }
  }
  return "normal"
}

export const createBall = (
  props: { widthContainer: number; heightContainer: number, gameConfig: GameConfig }
): Ball => {
  const { heightContainer, widthContainer, gameConfig } = props

  const type = getRandomBallType({ gameConfig })
  const color = BALL_COLORS[type]
  const icon = BALL_ICONS[type]

  const x = BALL_RADIUS + Math.random() * (widthContainer - BALL_RADIUS * 2)
  const y = heightContainer + BALL_RADIUS + Math.random() * heightContainer
  const { min: ballMinSpeed, max: ballMaxSpeed } = gameConfig.ballSpeed;
  const speed = ballMinSpeed + Math.random() * (ballMaxSpeed - ballMinSpeed)

  const gfx = new Graphics()
  gfx.circle(0, 0, BALL_RADIUS).fill({ color })

  if (icon) {
    const iconText = new Text({
      text: icon,
      style: {
        fontSize: BALL_RADIUS * 1.2,
        align: 'center',
      },
    })
    iconText.anchor.set(0.5)
    iconText.x = 0
    iconText.y = 0
    gfx.addChild(iconText)
  }

  gfx.x = x
  gfx.y = y

  return { gfx, speed, type }
}
