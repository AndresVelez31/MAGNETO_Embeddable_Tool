import type { Encuesta, CrearEncuestaRequest, ActualizarEstadoRequest } from '../types/encuesta';

const API_BASE_URL = 'http://localhost:3000/api';

class EncuestaService {
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        const error = await response.json();
        throw new Error(error.mensaje || `HTTP ${response.status}: ${response.statusText}`);
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }
    return response.json();
  }

  async obtenerEncuestas(): Promise<Encuesta[]> {
    const response = await fetch(`${API_BASE_URL}/encuestas`);
    return this.handleResponse<Encuesta[]>(response);
  }

  async obtenerEncuesta(id: string): Promise<Encuesta> {
    const response = await fetch(`${API_BASE_URL}/encuestas/${id}`);
    return this.handleResponse<Encuesta>(response);
  }

  async crearEncuesta(encuesta: CrearEncuestaRequest): Promise<Encuesta> {
    console.log('Enviando encuesta al servidor:', encuesta);
    try {
      const response = await fetch(`${API_BASE_URL}/encuestas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(encuesta),
      });
      console.log('Respuesta del servidor:', response.status, response.statusText);
      return this.handleResponse<Encuesta>(response);
    } catch (error) {
      console.error('Error en crearEncuesta:', error);
      throw error;
    }
  }

  async actualizarEncuesta(id: string, encuesta: Partial<Encuesta>): Promise<Encuesta> {
    const response = await fetch(`${API_BASE_URL}/encuestas/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(encuesta),
    });
    return this.handleResponse<Encuesta>(response);
  }

  async cambiarEstadoEncuesta(id: string, estado: ActualizarEstadoRequest): Promise<Encuesta> {
    const response = await fetch(`${API_BASE_URL}/encuestas/${id}/estado`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(estado),
    });
    return this.handleResponse<Encuesta>(response);
  }

  async eliminarEncuesta(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/encuestas/${id}`, {
      method: 'DELETE',
    });
    await this.handleResponse<{ mensaje: string }>(response);
  }
}

export const encuestaService = new EncuestaService();