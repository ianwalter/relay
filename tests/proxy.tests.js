const { test } = require('@ianwalter/bff')
const express = require('express')
const request = require('supertest')
const Relay = require('../')

const baseUrl = 'http://localhost:7331'
const path = '/could-it-be'

test('proxy relays requests', async ({ expect }) => {
  const app = express()
  const relay = new Relay({ baseUrl })
  app.get(path, relay.proxy())
  const res = await request(app).get(path)
  expect(res.statusCode).toBe(201)
  expect(res.body.foo).toBe('Hello World!')
})

test('proxy (static) relays requests', async ({ expect }) => {
  const app = express()
  app.locals.relay = new Relay({ baseUrl })
  app.get(path, Relay.proxy())
  const res = await request(app).get(path)
  expect(res.statusCode).toBe(201)
  expect(res.body.foo).toBe('Hello World!')
})
