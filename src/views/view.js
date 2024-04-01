import { typedQuerySelector } from '../utils/dom.mjs'
import { Sistema } from '../classes/Sistema.mjs'
import { capitalized } from '../utils/format.mjs'
import { by } from '../utils/sorting.mjs'

// seccion personas
const seccionPersonas = typedQuerySelector('#seccionPersonas', HTMLElement)
const formCargarPersona = typedQuerySelector('#formCargarPersona', HTMLFormElement)
const inputPersona = typedQuerySelector('#inputPersona', HTMLInputElement)
const listadoPersonas = typedQuerySelector('#listadoPersonas', HTMLDivElement)
const tbodyPersonas = typedQuerySelector('#tbodyPersonas', HTMLTableSectionElement)
const linkEliminarTodasLasPersonas = typedQuerySelector('#linkEliminarTodasLasPersonas', HTMLAnchorElement)

// seccion gastos
const seccionGastos = typedQuerySelector('#seccionGastos', HTMLElement)
const formCargarGasto = typedQuerySelector('#formCargarGasto', HTMLFormElement)
const inputDescripcionGasto = typedQuerySelector('#inputDescripcionGasto', HTMLInputElement)
const inputPrecioUnitarioGasto = typedQuerySelector('#inputPrecioUnitarioGasto', HTMLInputElement)
const listadoGastos = typedQuerySelector('#listadoGastos', HTMLDivElement)
const tbodyGastos = typedQuerySelector('#tbodyGastos', HTMLTableSectionElement)
const linkEliminarTodosLosGastos = typedQuerySelector('#linkEliminarTodosLosGastos', HTMLAnchorElement)

// seccion consumiciones
const seccionCompraEnCurso = typedQuerySelector('#seccionCompraEnCurso', HTMLElement)

const tablaConsumiciones = typedQuerySelector('#tablaConsumiciones', HTMLDivElement)
const trCabeceraConsumiciones = typedQuerySelector('#trCabeceraConsumiciones', HTMLTableRowElement)
const tbodyConsumiciones = typedQuerySelector('#tbodyConsumiciones', HTMLTableSectionElement)

const listadoDeudas = typedQuerySelector('#listadoDeudas', HTMLDivElement)
const tbodyDeudas = typedQuerySelector('#deudas', HTMLTableSectionElement)

// navbar
const liTabPersonas = typedQuerySelector('#liTabPersonas', HTMLLIElement)
const liTabGastos = typedQuerySelector('#liTabGastos', HTMLLIElement)
const liTabCompraEnCurso = typedQuerySelector('#liTabCompraEnCurso', HTMLLIElement)

const BTN_CONFIRM_COLOR = '#3c5999'
const BTN_CANCEL_COLOR = '#6e7881'

export class View {

  /** 
   * @param { Sistema } model
   * @param { 'personas' | 'gastos' | 'compraEnCurso' } activeView
   */
  constructor(model, activeView = 'personas') {
    this.model = model
    this.activeView = activeView

    linkEliminarTodasLasPersonas.onclick = () =>
      this.preguntarSiBorrarATodasLasPersonas()

    linkEliminarTodosLosGastos.onclick = () =>
      this.preguntarSiBorrarATodosLosGastos()

    formCargarPersona.addEventListener('submit', async (event) => {
      event.preventDefault()

      const nombre = inputPersona.value.trim()
      if (!nombre) {
        this.mostrarWarningToast('el nombre de la persona no puede estar vacío')
        return false
      }

      try {
        await this.model.agendarPersona({
          nombre: capitalized(nombre)
        })

        this.limpiarFormularioPersonas()
        await this.actualizarListaPersonas()
      } catch (error) {
        if (error.message.startsWith('ya existe')) {
          this.mostrarWarningToast('Ya existe una persona con ese nombre!')
        } else {
          alert(error.message)
          return false
        }
      }
    })

    formCargarGasto.addEventListener('submit', async (event) => {
      event.preventDefault()

      const nombre = inputDescripcionGasto.value.trim()
      if (!nombre) {
        this.mostrarWarningToast('el nombre del gasto no puede estar vacío')
        return false
      }

      const precioUnitario = parseFloat(inputPrecioUnitarioGasto.value)
      if (!precioUnitario || precioUnitario < 1) {
        this.mostrarWarningToast('el monto del gasto debe ser mayor a 1')
        inputPrecioUnitarioGasto.value = '1'
        return false
      }

      try {
        await this.model.agendarGasto({
          nombre: capitalized(nombre),
          precio: precioUnitario
        })

        this.limpiarFormularioGastos()
        await this.actualizarListaGastos()
      } catch (error) {
        if (error.message.startsWith('ya existe')) {
          this.mostrarWarningToast('Ya existe un gasto con ese nombre!')
        } else {
          alert(error.message)
          return false
        }
      }
    })

    liTabPersonas.addEventListener('click', async () => {
      this.activeView = 'personas'
      await this.refresh()
    })

    liTabGastos.addEventListener('click', async () => {
      this.activeView = 'gastos'
      await this.refresh()
    })

    liTabCompraEnCurso.addEventListener('click', async () => {
      this.activeView = 'compraEnCurso'
      await this.refresh()
    })
  }

