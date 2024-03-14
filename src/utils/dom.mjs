/**
 * Queries for an HTML element by name or selector and ensures it is of the specified class type.
 *
 * @template T
 * @param {string} name - The name or selector to query for an element.
 * @param {new (...args: any[]) => T} HTMLType - The class constructor of the expected element type.
 * @returns {T} An instance of the specified class type.
 * @throws {Error} Throws an error if the element is not found or is not of the expected class type.
 */
export function typedQuerySelector(name, HTMLType) {
  const element = document.querySelector(name)
  if (!element) {
    throw new Error(name + ': no encontrado')
  }
  if (!(element instanceof HTMLType)) {
    throw new Error(`${name}: no es del tipo esperado:
  Esperaba: ${HTMLType.name}. Encontré: ${element.tagName}`)
  }

  return element
}

// export function typedQuerySelector(name, HTMLType) {
//   return document.querySelector(name)
// }

/**
 * Query for HTML elements by their name or selector and ensure they are of the specified class type.
 *
 * @template T
 * @param {string} name - The name or selector to query for elements.
 * @param {new (...args: any[]) => T} HTMLType - The class constructor of the expected element type.
 * @returns {T[]} An array of instances of the specified class type.
 * @throws {Error} Throws an error if any of the selected elements are not of the expected class type.
 */
export function typedQuerySelectorAll(name, HTMLType) {
  const result = []
  for (const element of document.querySelectorAll(name)) {
    if (element instanceof HTMLType) {
      result.push(element)
    } else {
      throw new Error(`${name}: no es del tipo esperado:
      Esperaba: ${HTMLType.name}. Encontré: ${element.tagName}`)
    }
  }
  return result
}
