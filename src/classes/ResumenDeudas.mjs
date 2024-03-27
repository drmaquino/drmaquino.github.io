import { Deuda } from './Deuda.mjs'

/**
 * @extends {Map<string, Deuda>}
 */
export class ResumenDeudas extends Map {
  constructor(args) {
    super(args)
  }

  /**
   * @param {Deuda} deuda
   */
  add(deuda) {
    if (this.has(deuda.persona.id)) {
      this.set(deuda.persona.id, Deuda.fromPOJO({
        persona: deuda.persona,
        monto: deuda.monto + (this.get(deuda.persona.id)?.monto || 0)
      }))
    } else {
      this.set(deuda.persona.id, deuda)
    }
  }

  /**
   * @param {ResumenDeudas} otroResumen
   * @returns {ResumenDeudas}
   */
  merge(otroResumen) {
    const nuevo = new ResumenDeudas([...this])
    for (const deuda of otroResumen.values()) {
      nuevo.add(deuda)
    }
    return nuevo
  }

  toArray() {
    return [...this.values()]
  }
}
