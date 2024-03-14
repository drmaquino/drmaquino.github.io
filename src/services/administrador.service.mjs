import { CompromisosService } from './compromisos.service.mjs'
import { GastosService } from './gastos.service.mjs'
import { PersonasService } from './personas.service.mjs'
import { ConfigService } from './config.service.mjs'

export class AdministradorService {
  /**
   * @param {PersonasService} personasService
   * @param {CompromisosService} compromisosService
   * @param {GastosService} gastosService
   * @param {ConfigService} configService
   */
  constructor(personasService, compromisosService, gastosService, configService) {
    this.personasService = personasService
    this.compromisosService = compromisosService
    this.gastosService = gastosService
    this.configService = configService
  }

  // personas -----------------------------------------------------

  /**
   * @param {{
   *   nombre: string,
   *   deuda?: number,
   *   habilitada?: boolean
   * }} param
   * */
  async agregarPersona({ nombre, deuda, habilitada }) {
    const persona = await this.personasService.agregarPersona({
      nombre,
      deuda,
      habilitada,
    })

    const gastos = await this.gastosService.obtenerTodos()
    for (const gasto of gastos) {
      await this.compromisosService.crearCompromiso({
        idPersona: persona.id,
        idGasto: gasto.id,
      })
    }

    return persona
  }

  async obtenerPersonas(asPOJOs = true) {
    const personasOrderCriteria = await this.configService.getPersonasOrderCriteria()
    const personas = await this.personasService.obtenerTodas({
      orderBy: personasOrderCriteria
    })
    if (asPOJOs) {
      return personas.map((p) => p.toPOJO())
    } else {
      return personas
    }
  }

  async obtenerPersonasHabilitadas(asPOJOs = true) {
    const personasOrderCriteria = await this.configService.getPersonasOrderCriteria()
    const habilitadas = await this.personasService.obtenerHabilitadas({
      orderBy: personasOrderCriteria
    })
    if (asPOJOs) {
      return habilitadas.map((p) => p.toPOJO())
    } else {
      return habilitadas
    }
  }

  /** @param {{ idPersona: string }} arg */
  async habilitarPersona({ idPersona }) {
    const habilitada = await this.personasService.habilitarPorId({ idPersona })
    if (habilitada) {
      const gastos = await this.gastosService.obtenerTodos()
      for (const gasto of gastos) {
        await this.compromisosService.crearCompromiso({
          idPersona,
          idGasto: gasto.id,
        })
      }
    }
    return habilitada
  }

  /** @param {{ idPersona: string }} arg */
  async deshabilitarPersona({ idPersona }) {
    const deshabilitada = await this.personasService.deshabilitarPorId({
      idPersona,
    })
    if (deshabilitada) {
      await this.compromisosService.eliminarSegunIdPersona(deshabilitada.id)
      await this.ajustarDeudasDePersonas()
    }
    return deshabilitada
  }

  /** @param {{ idPersona: string }} arg */
  async eliminarPersona({ idPersona }) {
    const eliminada = await this.personasService.eliminarPersona({ idPersona })
    if (eliminada) {
      await this.compromisosService.eliminarSegunIdPersona(eliminada.id)
      await this.ajustarDeudasDePersonas()
    }
    return eliminada
  }

  async eliminarPersonas() {
    await this.personasService.eliminarTodas()
    await this.compromisosService.eliminarTodos()
  }

  async ajustarDeudasDePersonas() {
    const personas = await this.personasService.obtenerTodas()
    for (const persona of personas) {
      await this.personasService.eliminarDeuda(persona.id)
    }

    const gastos = await this.gastosService.obtenerTodos()
    for (const gasto of gastos) {
      /** @type {{ idPersona: string, porciones: number }[]} */
      const porcionesPorIds = []

      for (const persona of personas) {
        const compromiso = await this.compromisosService.obtenerPorIds({
          idGasto: gasto.id,
          idPersona: persona.id,
        })
        if (compromiso && compromiso.tomado) {
          porcionesPorIds.push({
            idPersona: persona.id,
            porciones: compromiso.porciones,
          })
        }
      }

      const cantPorciones = porcionesPorIds.reduce(
        (accum, curr) => accum + curr.porciones,
        0
      )
      const montoPorPorcion = (gasto.precioUnitario * gasto.cantidad) / cantPorciones

      for (const porcionesPorId of porcionesPorIds) {
        const incremento = montoPorPorcion * porcionesPorId.porciones
        await this.personasService.incrementarDeuda(
          porcionesPorId.idPersona,
          incremento
        )
      }
    }
  }

