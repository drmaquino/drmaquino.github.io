import { randomId } from '../utils/ids.mjs'
import { ResumenDeudas } from './ResumenDeudas.mjs'
import { Deuda } from './Deuda.mjs'
import { Consumicion } from './Consumicion.mjs'
import { Gasto } from './Gasto.mjs'
import { Persona } from './Persona.mjs'

/** 
 * @typedef {{
 *   id: string
 *   gasto: import('./Gasto.mjs').GastoDto
 *   consumiciones: import('./Consumicion.mjs').ConsumicionDto[]
 *   compartido: boolean
 * }} ItemDto
 */

export class Item {
  /** @type {string} */ id
  /** @type {Gasto} */ gasto
  /** @type {Consumicion[]} */ consumiciones
  /** @type {boolean} */ compartido

  /**
   * @param {{
   *   id?: string
   *   gasto: Gasto
   *   consumiciones?: Consumicion[]
   *   compartido?: boolean
   * }} param0
   */
  constructor({
    id,
    gasto,
    consumiciones,
    compartido
  }) {
    this.id = id || randomId()
    this.gasto = gasto
    this.consumiciones = consumiciones || []
    this.compartido = compartido || false
  }

  /**
   * @param {Persona} persona
   */
  aumentarConsumicion(persona) {
    const consumicion = this.consumiciones.find(c => c.persona.id === persona.id)
    if (!consumicion) {
      this.consumiciones.push(new Consumicion({ persona }))
    } else {
      consumicion.agregarPorcion()
    }
  }

  /**
   * @param {Persona} persona
   */
  reducirConsumicion(persona) {
    const indiceConsumicion = this.consumiciones.findIndex(c => c.persona.id === persona.id)
    if (indiceConsumicion === -1) throw new Error()

    const consumicion = this.consumiciones[indiceConsumicion]
    consumicion.quitarPorcion()
    if (consumicion.noTienePorciones()) {
      this.consumiciones.splice(indiceConsumicion, 1)
    }
  }

  /**
   * @param {string} idPersona
   */
  buscarConsumicion(idPersona) {
    const consumicion = this.consumiciones.find(c => c.persona.id === idPersona)
    return consumicion || null
  }

  eliminarConsumicionesDeUnaPersona(idPersona) {
    this.consumiciones = this.consumiciones.filter(c => c.persona.id !== idPersona)
  }

  eliminarTodasLasConsumiciones() {
    this.consumiciones.length = 0
  }

  compartir() {
    this.compartido = true
  }

  dejarDeCompartir() {
    this.compartido = false
  }

  /**
   * @returns {ResumenDeudas}
   */
  verResumenDeudas() {
    const resumenDeudas = new ResumenDeudas()
    if (this.compartido) {
      const cantPorciones = this.consumiciones.reduce(
        (accum, consumicion) => accum + consumicion.porciones, 0
      )
      for (const consumicion of this.consumiciones) {
        resumenDeudas.add(new Deuda({
          persona: consumicion.persona,
          monto: consumicion.porciones * this.gasto.precio / cantPorciones
        }))
      }
    } else {
      for (const consumicion of this.consumiciones) {
        resumenDeudas.add(new Deuda({
          persona: consumicion.persona,
          monto: consumicion.porciones * this.gasto.precio
        }))
      }
    }
    return resumenDeudas
  }

  /**
   * @returns {ItemDto}
   */
  toPOJO() {
    return {
      id: this.id,
      gasto: this.gasto.toPOJO(),
      consumiciones: this.consumiciones.map(c => c.toPOJO()),
      compartido: this.compartido,
    }
  }

  /**
   * @param {ItemDto} pojo 
   * @returns {Item}
   */
  static fromPOJO(pojo) {
    return new Item({
      id: pojo.id,
      gasto: Gasto.fromPOJO(pojo.gasto),
      consumiciones: pojo.consumiciones.map(c => Consumicion.fromPOJO(c)),
      compartido: pojo.compartido
    })
  }
}
