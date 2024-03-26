const directions = {
  ASC: 1,
  DESC: -1
}

/**
 * @param {(object) => string} extractor 
 * @param {'ASC' | 'DESC'} direction
 */
export function by(extractor, direction = 'ASC') {
  return function (e1, e2) {
    if (extractor(e1) > extractor(e2)) return 1 * directions[direction]
    if (extractor(e1) < extractor(e2)) return -1 * directions[direction]
    return 0
  }
}
