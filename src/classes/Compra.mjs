import { randomId } from '../utils/ids.mjs'
import { Persona } from './Persona.mjs'
import { Gasto } from './Gasto.mjs'
import { Item } from './Item.mjs'
import { ResumenDeudas } from './ResumenDeudas.mjs'

/** 
 * @typedef {{
 *   id: string;
 *   personas: import('./Persona.mjs').PersonaDto[];
 *   items: import('./Item.mjs').ItemDto[];
 * }} CompraDto
 */

/**
 * @typedef {{
*   idPersona: string
*   idGasto: string
* }} EditarConsumicionDto
*/

export class Compra {
    /** @type {string}*/ id
    /** @type {Persona[]}*/ personas
    /** @type {Item[]}*/ items

  /**
   * @param {{
   *   id?: string
   *   personas?: Persona[]
   *   items?: Item[]
   * }} param0
   */
  constructor({
    id,
    personas,
    items
  } = {}) {
    this.id = id || randomId()
    this.personas = personas || []
    this.items = items || []
  }

  // PERSONAS

  /**
   * @param {Persona} persona
   */
  agregarPersona(persona) {
    const existe = this.personas.find(p => p.id === persona.id)
    if (existe) throw new Error('no se puede agregar la persona a la compra: la persona ya existe')
    this.personas.push(persona)
  }

  verPersonas() {
    return this.personas
  }

  /**
   * @param {string} idPersona 
   * @returns {boolean}
   */
  verSiContienePersona(idPersona) {
    return this.personas.some(p => p.id === idPersona)
  }

  /**
   * @param {string} idPersona 
   */
  quitarPersona(idPersona) {
    const indicePersona = this.personas.findIndex(p => p.id === idPersona)
    if (indicePersona === -1) throw new Error('no se puede quitar la persona de la compra: la persona no existe')

    this.eliminarConsumicionesDeUnaPersona(idPersona)
    this.personas.splice(indicePersona, 1)
  }

  quitarTodasLasPersonas() {
    this.eliminarTodasLasConsumiciones()
    this.personas.length = 0
  }

  // ITEMS

  /**
   * @param {Gasto} gasto
   */
  agregarItem(gasto) {
    const item = this.items.find(i => i.gasto.id === gasto.id)
    if (item) throw new Error('no se puede agregar el item a la compra: el item ya existe')

    const nuevoItem = new Item({ gasto })
    this.items.push(nuevoItem)

    return nuevoItem
  }

  verItems() {
    return this.items
  }

  /**
   * @param {string} idGasto 
   * @returns {boolean}
   */
  contieneGasto(idGasto) {
    return this.items.some(i => i.gasto.id === idGasto)
  }

  /**
   * @param {{ idGasto: string, precio: number }} param0
   */
  modificarPrecioUnitarioItem({ idGasto, precio }) {
    const item = this.items.find(i => i.gasto.id === idGasto)
    if (!item) throw new Error('no se puede modificar el precio del item: el item no existe')

    item.gasto.precio = precio
  }

  /**
   * @param {string} idGasto
   */
  marcarItemComoCompartido(idGasto) {
    const item = this.items.find(i => i.gasto.id === idGasto)
    if (!item) throw new Error('no se puede compartir el item: el item no existe')

    item.compartir()
  }

  /**
   * @param {string} idGasto
   */
  marcarItemComoNoCompartido(idGasto) {
    const item = this.items.find(i => i.gasto.id === idGasto)
    if (!item) throw new Error('no se puede dejar de compartir el item: el item no existe')

    item.dejarDeCompartir()
  }

  /**
   * @param {string} idGasto
   */
  eliminarItem(idGasto) {
    const indiceItem = this.items.findIndex(i => i.gasto.id === idGasto)
    if (indiceItem === -1) throw new Error('no se puede eliminar el item: el item no existe')

    const [eliminado] = this.items.splice(indiceItem, 1)
    return eliminado
  }

  eliminarTodosLosItems() {
    this.items.length = 0
  }

  //  CONSUMICIONES

  /**
   * @param {EditarConsumicionDto} param0
   */
  aumentarConsumicion({ idPersona, idGasto }) {
    const persona = this.personas.find(p => p.id === idPersona)
    if (!persona) throw new Error('no se puede agregar consumicion: la persona no existe')

    const item = this.items.find(i => i.gasto.id === idGasto)
    if (!item) throw new Error('no se puede agregar consumicion: el item no existe')

    item.aumentarConsumicion(persona)
  }

  /**
   * @param {EditarConsumicionDto} param0
   */
  reducirConsumicion({ idPersona, idGasto }) {
    const persona = this.personas.find(p => p.id === idPersona)
    if (!persona) throw new Error('no se puede eliminar consumicion: la persona no existe')

    const item = this.items.find(i => i.gasto.id === idGasto)
    if (!item) throw new Error('no se puede eliminar consumicion: la persona no existe')

    item.reducirConsumicion(persona)
  }

  /**
   * @param {string} idPersona
   */
  eliminarConsumicionesDeUnaPersona(idPersona) {
    for (const item of this.items) {
      item.eliminarConsumicionesDeUnaPersona(idPersona)
    }
  }

  eliminarTodasLasConsumiciones() {
    for (const item of this.items) {
      item.eliminarTodasLasConsumiciones()
    }
  }

  /** @returns {ResumenDeudas} */
  verResumenDeudas() {
    let resumenDeudas = new ResumenDeudas()
    for (const item of this.items) {
      resumenDeudas = resumenDeudas.merge(item.verResumenDeudas())
    }
    return resumenDeudas
  }

  /**
   * @returns {CompraDto}
   */
  toPOJO() {
    return {
      id: this.id,
      personas: this.personas.map(p => p.toPOJO()),
      items: this.items.map(i => i.toPOJO()),
    }
  }

  /**
   * @param {CompraDto} pojo 
   * @returns {Compra} 
   */
  static fromPOJO(pojo) {
    return new Compra({
      id: pojo.id,
      personas: pojo.personas.map(p => Persona.fromPOJO(p)),
      items: pojo.items.map(i => Item.fromPOJO(i))
    })
  }
}
