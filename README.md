# relay
> A flexible API to forward HTTP requests to another server

[![npm page][npmImage]][npmUrl]
[![Build status][buildImage]][buildUrl]

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

Apache 2.0 with Commons Clause - See [LICENSE][licenseUrl]

&nbsp;

Created by [Ian Walter](https://iankwalter.com)

[npmImage]: https://img.shields.io/npm/v/@ianwalter/relay.svg
[npmUrl]: https://www.npmjs.com/package/@ianwalter/relay
[buildImage]: https://travis-ci.com/ianwalter/relay.svg?branch=master
[buildUrl]: https://travis-ci.com/ianwalter/relay
[licenseUrl]: https://github.com/ianwalter/relay/blob/master/LICENSE
