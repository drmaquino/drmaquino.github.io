import { Storage } from '../storage/storage.mjs'

export class ConfigRepository {

  /** @param {Storage} storage */
  constructor(storage) {
    this.storage = storage
  }

  async getOrDefault(key, defaultValue) {
    const keyValuesPairs = await this.storage.read()
    const pair = keyValuesPairs.find(kv => kv.key === key)
    if (!pair) {
      return defaultValue
    }
    return pair.value
  }

  async set(key, value) {
    const keyValuesPairs = await this.storage.read()
    const pair = keyValuesPairs.find(kv => kv.key === key)
    if (pair) {
      pair.value = value
    } else {
      keyValuesPairs.push({ key, value })
    }
    await this.storage.write(keyValuesPairs)
  }
}