  async actualizarListaPersonas() {

    const personas = await this.model.verPersonas()
    personas.sort(by(persona => persona.nombre))
    personas.sort(by(persona => persona.enCompra, 'DESC'))

    if (personas.length === 0) {
      this.ocultarListadoPersonas()
      return true
    }

    tbodyPersonas.replaceChildren()
    for (const persona of personas) {
      const trPersona = document.createElement('tr')
      tbodyPersonas.appendChild(trPersona)

      const tdNombre = document.createElement('td')
      trPersona.appendChild(tdNombre)

      const aNode = document.createElement('a')
      aNode.replaceChildren(persona.nombre)
      aNode.onclick = () => {
        this.mostrarMenuPersona({
          nombrePersona: persona.nombre,
          idPersona: persona.id,
        })
      }
      tdNombre.appendChild(aNode)

      const tdEnCompra = document.createElement('td')
      trPersona.appendChild(tdEnCompra)

      const toggleSwitch = document.createElement('label')
      toggleSwitch.className = 'switch'
      tdEnCompra.appendChild(toggleSwitch)

      const sliderBox = document.createElement('input')
      sliderBox.type = 'checkbox'
      sliderBox.checked = this.model.verSiPersonaEstaEnCompraEnCurso(persona.id)
      sliderBox.addEventListener('click', async (event) => {
        if (sliderBox.checked) {
          await this.model.agregarPersonaACompraEnCurso(persona.id)
        } else {
          await this.model.quitarPersonaDeCompraEnCurso(persona.id)
        }
        await this.actualizarListaPersonas()
      })
      toggleSwitch.appendChild(sliderBox)

      const sliderBall = document.createElement('span')
      sliderBall.classList.add('slider', 'round')
      toggleSwitch.appendChild(sliderBall)
    }
    this.mostrarListadoPersonas()
  }

  limpiarFormularioPersonas() {
    formCargarPersona.reset()
  }

  mostrarListadoPersonas() {
    listadoPersonas.classList.remove('hidden')
  }

  ocultarListadoPersonas() {
    listadoPersonas.classList.add('hidden')
  }

  async mostrarSeccionPersonas() {
    this.ocultarSecciones()
    await this.actualizarListaPersonas()
    seccionPersonas.classList.remove('hidden')
    liTabPersonas.classList.add('active')
  }

  // GASTOS

  async actualizarListaGastos() {

    const gastos = await this.model.verGastos()
    gastos.sort(by(gasto => gasto.nombre))
    gastos.sort(by(gasto => gasto.enCompra, 'DESC'))

    if (gastos.length === 0) {
      this.ocultarListadoGastos()
      return true
    }

    tbodyGastos.replaceChildren()
    for (const gasto of gastos) {
      const trGasto = document.createElement('tr')
      tbodyGastos.appendChild(trGasto)

      // col nombre -------

      const tdNombre = document.createElement('td')
      trGasto.appendChild(tdNombre)

      const aNodeNombre = document.createElement('a')
      aNodeNombre.innerHTML = gasto.nombre
      aNodeNombre.onclick = () => {
        this.preguntarSiBorrarGasto({
          idGasto: gasto.id,
          nombreGasto: gasto.nombre,
        })
      }
      tdNombre.appendChild(aNodeNombre)

      // col precio ------

      const tdPrecio = document.createElement('td')
      trGasto.appendChild(tdPrecio)

      const aNodePrecio = document.createElement('a')
      aNodePrecio.innerHTML = `$${gasto.precio}`
      aNodePrecio.onclick = () => {
        this.preguntarSiEditarPrecioUnitarioGasto({
          idGasto: gasto.id,
          nombreGasto: gasto.nombre,
        })
      }
      tdPrecio.appendChild(aNodePrecio)

      // col habilitado ------

      const tdHabilitado = document.createElement('td')
      trGasto.appendChild(tdHabilitado)

      const toggleSwitch = document.createElement('label')
      toggleSwitch.className = 'switch'
      tdHabilitado.appendChild(toggleSwitch)

      const sliderBox = document.createElement('input')
      sliderBox.type = 'checkbox'
      sliderBox.checked = this.model.verSiGastoEstaEnCompraEnCurso(gasto.id)
      sliderBox.addEventListener('click', async (event) => {
        if (sliderBox.checked) {
          await this.model.agregarGastoACompraEnCurso(gasto.id)
        } else {
          await this.model.quitarGastoDeCompraEnCurso(gasto.id)
        }
        await this.actualizarListaGastos()
      })
      toggleSwitch.appendChild(sliderBox)

      const sliderBall = document.createElement('span')
      sliderBall.classList.add('slider', 'round')
      toggleSwitch.appendChild(sliderBall)
    }
    this.mostrarListadoGastos()
  }

