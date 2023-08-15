import prisma from '../../config/database'
import { MicrosoftAuthProvider } from '../../config/microsoft-graph-client'
import { MicrosoftTodoService } from '../thirdParty/microsoft.service'
import { UserService } from '../users/user.service'

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
  static async createUserTodoList(
    userId: string,
    title: string,
    microsoftTodoListId?: string
  ) {
    if (!microsoftTodoListId) {
      const user = await UserService.getUserById(userId)
      let microsoftTodoList = null
      if (user?.microsoftUserId) {
        const authProvider = new MicrosoftAuthProvider()
        const microsoftTodoService = new MicrosoftTodoService(
          await authProvider.getMsalInstance(),
          user.microsoftUserId
        )
        microsoftTodoList = await microsoftTodoService.createMicrosoftTodoList(
          title
        )
      }
      microsoftTodoListId = microsoftTodoList?.id
    }
    return prisma.todoList.create({
      data: {
        title,
        userId,
        microsoftTodoListId,
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
    const user = await UserService.getUserById(userId)
    let microsoftTodoListId = null
    if (user?.microsoftUserId) {
      // check if the todo list has microsoftTodoListId
      const todoList = await this.getUserTodoListById(userId, todoListId)
      const authProvider = new MicrosoftAuthProvider()
      const microsoftTodoService = new MicrosoftTodoService(
        await authProvider.getMsalInstance(),
        user.microsoftUserId
      )
      if (todoList?.microsoftTodoListId) {
        await microsoftTodoService.updateMicrosoftTodoList(
          todoList.microsoftTodoListId,
          title
        )
      } else {
        const microsoftTodoList = await microsoftTodoService.createMicrosoftTodoList(
          title
        )
        microsoftTodoListId = microsoftTodoList?.id
      }
    }
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

  static async getUserTodoListByMicrosoftTodoListId(
    userId: string,
    microsoftTodoListId: string
  ) {
    return prisma.todoList.findFirst({
      where: {
        userId,
        microsoftTodoListId,
      },
    })
  }

  static async upsertUserTodoListByMicrosoftTodoListId(
    userId: string,
    microsoftTodoListId: string,
    title: string
  ) {
    return prisma.todoList.upsert({
      where: {
        userId_microsoftTodoListId: {
          userId,
          microsoftTodoListId,
        },
      },
      create: {
        userId,
        title,
        microsoftTodoListId,
      },
      update: {
        title,
      },
    })
  }
}
