import test from 'ava'
import express from 'express'
import request from 'supertest'
import Relay from '../'

const baseUrl = 'http://localhost:7331'
const path = '/could-it-be'

test('send returns a 200 response successfully', async t => {
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

test('send returns a 404 response successfully', async t => {
  const app = express()
  const relay = new Relay({ baseUrl })
  const missingPath = '/missing-path'
  app.get(missingPath, async (req, res) => {
    try {
      relay.send(res, await relay.request(req))
    } catch (err) {
      done.fail(err)
    } finally {
      res.end()
    }
  })
  const response = await request(app).get(missingPath)
  expect(response.status).toBe(404)
  done()
})
