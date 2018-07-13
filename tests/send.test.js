const express = require('express')
const request = require('supertest')
const Relay = require('../')

const baseUrl = 'http://localhost:7331'
const path = '/could-it-be'

test('send returns the response successfully', async done => {
  const app = express()
  const relay = new Relay({ baseUrl })
  app.get(path, async (req, res) => {
    try {
      relay.send(res, await relay.request(req))
    } catch (err) {
      done.fail(err)
    } finally {
      res.end()
    }
  })
  const response = await request(app).get(path)
  expect(response.body.foo).toEqual('Hello World!')
  done()
})
