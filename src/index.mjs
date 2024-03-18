import { RUNNING_IN_BROWSER } from './config/environment.mjs'

let Storage
if (RUNNING_IN_BROWSER) {
  const { LocalStorage } = await import('./storage/local-storage.mjs')
  Storage = LocalStorage
} else {
  const { FileStorage } = await import('./storage/file-storage.mjs')
  Storage = FileStorage
}

import { PersonasRepository } from './repositories/personas.repository.mjs'
import { CompromisosRepository } from './repositories/compromisos.repository.mjs'
import { GastosRepository } from './repositories/gastos.repository.mjs'
import { ConfigRepository } from './repositories/config.repository.mjs'

import { GastosService } from './services/gastos.service.mjs'
import { CompromisosService } from './services/compromisos.service.mjs'
import { PersonasService } from './services/personas.service.mjs'
import { ConfigService } from './services/config.service.mjs'
import { AdministradorService } from './services/administrador.service.mjs'

import { View } from './views/view.js'
import { typedQuerySelector } from './utils/dom.mjs'

const personasRepository = new PersonasRepository(new Storage('admin.personas'))
const compromisosRepository = new CompromisosRepository(
  new Storage('admin.compromisos')
)
const gastosRepository = new GastosRepository(new Storage('admin.gastos'))
const configRepository = new ConfigRepository(new Storage('admin.config'))

const personasService = new PersonasService(personasRepository)
const compromisosService = new CompromisosService(compromisosRepository)
const gastosService = new GastosService(gastosRepository)
const configService = new ConfigService(configRepository)

const adminService = new AdministradorService(
  personasService,
  compromisosService,
  gastosService,
  configService
)

const view = new View(adminService)

await view.refresh()
