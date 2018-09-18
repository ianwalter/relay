const express = require('express')
const bodyParser = require('body-parser')

const app = express()

app.use(bodyParser.json())

app.get('/could-it-be', (_, res) => {
  res.status(201).json({ foo: 'Hello World!' })
})

app.post('/mirror', (req, res) => res.type('json').status(200).send(req.body))

app.listen(7331, err => {
  if (err) {
    console.error(err)
  } else {
    console.info('Mock server started!')
  }
})
