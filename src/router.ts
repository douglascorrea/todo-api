import { Request, Response, Router } from 'express'
import { body, validationResult } from 'express-validator'
import swaggerUi from 'swagger-ui-express'
import swaggerDocument from '../swagger.json'
import { createTodo, updateTodo } from './api/todos/todo.controller'
import { todoExists, todoValidator } from './validators/resources/todo.validations'
import { validate } from './validators/common/validate'

const router = Router()

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
