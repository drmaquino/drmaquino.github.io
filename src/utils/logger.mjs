function write(message) {
  //@ts-ignore
  if (process.env.DEBUG) console.log(message)
}

export const logger = {
  error: function (message) {
    write(`error: ${message}`)
  },
  trace: function (message) {
    write(`trace: ${message}`)
  },
  debug: function (tag, object) {
    write(`${tag}: ${JSON.stringify(object, null, 2)}`)
  }
}