  limpiarFormularioGastos() {
    formCargarGasto.reset()
  }

  mostrarListadoGastos() {
    listadoGastos.classList.remove('hidden')
  }

  ocultarListadoGastos() {
    listadoGastos.classList.add('hidden')
  }

  async mostrarSeccionGastos() {
    this.ocultarSecciones()
    await this.actualizarListaGastos()
    seccionGastos.classList.remove('hidden')
    liTabGastos.classList.add('active')
  }

  // CONSUMICIONES

  async actualizarTablaConsumiciones() {

    const items = this.model.verItemsCompraEnCurso()
    items.sort(by(item => item.gasto.nombre))

    if (items.length === 0) {
      this.ocultarTablaConsumiciones()
      return true
    }

    const personas = this.model.verPersonasEnCompraEnCurso()
    personas.sort(by(persona => persona.nombre))

    if (personas.length === 0) {
      this.ocultarTablaConsumiciones()
      return true
    }

    trCabeceraConsumiciones.replaceChildren()

    // crear vertice de tabla
    const th = document.createElement('th')
    th.classList.add('col-1')
    trCabeceraConsumiciones.appendChild(th)

    const textoCabecera = document.createTextNode('Gastos/Personas')
    th.appendChild(textoCabecera)

    // crear cabeceras con nombres de personas
    for (const persona of personas) {
      const th = document.createElement('th')
      trCabeceraConsumiciones.appendChild(th)

      const aNode = document.createElement('a')
      th.appendChild(aNode)

      aNode.innerHTML = persona.nombre
      aNode.onclick = () =>
        this.preguntarSiQuitarPersonaDeLaCompra({
          nombrePersona: persona.nombre,
          idPersona: persona.id,
        })
    }

    // crear filas con gastos y consumiciones
    tbodyConsumiciones.replaceChildren()

    for (const item of items) {
      const trGastos = document.createElement('tr')
      tbodyConsumiciones.appendChild(trGastos)

      const tdNombreGasto = document.createElement('td')
      trGastos.appendChild(tdNombreGasto)

      const aNode = document.createElement('a')
      tdNombreGasto.appendChild(aNode)

      aNode.innerHTML = item.gasto.nombre
      aNode.onclick = () =>
        this.preguntarSiQuitarGastoDeLaCompra({
          nombreGasto: item.gasto.nombre,
          idGasto: item.gasto.id,
        })

      const divCompartir = document.createElement('div')
      divCompartir.classList.add('item-tarjeta-gasto')
      tdNombreGasto.appendChild(divCompartir)

      const checkboxCompartir = document.createElement('input')
      checkboxCompartir.type = 'checkbox'
      checkboxCompartir.checked = item.compartido
      checkboxCompartir.onclick = async (event) => {
        if (checkboxCompartir.checked) {
          await this.model.marcarGastoEnCompraComoCompartido(item.gasto.id)
        } else {
          await this.model.marcarGastoEnCompraComoNoCompartido(item.gasto.id)
        }
        await this.actualizarTablaConsumiciones()
        await this.actualizarTablaDeudas()
      }
      divCompartir.appendChild(checkboxCompartir)

      const pCompartir = document.createElement('small')
      pCompartir.innerHTML = 'compartir'
      divCompartir.appendChild(pCompartir)

      if (item.compartido) {
        const divPorciones = document.createElement('div')
        divPorciones.classList.add('item-tarjeta-gasto')
        tdNombreGasto.appendChild(divPorciones)

        const checkboxPorciones = document.createElement('input')
        checkboxPorciones.type = 'checkbox'
        checkboxPorciones.checked = item.seDivideEnPartesIguales
        checkboxPorciones.onclick = async (event) => {
          if (checkboxPorciones.checked) {
            await this.model.dividirGastoEnCompraEnPartesIguales(item.gasto.id)
          } else {
            await this.model.dejarDeDividirGastoEnCompraEnPartesIguales(item.gasto.id)
          }
          await this.actualizarTablaConsumiciones()
          await this.actualizarTablaDeudas()
        }
        divPorciones.appendChild(checkboxPorciones)

        const pPorciones = document.createElement('small')
        pPorciones.innerHTML = 'partes iguales'
        divPorciones.appendChild(pPorciones)
      }

      // crear checkboxes y botones de ajuste de items
      for (const persona of personas) {
        const tdConsumicion = document.createElement('td')
        trGastos.appendChild(tdConsumicion)

        const consumicion = item.consumiciones.find(c => c.persona.id === persona.id)
        if (!consumicion) {
          const checkbox = document.createElement('input')
          checkbox.type = 'checkbox'
          checkbox.classList.add('bigger-checkbox')
          checkbox.checked = false
          checkbox.onclick = async (event) => {
            if (checkbox.checked) {
              await this.model.aumentarConsumicion({ idPersona: persona.id, idGasto: item.gasto.id })
              await this.actualizarTablaConsumiciones()
              await this.actualizarTablaDeudas()
            }
          }
          tdConsumicion.appendChild(checkbox)
        } else {
          if (item.compartido && item.seDivideEnPartesIguales) {
            const checkbox = document.createElement('input')
            checkbox.type = 'checkbox'
            checkbox.classList.add('bigger-checkbox')
            checkbox.checked = true
            checkbox.onclick = async (event) => {
              if (!checkbox.checked) {
                await this.model.reducirConsumicion({ idPersona: persona.id, idGasto: item.gasto.id })
                await this.actualizarTablaConsumiciones()
                await this.actualizarTablaDeudas()
              }
            }
            tdConsumicion.appendChild(checkbox)
          } else {
            const divSelectorDePorciones = document.createElement('div')
            divSelectorDePorciones.classList.add('item-consumicion')
            tdConsumicion.appendChild(divSelectorDePorciones)

            const btnDecr = document.createElement('button')
            btnDecr.className = 'btn btn-primary btn-sm mx-1 p-0 px-1'
            btnDecr.innerHTML = '-'
            btnDecr.onclick = async (event) => {
              await this.model.reducirConsumicion({ idPersona: persona.id, idGasto: item.gasto.id })
              await this.actualizarTablaConsumiciones()
              await this.actualizarTablaDeudas()
            }
            divSelectorDePorciones.appendChild(btnDecr)

            const aNodeItems = document.createElement('a')
            aNodeItems.innerHTML = `${consumicion.porciones}`
            divSelectorDePorciones.appendChild(aNodeItems)

            const btnIncr = document.createElement('button')
            btnIncr.className = 'btn btn-primary btn-sm mx-1 p-0 px-1'
            btnIncr.innerHTML = '+'
            btnIncr.onclick = async (event) => {
              await this.model.aumentarConsumicion({ idPersona: persona.id, idGasto: item.gasto.id })
              await this.actualizarTablaConsumiciones()
              await this.actualizarTablaDeudas()
            }
            divSelectorDePorciones.appendChild(btnIncr)

            if (item.compartido) {
              const smallPorciones = document.createElement('small')
              smallPorciones.replaceChildren('porciones')
              tdConsumicion.appendChild(smallPorciones)
            } else {
              const smallPorciones = document.createElement('small')
              smallPorciones.replaceChildren('unidades')
              tdConsumicion.appendChild(smallPorciones)
            }
          }
        }
      }
    }
    this.mostrarTablaConsumiciones()
  }

