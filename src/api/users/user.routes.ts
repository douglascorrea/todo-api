import { Router } from 'express'
import * as UserController from './user.controller'
import { validate } from '../../validators/common/validate'
import { userValidations } from './user.validations'
import { asyncHandler } from '../../utils/asyncHandler'

const router = Router()

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

export default router
