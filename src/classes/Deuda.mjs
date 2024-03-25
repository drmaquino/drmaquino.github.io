import { Persona } from './Persona.mjs'

/** 
 * @typedef {{
 *   persona: import('./Persona.mjs').PersonaDto
 *   monto: number;
 * }} DeudaDto
 */

export class Deuda {
  /**
   * @param {{
   *   persona: Persona
   *   monto: number
   * }} param0
   */
  constructor({
    persona, monto }) {
    this.persona = persona
    this.monto = monto
  }

  /**
   * @returns {DeudaDto}
   */
  toPOJO() {
    return {
      persona: this.persona.toPOJO(),
      monto: this.monto
    }
  }

  /**
   * @param {DeudaDto} pojo 
   * @returns {Deuda} 
   */
  static fromPOJO(pojo) {
    return new Deuda({
      persona: Persona.fromPOJO(pojo.persona),
      monto: pojo.monto
    })
  }
}
