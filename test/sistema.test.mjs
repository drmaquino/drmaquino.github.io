import { describe, it } from 'node:test'
import assert from 'node:assert'

import { crearSistema, mockearDeudas, mockearGastos, mockearPersonas } from './utils/utils.mjs'

const mockDatosPersona1 = { nombre: '1 Marian A' }
const mockDatosPersona2 = { nombre: '2 Carli G' }
const mockDatosPersona3 = { nombre: '3 Nare G' }

const mockDatosGasto1 = { nombre: '1 Viatico', precio: 100 }
const mockDatosGasto2 = { nombre: '2 Salidas', precio: 200 }
const mockDatosGasto3 = { nombre: '3 Comidas', precio: 300 }

describe(' cuanto pago', () => {
  describe('1 personas', () => {
    describe('1.1 al agendar una nueva persona', () => {
      it('1.1.1 la agrega al sistema', async (t) => {
        const sistema = await crearSistema()
        const p1 = await sistema.agendarPersona(mockDatosPersona1)
        const personasEsperadas = mockearPersonas([p1])
        const personasObtenidas = await sistema.verPersonas()
        assert.deepStrictEqual(
          personasObtenidas,
          personasEsperadas,
          'Personas en sistema')
      })
      it('1.1.2 la agrega a la compra en curso', async (t) => {
        const sistema = await crearSistema()
        const p1 = await sistema.agendarPersona(mockDatosPersona1)
        const personasEnCompraEsperadas = [p1]
        const personasEnCompraObtenidas = await sistema.verPersonasEnCompraEnCurso()
        assert.deepStrictEqual(
          personasEnCompraObtenidas,
          personasEnCompraEsperadas,
          'Personas en compra')
      })
    })

    describe('1.2 al editar el nombre de una persona', () => {
      it('1.2.1 lo modifica en el sistema', async (t) => {
        const NUEVO_NOMBRE = 'test'
        const sistema = await crearSistema()
        const p1 = await sistema.agendarPersona(mockDatosPersona1)
        await sistema.modificarNombrePersona({ idPersona: p1.id, nombre: NUEVO_NOMBRE })
        const personasEsperadas = mockearPersonas([{ ...p1, nombre: NUEVO_NOMBRE }])
        const personasObtenidas = await sistema.verPersonas()
        assert.deepStrictEqual(
          personasObtenidas,
          personasEsperadas,
          'Personas en sistema')
      })
      // it('1.2.1 modifica las consumiciones que lo incluyen', async (t) => {
      //   const sistema = await crearSistema()
      //   const p1 = await sistema.agendarPersona(mockDatosPersona1)
      //   const g1 = await sistema.agendarGasto(mockDatosGasto1)
      //   await sistema.aumentarConsumicion({ idPersona: p1.id, idGasto: g1.id })
      //   await sistema.modificarPrecioGasto({ idGasto: g1.id, precio: 1000 })

      //   const deudasEsperadas = mockearDeudas([p1, 1000])
      //   const deudasObtenidas = await sistema.verDeudasCompraEnCurso()
      //   assert.deepStrictEqual(
      //     deudasObtenidas,
      //     deudasEsperadas,
      //     'Deudas')
      // })
    })

    describe('1.3 al quitarla de la compra', () => {
      it('1.3.1 sigue agendada en el sistema', async () => {
        const sistema = await crearSistema()
        const p1 = await sistema.agendarPersona(mockDatosPersona1)
        await sistema.quitarPersonaDeCompraEnCurso(p1.id)

        const personasEsperadas = mockearPersonas([p1, false])
        const personasObtenidas = await sistema.verPersonas()
        assert.deepStrictEqual(
          personasObtenidas,
          personasEsperadas,
          'Personas en sistema')
      })
      it('1.3.2 desaparece de la compra en curso', async () => {
        const sistema = await crearSistema()
        const p1 = await sistema.agendarPersona(mockDatosPersona1)
        await sistema.quitarPersonaDeCompraEnCurso(p1.id)

        const personasEnCompraEsperadas = []
        const personasEnCompraObtenidas = await sistema.verPersonasEnCompraEnCurso()
        assert.deepStrictEqual(
          personasEnCompraObtenidas,
          personasEnCompraEsperadas,
          'Personas en compra')
      })
      it('1.3.3 desaparecen sus consumiciones de la compra en curso', async () => {
        const sistema = await crearSistema()
        const p1 = await sistema.agendarPersona(mockDatosPersona1)
        const g1 = await sistema.agendarGasto(mockDatosGasto1)
        await sistema.aumentarConsumicion({ idPersona: p1.id, idGasto: g1.id })
        await sistema.quitarPersonaDeCompraEnCurso(p1.id)

        const deudasEsperadas = []
        const deudasObtenidas = await sistema.verDeudasCompraEnCurso()
        assert.deepStrictEqual(
          deudasObtenidas,
          deudasEsperadas,
          'Deudas')
      })
    })

    describe('1.4 al eliminarla del sistema', () => {
      it('1.4.1 desaparece del sistema', async () => {
        const sistema = await crearSistema()
        const p1 = await sistema.agendarPersona(mockDatosPersona1)
        await sistema.eliminarPersona(p1.id)

        const personasEsperadas = []
        const personasObtenidas = await sistema.verPersonas()
        assert.deepStrictEqual(
          personasObtenidas,
          personasEsperadas,
          'Personas en sistema')
      })
      it('1.4.2 desaparece de la compra en curso', async () => {
        const sistema = await crearSistema()
        const p1 = await sistema.agendarPersona(mockDatosPersona1)
        await sistema.eliminarPersona(p1.id)

        const personasEnCompraEsperadas = []
        const personasEnCompraObtenidas = await sistema.verPersonasEnCompraEnCurso()
        assert.deepStrictEqual(
          personasEnCompraObtenidas,
          personasEnCompraEsperadas,
          'Personas en compra')
      })
      it('1.4.3 desaparecen sus consumiciones de la compra en curso', async () => {
        const sistema = await crearSistema()
        const p1 = await sistema.agendarPersona(mockDatosPersona1)
        const g1 = await sistema.agendarGasto(mockDatosGasto1)
        await sistema.aumentarConsumicion({ idPersona: p1.id, idGasto: g1.id })
        await sistema.eliminarPersona(p1.id)

        const deudasEsperadas = []
        const deudasObtenidas = await sistema.verDeudasCompraEnCurso()
        assert.deepStrictEqual(
          deudasObtenidas,
          deudasEsperadas,
          'Deudas')
      })
    })

    describe('1.5 al eliminar a todas del sistema', () => {
      it('1.5.1 desaparecen del sistema', async () => {
        const sistema = await crearSistema()
        await sistema.agendarPersona(mockDatosPersona1)
        await sistema.agendarPersona(mockDatosPersona2)
        await sistema.eliminarTodasLasPersonas()

        const personasEsperadas = []
        const personasObtenidas = await sistema.verPersonas()
        assert.deepStrictEqual(
          personasObtenidas,
          personasEsperadas,
          'Personas en sistema')
      })
      it('1.5.2 desaparecen de la compra en curso', async () => {
        const sistema = await crearSistema()
        await sistema.agendarPersona(mockDatosPersona1)
        await sistema.agendarPersona(mockDatosPersona2)
        await sistema.eliminarTodasLasPersonas()

        const personasEnCompraEsperadas = []
        const personasEnCompraObtenidas = await sistema.verPersonasEnCompraEnCurso()
        assert.deepStrictEqual(
          personasEnCompraObtenidas,
          personasEnCompraEsperadas,
          'Personas en compra')
      })
      it('1.5.3 desaparecen sus consumiciones de la compra en curso', async () => {
        const sistema = await crearSistema()
        const p1 = await sistema.agendarPersona(mockDatosPersona1)
        const p2 = await sistema.agendarPersona(mockDatosPersona2)
        const g1 = await sistema.agendarGasto(mockDatosGasto1)
        await sistema.aumentarConsumicion({ idPersona: p1.id, idGasto: g1.id })
        await sistema.aumentarConsumicion({ idPersona: p2.id, idGasto: g1.id })
        await sistema.eliminarTodasLasPersonas()

        const deudasEsperadas = []
        const deudasObtenidas = await sistema.verDeudasCompraEnCurso()
        assert.deepStrictEqual(
          deudasObtenidas,
          deudasEsperadas,
          'Deudas')
      })
    })
  })
  describe('2 gastos', () => {

    describe('2.1 al agendar un nuevo gasto', () => {
      it('2.1.1 lo agrega al sistema', async (t) => {
        const sistema = await crearSistema()
        const g1 = await sistema.agendarGasto(mockDatosGasto1)
        const gastosEsperados = mockearGastos([g1])
        const gastosObtenidos = await sistema.verGastos()
        assert.deepStrictEqual(
          gastosObtenidos,
          gastosEsperados,
          'Gastos en sistema')
      })
      it('2.1.2 lo agrega a la compra en curso', async (t) => {
        const sistema = await crearSistema()
        const g1 = await sistema.agendarGasto(mockDatosGasto1)
        const gastoEstaEnCompraEsperado = true
        const gastoEstaEnCompraObtenido = await sistema.verSiGastoEstaEnCompraEnCurso(g1.id)
        assert.deepStrictEqual(
          gastoEstaEnCompraObtenido,
          gastoEstaEnCompraEsperado,
          'Gasto en compra')
      })
    })

    describe('2.2 al quitarlo de la compra', () => {
      it('2.2.1 sigue agendado en el sistema', async () => {
        const sistema = await crearSistema()
        const g1 = await sistema.agendarGasto(mockDatosGasto1)
        await sistema.quitarGastoDeCompraEnCurso(g1.id)

        const gastosEsperados = mockearGastos([g1, false])
        const gastosObtenidos = await sistema.verGastos()
        assert.deepStrictEqual(
          gastosObtenidos,
          gastosEsperados,
          'Gastos en sistema')
      })
      it('2.2.2 desaparece de la compra en curso', async () => {
        const sistema = await crearSistema()
        const g1 = await sistema.agendarGasto(mockDatosGasto1)
        await sistema.quitarGastoDeCompraEnCurso(g1.id)

        const gastoEstaEnCompraEsperado = false
        const gastoEstaEnCompraObtenido = await sistema.verSiGastoEstaEnCompraEnCurso(g1.id)
        assert.deepStrictEqual(
          gastoEstaEnCompraObtenido,
          gastoEstaEnCompraEsperado,
          'Gasto en compra')
      })
      it('2.2.3 desaparecen sus consumiciones de la compra en curso', async () => {
        const sistema = await crearSistema()
        const p1 = await sistema.agendarPersona(mockDatosPersona1)
        const g1 = await sistema.agendarGasto(mockDatosGasto1)
        await sistema.aumentarConsumicion({ idPersona: p1.id, idGasto: g1.id })
        await sistema.quitarGastoDeCompraEnCurso(g1.id)

        const deudasEsperadas = []
        const deudasObtenidas = await sistema.verDeudasCompraEnCurso()
        assert.deepStrictEqual(
          deudasObtenidas,
          deudasEsperadas,
          'Deudas')
      })
    })

    describe('2.3 al eliminarlo del sistema', () => {
      it('2.3.1 desaparece del sistema', async () => {
        const sistema = await crearSistema()
        const g1 = await sistema.agendarGasto(mockDatosGasto1)
        await sistema.eliminarGasto(g1.id)

        const gastosEsperados = []
        const gastosObtenidos = await sistema.verGastos()
        assert.deepStrictEqual(
          gastosObtenidos,
          gastosEsperados,
          'Gastos en sistema')
      })
      it('2.3.2 desaparece de la compra en curso', async () => {
        const sistema = await crearSistema()
        const g1 = await sistema.agendarGasto(mockDatosGasto1)
        await sistema.eliminarGasto(g1.id)

        const gastoEstaEnCompraEsperado = false
        const gastoEstaEnCompraObtenido = await sistema.verSiGastoEstaEnCompraEnCurso(g1.id)
        assert.deepStrictEqual(
          gastoEstaEnCompraObtenido,
          gastoEstaEnCompraEsperado,
          'Gasto en compra')
      })
      it('2.3.3 desaparecen sus consumiciones de la compra en curso', async () => {
        const sistema = await crearSistema()
        const p1 = await sistema.agendarPersona(mockDatosPersona1)
        const g1 = await sistema.agendarGasto(mockDatosGasto1)
        await sistema.aumentarConsumicion({ idPersona: p1.id, idGasto: g1.id })
        await sistema.eliminarGasto(g1.id)

        const deudasEsperadas = []
        const deudasObtenidas = await sistema.verDeudasCompraEnCurso()
        assert.deepStrictEqual(
          deudasObtenidas,
          deudasEsperadas,
          'Deudas')
      })
    })

    describe('2.4 al eliminar a todos del sistema', () => {
      it('2.4.1 desaparecen del sistema', async () => {
        const sistema = await crearSistema()
        await sistema.agendarGasto(mockDatosGasto1)
        await sistema.agendarGasto(mockDatosGasto2)
        await sistema.eliminarTodosLosGastos()

        const gastosEsperados = []
        const gastosObtenidos = await sistema.verGastos()
        assert.deepStrictEqual(
          gastosObtenidos,
          gastosEsperados,
          'Gastos en sistema')
      })
      it('2.4.2 desaparecen de la compra en curso', async () => {
        const sistema = await crearSistema()
        const g1 = await sistema.agendarGasto(mockDatosGasto1)
        const g2 = await sistema.agendarGasto(mockDatosGasto2)
        await sistema.eliminarTodosLosGastos()

        const gasto1EstaEnCompraEsperado = false
        const gasto1EstaEnCompraObtenido = await sistema.verSiGastoEstaEnCompraEnCurso(g1.id)
        assert.deepStrictEqual(
          gasto1EstaEnCompraObtenido,
          gasto1EstaEnCompraEsperado,
          'Gasto 1 en compra')

        const gasto2EstaEnCompraEsperado = false
        const gasto2EstaEnCompraObtenido = await sistema.verSiGastoEstaEnCompraEnCurso(g2.id)
        assert.deepStrictEqual(
          gasto2EstaEnCompraObtenido,
          gasto2EstaEnCompraEsperado,
          'Gasto 2 en compra')
      })
      it('2.4.3 desaparecen sus consumiciones de la compra en curso', async () => {
        const sistema = await crearSistema()
        const p1 = await sistema.agendarPersona(mockDatosPersona1)
        const p2 = await sistema.agendarPersona(mockDatosPersona2)
        const g1 = await sistema.agendarGasto(mockDatosGasto1)
        await sistema.aumentarConsumicion({ idPersona: p1.id, idGasto: g1.id })
        await sistema.aumentarConsumicion({ idPersona: p2.id, idGasto: g1.id })
        await sistema.eliminarTodosLosGastos()

        const deudasEsperadas = []
        const deudasObtenidas = await sistema.verDeudasCompraEnCurso()
        assert.deepStrictEqual(
          deudasObtenidas,
          deudasEsperadas,
          'Deudas')
      })
    })

    describe('2.5 al editar el precio de un gasto', () => {
      it('2.5.1 lo modifica en el sistema', async (t) => {
        const sistema = await crearSistema()
        const g1 = await sistema.agendarGasto(mockDatosGasto1)
        await sistema.modificarPrecioGasto({ idGasto: g1.id, precio: 1000 })
        const gastosEsperados = mockearGastos([{ ...g1, precio: 1000 }])
        const gastosObtenidos = await sistema.verGastos()
        assert.deepStrictEqual(
          gastosObtenidos,
          gastosEsperados,
          'Gastos en sistema')
      })
      it('2.5.2 modifica las consumiciones que lo incluyen', async (t) => {
        const sistema = await crearSistema()
        const p1 = await sistema.agendarPersona(mockDatosPersona1)
        const g1 = await sistema.agendarGasto(mockDatosGasto1)
        await sistema.aumentarConsumicion({ idPersona: p1.id, idGasto: g1.id })
        await sistema.modificarPrecioGasto({ idGasto: g1.id, precio: 1000 })

        const deudasEsperadas = mockearDeudas([p1, 1000])
        const deudasObtenidas = await sistema.verDeudasCompraEnCurso()
        assert.deepStrictEqual(
          deudasObtenidas,
          deudasEsperadas,
          'Deudas')
      })
    })
  })
  describe('3 consumiciones', () => {
    describe('3.1 al modificar las consumiciones', () => {
      it('3.1.1 se ajustan las deudas de la compra en curso', async () => {
        const sistema = await crearSistema()

        const p1 = await sistema.agendarPersona(mockDatosPersona1)
        const p2 = await sistema.agendarPersona(mockDatosPersona2)

        const g1 = await sistema.agendarGasto(mockDatosGasto1)

        await sistema.aumentarConsumicion({ idPersona: p1.id, idGasto: g1.id })
        await sistema.aumentarConsumicion({ idPersona: p1.id, idGasto: g1.id })
        await sistema.aumentarConsumicion({ idPersona: p1.id, idGasto: g1.id })

        await sistema.aumentarConsumicion({ idPersona: p2.id, idGasto: g1.id })
        await sistema.aumentarConsumicion({ idPersona: p2.id, idGasto: g1.id })
        await sistema.aumentarConsumicion({ idPersona: p2.id, idGasto: g1.id })
        await sistema.reducirConsumicion({ idPersona: p2.id, idGasto: g1.id })

        const deudasEsperadas = mockearDeudas([p1, 300], [p2, 200])
        const deudasObtenidas = await sistema.verDeudasCompraEnCurso()
        assert.deepStrictEqual(
          deudasObtenidas,
          deudasEsperadas,
          'Deudas')
      })
    })
    describe('3.2 al compartir un gasto entre varios', () => {
      describe('3.2.1 dividiendolo en distintas proporciones', () => {
        it('3.2.1.1 se ajustan las deudas de la compra en curso', async () => {
          const sistema = await crearSistema()

          const p1 = await sistema.agendarPersona(mockDatosPersona1)
          const p2 = await sistema.agendarPersona(mockDatosPersona2)

          const g1 = await sistema.agendarGasto(mockDatosGasto1)
          const g2 = await sistema.agendarGasto(mockDatosGasto2)

          await sistema.aumentarConsumicion({ idPersona: p1.id, idGasto: g1.id })
          await sistema.aumentarConsumicion({ idPersona: p2.id, idGasto: g1.id })

          await sistema.aumentarConsumicion({ idPersona: p1.id, idGasto: g2.id })
          await sistema.aumentarConsumicion({ idPersona: p2.id, idGasto: g2.id })

          await sistema.marcarGastoEnCompraComoCompartido(g1.id)

          const deudasEsperadas = mockearDeudas([p1, 250], [p2, 250])
          const deudasObtenidas = await sistema.verDeudasCompraEnCurso()
          assert.deepStrictEqual(
            deudasObtenidas,
            deudasEsperadas,
            'Deudas')
        })
      })
      describe('3.2.2 ividiendolo en partes iguales', () => {
        it('3.2.2.1 se ajustan las deudas de la compra en curso', async () => {
          const sistema = await crearSistema()

          const p1 = await sistema.agendarPersona(mockDatosPersona1)
          const p2 = await sistema.agendarPersona(mockDatosPersona2)

          const g3 = await sistema.agendarGasto(mockDatosGasto3)

          await sistema.aumentarConsumicion({ idPersona: p1.id, idGasto: g3.id })
          await sistema.aumentarConsumicion({ idPersona: p1.id, idGasto: g3.id })

          await sistema.aumentarConsumicion({ idPersona: p2.id, idGasto: g3.id })

          await sistema.marcarGastoEnCompraComoCompartido(g3.id)
          await sistema.dividirGastoEnCompraEnPartesIguales(g3.id)

          const deudasEsperadas = mockearDeudas([p1, 150], [p2, 150])
          const deudasObtenidas = await sistema.verDeudasCompraEnCurso()
          assert.deepStrictEqual(
            deudasObtenidas,
            deudasEsperadas,
            'Deudas')
        })
      })
    })
  })
})


