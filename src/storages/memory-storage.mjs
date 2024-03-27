import { Storage } from './storage.mjs'

export class MemoryStorage extends Storage {
  /** @param {string} entityName */
  constructor(entityName) {
    super(entityName)
    this.json = '[]'
  }

  async read() {
    return JSON.parse(this.json)
  }

  async write(entities) {
    this.json = JSON.stringify(entities)
  }
}
