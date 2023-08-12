import { body, param } from 'express-validator'
import { UserService } from './user.service'
import AppError from '../../utils/appError'
export const emailAlreadyExists = async (email: string) => {
  if (await UserService.emailExists(email)) {
    throw new Error('Email already in use')
  }
  return true
}

export const userExists = async (userId: string) => {
  if (!(await UserService.userExists(userId))) {
    throw new AppError('User not found', 404)
  }
  return true
}

export const userIdParam = param('userId')
  .exists()
  .withMessage('User ID is required')
  .isString()
  .withMessage('User ID must be a string')
  .custom(userExists)
  .withMessage({ message: 'User not found', statusCode: 404 })

export const userValidations = (method: string) => {
  const create = [
    body('name')
      .isString()
      .withMessage('Name must be a string')
      .notEmpty()
      .withMessage('Name is required'),
    body('email')
      .exists()
      .withMessage('Email is required')
      .isString()
      .withMessage('Email must be a string')
      .isEmail()
      .withMessage('Email must be a valid email')
      .custom(emailAlreadyExists),
  ]

  const update = [
    userIdParam,
    body('name')
      .isString()
      .withMessage('Name must be a string')
      .isLength({ min: 3 }),
    body('email')
      .optional()
      .isString()
      .withMessage('Email must be a string')
      .isEmail()
      .withMessage('Email must be a valid email')
      .custom(emailAlreadyExists),
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
