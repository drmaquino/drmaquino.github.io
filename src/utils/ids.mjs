function randInt(digitos) {
  const min = 10 ** (digitos - 1)
  const max = (10 ** digitos) - 1
  return Math.floor(min + Math.random() * (max - min))
}
export function randomId() {
  return `${Date.now().toString(16)}-${randInt(6).toString(16)}`
}
