import type {ScoreRequest, ScoreResponse} from "@/types/api.ts";
import {API_CONFIG, httpClient} from "@/api/api.ts";

export const scoreService = {
  async submitScore(sessionId: string, score: number): Promise<ScoreResponse> {
    const request: ScoreRequest = { sessionId, score }
    return await httpClient.post<ScoreResponse>(API_CONFIG.ENDPOINTS.SCORE, request)
  },
}
