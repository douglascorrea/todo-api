import { Request, Response, Router } from 'express'
import { body, validationResult } from 'express-validator'
import swaggerUi from 'swagger-ui-express'
import swaggerDocument from '../swagger.json'
import { createTodo, updateTodo } from './handlers/todo'
import { todoExists, todoValidator } from './validators/todoValidator'
import { validate } from './validators/validate'

const router = Router()

/**
 * Todo
 */

router.get('/todo', (req, res) => {
  res.json({ message: 'Hello World 2!' })
})
router.get('/todo/:todoId', (req, res) => {})
router.put('/todo/:todoId', validate(todoExists, todoValidator), updateTodo)
router.post(
  '/todo',
  validate(todoValidator),
  createTodo
)
router.delete('/todo/:todoId', (req, res) => {})

/**
 * TodoList
 */
router.get('/todo-list', (req, res) => {})
router.get('/todo-list/:todoListId', (req, res) => {})
router.put('/todo-list/:todoListId', (req, res) => {})
router.post('/todo-list', (req, res) => {})
router.delete('/todo-list/:todoListId', (req, res) => {})

/**
 * User
 */
router.get('/user/:userId/todos', (req, res) => {})

/**
 * Swagger
 */
const options = {
  explorer: true,
}

router.use('/docs', swaggerUi.serve)
router.get('/docs', swaggerUi.setup(swaggerDocument, options))

export default router
