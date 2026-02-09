import type {SessionStartRequest, SessionStartResponse} from "@/types/api.ts";
import {API_CONFIG, httpClient} from "@/api/api.ts";

export const sessionService = {
  async createSession(nickname: string, clientVersion: string): Promise<SessionStartResponse> {
    const request: SessionStartRequest = { nickname, clientVersion }
    return await httpClient.post<SessionStartResponse>(API_CONFIG.ENDPOINTS.SESSION, request)
  },
}
