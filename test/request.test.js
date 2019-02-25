import test from 'ava'
import express from 'express'
import request from 'supertest'
import bodyParser from 'body-parser'
import Relay from '..'
import proxyquire from 'proxyquire'

const baseUrl = 'http://localhost:7331/'

test('request doesnt add falsy options', t => {
  const call = {}
  const got = (url, options) => {
    call.url = url
    call.options = options
  }
  const Relay = proxyquire('../', { got })
  const relay = new Relay({ baseUrl })
  const url = '/test'
  const headers = { 'content-type': 'application/json' }
  const authHeader = { 'authorization': 'Bearer abc123' }
  relay.request({ url, headers }, { headers: authHeader })
  t.is(call.url, url)
  t.is(call.options.baseUrl, baseUrl)
  t.is(call.options.throwHttpErrors, false)
  t.deepEqual(call.options.headers, { ...headers, ...authHeader })
})

test('request relays a GET request', async t => {
  const path = '/could-it-be'
  const app = express()
  const relay = new Relay({ baseUrl })
  app.get(path, async (req, res) => {
    try {
      const response = await relay.request(req)
      const body = JSON.parse(response.body)
      t.is(body.foo, 'Hello World!')
    } catch (err) {
      t.fail(err)
    } finally {
      res.end()
    }
  })
  await request(app).get(path)
})

test('request relays a POST request', async t => {
  const path = '/mirror'
  const app = express()
  app.use(bodyParser.json())
  const relay = new Relay({ baseUrl })
  const payload = { artist: 'Little Dragon' }
  app.post(path, async (req, res) => {
    try {
      const response = await relay.request(req)
      const body = JSON.parse(response.body)
      t.deepEqual(body, payload)
    } catch (err) {
      t.fail(err)
    } finally {
      res.end()
    }
  })
  await request(app).post(path).send(payload)
})
