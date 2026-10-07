// ponytail: standard HTTP types and interface definitions
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface RequestOptions<TBody = unknown> {
  method?: HttpMethod
  headers?: Record<string, string>
  body?: TBody
  params?: Record<string, string | number | boolean | undefined>
  signal?: AbortSignal
}

export interface ApiErrorResponse {
  error?: string
  message?: string
  statusCode?: number
}

export class ApiError extends Error {
  statusCode: number
  details?: unknown

  constructor(message: string, statusCode: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.details = details
  }
}