  // gastos ---------------------------------------------------------

  /**
   * @param {{
   *   nombre: string,
   *   precioUnitario: number,
   *   cantidad?: number,
   * }} arg
   * */
  async agregarGasto({ nombre, precioUnitario, cantidad = 1 }) {
    const gasto = await this.gastosService.agregarNuevo({
      nombre,
      precioUnitario,
      cantidad,
    })

    const personas = await this.personasService.obtenerTodas()
    for (const persona of personas) {
      await this.compromisosService.crearCompromiso({
        idPersona: persona.id,
        idGasto: gasto.id,
      })
    }

    return gasto
  }

  async obtenerGastos(asPOJOs = true) {
    const gastosOrderCriteria = await this.configService.getGastosOrderCriteria()
    const gastos = await this.gastosService.obtenerTodos({ orderBy: gastosOrderCriteria })
    if (asPOJOs) {
      return gastos.map((p) => p.toPOJO())
    } else {
      return gastos
    }
  }

  async obtenerGastosSeleccionados(asPOJOs = true) {
    const gastosOrderCriteria = await this.configService.getGastosOrderCriteria()
    const gastos = await this.gastosService.obtenerSeleccionados({ orderBy: gastosOrderCriteria })
    if (asPOJOs) {
      return gastos.map((p) => p.toPOJO())
    } else {
      return gastos
    }
  }

  async incrementarCantidadGasto({ idGasto }) {
    const gasto = await this.gastosService.gastosRepository.findById(idGasto)
    if (!gasto) {
      return false
    }

    if (gasto.cantidad === 0) {
      for (const persona of await this.obtenerPersonas()) {
        await this.compromisosService.crearCompromiso({
          idPersona: persona.id,
          idGasto: gasto.id,
        })
      }
    }

    gasto.cantidad++
    await this.gastosService.gastosRepository.save(gasto)

    await this.ajustarDeudasDePersonas()

    return gasto
  }

  async decrementarCantidadGasto({ idGasto }) {
    const gasto = await this.gastosService.gastosRepository.findById(idGasto)
    if (!gasto) {
      return false
    }

    gasto.cantidad--
    await this.gastosService.gastosRepository.save(gasto)

    if (gasto.cantidad === 0) {
      await this.compromisosService.eliminarSegunIdGasto({ idGasto: gasto.id })
    }

    await this.ajustarDeudasDePersonas()

    return gasto
  }

  /** @param {{idGasto: string, cantidad: number}} arg */
  async modificarCantidadGasto({ idGasto, cantidad }) {
    const gasto = await this.gastosService.gastosRepository.findById(idGasto)
    if (!gasto) {
      return false
    }

    gasto.cantidad = cantidad
    await this.gastosService.gastosRepository.save(gasto)

    await this.ajustarDeudasDePersonas()

    return gasto
  }

  /** @param {{idGasto: string, precioUnitario: number}} arg */
  async modificarPrecioUnitarioGasto({ idGasto, precioUnitario }) {
    const gasto = await this.gastosService.gastosRepository.findById(idGasto)
    if (!gasto) {
      return false
    }

    gasto.precioUnitario = precioUnitario
    await this.gastosService.gastosRepository.save(gasto)

    await this.ajustarDeudasDePersonas()

    return gasto
  }

