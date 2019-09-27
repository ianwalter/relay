const got = require('got')
const { Requester } = require('@ianwalter/requester')
const merge = require('@ianwalter/merge')
const { Print } = require('@ianwalter/print')

const handleOptions = (options = {}, req, res, next) => merge(
  { relay: 'relay' },
  typeof options === 'function' ? options(req, res, next) : options
)

module.exports = class Relay {
  constructor (options = {}) {
    const defaults = { throwHttpErrors: false, decompress: false }
    this.options = merge({ logLevel: 'info' }, defaults, options)
    this.print = new Print({ level: this.options.logLevel })
  }

  static request (options) {
    return async (req, res, next) => {
      const { relay, ...rest } = handleOptions(options, req, res, next)
      if (req.app.locals[relay]) {
        const response = await req.app.locals[relay].request(req, rest)

        // Shape the response so it's more convenient to work with. Also remove
        // the content headers so that there's no mismatch if different content
        // is sent via the respond method.
        req.relay = Requester.shapeResponse(response)
        delete req.relay.headers['content-encoding']
        delete req.relay.headers['content-type']
        delete req.relay.headers['content-length']

        const { statusCode, statusText, headers, body } = req.relay
        req.app.locals[relay].print.debug(
          'Static request result',
          { statusCode, statusText, headers, body }
        )
        next()
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
        await req.app.locals[relay].proxy(rest)(req, res)
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
    Requester.shapeRequest(options)
    this.print.debug(`Request to ${initial.url}`, options)
    return got(initial.url, options)
  }

  respond (res, { req, headers, statusCode, body }) {
    this.print.debug(`${statusCode} response to ${req.path}`, headers, body)
    res.set(headers).status(statusCode).send(body)
  }

  proxy (options) {
    return async (req, res) => {
      this.respond(res, await this.request(req, options))
    }
  }
}
