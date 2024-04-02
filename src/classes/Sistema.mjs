import { GastosRepository } from '../repositories/gastos.repository.mjs'
import { PersonasRepository } from '../repositories/personas.repository.mjs'
import { ComprasRepository } from '../repositories/compras.repository.mjs'

import { Compra } from './Compra.mjs'
import { Gasto } from './Gasto.mjs'
import { Persona } from './Persona.mjs'

/** 
 * @typedef {{
 *   id: string
 *   nombre: string
 *   enCompra: boolean
 * }} PersonaViewDto
 */

/** 
 * @typedef {{
*   id: string
*   nombre: string
*   precio: number
*   enCompra: boolean
* }} GastoViewDto
*/

export class Sistema {

  /** @type {PersonasRepository} */ personasRepository
  /** @type {GastosRepository} */ gastosRepository
  /** @type {ComprasRepository} */ comprasRepository
  /** @type {Compra} */ compraEnCurso

  /**
   * @param {{
   *   personasRepository: PersonasRepository
   *   gastosRepository: GastosRepository
   *   comprasRepository: ComprasRepository
   * }} param0 
   */
  constructor({
    personasRepository,
    gastosRepository,
    comprasRepository
  }) {
    this.personasRepository = personasRepository
    this.gastosRepository = gastosRepository
    this.comprasRepository = comprasRepository
  }

  // PERSONAS -----------------------------------------------

  /**
   * @param {import('./Persona.mjs').CreatePersonaDto} datosPersona 
   */
  async agendarPersona(datosPersona) {
    const existe = await this.personasRepository.findByNombre(datosPersona.nombre)
    if (existe) throw new Error('no se puede agendar persona: la persona ya existe')

    const persona = new Persona(datosPersona)
    await this.personasRepository.save(persona)

    this.compraEnCurso.agregarPersona(persona)
    await this.comprasRepository.save(this.compraEnCurso)

    return persona.toPOJO()
  }

  async verPersonas() {
    const personas = await this.personasRepository.findAll()
    return personas.map(p => this.personaToPersonaViewDto(p))
  }

  verPersonasEnCompraEnCurso() {
    return this.compraEnCurso.verPersonas().map(p => p.toPOJO())
  }

  /**
   * @param {string} idPersona 
   * @returns {boolean}
   */
  verSiPersonaEstaEnCompraEnCurso(idPersona) {
    return this.compraEnCurso.verSiContienePersona(idPersona)
  }

  /**
   * @param {string} idPersona 
   */
  async agregarPersonaACompraEnCurso(idPersona) {
    const persona = await this.personasRepository.findById(idPersona)
    if (!persona) throw new Error('no se puede agregar persona a compra: la persona no existe')

    this.compraEnCurso.agregarPersona(persona)
    await this.comprasRepository.save(this.compraEnCurso)
  }

  /**
   * @param {{ idPersona: string, nombre: string }} param0 
   */
  async modificarNombrePersona({ idPersona, nombre }) {

    const persona = await this.personasRepository.findById(idPersona)
    if (!persona) throw new Error('no se puede modificar el nombre de la persona: la persona no existe')

    persona.nombre = nombre
    await this.personasRepository.save(persona)
    await this.quitarPersonaDeCompraEnCurso(idPersona) // TODO: provisorio!!

    // this.compraEnCurso.modificarNombreEnConsumiciones({ idPersona, nombre })
    // await this.comprasRepository.save(this.compraEnCurso)
  }

  /**
   * @param {string} idPersona 
   */
  async quitarPersonaDeCompraEnCurso(idPersona) {
    this.compraEnCurso.quitarPersona(idPersona)
    await this.comprasRepository.save(this.compraEnCurso)
  }

  /**
   * @param {string} idPersona 
   */
  async eliminarPersona(idPersona) {
    const eliminada = await this.personasRepository.deleteById(idPersona)
    if (!eliminada) throw new Error('no se puede eliminar a la persona: la persona no existe')
    await this.quitarPersonaDeCompraEnCurso(idPersona)
  }

  async eliminarTodasLasPersonas() {
    await this.personasRepository.deleteAll()
    this.compraEnCurso.quitarTodasLasPersonas()
    await this.comprasRepository.save(this.compraEnCurso)
  }

  // GASTOS -----------------------------------------------

  /**
   * @param {import('./Gasto.mjs').CreateGastoDto} datosGasto 
   */
  async agendarGasto(datosGasto) {
    const existe = await this.gastosRepository.findByNombre(datosGasto.nombre)
    if (existe) throw new Error('no se puede agendar el gasto: el gasto ya existe')

    const gasto = new Gasto(datosGasto)
    await this.gastosRepository.save(gasto)

    this.compraEnCurso.agregarItem(gasto)
    await this.comprasRepository.save(this.compraEnCurso)

    return gasto.toPOJO()
  }

  async verGastos() {
    const gastos = await this.gastosRepository.findAll()
    return gastos.map(g => this.gastoToGastoViewDto(g))
  }

  /**
   * @param {string} idGasto 
   * @returns {boolean}
   */
  verSiGastoEstaEnCompraEnCurso(idGasto) {
    return this.compraEnCurso.contieneGasto(idGasto)
  }

  /**
   * @param {string} idGasto 
   */
  async agregarGastoACompraEnCurso(idGasto) {
    const gasto = await this.gastosRepository.findById(idGasto)
    if (!gasto) throw new Error('no se puede agregar gasto a compra: el gasto no existe')

    this.compraEnCurso.agregarItem(gasto)
    await this.comprasRepository.save(this.compraEnCurso)
  }

