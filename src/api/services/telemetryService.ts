import type {TelemetryEvent, TelemetryRequest, TelemetryResponse} from "@/types/api.ts";
import {API_CONFIG, httpClient} from "@/api/api.ts";

export const telemetryService = {
  async sendEvents(props: { sessionId: string, events: TelemetryEvent[] }): Promise<TelemetryResponse> {
    const { sessionId, events } = props;
    const request: TelemetryRequest = { sessionId, events }
    return await httpClient.post<TelemetryResponse>(API_CONFIG.ENDPOINTS.EVENTS, request)
  },
}
