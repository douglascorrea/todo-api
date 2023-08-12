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

  static async getUserById(userId: string) {
    return prisma.user.findUnique({
      where: {
        id: userId,
      },
    })
  }

  static async updateUser(userId: string, name: string, email: string) {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: name,
        email: email,
      },
    })
  }

  static async deleteUser(userId: string) {
    return prisma.user.delete({
      where: {
        id: userId,
      },
    })
  }

  static async userExists(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })
    return !!user
  }

  static async emailExists(email: string) {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    })
    return !!user
  }
}
