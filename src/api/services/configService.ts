import {API_CONFIG, httpClient} from "@/api/api.ts";
import type {GameConfig} from "@/types/api.ts";

export const configService = {
  async getConfig(): Promise<GameConfig> {
    return await httpClient.get<GameConfig>(API_CONFIG.ENDPOINTS.CONFIG)
  },
}
