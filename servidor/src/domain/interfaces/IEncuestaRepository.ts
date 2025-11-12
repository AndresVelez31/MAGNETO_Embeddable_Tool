/**
 * Encuesta Repository Interface
 * Interfaz que define el contrato para el repositorio de encuestas
 * Principio SOLID: Dependency Inversion - Depender de abstracciones, no de implementaciones
 * Patrón: Repository Pattern
 */

import type { Encuesta } from '../entities/Encuesta.entity';

export interface CreateEncuestaDTO {
  tipoEncuesta: string;
  nombreEncuesta: string;
  empresaRelacionada?: string;
  preguntas?: any[];
}

export interface UpdateEncuestaDTO {
  nombreEncuesta?: string;
  empresaRelacionada?: string;
  preguntas?: any[];
  estado?: string;
}

export interface IEncuestaRepository {
  /**
   * Buscar todas las encuestas
   */
  findAll(): Promise<Encuesta[]>;

  /**
   * Buscar encuesta por ID
   */
  findById(id: string): Promise<Encuesta | null>;

  /**
   * Buscar encuestas por tipo
   */
  findByType(tipo: string): Promise<Encuesta[]>;

  /**
   * Buscar encuestas activas por tipo
   */
  findActiveByType(tipo: string): Promise<Encuesta | null>;

  /**
   * Crear nueva encuesta
   */
  create(data: CreateEncuestaDTO): Promise<Encuesta>;

  /**
   * Actualizar encuesta
   */
  update(id: string, data: UpdateEncuestaDTO): Promise<Encuesta | null>;

  /**
   * Actualizar estado de encuesta
   */
  updateStatus(id: string, estado: string): Promise<Encuesta | null>;

  /**
   * Eliminar encuesta
   */
  delete(id: string): Promise<boolean>;

  /**
   * Contar encuestas por estado
   */
  countByStatus(estado: string): Promise<number>;
}
