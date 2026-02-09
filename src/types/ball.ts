import type { Graphics } from 'pixi.js'
import type { GameConfig } from "./api.ts";

export type BallType = keyof GameConfig['ballChances'];

export type Ball = {
  gfx: Graphics
  speed: number
  type: BallType
}
