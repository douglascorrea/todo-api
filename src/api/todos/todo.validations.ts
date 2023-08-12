import { body, param } from 'express-validator'
import prisma from '../../config/database'

export const todoValidations = (method: string) => {
  const create = [
    body('title')
      .isString()
      .withMessage('Title must be a string')
      .isLength({ min: 3 })
      .withMessage('Title must be at least 3 characters long'),
    body('description')
      .isString()
      .withMessage('Description must be a string')
      .isLength({ min: 3 })
      .withMessage('Description must be at least 3 characters long'),
    body('todoListId')
      .optional()
      .custom(async (value) => {
        if (typeof value !== 'string') {
          throw new Error('todoListId must be a string')
        }
        const todoList = await prisma.todoList.findUnique({
          where: {
            id: value,
          },
        })
        if (!todoList) {
          throw new Error('TodoList does not exist')
        }
      }),
  ]

  const update = [
    param('todoId').custom(async (value) => {
      if (typeof value !== 'string') {
        throw new Error('todoId must be a string')
      }
      const todo = await prisma.todo.findUnique({
        where: {
          id: value,
        },
      })
      if (!todo) {
        throw new Error('Todo does not exist')
      }
    }),
  ]

  switch (method) {
    case 'create':
      return create
    case 'update':
      return update
    default:
      return []
  }
}