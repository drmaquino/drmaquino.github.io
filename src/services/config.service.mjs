import { ConfigRepository } from '../repositories/config.repository.mjs'
import { logger } from '../utils/logger.mjs'

const PERSONAS_ORDER_KEY = 'personas-order'
const PERSONAS_DEFAULT_ORDER = { habilitada: -1, nombre: 1 }
const PERSONAS_VALID_ORDER_FIELDS = ['nombre', 'deuda', 'habilitada']

const GASTOS_ORDER_KEY = 'gastos-order'
const GASTOS_DEFAULT_ORDER = { estaSeleccionado: -1, nombre: 1 }
const GASTOS_VALID_ORDER_FIELDS = ['nombre', 'precioUnitario', 'cantidad']

export class ConfigService {
  /** @param {ConfigRepository} configRepository  */
  constructor(configRepository) {
    this.configRepository = configRepository
  }

  async getPersonasOrderCriteria() {
    logger.trace('obteniendo criterio de orden de personas')

    const criteria = await this.configRepository.getOrDefault(PERSONAS_ORDER_KEY, PERSONAS_DEFAULT_ORDER)

    logger.debug('output', criteria)
    return criteria
  }

  async setPersonasOrderCriteria(criteria) {
    logger.trace('modificando criterio de orden de personas')

    for (const field in criteria) {
      if (!PERSONAS_VALID_ORDER_FIELDS.includes(field)) {
        throw new Error(`'${field}':Invalid order field for personas!`)
      }
    }
    await this.configRepository.set(PERSONAS_ORDER_KEY, criteria)
  }

  async getGastosOrderCriteria() {
    logger.trace('obteniendo criterio de orden de gastos')

    const criteria = await this.configRepository.getOrDefault(GASTOS_ORDER_KEY, GASTOS_DEFAULT_ORDER)

    logger.debug('output', criteria)
    return criteria
  }

  async setGastosOrderCriteria(criteria) {
    logger.trace('modificando criterio de orden de gastos')

    for (const field in criteria) {
      if (!GASTOS_VALID_ORDER_FIELDS.includes(field)) {
        throw new Error(`'${field}':Invalid order field for gastos!`)
      }
    }
    await this.configRepository.set(GASTOS_ORDER_KEY, criteria)
  }
}