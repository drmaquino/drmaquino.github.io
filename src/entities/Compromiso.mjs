export class Compromiso {
  id
  idPersona
  idGasto
  tomado
  porciones

  /**
   * @param {{
   *   id?: string,
   *   idPersona: string,
   *   idGasto: string,
   *   tomado?: boolean,
   *   porciones?: number
   * }} arg
   * */
  constructor({ id, idPersona, idGasto, tomado, porciones }) {
    this.id = id || `${idGasto}-${idPersona}`
    this.idPersona = idPersona
    this.idGasto = idGasto
    this.tomado = tomado || false // TODO: reemplazar por propiedad computada
    this.porciones = porciones || 0
  }

  toPOJO() {
    return {
      id: this.id,
      idPersona: this.idPersona,
      idGasto: this.idGasto,
      tomado: this.tomado,
      porciones: this.porciones,
    }
  }
}
