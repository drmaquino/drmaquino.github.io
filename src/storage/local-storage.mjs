import { Storage } from './storage.mjs'
import { logger } from '../utils/logger.mjs'

export class LocalStorage extends Storage {
  /** @param {string} entityName */
  constructor(entityName) {
    super(entityName)
  }

  async read() {
    logger.trace(`reading: ${this.entityName}`)

    const result = JSON.parse(localStorage.getItem(this.entityName) || '[]')

    logger.debug('output', result)
    return result
  }

  async write(entities) {
    logger.trace(`writing: ${this.entityName}`)
    logger.debug('input', entities)

    localStorage.setItem(this.entityName, JSON.stringify(entities))
  }
}
