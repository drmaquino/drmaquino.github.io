import { Compra } from '../classes/Compra.mjs'
import { Storage } from '../storages/storage.mjs'

export class ComprasRepository {
  /** @param {Storage} storage */
  constructor(storage) {
    /** @type {Compra[]} */
    this.compras = []
    /** @type {Storage} */
    this.storage = storage
  }

  /**
   * devuelve la última compra guardada
   * @returns {Promise<Compra>}
   */
  async findNewest() {
    await this.#load()
    return this.compras[this.compras.length - 1]
  }

  /**
   * devuelve todas las compras
   * @returns {Promise<Compra[]>}
   */
  async findAll() {
    await this.#load()
    return this.compras
  }

  /**
   * guarda una compra
   * @param {Compra} compra
   */
  async save(compra) {
    await this.#load()
    const index = this.compras.findIndex(c => c.id === compra.id)

    if (index === -1) {
      this.compras.push(compra)
    } else {
      this.compras[index] = compra
    }
    await this.#store()
  }

  /**
   * elimina todas las compras
   * */
  async deleteAll() {
    this.compras.length = 0
    await this.#store()
  }

  /**
   * almacena todas las compras en el storage correspondiente
   * */
  async #store() {
    const comprasDtos = this.compras.map(c => {
      const pojo = c.toPOJO()
      return pojo
    })
    await this.storage.write(comprasDtos)
  }

  /**
   * carga desde el storage correspondiente todas las compras en memoria
   * */
  async #load() {
    this.compras.length = 0
    const pojos = await this.storage.read()
    pojos.forEach((pojo) => this.compras.push(Compra.fromPOJO(pojo)))
  }
}
