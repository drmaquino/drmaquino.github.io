import { AdministradorService } from '../services/administrador.service.mjs'
import { typedQuerySelector } from '../utils/dom.mjs'
import { logger } from '../utils/logger.mjs'

// seccion personas
const sectionPersonas = typedQuerySelector('#sectionPersonas', HTMLElement)
const formCargarPersona = typedQuerySelector('#formCargarPersona', HTMLFormElement)
const inputPersona = typedQuerySelector('#inputPersona', HTMLInputElement)
const listadoPersonas = typedQuerySelector('#listadoPersonas', HTMLDivElement)
const tbodyPersonas = typedQuerySelector('#tbodyPersonas', HTMLTableSectionElement)
const linkEliminarTodasLasPersonas = typedQuerySelector('#linkEliminarTodasLasPersonas', HTMLAnchorElement)

// seccion gastos
const sectionGastos = typedQuerySelector('#sectionGastos', HTMLElement)
const formCargarGasto = typedQuerySelector('#formCargarGasto', HTMLFormElement)
const inputDescripcionGasto = typedQuerySelector('#inputDescripcionGasto', HTMLInputElement)
const inputPrecioUnitarioGasto = typedQuerySelector('#inputPrecioUnitarioGasto', HTMLInputElement)
const inputCantidadGasto = typedQuerySelector('#inputCantidadGasto', HTMLInputElement)
const listadoGastos = typedQuerySelector('#listadoGastos', HTMLDivElement)
const tbodyGastos = typedQuerySelector('#tbodyGastos', HTMLTableSectionElement)
const linkEliminarTodosLosGastos = typedQuerySelector('#linkEliminarTodosLosGastos', HTMLAnchorElement)

const linkOrdenarPorNombre = typedQuerySelector('#listado-gastos-th-nombre', HTMLAnchorElement)
const linkOrdenarPorPrecio = typedQuerySelector('#listado-gastos-th-precio', HTMLAnchorElement)
const linkOrdenarPorCantidad = typedQuerySelector('#listado-gastos-th-cantidad', HTMLAnchorElement)

// seccion compromisos
const sectionResumen = typedQuerySelector('#sectionResumen', HTMLElement)

const seccionCompromisos = typedQuerySelector('#seccionCompromisos', HTMLDivElement)
const trCabeceraCompromisos = typedQuerySelector('#trCabeceraCompromisos', HTMLTableRowElement)
const tbodyCompromisos = typedQuerySelector('#tbodyCompromisos', HTMLTableSectionElement)

const seccionDeudas = typedQuerySelector('#seccionDeudas', HTMLDivElement)
const tbodyDeudas = typedQuerySelector('#deudas', HTMLTableSectionElement)

// navbar
const liPersonas = typedQuerySelector('#liPersonas', HTMLLIElement)
const liGastos = typedQuerySelector('#liGastos', HTMLLIElement)
const liCompromisos = typedQuerySelector('#liCompromisos', HTMLLIElement)

const BTN_CONFIRM_COLOR = '#3c5999'

