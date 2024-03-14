import { capitalized, normalized } from '../utils/format.mjs'

export class Gasto {
  id
  nombre
  #precioUnitario

  /** @type {number} */
  #cantidad

  /**
   * @param {{
   *   id?:string,
   *   nombre: string,
   *   precioUnitario: number,
   *   cantidad: number,
   * }} arg
   * */
  constructor({ id, nombre, precioUnitario, cantidad }) {
    this.id = id || 'gid_' + normalized(nombre)
    this.nombre = capitalized(nombre)
    this.precioUnitario = precioUnitario
    this.cantidad = cantidad // TODO: mover a otro lado
  }

  get precioUnitario() {
    return this.#precioUnitario
  }

  /** @param {number} nuevoPrecioUnitario */
  set precioUnitario(nuevoPrecioUnitario) {
    if (nuevoPrecioUnitario > 0) this.#precioUnitario = nuevoPrecioUnitario
  }

  get cantidad() {
    return this.#cantidad
  }

  /** @param {number} nuevaCantidad */
  set cantidad(nuevaCantidad) {
    if (nuevaCantidad >= 0) this.#cantidad = nuevaCantidad
  }

  get total() {
    return this.precioUnitario * this.#cantidad
  }

  get estaSeleccionado() {
    return this.cantidad > 0
  }

  toPOJO() {
    return {
      id: this.id,
      nombre: this.nombre,
      precioUnitario: this.precioUnitario,
      cantidad: this.cantidad,
      total: this.total,
    }
  }
}
