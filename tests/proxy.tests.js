const { test } = require('@ianwalter/bff')
const express = require('express')
const request = require('supertest')
const Relay = require('../')
const createMockServer = require('./helpers/createMockServer.js')

const path = '/could-it-be'

test('proxy relays requests', async ({ expect }) => {
  const server = await createMockServer()
  const app = express()
  const relay = new Relay({ baseUrl: server.url })
  app.get(path, relay.proxy())
  const res = await request(app).get(path)
  expect(res.statusCode).toBe(201)
  expect(res.body.foo).toBe('Hello World!')
  await server.close()
})

test('proxy (static) relays requests', async ({ expect }) => {
  const server = await createMockServer()
  const app = express()
  app.locals.relay = new Relay({ baseUrl: server.url })
  app.get(path, Relay.proxy())
  const res = await request(app).get(path)
  expect(res.statusCode).toBe(201)
  expect(res.body.foo).toBe('Hello World!')
  await server.close()
})
