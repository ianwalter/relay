import test from 'ava'
import express from 'express'
import request from 'supertest'
import Relay from '../'

const baseUrl = 'http://localhost:7331'
const path = '/could-it-be'

test('proxy relays requests', async t => {
  const app = express()
  const relay = new Relay({ baseUrl })
  app.get(path, relay.proxy())
  const res = await request(app).get(path)
  t.is(res.statusCode, 201)
  t.is(res.body.foo, 'Hello World!')
})

test('proxy (static) relays requests', async t => {
  const app = express()
  app.locals.relay = new Relay({ baseUrl })
  app.get(path, Relay.proxy())
  const res = await request(app).get(path)
  t.is(res.statusCode, 201)
  t.is(res.body.foo, 'Hello World!')
})
