export interface SessionStartRequest {
  nickname: string
  clientVersion: string
}

export interface SessionStartResponse {
  sessionId: string
  serverTime: number
}

export interface TelemetryEvent {
  t: number
  type: string
  ballId?: string
  kind?: string
  hit?: boolean
}

export interface TelemetryRequest {
  sessionId: string
  events: TelemetryEvent[]
}

export interface TelemetryResponse {
  ok: boolean
}

export interface ScoreRequest {
  sessionId: string
  score: number
}

export interface ScoreResponse {
  rank: number
  best: number
}

export interface LeaderboardEntry {
  nickname: string
  score: number
  when: number
}

export interface LeaderboardResponse {
  items: LeaderboardEntry[]
}

export interface GameConfig {
  maxBalls: number;
  ballChances: {
    normal: number;
    bad: number;
    doublePoints: number;
    bomb: number;
    heal: number;
  };
  maxLives: number;
  bonusDurations: {
    doublePoints: number;
  };
  scores: {
    normal: number;
  };
  ballSpeed: {
    min: number;
    max: number;
  }
}
