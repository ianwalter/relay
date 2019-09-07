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
    this.print = new Print({ level: options.logLevel })
  }

  static request (options) {
    return async (req, res, next) => {
      options = handleOptions(options, req, res, next)
      if (req.app.locals[options.relay]) {
        try {
          req.relay = await req.app.locals[options.relay].request(req, options)
          next()
        } catch (err) {
          next(err)
        }
      } else {
        next(new Error(`${options.relay} not found in app.locals`))
      }
    }
  }

  static respond (options) {
    return (req, res, next) => {
      options = handleOptions(options, req, res, next)
      if (req.app.locals[options.relay]) {
        req.app.locals[options.relay].respond(res, req.relay)
      } else {
        next(new Error(`${options.relay} not found in app.locals`))
      }
    }
  }

  static proxy (options) {
    return async (req, res, next) => {
      options = handleOptions(options, req, res, next)
      if (req.app.locals[options.relay]) {
        await req.app.locals[options.relay].proxy(options)(req, res, next)
      } else {
        next(new Error(`${options.relay} not found in app.locals`))
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

  respond (res, { headers, statusCode, rawBody }) {
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
