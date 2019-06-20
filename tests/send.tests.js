const { test } = require('@ianwalter/bff')
const express = require('express')
const request = require('supertest')
const Relay = require('../')
const createMockServer = require('./helpers/createMockServer.js')

const path = '/could-it-be'

test('send returns a 200 response successfully', async ({ expect, fail }) => {
  const server = await createMockServer()
  const app = express()
  const relay = new Relay({ baseUrl: server.url })
  app.get(path, async (req, res) => {
    try {
      relay.send(res, await relay.request(req))
    } catch (err) {
      fail(err)
    } finally {
      res.end()
    }
  })
  const response = await request(app).get(path)
  expect(response.body.foo).toBe('Hello World!')
  await server.close()
})

test('send returns a 404 response successfully', async ({ expect, fail }) => {
  const server = await createMockServer()
  const app = express()
  const relay = new Relay({ baseUrl: server.url })
  const missingPath = '/missing-path'
  app.get(missingPath, async (req, res) => {
    try {
      relay.send(res, await relay.request(req))
    } catch (err) {
      fail(err)
    } finally {
      res.end()
    }
  })
  const response = await request(app).get(missingPath)
  expect(response.status).toBe(404)
  await server.close()
})
