import { typedQuerySelector } from '../utils/dom.mjs'
import { Sistema } from '../classes/Sistema.mjs'

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
const listadoGastos = typedQuerySelector('#listadoGastos', HTMLDivElement)
const tbodyGastos = typedQuerySelector('#tbodyGastos', HTMLTableSectionElement)
const linkEliminarTodosLosGastos = typedQuerySelector('#linkEliminarTodosLosGastos', HTMLAnchorElement)

// seccion consumiciones
const sectionResumen = typedQuerySelector('#sectionResumen', HTMLElement)

const seccionConsumiciones = typedQuerySelector('#seccionConsumiciones', HTMLDivElement)
const trCabeceraConsumiciones = typedQuerySelector('#trCabeceraConsumiciones', HTMLTableRowElement)
const tbodyConsumiciones = typedQuerySelector('#tbodyConsumiciones', HTMLTableSectionElement)

const seccionDeudas = typedQuerySelector('#seccionDeudas', HTMLDivElement)
const tbodyDeudas = typedQuerySelector('#deudas', HTMLTableSectionElement)

// navbar
const liPersonas = typedQuerySelector('#liPersonas', HTMLLIElement)
const liGastos = typedQuerySelector('#liGastos', HTMLLIElement)
const liConsumiciones = typedQuerySelector('#liConsumiciones', HTMLLIElement)

const BTN_CONFIRM_COLOR = '#3c5999'

export class View {
  /** @param {Sistema} model */
  constructor(model) {
    this.model = model

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
        await this.model.agendarPersona({ nombre })

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
        await this.model.agendarGasto({ nombre, precio: precioUnitario })

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

    liConsumiciones.addEventListener('click', async () => {
      this.ocultarSecciones()
      await this.actualizarTablaConsumiciones()
      await this.actualizarTablaDeudas()
      this.mostrarSeccionResumen()
    })
  }

  async actualizarListaPersonas() {

    const personas = await this.model.verPersonas()

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
      sliderBox.checked = this.model.verSiPersonaEstaEnCompraEnCurso(persona.id) //persona.habilitada
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

    const gastos = await this.model.verGastos()

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

  async actualizarTablaConsumiciones() {

    const items = this.model.compraEnCurso.items

    if (items.length === 0) {
      this.ocultarSeccionConsumiciones()
      return true
    }

    const personas = this.model.compraEnCurso.personas

    if (personas.length === 0) {
      this.ocultarSeccionConsumiciones()
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
        this.preguntarSiDeshabilitarPersona({
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
        this.preguntarSiDeshabilitarGasto({
          nombreGasto: item.gasto.nombre,
          idGasto: item.gasto.id,
        })

      // crear checkboxes y botones de ajuste de items
      for (const persona of personas) {
        const tdConsumicion = document.createElement('td')
        trGastos.appendChild(tdConsumicion)

        const consumicion = item.buscarConsumicion(persona.id)

        if (!consumicion) {
          const checkbox = document.createElement('input')
          checkbox.type = 'checkbox'
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
          const btnDecr = document.createElement('button')
          btnDecr.className = 'btn btn-primary btn-sm mx-1 p-0 px-1'
          btnDecr.innerHTML = '-'
          btnDecr.onclick = async (event) => {
            await this.model.reducirConsumicion({ idPersona: persona.id, idGasto: item.gasto.id })
            await this.actualizarTablaConsumiciones()
            await this.actualizarTablaDeudas()
          }
          tdConsumicion.appendChild(btnDecr)

          const aNodeItems = document.createElement('a')
          aNodeItems.innerHTML = `${consumicion.porciones}`
          tdConsumicion.appendChild(aNodeItems)

          const btnIncr = document.createElement('button')
          btnIncr.className = 'btn btn-primary btn-sm mx-1 p-0 px-1'
          btnIncr.innerHTML = '+'
          btnIncr.onclick = async (event) => {
            await this.model.aumentarConsumicion({ idPersona: persona.id, idGasto: item.gasto.id })
            await this.actualizarTablaConsumiciones()
            await this.actualizarTablaDeudas()
          }
          tdConsumicion.appendChild(btnIncr)
        }
      }
    }
    this.mostrarSeccionConsumiciones()
  }

  mostrarSeccionConsumiciones() {
    seccionConsumiciones.style.setProperty('display', 'block')
  }

  ocultarSeccionConsumiciones() {
    seccionConsumiciones.style.setProperty('display', 'none')
  }

  // DEUDAS

  async actualizarTablaDeudas() {

    const deudas = await this.model.verDeudasCompraEnCurso()
      .sort(
        (d, dd) => d.persona.nombre > dd.persona.nombre
          ? 1
          : d.persona.nombre < dd.persona.nombre
            ? -1
            : 0
      )

    const deudaTotal = deudas.reduce((accum, d) => accum + d.monto, 0)

    if (Math.round(deudaTotal) === 0) {
      this.ocultarSeccionDeudas()
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
        aNode.innerHTML = deuda.persona.nombre
        tdNombre.appendChild(aNode)

        const tdDeuda = document.createElement('td')
        tdDeuda.replaceChildren(`$${deuda.monto.toFixed(2)}`)
        tr.appendChild(tdDeuda)
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
    liConsumiciones.classList.add('active')
  }

  ocultarSecciones() {
    sectionPersonas?.classList.add('hidden')
    sectionGastos?.classList.add('hidden')
    sectionResumen?.classList.add('hidden')
    liPersonas?.classList.remove('active')
    liGastos?.classList.remove('active')
    liConsumiciones?.classList.remove('active')
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
      await this.model.eliminarPersona(idPersona)

      await this.actualizarListaPersonas()
      await this.actualizarTablaConsumiciones()
      await this.actualizarTablaDeudas()
    }
  }

  async preguntarSiDeshabilitarPersona({ nombrePersona, idPersona }) {
    // @ts-ignore
    const result = await Swal.fire({
      title: `Deshabilitar a ${nombrePersona}?`,
      showCancelButton: true,
      confirmButtonText: 'Deshabilitar',
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
      await this.actualizarTablaConsumiciones()
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
      title: `Eliminar ${nombreGasto}?`,
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

  async preguntarSiDeshabilitarGasto({ nombreGasto, idGasto }) {
    // @ts-ignore
    const result = await Swal.fire({
      title: `Deshabilitar ${nombreGasto}?`,
      showCancelButton: true,
      confirmButtonText: 'Deshabilitar',
      cancelButtonText: `Cancelar`,
      confirmButtonColor: BTN_CONFIRM_COLOR,
    })

    if (result.isConfirmed) {
      await this.model.quitarGastoDeCompraEnCurso(idGasto)
      await this.actualizarTablaConsumiciones()
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
    if (liPersonas.classList.contains('active')) {
      await this.actualizarListaPersonas()
    } else if (liGastos.classList.contains('active')) {
      await this.actualizarListaGastos()
    } else if (liConsumiciones.classList.contains('active')) {
      await this.actualizarTablaConsumiciones()
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
