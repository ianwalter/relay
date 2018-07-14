const express = require('express')
const request = require('supertest')
const Relay = require('../')

const baseUrl = 'http://hey.mami'

test('extractOptions works without initial options', async done => {
  const path = '/could-it-be'
  const url = baseUrl + path
  const app = express()
  const relay = new Relay()
  app.get(path, (req, res) => {
    try {
      const options = relay.extractOptions(req, { url })
      expect(options.method).toEqual('GET')
      expect(options.url).toEqual(url)
    } catch (err) {
      done.fail(err)
    } finally {
      res.end()
    }
  })
  await request(app).get('/')
  done()
})

test('extractOptions works with initial options', async done => {
  const path = '/mirror'
  const url = baseUrl + path
  const app = express()
  const relay = new Relay({ baseUrl })
  app.post(path, (req, res) => {
    try {
      const options = relay.extractOptions(req)
      expect(options.method).toEqual('GET')
      expect(options.url).toEqual(url)
      expect(typeof options.body).toBe('string')
    } catch (err) {
      done.fail(err)
    } finally {
      res.end()
    }
  })
  await request(app).post('/').send({ artist: 'Little Dragon' })
  done()
})
