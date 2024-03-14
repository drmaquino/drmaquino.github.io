/**
 * @param {string} nombre
 */

export function capitalized(nombre) {
  return nombre
    .split(' ')
    .map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

export function normalized(nombre) {
  // @ts-ignore
  return nombre.replaceAll(' ', '_')
}
