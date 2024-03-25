import { randomId } from '../utils/ids.mjs'
import { Persona } from './Persona.mjs'

/**
 * @typedef {{
 *   id: string
 *   persona: import('./Persona.mjs').PersonaDto
 *   porciones: number
 * }} ConsumicionDto
 */

export class Consumicion {
  /**
   * @param {{
   *   id?: string
   *   persona: Persona
   *   porciones?: number
   * }} param0
   */
  constructor({
    id,
    persona,
    porciones,
  }) {
    this.id = id || randomId()
    this.persona = persona
    this.porciones = porciones || 1
  }

  agregarPorcion() {
    this.porciones++
  }

  quitarPorcion() {
    this.porciones--
  }

  noTienePorciones() {
    return this.porciones === 0
  }

  /**
   * @returns {ConsumicionDto}
   */
  toPOJO() {
    return {
      id: this.id,
      persona: this.persona.toPOJO(),
      porciones: this.porciones,
    }
  }

  /**
   * @param {ConsumicionDto} pojo 
   */
  static fromPOJO(pojo) {
    return new Consumicion({
      id: pojo.id,
      persona: Persona.fromPOJO(pojo.persona),
      porciones: pojo.porciones,
    })
  }
}
