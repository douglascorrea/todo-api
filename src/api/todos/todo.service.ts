import prisma from '../../config/database'

export class TodoService {
  static async createUserTodo(
    userId: string,
    title: string,
    description: string,
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

  static async getUserTodoById(userId: string, todoId: string) {
    return prisma.todo.findUnique({
      where: {
        id: todoId,
        userId,
      },
    })
  }

  static async updateTodo(todoId: string, title: string, description: string) {
    return prisma.todo.update({
      where: {
        id: todoId,
      },
      data: {
        title: title,
        description: description,
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
}
