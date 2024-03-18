import { CompromisosRepository } from '../repositories/compromisos.repository.mjs'
import { Compromiso } from '../entities/Compromiso.mjs'

export class CompromisosService {
  /** @param {CompromisosRepository} compromisosRepository */
  constructor(compromisosRepository) {
    this.compromisosRepository = compromisosRepository
  }

  /** @param {{ idPersona: string, idGasto: string }} arg */
  async crearCompromiso({ idPersona, idGasto }) {
    const compromiso = new Compromiso({ idGasto, idPersona, porciones: 1 })
    await this.compromisosRepository.save(compromiso)
    return compromiso
  }

  /** @param {{idPersona:string, idGasto:string}} arg */
  async obtenerPorIds({ idGasto, idPersona }) {
    return await this.compromisosRepository.findByIds({ idGasto, idPersona })
  }

  async obtenerTodos() {
    return await this.compromisosRepository.findAll()
  }

  async hayCompromisosTomados() {
    const compromisos = await this.compromisosRepository.findAll()
    return compromisos.reduce((result, compr) => compr?.tomado || result, false)
  }

  /**
   * deshace todos los compromisos entre personas y gastos
   * @returns los compromisos actualizados
   */
  async desmarcarTodos() {
    return await this.compromisosRepository.desmarcarAll()
  }

  /** @param {Compromiso} compromiso */
  async guardar(compromiso) {
    await this.compromisosRepository.save(compromiso)
  }

  async eliminarCompromiso(criteria) {
    return await this.compromisosRepository.deleteOneByCriteria(criteria)
  }

  async eliminarSegunIdPersona(idPersona) {
    return await this.compromisosRepository.deleteByIdPersona(idPersona)
  }

  async eliminarSegunIdGasto(idGasto) {
    return await this.compromisosRepository.deleteByIdGasto(idGasto)
  }

  async eliminarTodos() {
    await this.compromisosRepository.deleteAll()
  }
}
