import { PersonasRepository } from '../repositories/personas.repository.mjs'
import { Persona } from '../entities/Persona.mjs'
import { by } from '../utils/sorting.mjs'
import { logger } from '../utils/logger.mjs'

export class PersonasService {
  /** @param {PersonasRepository} personasRepository */
  constructor(personasRepository) {
    this.personasRepository = personasRepository
  }

  /**
   * @param {{
   *   nombre: string,
   *   deuda?: number,
   *   habilitada?: boolean
   * }} arg
   * */
  async agregarPersona({ nombre, deuda, habilitada }) {
    if (await this.personasRepository.findByNombre(nombre)) {
      throw new Error('ya existe una persona con ese nombre')
    }
    const persona = new Persona({ nombre, deuda, habilitada })
    await this.personasRepository.save(persona)

    return persona
  }

  async obtenerHabilitadas(options = {}) {
    logger.trace('personas service: obteniendo habilitadas')

    const personas = await this.personasRepository.findAll()
    const habilitadas = personas.filter((p) => p.habilitada)

    if (options.orderBy) {
      logger.trace('ordenando personas')
      for (const [field, direction] of Object.entries(options.orderBy).reverse()) {
        logger.debug('ordenando por', { [field]: direction })
        habilitadas.sort(by(field, direction))
        logger.debug('nuevo orden', habilitadas.map(p => p.toPOJO()))
      }
    }
    return habilitadas
  }

  async obtenerTodas(options = {}) {
    logger.trace('personas service: obteniendo todas')

    const personas = await this.personasRepository.findAll()

    if (options.orderBy) {
      logger.trace('ordenando personas')
      for (const [field, direction] of Object.entries(options.orderBy).reverse()) {
        logger.debug('ordenando por', { [field]: direction })
        personas.sort(by(field, direction))
        logger.debug('nuevo orden', personas.map(p => p.toPOJO()))
      }
    }
    return personas
  }

  /**
   * elimina la deuda de la persona con el id dado
   * @param {string} id
   * @returns la persona actualizada
   */
  async eliminarDeuda(id) {
    const persona = await this.personasRepository.findById(id)
    if (persona) {
      persona.deuda = 0
      await this.personasRepository.save(persona)
    }
    return persona
  }

  /**
   * incrementa la deuda de la persona con el id dado
   * @param {string} id
   * @param {number} incremento
   * @returns la persona actualizada
   */
  async incrementarDeuda(id, incremento) {
    const persona = await this.personasRepository.findById(id)
    if (persona) {
      persona.deuda += incremento
      await this.personasRepository.save(persona)
    }
    return persona
  }

  /**
   * habilita a la persona con el id dado
   * @param {{ idPersona: string }} arg
   * @returns la persona actualizada
   */
  async habilitarPorId({ idPersona }) {
    const persona = await this.personasRepository.findById(idPersona)
    if (persona) {
      persona.habilitada = true
      await this.personasRepository.save(persona)
    }
    return persona
  }

  /**
   * deshabilita a la persona con el id dado
   * @param {{ idPersona: string}} arg
   * @returns la persona actualizada
   */
  async deshabilitarPorId({ idPersona }) {
    const persona = await this.personasRepository.findById(idPersona)
    if (persona) {
      persona.habilitada = false
      await this.personasRepository.save(persona)
    }
    return persona
  }

  /** @param {{ idPersona: string }} arg */
  async eliminarPersona({ idPersona }) {
    return await this.personasRepository.deleteById(idPersona)
  }

  async eliminarTodas() {
    await this.personasRepository.deleteAll()
  }
}