  mostrarTablaConsumiciones() {
    tablaConsumiciones.classList.remove('hidden')
  }

  ocultarTablaConsumiciones() {
    tablaConsumiciones.classList.add('hidden')
  }

  // DEUDAS

  async actualizarTablaDeudas() {

    const deudas = await this.model.verDeudasCompraEnCurso()
      .sort(by(deuda => deuda.persona.nombre))

    const deudaTotal = deudas.reduce((accum, d) => accum + d.monto, 0)

    if (Math.round(deudaTotal) === 0) {
      this.ocultarListadoDeudas()
      return true
    }

    tbodyDeudas.replaceChildren()

    for (const deuda of deudas) {
      if (deuda.monto > 0) {
        const tr = document.createElement('tr')
        tbodyDeudas.appendChild(tr)

        const tdNombre = document.createElement('td')
        tr.appendChild(tdNombre)

        const aNode = document.createElement('a')
        aNode.replaceChildren(deuda.persona.nombre)
        aNode.onclick = () => {
          this.preguntarSiQuitarPersonaDeLaCompra({
            nombrePersona: deuda.persona.nombre,
            idPersona: deuda.persona.id,
          })
        }
        tdNombre.appendChild(aNode)

        const tdDeuda = document.createElement('td')
        tdDeuda.replaceChildren(`$${deuda.monto.toFixed(2)}`)
        tr.appendChild(tdDeuda)
      }
    }

    const thTotal = typedQuerySelector('#thTotal', HTMLTableCellElement)
    thTotal.replaceChildren(`$${deudaTotal.toFixed(2)}`)

    this.mostrarListadoDeudas()
  }

