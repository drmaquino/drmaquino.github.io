import { Sistema } from '../../src/classes/Sistema.mjs'
import { ComprasRepository } from '../../src/repositories/compras.repository.mjs'
import { GastosRepository } from '../../src/repositories/gastos.repository.mjs'
import { PersonasRepository } from '../../src/repositories/personas.repository.mjs'
import { MemoryStorage } from '../../src/storages/memory-storage.mjs'

/** @returns {import('../../src/classes/Deuda.mjs').DeudaDto[]} */
export function mockearDeudas(...pares) {
  return pares.map(([persona, monto]) => ({ persona, monto }))
}

/** @returns {import('../../src/classes/Sistema.mjs').PersonaViewDto[]} */
export function mockearPersonas(...pares) {
  return pares.map(([persona, enCompra = true]) => ({ ...persona, enCompra }))
}

/** @returns {import('../../src/classes/Sistema.mjs').GastoViewDto[]} */
export function mockearGastos(...pares) {
  return pares.map(([gasto, enCompra = true]) => ({ ...gasto, enCompra }))
}

export async function crearSistema() {
  const personasStorage = new MemoryStorage('personas')
  const gastosStorage = new MemoryStorage('gastos')
  const comprasStorage = new MemoryStorage('compras')

  const gastosRepository = new GastosRepository(gastosStorage)
  const personasRepository = new PersonasRepository(personasStorage)
  const comprasRepository = new ComprasRepository(comprasStorage)

  const sistema = new Sistema({
    personasRepository,
    gastosRepository,
    comprasRepository,
  })

  await sistema.init()

  return sistema
}

