export class Storage {
  constructor(entityName) {
    this.entityName = entityName
  }

  /**
   * @returns {Promise<any[]>}
   */
  async read() {
    throw new Error('must extend to be used')
  }

  /**
   * @param {any[]} entities
   */
  async write(entities) {
    throw new Error('must extend to be used')
  }
}
