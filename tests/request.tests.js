const { test } = require('@ianwalter/bff')
const express = require('express')
const request = require('supertest')
const Relay = require('../')
const createMockServer = require('./helpers/createMockServer.js')

test('request relays a GET request', async ({ expect, fail }) => {
  const server = await createMockServer()
  const path = '/could-it-be'
  const app = express()
  const relay = new Relay({ baseUrl: server.url })
  app.get(path, async (req, res) => {
    try {
      const { body } = await relay.request(req)
      expect(body.foo).toBe('Hello World!')
    } catch (err) {
      fail(err)
    } finally {
      res.end()
    }
  })
  await request(app).get(path)
  await server.close()
})

test('request relays a POST request', async ({ expect, fail }) => {
  const server = await createMockServer()
  const path = '/mirror'
  const app = express()
  app.use(express.json())
  const relay = new Relay({ baseUrl: server.url })
  const payload = { artist: 'Little Dragon' }
  app.post(path, async (req, res) => {
    try {
      const { body } = await relay.request(req)
      expect(body).toEqual(payload)
    } catch (err) {
      fail(err)
    } finally {
      res.end()
    }
  })
  await request(app).post(path).send(payload)
  await server.close()
})

test('request (static) relays a PUT request', async ({ expect }) => {
  const server = await createMockServer()
  const path = '/mirror'
  const app = express()
  app.use(express.json())
  app.locals.relay = new Relay({ baseUrl: server.url })
  const payload = { message: "Just don't breath and we'll stop time" }
  app.put(path, Relay.request(), async (req, res) => {
    expect(req.relay.body).toEqual(payload)
    res.end()
  })
  await request(app).put(path).send(payload)
  await server.close()
})
