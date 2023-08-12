import '../utils/apiValidator'
import request from 'supertest'
import { User, Todo } from '@prisma/client'
import app from '../../../src/server'
import { UserService } from '../../../src/api/users/user.service'
import { TodoService } from '../../../src/api/todos/todo.service'

describe(`User's Todo Routes`, () => {
  let createdUser: User

  beforeAll(async () => {
    const newUserData = {
      name: 'Jane Doe For Todos',
      email: 'janedoe4todos@example.com',
    }
    createdUser = await UserService.createUser(
      newUserData.name,
      newUserData.email
    )
  })

  afterAll(async () => {
    await UserService.deleteUser(createdUser.id)
  })
  describe('POST /users/:userId/todos', () => {
    it('should create a new todo for a user', async () => {
      const newTodoData = {
        title: 'New Todo',
        description: 'New Todo Description',
      }
      const res = await request(app)
        .post(`/api/users/${createdUser.id}/todos`)
        .send(newTodoData)

      expect(res.statusCode).toEqual(201)
      const createdTodo: Todo = res.body.data

      expect(createdTodo.title).toBe(newTodoData.title)
      expect(createdTodo.description).toBe(newTodoData.description)
      expect(createdTodo.userId).toBe(createdUser.id)
      // Clean up todo after test
      await TodoService.deleteUserTodoById(createdUser.id, createdTodo.id)
    })
  })
})
