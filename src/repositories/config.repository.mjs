import { Storage } from '../storages/storage.mjs'

export class ConfigRepository {

  /** @param {Storage} storage */
  constructor(storage) {
    /** @type {any[]} */
    this.keyValuePairs = []
    /** @type {Storage} */
    this.storage = storage
  }

  async getOrDefault(key, defaultValue) {
    await this.#load()
    const pair = this.keyValuePairs.find(kv => kv.key === key)
    if (!pair) {
      return defaultValue
    }
    return pair.value
  }

  async set(key, value) {
    await this.#load()
    const pair = this.keyValuePairs.find(kv => kv.key === key)
    if (pair) {
      pair.value = value
    } else {
      this.keyValuePairs.push({ key, value })
    }
    await this.#store()
  }

  /**
   * almacena todos los keyValuePairs en el storage correspondiente
   */
  async #store() {
    await this.storage.write(this.keyValuePairs)
  }

  /**
   * carga desde el storage correspondiente todos las personas en memoria
   */
  async #load() {
    this.keyValuePairs.length = 0
    const pojos = await this.storage.read()
    pojos.forEach(pojo => this.keyValuePairs.push(pojo))
  }
}