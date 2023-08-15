import express from 'express'
import cors from 'cors'
import userRoutes, { microsoftAsyncHandler } from './api/users/user.routes'
import errorMiddleware from './middleware/error.middleware'
import notFoundMiddleware from './middleware/notFound.middleware'
import requestLogger from './utils/requestLogger'
import swaggerUi from 'swagger-ui-express'
import swaggerDocument from '../swagger.json'

const app = express()

app.use(requestLogger)
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/users', userRoutes)
// this route is not scoped because it is set on Azure Registartion app
app.use('/auth/microsoft/callback', microsoftAsyncHandler)

/**
 * Swagger
 */

const options = {
  explorer: true
}

app.use('/api/docs', swaggerUi.serve)
app.get('/api/docs', swaggerUi.setup(swaggerDocument, options))



app.use(notFoundMiddleware)
app.use(errorMiddleware)

export default app
