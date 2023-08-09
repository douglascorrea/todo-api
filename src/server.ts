import express from 'express'

const app = express()

const swaggerUi = require('swagger-ui-express')
const swaggerDocument = require('../swagger.json')

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.get('/', (req, res) => {
  console.log('Hello World! from server.js')
  res.status(200)
  res.json({ message: 'Hello World!' })
})

export default app
