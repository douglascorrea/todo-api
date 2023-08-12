import { Prisma } from '@prisma/client'

const todoListWithTodos = Prisma.validator<Prisma.TodoListDefaultArgs>()({
  include: {
    todos: true,
  },
})
export type TodoListWithTodos = Prisma.TodoListGetPayload<typeof todoListWithTodos>
