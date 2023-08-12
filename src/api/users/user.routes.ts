import { Router } from 'express'
import * as UserController from './user.controller'
import { validate } from '../../validators/common/validate'
import { userValidations } from './user.validations'
import { asyncHandler } from '../../utils/asyncHandler'
import * as TodoListController from '../todoLists/todoList.controller'
import * as TodoController from '../todos/todo.controller'
import { todoListValidations } from '../todoLists/todoList.validations'
import { todoValidations } from '../todos/todo.validations'

const router = Router()

// User's routes
router.get('/', asyncHandler(UserController.getAllUsers))
router.post(
  '/',
  validate(...userValidations('create')),
  asyncHandler(UserController.createUser)
)
router.get('/:userId', asyncHandler(UserController.getUserById))
router.put(
  '/:userId',
  validate(...userValidations('update')),
  asyncHandler(UserController.updateUser)
)

// User's TodoList routes
router.post(
  '/:userId/todoLists',
  validate(...todoListValidations('create')),
  asyncHandler(TodoListController.createUserTodoList)
)
router.get(
    '/:userId/todoLists',
    validate(...todoListValidations('getAll')),
    asyncHandler(TodoListController.getAllUserTodoLists)
)
router.get(
    '/:userId/todoLists/:todoListId',
    validate(...todoListValidations('getById')),
    asyncHandler(TodoListController.getUserTodoListById)
)
router.put(
    '/:userId/todoLists/:todoListId',
    validate(...todoListValidations('update')),
    asyncHandler(TodoListController.updateUserTodoList)
)
router.delete(
    '/:userId/todoLists/:todoListId',
    validate(...todoListValidations('delete')),
    asyncHandler(TodoListController.deleteUserTodoList)
)

// User's Todo routes
router.post(
    '/:userId/todos',
    validate(...todoValidations('create')),
    asyncHandler(TodoController.createUserTodo)
)

export default router