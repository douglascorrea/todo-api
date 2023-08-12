import { body, param } from 'express-validator'
import prisma from '../../config/database'
import AppError from '../../utils/appError'

export const userValidations = (method: string) => {
  const create = [
    body('name')
      .isString()
      .withMessage('Name must be a string')
      .isLength({ min: 3 }),
    body('email')
      .custom(async (value) => {
        if (typeof value !== 'string') {
          throw new Error('Email must be a string')
        }
        const user = await prisma.user.findUnique({
          where: {
            email: value,
          },
        })
        if (user) {
          throw new Error('Email already in use')
        }
      })
      .isEmail()
      .withMessage('Email must be a valid email'),
  ]

  const userIdParam = param('userId')
    .isString()
    .withMessage('User ID must be a string')
    .custom(async (value, { req }) => {
      const user = await prisma.user.findUnique({
        where: {
          id: value,
        },
      })
        if (!user) {
            throw new AppError('User not found', 404)
        }
    })
    .withMessage({ message: 'User not found', statusCode: 404 })

  const update = [
    userIdParam,
    body('name')
      .isString()
      .withMessage('Name must be a string')
      .isLength({ min: 3 }),
    body('email')
      .optional()
      .custom(async (value) => {
        if (typeof value !== 'string' || value === '') {
          return
        }
        const user = await prisma.user.findUnique({
          where: {
            email: value,
          },
        })
        if (user) {
          throw new Error('Email already in use')
        }
      })
      .isEmail()
      .withMessage('Email must be a valid email'),
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
