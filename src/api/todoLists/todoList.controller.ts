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
  const todoLists = await TodoListService.getAllUserTodoLists(
    req.params.userId,
    includeTodos
  )
  res.json(todoLists)
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
