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
      const response = await relay.request(req)
      const body = JSON.parse(response.body)
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
  const endServer = await createMockServer()
  const midServer = await createExpressServer()
  const relay = new Relay({ baseUrl: endServer.url })
  const path = '/mirror'
  const body = { artist: 'Little Dragon' }
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
  await requester.post(`${midServer.url}${path}`, { body })
  await endServer.close()
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
