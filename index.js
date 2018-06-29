const got = require('got')

module.exports = class Relay {
  constructor (options = {}) {
    this.options = options
  }

  extractOptions (request, additional = {}) {
    const options = Object.assign({}, request, additional)
    const url = this.options.baseUrl
      ? `${this.options.baseUrl}${options.url}`
      : options.url
    return {
      method: options.method,
      headers: Object.assign({}, request.headers, additional.headers),
      url
    }
  }

  async request (req, additional) {
    const options = this.extractOptions(req, additional)
    return got(options.url, options)
  }

  proxy (options) {
    return async (req, res, next) => {
      try {
        const response = await this.request(req, options)
        res.set(response.headers).status(response.statusCode).end(response.body)
      } catch (err) {
        next(err)
      }
    }
  }
}
