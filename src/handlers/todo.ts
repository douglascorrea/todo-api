import { Request, Response } from 'express'
import { Prisma } from '@prisma/client'
import prisma from '../db'

export const createTodo = async (req: Request, res: Response) => {
  const todo = await prisma.todo.create({
    data: {
      title: req.body.title,
      description: req.body.description,
    },
  })
  res.json({ data: todo })
}

export const updateTodo = async (req: Request, res: Response) => {
  const todo = await prisma.todo.update({
    where: {
      id: req.params.todoId,
    },
    data: {
      title: req.body.title,
      description: req.body.description,
    },
  })
  res.json({ data: todo })
}
