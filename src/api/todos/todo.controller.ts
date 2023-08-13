import { NextFunction, Request, Response } from 'express'
import { TodoService } from './todo.service'

export const createUserTodo = async (req: Request, res: Response) => {
  const todo = await TodoService.createUserTodo(
    req.params.userId,
    req.body.title,
    req.body.description,
    req.body.todoListId
  )
  res.status(201).json(todo)
}

export const getAllUserTodos = async (req: Request, res: Response) => {
  let completed = undefined
  if (req.query.completed) {
    completed = req.query.completed === 'true'
  }
  const todos = await TodoService.getAllUserTodos(req.params.userId, completed)
  res.json(todos)
}

export const getUserTodoById = async (req: Request, res: Response) => {
  const todo = await TodoService.getUserTodoById(
    req.params.userId,
    req.params.todoId
  )
  res.json(todo)
}

export const updateUserTodoById = async (req: Request, res: Response) => {
  const todo = await TodoService.updateUserTodoById(
    req.params.todoId,
    req.body.title,
    req.body.description,
    req.body.todoListId
  )
  res.json(todo)
}

export const deleteUserTodoById = async (req: Request, res: Response) => {
  await TodoService.deleteUserTodoById(req.params.userId, req.params.todoId)
  res.status(204).json()
}
