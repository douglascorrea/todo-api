import { Request, Response } from 'express'
import { TodoListService } from './todoList.service'

export const createUserTodoList = async (req: Request, res: Response) => {
  const user = await TodoListService.createUserTodoList(
    req.params.userId,
    req.body.title
  )
  res.status(201).json(user)
}

export const getAllUserTodoLists = async (req: Request, res: Response) => {
  const includeTodos = req.query.includeTodos === 'true'
  const skip = req.query.skip ? parseInt(req.query.skip as string) : 0
  const take = req.query.take ? parseInt(req.query.take as string) : 10
  const order = req.query.order ? req.query.order : 'asc'
  const todoLists = await TodoListService.getAllUserTodoLists(
    req.params.userId,
    includeTodos,
    skip,
    take,
    order as 'asc' | 'desc'
  )

  const data = {
    skip,
    take,
    total: todoLists.length,
    results: todoLists,
  }
  res.json(data)
}

export const getUserTodoListById = async (req: Request, res: Response) => {
  const todoList = await TodoListService.getUserTodoListById(
    req.params.userId,
    req.params.todoListId,
    true
  )
  res.json(todoList)
}

export const updateUserTodoList = async (req: Request, res: Response) => {
  const todoList = await TodoListService.updateUserTodoList(
    req.params.userId,
    req.params.todoListId,
    req.body.title
  )
  res.json(todoList)
}

export const deleteUserTodoList = async (req: Request, res: Response) => {
  const deleteNestedTodos = req.query.deleteNestedTodos === 'true'
  await TodoListService.deleteUserTodoListById(
    req.params.userId,
    req.params.todoListId,
    deleteNestedTodos
  )
  res.status(204).json()
}
