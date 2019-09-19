const got = require('got')
const merge = require('@ianwalter/merge')
const { Print } = require('@ianwalter/print')

const handleOptions = (options = {}, req, res, next) => merge(
  { relay: 'relay' },
  typeof options === 'function' ? options(req, res, next) : options
)

module.exports = class Relay {
  constructor (options = {}) {
    this.options = Object.assign({ logLevel: 'info' }, options)
    this.print = new Print({ level: this.options.logLevel })
  }

  static request (options) {
    return async (req, res, next) => {
      const { relay, ...rest } = handleOptions(options, req, res, next)
      if (req.app.locals[relay]) {
        try {
          const response = await req.app.locals[relay].request(req, rest)

          if (
            response.body &&
            response.headers &&
            response.headers['content-type'] &&
            response.headers['content-type'].includes('application/json')
          ) {
            response.body = JSON.parse(response.body)
          }

          req.relay = response
          req.app.locals[relay].print.debug('Static request result', req.relay)
          next()
        } catch (err) {
          req.app.locals[relay].print.debug('Static request error', err)
          next(err)
        }
      } else {
        next(new Error(`${relay} not found in app.locals`))
      }
    }
  }

  static respond (options) {
    return (req, res, next) => {
      const { relay } = handleOptions(options, req, res, next)
      if (req.app.locals[relay]) {
        req.app.locals[relay].respond(res, req.relay)
      } else {
        next(new Error(`${relay} not found in app.locals`))
      }
    }
  }

  static proxy (options) {
    return async (req, res, next) => {
      const { relay, ...rest } = handleOptions(options, req, res, next)
      if (req.app.locals[relay]) {
        await req.app.locals[relay].proxy(rest)(req, res, next)
      } else {
        next(new Error(`${relay} not found in app.locals`))
      }
    }
  }

  async request (initial, additional = {}) {
    const initialOptions = {
      ...(initial.body ? { body: initial.body } : {}),
      ...(initial.method ? { method: initial.method } : {}),
      ...(initial.headers ? { headers: initial.headers } : {})
    }
    const options = merge(initialOptions, this.options, additional)
    if (typeof options.body === 'object') {
      options.body = JSON.stringify(options.body)
      options.headers['content-length'] = `${Buffer.byteLength(options.body)}`
    }
    this.print.debug(`Request to ${initial.url}`, options)
    delete options.headers.connection
    // console.log(options)
    return got(initial.url, options)
  }

  respond (res, { req, headers, statusCode, body }) {
    this.print.debug(`${statusCode} response to ${req.path}`, headers, body)
    res.set(headers).status(statusCode).send(body)
  }

  proxy (options) {
    return async (req, res, next) => {
      try {
        this.respond(res, await this.request(req, options))
      } catch (err) {
        next(err)
      }
    }
  }
}