// =======================================================

// async function testModificarLaProporcionDePagoDeUnGastoEntreVariasPersonas() {
//   const p1 = await sistema.agendarPersona(mockDatosPersona1)
//   const p2 = await sistema.agendarPersona(mockDatosPersona2)

//   const g1 = await sistema.agendarGasto(mockDatosGasto1)

//   await sistema.aumentarConsumicion({ idPersona: p1.id, idGasto: g1.id })
//   await sistema.aumentarConsumicion({ idPersona: p1.id, idGasto: g1.id })

//   sistema.aumentarConsumicion({ idPersona: p2.id, idGasto: g1.id })
//   await sistema.aumentarConsumicion({ idPersona: p2.id, idGasto: g1.id })
//   await sistema.aumentarConsumicion({ idPersona: p2.id, idGasto: g1.id })

//   const personasObtenidas = await sistema.verPersonas()
//   const gastosObtenido = await sistema.obtenerGastos()
//   const consumicionesObtenidos = await sistema.obtenerConsumiciones()

//   const personasEsperado = [
//     new Persona({ nombre: '1 Marian A', deuda: 40 }).toPOJO(),
//     new Persona({ nombre: '2 Carli G', deuda: 60 }).toPOJO(),
//   ]
//   const gastosEsperado = [
//     new Gasto(mockDatosGasto1).toPOJO(),
//   ]
//   const consumicionesEsperados = [
//     new Consumicion({ idPersona: p1.id, idGasto: g1.id, items: 2 }).toPOJO(),
//     new Consumicion({ idPersona: p2.id, idGasto: g1.id, items: 3 }).toPOJO(),
//   ]

