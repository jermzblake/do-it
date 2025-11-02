import axios from 'axios'
import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import type { ApiResponse } from '../../types/api.types'

interface RequestConfig extends Record<string, any> {
  useApiPrefix?: boolean
}

class ApiClient {
  private static instance: ApiClient
  private client: AxiosInstance
  private readonly apiPrefix = '/api'

  private constructor() {
    this.client = axios.create({
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.setupInterceptors()
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient()
    }
    return ApiClient.instance
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Only set withCredentials for requests to our API
        if (config.url?.startsWith(this.apiPrefix)) {
          config.withCredentials = true
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      },
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Validate response schema
        if (this.isValidResponseSchema(response.data)) {
          return response
        }
        return Promise.reject(new Error('Invalid response schema'))
      },
      (error) => {
        if (error.response?.data && this.isValidResponseSchema(error.response.data)) {
          return Promise.reject(error.response.data)
        }
        // If the error response doesn't match our schema, create a standardized error
        return Promise.reject({
          data: null,
          metaData: {
            message: error.message || 'An unexpected error occurred',
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            responseCode: error.response?.status || 500,
          },
          error: {
            code: error.response?.status || 500,
            message: error.message || 'An unexpected error occurred',
            details: error.response?.statusText || '',
          },
        } as ApiResponse<null>)
      },
    )
  }

  private isValidResponseSchema(data: any): data is ApiResponse<unknown> {
    return (
      data &&
      typeof data === 'object' &&
      'data' in data &&
      'metaData' in data &&
      typeof data.metaData === 'object' &&
      'message' in data.metaData &&
      'status' in data.metaData &&
      'timestamp' in data.metaData
    )
  }

  private getFullUrl(url: string, config: RequestConfig = {}): string {
    const { useApiPrefix = true, ...restConfig } = config
    return useApiPrefix ? `${this.apiPrefix}${url}` : url
  }

  // Generic request methods
  async get<T>(url: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const { useApiPrefix, ...axiosConfig } = config
    const fullUrl = this.getFullUrl(url, { useApiPrefix })
    const response = await this.client.get<ApiResponse<T>>(fullUrl, axiosConfig)
    return response.data
  }

  async post<T>(url: string, data?: any, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const { useApiPrefix, ...axiosConfig } = config
    const fullUrl = this.getFullUrl(url, { useApiPrefix })
    const response = await this.client.post<ApiResponse<T>>(fullUrl, data, axiosConfig)
    return response.data
  }

  async put<T>(url: string, data?: any, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const { useApiPrefix, ...axiosConfig } = config
    const fullUrl = this.getFullUrl(url, { useApiPrefix })
    const response = await this.client.put<ApiResponse<T>>(fullUrl, data, axiosConfig)
    return response.data
  }

  async delete<T>(url: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const { useApiPrefix, ...axiosConfig } = config
    const fullUrl = this.getFullUrl(url, { useApiPrefix })
    const response = await this.client.delete<ApiResponse<T>>(fullUrl, axiosConfig)
    return response.data
  }

  async patch<T>(url: string, data?: any, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    const { useApiPrefix, ...axiosConfig } = config
    const fullUrl = this.getFullUrl(url, { useApiPrefix })
    const response = await this.client.patch<ApiResponse<T>>(fullUrl, data, axiosConfig)
    return response.data
  }
}

// Export a singleton instance
export const apiClient = ApiClient.getInstance()
