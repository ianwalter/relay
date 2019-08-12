const { test } = require('@ianwalter/bff')
const express = require('express')
const request = require('supertest')
const proxyquire = require('proxyquire')
const Relay = require('../')
const createMockServer = require('./helpers/createMockServer.js')

test(`request doesn't add falsy options`, async ({ expect }) => {
  const server = await createMockServer()
  const call = {}
  const got = (url, options) => {
    call.url = url
    call.options = options
  }
  const Relay = proxyquire('../', { got })
  const relay = new Relay({ baseUrl: server.url })
  const url = '/test'
  const headers = { 'content-type': 'application/json' }
  const authHeader = { 'authorization': 'Bearer abc123' }
  relay.request({ url, headers }, { headers: authHeader })
  expect(call.url).toBe(url)
  expect(call.options.baseUrl).toBe(server.url)
  expect(call.options.throwHttpErrors).toBe(false)
  expect(call.options.headers).toEqual({ ...headers, ...authHeader })
  await server.close()
})

test('request relays a GET request', async ({ expect, fail }) => {
  const server = await createMockServer()
  const path = '/could-it-be'
  const app = express()
  const relay = new Relay({ baseUrl: server.url })
  app.get(path, async (req, res) => {
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
      const response = await relay.request(req)
      const body = JSON.parse(response.body)
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
