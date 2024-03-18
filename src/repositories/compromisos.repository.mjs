import { Compromiso } from '../entities/Compromiso.mjs'
import { Storage } from '../storage/storage.mjs'

export class CompromisosRepository {
  /** @param {Storage} storage */
  constructor(storage) {
    /** @type {Compromiso[]} */
    this.compromisos = []
    /** @type {Storage} */
    this.storage = storage
  }

  /**
   * busca un compromiso por sus ids de gasto y persona
   * @param {{
   *   idGasto: string,
   *   idPersona: string
   * }} arg
   * @returns el compromiso buscado
   */
  async findByIds({ idGasto, idPersona }) {
    await this.load()
    const result = this.compromisos.find(
      (c) => c.idGasto === idGasto && c.idPersona === idPersona
    )
    return result
  }

  /**
   * devuelve todos los compromisos
   * @returns todos los compromisos
   */
  async findAll() {
    await this.load()
    return this.compromisos
  }

  /**
   * guarda un compromiso
   * @param {Compromiso} compromiso
   * @returns el compromiso guardado
   */
  async save(compromiso) {
    await this.load()
    const index = this.compromisos.findIndex((c) => {
      return (
        c.idGasto === compromiso.idGasto && c.idPersona === compromiso.idPersona
      )
    })
    if (index === -1) {
      this.compromisos.push(compromiso)
    } else {
      this.compromisos[index] = compromiso
    }
    await this.store()
    return compromiso
  }

  /**
   * incrementa en uno la cantidad de porciones
   * de gasto asociadas a la persona comprometida
   * @param {string} id
   * @returns el compromiso actualizado
   */
  async incrementarPorcionesById(id) {
    await this.load()
    const buscado = this.compromisos.find((c) => c.id === id)
    if (buscado) {
      buscado.porciones++
      await this.store()
    }
    return buscado
  }

  /**
   * decrementa en uno la cantidad de porciones
   * de gasto asociadas a la persona comprometida
   * @param {string} id
   * @returns el compromiso actualizado
   */
  async decrementarPorcionesById(id) {
    await this.load()
    const buscado = this.compromisos.find((c) => c.id === id)
    if (buscado) {
      buscado.porciones--
      await this.store()
    }
    return buscado
  }

  /**
   * deshace todos los compromisos entre personas y gastos
   * @returns los compromisos actualizados
   */
  async desmarcarAll() {
    await this.load()
    for (const compromiso of this.compromisos) {
      compromiso.porciones = 0
    }
    await this.store()
    return this.compromisos
  }

  /**
   * elimina todos los compromisos sobre la persona dada
   * @param {string} idPersona
   * @returns los compromisos eliminados
   * */
  async deleteByIdPersona(idPersona) {
    await this.load()
    const eliminados = []
    for (let ic = this.compromisos.length - 1; ic >= 0; ic--) {
      if (this.compromisos[ic]?.idPersona === idPersona) {
        eliminados.unshift(...this.compromisos.splice(ic, 1))
      }
    }
    await this.store()
    return eliminados
  }

  /**
   * elimina todos los compromisos sobre el gasto dado
   * @param {string} idGasto
   * @returns los compromisos eliminados
   * */
  async deleteByIdGasto(idGasto) {
    await this.load()
    const eliminados = []
    for (let ic = this.compromisos.length - 1; ic >= 0; ic--) {
      if (this.compromisos[ic].idGasto === idGasto) {
        eliminados.unshift(...this.compromisos.splice(ic, 1))
      }
    }
    await this.store()
    return eliminados
  }

  /**
   * elimina todos los compromisos
   * */
  async deleteAll() {
    this.compromisos.length = 0
    await this.store()
  }

  /**
   * almacena todos los gastos en el storage correspondiente
   * @returns si se pudo almacenar
   * */
  async store() {
    await this.storage.write(this.compromisos.map((c) => c.toPOJO()))
  }

  /**
   * carga desde el storage correspondiente todos los gastos en memoria
   * @returns si se pudo cargar
   * */
  async load() {
    this.compromisos.length = 0
    const pojos = await this.storage.read()
    pojos.forEach((pojo) => this.compromisos.push(new Compromiso(pojo)))
  }
}
