import { randomId } from '../utils/ids.mjs'

/** 
 * @typedef {{
 *   id: string;
 *   nombre: string;
 *   precio: number;
 * }} GastoDto
 */

/** @typedef {Omit<GastoDto, 'id'> & { id?: string}} CreateGastoDto */

export class Gasto {
  /** @type {number} */ #precio

  /**
   * @param {CreateGastoDto} param0
   */
  constructor({
    id,
    nombre,
    precio,
  }) {
    this.id = id || randomId()
    this.nombre = nombre
    this.precio = precio
  }

  get precio() { return this.#precio }
  set precio(value) {
    if (value <= 0) throw new Error('no se puede actualizar el precio: el precio debe ser mayor a cero')
    this.#precio = value
  }

  /**
   * @returns {GastoDto}
   */
  toPOJO() {
    return {
      id: this.id,
      nombre: this.nombre,
      precio: this.precio,
    }
  }

  /**
   * @param {GastoDto} pojo 
   * @returns {Gasto}
   */
  static fromPOJO(pojo) {
    return new Gasto(pojo)
  }
}