//   const result = {
//     status: 'ok',
//     messages: [
//       'Modificar la proporcion de pago\nde un gasto entre\nvarias personas:',
//     ],
//   }
//   comparar(result, 'Personas', personasEsperado, personasObtenidas)
//   comparar(result, 'Gastos', gastosEsperado, gastosObtenido)
//   comparar(result, 'Consumiciones', consumicionesEsperados, consumicionesObtenidos)

//   return result
// }

// =====================================================================

// async function testAumentarCantidadDePorcionesDeUnItem() {
//   const p1 = await sistema.agendarPersona(mockDatosPersona1)

//   const g1 = await sistema.agendarGasto(mockDatosGasto1)
//   const g2 = await sistema.agendarGasto(mockDatosGasto2)

//   await sistema.aumentarConsumicion({ idPersona: p1.id, idGasto: g1.id })
//   await sistema.aumentarConsumicion({ idPersona: p2.id, idGasto: g1.id })

//   const personasObtenidas = await sistema.verPersonas()
//   const gastosObtenido = await sistema.obtenerGastos()
//   const consumicionesObtenidos = await sistema.obtenerConsumiciones()

//   const personasEsperado = [
//     new Persona({ nombre: '1 Marian A', deuda: 100 }).toPOJO(),
//     new Persona({ nombre: '2 Carli G', deuda: 100 }).toPOJO(),
//   ]
//   const gastosEsperado = [
//     new Gasto(mockDatosGasto1).toPOJO(),
//     new Gasto(mockDatosGasto2).toPOJO(),
//   ]
//   const consumicionesEsperados = [
//     new Consumicion({ idPersona: p1.id, idGasto: g1.id, items: 1 }).toPOJO(),
//     new Consumicion({ idPersona: p2.id, idGasto: g1.id, items: 1 }).toPOJO(),
//   ]

