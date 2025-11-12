/**
 * HTTP Client Service
 * Cliente HTTP centralizado con manejo de errores y configuración común
 * Patrón: Singleton, DRY
 * Principio SOLID: Single Responsibility - Sólo maneja comunicación HTTP
 */

import { API_CONFIG } from '../config/api.config';

export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(
    message: string,
    status: number,
    data?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

interface RequestConfig extends RequestInit {
  timeout?: number;
}

class HttpClient {
  private baseURL: string;
  private defaultTimeout: number;

  constructor() {
    this.baseURL = `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}`;
    this.defaultTimeout = API_CONFIG.TIMEOUT;
  }

  /**
   * Maneja la respuesta HTTP
   * @private
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorData = null;

      if (isJson) {
        try {
          errorData = await response.json();
          errorMessage = errorData.mensaje || errorData.message || errorMessage;
        } catch {
          // Si falla el parsing, usar el mensaje por defecto
        }
      }

      throw new ApiError(errorMessage, response.status, errorData);
    }

    if (isJson) {
      return response.json();
    }

    return response.text() as any;
  }

  /**
   * Crea configuración de request con headers comunes
   * @private
   */
  private createConfig(config: RequestConfig = {}): RequestConfig {
    const headers = new Headers(config.headers);

    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    // Agregar token de autenticación si existe
    const token = localStorage.getItem('magneto_auth_token');
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return {
      ...config,
      headers,
    };
  }

  /**
   * Realiza request HTTP con timeout
   * @private
   */
  private async requestWithTimeout<T>(
    url: string,
    config: RequestConfig
  ): Promise<T> {
    const timeout = config.timeout || this.defaultTimeout;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * HTTP GET
   */
  async get<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const requestConfig = this.createConfig({ ...config, method: 'GET' });
    return this.requestWithTimeout<T>(url, requestConfig);
  }

  /**
   * HTTP POST
   */
  async post<T>(
    endpoint: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const requestConfig = this.createConfig({
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.requestWithTimeout<T>(url, requestConfig);
  }

  /**
   * HTTP PUT
   */
  async put<T>(
    endpoint: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const requestConfig = this.createConfig({
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.requestWithTimeout<T>(url, requestConfig);
  }

  /**
   * HTTP PATCH
   */
  async patch<T>(
    endpoint: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const requestConfig = this.createConfig({
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
    return this.requestWithTimeout<T>(url, requestConfig);
  }

  /**
   * HTTP DELETE
   */
  async delete<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const requestConfig = this.createConfig({ ...config, method: 'DELETE' });
    return this.requestWithTimeout<T>(url, requestConfig);
  }
}

// Singleton instance
export const httpClient = new HttpClient();
