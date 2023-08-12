import { body, param } from 'express-validator'
import { userIdParam } from '../users/user.validations'
import { TodoListService } from './todoList.service'
import AppError from '../../utils/appError'

const todoListForUserAlreadyExists = async (title: string, userId: string) => {
  if (await TodoListService.userTodoListByTitleExists(userId, title)) {
    throw new Error('Todo List name already in use for this user')
  }
  return true
}

export const todoListForUserExists = async (userId: string, todoListId: string) => {
  if (!(await TodoListService.userTodoListByIdExists(userId, todoListId))) {
    throw new AppError('TodoList not found', 404)
  }
  return true
}

export const todoListIdParam = param('todoListId')
  .exists()
  .withMessage('TodoList ID is required')
  .isString()
  .withMessage('TodoList ID must be a string')
  .custom(async (todoListId, { req }) => {
    return await todoListForUserExists(req.params?.userId, todoListId)
  })
  .withMessage({ message: 'TodoList not found', statusCode: 404 })

export const todoListValidations = (method: string) => {
  const create = [
    userIdParam,
    body('title')
      .exists()
      .withMessage('Title is required')
      .isString()
      .withMessage('Title must be a string')
      .notEmpty()
      .withMessage('Title is required')
      .custom(async (title, { req }) => {
        return await todoListForUserAlreadyExists(title, req.params?.userId)
      }),
  ]

  const update = [userIdParam, todoListIdParam, ...create]

  switch (method) {
    case 'getById':
    case 'delete':
      return [userIdParam, todoListIdParam]
    case 'getAll':
      return [userIdParam]
    case 'create':
      return create
    case 'update':
      return update
    default:
      return []
  }
}
