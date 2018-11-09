# relay
> A flexible API to forward HTTP requests to another server

[![Npm page][npm-image]][npm-url]
[![Build status][build-image]][build-url]

## Installation

```console
npm install @ianwalter/relay --save
```

## Usage

[Express](http://expressjs.com) setup example:

```js
const Relay = require('@ianwalter/relay')

// Create the Relay instance and save it to the Express app instance so that
// route handlers will be able to access it when called.
const app = express()
app.locals.relay = new Relay({ baseUrl: process.env.API_URL })
```

Express simple proxy example:

```js
const Relay = require('@ianwalter/relay')

// Proxy all requests to /api/account to /api/account on the baseUrl setup in
// the example above.
app.post('/api/account', Relay.proxy())
```

Express advanced proxy example:

```js
const Relay = require('@ianwalter/relay')

// Pass the addAuthHeader function into the proxy options so that the authToken
// in the user's session is passed as an Authorization header when proxying
// requests to the other server.
const addAuthHeader = req => ({
  headers: { 'Authorization': req.session.authToken }
})
app.put('/api/account', Relay.proxy(addAuthHeader))
```

## License

Apache 2.0 with Commons Clause - See [LICENSE](https://github.com/ianwalter/relay/blob/master/LICENSE)

&nbsp;

Created by [Ian Walter](https://iankwalter.com)

[npm-image]: https://img.shields.io/npm/v/@ianwalter/relay.svg
[npm-url]: https://www.npmjs.com/package/@ianwalter/relay
[build-image]: https://travis-ci.com/ianwalter/relay.svg?branch=master
[build-url]: https://travis-ci.com/ianwalter/relay
