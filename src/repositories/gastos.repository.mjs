import { Gasto } from '../entities/Gasto.mjs'
import { Storage } from '../storage/storage.mjs'
import { logger } from '../utils/logger.mjs'

export class GastosRepository {
  /** @param {Storage} storage */
  constructor(storage) {
    /** @type {Gasto[]} */
    this.gastos = []
    /** @type {Storage} */
    this.storage = storage
  }

  /**
   * busca un gasto por su id
   * @param {string} id
   * @returns el gasto buscado
   */
  async findById(id) {
    await this.load()
    return this.gastos.find((g) => g.id === id)
  }

  /**
   * busca un gasto por su nombre
   * @param {string} nombre
   * @returns el gasto buscado
   */
  async findByNombre(nombre) {
    await this.load()
    return this.gastos.find(
      (g) => g.nombre.toLowerCase() === nombre.toLowerCase()
    )
  }

  /**
   * devuelve todos los gastos
   * @returns todos los gastos
   */
  async findAll() {
    logger.trace('gastos repository: obteniendo todos')

    await this.load()
    return this.gastos
  }

  /**
   * guarda un gasto
   * @param {Gasto} gasto
   * @returns el gasto guardado
   */
  async save(gasto) {
    await this.load()
    const index = this.gastos.findIndex((g) => g.id === gasto.id)
    if (index === -1) {
      this.gastos.push(gasto)
    } else {
      this.gastos[index] = gasto
    }
    await this.store()
    return gasto
  }

  /**
   * elimina el gasto con el id dado
   * @param {string} id
   * @returns el gasto actualizado
   */
  async deleteById(id) {
    await this.load()
    const index = this.gastos.findIndex((p) => p.id === id)
    let eliminado = null
    if (index !== -1) {
      ;[eliminado] = this.gastos.splice(index, 1)
      await this.store()
    }
    return eliminado
  }

  /**
   * elimina todos los gastos
   */
  async deleteAll() {
    this.gastos.length = 0
    await this.store()
  }

  /**
   * almacena todos los gastos en el storage correspondiente
   * @returns si se pudo almacenar
   * */
  async store() {
    await this.storage.write(this.gastos.map((g) => g.toPOJO()))
  }

  /**
   * carga desde el storage correspondiente todos los gastos en memoria
   * @returns si se pudo cargar
   * */
  async load() {
    this.gastos.length = 0
    const pojos = await this.storage.read()
    pojos.forEach((pojo) => this.gastos.push(new Gasto(pojo)))
  }
}
