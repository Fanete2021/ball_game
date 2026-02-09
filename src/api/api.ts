import axios, { type AxiosInstance, type AxiosResponse } from 'axios'

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL,
  ENDPOINTS: {
    CONFIG: '/config',
    SESSION: '/session',
    EVENTS: '/events',
    SCORE: '/score',
    LEADERBOARD: '/leaderboard',
  },
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
} as const

class HttpClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      headers: API_CONFIG.DEFAULT_HEADERS,
      timeout: 10000,
    })
  }

  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.get(url, { params })
      return response.data
    } catch (error) {
      console.error('GET запрос не удался:', url, error)
      throw error
    }
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.post(url, data)
      return response.data
    } catch (error) {
      console.error('POST запрос не удался:', url, error)
      throw error
    }
  }
}

export const httpClient = new HttpClient()
