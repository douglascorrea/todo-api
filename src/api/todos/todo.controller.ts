import { Request, Response } from 'express'
import { TodoService } from './todo.service'

export const createTodo = async (req: Request, res: Response) => {
  const todo = await TodoService.createTodo(req.body.title, req.body.description)
  res.json({ data: todo })
}

export const updateTodo = async (req: Request, res: Response) => {
  const todo = await TodoService.updateTodo(
    req.params.todoId,
    req.body.title,
    req.body.description
  )
  res.json({ data: todo })
}
