const express = require('express')
const request = require('supertest')
const Relay = require('../')

const baseUrl = 'http://localhost:7331'
const path = '/could-it-be'

test('proxy works', async done => {
  const app = express()
  const relay = new Relay({ baseUrl })
  app.get(path, relay.proxy())
  const res = await request(app).get(path)
  expect(res.statusCode).toBe(201)
  expect(res.body.foo).toEqual('Hello World!')
  done()
})
