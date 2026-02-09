import type {LeaderboardResponse} from "@/types/api.ts";
import {API_CONFIG, httpClient} from "@/api/api.ts";

export const leaderboardService = {
  async getLeaderboard(limit: number = 10): Promise<LeaderboardResponse> {
    const params = limit ? { limit } : undefined
    return await httpClient.get<LeaderboardResponse>(API_CONFIG.ENDPOINTS.LEADERBOARD, params)
  },
}
