/**
 * @param {string} aString
 */
export function capitalized(aString) {
  return aString
    .split(' ')
    .map(w => w[0].toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

export function normalized(nombre) {
  return nombre.replaceAll(' ', '_')
}
