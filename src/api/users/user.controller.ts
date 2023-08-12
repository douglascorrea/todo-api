import { NextFunction, Request, Response } from 'express'
import AppError from '../../utils/appError'
import { UserService } from './user.service'

export const createUser = async (req: Request, res: Response) => {
  const user = await UserService.createUser(req.body.name, req.body.email)
  res.status(201).json(user)
}

export const getAllUsers = async (req: Request, res: Response) => {
  const users = await UserService.getAllUsers()
  res.json(users)
}

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = await UserService.getUserById(req.params.userId)
  if (!user) {
    return next(new AppError('User not found', 404))
  }
  res.json(user)
}

export const updateUser = async (req: Request, res: Response) => {
  const user = await UserService.updateUser(
    req.params.userId,
    req.body.name,
    req.body.email
  )
  res.status(200).json(user)
}
