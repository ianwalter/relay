const express = require('express')

const app = express()

app.get('/could-it-be', (_, res) => {
  res.status(201).json({ foo: 'Hello World!' })
})

app.listen(7331)
