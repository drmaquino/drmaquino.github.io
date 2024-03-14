export async function populate(model) {
  await model.resetearSistema()
  const p1 = await model.agregarPersona({ nombre: 'Marian A', deuda: 0 })
  const p2 = await model.agregarPersona({ nombre: 'Carli G', deuda: 0 })
  const p3 = await model.agregarPersona({ nombre: 'Nare G', deuda: 0 })
  const p4 = await model.agregarPersona({ nombre: 'Iaru G', deuda: 0 })

  const g1 = await model.agregarGasto({ nombre: '1 Viatico', precioUnitario: 100 })
  const g2 = await model.agregarGasto({ nombre: '2 Salidas', precioUnitario: 200 })
  const g3 = await model.agregarGasto({ nombre: '3 Comidas', precioUnitario: 300 })

  await model.incrementarCompromiso({ idGasto: g1.id, idPersona: p1.id })
  await model.incrementarCompromiso({ idGasto: g1.id, idPersona: p2.id })
  await model.incrementarCompromiso({ idGasto: g2.id, idPersona: p1.id })
  await model.incrementarCompromiso({ idGasto: g2.id, idPersona: p2.id })
  await model.incrementarCompromiso({ idGasto: g2.id, idPersona: p3.id })
  await model.incrementarCompromiso({ idGasto: g3.id, idPersona: p1.id })
  await model.incrementarCompromiso({ idGasto: g3.id, idPersona: p2.id })
  await model.incrementarCompromiso({ idGasto: g3.id, idPersona: p3.id })
  await model.incrementarCompromiso({ idGasto: g3.id, idPersona: p4.id })
}
