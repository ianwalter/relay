const { test } = require('@ianwalter/bff')
const { createExpressServer } = require('@ianwalter/test-server')
const { requester } = require('@ianwalter/requester')
const Relay = require('../')
const createMockServer = require('./helpers/createMockServer.js')

const path = '/could-it-be'

test('proxy relays requests', async ({ expect }) => {
  const endServer = await createMockServer()
  const midServer = await createExpressServer()
  const relay = new Relay({ baseUrl: endServer.url })
  midServer.get(path, relay.proxy())
  const response = await requester.get(`${midServer.url}${path}`)
  expect(response.statusCode).toBe(201)
  expect(response.body.foo).toBe('Hello World!')
  await endServer.close()
  await midServer.close()
})

test('proxy (static) relays requests', async ({ expect }) => {
  const endServer = await createMockServer()
  const midServer = await createExpressServer()
  midServer.locals.relay = new Relay({ baseUrl: endServer.url })
  midServer.get(path, Relay.proxy())
  const response = await requester.get(`${midServer.url}${path}`)
  expect(response.statusCode).toBe(201)
  expect(response.body.foo).toBe('Hello World!')
  await endServer.close()
  await midServer.close()
})

test('proxy (static) relays gzipped request', async ({ expect }) => {
  const largeJsonBody = require('./helpers/largeJsonBody.json')
  const endServer = await createExpressServer()
  const path = '/large'
  endServer.get(path, (req, res) => res.json(largeJsonBody))
  const midServer = await createExpressServer()
  midServer.locals.relay = new Relay({ baseUrl: endServer.url })
  midServer.get(path, Relay.proxy())
  const response = await requester.get(`${midServer.url}${path}`)
  expect(response.statusCode).toBe(200)
  expect(response.body).toEqual(largeJsonBody)
  await endServer.close()
  await midServer.close()
})
