const { test } = require('@ianwalter/bff')
const express = require('express')
const request = require('supertest')
const Relay = require('../')
const createMockServer = require('./helpers/createMockServer.js')

const path = '/could-it-be'

test('respond returns a 200 response successfully', async ctx => {
  const server = await createMockServer()
  const app = express()
  const relay = new Relay({ baseUrl: server.url })
  app.get(path, async (req, res) => {
    try {
      relay.respond(res, await relay.request(req))
    } catch (err) {
      ctx.fail(err)
    } finally {
      res.end()
    }
  })
  const response = await request(app).get(path)
  ctx.expect(response.body.foo).toBe('Hello World!')
  await server.close()
})

test('respond returns a 404 response successfully', async ctx => {
  const server = await createMockServer()
  const app = express()
  const relay = new Relay({ baseUrl: server.url })
  const path = '/missing-path'
  app.get(path, async (req, res) => {
    try {
      relay.respond(res, await relay.request(req))
    } catch (err) {
      ctx.fail(err)
    } finally {
      res.end()
    }
  })
  const response = await request(app).get(path)
  ctx.expect(response.status).toBe(404)
  await server.close()
})

test('respond (static) returns a 500 response successfully', async ctx => {
  const server = await createMockServer()
  const app = express()
  app.locals.relay = new Relay({ baseUrl: server.url })
  const path = '/error'
  app.delete(path, Relay.request(), Relay.respond())
  const response = await request(app).delete(path)
  ctx.expect(response.status).toBe(500)
  await server.close()
})
