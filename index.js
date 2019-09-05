const { requester } = require('@ianwalter/requester')
const merge = require('@ianwalter/merge')

module.exports = class Relay {
  constructor (options = {}) {
    this.options = options
  }

  static request (options) {
    return async (req, res, next) => {
      if (req.app.locals.relay) {
        let additional = options
        if (typeof options === 'function') {
          additional = options(req, res, next)
        }
        req.relay = await req.app.locals.relay.request(req, additional)
        next()
      } else {
        next(new Error('relay not found in app.locals'))
      }
    }
  }

  static async respond (req, res, next) {
    if (req.app.locals.relay) {
      await req.app.locals.relay.respond(res, req.relay)
    } else {
      next(new Error('relay not found in app.locals'))
    }
  }

  static proxy (options) {
    return async (req, res, next) => {
      if (req.app.locals.relay) {
        req.app.locals.relay.proxy(options)(req, res, next)
      } else {
        next(new Error('relay not found in app.locals'))
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
    return requester.request(initial.url, options)
  }

  respond (res, { headers, statusCode, rawBody }) {
    res.set(headers).status(statusCode).end(rawBody)
  }

  proxy (options) {
    return async (req, res, next) => {
      try {
        let additional = options
        if (typeof options === 'function') {
          additional = options(req, res, next)
        }
        this.respond(res, await this.request(req, additional))
      } catch (err) {
        next(err)
      }
    }
  }
}
