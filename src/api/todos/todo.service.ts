import prisma from '../../config/database'
import { MicrosoftAuthProvider } from '../../config/microsoft-graph-client'
import logger from '../../utils/logger'
import { MicrosoftTodoService } from '../thirdParty/microsoft.service'
import { TodoListService } from '../todoLists/todoList.service'
import { UserService } from '../users/user.service'

export class TodoService {
  static async createUserTodo(
    userId: string,
    title: string,
    description?: string,
    todoListId?: string
  ) {
    const user = await UserService.getUserById(userId)
    let microsoftTodo = null
    if (user?.microsoftUserId) {
      const authProvider = new MicrosoftAuthProvider()
      const microsoftTodoService = new MicrosoftTodoService(
        await authProvider.getMsalInstance(),
        user.microsoftUserId
      )

      let microsoftTodoListId = null
      if (todoListId) {
        const todoList = await TodoListService.getUserTodoListById(
          userId,
          todoListId
        )
        microsoftTodoListId = todoList?.microsoftTodoListId
      } else {
        const todoList = await microsoftTodoService.getDefaultUserTodoList()
        microsoftTodoListId = todoList?.microsoftTodoListId
      }
      microsoftTodo = await microsoftTodoService.createMicrosoftTodo(
        title,
        description || '',
        microsoftTodoListId
      )
    }
    return await prisma.todo.create({
      data: {
        userId,
        title,
        description,
        todoListId,
        microsoftTodoId: microsoftTodo?.id,
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

  static async getUserTodoByMicrosoftTodoId(
    userId: string,
    microsoftTodoId: string
  ) {
    return prisma.todo.findFirst({
      where: {
        microsoftTodoId: microsoftTodoId,
        userId,
      },
    })
  }

  static async upsertUserTodoByMicrosoftTodoId(
    userId: string,
    microsoftTodoId: string,
    microsoftTodoListId: string,
    title: string,
    description?: string,
    completed?: boolean
  ) {
    let todoList = await TodoListService.getUserTodoListByMicrosoftTodoListId(
      userId,
      microsoftTodoListId
    )
    return prisma.todo.upsert({
      where: {
        userId_microsoftTodoId: {
          userId,
          microsoftTodoId,
        },
      },
      update: {
        title: title,
        description: description,
        todoListId: todoList?.id,
        completed: completed,
      },
      create: {
        userId,
        microsoftTodoId: microsoftTodoId,
        title: title,
        description: description,
        todoListId: todoList?.id,
        completed: completed,
      },
    })
  }
}
