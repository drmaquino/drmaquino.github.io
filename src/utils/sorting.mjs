export function by(field, direction = 1) {
  return (e1, e2) => {
    if (e1[field] > e2[field]) return 1 * direction
    if (e1[field] < e2[field]) return -1 * direction
    return 0
  }
}