  mostrarListadoDeudas() {
    listadoDeudas.classList.remove('hidden')
  }

  ocultarListadoDeudas() {
    listadoDeudas.classList.add('hidden')
  }

  async mostrarSeccionCompraEnCurso() {
    this.ocultarSecciones()
    await this.actualizarTablaConsumiciones()
    await this.actualizarTablaDeudas()
    seccionCompraEnCurso.classList.remove('hidden')
    liTabCompraEnCurso.classList.add('active')
  }

  ocultarSecciones() {
    seccionPersonas?.classList.add('hidden')
    seccionGastos?.classList.add('hidden')
    seccionCompraEnCurso?.classList.add('hidden')
    liTabPersonas?.classList.remove('active')
    liTabGastos?.classList.remove('active')
    liTabCompraEnCurso?.classList.remove('active')
  }

  // ------------------------------------------------------------------

  async mostrarMenuPersona({ idPersona, nombrePersona }) {
    // @ts-ignore
    const result = await Swal.fire({
      title: `Qué deseas hacer con ${nombrePersona}?`,

      showCancelButton: true,
      showDenyButton: true,

      confirmButtonText: 'Renombrar',
      denyButtonText: 'Eliminar',
      cancelButtonText: `Cancelar`,

      confirmButtonColor: BTN_CONFIRM_COLOR,
      denyButtonColor: BTN_CONFIRM_COLOR,
      cancelButtonColor: BTN_CANCEL_COLOR,

      customClass: {
        actions: 'd-flex flex-column align-items-stretch',
      }
    })
    if (result.isConfirmed) {
      await this.preguntarSiEditarNombrePersona({ idPersona, nombrePersona })
    } else if (result.isDenied) {
      await this.preguntarSiBorrarPersona({ idPersona, nombrePersona })
    }
  }

  async preguntarSiEditarNombrePersona({ idPersona, nombrePersona }) {
    // @ts-ignore
    const result = await Swal.fire({
      title: nombrePersona,
      input: 'text',
      inputLabel: 'Ingrese el nuevo nombre',
      showCancelButton: true,
      confirmButtonText: 'Modificar',
      cancelButtonText: `Cancelar`,
      inputValidator: (value) => {
        if (!value || !String(value).trim()) {
          return 'El nombre no puede quedar vacío'
        }
      },
      confirmButtonColor: BTN_CONFIRM_COLOR,
    })

    if (result.isConfirmed) {
      await this.model.modificarNombrePersona({ idPersona, nombre: capitalized(result.value) })
      await this.model.quitarPersonaDeCompraEnCurso(idPersona) //TODO: esto es temporal!!!
      await this.actualizarListaPersonas()
    }
  }

  async preguntarSiBorrarPersona({ nombrePersona, idPersona }) {
    // @ts-ignore
    const result = await Swal.fire({
      title: `Eliminar a ${nombrePersona} del sistema?`,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: `Cancelar`,
      confirmButtonColor: BTN_CONFIRM_COLOR,
    })
    if (result.isConfirmed) {
      await this.model.eliminarPersona(idPersona)

      await this.actualizarListaPersonas()
      await this.actualizarTablaConsumiciones()
      await this.actualizarTablaDeudas()
    }
  }

