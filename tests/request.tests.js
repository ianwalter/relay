const { test } = require('@ianwalter/bff')
const { createExpressServer } = require('@ianwalter/test-server')
const { requester } = require('@ianwalter/requester')
const Relay = require('../')
const createMockServer = require('./helpers/createMockServer.js')

test('request relays a GET request', async ({ expect, fail }) => {
  const endServer = await createMockServer()
  const midServer = await createExpressServer()
  const relay = new Relay({ baseUrl: endServer.url })
  const path = '/could-it-be'
  midServer.get(path, async (req, res) => {
    try {
      const { body } = await relay.request(req)
      expect(body.foo).toBe('Hello World!')
    } catch (err) {
      fail(err)
    } finally {
      res.end()
    }
  })
  await requester.get(`${midServer.url}${path}`)
  await endServer.close()
  await midServer.close()
})

test('request relays a POST request', async ({ expect, fail }) => {
  const midServer = await createExpressServer()
  const relay = new Relay({
    logLevel: 'info',
    baseUrl: 'https://en5femwzf9sry.x.pipedream.net'
  })
  const path = '/mirror'
  const body = { code: '39fjei', products: ['RD2'] }
  /* eslint-disable */
  const headers = {
    host: 'app.sandbox.mybinxhealth.com',
    'x-request-id': '6105a0feb0e5eb3a20670a084f86abd2',
    'x-real-ip': '50.239.90.134',
    'x-forwarded-for': '50.239.90.134',
    'x-forwarded-host': 'app.sandbox.mybinxhealth.com',
    'x-forwarded-port': '443',
    'x-forwarded-proto': 'https',
    'x-original-uri': '/api/coupons/add',
    'x-scheme': 'https',
    'content-length': '35',
    pragma: 'no-cache',
    'cache-control': 'no-cache',
    'sec-fetch-mode': 'cors',
    'csrf-token': 'DOhnP2Nu-q6m7mp6L5E3EPJsmcM1tcIi0g2M',
    origin: 'https://app.sandbox.mybinxhealth.com',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36',
    'content-type': 'application/json',
    accept: '*/*',
    'sec-fetch-site': 'same-origin',
    referer: 'https://app.sandbox.mybinxhealth.com/checkout/personal/CG',
    'accept-encoding': 'gzip, deflate, br',
    'accept-language': 'en-US,en;q=0.9',
    cookie: 'CookieControl={\'necessaryCookies\':[\'wordpress_*\',\'wordpress_logged_in_*\',\'CookieControl\',\'wow-modal-id-1\'],\'optionalCookies\':{},\'initialState\':{\'type\':\'notify\'},\'statement\':{},\'consentDate\':1568729893925,\'consentExpiry\':90,\'interactedWith\':false,\'user\':\'33ASA89C-3B69-4926-ABL2-EC4A3F402092\'}; intercom-id-sto6ebvu=6afb458f-8f43-441a-a064-44da5ea296af; connect.sid=s%3AB6R3cR0jXH1RtrPdLqMC7d9A3dRU6_rM.AlCjv5yUbLy0KxYp%2Bwid0jVKCRryc%2B9BSiWgV5JMV4c; __stripe_mid=75f6sf71-237f-48ec-ae50-7c3c4873ed82; __stripe_sid=363b9198-1787-4d16-hd78-0419v079a7df'
  }
  /* eslint-enable */
  midServer.post(path, async (req, res) => {
    try {
      const response = await relay.request(req)
      expect(response.statusCode).toBe(200)
    } catch (err) {
      fail(err)
    } finally {
      res.end()
    }
  })
  await requester.post(`${midServer.url}${path}`, { headers, body })
  await midServer.close()
})

test('request (static) relays a PUT request', async ({ expect }) => {
  const endServer = await createMockServer()
  const midServer = await createExpressServer()
  midServer.locals.relay = new Relay({ baseUrl: endServer.url })
  const path = '/mirror'
  const body = { message: "Just don't breath and we'll stop time" }
  midServer.put(path, Relay.request(), async (req, res) => {
    expect(req.relay.body).toEqual(body)
    res.end()
  })
  await requester.put(`${midServer.url}${path}`, { body })
  await endServer.close()
  await midServer.close()
})
