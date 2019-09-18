const { Requester } = require('@ianwalter/requester')
const merge = require('@ianwalter/merge')
const { Print } = require('@ianwalter/print')

const requester = new Requester({ shouldThrow: false })

const handleOptions = (options = {}, req, res, next) => merge(
  { relay: 'relay' },
  typeof options === 'function' ? options(req, res, next) : options
)

module.exports = class Relay {
  constructor (options = {}) {
    this.options = options
    this.print = new Print({ level: options.logLevel || 'info' })
  }

  static request (options) {
    return async (req, res, next) => {
      const { relay, ...rest } = handleOptions(options, req, res, next)
      if (req.app.locals[relay]) {
        try {
          req.relay = await req.app.locals[relay].request(req, rest)
          next()
        } catch (err) {
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
    this.print.debug(`Request to ${initial.url}`, options)
    return requester.request(initial.url, options)
  }

  respond (res, { req, headers, statusCode, body, rawBody }) {
    this.print.debug(`${statusCode} response to ${req.path}`, headers, body)
    res.set(headers).status(statusCode).end(rawBody)
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
