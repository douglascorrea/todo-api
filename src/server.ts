import express from 'express'
import cors from 'cors'
import router from './router'
import todoRoutes from './api/todos/todo.routes'
import errorMiddleware from './middleware/error.middleware'
import notFoundMiddleware from './middleware/notFound.middleware'


const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use('/api', todoRoutes)
// app.use('/api', router)

app.use(notFoundMiddleware);
app.use(errorMiddleware)

export default app