//   const total = await sistema.obtenerTotal()
//   const esperado = 200

//   const result = {
//     status: 'ok',
//     messages: ['Aumentar cantidad de items de un gasto:'],
//   }
//   comparar(result, 'Personas', personasEsperado, personasObtenidas)
//   comparar(result, 'Gastos', gastosEsperado, gastosObtenido)
//   comparar(result, 'Consumiciones', consumicionesEsperados, consumicionesObtenidos)
//   comparar(result, 'Monto', [esperado], [total])

//   return result
// }

// =====================================================================

// async function testDisminuirCantidadDePorcionesDeUnItem() {
//   const p1 = await sistema.agendarPersona(mockDatosPersona1)
//   const p2 = await sistema.agendarPersona(mockDatosPersona2)

//   const g1 = await sistema.agendarGasto(mockDatosGasto1)
//   const g2 = await sistema.agendarGasto(mockDatosGasto2)

//   await sistema.aumentarConsumicion({ idPersona: p1.id, idGasto: g1.id })
//   await sistema.aumentarConsumicion({ idPersona: p2.id, idGasto: g1.id })

//   sistema.decrementarConsumicion(versona: p2.id, idGasto: g1.id })

//   const personasObtenidas = await sistema.verPersonas()
//   const gastosObtenido = await sistema.obtenerGastos()
//   const consumicionesObtenidos = await sistema.obtenerConsumiciones()

//   const personasEsperado = [
//     new Persona({ nombre: '1 Marian A', deuda: 100 }).toPOJO(),
//     new Persona({ nombre: '2 Carli G', deuda: 0 }).toPOJO(),
//   ]
//   const gastosEsperado = [
//     new Gasto(mockDatosGasto1).toPOJO(),
//     new Gasto(mockDatosGasto2).toPOJO(),
//   ]
//   const consumicionesEsperados = [
//     new Consumicion({ idPersona: p1.id, idGasto: g1.id, items: 1 }).toPOJO(),
//   ]

//   const total = await sistema.obtenerTotal()
//   const esperado = 100

//   const result = {
//     status: 'ok',
//     messages: ['Disminuir cantidad de items de un gasto:'],
//   }
//   comparar(result, 'Personas', personasEsperado, personasObtenidas)
//   comparar(result, 'Gastos', gastosEsperado, gastosObtenido)
//   comparar(result, 'Consumiciones', consumicionesEsperados, consumicionesObtenidos)
//   comparar(result, 'Monto', [esperado], [total])
//   return result
// }

// =====================================================================
