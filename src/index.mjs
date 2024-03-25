import { Sistema } from './classes/Sistema.mjs'
import { GastosRepository } from './repositories/gastos.repository.mjs'
import { PersonasRepository } from './repositories/personas.repository.mjs'
import { ComprasRepository } from './repositories/compras.repository.mjs'
import { LocalStorage } from './storages/local-storage.mjs'
import { View } from './views/view.js'

const personasStorage = new LocalStorage('personas')
const gastosStorage = new LocalStorage('gastos')
const comprasStorage = new LocalStorage('compras')

const personasRepository = new PersonasRepository(personasStorage)
const gastosRepository = new GastosRepository(gastosStorage)
const comprasRepository = new ComprasRepository(comprasStorage)

const sistema = new Sistema({
  personasRepository,
  gastosRepository,
  comprasRepository
})

const view = new View(sistema)

await view.refresh()
