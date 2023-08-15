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

  const skip = req.query.skip ? parseInt(req.query.skip as string) : 0
  const take = req.query.take ? parseInt(req.query.take as string) : 10
  const order = req.query.order ? req.query.order : 'asc'
  const todos = await TodoService.getAllUserTodos(req.params.userId, completed, skip, take, order as 'asc' | 'desc')
  const data = {
    skip,
    take,
    total: todos.length,
    results: todos,
  }
  res.json(data)
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
    req.params.userId,
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

export const completeUserTodoById = async (req: Request, res: Response) => {
  const todo = await TodoService.completeUserTodoById(
    req.params.userId,
    req.params.todoId
  )
  res.json(todo)
}

export const uncompleteUserTodoById = async (req: Request, res: Response) => {
  const todo = await TodoService.uncompleteUserTodoById(
    req.params.userId,
    req.params.todoId
  )
  res.json(todo)
}

export const toggleUserTodoById = async (req: Request, res: Response) => {
  const todo = await TodoService.toggleUserTodoById(
    req.params.userId,
    req.params.todoId
  )
  res.json(todo)
}
