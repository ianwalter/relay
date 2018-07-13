const got = require('got')

module.exports = class Relay {
  constructor (options = {}) {
    const defaults = { throwHttpErrors: false }
    this.options = Object.assign({}, defaults, options)
  }

  extractOptions (request, additional = {}) {
    const options = Object.assign({}, request, this.options, additional)
    return {
      throwHttpErrors: options.throwHttpErrors,
      method: options.method,
      headers: Object.assign({}, request.headers, additional.headers),
      url: options.baseUrl ? `${options.baseUrl}${options.url}` : options.url
    }
  }

  async request (req, additional) {
    const options = this.extractOptions(req, additional)
    return got(options.url, options)
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
