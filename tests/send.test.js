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
      const response = await relay.request(req)
      relay.send(res, response)
    } catch (err) {
      done.fail(err)
    } finally {
      res.end()
    }
  })
  const response = await request(app).get(path)
  console.log(response.body)
  expect(response.body.foo).toEqual('Hello World!')
  done()
})
