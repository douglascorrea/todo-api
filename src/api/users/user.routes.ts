import { Router } from 'express'
import * as UserController from './user.controller'
import { validate } from '../../validators/common/validate'
import { userValidations } from './user.validations'
import { asyncHandler } from '../../utils/asyncHandler'
import * as TodoListController from '../todoLists/todoList.controller'
import * as TodoController from '../todos/todo.controller'
import * as MicrosoftAuthController from '../thirdParty/microsoft.controllers'
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
router.get(
  '/:userId/todos',
  validate(...todoValidations('getAll')),
  asyncHandler(TodoController.getAllUserTodos)
)
router.get(
    '/:userId/todos/:todoId',
    validate(...todoValidations('getById')),
    asyncHandler(TodoController.getUserTodoById)
)
router.put(
    '/:userId/todos/:todoId',
    validate(...todoValidations('update')),
    asyncHandler(TodoController.updateUserTodoById)
)
router.delete(
    '/:userId/todos/:todoId',
    validate(...todoValidations('delete')),
    asyncHandler(TodoController.deleteUserTodoById)
)
router.patch(
    '/:userId/todos/:todoId/complete',
    validate(...todoValidations('complete')),
    asyncHandler(TodoController.completeUserTodoById)
)
router.patch(
    '/:userId/todos/:todoId/uncomplete',
    validate(...todoValidations('uncomplete')),
    asyncHandler(TodoController.uncompleteUserTodoById)
)
router.patch(
    '/:userId/todos/:todoId/toggle',
    validate(...todoValidations('toggle')),
    asyncHandler(TodoController.toggleUserTodoById)
)

// third-party registration routes
router.get(
    '/:userId/auth/microsoft/signin',
    asyncHandler(MicrosoftAuthController.signIn)
)
router.get(
    '/:userId/auth/microsoft/me',
    asyncHandler(MicrosoftAuthController.getMe)
)

// just a simple microsoft todo route for testing
router.get(
    '/:userId/auth/microsoft/todoLists',
    asyncHandler(MicrosoftAuthController.getUserTodoLists)
)
router.get(
    '/:userId/auth/microsoft/todoLists/:todoListId',
    asyncHandler(MicrosoftAuthController.getAllUserTodosByListId)
)
router.get(
    '/:userId/auth/microsoft/allUserListsAndTodos',
    asyncHandler(MicrosoftAuthController.getAllUserListsAndTodos)
)


export const microsoftAsyncHandler = asyncHandler(MicrosoftAuthController.callback)



export default router
