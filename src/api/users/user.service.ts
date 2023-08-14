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

  static async getAllUsers(
    skip: number,
    take: number,
    orderBy: 'asc' | 'desc' = 'asc'
  ) {
    return prisma.user.findMany({
      skip: skip,
      take: take,
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
  static async setUserMicrosoftUserId(userId: string, microsoftUserId: string) {
    return prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        microsoftUserId: microsoftUserId,
      },
    })
  }
}
