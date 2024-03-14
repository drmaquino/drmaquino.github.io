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
   *   cantidad: number,
   *   nombre: string,
   *   precioUnitario: number
   * }} arg
   * */
  async agregarNuevo({ nombre, precioUnitario, cantidad }) {
    if (await this.gastosRepository.findByNombre(nombre)) {
      throw new Error('ya existe un gasto con ese nombre')
    }

    const gasto = new Gasto({ nombre, precioUnitario, cantidad })
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

  async obtenerSeleccionados(options = {}) {
    logger.trace('gastos service: obteniendo seleccionados')

    const gastos = await this.gastosRepository.findAll()
    const seleccionados = gastos.filter(g => g.estaSeleccionado)

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

  /** @param {string} idGasto */
  async eliminarPorId(idGasto) {
    return await this.gastosRepository.deleteById(idGasto)
  }

  async eliminarTodos() {
    await this.gastosRepository.deleteAll()
  }
}

