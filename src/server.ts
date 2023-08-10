import express from 'express'
import cors from 'cors'
import router from './router'


const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.get('/', (req, res) => {
  console.log('Hello World! from server.js')
  res.status(200)
  res.json({ message: 'Hello World!' })
})

app.use('/api', router)

export default app
