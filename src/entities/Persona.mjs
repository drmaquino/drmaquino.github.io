import { capitalized, normalized } from '../utils/format.mjs'

export class Persona {
  id
  nombre
  habilitada

  /**
   * @param {{
   *   id?: string,
   *   nombre: string,
   *   deuda?: number,
   *   habilitada?: boolean
   * }} arg
   * */
  constructor({ id, nombre, deuda, habilitada }) {
    this.id = id || 'pid_' + normalized(nombre)
    this.nombre = capitalized(nombre)
    this.habilitada = habilitada ?? true
  }

  toPOJO() {
    return {
      id: this.id,
      nombre: this.nombre,
      habilitada: this.habilitada,
    }
  }
}
