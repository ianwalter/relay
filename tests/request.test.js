const express = require('express')
const request = require('supertest')
const bodyParser = require('body-parser')

const Relay = require('../')

const baseUrl = 'http://localhost:7331'

test('request relays a GET request', async done => {
  const path = '/could-it-be'
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

test.only('request relays a POST request', async done => {
  const path = '/mirror'
  const app = express()
  app.use(bodyParser.json())
  const relay = new Relay({ baseUrl })
  const payload = { artist: 'Little Dragon' }
  app.post(path, async (req, res) => {
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
