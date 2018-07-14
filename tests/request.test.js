const express = require('express')
const request = require('supertest')
const Relay = require('../')

const baseUrl = 'http://localhost:7331'
const path = '/could-it-be'

test('request relays a GET request', async done => {
  const app = express()
  const relay = new Relay({ baseUrl })
  app.get(path, async (req, res) => {
    try {
      const response = await relay.request(req)
      const body = JSON.parse(response.body)
      expect(body.foo).toEqual('Hello World!')
    } catch (err) {
      done.fail(err)
    } finally {
      res.end()
    }
  })
  await request(app).get(path)
  done()
})

test('request relays a POST request', async done => {
  const app = express()
  const relay = new Relay({ baseUrl })
  const payload = { artist: 'Little Dragon' }
  app.get(path, async (req, res) => {
    try {
      const response = await relay.request(req)
      const body = JSON.parse(response.body)
      expect(body).toEqual(payload)
    } catch (err) {
      done.fail(err)
    } finally {
      res.end()
    }
  })
  await request(app).post(path).send(payload)
  done()
})
