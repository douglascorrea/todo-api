import prisma from '../../config/database'

export class TodoService {
  static async createTodo(title: string, description: string) {
    return prisma.todo.create({
      data: {
        title: title,
        description: description,
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
}
