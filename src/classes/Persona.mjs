import { randomId } from '../utils/ids.mjs'

/**
 * @typedef {{ 
 *   id: string,
 *   nombre: string
 * }} PersonaDto 
 */

/** @typedef {Omit<PersonaDto, 'id'> & { id?: string }} CreatePersonaDto */

export class Persona {
  /**
   * @param {CreatePersonaDto} param0
   */
  constructor({
    id,
    nombre,
  }) {
    this.id = id || randomId()
    this.nombre = nombre
  }

  /**
   * @returns {PersonaDto}
   */
  toPOJO() {
    return {
      id: this.id,
      nombre: this.nombre,
    }
  }

  /**
   * @param {PersonaDto} pojo 
   * @returns {Persona}
   */
  static fromPOJO(pojo) {
    return new Persona(pojo)
  }
}
