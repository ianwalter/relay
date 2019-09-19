const { test } = require('@ianwalter/bff')
const { createExpressServer } = require('@ianwalter/test-server')
const { Requester } = require('@ianwalter/requester')
const Relay = require('../')
const createMockServer = require('./helpers/createMockServer.js')

const path = '/could-it-be'
const requester = new Requester({ shouldThrow: false })

test('respond returns a 200 response successfully', async ctx => {
  const endServer = await createMockServer()
  const midServer = await createExpressServer()
  const relay = new Relay({ baseUrl: endServer.url })
  midServer.get(path, async (req, res) => {
    try {
      relay.respond(res, await relay.request(req))
    } catch (err) {
      ctx.fail(err)
    } finally {
      res.end()
    }
  })
  const response = await requester.get(`${midServer.url}${path}`)
  ctx.expect(response.body.foo).toBe('Hello World!')
  await endServer.close()
  await midServer.close()
})

test.only('respond returns a 404 response successfully', async ctx => {
  const endServer = await createMockServer()
  const midServer = await createExpressServer()
  const relay = new Relay({ baseUrl: endServer.url, logLevel: 'debug' })
  const path = '/missing-path'
  midServer.get(path, async (req, res) => {
    try {
      relay.respond(res, await relay.request(req))
    } catch (err) {
      ctx.fail(err)
    } finally {
      res.end()
    }
  })
  const response = await requester.get(`${midServer.url}${path}`)
  ctx.expect(response.statusCode).toBe(404)
  await endServer.close()
  await midServer.close()
})

test('respond (static) returns a 500 response successfully', async ctx => {
  const endServer = await createMockServer()
  const midServer = await createExpressServer()
  midServer.locals.relay = new Relay({ baseUrl: endServer.url })
  const path = '/error'
  midServer.delete(path, Relay.request(), Relay.respond())
  const response = await requester.delete(`${midServer.url}${path}`)
  ctx.expect(response.statusCode).toBe(500)
  await endServer.close()
  await midServer.close()
})
