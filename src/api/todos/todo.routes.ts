import { Router } from 'express'
import * as TodoController from './todo.controller'
import { validate } from '../../validators/common/validate'
import { todoValidations } from '../../validators/resources/todo.validations'

const router = Router()

router.get('/todos', (req, res) => {
  res.json({ message: 'Hello World 2!' })
})
router.get('/todos/:todoId', (req, res) => {})
router.put(
  '/todos/:todoId',
  validate(...todoValidations('update')),
  TodoController.updateTodo
)
router.post(
  '/todos',
  validate(...todoValidations('create')),
  TodoController.createTodo
)
router.delete('/todos/:todoId', (req, res) => {})

export default router
