import fs from 'node:fs'
import { Storage } from './storage.mjs'

export class FileStorage extends Storage {
  /** @param {string} entityName */
  constructor(entityName) {
    super(entityName)
  }

  getFilePath() {
    return `./db/${this.entityName}.json`
  }

  async read() {
    const json = fs.readFileSync(this.getFilePath(), 'utf-8')
    //TODO: por qué no funciona con promesas?
    // const json = await fs.promises.readFile(this.getFilePath(), 'utf-8')
    return JSON.parse(json)
  }

  async write(entities) {
    fs.writeFileSync(this.getFilePath(), JSON.stringify(entities, null, 2))
    //TODO: por qué no funciona con promesas?
    // await fs.promises.writeFile(this.getFilePath(), JSON.stringify(entities, null, 2))
  }
}
