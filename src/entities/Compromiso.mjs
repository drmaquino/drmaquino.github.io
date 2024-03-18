export class Compromiso {
  id
  idPersona
  idGasto
  porciones

  /**
   * @param {{
   *   id?: string,
   *   idPersona: string,
   *   idGasto: string,
   *   porciones?: number
   * }} arg
   * */
  constructor({ id, idPersona, idGasto, porciones }) {
    this.id = id || `${idGasto}-${idPersona}`
    this.idPersona = idPersona
    this.idGasto = idGasto
    this.porciones = porciones || 0
  }

  get tomado() {
    return this.porciones > 0
  }

  toPOJO() {
    return {
      id: this.id,
      idPersona: this.idPersona,
      idGasto: this.idGasto,
      porciones: this.porciones,
      tomado: this.tomado
    }
  }
}
