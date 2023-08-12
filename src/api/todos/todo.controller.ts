import { NextFunction, Request, Response } from 'express'
import { TodoService } from './todo.service'

export const createUserTodo = async (
  req: Request,
  res: Response,
) => {
  const todo = await TodoService.createUserTodo(
    req.params.userId,
    req.body.title,
    req.body.description,
    req.body.todoListId
  )
  res.status(201).json({ data: todo })
}

export const updateTodo = async (
  req: Request,
  res: Response,
) => {
  const todo = await TodoService.updateTodo(
    req.params.todoId,
    req.body.title,
    req.body.description
  )
  res.json({ data: todo })
}