  /** @param {{idGasto: string}} arg */
  async eliminarGasto({ idGasto }) {
    const gastoEliminado = await this.gastosService.eliminarPorId(idGasto)
    if (gastoEliminado) {
      const compromisosEliminados =
        await this.compromisosService.eliminarSegunIdGasto(gastoEliminado.id)
      if (compromisosEliminados.length > 0) {
        await this.ajustarDeudasDePersonas()
      }
    }
    return gastoEliminado
  }

  async eliminarTodosLosGastos() {
    await this.gastosService.eliminarTodos()
    await this.compromisosService.eliminarTodos()
    await this.ajustarDeudasDePersonas()
  }

  async establecerNuevoOrdenGastos(campo) {
    await this.configService.setGastosOrderCriteria({ [campo]: 1 })
  }

  // compromisos -------------------------------------------------

  /** @param {{ idPersona: string, idGasto: string }} arg */
  async obtenerCompromiso({ idGasto, idPersona }) {
    return await this.compromisosService.obtenerPorIds({ idGasto, idPersona })
  }

  async obtenerCompromisos(asPOJOs = true) {
    const compromisos = await this.compromisosService.obtenerTodos()
    if (asPOJOs) {
      return compromisos.map((p) => p.toPOJO())
    } else {
      return compromisos
    }
  }

  async eliminarCompromisosSegunIdPersona(idPersona) {
    const eliminados = await this.compromisosService.eliminarSegunIdPersona(
      idPersona
    )
    await this.ajustarDeudasDePersonas()
    return eliminados
  }

  async eliminarCompromisosSegunIdGasto(idGasto) {
    const eliminados = await this.compromisosService.eliminarSegunIdGasto(
      idGasto
    )
    await this.ajustarDeudasDePersonas()
    return eliminados
  }

  /** @param {{idPersona:string, idGasto:string}} arg */
  async incrementarCompromiso({ idPersona, idGasto }) {
    const compromiso = await this.compromisosService.obtenerPorIds({
      idPersona,
      idGasto,
    })
    if (compromiso) {
      compromiso.porciones++
      compromiso.tomado = true
      await this.compromisosService.guardar(compromiso)
      await this.ajustarDeudasDePersonas()
    }
    return compromiso
  }

  /** @param {{idPersona:string, idGasto:string}} arg */
  async decrementarCompromiso({ idPersona, idGasto }) {
    const compromiso = await this.compromisosService.obtenerPorIds({
      idPersona,
      idGasto,
    })
    if (compromiso && compromiso.porciones > 0) {
      compromiso.porciones--
      if (compromiso.porciones === 0) {
        compromiso.tomado = false
      }
      await this.compromisosService.guardar(compromiso)
      await this.ajustarDeudasDePersonas()
    }
    return compromiso
  }

  async desmarcarTodosLosCompromisos() {
    await this.compromisosService.desmarcarTodos()
    await this.ajustarDeudasDePersonas()
  }

  async hayCompromisosTomados() {
    return await this.compromisosService.hayCompromisosTomados()
  }

  // extras -------------------------------------------------

  async resetearSistema() {
    await this.compromisosService.eliminarTodos()
    await this.gastosService.eliminarTodos()
    await this.personasService.eliminarTodas()
  }

  async obtenerTotal() {
    const compromisos = await this.compromisosService.obtenerTodos()
    const gastos = await this.gastosService.obtenerTodos()
    return gastos
      .filter((g) => compromisos.some((c) => c.tomado && c.idGasto === g.id))
      .reduce((total, g) => total + g.precioUnitario * g.cantidad, 0)
  }

  /**
   * // TODO: no se usa!
   */
  async asignarATodasLasPersonasElGastoConId(idGasto) {
    const personas = await this.personasService.obtenerTodas()
    for (const idPersona of personas.map((p) => p.id)) {
      await this.incrementarCompromiso({ idPersona, idGasto })
    }
  }

  /**
   * // TODO: no se usa!
   */
  async asignarATodosLosGastosLaPersonaConId(idPersona) {
    const gastos = await this.gastosService.obtenerTodos()
    for (const idGasto of gastos.map((g) => g.id)) {
      await this.incrementarCompromiso({ idPersona, idGasto })
    }
  }
}
