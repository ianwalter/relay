const express = require('express')

const app = express()

app.get('/could-it-be', (_, res) => {
  res.status(201).json({ foo: 'Hello World!' })
})

app.get('/mirror', (req, res) => {
  res.status(200).send(req.body)
})

app.listen(7331)
