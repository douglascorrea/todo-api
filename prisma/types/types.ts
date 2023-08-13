import { Prisma } from '@prisma/client'

const todoListWithTodos = Prisma.validator<Prisma.TodoListDefaultArgs>()({
  include: {
    todos: true,
  },
})
export type TodoListWithTodos = Prisma.TodoListGetPayload<typeof todoListWithTodos>


const todoWithTodoLists = Prisma.validator<Prisma.TodoDefaultArgs>()({
  include: {
    todoList: true,
  },
})
export type TodoWithTodoLists = Prisma.TodoGetPayload<typeof todoWithTodoLists>