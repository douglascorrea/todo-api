import express from 'express'
import cors from 'cors'
import router from './router'
import todoRoutes from './api/todos/todo.routes'
import errorMiddleware from './middleware/error.middleware'
import notFoundMiddleware from './middleware/notFound.middleware'
import requestLogger from './utils/requestLogger'


const app = express()

app.use(requestLogger)
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use('/api/todos', todoRoutes)
// app.use('/api', router)

app.use(notFoundMiddleware);
app.use(errorMiddleware)

export default app
