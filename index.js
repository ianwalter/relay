const got = require('got')

module.exports = class Relay {
  constructor (options = {}) {
    const defaults = { throwHttpErrors: false }
    this.options = Object.assign({}, defaults, options)
  }

  async request (req, additional = {}) {
    const options = {
      ...(req.body ? { body: req.body } : {}),
      ...(req.method ? { method: req.method } : {}),
      ...(req.headers ? { headers: req.headers } : {})
    }
    Object.assign(options, this.options, additional)
    if (typeof options.body === 'object') {
      options.body = JSON.stringify(options.body)
    }
    return got(req.url, options)
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