  /**
   * @param {{ idGasto: string, nombre: string }} param0 
   */
  async modificarNombreGasto({ idGasto, nombre }) {

    const gasto = await this.gastosRepository.findById(idGasto)
    if (!gasto) throw new Error('no se puede modificar el nombre del gasto: el gasto no existe')

    gasto.nombre = nombre
    await this.gastosRepository.save(gasto)
    await this.quitarGastoDeCompraEnCurso(idGasto) // TODO: provisorio!!

    // this.compraEnCurso.modificarNombreEnConsumiciones({ idPersona, nombre })
    // await this.comprasRepository.save(this.compraEnCurso)
  }

  /**
   * @param {{ idGasto: string, precio: number }} param0 
   */
  async modificarPrecioGasto({ idGasto, precio }) {
    const gasto = await this.gastosRepository.findById(idGasto)
    if (!gasto) throw new Error('no se puede modificar el precio del gasto: el gasto no existe')

    gasto.precio = precio
    await this.gastosRepository.save(gasto)

    this.compraEnCurso.modificarPrecioUnitarioItem({ idGasto, precio })
    await this.comprasRepository.save(this.compraEnCurso)
  }

  /**
   * @param {string} idGasto 
   */
  async quitarGastoDeCompraEnCurso(idGasto) {
    try {
      this.compraEnCurso.eliminarItem(idGasto)
      await this.comprasRepository.save(this.compraEnCurso)
    } catch (error) {
      // TODO: log something? change method so it doesnt throw..? 
    }
  }

  /**
   * @param {string} idGasto 
   */
  async eliminarGasto(idGasto) {
    const eliminado = await this.gastosRepository.deleteById(idGasto)
    if (!eliminado) throw new Error('no se puede eliminar el gasto: el gasto no existe')
    await this.quitarGastoDeCompraEnCurso(idGasto)
  }

  async eliminarTodosLosGastos() {
    this.compraEnCurso.eliminarTodosLosItems()
    await this.comprasRepository.save(this.compraEnCurso)

    await this.gastosRepository.deleteAll()
  }

  // ITEMS DE LA COMPRA EN CURSO ---------------------------------

  /**
   * @param {string} idGasto 
   */
  async marcarGastoEnCompraComoCompartido(idGasto) {
    this.compraEnCurso.marcarItemComoCompartido(idGasto)
    await this.comprasRepository.save(this.compraEnCurso)
  }

  /**
   * @param {string} idGasto 
   */
  async marcarGastoEnCompraComoNoCompartido(idGasto) {
    this.compraEnCurso.marcarItemComoNoCompartido(idGasto)
    await this.comprasRepository.save(this.compraEnCurso)
  }

  /**
   * @param {string} idGasto 
   */
  async dividirGastoEnCompraEnPartesIguales(idGasto) {
    this.compraEnCurso.dividirGastoEnPartesIguales(idGasto)
    await this.comprasRepository.save(this.compraEnCurso)
  }

  /**
   * @param {string} idGasto 
   */
  async dejarDeDividirGastoEnCompraEnPartesIguales(idGasto) {
    this.compraEnCurso.dejarDeDividirGastoEnPartesIguales(idGasto)
    await this.comprasRepository.save(this.compraEnCurso)
  }

  // CONSUMICIONES

  /**
   * @param {import('./Compra.mjs').EditarConsumicionDto} consumicion 
   */
  async aumentarConsumicion(consumicion) {
    this.compraEnCurso.aumentarConsumicion(consumicion)
    await this.comprasRepository.save(this.compraEnCurso)
  }

  /**
   * @param {import('./Compra.mjs').EditarConsumicionDto} consumicion 
   */
  async reducirConsumicion(consumicion) {
    this.compraEnCurso.reducirConsumicion(consumicion)
    await this.comprasRepository.save(this.compraEnCurso)
  }

  // COMPRAS --------------------------------------------------------

  //TODO: usar
  async verCompras() {
    const compras = await this.comprasRepository.findAll()
    return compras.map(c => c.toPOJO())
  }

  //TODO: usar
  verCompraEnCurso() {
    return this.compraEnCurso.toPOJO()
  }

  verItemsCompraEnCurso() {
    return this.compraEnCurso.verItems().map(i => i.toPOJO())
  }

  verDeudasCompraEnCurso() {
    return this.compraEnCurso.verResumenDeudas().toArray().map(d => d.toPOJO())
  }

  async init() {
    this.compraEnCurso = await this.comprasRepository.findNewest()
    if (!this.compraEnCurso) {
      this.compraEnCurso = new Compra()
      await this.comprasRepository.save(this.compraEnCurso)
    }
  }

  //TODO: usar
  async cerrarCompra() {
    await this.comprasRepository.save(this.compraEnCurso)
    this.compraEnCurso = new Compra()
  }

  //TODO: usar
  async eliminarTodasLasCompras() {
    await this.comprasRepository.deleteAll()
  }

  // ADMIN --------------------------------------------

  //TODO: usar
  async reiniciar() {
    await this.eliminarTodasLasPersonas()
    await this.eliminarTodosLosGastos()
    await this.eliminarTodasLasCompras()
    this.compraEnCurso = new Compra()
  }

  // UTILS ---------------------------------------------

  /**
   * @param {Persona} persona 
   * @returns {PersonaViewDto}
   */
  personaToPersonaViewDto(persona) {
    return {
      id: persona.id,
      nombre: persona.nombre,
      enCompra: this.verSiPersonaEstaEnCompraEnCurso(persona.id)
    }
  }

  /**
   * @param {Gasto} gasto 
   * @returns {GastoViewDto}
   */
  gastoToGastoViewDto(gasto) {
    return {
      id: gasto.id,
      nombre: gasto.nombre,
      precio: gasto.precio,
      enCompra: this.verSiGastoEstaEnCompraEnCurso(gasto.id)
    }
  }
}
