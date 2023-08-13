import { body, param } from 'express-validator'
import prisma from '../../config/database'
import { userIdParam } from '../users/user.validations'
import { userTodoListExists } from '../todoLists/todoList.validations'
import { TodoService } from './todo.service'
import AppError from '../../utils/appError'

export const userTodoExists = async (userId: string, todoId: string) => {
  const todo = await TodoService.userTodoByIdExists(userId, todoId)
  if (!todo) {
    throw new AppError('Todo not found', 404)
  }
  return true
}

export const todoIdParam = param('todoId')
  .exists()
  .withMessage('Todo ID is required')
  .isString()
  .withMessage('Todo ID must be a string')
  .custom(async (todoId, { req }) => {
    return await userTodoExists(req.params?.userId, todoId)
  })
  .withMessage({ message: 'Todo not found', statusCode: 404 })

export const todoValidations = (method: string) => {
  const optionalFields = [
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string'),
    body('todoListId')
      .optional()
      .custom(async (todoListId: string | null, { req }) => {
        if (todoListId === null) {
          return true
        }
        if (typeof todoListId !== 'string') {
          throw new Error('TodoListId must be a string')
        }
      })
      .withMessage('TodoListId must be a string')
      .bail()
      .custom(async (todoListId: string | null, { req }) => {
        return await userTodoListExists(req.params?.userId, todoListId)
      })
      .withMessage({ message: 'TodoList not found', statusCode: 404 }),
  ]
  const create = [
    userIdParam,
    body('title')
      .exists()
      .withMessage('Title is required')
      .isString()
      .withMessage('Title must be a string')
      .notEmpty()
      .withMessage('Title is required'),
    ...optionalFields,
  ]

  const update = [
    userIdParam,
    body('title')
      .optional()
      .exists()
      .withMessage('Title is required')
      .isString()
      .withMessage('Title must be a string')
      .notEmpty()
      .withMessage('Title is required'),
    ...optionalFields,
    todoIdParam,
  ]

  switch (method) {
    case 'getAll':
      return [userIdParam]
    case 'getById':
    case 'delete':
      return [userIdParam, todoIdParam]
    case 'create':
      return create
    case 'update':
      return update
    default:
      return []
  }
}
