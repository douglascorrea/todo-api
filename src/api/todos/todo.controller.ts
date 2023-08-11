import { NextFunction, Request, Response } from 'express'
import { TodoService } from './todo.service'
import logger from '../../utils/logger'

export const createTodo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const todo = await TodoService.createTodo(
    req.body.title,
    req.body.description
  )
  res.json({ data: todo })
}

export const updateTodo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const todo = await TodoService.updateTodo(
    req.params.todoId,
    req.body.title,
    req.body.description
  )
  res.json({ data: todo })
}
