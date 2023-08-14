import request from 'supertest'
import '../utils/apiValidator'
import app from '../../../src/server'
import { UserService } from '../../../src/api/users/user.service'
import { User } from '@prisma/client'

describe('User Routes', () => {
  describe('POST /users', () => {
    it('should create a new user and match OpenAPI spec', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john.doe@example.com',
      }

      const res = await request(app).post('/api/users').send(newUser)

      expect(res.statusCode).toEqual(201)
      expect(res.body).toSatisfySchemaInApiSpec('User')
      expect(res.body.email).toEqual(newUser.email)
      expect(res.body.name).toEqual(newUser.name)
      expect(res.body.id).not.toBeNull()
      expect(res.body.createdAt).not.toBeNull()
      expect(res.body.updatedAt).not.toBeNull()
      // Cleanup to avoid flaky tests
      UserService.deleteUser(res.body.id)
    })

    it('should create a new user and skip non valid fields', async () => {
      const newUser = {
        name: 'Charlie Doe Skip',
        email: 'charlie.doe.skip@example.com',
        createdAt: '2021-01-01T00:00:00.000Z',
        invalidField: 'invalid',
      }

      const res = await request(app).post('/api/users').send(newUser)

      expect(res.statusCode).toEqual(201)
      expect(res.body).toSatisfySchemaInApiSpec('User')
      expect(res.body.email).toEqual(newUser.email)
      expect(res.body.name).toEqual(newUser.name)
      expect(res.body.createdAt).not.toEqual(newUser.createdAt)
      expect(res.body.invalidField).toBeUndefined()
      expect(res.body.id).not.toBeNull()
      expect(res.body.createdAt).not.toBeNull()
      expect(res.body.updatedAt).not.toBeNull()
      // Cleanup to avoid flaky tests
      UserService.deleteUser(res.body.id)
    })

    it('should fail if name is missing', async () => {
      const newUser = {
        name: '',
        email: 'someemail@example.com',
      }
      const res = await request(app).post('/api/users').send(newUser)
      expect(res.statusCode).toEqual(400)
      expect(res.body.status).toEqual('error')
      expect(res.body.errors.map((e: { msg: string }) => e.msg)).toContain(
        'Name is required'
      )
    })
  })

  describe('GET /users', () => {
    let createdTwentyUsers: User[]
    const twentyUsers = Array.from(Array(20).keys()).map((i) => ({
      name: `User ${i}`,
      email: `useremail${i}forgetall@example.com`,
    }))

    const defaultSkip = 0
    const defaultTake = 10
    const defaultOrder = 'asc'

    beforeAll(async () => {
      createdTwentyUsers = await Promise.all(
        twentyUsers.map((user) => UserService.createUser(user.name, user.email))
      )
    })
    afterAll(async () => {
      await Promise.all(
        createdTwentyUsers.map((user) => UserService.deleteUser(user.id))
      )
    })

    it('should return a list of users and match OpenAPI spec first page', async () => {
      const firstTenUsersFromDb = await UserService.getAllUsers(
        defaultSkip,
        defaultTake,
        defaultOrder
      )
      const res = await request(app).get('/api/users')
      expect(res.statusCode).toEqual(200)
      expect(res).toSatisfyApiSpec()
      expect(res.body.total).toEqual(defaultTake)
      expect(res.body.skip).toEqual(defaultSkip)
      expect(res.body.take).toEqual(defaultTake)
      expect(res.body.results.length).toEqual(10)
      expect(res.body.results[0]).toSatisfySchemaInApiSpec('User')
      expect(res.body.results[0].createdAt).toEqual(
        firstTenUsersFromDb[0].createdAt.toISOString()
      )
    })

    it('should return a list of users and match OpenAPI spec second page', async () => {
      const skip = 10
      const take = 10
      const secondTenUsersFromDb = await UserService.getAllUsers(
        skip,
        take,
        defaultOrder
      )
      const res = await request(app).get(`/api/users?skip=${skip}&take=${take}`)
      expect(res.statusCode).toEqual(200)
      expect(res).toSatisfyApiSpec()
      expect(res.body.total).toEqual(take)
      expect(res.body.skip).toEqual(skip)
      expect(res.body.take).toEqual(take)
      expect(res.body.results.length).toEqual(10)
      expect(res.body.results[0]).toSatisfySchemaInApiSpec('User')
      expect(res.body.results[0].createdAt).toEqual(
        secondTenUsersFromDb[0].createdAt.toISOString()
      )
    })
    it('should return a list of users and match OpenAPI spec first page descending', async () => {
      const firstTenUsersFromDb = await UserService.getAllUsers(
        defaultSkip,
        defaultTake,
        'desc'
      )
      const res = await request(app).get('/api/users?order=desc')
      expect(res.statusCode).toEqual(200)
      expect(res).toSatisfyApiSpec()
      expect(res.body.total).toEqual(defaultTake)
      expect(res.body.skip).toEqual(defaultSkip)
      expect(res.body.take).toEqual(defaultTake)
      expect(res.body.results.length).toEqual(10)
      expect(res.body.results[0]).toSatisfySchemaInApiSpec('User')
      expect(res.body.results[0].createdAt).toEqual(
        firstTenUsersFromDb[0].createdAt.toISOString()
      )
    })
    it('should return a list of users and match OpenAPI spec second page descending', async () => {
      const skip = 10
      const take = 10
      const secondTenUsersFromDb = await UserService.getAllUsers(
        skip,
        take,
        'desc'
      )
      const res = await request(app).get(
        `/api/users?skip=${skip}&take=${take}&order=desc`
      )
      expect(res.statusCode).toEqual(200)
      expect(res).toSatisfyApiSpec()
      expect(res.body.total).toEqual(take)
      expect(res.body.skip).toEqual(skip)
      expect(res.body.take).toEqual(take)
      expect(res.body.results.length).toEqual(10)
      expect(res.body.results[0]).toSatisfySchemaInApiSpec('User')
      expect(res.body.results[0].createdAt).toEqual(
        secondTenUsersFromDb[0].createdAt.toISOString()
      )
    })
    it('should return a list of users and match OpenAPI spec first page of 5 ascending', async () => {
      const firstFiveUsersFromDb = await UserService.getAllUsers(
        defaultSkip,
        5,
        defaultOrder
      )
      const res = await request(app).get('/api/users?take=5')
      expect(res.statusCode).toEqual(200)
      expect(res).toSatisfyApiSpec()
      expect(res.body.total).toEqual(5)
      expect(res.body.skip).toEqual(defaultSkip)
      expect(res.body.take).toEqual(5)
      expect(res.body.results.length).toEqual(5)
      expect(res.body.results[0]).toSatisfySchemaInApiSpec('User')
      expect(res.body.results[0].createdAt).toEqual(
        firstFiveUsersFromDb[0].createdAt.toISOString()
      )
    })
  })

  describe('GET and PUT routes with a specific user', () => {
    let createdUser: User

    beforeAll(async () => {
      const newUserData = {
        name: 'Jane Doe',
        email: 'janedoe@example.com',
      }
      createdUser = await UserService.createUser(
        newUserData.name,
        newUserData.email
      )
    })

    afterAll(async () => {
      await UserService.deleteUser(createdUser.id)
    })

    describe('GET /users/:userId', () => {
      it('should retrieve a specific user by ID', async () => {
        const getResponse = await request(app).get(
          `/api/users/${createdUser.id}`
        )
        expect(getResponse.statusCode).toEqual(200)
        expect(getResponse.body).toSatisfySchemaInApiSpec('User')
        expect(getResponse.body.name).toEqual(createdUser.name)
        expect(getResponse.body.email).toEqual(createdUser.email)
        expect(getResponse.body.id).not.toBeNull()
        expect(getResponse.body.createdAt).not.toBeNull()
        expect(getResponse.body.updatedAt).not.toBeNull()
      })
      it('should fail if specific user ID does not exists', async () => {
        const getResponse = await request(app).get(
          `/api/users/not-existing-user-id`
        )
        expect(getResponse.statusCode).toEqual(404)
      })
    })

    describe('PUT /users/:userId', () => {
      it('should allow update only the user name', async () => {
        const updateUserData = {
          name: 'Cristian Doe Updated',
        }

        const updateResponse = await request(app)
          .put(`/api/users/${createdUser.id}`)
          .send(updateUserData)

        expect(updateResponse.statusCode).toEqual(200)
        expect(updateResponse.body.name).toEqual(updateUserData.name)
        expect(updateResponse.body.email).toEqual(createdUser.email)
        expect(updateResponse.body).toSatisfySchemaInApiSpec('User')
        expect(updateResponse.body.id).not.toBeNull()
        expect(updateResponse.body.createdAt).not.toBeNull()
        expect(updateResponse.body.updatedAt).not.toBeNull()

        const getResponse = await request(app).get(
          `/api/users/${createdUser.id}`
        )

        expect(getResponse.statusCode).toEqual(200)
        expect(getResponse.body.name).toEqual(updateUserData.name)
        expect(getResponse.body.email).toEqual(createdUser.email)
        expect(getResponse.body).toSatisfySchemaInApiSpec('User')
        expect(getResponse.body.id).not.toBeNull()
        expect(getResponse.body.createdAt).not.toBeNull()
        expect(getResponse.body.updatedAt).not.toBeNull()
      })

      it('should update a user passing userId', async () => {
        const updateUserData = {
          name: 'Cristian Doe Updated',
          email: 'cristiandoe+updated@example.com',
        }

        const updateResponse = await request(app)
          .put(`/api/users/${createdUser.id}`)
          .send(updateUserData)

        expect(updateResponse.statusCode).toEqual(200)
        expect(updateResponse.body.name).toEqual(updateUserData.name)
        expect(updateResponse.body.email).toEqual(updateUserData.email)
        expect(updateResponse.body).toSatisfySchemaInApiSpec('User')
        expect(updateResponse.body.id).not.toBeNull()
        expect(updateResponse.body.createdAt).not.toBeNull()
        expect(updateResponse.body.updatedAt).not.toBeNull()

        const getResponse = await request(app).get(
          `/api/users/${createdUser.id}`
        )

        expect(getResponse.statusCode).toEqual(200)
        expect(getResponse.body.name).toEqual(updateUserData.name)
        expect(getResponse.body.email).toEqual(updateUserData.email)
        expect(getResponse.body).toSatisfySchemaInApiSpec('User')
        expect(getResponse.body.id).not.toBeNull()
        expect(getResponse.body.createdAt).not.toBeNull()
        expect(getResponse.body.updatedAt).not.toBeNull()
      })

      it('should fail if try to update with specific user ID that does not exists', async () => {
        const updateUserData = {
          name: 'Cristian Doe Updated Fail',
          email: 'cristiandoe+updated+fail@example.com',
        }
        const updateResponse = await request(app)
          .put(`/api/users/not-existing-user-id`)
          .send(updateUserData)
        expect(updateResponse.statusCode).toEqual(404)
      })

      it('should update a user passing userId and skipping non valid data', async () => {
        const updateUserData = {
          name: 'New Name Updated',
          email: 'newemailupdated@example.com',
          createdAt: '2021-01-01T00:00:00.000Z',
          invalidField: 'invalid',
        }

        const updateResponse = await request(app)
          .put(`/api/users/${createdUser.id}`)
          .send(updateUserData)

        expect(updateResponse.statusCode).toEqual(200)
        expect(updateResponse.body.name).toEqual(updateUserData.name)
        expect(updateResponse.body.email).toEqual(updateUserData.email)
        expect(updateResponse.body.createdAt).not.toEqual(
          updateUserData.createdAt
        )
        expect(updateResponse.body.invalidField).toBeUndefined()
        expect(updateResponse.body).toSatisfySchemaInApiSpec('User')
        expect(updateResponse.body.id).not.toBeNull()
        expect(updateResponse.body.createdAt).not.toBeNull()
        expect(updateResponse.body.updatedAt).not.toBeNull()

        const getResponse = await request(app).get(
          `/api/users/${createdUser.id}`
        )

        expect(getResponse.statusCode).toEqual(200)
        expect(getResponse.body.name).toEqual(updateUserData.name)
        expect(getResponse.body.email).toEqual(updateUserData.email)
        expect(getResponse.body.createdAt).not.toEqual(updateUserData.createdAt)
        expect(getResponse.body.invalidField).toBeUndefined()
        expect(getResponse.body).toSatisfySchemaInApiSpec('User')
        expect(getResponse.body.id).not.toBeNull()
        expect(getResponse.body.createdAt).not.toBeNull()
        expect(getResponse.body.updatedAt).not.toBeNull()
      })
    })
  })
})
