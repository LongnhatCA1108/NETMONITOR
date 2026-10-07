// ponytail: standard extensible BaseApi class with native fetch
import { ApiError, type RequestOptions } from './types'

export class BaseApi {
  protected readonly baseUrl: string

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  protected buildUrl(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    let url = `${this.baseUrl}${cleanEndpoint}`

    if (params) {
      const searchParams = new URLSearchParams()
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      }
      const queryString = searchParams.toString()
      if (queryString) {
        url += `${url.includes('?') ? '&' : '?'}${queryString}`
      }
    }

    return url
  }

  async request<TResponse, TBody = unknown>(
    endpoint: string,
    options: RequestOptions<TBody> = {}
  ): Promise<TResponse> {
    const { method = 'GET', headers = {}, body, params, signal } = options
    const url = this.buildUrl(endpoint, params)

    const requestHeaders: Record<string, string> = {
      Accept: 'application/json',
      ...headers,
    }

    let requestBody: string | undefined
    if (body !== undefined && body !== null) {
      requestHeaders['Content-Type'] = 'application/json'
      requestBody = JSON.stringify(body)
    }

    try {
      const res = await fetch(url, {
        method,
        headers: requestHeaders,
        body: requestBody,
        signal,
      })

      let data: any
      const contentType = res.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        data = await res.json().catch(() => null)
      } else {
        const text = await res.text()
        data = text ? { message: text } : null
      }

      if (!res.ok) {
        const errorMessage = data?.error || data?.message || `HTTP ${res.status}: ${res.statusText}`
        throw new ApiError(errorMessage, res.status, data)
      }

      return data as TResponse
    } catch (err: any) {
      if (err instanceof ApiError) throw err
      throw new ApiError(err?.message || 'Lỗi kết nối mạng', 0, err)
    }
  }

  get<TResponse>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<TResponse> {
    return this.request<TResponse>(endpoint, { ...options, method: 'GET' })
  }

  post<TResponse, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: Omit<RequestOptions<TBody>, 'method' | 'body'>
  ): Promise<TResponse> {
    return this.request<TResponse, TBody>(endpoint, { ...options, method: 'POST', body })
  }

  put<TResponse, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: Omit<RequestOptions<TBody>, 'method' | 'body'>
  ): Promise<TResponse> {
    return this.request<TResponse, TBody>(endpoint, { ...options, method: 'PUT', body })
  }

  patch<TResponse, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    options?: Omit<RequestOptions<TBody>, 'method' | 'body'>
  ): Promise<TResponse> {
    return this.request<TResponse, TBody>(endpoint, { ...options, method: 'PATCH', body })
  }

  delete<TResponse>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<TResponse> {
    return this.request<TResponse>(endpoint, { ...options, method: 'DELETE' })
  }
}

export const baseApi = new BaseApi('/api')
