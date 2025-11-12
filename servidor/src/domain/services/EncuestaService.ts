/**
 * Encuesta Service
 * Capa de lógica de negocio
 * Principio SOLID: Single Responsibility, Dependency Inversion
 * Patrón: Service Layer
 */

import { IEncuestaRepository, CreateEncuestaDTO, UpdateEncuestaDTO } from '../interfaces/IEncuestaRepository';
import { Encuesta, EncuestaEntity } from '../entities/Encuesta.entity';

export class EncuestaService {
  private repository: IEncuestaRepository;

  constructor(repository: IEncuestaRepository) {
    this.repository = repository;
  }

  /**
   * Obtener todas las encuestas
   */
  async getAllEncuestas(): Promise<Encuesta[]> {
    return await this.repository.findAll();
  }

  /**
   * Obtener encuesta por ID
   */
  async getEncuestaById(id: string): Promise<Encuesta> {
    this.validateId(id);
    
    const encuesta = await this.repository.findById(id);
    if (!encuesta) {
      throw new Error(`Encuesta con ID ${id} no encontrada`);
    }
    
    return encuesta;
  }

  /**
   * Obtener encuesta activa por tipo
   */
  async getActiveEncuestaByType(tipo: string): Promise<Encuesta> {
    if (!tipo || tipo.trim() === '') {
      throw new Error('El tipo de encuesta es requerido');
    }

    const encuesta = await this.repository.findActiveByType(tipo);
    if (!encuesta) {
      throw new Error(`No se encontró encuesta activa del tipo: ${tipo}`);
    }

    return encuesta;
  }

  /**
   * Crear nueva encuesta
   */
  async createEncuesta(data: CreateEncuestaDTO): Promise<Encuesta> {
    // Validaciones de negocio
    this.validateEncuestaData(data);

    // Crear entidad
    const encuestaEntity = new EncuestaEntity({
      tipoEncuesta: data.tipoEncuesta as any,
      nombreEncuesta: data.nombreEncuesta,
      empresaRelacionada: data.empresaRelacionada,
      preguntas: data.preguntas || [],
      estado: 'borrador',
      creadaEn: new Date(),
      ultimaModificacion: new Date(),
    });

    // Persistir
    return await this.repository.create(data);
  }

  /**
   * Actualizar encuesta
   */
  async updateEncuesta(id: string, data: UpdateEncuestaDTO): Promise<Encuesta> {
    this.validateId(id);

    // Verificar que existe
    await this.getEncuestaById(id);

    // Validar datos si se actualizan preguntas
    if (data.preguntas) {
      this.validatePreguntas(data.preguntas);
    }

    const updated = await this.repository.update(id, data);
    if (!updated) {
      throw new Error('Error al actualizar la encuesta');
    }

    return updated;
  }

  /**
   * Cambiar estado de encuesta
   */
  async updateEstadoEncuesta(id: string, estado: string): Promise<Encuesta> {
    this.validateId(id);
    this.validateEstado(estado);

    // Obtener encuesta actual
    const encuesta = await this.getEncuestaById(id);

    // Validar transición de estado
    if (estado === 'activa' && (!encuesta.preguntas || encuesta.preguntas.length === 0)) {
      throw new Error('No se puede activar una encuesta sin preguntas');
    }

    const updated = await this.repository.updateStatus(id, estado);
    if (!updated) {
      throw new Error('Error al actualizar el estado');
    }

    return updated;
  }

  /**
   * Eliminar encuesta
   */
  async deleteEncuesta(id: string): Promise<void> {
    this.validateId(id);

    // Verificar que existe
    await this.getEncuestaById(id);

    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new Error('Error al eliminar la encuesta');
    }
  }

  // ========================================
  // Métodos privados de validación
  // ========================================

  private validateId(id: string): void {
    if (!id || id.trim() === '') {
      throw new Error('El ID de la encuesta es requerido');
    }
  }

  private validateEncuestaData(data: CreateEncuestaDTO): void {
    if (!data.nombreEncuesta || data.nombreEncuesta.trim() === '') {
      throw new Error('El nombre de la encuesta es requerido');
    }

    if (!data.tipoEncuesta || data.tipoEncuesta.trim() === '') {
      throw new Error('El tipo de encuesta es requerido');
    }

    const validTypes = ['application', 'abandonment', 'custom'];
    if (!validTypes.includes(data.tipoEncuesta)) {
      throw new Error(`Tipo de encuesta inválido. Debe ser uno de: ${validTypes.join(', ')}`);
    }

    if (data.preguntas && data.preguntas.length > 0) {
      this.validatePreguntas(data.preguntas);
    }
  }

  private validatePreguntas(preguntas: any[]): void {
    if (!Array.isArray(preguntas)) {
      throw new Error('Las preguntas deben ser un array');
    }

    preguntas.forEach((pregunta, index) => {
      if (!pregunta.textoPregunta || pregunta.textoPregunta.trim() === '') {
        throw new Error(`La pregunta ${index + 1} debe tener texto`);
      }

      const validTypes = ['text', 'rating', 'yesno', 'list', 'multiple'];
      if (!pregunta.tipoPregunta || !validTypes.includes(pregunta.tipoPregunta)) {
        throw new Error(
          `Tipo inválido en pregunta ${index + 1}. Debe ser: ${validTypes.join(', ')}`
        );
      }

      // Validar opciones para tipos list/multiple
      if (['list', 'multiple'].includes(pregunta.tipoPregunta)) {
        if (!pregunta.opciones || !Array.isArray(pregunta.opciones) || pregunta.opciones.length === 0) {
          throw new Error(
            `La pregunta ${index + 1} de tipo ${pregunta.tipoPregunta} requiere opciones`
          );
        }
      }
    });
  }

  private validateEstado(estado: string): void {
    const validStates = ['borrador', 'activa', 'inactiva', 'archivada'];
    if (!validStates.includes(estado)) {
      throw new Error(`Estado inválido. Debe ser uno de: ${validStates.join(', ')}`);
    }
  }
}
