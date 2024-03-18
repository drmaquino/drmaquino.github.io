import { Persona } from '../entities/Persona.mjs'
import { Storage } from '../storage/storage.mjs'
import { logger } from '../utils/logger.mjs'

export class PersonasRepository {
  /** @param {Storage} storage */
  constructor(storage) {
    /** @type {Persona[]} */
    this.personas = []
    /** @type {Storage} */
    this.storage = storage
  }

  /**
   * busca una persona por su id
   * @param {string} id
   * @returns la persona buscada
   */
  async findById(id) {
    await this.load()
    return this.personas.find((p) => p.id === id)
  }

  /**
   * busca una persona por su nombre
   * @param {string} nombre
   * @returns la persona buscada
   */
  async findByNombre(nombre) {
    await this.load()
    return this.personas.find(
      (p) => p.nombre.toLowerCase() === nombre.toLowerCase()
    )
  }

  /**
   * devuelve todas las personas
   * @returns todas las personas
   */
  async findAll() {
    logger.trace('personas repository: obteniendo todas')

    await this.load()
    return this.personas
  }

  /**
   * guarda una persona
   * @param {Persona} persona
   * @returns la persona guardada
   */
  async save(persona) {
    await this.load()
    const index = this.personas.findIndex((p) => p.id === persona.id)
    if (index === -1) {
      this.personas.push(persona)
    } else {
      this.personas[index] = persona
    }
    await this.store()
    return persona
  }

  /**
   * elimina la persona con el id dado
   * @param {string} id
   * @return la persona eliminada
   */
  async deleteById(id) {
    await this.load()
    const index = this.personas.findIndex((p) => p.id === id)
    let eliminada = null
    if (index !== -1) {
      ;[eliminada] = this.personas.splice(index, 1)
      await this.store()
    }
    return eliminada
  }

  /**
   * elimina todas las personas
   */
  async deleteAll() {
    this.personas.length = 0
    await this.store()
  }

  /**
   * almacena todos las personas en el storage correspondiente
   * @returns si se pudo almacenar
   */
  async store() {
    await this.storage.write(this.personas.map((p) => p.toPOJO()))
  }

  /**
   * carga desde el storage correspondiente todos las personas en memoria
   * @returns si se pudo cargar
   */
  async load() {
    this.personas.length = 0
    const pojos = await this.storage.read()
    pojos.forEach((pojo) => this.personas.push(new Persona(pojo)))
  }
}
