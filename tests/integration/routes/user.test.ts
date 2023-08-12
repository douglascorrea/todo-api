import request from 'supertest'
import '../utils/apiValidator'
import app from '../../../src/server'
import { UserService } from '../../../src/api/users/user.service'

describe('User Routes', () => {
  describe('POST /users', () => {
    it('should create a new user and match OpenAPI spec', async () => {
      const newUser = {
        name: 'John Doe',
        email: 'john.doe@example.com',
      }

      const res = await request(app).post('/api/users').send(newUser)

      expect(res.statusCode).toEqual(201)
      expect(res.body.data).toSatisfySchemaInApiSpec('User')
      expect(res.body.data.email).toEqual(newUser.email)
      expect(res.body.data.name).toEqual(newUser.name)
    })
  })

  describe('GET /users', () => {
    it('should return a list of users and match OpenAPI spec', async () => {
      const res = await request(app).get('/api/users')
      expect(res.statusCode).toEqual(200)
      expect(res).toSatisfyApiSpec()
    })
  })

  describe('GET /users/{userId}', () => {
    it('should retrieve a specific user by ID', async () => {
      const newUserData = {
        name: 'David Doe',
        email: 'daviddoe@example.com',
      }

      const newUser = await UserService.createUser(newUserData.name, newUserData.email)

      const userId = newUser.id;

      const getResponse = await request(app).get(`/api/users/${userId}`)

      expect(getResponse.statusCode).toEqual(200)
      expect(getResponse.body.data).toSatisfySchemaInApiSpec('User')

    })
  })


  describe('PUT /users', () => {
    it('should create a new user and match OpenAPI spec', async () => {
      const newUser = {
        name: 'Jane Doe',
        email: 'janedoe@example.com',
      }

      const createResponse = await request(app).post('/api/users').send(newUser)

      expect(createResponse.statusCode).toEqual(201)
      expect(createResponse.body.data).toSatisfySchemaInApiSpec('User')
      const userId = createResponse.body.data.id;

      const updateResponse = await request(app).put('/api/users/').send(newUser)

      expect(updateResponse.statusCode).toEqual(204)
      expect(updateResponse.body.data).toSatisfySchemaInApiSpec('User')

    })
  })

})
