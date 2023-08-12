import { NextFunction, Request, Response } from 'express'
import { UserService } from './user.service'

export const createUser = async (req: Request, res: Response) => {
  const user = await UserService.createUser(req.body.name, req.body.email)
  res.status(201).json({ data: user })
}

export const getAllUsers = async (req: Request, res: Response) => {
  const users = await UserService.getAllUsers()
  res.json(users)
}