  async preguntarSiQuitarPersonaDeLaCompra({ nombrePersona, idPersona }) {
    // @ts-ignore
    const result = await Swal.fire({
      title: `Quitar a ${nombrePersona} de esta compra?`,
      showCancelButton: true,
      confirmButtonText: 'Quitar',
      cancelButtonText: `Cancelar`,
      confirmButtonColor: BTN_CONFIRM_COLOR,
    })
    if (result.isConfirmed) {
      await this.model.quitarPersonaDeCompraEnCurso(idPersona)

      await this.actualizarListaPersonas()
      await this.actualizarTablaConsumiciones()
      await this.actualizarTablaDeudas()
    }
  }

  async preguntarSiBorrarATodasLasPersonas() {
    // @ts-ignore
    const result = await Swal.fire({
      title: `Eliminar a todas las personas?`,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: `Cancelar`,
      confirmButtonColor: BTN_CONFIRM_COLOR,
    })
    if (result.isConfirmed) {
      await this.model.eliminarTodasLasPersonas()
      await this.actualizarListaPersonas()
    }
  }

  async preguntarSiEditarPrecioUnitarioGasto({ nombreGasto, idGasto }) {
    // @ts-ignore
    const result = await Swal.fire({
      title: nombreGasto,
      input: 'number',
      inputLabel: 'Ingrese el nuevo precio',
      showCancelButton: true,
      confirmButtonText: 'Modificar',
      cancelButtonText: `Cancelar`,
      inputValidator: (value) => {
        if (!value || isNaN(Number(value)) || Number(value) < 1) {
          return 'El monto debe ser un número mayor a 1'
        }
      },
      confirmButtonColor: BTN_CONFIRM_COLOR,
    })

    if (result.isConfirmed) {
      await this.model.modificarPrecioGasto({ idGasto, precio: result.value })
      await this.actualizarListaGastos()
    }
  }

  async preguntarSiBorrarGasto({ nombreGasto, idGasto }) {
    // @ts-ignore
    const result = await Swal.fire({
      title: `Eliminar ${nombreGasto} del sistema?`,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: `Cancelar`,
      confirmButtonColor: BTN_CONFIRM_COLOR,
    })

    if (result.isConfirmed) {
      await this.model.eliminarGasto(idGasto)
      await this.actualizarListaGastos()
    }
  }

  async preguntarSiQuitarGastoDeLaCompra({ nombreGasto, idGasto }) {
    // @ts-ignore
    const result = await Swal.fire({
      title: `Quitar ${nombreGasto} de esta compra?`,
      showCancelButton: true,
      confirmButtonText: 'Quitar',
      cancelButtonText: `Cancelar`,
      confirmButtonColor: BTN_CONFIRM_COLOR,
    })

    if (result.isConfirmed) {
      await this.model.quitarGastoDeCompraEnCurso(idGasto)
      await this.actualizarListaGastos()
      await this.actualizarTablaConsumiciones()
      await this.actualizarTablaDeudas()
    }

    return result.isConfirmed
  }

  async preguntarSiBorrarATodosLosGastos() {
    // @ts-ignore
    const result = await Swal.fire({
      title: `Eliminar todos los gastos?`,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: `Cancelar`,
      confirmButtonColor: BTN_CONFIRM_COLOR,
    })
    if (result.isConfirmed) {
      await this.model.eliminarTodosLosGastos()
      await this.actualizarListaGastos()
    }
  }

  mostrarWarningToast(mensaje) {
    WarningToast.fire({
      title: mensaje,
    })
  }

  mostrarMensajeDeCargaExitosa() {
    SuccessToast.fire({
      title: 'Info cargada!',
    })
  }

  // -------------------------------------------------------------------

  async refresh() {
    switch (this.activeView) {
      case 'personas':
        await this.mostrarSeccionPersonas()
        break
      case 'gastos':
        await this.mostrarSeccionGastos()
        break
      case 'compraEnCurso':
        await this.mostrarSeccionCompraEnCurso()
        break
      default:
        await this.mostrarSeccionPersonas()
    }
  }
}

//---------------------------------------------------
// @ts-ignore
const WarningToast = Swal.mixin({
  toast: true,
  position: 'top-right',
  icon: 'warning',
  iconColor: 'orange',
  customClass: {
    popup: 'colored-toast',
  },
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
})

//@ts-ignore
const SuccessToast = Swal.mixin({
  toast: true,
  position: 'top-right',
  customClass: {
    popup: 'colored-toast',
  },
  icon: 'success',
  showConfirmButton: false,
  timer: 1000,
})
