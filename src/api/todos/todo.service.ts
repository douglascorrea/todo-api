import prisma from '../../config/database'

export class TodoService {
  static async createUserTodo(
    userId: string,
    title: string,
    description?: string,
    todoListId?: string
  ) {
    return await prisma.todo.create({
      data: {
        userId,
        title,
        description,
        todoListId,
      },
    })
  }

  static async getAllUserTodos(
    userId: string,
    completed?: boolean,
    skip = 0,
    take = 10,
    orderBy: 'asc' | 'desc' = 'asc'
  ) {
    return prisma.todo.findMany({
      skip,
      take,
      where: {
        userId,
        completed,
      },
      include: {
        todoList: true,
      },
      orderBy: [
        {
          createdAt: orderBy,
        },
        // to unbbias the sorting, we add a secondary sort by uuid
        {
          id: orderBy,
        },
      ],
    })
  }

  static async getUserTodoById(userId: string, todoId: string) {
    return prisma.todo.findUnique({
      where: {
        id: todoId,
        userId,
      },
      include: {
        todoList: true,
      },
    })
  }

  static async updateUserTodoById(
    todoId: string,
    title: string,
    description: string,
    todoListId?: string
  ) {
    return prisma.todo.update({
      where: {
        id: todoId,
      },
      data: {
        title: title,
        description: description,
        todoListId: todoListId,
      },
    })
  }

  static async deleteUserTodoById(userId: string, todoId: string) {
    return prisma.todo.delete({
      where: {
        id: todoId,
        userId,
      },
    })
  }

  static async completeUserTodoById(userId: string, todoId: string) {
    return prisma.todo.update({
      where: {
        id: todoId,
        userId,
      },
      data: {
        completed: true,
      },
    })
  }

  static async uncompleteUserTodoById(userId: string, todoId: string) {
    return prisma.todo.update({
      where: {
        id: todoId,
        userId,
      },
      data: {
        completed: false,
      },
    })
  }

  static async toggleUserTodoById(userId: string, todoId: string) {
    const todo = await prisma.todo.findUnique({
      where: {
        id: todoId,
        userId,
      },
    })

    return prisma.todo.update({
      where: {
        id: todoId,
        userId,
      },
      data: {
        completed: !todo?.completed,
      },
    })
  }

  static async userTodoByIdExists(userId: string, todoId: string) {
    const todo = await prisma.todo.findUnique({
      where: {
        id: todoId,
        userId,
      },
    })
    return !!todo
  }
}