export class View {
  /** @param {AdministradorService} model */
  constructor(model) {
    this.model = model

    linkEliminarTodasLasPersonas.onclick = () =>
      this.preguntarSiBorrarATodasLasPersonas()

    linkEliminarTodosLosGastos.onclick = () =>
      this.preguntarSiBorrarATodosLosGastos()

    linkOrdenarPorNombre.onclick = async () => {
      // await this.model.establecerNuevoOrdenGastos('nombre')
      // await this.actualizarListaGastos()
    }

    linkOrdenarPorPrecio.onclick = async () => {
      // await this.model.establecerNuevoOrdenGastos('monto')
      // await this.actualizarListaGastos()
    }

    linkOrdenarPorCantidad.onclick = async () => {
      // await this.model.establecerNuevoOrdenGastos('cantidad')
      // await this.actualizarListaGastos()
    }


    formCargarPersona.addEventListener('submit', async (event) => {
      event.preventDefault()

      const nombre = inputPersona.value.trim()
      if (!nombre) {
        this.mostrarWarningToast('el nombre de la persona no puede estar vacío')
        return false
      }

      try {
        await this.model.agregarPersona({ nombre })

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
      if (!precioUnitario || precioUnitario < 0.01) {
        this.mostrarWarningToast('el monto del gasto debe ser mayor a 0.01')
        inputPrecioUnitarioGasto.value = '0.01'
        return false
      }

      let cantidad = parseInt(inputCantidadGasto.value)
      if (isNaN(cantidad)) {
        cantidad = 1
      }

      if (cantidad < 1) {
        this.mostrarWarningToast('la cantidad debe ser un entero mayor a 0')
        inputCantidadGasto.value = '1'
        return false
      }

      try {
        await this.model.agregarGasto({ nombre, precioUnitario, cantidad })

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

    liPersonas.addEventListener('click', async () => {
      this.ocultarSecciones()
      await this.actualizarListaPersonas()
      this.mostrarSeccionPersonas()
    })

    liGastos.addEventListener('click', async () => {
      this.ocultarSecciones()
      await this.actualizarListaGastos()
      this.mostrarSeccionGastos()
    })

    liCompromisos.addEventListener('click', async () => {
      this.ocultarSecciones()
      await this.actualizarTablaCompromisos()
      await this.actualizarTablaDeudas()
      this.mostrarSeccionResumen()
    })
  }

  async actualizarListaPersonas() {
    logger.trace('actualizando lista personas')

    const personas = await this.model.obtenerPersonas()

    if (personas.length === 0) {
      this.ocultarListadoPersonas()
      return true
    }

    tbodyPersonas.replaceChildren()
    for (const persona of personas) {
      const trPersona = document.createElement('tr')
      tbodyPersonas.appendChild(trPersona)

      const tdNombre = document.createElement('td')
      tdNombre.classList.add('table-personas-td')
      trPersona.appendChild(tdNombre)

      const aNode = document.createElement('a')
      aNode.replaceChildren(persona.nombre)
      aNode.onclick = () => {
        this.preguntarSiBorrarPersona({
          nombrePersona: persona.nombre,
          idPersona: persona.id,
        })
      }
      tdNombre.appendChild(aNode)

      const toggleSwitch = document.createElement('label')
      toggleSwitch.className = 'switch'
      tdNombre.appendChild(toggleSwitch)

      const sliderBox = document.createElement('input')
      sliderBox.type = 'checkbox'
      sliderBox.checked = persona.habilitada
      sliderBox.addEventListener('click', async (event) => {
        if (sliderBox.checked) {
          await this.model.habilitarPersona({ idPersona: persona.id })
        } else {
          await this.model.deshabilitarPersona({ idPersona: persona.id })
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
    listadoPersonas.style.setProperty('display', 'block')
  }

  ocultarListadoPersonas() {
    listadoPersonas.style.setProperty('display', 'none')
  }

  mostrarSeccionPersonas() {
    sectionPersonas.classList.remove('hidden')
    liPersonas.classList.add('active')
  }

  // GASTOS

  async actualizarListaGastos() {
    logger.trace('actualizando lista gastos')

    const gastos = await this.model.obtenerGastos()

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
        // TODO: mostrar menu de edicion de gasto
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
      aNodePrecio.innerHTML = `$${gasto.precioUnitario}`
      aNodePrecio.onclick = () => {
        this.preguntarSiEditarPrecioUnitarioGasto({
          idGasto: gasto.id,
          nombreGasto: gasto.nombre,
        })
      }
      tdPrecio.appendChild(aNodePrecio)

      // col cantidad ------

      const tdCantidad = document.createElement('td')
      trGasto.appendChild(tdCantidad)

      if (gasto.cantidad === 0) {
        const checkbox = document.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.checked = false
        checkbox.onclick = async (event) => {
          if (checkbox.checked) {
            await this.model.incrementarCantidadGasto({ idGasto: gasto.id })
            await this.actualizarListaGastos()
          }
        }
        tdCantidad.appendChild(checkbox)
      } else {
        const btnDecr = document.createElement('button')
        btnDecr.className = 'btn btn-primary btn-sm mx-1 p-0 px-1'
        btnDecr.innerHTML = '-'
        btnDecr.onclick = async (event) => {
          await this.model.decrementarCantidadGasto({ idGasto: gasto.id })
          await this.actualizarListaGastos()
        }
        tdCantidad.appendChild(btnDecr)

        const aNodeCantidad = document.createElement('a')
        aNodeCantidad.innerHTML = `${gasto.cantidad}`
        aNodeCantidad.onclick = () => {
          this.preguntarSiEditarCantidadGasto({
            idGasto: gasto.id,
            nombreGasto: gasto.nombre,
          })
        }
        tdCantidad.appendChild(aNodeCantidad)

        const btnIncr = document.createElement('button')
        btnIncr.className = 'btn btn-primary btn-sm mx-1 p-0 px-1'
        btnIncr.innerHTML = '+'
        btnIncr.onclick = async (event) => {
          await this.model.incrementarCantidadGasto({ idGasto: gasto.id })
          await this.actualizarListaGastos()
        }
        tdCantidad.appendChild(btnIncr)
      }
    }
    this.mostrarListadoGastos()
  }

  limpiarFormularioGastos() {
    formCargarGasto.reset()
  }

  mostrarListadoGastos() {
    listadoGastos.style.setProperty('display', 'block')
  }

  ocultarListadoGastos() {
    listadoGastos.style.setProperty('display', 'none')
  }

  mostrarSeccionGastos() {
    sectionGastos.classList.remove('hidden')
    liGastos.classList.add('active')
  }

  // COMPROMISOS

  async actualizarTablaCompromisos() {
    logger.trace('actualizando tabla compromisos')

    const gastosSeleccionados = await this.model.obtenerGastosSeleccionados()

    if (gastosSeleccionados.length === 0) {
      this.ocultarSeccionCompromisos()
      return true
    }

    const personas = await this.model.obtenerPersonasHabilitadas()

    if (personas.length === 0) {
      this.ocultarSeccionCompromisos()
      return true
    }

    const compromisos = await this.model.obtenerCompromisos()

    trCabeceraCompromisos.replaceChildren()

    // crear vertice de tabla
    const th = document.createElement('th')
    th.classList.add('col-1')
    trCabeceraCompromisos.appendChild(th)

    const textoCabecera = document.createTextNode('Gastos/Personas')
    th.appendChild(textoCabecera)

    // crear cabeceras con nombres de personas
    for (const persona of personas) {
      const th = document.createElement('th')
      trCabeceraCompromisos.appendChild(th)

      const aNode = document.createElement('a')
      th.appendChild(aNode)

      aNode.innerHTML = persona.nombre
      aNode.onclick = () =>
        this.preguntarSiBorrarPersona({
          nombrePersona: persona.nombre,
          idPersona: persona.id,
        })
    }

    // crear filas
    tbodyCompromisos.replaceChildren()
    for (const gasto of gastosSeleccionados) {
      const trGastos = document.createElement('tr')
      tbodyCompromisos.appendChild(trGastos)

      const tdNombreGasto = document.createElement('td')
      trGastos.appendChild(tdNombreGasto)

      const aNode = document.createElement('a')
      tdNombreGasto.appendChild(aNode)

      aNode.innerHTML = `${gasto.nombre} ($${gasto.total})`
      aNode.onclick = () =>
        this.preguntarSiBorrarGasto({
          nombreGasto: gasto.nombre,
          idGasto: gasto.id,
        })

      // crear checkboxes y botones de ajuste de porciones
      for (const persona of personas) {
        const compromiso = compromisos.find(
          (c) => c.idPersona === persona.id && c.idGasto === gasto.id
        )
        if (!compromiso) {
          alert(`missing compromiso for ${persona.nombre} and ${gasto.nombre}`)
          continue
        }

        const tdCompromiso = document.createElement('td')
        tdCompromiso.id = compromiso.id

        trGastos.appendChild(tdCompromiso)

        const checkbox = document.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.checked = compromiso.tomado

        checkbox.onclick = async (event) => {
          if (checkbox.checked) {
            await this.model.incrementarCompromiso({
              idPersona: persona.id,
              idGasto: gasto.id,
            })
          } else {
            await this.model.decrementarCompromiso({
              idPersona: persona.id,
              idGasto: gasto.id,
            })
          }

          await this.actualizarTablaCompromisos()
          await this.actualizarTablaDeudas()
        }
        tdCompromiso.appendChild(checkbox)

        const btnDecr = document.createElement('button')
        btnDecr.className = 'btn btn-primary btn-sm mx-1 p-0 px-1'
        btnDecr.innerHTML = '-'
        btnDecr.onclick = async (event) => {
          await this.model.decrementarCompromiso({
            idPersona: persona.id,
            idGasto: gasto.id,
          })

          await this.actualizarTablaCompromisos()
          await this.actualizarTablaDeudas()
        }
        tdCompromiso.appendChild(btnDecr)

        const spanPorciones = document.createElement('span')
        spanPorciones.innerHTML = `${compromiso.porciones}`
        tdCompromiso.appendChild(spanPorciones)

        const btnIncr = document.createElement('button')
        btnIncr.className = 'btn btn-primary btn-sm mx-1 p-0 px-1'
        btnIncr.innerHTML = '+'
        btnIncr.onclick = async (event) => {
          await this.model.incrementarCompromiso({
            idPersona: persona.id,
            idGasto: gasto.id,
          })

          await this.actualizarTablaCompromisos()
          await this.actualizarTablaDeudas()
        }
        tdCompromiso.appendChild(btnIncr)

        if (compromiso.tomado) {
          checkbox.style.setProperty('display', 'none')
          btnDecr.style.setProperty('display', 'inline-block')
          spanPorciones.style.setProperty('display', 'inline-block')
          btnIncr.style.setProperty('display', 'inline-block')
        } else {
          checkbox.style.setProperty('display', 'inline-block')
          btnDecr.style.setProperty('display', 'none')
          spanPorciones.style.setProperty('display', 'none')
          btnIncr.style.setProperty('display', 'none')
        }
      }
    }
    this.mostrarSeccionCompromisos()
  }

  mostrarSeccionCompromisos() {
    seccionCompromisos.style.setProperty('display', 'block')
  }

  ocultarSeccionCompromisos() {
    seccionCompromisos.style.setProperty('display', 'none')
  }

  // DEUDAS

  async actualizarTablaDeudas() {
    logger.trace('actualizando tabla deudas')

    const deudaTotal = await this.model.obtenerTotal()

    if (deudaTotal === 0) {
      this.ocultarSeccionDeudas()
      return true
    }

    const personas = await this.model.obtenerPersonasHabilitadas()

    tbodyDeudas.replaceChildren()
    for (const persona of personas) {
      if (persona.deuda > 0) {
        const tr = document.createElement('tr')
        tbodyDeudas.appendChild(tr)

        const tdNombre = document.createElement('td')
        tr.appendChild(tdNombre)

        const aNode = document.createElement('a')
        tdNombre.appendChild(aNode)

        aNode.innerHTML = persona.nombre
        aNode.onclick = () => {
          // TODO: mostrar detalle de la deuda (qué gastos la causan?)
          this.preguntarSiBorrarPersona({
            nombrePersona: persona.nombre,
            idPersona: persona.id,
          })
        }

        const tdDeuda = document.createElement('td')
        tdDeuda.id = `tdDeuda-${persona.id}`
        tr.appendChild(tdDeuda)
      }
    }

    for (const persona of personas) {
      if (persona.deuda > 0) {
        const tdDeuda = typedQuerySelector(
          `#tdDeuda-${persona.id}`,
          HTMLTableCellElement
        )
        tdDeuda.replaceChildren(`$${persona.deuda.toFixed(2)}`)
      }
    }

    const thTotal = typedQuerySelector('#thTotal', HTMLTableCellElement)
    thTotal.replaceChildren(`$${deudaTotal.toFixed(2)}`)

    this.mostrarSeccionDeudas()
  }

  mostrarSeccionDeudas() {
    seccionDeudas.style.setProperty('display', 'block')
  }

  ocultarSeccionDeudas() {
    seccionDeudas.style.setProperty('display', 'none')
  }

  mostrarSeccionResumen() {
    sectionResumen.classList.remove('hidden')
    liCompromisos.classList.add('active')
  }

  ocultarSecciones() {
    sectionPersonas?.classList.add('hidden')
    sectionGastos?.classList.add('hidden')
    sectionResumen?.classList.add('hidden')
    liPersonas?.classList.remove('active')
    liGastos?.classList.remove('active')
    liCompromisos?.classList.remove('active')
  }

  // ------------------------------------------------------------------

  async preguntarSiBorrarPersona({ nombrePersona, idPersona }) {
    // @ts-ignore
    const result = await Swal.fire({
      title: `Eliminar a ${nombrePersona}?`,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: `Cancelar`,
      confirmButtonColor: BTN_CONFIRM_COLOR,
    })
    if (result.isConfirmed) {
      await this.model.eliminarPersona({ idPersona })

      await this.actualizarListaPersonas()
      await this.actualizarTablaCompromisos()
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
      await this.model.eliminarPersonas()

      await this.actualizarListaPersonas()
      await this.actualizarTablaCompromisos()
      await this.actualizarTablaDeudas()
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
        if (!value || isNaN(Number(value)) || Number(value) < 0.01) {
          return 'El monto debe ser un número mayor a 0.01'
        }
      },
      confirmButtonColor: BTN_CONFIRM_COLOR,
      // heightAuto: false
    })

    if (result.isConfirmed) {
      await this.model.modificarPrecioUnitarioGasto({ idGasto, precioUnitario: result.value })
      await this.actualizarListaGastos()
    }
  }

  async preguntarSiEditarCantidadGasto({ nombreGasto, idGasto }) {
    // @ts-ignore
    const result = await Swal.fire({
      title: nombreGasto,
      input: 'number',
      inputLabel: 'Ingrese la nueva cantidad',
      showCancelButton: true,
      confirmButtonText: 'Modificar',
      cancelButtonText: `Cancelar`,
      inputValidator: (value) => {
        if (!value || isNaN(Number(value)) || Number(value) < 0) {
          return 'La cantidad debe ser un número mayor o igual a 0'
        }
      },
      confirmButtonColor: BTN_CONFIRM_COLOR,
      // heightAuto: false
    })

    if (result.isConfirmed) {
      const cantidad = parseInt(result.value)
      await this.model.modificarCantidadGasto({
        idGasto,
        cantidad
      })
      await this.actualizarListaGastos()
    }
  }

  async preguntarSiBorrarGasto({ nombreGasto, idGasto }) {
    // @ts-ignore
    const result = await Swal.fire({
      title: `Eliminar ${nombreGasto}?`,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: `Cancelar`,
      confirmButtonColor: BTN_CONFIRM_COLOR,
      // heightAuto: false
    })

    if (result.isConfirmed) {
      await this.model.eliminarGasto({ idGasto })

      await this.actualizarListaGastos()
    }
  }

  async preguntarSiBorrarATodosLosGastos() {
    // @ts-ignore
    const result = await Swal.fire({
      title: `Eliminar todos los gastos?`,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: `Cancelar`,
      confirmButtonColor: BTN_CONFIRM_COLOR,
      // heightAuto: false
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
    if (liPersonas.classList.contains('active')) {
      await this.actualizarListaPersonas()
    } else if (liGastos.classList.contains('active')) {
      await this.actualizarListaGastos()
    } else if (liCompromisos.classList.contains('active')) {
      await this.actualizarTablaCompromisos()
      await this.actualizarTablaDeudas()
    } else {
      alert('error interno! ninguna seccion seleccionada!')
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
