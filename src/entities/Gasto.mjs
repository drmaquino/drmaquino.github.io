import { capitalized, normalized } from '../utils/format.mjs'

export class Gasto {
  id
  nombre
  #precioUnitario
  habilitado

  /**
   * @param {{
   *   id?:string,
   *   nombre: string,
   *   precioUnitario: number,
   *   habilitado?: boolean,
   * }} arg
   * */
  constructor({ id, nombre, precioUnitario, habilitado = true }) {
    this.id = id || 'gid_' + normalized(nombre)
    this.nombre = capitalized(nombre)
    this.precioUnitario = precioUnitario
    this.habilitado = habilitado
  }

  get precioUnitario() {
    return this.#precioUnitario
  }

  /** @param {number} nuevoPrecioUnitario */
  set precioUnitario(nuevoPrecioUnitario) {
    if (nuevoPrecioUnitario > 0) this.#precioUnitario = nuevoPrecioUnitario
  }

  toPOJO() {
    return {
      id: this.id,
      nombre: this.nombre,
      precioUnitario: this.precioUnitario,
      habilitado: this.habilitado
    }
  }
}
