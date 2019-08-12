const { requester } = require('@ianwalter/requester')
const merge = require('@ianwalter/merge')

module.exports = class Relay {
  constructor (options = {}) {
    const defaults = { throwHttpErrors: false }
    this.options = merge({}, defaults, options)
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

  static proxy (options) {
    return async (req, res, next) => {
      if (req.app.locals.relay) {
        req.app.locals.relay.proxy(options)(req, res, next)
      } else {
        next(new Error('relay not found in app.locals'))
      }
    }
  }

  proxy (options) {
    return async (req, res, next) => {
      try {
        let additional = options
        if (typeof options === 'function') {
          additional = options(req, res, next)
        }
        this.send(res, await this.request(req, additional))
      } catch (err) {
        next(err)
      }
    }
  }

  send (res, { headers, statusCode, rawBody }) {
    res.set(headers).status(statusCode).end(rawBody)
  }
}
