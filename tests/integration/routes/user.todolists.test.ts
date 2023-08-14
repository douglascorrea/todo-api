import '../utils/apiValidator'
import request from 'supertest'
import { TodoList, User } from '@prisma/client'
import { TodoListWithTodos } from '../../../prisma/types/types'
import app from '../../../src/server'
import { UserService } from '../../../src/api/users/user.service'
import { TodoListService } from '../../../src/api/todoLists/todoList.service'
import { TodoService } from '../../../src/api/todos/todo.service'

describe(`User's todoLists Routes`, () => {
  let createdUser: User

  beforeAll(async () => {
    const newUserData = {
      name: 'Jane Doe For Lists',
      email: 'janedoe4lists@example.com',
    }
    createdUser = await UserService.createUser(
      newUserData.name,
      newUserData.email
    )
  })

  afterAll(async () => {
    await UserService.deleteUser(createdUser.id)
  })

  describe('POST /users/{userId}/todoLists', () => {
    it('should create a new TodoList for a user and match OpenAPI spec', async () => {
      const newTodoList = {
        title: 'My TodoList',
      }

      const res = await request(app)
        .post(`/api/users/${createdUser.id}/todoLists`)
        .send(newTodoList)

      expect(res.statusCode).toEqual(201)
      expect(res.body).toSatisfySchemaInApiSpec('TodoList')
      expect(res.body.title).toEqual(newTodoList.title)
      expect(res.body.id).not.toBeNull()
      expect(res.body.createdAt).not.toBeNull()
      expect(res.body.updatedAt).not.toBeNull()
      // Clean up the created TodoList after the test to avoid flaky tests
      await TodoListService.deleteUserTodoListById(createdUser.id, res.body.id)
    })

    it('should fail if specific user ID does not exists', async () => {
      const newTodoList = {
        title: 'My TodoList',
      }

      const res = await request(app)
        .post(`/api/users/999999/todoLists`)
        .send(newTodoList)

      expect(res.statusCode).toEqual(404)
      expect(res.body.status).toEqual('error')
      expect(res.body.message).toEqual('User not found')
    })

    it('should fail if title is missing', async () => {
      const newTodoList = {
        title: '',
      }

      const res = await request(app)
        .post(`/api/users/${createdUser.id}/todoLists`)
        .send(newTodoList)

      expect(res.statusCode).toEqual(400)
      expect(res.body.status).toEqual('error')
      expect(res.body.errors.map((e: { msg: string }) => e.msg)).toContain(
        'Title is required'
      )
    })

    it('should fail if title is not provided', async () => {
      const res = await request(app)
        .post(`/api/users/${createdUser.id}/todoLists`)
        .send()

      expect(res.statusCode).toEqual(400)
      expect(res.body.status).toEqual('error')
      expect(res.body.errors.map((e: { msg: string }) => e.msg)).toContain(
        'Title is required'
      )
    })
    it('should fail if title is not a string', async () => {
      const newTodoList = {
        title: 123,
      }

      const res = await request(app)
        .post(`/api/users/${createdUser.id}/todoLists`)
        .send(newTodoList)

      expect(res.statusCode).toEqual(400)
      expect(res.body.status).toEqual('error')
      expect(res.body.errors.map((e: { msg: string }) => e.msg)).toContain(
        'Title must be a string'
      )
    })
    it('should ignore extra fields', async () => {
      const newTodoList = {
        title: 'My TodoList',
        extraField: 'extra field',
      }

      const res = await request(app)
        .post(`/api/users/${createdUser.id}/todoLists`)
        .send(newTodoList)

      expect(res.statusCode).toEqual(201)
      expect(res.body).toSatisfySchemaInApiSpec('TodoList')
      expect(res.body.title).toEqual(newTodoList.title)
      expect(res.body.id).not.toBeNull()
      expect(res.body.createdAt).not.toBeNull()
      expect(res.body.updatedAt).not.toBeNull()
      // Clean up the created TodoList after the test to avoid flaky tests
      await TodoListService.deleteUserTodoListById(createdUser.id, res.body.id)
    })
  })

  describe('Get and Update routes', () => {
    let listOfTodoLists
    let createdTodoLists: TodoList[]
    beforeAll(async () => {
      listOfTodoLists = [
        {
          title: 'My TodoList 1',
          todos: [
            {
              title: 'My Todo 1 for list 1',
              description: 'My Todo 1 description for list 1',
            },
            {
              title: 'My Todo 2 for list 1',
              description: 'My Todo 2 description for list 1',
            },
            {
              title: 'My Todo 3 for list 1',
              description: 'My Todo 3 description for list 1',
            },
          ],
        },
        {
          title: 'My TodoList 2',
          todos: [
            {
              title: 'My Todo 1 for list 2',
              description: 'My Todo 1 description for list 2',
            },
            {
              title: 'My Todo 2 for list 2',
              description: 'My Todo 2 description for list 2',
            },
            {
              title: 'My Todo 3 for list 2',
              description: 'My Todo 3 description for list 2',
            },
          ],
        },
        {
          title: 'My TodoList 3',
          todos: [
            {
              title: 'My Todo 1 for list 3',
              description: 'My Todo 1 description for list 3',
            },
            {
              title: 'My Todo 2 for list 3',
              description: 'My Todo 2 description for list 3',
            },
            {
              title: 'My Todo 3 for list 3',
              description: 'My Todo 3 description for list 3',
            },
          ],
        },
      ]
      createdTodoLists = await Promise.all(
        listOfTodoLists.map(async (todoList) => {
          const createdTodoList = await TodoListService.createUserTodoList(
            createdUser.id,
            todoList.title
          )
          await Promise.all(
            todoList.todos.map(async (todo) => {
              await TodoService.createUserTodo(
                createdUser.id,
                todo.title,
                todo.description,
                createdTodoList.id
              )
            })
          )
          return createdTodoList
          //   return TodoListService.getTodoListById(createdTodoList.id, true)
        })
      )
    })
    afterAll(async () => {
      await Promise.all(
        createdTodoLists.map(async (todoList) => {
          await TodoListService.deleteUserTodoListById(
            createdUser.id,
            todoList.id
          )
        })
      )
    })
    describe('GET /users/{userId}/todoLists', () => {
      it('should return all TodoLists for a user and match OpenAPI spec', async () => {
        const res = await request(app).get(
          `/api/users/${createdUser.id}/todoLists`
        )
        expect(res.statusCode).toEqual(200)
        expect(res).toSatisfyApiSpec()

        expect(res.body.total).toEqual(3)
        expect(res.body.skip).toEqual(0)
        expect(res.body.take).toEqual(10)
        expect(res.body.results.length).toEqual(3)
        res.body.results.forEach((todoList: TodoList) => {
          expect(todoList).toSatisfySchemaInApiSpec('TodoList')
          const match = createdTodoLists.find(
            (createdTodoList) => createdTodoList.id === todoList.id
          )

          expect(match).toBeDefined()
          expect(todoList.title).toEqual(match?.title)
          expect(todoList.id).toEqual(match?.id)
          expect(todoList.createdAt).toEqual(match?.createdAt.toISOString())
          expect(todoList.updatedAt).toEqual(match?.updatedAt.toISOString())
        })
      })
      it('should return all TodoLists for a user and match OpenAPI spec with todos', async () => {
        const res = await request(app).get(
          `/api/users/${createdUser.id}/todoLists?includeTodos=true`
        )
        expect(res.statusCode).toEqual(200)
        expect(res).toSatisfyApiSpec()
        expect(res.body.total).toEqual(3)
        expect(res.body.skip).toEqual(0)
        expect(res.body.take).toEqual(10)
        expect(res.body.results.length).toEqual(3)
        res.body.results.forEach(async (todoList: TodoListWithTodos) => {
          expect(todoList).toSatisfySchemaInApiSpec('TodoList')
          const match = createdTodoLists.find(
            (createdTodoList) => createdTodoList.id === todoList.id
          )

          expect(match).toBeDefined()
          expect(todoList.title).toEqual(match?.title)
          expect(todoList.id).toEqual(match?.id)
          expect(todoList.createdAt).toEqual(match?.createdAt.toISOString())
          expect(todoList.updatedAt).toEqual(match?.updatedAt.toISOString())
          if (match) {
            const matchWithTodos: TodoListWithTodos | null =
              await TodoListService.getUserTodoListById(
                createdUser.id,
                match.id,
                true
              )
            expect(todoList.todos.length).toEqual(matchWithTodos?.todos.length)
          }
        })
      })
    })
    describe('GET /users/{userId}/todoLists with pagination', () => {
      let createdUserForGetAllTodoLists: User
      let createdTodoListsForGetAll: TodoList[]
      const listOfTwentyTodoListsForGetAll = Array.from(
        { length: 20 },
        (_, i) => ({
          title: `My TodoList ${i + 1}`,
        })
      )
      const defaultSkip = 0
      const defaultTake = 10
      const defaultOrder = 'asc'

      beforeAll(async () => {
        createdUserForGetAllTodoLists = await UserService.createUser(
          'User for getAll TodoLists',
          'userforgetalltodolists1@example.com'
        )
        createdTodoListsForGetAll = await Promise.all(
          listOfTwentyTodoListsForGetAll.map(async (todoList) => {
            const createdTodoList = await TodoListService.createUserTodoList(
              createdUserForGetAllTodoLists.id,
              todoList.title
            )
            return createdTodoList
          })
        )
      })
      afterAll(async () => {
        // it will cascade delete all todos and todoLists
        await UserService.deleteUser(createdUserForGetAllTodoLists.id)
      })
      it('should return all TodoLists for a user and match OpenAPI spec with pagination first page', async () => {
        const firstTenTodoLists = await TodoListService.getAllUserTodoLists(
          createdUserForGetAllTodoLists.id,
          false,
          defaultSkip,
          defaultTake,
          defaultOrder
        )
        const res = await request(app).get(
          `/api/users/${createdUserForGetAllTodoLists.id}/todoLists`
        )
        expect(res.statusCode).toEqual(200)
        expect(res).toSatisfyApiSpec()
        expect(res.body.total).toEqual(defaultTake)
        expect(res.body.skip).toEqual(defaultSkip)
        expect(res.body.take).toEqual(defaultTake)
        expect(res.body.results.length).toEqual(10)
        expect(res.body.results[0]).toSatisfySchemaInApiSpec('TodoList')
        expect(res.body.results[0].createdAt).toEqual(
          firstTenTodoLists[0].createdAt.toISOString()
        )
        expect(res.body.results[0].id).toEqual(firstTenTodoLists[0].id)
        expect(res.body.results[0].title).toEqual(firstTenTodoLists[0].title)
      })

      it('should return all TodoLists for a user and match OpenAPI spec with pagination second page', async () => {
      const skip = 10
      const take = 10
        const secondTenTodoLists = await TodoListService.getAllUserTodoLists(
          createdUserForGetAllTodoLists.id,
          false,
          skip,
          take,
          defaultOrder
        )
        const res = await request(app).get(
          `/api/users/${createdUserForGetAllTodoLists.id}/todoLists?skip=${skip}&take=${take}`
        )
        expect(res.statusCode).toEqual(200)
        expect(res).toSatisfyApiSpec()
        expect(res.body.total).toEqual(take)
        expect(res.body.skip).toEqual(skip)
        expect(res.body.take).toEqual(take)
        expect(res.body.results.length).toEqual(10)
        expect(res.body.results[0]).toSatisfySchemaInApiSpec('TodoList')
        expect(res.body.results[0].createdAt).toEqual(
          secondTenTodoLists[0].createdAt.toISOString()
        )
        expect(res.body.results[0].id).toEqual(secondTenTodoLists[0].id)
        expect(res.body.results[0].title).toEqual(secondTenTodoLists[0].title)
      })

      it('should return all TodoLists for a user and match OpenAPI spec with pagination first page descending', async () => {
        const firstTenTodoLists = await TodoListService.getAllUserTodoLists(
          createdUserForGetAllTodoLists.id,
          false,
          defaultSkip,
          defaultTake,
          'desc'
        )
        const res = await request(app).get(
          `/api/users/${createdUserForGetAllTodoLists.id}/todoLists?order=desc`
        )
        expect(res.statusCode).toEqual(200)
        expect(res).toSatisfyApiSpec()
        expect(res.body.total).toEqual(defaultTake)
        expect(res.body.skip).toEqual(defaultSkip)
        expect(res.body.take).toEqual(defaultTake)
        expect(res.body.results.length).toEqual(10)
        expect(res.body.results[0]).toSatisfySchemaInApiSpec('TodoList')
        expect(res.body.results[0].createdAt).toEqual(
          firstTenTodoLists[0].createdAt.toISOString()
        )
        expect(res.body.results[0].id).toEqual(firstTenTodoLists[0].id)
        expect(res.body.results[0].title).toEqual(firstTenTodoLists[0].title)
      })
      it('should return all TodoLists for a user and match OpenAPI spec with pagination second page descending', async () => {
      const skip = 10
      const take = 10
        const secondTenTodoLists = await TodoListService.getAllUserTodoLists(
          createdUserForGetAllTodoLists.id,
          false,
          skip,
          take,
          'desc'
        )
        const res = await request(app).get(
          `/api/users/${createdUserForGetAllTodoLists.id}/todoLists?skip=${skip}&take=${take}&order=desc`
        )
        expect(res.statusCode).toEqual(200)
        expect(res).toSatisfyApiSpec()
        expect(res.body.total).toEqual(take)
        expect(res.body.skip).toEqual(skip)
        expect(res.body.take).toEqual(take)
        expect(res.body.results.length).toEqual(take)
        expect(res.body.results[0]).toSatisfySchemaInApiSpec('TodoList')
        expect(res.body.results[0].createdAt).toEqual(
          secondTenTodoLists[0].createdAt.toISOString()
        )
        expect(res.body.results[0].id).toEqual(secondTenTodoLists[0].id)
        expect(res.body.results[0].title).toEqual(secondTenTodoLists[0].title)
      })
      it('should return all TodoLists for a user and match OpenAPI spec with pagination first of 5 ascending', async () => {
        const firstFiveTodoLists = await TodoListService.getAllUserTodoLists(
          createdUserForGetAllTodoLists.id,
          false,
          defaultSkip,
          5,
          defaultOrder
        )
        const res = await request(app).get(
          `/api/users/${createdUserForGetAllTodoLists.id}/todoLists?take=5`
        )
        expect(res.statusCode).toEqual(200)
        expect(res).toSatisfyApiSpec()
        expect(res.body.total).toEqual(5)
        expect(res.body.skip).toEqual(defaultSkip)
        expect(res.body.take).toEqual(5)
        expect(res.body.results.length).toEqual(5)
        expect(res.body.results[0]).toSatisfySchemaInApiSpec('TodoList')
        expect(res.body.results[0].createdAt).toEqual(
          firstFiveTodoLists[0].createdAt.toISOString()
        )
        expect(res.body.results[0].id).toEqual(firstFiveTodoLists[0].id)
        expect(res.body.results[0].title).toEqual(firstFiveTodoLists[0].title)
      })
    })
    describe('GET /users/{userId}/todoLists/{todoListId}', () => {
      it('should return a TodoList for a user and match OpenAPI spec', async () => {
        const res = await request(app).get(
          `/api/users/${createdUser.id}/todoLists/${createdTodoLists[0].id}`
        )
        expect(res.statusCode).toEqual(200)
        expect(res).toSatisfyApiSpec()
        expect(res.body).toSatisfySchemaInApiSpec('TodoList')
        expect(res.body.title).toEqual(createdTodoLists[0].title)
        expect(res.body.id).toEqual(createdTodoLists[0].id)
        expect(res.body.createdAt).toEqual(
          createdTodoLists[0].createdAt.toISOString()
        )
        expect(res.body.updatedAt).toEqual(
          createdTodoLists[0].updatedAt.toISOString()
        )
      })

      it('should return a TodoList for a user and match OpenAPI spec with todos', async () => {
        const res = await request(app).get(
          `/api/users/${createdUser.id}/todoLists/${createdTodoLists[0].id}?includeTodos=true`
        )
        expect(res.statusCode).toEqual(200)
        expect(res).toSatisfyApiSpec()
        expect(res.body).toSatisfySchemaInApiSpec('TodoList')
        expect(res.body.title).toEqual(createdTodoLists[0].title)
        expect(res.body.id).toEqual(createdTodoLists[0].id)
        expect(res.body.createdAt).toEqual(
          createdTodoLists[0].createdAt.toISOString()
        )
        expect(res.body.updatedAt).toEqual(
          createdTodoLists[0].updatedAt.toISOString()
        )
        const matchWithTodos: TodoListWithTodos | null =
          await TodoListService.getUserTodoListById(
            createdUser.id,
            createdTodoLists[0].id,
            true
          )
        expect(res.body.todos.length).toEqual(matchWithTodos?.todos.length)
      })

      it('should fail if user is not owner of todo list', async () => {
        const createdUserTwo = await UserService.createUser(
          'Another User todo 4 todo list 4',
          'anotherusertodo4todolistget@example.com'
        )
        const res = await request(app).get(
          `/api/users/${createdUserTwo.id}/todoLists/${createdTodoLists[0].id}`
        )
        // it fails with 404 since there is no auth middleware
        expect(res.statusCode).toEqual(404)
        // Clean up todo after test
        await UserService.deleteUser(createdUserTwo.id)
      })

      it('should return a 404 if the User does not exist', async () => {
        const res = await request(app).get(
          `/api/users/123/todoLists/${createdTodoLists[0].id}`
        )
        expect(res.statusCode).toEqual(404)
        expect(res.body.status).toEqual('error')
        expect(res.body.message).toEqual('User not found')
      })

      it('should return a 404 if the TodoList does not exist', async () => {
        const res = await request(app).get(
          `/api/users/${createdUser.id}/todoLists/123`
        )
        expect(res.statusCode).toEqual(404)
        expect(res.body.status).toEqual('error')
        expect(res.body.message).toEqual('TodoList not found')
      })
    })
    describe('PUT /users/{userId}/todoLists/{todoListId}', () => {
      it('should update a TodoList for a user and match OpenAPI spec', async () => {
        const todoListUpdatedData = {
          title: 'New Title',
        }
        const res = await request(app)
          .put(
            `/api/users/${createdUser.id}/todoLists/${createdTodoLists[0].id}`
          )
          .send(todoListUpdatedData)
        expect(res.statusCode).toEqual(200)
        expect(res).toSatisfyApiSpec()
        expect(res.body).toSatisfySchemaInApiSpec('TodoList')
        expect(res.body.title).toEqual(todoListUpdatedData.title)
        expect(res.body.id).toEqual(createdTodoLists[0].id)
        expect(res.body.createdAt).toEqual(
          createdTodoLists[0].createdAt.toISOString()
        )
        expect(res.body.updatedAt).not.toEqual(
          createdTodoLists[0].updatedAt.toISOString()
        )
        // checking again to make sure the update was persisted in db
        const updatedTodoList = await TodoListService.getUserTodoListById(
          createdUser.id,
          createdTodoLists[0].id
        )
        expect(updatedTodoList?.title).toEqual(todoListUpdatedData.title)
        // revert the title back to the original
        await TodoListService.updateUserTodoList(
          createdUser.id,
          createdTodoLists[0].id,
          createdTodoLists[0].title
        )
      })
    })

    it('should ignore extra fields', async () => {
      const todoListUpdatedData = {
        title: 'New Title',
        extra: 'extra',
      }
      const res = await request(app)
        .put(`/api/users/${createdUser.id}/todoLists/${createdTodoLists[0].id}`)
        .send(todoListUpdatedData)
      expect(res.statusCode).toEqual(200)
      expect(res).toSatisfyApiSpec()
      expect(res.body).toSatisfySchemaInApiSpec('TodoList')
      expect(res.body.title).toEqual(todoListUpdatedData.title)
      expect(res.body.id).toEqual(createdTodoLists[0].id)
      expect(res.body.createdAt).toEqual(
        createdTodoLists[0].createdAt.toISOString()
      )
      expect(res.body.updatedAt).not.toEqual(
        createdTodoLists[0].updatedAt.toISOString()
      )
      // checking again to make sure the update was persisted in db
      const updatedTodoList = await TodoListService.getUserTodoListById(
        createdUser.id,
        createdTodoLists[0].id
      )
      expect(updatedTodoList?.title).toEqual(todoListUpdatedData.title)
      // revert the title back to the original
      await TodoListService.updateUserTodoList(
        createdUser.id,
        createdTodoLists[0].id,
        createdTodoLists[0].title
      )
    })

    it('should fail if title is empty string', async () => {
      const todoListUpdatedData = {
        title: '',
      }
      const res = await request(app)
        .put(`/api/users/${createdUser.id}/todoLists/${createdTodoLists[0].id}`)
        .send(todoListUpdatedData)
      expect(res.statusCode).toEqual(400)
      expect(res.body.status).toEqual('error')
      expect(res.body.errors.map((e: { msg: string }) => e.msg)).toContain(
        'Title is required'
      )
    })

    it('should fail if title is not provided', async () => {
      const todoListUpdatedData = {}
      const res = await request(app)
        .put(`/api/users/${createdUser.id}/todoLists/${createdTodoLists[0].id}`)
        .send(todoListUpdatedData)
      expect(res.statusCode).toEqual(400)
      expect(res.body.status).toEqual('error')
      expect(res.body.errors.map((e: { msg: string }) => e.msg)).toContain(
        'Title is required'
      )
    })

    it('should fail if title is not a string', async () => {
      const todoListUpdatedData = {
        title: 123,
      }
      const res = await request(app)
        .put(`/api/users/${createdUser.id}/todoLists/${createdTodoLists[0].id}`)
        .send(todoListUpdatedData)
      expect(res.statusCode).toEqual(400)
      expect(res.body.status).toEqual('error')
      expect(res.body.errors.map((e: { msg: string }) => e.msg)).toContain(
        'Title must be a string'
      )
    })

    it('should fail to update a TodoList for a user if the TodoList does not exist', async () => {
      const todoListUpdatedData = {
        title: 'New Title',
      }
      const res = await request(app)
        .put(`/api/users/${createdUser.id}/todoLists/123`)
        .send(todoListUpdatedData)
      expect(res.statusCode).toEqual(404)
      expect(res.body.status).toEqual('error')
      expect(res.body.message).toEqual('TodoList not found')
    })

    it('should return a 404 if the User does not exist', async () => {
      const todoListUpdatedData = {
        title: 'New Title',
      }
      const res = await request(app)
        .put(`/api/users/123/todoLists/${createdTodoLists[0].id}`)
        .send(todoListUpdatedData)
      expect(res.statusCode).toEqual(404)
      expect(res.body.status).toEqual('error')
      expect(res.body.message).toEqual('User not found')
    })
  })
  describe('DELETE /users/{userId}/todoLists/{todoListId}', () => {
    it('should delete a TodoList for a user, keep child todos, and match OpenAPI spec', async () => {
      const createdTodoList = await TodoListService.createUserTodoList(
        createdUser.id,
        'TodoList 1'
      )
      expect(createdTodoList.id).not.toBeNull()

      // double checking if the todoList was created
      const actuallyCreatedTodoList = await TodoListService.getUserTodoListById(
        createdUser.id,
        createdTodoList.id
      )
      expect(actuallyCreatedTodoList?.id).not.toBeNull()

      const newTodo = await TodoService.createUserTodo(
        createdUser.id,
        'Todo 1',
        'Todo 1 description',
        createdTodoList.id
      )
      expect(newTodo.id).not.toBeNull()
      expect(newTodo.todoListId).not.toBeNull()
      // double checking if the todo was created
      const actuallyCreatedTodo = await TodoService.getUserTodoById(
        createdUser.id,
        newTodo.id
      )
      expect(actuallyCreatedTodo?.id).not.toBeNull()
      expect(actuallyCreatedTodo?.todoListId).not.toBeNull()
      const res = await request(app).delete(
        `/api/users/${createdUser.id}/todoLists/${createdTodoList.id}`
      )
      expect(res.statusCode).toEqual(204)
      expect(res).toSatisfyApiSpec()
      // checking again to make sure the delete was persisted in db
      const deletedTodoList = await TodoListService.getUserTodoListById(
        createdUser.id,
        createdTodoList.id
      )
      expect(deletedTodoList).toBeNull()
      const nonDeletedTodo = await TodoService.getUserTodoById(
        createdUser.id,
        newTodo.id
      )
      expect(nonDeletedTodo).not.toBeNull()
      expect(nonDeletedTodo?.title).toEqual(newTodo.title)
      expect(nonDeletedTodo?.todoListId).not.toEqual(createdTodoList.id)
      expect(nonDeletedTodo?.todoListId).toBeNull()
      // cleanup the todo
      await TodoService.deleteUserTodoById(createdUser.id, newTodo.id)
    })

    it('should delete a TodoList for a user and cascade delete child todos and match OpenAPI spec', async () => {
      const createdTodoList = await TodoListService.createUserTodoList(
        createdUser.id,
        'TodoList 1'
      )
      const newTodo = await TodoService.createUserTodo(
        createdUser.id,
        'Todo 1',
        'Todo 1 description',
        createdTodoList.id
      )
      expect(createdTodoList.id).not.toBeNull()
      const res = await request(app).delete(
        `/api/users/${createdUser.id}/todoLists/${createdTodoList.id}?deleteNestedTodos=true`
      )
      expect(res.statusCode).toEqual(204)
      expect(res).toSatisfyApiSpec()
      // checking again to make sure the delete was persisted in db
      const deletedTodoList = await TodoListService.getUserTodoListById(
        createdUser.id,
        createdTodoList.id
      )
      expect(deletedTodoList).toBeNull()
      const deletedTodo = await TodoService.getUserTodoById(
        createdUser.id,
        newTodo.id
      )
      expect(deletedTodo).toBeNull()
    })

    it('should fail if user is not owner of todo list', async () => {
      const createdUserTwo = await UserService.createUser(
        'Another User todo todo list delete',
        'anotherusertodolistdelete@example.com'
      )
      const createdTodoList = await TodoListService.createUserTodoList(
        createdUser.id,
        'TodoList 1'
      )
      const res = await request(app).delete(
        `/api/users/${createdUserTwo.id}/todoLists/${createdTodoList.id}`
      )
      // it fails with 404 since there is no auth middleware
      expect(res.statusCode).toEqual(404)
      // Clean up todo after test
      await UserService.deleteUser(createdUserTwo.id)
    })

    it('should return a 404 if the TodoList does not exist', async () => {
      const res = await request(app).delete(
        `/api/users/${createdUser.id}/todoLists/123`
      )
      expect(res.statusCode).toEqual(404)
      expect(res.body.status).toEqual('error')
      expect(res.body.message).toEqual('TodoList not found')
    })

    it('should return a 404 if the User does not exist', async () => {
      const createdTodoList = await TodoListService.createUserTodoList(
        createdUser.id,
        'TodoList 1'
      )
      const res = await request(app).delete(
        `/api/users/123/todoLists/${createdTodoList.id}`
      )
      expect(res.statusCode).toEqual(404)
      expect(res.body.status).toEqual('error')
      expect(res.body.message).toEqual('User not found')
      // cleanup the todoList
      await TodoListService.deleteUserTodoListById(
        createdUser.id,
        createdTodoList.id
      )
    })
  })
})
