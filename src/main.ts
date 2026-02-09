import './style.scss'
import { GameManager } from "@/game/gameManager.ts";

const canvasContainer = document.getElementById('canvas-container')!

const clientVersion = import.meta.env.VITE_CLIENT_VERSION
const telemetryInterval = parseInt(import.meta.env.VITE_TELEMETRY_INTERVAL)
const maxEventsPerRequest = parseInt(import.meta.env.VITE_MAX_EVENTS_PER_REQUEST)

const gameManager = new GameManager(
  canvasContainer,
  clientVersion,
  telemetryInterval,
  maxEventsPerRequest
)

gameManager.initialize().catch(console.error)

window.addEventListener('beforeunload', () => {
  gameManager.destroy()
})
