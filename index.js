const got = require('got')

module.exports = class Relay {
  constructor (options = {}) {
    const defaults = { throwHttpErrors: false }
    this.options = Object.assign({}, defaults, options)
  }

  extractOptions (request, additional = {}) {
    const options = Object.assign({}, request, this.options, additional)
    return {
      ...options,
      body: typeof options.body === 'string'
        ? options.body
        : JSON.stringify(options.body),
      headers: Object.assign({}, request.headers, additional.headers),
      url: options.baseUrl ? `${options.baseUrl}${options.url}` : options.url
    }
  }

  async request (req, additional) {
    const options = this.extractOptions(req, additional)
    return got(options.url, options)
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
