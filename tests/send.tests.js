const { test } = require('@ianwalter/bff')
const express = require('express')
const request = require('supertest')
const Relay = require('../')

const baseUrl = 'http://localhost:7331'
const path = '/could-it-be'

test('send returns a 200 response successfully', async ({ expect, fail }) => {
  const app = express()
  const relay = new Relay({ baseUrl })
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
})

test('send returns a 404 response successfully', async ({ expect, fail }) => {
  const app = express()
  const relay = new Relay({ baseUrl })
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
})
