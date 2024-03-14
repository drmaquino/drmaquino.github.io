import { capitalized, normalized } from '../utils/format.mjs'

export class Persona {
  id
  nombre
  deuda
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
    this.deuda = deuda ?? 0 // TODO: mover a otro lado
  }

  toPOJO() {
    return {
      id: this.id,
      nombre: this.nombre,
      deuda: this.deuda,
      habilitada: this.habilitada,
    }
  }
}
