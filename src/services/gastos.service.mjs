import { GastosRepository } from '../repositories/gastos.repository.mjs'
import { Gasto } from '../entities/Gasto.mjs'
import { by } from '../utils/sorting.mjs'
import { logger } from '../utils/logger.mjs'

export class GastosService {
  /** @param {GastosRepository} gastosRepository */
  constructor(gastosRepository) {
    this.gastosRepository = gastosRepository
  }

  /**
   * @param {{
   *   nombre: string,
   *   precioUnitario: number
   * }} arg
   * */
  async agregarNuevo({ nombre, precioUnitario }) {
    if (await this.gastosRepository.findByNombre(nombre)) {
      throw new Error('ya existe un gasto con ese nombre')
    }

    const gasto = new Gasto({ nombre, precioUnitario })
    await this.gastosRepository.save(gasto)

    return gasto
  }

  async obtenerPorId(idGasto) {
    return await this.gastosRepository.findById(idGasto)
  }

  async obtenerTodos(options = {}) {
    logger.trace('gastos service: obteniendo todos')

    const gastos = await this.gastosRepository.findAll()

    if (options.orderBy) {
      logger.trace('ordenando gastos')
      for (const [field, direction] of Object.entries(options.orderBy).reverse()) {
        logger.debug('ordenando por', { [field]: direction })
        gastos.sort(by(field, direction))
        logger.debug('nuevo orden', gastos.map(g => g.toPOJO()))
      }
    }
    return gastos
  }

  async obtenerHabilitados(options = {}) {
    logger.trace('gastos service: obteniendo habilitados')

    const gastos = await this.gastosRepository.findAll()
    const seleccionados = gastos.filter(g => g.habilitado)

    if (options.orderBy) {
      logger.trace('ordenando gastos')
      for (const [field, direction] of Object.entries(options.orderBy).reverse()) {
        logger.debug('ordenando por', { [field]: direction })
        seleccionados.sort(by(field, direction))
        logger.debug('nuevo orden', seleccionados.map(g => g.toPOJO()))
      }
    }
    return seleccionados
  }

  /**
   * @param {Gasto} gasto
   */
  async guardar(gasto) {
    await this.gastosRepository.save(gasto)
  }

  /**
 * habilita el gasto con el id dado
 * @param {{ idGasto: string }} arg
 * @returns el gasto actualizado
 */
  async habilitarPorId({ idGasto }) {
    const gasto = await this.gastosRepository.findById(idGasto)
    if (gasto) {
      gasto.habilitado = true
      await this.gastosRepository.save(gasto)
    }
    return gasto
  }

  /**
   * deshabilita el gasto con el id dado
   * @param {{ idGasto: string}} arg
   * @returns el gasto actualizado
   */
  async deshabilitarPorId({ idGasto }) {
    const persona = await this.gastosRepository.findById(idGasto)
    if (persona) {
      persona.habilitado = false
      await this.gastosRepository.save(persona)
    }
    return persona
  }

  /** @param {string} idGasto */
  async eliminarPorId(idGasto) {
    return await this.gastosRepository.deleteById(idGasto)
  }

  async eliminarTodos() {
    await this.gastosRepository.deleteAll()
  }
}

