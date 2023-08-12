
import prisma from '../../config/database'

export class UserService {
  static async createUser(name: string, email: string) {
    return prisma.user.create({
      data: {
        name: name,
        email: email,
      },
    })
  }

  static async getAllUsers() {
    return prisma.user.findMany()
  }
}