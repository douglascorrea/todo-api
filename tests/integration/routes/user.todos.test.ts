import '../utils/apiValidator'
import request from 'supertest'
import { User, Todo, TodoList } from '@prisma/client'
import app from '../../../src/server'
import { UserService } from '../../../src/api/users/user.service'
import { TodoService } from '../../../src/api/todos/todo.service'
import { TodoListService } from '../../../src/api/todoLists/todoList.service'
import { TodoWithTodoLists } from '../../../prisma/types/types'
import { create } from 'domain'

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
    it('should create a new todo for a user without todolist id', async () => {
      const newTodoData = {
        title: 'New Todo',
        description: 'New Todo Description',
      }
      const res = await request(app)
        .post(`/api/users/${createdUser.id}/todos`)
        .send(newTodoData)

      expect(res.statusCode).toEqual(201)
      expect(res.body).toSatisfySchemaInApiSpec('Todo')
      const createdTodo: Todo = res.body

      expect(createdTodo.title).toBe(newTodoData.title)
      expect(createdTodo.description).toBe(newTodoData.description)
      expect(createdTodo.userId).toBe(createdUser.id)

      // query todo from db to check if it exists
      const todo = await TodoService.getUserTodoById(
        createdUser.id,
        createdTodo.id
      )
      expect(todo).not.toBeNull()
      expect(todo?.title).toBe(newTodoData.title)
      expect(todo?.description).toBe(newTodoData.description)

      // Clean up todo after test
      await TodoService.deleteUserTodoById(createdUser.id, createdTodo.id)
    })

    it('should create a new todo for a user with todolist id', async () => {
      const createdTodoList = await TodoListService.createUserTodoList(
        createdUser.id,
        'New Todo List'
      )

      const newTodoData = {
        title: 'New Todo',
        description: 'New Todo Description',
        todoListId: createdTodoList.id,
      }
      const res = await request(app)
        .post(`/api/users/${createdUser.id}/todos`)
        .send(newTodoData)

      expect(res.statusCode).toEqual(201)
      expect(res.body).toSatisfySchemaInApiSpec('Todo')
      const createdTodo: Todo = res.body

      expect(createdTodo.title).toBe(newTodoData.title)
      expect(createdTodo.description).toBe(newTodoData.description)
      expect(createdTodo.userId).toBe(createdUser.id)
      expect(createdTodo.todoListId).toBe(createdTodoList.id)

      // query todo from db to check if it exists
      const todo = await TodoService.getUserTodoById(
        createdUser.id,
        createdTodo.id
      )
      expect(todo).not.toBeNull()
      expect(todo?.title).toBe(newTodoData.title)
      expect(todo?.description).toBe(newTodoData.description)
      expect(todo?.todoListId).toBe(createdTodoList.id)
      // Clean up todo after test
      await TodoService.deleteUserTodoById(createdUser.id, createdTodo.id)
      await TodoListService.deleteUserTodoListById(
        createdUser.id,
        createdTodoList.id
      )
    })

    it('should allow to create without description', async () => {
      const newTodoData = {
        title: 'New Todo',
      }
      const res = await request(app)
        .post(`/api/users/${createdUser.id}/todos`)
        .send(newTodoData)

      expect(res.statusCode).toEqual(201)
      expect(res.body).toSatisfySchemaInApiSpec('Todo')
      const createdTodo: Todo = res.body

      expect(createdTodo.title).toBe(newTodoData.title)
      expect(createdTodo.userId).toBe(createdUser.id)

      // query todo from db to check if it exists
      const todo = await TodoService.getUserTodoById(
        createdUser.id,
        createdTodo.id
      )
      expect(todo).not.toBeNull()
      expect(todo?.title).toBe(newTodoData.title)

      // Clean up todo after test
      await TodoService.deleteUserTodoById(createdUser.id, createdTodo.id)
    })

    it('should ignore extra fields', async () => {
      const newTodoData = {
        title: 'New Todo',
        description: 'New Todo Description',
        extraField: 'Extra Field',
      }
      const res = await request(app)
        .post(`/api/users/${createdUser.id}/todos`)
        .send(newTodoData)
      expect(res.statusCode).toEqual(201)
      expect(res.body).toSatisfySchemaInApiSpec('Todo')
      const createdTodo: Todo = res.body

      expect(createdTodo.title).toBe(newTodoData.title)
      expect(createdTodo.description).toBe(newTodoData.description)
      expect(createdTodo.userId).toBe(createdUser.id)
      expect(createdTodo).not.toHaveProperty('extraField')

      // query todo from db to check if it exists
      const todo = await TodoService.getUserTodoById(
        createdUser.id,
        createdTodo.id
      )
      expect(todo).not.toBeNull()
      expect(todo?.title).toBe(newTodoData.title)
      expect(todo?.description).toBe(newTodoData.description)

      // Clean up todo after test
      await TodoService.deleteUserTodoById(createdUser.id, createdTodo.id)
    })

    it('should return 404 if user does not exist', async () => {
      const newTodoData = {
        title: 'New Todo',
        description: 'New Todo Description',
      }
      const res = await request(app)
        .post(`/api/users/123/todos`)
        .send(newTodoData)

      expect(res.statusCode).toEqual(404)
      expect(res.body.status).toEqual('error')
      expect(res.body.message).toEqual('User not found')
    })

    it('should fail if title is missing', async () => {
      const newTodoData = {
        description: 'New Todo Description',
      }
      const res = await request(app)
        .post(`/api/users/${createdUser.id}/todos`)
        .send(newTodoData)

      expect(res.statusCode).toEqual(400)
      expect(res.body.errors.map((e: { msg: string }) => e.msg)).toContain(
        'Title is required'
      )
    })
    it('should fail if title is empty string', async () => {
      const newTodoData = {
        description: 'New Todo Description',
        title: '',
      }
      const res = await request(app)
        .post(`/api/users/${createdUser.id}/todos`)
        .send(newTodoData)

      expect(res.statusCode).toEqual(400)
      expect(res.body.errors.map((e: { msg: string }) => e.msg)).toContain(
        'Title is required'
      )
    })

    it('should fail if title is not a string', async () => {
      const newTodoData = {
        description: 'New Todo Description',
        title: 123,
      }
      const res = await request(app)
        .post(`/api/users/${createdUser.id}/todos`)
        .send(newTodoData)
      expect(res.statusCode).toEqual(400)
      expect(res.body.errors.map((e: { msg: string }) => e.msg)).toContain(
        'Title must be a string'
      )
    })

    it('should fail if description is not a string', async () => {
      const newTodoData = {
        description: 123,
        title: 'New Todo',
      }
      const res = await request(app)
        .post(`/api/users/${createdUser.id}/todos`)
        .send(newTodoData)

      expect(res.statusCode).toEqual(400)
      expect(res.body.errors.map((e: { msg: string }) => e.msg)).toContain(
        'Description must be a string'
      )
    })

    it('should fail if todoList id is provided but it does not exists', async () => {
      const newTodoData = {
        description: 'New Todo Description',
        title: 'New Todo',
        todoListId: '123',
      }
      const res = await request(app)
        .post(`/api/users/${createdUser.id}/todos`)
        .send(newTodoData)

      expect(res.statusCode).toEqual(404)
      expect(res.body.status).toEqual('error')
      expect(res.body.message).toEqual('TodoList not found')
    })
    it('should fail if todoList id is provided but it is not a string', async () => {
      const newTodoData = {
        description: 'New Todo Description',
        title: 'New Todo',
        todoListId: 123,
      }
      const res = await request(app)
        .post(`/api/users/${createdUser.id}/todos`)
        .send(newTodoData)

      expect(res.statusCode).toEqual(400)
      expect(res.body.status).toEqual('error')
      expect(res.body.errors.map((e: { msg: string }) => e.msg)).toContain(
        'TodoListId must be a string'
      )
    })
  })
  describe('GET /api/users/:userId/todos', () => {
    it('should return 200 and empty array if user does not have todos', async () => {
      const res = await request(app).get(`/api/users/${createdUser.id}/todos`)
      expect(res.statusCode).toEqual(200)
      expect(res).toSatisfyApiSpec()
      expect(res.body.total).toEqual(0)
      expect(res.body.skip).toEqual(0)
      expect(res.body.take).toEqual(10)
      expect(res.body.results.length).toEqual(0)
      expect(res.body.results).toEqual([])
    })

    it('should return 200 and todos if user has todos', async () => {
      const newTodoListData = {
        title: 'New TodoList',
        description: 'New TodoList Description',
      }
      const createdTodoList = await TodoListService.createUserTodoList(
        createdUser.id,
        newTodoListData.title
      )
      const newTodosData = [
        {
          title: 'New Todo',
          description: 'New Todo Description',
        },
        {
          title: 'New Todo 2',
          description: 'New Todo Description 2',
          todoListId: createdTodoList.id,
        },
      ]

      const createdTodos = await Promise.all(
        newTodosData.map((todo) =>
          TodoService.createUserTodo(
            createdUser.id,
            todo.title,
            todo.description
          )
        )
      )

      const res = await request(app).get(`/api/users/${createdUser.id}/todos`)
      expect(res.statusCode).toEqual(200)
      expect(res).toSatisfyApiSpec()
      expect(res.body.total).toEqual(2)
      expect(res.body.skip).toEqual(0)
      expect(res.body.take).toEqual(10)
      expect(res.body.results.length).toEqual(2)
      res.body.results.forEach((todo: TodoWithTodoLists) => {
        expect(todo).toSatisfySchemaInApiSpec('Todo')
        const match = createdTodos.find((t) => t.id === todo.id)
        expect(match).not.toBeNull()
        expect(todo.id).toEqual(match?.id)
        expect(todo.title).toEqual(match?.title)
        expect(todo.description).toEqual(match?.description)
        expect(todo.todoListId).toEqual(match?.todoListId)
        expect(todo.createdAt).toEqual(match?.createdAt.toISOString())
        expect(todo.updatedAt).toEqual(match?.updatedAt.toISOString())
        if (todo.todoListId) {
          expect(todo.todoList?.id).toEqual(createdTodoList.id)
          expect(todo.todoList?.title).toEqual(createdTodoList.title)
        }
      })

      // Clean up todo lists after test
      await TodoListService.deleteUserTodoListById(
        createdUser.id,
        createdTodoList.id
      )

      // Clean up todo after test
      await Promise.all(
        createdTodos.map((todo) =>
          TodoService.deleteUserTodoById(createdUser.id, todo.id)
        )
      )
    })
    it('should allow filter by completed and uncompleted todos', async () => {
      const newUncompletedTodosData = [
        {
          title: 'New Todo 1',
          description: 'New Todo Description',
        },
        {
          title: 'New Todo 2',
          description: 'New Todo Description 2',
        },
      ]
      const newCompletedTodosData = [
        {
          title: 'New Todo 3',
          description: 'New Todo Description 3',
        },
        {
          title: 'New Todo 4',
          description: 'New Todo Description 4',
        },
      ]

      const createdUncompletedTodos = await Promise.all(
        newUncompletedTodosData.map((todo) =>
          TodoService.createUserTodo(
            createdUser.id,
            todo.title,
            todo.description
          )
        )
      )
      const createdCompletedTodos = await Promise.all(
        newCompletedTodosData.map(async (todo) => {
          let createdTodo = await TodoService.createUserTodo(
            createdUser.id,
            todo.title,
            todo.description
          )
          createdTodo = await TodoService.completeUserTodoById(
            createdUser.id,
            createdTodo.id
          )
          return createdTodo
        })
      )

      const res = await request(app).get(
        `/api/users/${createdUser.id}/todos?completed=true`
      )
      expect(res.statusCode).toEqual(200)
      expect(res).toSatisfyApiSpec()
      expect(res.body.total).toEqual(2)
      expect(res.body.skip).toEqual(0)
      expect(res.body.take).toEqual(10)
      expect(res.body.results.length).toEqual(2)
      res.body.results.forEach((todo: TodoWithTodoLists) => {
        expect(todo).toSatisfySchemaInApiSpec('Todo')
        const match = createdCompletedTodos.find((t) => t.id === todo.id)
        expect(match).not.toBeNull()
        expect(todo.id).toEqual(match?.id)
        expect(todo.title).toEqual(match?.title)
        expect(todo.description).toEqual(match?.description)
        expect(todo.todoListId).toEqual(match?.todoListId)
        expect(todo.completed).toEqual(match?.completed)
        expect(todo.createdAt).toEqual(match?.createdAt.toISOString())
        expect(todo.updatedAt).toEqual(match?.updatedAt.toISOString())
      })

      const res2 = await request(app).get(
        `/api/users/${createdUser.id}/todos?completed=false`
      )
      expect(res2.statusCode).toEqual(200)
      expect(res2).toSatisfyApiSpec()
      expect(res2.body.total).toEqual(2)
      expect(res2.body.skip).toEqual(0)
      expect(res2.body.take).toEqual(10)
      expect(res2.body.results.length).toEqual(2)
      res2.body.results.forEach((todo: TodoWithTodoLists) => {
        expect(todo).toSatisfySchemaInApiSpec('Todo')
        const match = createdUncompletedTodos.find((t) => t.id === todo.id)
        expect(match).not.toBeNull()
        expect(todo.id).toEqual(match?.id)
        expect(todo.title).toEqual(match?.title)
        expect(todo.description).toEqual(match?.description)
        expect(todo.todoListId).toEqual(match?.todoListId)
        expect(todo.completed).toEqual(match?.completed)
        expect(todo.createdAt).toEqual(match?.createdAt.toISOString())
        expect(todo.updatedAt).toEqual(match?.updatedAt.toISOString())
      })

      const res3 = await request(app).get(`/api/users/${createdUser.id}/todos`)
      expect(res3.statusCode).toEqual(200)
      expect(res3).toSatisfyApiSpec()
      expect(res3.body.total).toEqual(4)
      expect(res3.body.skip).toEqual(0)
      expect(res3.body.take).toEqual(10)
      expect(res3.body.results.length).toEqual(4)
      res3.body.results.forEach((todo: TodoWithTodoLists) => {
        expect(todo).toSatisfySchemaInApiSpec('Todo')
        const match = [
          ...createdUncompletedTodos,
          ...createdCompletedTodos,
        ].find((t) => t.id === todo.id)
        expect(match).not.toBeNull()
        expect(todo.id).toEqual(match?.id)
        expect(todo.title).toEqual(match?.title)
        expect(todo.description).toEqual(match?.description)
        expect(todo.todoListId).toEqual(match?.todoListId)
        expect(todo.completed).toEqual(match?.completed)
        expect(todo.createdAt).toEqual(match?.createdAt.toISOString())
        expect(todo.updatedAt).toEqual(match?.updatedAt.toISOString())
      })

      // cleanup todos after test
      await Promise.all([
        createdUncompletedTodos.map((todo) =>
          TodoService.deleteUserTodoById(createdUser.id, todo.id)
        ),
        createdCompletedTodos.map((todo) =>
          TodoService.deleteUserTodoById(createdUser.id, todo.id)
        ),
      ])
    })
    it('should fail if user does not exist', async () => {
      const res = await request(app).get(`/api/users/123/todos`)
      expect(res.statusCode).toEqual(404)
    })
  })
  describe('GET /api/users/:userId/todos with pagination', () => {
    let createdUserForGetAllTodos: User
    let createdTodosForGetAllTodos: Todo[]

    const defaultSkip = 0
    const defaultTake = 10
    const defaultOrder = 'asc'

    const listOfTwentyTodosForGetAll = Array.from(
      { length: 20 },
      (_, i) => i + 1
    ).map((i) => ({
      title: `New Todo ${i}`,
      description: `New Todo Description ${i}`,
    }))
    beforeAll(async () => {
      createdUserForGetAllTodos = await UserService.createUser(
        'User for Get All Todos',
        'userforgetalltodos99@example.com'
      )
      createdTodosForGetAllTodos = await Promise.all(
        listOfTwentyTodosForGetAll.map((todo) => {
          const createdTodoForAll = TodoService.createUserTodo(
            createdUserForGetAllTodos.id,
            todo.title,
            todo.description
          )
          return createdTodoForAll
        })
      )
    })
    afterAll(async () => {
      //it will cascade delete all todos and todoslists
      await UserService.deleteUser(createdUserForGetAllTodos.id)
    })
    it('should return all todos for a user and match OpenAPI spec with pagination first page', async () => {
      const firstTenTodos = await TodoService.getAllUserTodos(
        createdUserForGetAllTodos.id,
        undefined,
        defaultSkip,
        defaultTake,
        defaultOrder
      )
      const res = await request(app).get(
        `/api/users/${createdUserForGetAllTodos.id}/todos`
      )
      expect(res.statusCode).toEqual(200)
      expect(res).toSatisfyApiSpec()
      expect(res.body.total).toEqual(defaultTake)
      expect(res.body.skip).toEqual(defaultSkip)
      expect(res.body.take).toEqual(defaultTake)
      expect(res.body.results.length).toEqual(defaultTake)
      res.body.results.forEach((todo: TodoWithTodoLists) => {
        expect(todo).toSatisfySchemaInApiSpec('Todo')
        const match = firstTenTodos.find((t) => t.id === todo.id)
        expect(match).not.toBeNull()
        expect(todo.id).toEqual(match?.id)
        expect(todo.title).toEqual(match?.title)
        expect(todo.description).toEqual(match?.description)
        expect(todo.todoListId).toEqual(match?.todoListId)
        expect(todo.completed).toEqual(match?.completed)
        expect(todo.createdAt).toEqual(match?.createdAt.toISOString())
        expect(todo.updatedAt).toEqual(match?.updatedAt.toISOString())
      })
    })
    it('should return all todos for a user and match OpenAPI spec with pagination second page', async () => {
      const skip = 10
      const take = 10
      const secondTenTodos = await TodoService.getAllUserTodos(
        createdUserForGetAllTodos.id,
        undefined,
        skip,
        take,
        defaultOrder
      )
      const res = await request(app).get(
        `/api/users/${createdUserForGetAllTodos.id}/todos?skip=${skip}&take=${take}`
      )
      expect(res.statusCode).toEqual(200)
      expect(res).toSatisfyApiSpec()
      expect(res.body.total).toEqual(take)
      expect(res.body.skip).toEqual(skip)
      expect(res.body.take).toEqual(take)
      expect(res.body.results.length).toEqual(take)
      res.body.results.forEach((todo: TodoWithTodoLists) => {
        expect(todo).toSatisfySchemaInApiSpec('Todo')
        const match = secondTenTodos.find((t) => t.id === todo.id)
        expect(match).not.toBeNull()
        expect(todo.id).toEqual(match?.id)
        expect(todo.title).toEqual(match?.title)
        expect(todo.description).toEqual(match?.description)
        expect(todo.todoListId).toEqual(match?.todoListId)
        expect(todo.completed).toEqual(match?.completed)
        expect(todo.createdAt).toEqual(match?.createdAt.toISOString())
        expect(todo.updatedAt).toEqual(match?.updatedAt.toISOString())
      })
    })

    it('should return all todos for a user and match OpenAPI spec with pagination first page descending', async () => {
      const firstTenTodos = await TodoService.getAllUserTodos(
        createdUserForGetAllTodos.id,
        undefined,
        defaultSkip,
        defaultTake,
        'desc'
      )
      const res = await request(app).get(
        `/api/users/${createdUserForGetAllTodos.id}/todos?order=desc`
      )
      expect(res.statusCode).toEqual(200)
      expect(res).toSatisfyApiSpec()
      expect(res.body.total).toEqual(defaultTake)
      expect(res.body.skip).toEqual(defaultSkip)
      expect(res.body.take).toEqual(defaultTake)
      expect(res.body.results.length).toEqual(defaultTake)
      res.body.results.forEach((todo: TodoWithTodoLists) => {
        expect(todo).toSatisfySchemaInApiSpec('Todo')
        const match = firstTenTodos.find((t) => t.id === todo.id)
        expect(match).not.toBeNull()
        expect(todo.id).toEqual(match?.id)
        expect(todo.title).toEqual(match?.title)
        expect(todo.description).toEqual(match?.description)
        expect(todo.todoListId).toEqual(match?.todoListId)
        expect(todo.completed).toEqual(match?.completed)
        expect(todo.createdAt).toEqual(match?.createdAt.toISOString())
        expect(todo.updatedAt).toEqual(match?.updatedAt.toISOString())
      })
    })
    it('should return all todos for a user and match OpenAPI spec with pagination second page descending', async () => {
      const skip = 10
      const take = 10
      const secondTenTodos = await TodoService.getAllUserTodos(
        createdUserForGetAllTodos.id,
        undefined,
        skip,
        take,
        'desc'
      )
      const res = await request(app).get(
        `/api/users/${createdUserForGetAllTodos.id}/todos?skip=${skip}&take=${take}&order=desc`
      )
      expect(res.statusCode).toEqual(200)
      expect(res).toSatisfyApiSpec()
      expect(res.body.total).toEqual(take)
      expect(res.body.skip).toEqual(skip)
      expect(res.body.take).toEqual(take)
      expect(res.body.results.length).toEqual(take)
      res.body.results.forEach((todo: TodoWithTodoLists) => {
        expect(todo).toSatisfySchemaInApiSpec('Todo')
        const match = secondTenTodos.find((t) => t.id === todo.id)
        expect(match).not.toBeNull()
        expect(todo.id).toEqual(match?.id)
        expect(todo.title).toEqual(match?.title)
        expect(todo.description).toEqual(match?.description)
        expect(todo.todoListId).toEqual(match?.todoListId)
        expect(todo.completed).toEqual(match?.completed)
        expect(todo.createdAt).toEqual(match?.createdAt.toISOString())
        expect(todo.updatedAt).toEqual(match?.updatedAt.toISOString())
      })
    })
    it('should return all todos for a user and match OpenAPI spec with pagination first of 5 ascending', async () => {
      const firstTenTodos = await TodoService.getAllUserTodos(
        createdUserForGetAllTodos.id,
        undefined,
        defaultSkip,
        5,
        defaultOrder
      )
      const res = await request(app).get(
        `/api/users/${createdUserForGetAllTodos.id}/todos?take=5`
      )
      expect(res.statusCode).toEqual(200)
      expect(res).toSatisfyApiSpec()
      expect(res.body.total).toEqual(5)
      expect(res.body.skip).toEqual(defaultSkip)
      expect(res.body.take).toEqual(5)
      expect(res.body.results.length).toEqual(5)
      res.body.results.forEach((todo: TodoWithTodoLists) => {
        expect(todo).toSatisfySchemaInApiSpec('Todo')
        const match = firstTenTodos.find((t) => t.id === todo.id)
        expect(match).not.toBeNull()
        expect(todo.id).toEqual(match?.id)
        expect(todo.title).toEqual(match?.title)
        expect(todo.description).toEqual(match?.description)
        expect(todo.todoListId).toEqual(match?.todoListId)
        expect(todo.completed).toEqual(match?.completed)
        expect(todo.createdAt).toEqual(match?.createdAt.toISOString())
        expect(todo.updatedAt).toEqual(match?.updatedAt.toISOString())
      })
    })
  })
  describe('GET /api/users/:userId/todos/:todoId', () => {
    it('should return a todo', async () => {
      const createdTodo = await TodoService.createUserTodo(
        createdUser.id,
        'New Todo',
        'New Todo Description'
      )
      const res = await request(app).get(
        `/api/users/${createdUser.id}/todos/${createdTodo.id}`
      )
      expect(res.statusCode).toEqual(200)
      expect(res).toSatisfyApiSpec()
      expect(res.body).toSatisfySchemaInApiSpec('Todo')
      expect(res.body.id).toEqual(createdTodo.id)
      expect(res.body.title).toEqual(createdTodo.title)
      expect(res.body.description).toEqual(createdTodo.description)
      expect(res.body.todoListId).toEqual(createdTodo.todoListId)
      expect(res.body.completed).toEqual(createdTodo.completed)
      expect(res.body.createdAt).toEqual(createdTodo.createdAt.toISOString())
      expect(res.body.updatedAt).toEqual(createdTodo.updatedAt.toISOString())

      // Clean up todo after test
      await TodoService.deleteUserTodoById(createdUser.id, createdTodo.id)
    })

    it('should return a todo with todoList', async () => {
      const createdTodoList = await TodoListService.createUserTodoList(
        createdUser.id,
        'New Todo List'
      )
      const createdTodo = await TodoService.createUserTodo(
        createdUser.id,
        'New Todo',
        'New Todo Description',
        createdTodoList.id
      )
      const res = await request(app).get(
        `/api/users/${createdUser.id}/todos/${createdTodo.id}`
      )
      expect(res.statusCode).toEqual(200)
      expect(res).toSatisfyApiSpec()
      expect(res.body).toSatisfySchemaInApiSpec('Todo')
      expect(res.body.id).toEqual(createdTodo.id)
      expect(res.body.title).toEqual(createdTodo.title)
      expect(res.body.description).toEqual(createdTodo.description)
      expect(res.body.todoListId).toEqual(createdTodo.todoListId)
      expect(res.body.createdAt).toEqual(createdTodo.createdAt.toISOString())
      expect(res.body.updatedAt).toEqual(createdTodo.updatedAt.toISOString())
      expect(res.body.todoList).toSatisfySchemaInApiSpec('TodoList')
      expect(res.body.todoList.id).toEqual(createdTodoList.id)
      expect(res.body.todoList.title).toEqual(createdTodoList.title)
      expect(res.body.todoList.createdAt).toEqual(
        createdTodoList.createdAt.toISOString()
      )
      expect(res.body.todoList.updatedAt).toEqual(
        createdTodoList.updatedAt.toISOString()
      )

      // clean up todo list after test
      await TodoListService.deleteUserTodoListById(
        createdUser.id,
        createdTodoList.id,
        true
      )
    })

    it('should fail if user is not owner of todo', async () => {
      const createdUserTwo = await UserService.createUser(
        'Another User todo',
        'anotherusertodo@example.com'
      )
      const createdTodo = await TodoService.createUserTodo(
        createdUser.id,
        'New Todo',
        'New Todo Description'
      )
      const res = await request(app).get(
        `/api/users/${createdUserTwo.id}/todos/${createdTodo.id}`
      )
      // it fails with 404 since there is no auth middleware
      expect(res.statusCode).toEqual(404)
      // Clean up todo after test
      await TodoService.deleteUserTodoById(createdUser.id, createdTodo.id)
      await UserService.deleteUser(createdUserTwo.id)
    })

    it('should fail if user does not exist', async () => {
      const res = await request(app).get(`/api/users/123/todos/123`)
      expect(res.statusCode).toEqual(404)
    })
    it('should fail if todo does not exist', async () => {
      const res = await request(app).get(
        `/api/users/${createdUser.id}/todos/123`
      )
      expect(res.statusCode).toEqual(404)
    })
  })
  describe('PUT /api/users/:userId/todos/:todoId', () => {
    it('should update a todo', async () => {
      const createdTodo = await TodoService.createUserTodo(
        createdUser.id,
        'New Todo',
        'New Todo Description'
      )
      const updatedData = {
        title: 'Updated Todo',
        description: 'Updated Todo Description',
      }
      const res = await request(app)
        .put(`/api/users/${createdUser.id}/todos/${createdTodo.id}`)
        .send(updatedData)
      expect(res.statusCode).toEqual(200)
      expect(res).toSatisfyApiSpec()
      expect(res.body).toSatisfySchemaInApiSpec('Todo')
      expect(res.body.id).toEqual(createdTodo.id)
      expect(res.body.title).toEqual(updatedData.title)
      expect(res.body.description).toEqual(updatedData.description)
      expect(res.body.todoListId).toEqual(createdTodo.todoListId)
      expect(res.body.createdAt).toEqual(createdTodo.createdAt.toISOString())
      expect(res.body.updatedAt).not.toEqual(
        createdTodo.updatedAt.toISOString()
      )

      // Clean up todo after test
      await TodoService.deleteUserTodoById(createdUser.id, createdTodo.id)
    })

    it('should ignore extra fields', async () => {
      const createdTodo = await TodoService.createUserTodo(
        createdUser.id,
        'New Todo',
        'New Todo Description'
      )
      const updatedData = {
        title: 'Updated Todo',
        description: 'Updated Todo Description',
        extra: 'Extra field',
      }
      const res = await request(app)
        .put(`/api/users/${createdUser.id}/todos/${createdTodo.id}`)
        .send(updatedData)
      expect(res.statusCode).toEqual(200)
      expect(res).toSatisfyApiSpec()
      expect(res.body).toSatisfySchemaInApiSpec('Todo')
      expect(res.body.id).toEqual(createdTodo.id)
      expect(res.body.title).toEqual(updatedData.title)
      expect(res.body.description).toEqual(updatedData.description)
      expect(res.body.todoListId).toEqual(createdTodo.todoListId)
      expect(res.body.createdAt).toEqual(createdTodo.createdAt.toISOString())
      expect(res.body.updatedAt).not.toEqual(
        createdTodo.updatedAt.toISOString()
      )
      expect(res.body).not.toHaveProperty('extra')
      // Clean up todo after test
      await TodoService.deleteUserTodoById(createdUser.id, createdTodo.id)
    })

    it('should ignore completed field since there is a specific endpoint to flat it', async () => {
      const createdTodo = await TodoService.createUserTodo(
        createdUser.id,
        'New Todo',
        'New Todo Description'
        // completed is default to false
      )
      const updatedData = {
        title: 'Updated Todo',
        description: 'Updated Todo Description',
        completed: true,
      }
      const res = await request(app)
        .put(`/api/users/${createdUser.id}/todos/${createdTodo.id}`)
        .send(updatedData)
      expect(res.statusCode).toEqual(200)
      expect(res).toSatisfyApiSpec()
      expect(res.body).toSatisfySchemaInApiSpec('Todo')
      expect(res.body.id).toEqual(createdTodo.id)
      expect(res.body.title).toEqual(updatedData.title)
      expect(res.body.description).toEqual(updatedData.description)
      expect(res.body.todoListId).toEqual(createdTodo.todoListId)
      // even trying to set it to true, it should be false
      expect(res.body.completed).toEqual(false)
      expect(res.body.createdAt).toEqual(createdTodo.createdAt.toISOString())
      expect(res.body.updatedAt).not.toEqual(
        createdTodo.updatedAt.toISOString()
      )
      // Clean up todo after test
      await TodoService.deleteUserTodoById(createdUser.id, createdTodo.id)
    })

    it('should allow update title without description', async () => {
      const createdTodo = await TodoService.createUserTodo(
        createdUser.id,
        'New Todo',
        'New Todo Description'
      )
      const updatedData = {
        title: 'Updated Todo',
      }
      const res = await request(app)
        .put(`/api/users/${createdUser.id}/todos/${createdTodo.id}`)
        .send(updatedData)
      expect(res.statusCode).toEqual(200)
      expect(res).toSatisfyApiSpec()
      expect(res.body).toSatisfySchemaInApiSpec('Todo')
      expect(res.body.id).toEqual(createdTodo.id)
      expect(res.body.title).toEqual(updatedData.title)
      expect(res.body.description).toEqual(createdTodo.description)
      expect(res.body.todoListId).toEqual(createdTodo.todoListId)
      expect(res.body.createdAt).toEqual(createdTodo.createdAt.toISOString())
      expect(res.body.updatedAt).not.toEqual(
        createdTodo.updatedAt.toISOString()
      )
      // Clean up todo after test
      await TodoService.deleteUserTodoById(createdUser.id, createdTodo.id)
    })

    it('should allow update description without title', async () => {
      const createdTodo = await TodoService.createUserTodo(
        createdUser.id,
        'New Todo',
        'New Todo Description'
      )
      const updatedData = {
        description: 'Updated Todo Description',
      }
      const res = await request(app)
        .put(`/api/users/${createdUser.id}/todos/${createdTodo.id}`)
        .send(updatedData)
      expect(res.statusCode).toEqual(200)
      expect(res).toSatisfyApiSpec()
      expect(res.body).toSatisfySchemaInApiSpec('Todo')
      expect(res.body.id).toEqual(createdTodo.id)
      expect(res.body.title).toEqual(createdTodo.title)
      expect(res.body.description).toEqual(updatedData.description)
      expect(res.body.todoListId).toEqual(createdTodo.todoListId)
      expect(res.body.createdAt).toEqual(createdTodo.createdAt.toISOString())
      expect(res.body.updatedAt).not.toEqual(
        createdTodo.updatedAt.toISOString()
      )
      // Clean up todo after test
      await TodoService.deleteUserTodoById(createdUser.id, createdTodo.id)
    })

    it('should allow update todoListId moving to another todoList', async () => {
      const createdTodoListOne = await TodoListService.createUserTodoList(
        createdUser.id,
        'New Todo List One'
      )
      const createdTodoListTwo = await TodoListService.createUserTodoList(
        createdUser.id,
        'New Todo List Two'
      )
      const createdTodo = await TodoService.createUserTodo(
        createdUser.id,
        'New Todo',
        'New Todo Description',
        createdTodoListOne.id
      )
      const updatedData = {
        todoListId: createdTodoListTwo.id,
        title: 'Updated Todo',
      }
      const res = await request(app)
        .put(`/api/users/${createdUser.id}/todos/${createdTodo.id}`)
        .send(updatedData)
      expect(res.statusCode).toEqual(200)
      expect(res).toSatisfyApiSpec()
      expect(res.body).toSatisfySchemaInApiSpec('Todo')
      expect(res.body.id).toEqual(createdTodo.id)
      expect(res.body.title).toEqual(updatedData.title)
      expect(res.body.description).toEqual(createdTodo.description)
      expect(res.body.todoListId).toEqual(createdTodoListTwo.id)
      expect(res.body.createdAt).toEqual(createdTodo.createdAt.toISOString())
      expect(res.body.updatedAt).not.toEqual(
        createdTodo.updatedAt.toISOString()
      )
      // Clean up todo after test
      await TodoService.deleteUserTodoById(createdUser.id, createdTodo.id)
      await TodoListService.deleteUserTodoListById(
        createdUser.id,
        createdTodoListOne.id
      )
      await TodoListService.deleteUserTodoListById(
        createdUser.id,
        createdTodoListTwo.id
      )
    })

    it('should allow update todolistid to null', async () => {
      const createdTodoList = await TodoListService.createUserTodoList(
        createdUser.id,
        'New Todo List'
      )
      const createdTodo = await TodoService.createUserTodo(
        createdUser.id,
        'New Todo',
        'New Todo Description',
        createdTodoList.id
      )
      const updatedData = {
        todoListId: null,
        title: 'Updated Todo',
      }
      const res = await request(app)
        .put(`/api/users/${createdUser.id}/todos/${createdTodo.id}`)
        .send(updatedData)
      expect(res.statusCode).toEqual(200)
      expect(res).toSatisfyApiSpec()
      expect(res.body).toSatisfySchemaInApiSpec('Todo')
      expect(res.body.id).toEqual(createdTodo.id)
      expect(res.body.title).toEqual(updatedData.title)
      expect(res.body.description).toEqual(createdTodo.description)
      expect(res.body.todoListId).toEqual(null)
      expect(res.body.createdAt).toEqual(createdTodo.createdAt.toISOString())
      expect(res.body.updatedAt).not.toEqual(
        createdTodo.updatedAt.toISOString()
      )
      // Clean up todo after test
      await TodoService.deleteUserTodoById(createdUser.id, createdTodo.id)
      await TodoListService.deleteUserTodoListById(
        createdUser.id,
        createdTodoList.id
      )
    })

    it('should fail if user does not exist', async () => {
      const res = await request(app).put(`/api/users/123/todos/123`)
      expect(res.statusCode).toEqual(404)
    })
    it('should fail if todo does not exist', async () => {
      const res = await request(app).put(
        `/api/users/${createdUser.id}/todos/123`
      )
      expect(res.statusCode).toEqual(404)
    })
    it('should fail if todolist does not exist', async () => {
      const createdTodo = await TodoService.createUserTodo(
        createdUser.id,
        'New Todo',
        'New Todo Description'
      )
      const updatedData = {
        todoListId: '123',
      }
      const res = await request(app)
        .put(`/api/users/${createdUser.id}/todos/${createdTodo.id}`)
        .send(updatedData)
      expect(res.statusCode).toEqual(404)
      // Clean up todo after test
      await TodoService.deleteUserTodoById(createdUser.id, createdTodo.id)
    })
    it('should fail if user is not owner of todo', async () => {
      const createdUserTwo = await UserService.createUser(
        'Another User todo',
        'anotherusertodo@example.com'
      )
      const createdTodo = await TodoService.createUserTodo(
        createdUser.id,
        'New Todo',
        'New Todo Description'
      )
      const res = await request(app).put(
        `/api/users/${createdUserTwo.id}/todos/${createdTodo.id}`
      )
      // it fails with 404 since there is no auth middleware
      expect(res.statusCode).toEqual(404)
      // Clean up todo after test
      await TodoService.deleteUserTodoById(createdUser.id, createdTodo.id)
      await UserService.deleteUser(createdUserTwo.id)
    })

    it('should fail if user is not owner of todolist', async () => {
      const createdUserTwo = await UserService.createUser(
        'Another User todo',
        'anotherusertodo2@example.com'
      )
      const createdTodoList = await TodoListService.createUserTodoList(
        createdUserTwo.id,
        'New Todo List'
      )
      const createdTodo = await TodoService.createUserTodo(
        createdUser.id,
        'New Todo',
        'New Todo Description'
      )
      const updatedData = {
        todoListId: createdTodoList.id,
      }
      const res = await request(app)
        .put(`/api/users/${createdUser.id}/todos/${createdTodo.id}`)
        .send(updatedData)
      // it fails with 404 since there is no auth middleware
      expect(res.statusCode).toEqual(404)
      // Clean up todo after test
      await TodoService.deleteUserTodoById(createdUser.id, createdTodo.id)
      await TodoListService.deleteUserTodoListById(
        createdUserTwo.id,
        createdTodoList.id
      )
      await UserService.deleteUser(createdUserTwo.id)
    })

    it('should fail it title is empty string', async () => {
      const createdTodo = await TodoService.createUserTodo(
        createdUser.id,
        'New Todo',
        'New Todo Description'
      )
      const updatedData = {
        title: '',
      }
      const res = await request(app)
        .put(`/api/users/${createdUser.id}/todos/${createdTodo.id}`)
        .send(updatedData)
      expect(res.statusCode).toEqual(400)
      // Clean up todo after test
      await TodoService.deleteUserTodoById(createdUser.id, createdTodo.id)
    })
    it('should fail it title is not string', async () => {
      const createdTodo = await TodoService.createUserTodo(
        createdUser.id,
        'New Todo',
        'New Todo Description'
      )
      const updatedData = {
        title: 123,
      }
      const res = await request(app)
        .put(`/api/users/${createdUser.id}/todos/${createdTodo.id}`)
        .send(updatedData)
      expect(res.statusCode).toEqual(400)
      // Clean up todo after test
      await TodoService.deleteUserTodoById(createdUser.id, createdTodo.id)
    })
    it('should fail if description is not string', async () => {
      const createdTodo = await TodoService.createUserTodo(
        createdUser.id,
        'New Todo',
        'New Todo Description'
      )
      const updatedData = {
        description: 123,
      }
      const res = await request(app)
        .put(`/api/users/${createdUser.id}/todos/${createdTodo.id}`)
        .send(updatedData)
      expect(res.statusCode).toEqual(400)
      // Clean up todo after test
      await TodoService.deleteUserTodoById(createdUser.id, createdTodo.id)
    })
  })
  describe('DELETE /api/users/:userId/todos/:todoId', () => {
    it('should delete todo', async () => {
      const createdTodo = await TodoService.createUserTodo(
        createdUser.id,
        'New Todo',
        'New Todo Description'
      )
      const res = await request(app).delete(
        `/api/users/${createdUser.id}/todos/${createdTodo.id}`
      )
      expect(res.statusCode).toEqual(204)
    })
    it('should fail if user does not exist', async () => {
      const res = await request(app).delete(`/api/users/123/todos/123`)
      expect(res.statusCode).toEqual(404)
    })
    it('should fail if todo does not exist', async () => {
      const res = await request(app).delete(
        `/api/users/${createdUser.id}/todos/123`
      )
      expect(res.statusCode).toEqual(404)
    })
    it('should fail if user is not owner of todo', async () => {
      const createdUserTwo = await UserService.createUser(
        'Another User todo',
        'anothertusertodo4deletetodo@example.com'
      )
      const createdTodo = await TodoService.createUserTodo(
        createdUser.id,
        'New Todo',
        'New Todo Description'
      )
      const res = await request(app).delete(
        `/api/users/${createdUserTwo.id}/todos/${createdTodo.id}`
      )
      // it fails with 404 since there is no auth middleware
      expect(res.statusCode).toEqual(404)
      // Clean up todo after test
      await TodoService.deleteUserTodoById(createdUser.id, createdTodo.id)
      await UserService.deleteUser(createdUserTwo.id)
    })
  })

  describe('PATCH /api/users/:userId/todos/:todoId/complete', () => {
    it('should mark todo as done', async () => {
      const createdTodo = await TodoService.createUserTodo(
        createdUser.id,
        'New Todo',
        'New Todo Description'
      )
      const res = await request(app).patch(
        `/api/users/${createdUser.id}/todos/${createdTodo.id}/complete`
      )
      expect(res.statusCode).toEqual(200)
      expect(res.body).toSatisfySchemaInApiSpec('Todo')
      expect(res.body.id).toEqual(createdTodo.id)
      expect(res.body.completed).toEqual(true)
      // Clean up todo after test
      await TodoService.deleteUserTodoById(createdUser.id, createdTodo.id)
    })
    it('should fail if user does not exist', async () => {
      const res = await request(app).patch(`/api/users/123/todos/123/complete`)
      expect(res.statusCode).toEqual(404)
    })
    it('should fail if todo does not exist', async () => {
      const res = await request(app).patch(
        `/api/users/${createdUser.id}/todos/123/complete`
      )
      expect(res.statusCode).toEqual(404)
    })
    it('should fail if user is not owner of todo', async () => {
      const createdUserTwo = await UserService.createUser(
        'Another User todo',
        'anotheruserforcompleteodo@example.com'
      )
      const createdTodo = await TodoService.createUserTodo(
        createdUser.id,
        'New Todo',
        'New Todo Description'
      )
      const res = await request(app).patch(
        `/api/users/${createdUserTwo.id}/todos/${createdTodo.id}/complete`
      )
      // it fails with 404 since there is no auth middleware
      expect(res.statusCode).toEqual(404)
      // Clean up todo after test
      await TodoService.deleteUserTodoById(createdUser.id, createdTodo.id)
      await UserService.deleteUser(createdUserTwo.id)
    })
  })

  describe('PATCH /api/users/:userId/todos/:todoId/uncomplete', () => {
    it('should mark todo as not complete', async () => {
      const createdTodo = await TodoService.createUserTodo(
        createdUser.id,
        'New Todo',
        'New Todo Description'
      )
      const res = await request(app).patch(
        `/api/users/${createdUser.id}/todos/${createdTodo.id}/uncomplete`
      )
      expect(res.statusCode).toEqual(200)
      expect(res.body).toSatisfySchemaInApiSpec('Todo')
      expect(res.body.id).toEqual(createdTodo.id)
      expect(res.body.completed).toEqual(false)
      // Clean up todo after test
      await TodoService.deleteUserTodoById(createdUser.id, createdTodo.id)
    })
    it('should fail if user does not exist', async () => {
      const res = await request(app).patch(
        `/api/users/123/todos/123/uncomplete`
      )
      expect(res.statusCode).toEqual(404)
    })
    it('should fail if todo does not exist', async () => {
      const res = await request(app).patch(
        `/api/users/${createdUser.id}/todos/123/uncomplete`
      )
      expect(res.statusCode).toEqual(404)
    })
    it('should fail if user is not owner of todo', async () => {
      const createdUserTwo = await UserService.createUser(
        'Another User todo',
        'anotheruserforuncompleteodo@example.com'
      )
      const createdTodo = await TodoService.createUserTodo(
        createdUser.id,
        'New Todo',
        'New Todo Description'
      )
      const res = await request(app).patch(
        `/api/users/${createdUserTwo.id}/todos/${createdTodo.id}/uncomplete`
      )
      // it fails with 404 since there is no auth middleware
      expect(res.statusCode).toEqual(404)
      // Clean up todo after test
      await TodoService.deleteUserTodoById(createdUser.id, createdTodo.id)
      await UserService.deleteUser(createdUserTwo.id)
    })
  })

  describe('PATCH /api/users/:userId/todos/:todoId/toggle', () => {
    it('should mark toggle todo', async () => {
      const createdTodo = await TodoService.createUserTodo(
        createdUser.id,
        'New Todo',
        'New Todo Description'
      )
      const res = await request(app).patch(
        `/api/users/${createdUser.id}/todos/${createdTodo.id}/toggle`
      )
      expect(res.statusCode).toEqual(200)
      expect(res.body).toSatisfySchemaInApiSpec('Todo')
      expect(res.body.id).toEqual(createdTodo.id)
      expect(res.body.completed).toEqual(true)
      const res2 = await request(app).patch(
        `/api/users/${createdUser.id}/todos/${createdTodo.id}/toggle`
      )
      expect(res2.statusCode).toEqual(200)
      expect(res2.body).toSatisfySchemaInApiSpec('Todo')
      expect(res2.body.id).toEqual(createdTodo.id)
      expect(res2.body.completed).toEqual(false)
      // Clean up todo after test
      await TodoService.deleteUserTodoById(createdUser.id, createdTodo.id)
    })
    it('should fail if user does not exist', async () => {
      const res = await request(app).patch(`/api/users/123/todos/123/toggle`)
      expect(res.statusCode).toEqual(404)
    })
    it('should fail if todo does not exist', async () => {
      const res = await request(app).patch(
        `/api/users/${createdUser.id}/todos/123/toggle`
      )
      expect(res.statusCode).toEqual(404)
    })
    it('should fail if user is not owner of todo', async () => {
      const createdUserTwo = await UserService.createUser(
        'Another User todo',
        'anotheruserfortoggleodo@example.com'
      )
      const createdTodo = await TodoService.createUserTodo(
        createdUser.id,
        'New Todo',
        'New Todo Description'
      )
      const res = await request(app).patch(
        `/api/users/${createdUserTwo.id}/todos/${createdTodo.id}/toggle`
      )
      // it fails with 404 since there is no auth middleware
      expect(res.statusCode).toEqual(404)
      // Clean up todo after test
      await TodoService.deleteUserTodoById(createdUser.id, createdTodo.id)
      await UserService.deleteUser(createdUserTwo.id)
    })
  })
})
