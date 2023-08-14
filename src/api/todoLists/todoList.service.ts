import prisma from '../../config/database'

export class TodoListService {
  static async getAllUserTodoLists(
    userId: string,
    withTodos = false,
    skip = 0,
    take = 10,
    orderBy: 'asc' | 'desc' = 'asc'
  ) {
    return prisma.todoList.findMany({
      skip,
      take,
      where: {
        userId,
      },
      include: {
        todos: withTodos,
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

  static async getUserTodoListById(
    userId: string,
    todoListId: string,
    withTodos = false
  ) {
    return prisma.todoList.findUnique({
      where: {
        userId,
        id: todoListId,
      },
      include: {
        todos: withTodos,
      },
    })
  }
  static async createUserTodoList(userId: string, title: string) {
    return prisma.todoList.create({
      data: {
        title,
        userId,
      },
    })
  }

  static async userTodoListByTitleExists(userId: string, title: string) {
    const todoList = await prisma.todoList.findFirst({
      where: {
        title,
        userId,
      },
    })

    return !!todoList
  }

  static async deleteUserTodoListById(
    userId: string,
    todoListId: string,
    withTodos = false
  ) {
    // first delete todos since it has a foreign key constraint and prisma will clean it up for us
    if (withTodos) {
      await prisma.todo.deleteMany({
        where: {
          todoListId,
        },
      })
    }
    return prisma.todoList.delete({
      where: {
        userId,
        id: todoListId,
      },
    })
  }

  static async userTodoListByIdExists(userId: string, todoListId: string) {
    const todoList = await prisma.todoList.findUnique({
      where: {
        id: todoListId,
        userId,
      },
    })
    return !!todoList
  }

  static async updateUserTodoList(
    userId: string,
    todoListId: string,
    title: string
  ) {
    return prisma.todoList.update({
      where: {
        id: todoListId,
        userId,
      },
      data: {
        title,
      },
    })
  }
}
