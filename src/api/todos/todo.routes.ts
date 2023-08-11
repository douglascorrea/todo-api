import { Router } from 'express'
import * as TodoController from './todo.controller'
import { validate } from '../../validators/common/validate'
import { todoValidations } from '../../validators/resources/todo.validations'
import { asyncHandler } from '../../utils/asyncHandler'

const router = Router()

router.get('/', (req, res) => {
  res.json({ message: 'Hello World 2!' })
})
router.get('/:todoId', (req, res) => {})
router.put(
  '/:todoId',
  validate(...todoValidations('update')),
  asyncHandler(TodoController.updateTodo)
)
router.post(
  '/',
  validate(...todoValidations('create')),
  asyncHandler(TodoController.createTodo)
)
router.delete('/:todoId', (req, res) => {})

export default router
