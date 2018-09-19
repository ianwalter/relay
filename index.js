const got = require('got')
const merge = require('deepmerge')

module.exports = class Relay {
  constructor (options = {}) {
    const defaults = { throwHttpErrors: false }
    this.options = Object.assign({}, defaults, options)
  }

  async request (initial, additional = {}) {
    const initialOptions = {
      ...(initial.body ? { body: initial.body } : {}),
      ...(initial.method ? { method: initial.method } : {}),
      ...(initial.headers ? { headers: initial.headers } : {})
    }
    const options = merge.all([initialOptions, this.options, additional])
    if (typeof options.body === 'object') {
      options.body = JSON.stringify(options.body)
    }
    return got(initial.url, options)
  }

  static proxy (options) {
    return async (req, res, next) => {
      if (req.app.locals.relay) {
        try {
          if (typeof options === 'function') {
            options = options(req, res, next)
          }
          const response = await req.app.locals.relay.request(req, options)
          req.app.locals.relay.send(res, response)
        } catch (err) {
          next(err)
        }
      } else {
        next(new Error('relay not found in app.locals'))
      }
    }
  }

  proxy (options) {
    return async (req, res, next) => {
      try {
        this.send(res, await this.request(req, options))
      } catch (err) {
        next(err)
      }
    }
  }

  send (res, { headers, statusCode, body }) {
    res.set(headers).status(statusCode).end(body)
  }
}
