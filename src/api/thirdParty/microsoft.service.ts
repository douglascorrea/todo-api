import * as msal from '@azure/msal-node'
import * as graph from '@microsoft/microsoft-graph-client'
import logger from '../../utils/logger'
import { TodoService } from '../todos/todo.service'
import { TodoListService } from '../todoLists/todoList.service'

export class MicrosoftTodoService {
  // this service is scoped under a userId which is the accountId from microsoft
  // it will use the MicrosoftAuthProvider to get the access token for the user
  // and then use the MicrosoftGraphClient to make requests to the Microsoft Graph API
  // We will need to register a userId for use this service

  // Also there is a thirdPartyCacheStore that will store the msal-node login cache,
  // that way we don't need to handle accessToken and refreshTokens
  //
  // For Reference:
  // https://github.com/AzureAD/microsoft-authentication-library-for-js/issues/5140
  // https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-node/docs/caching.md
  public client: graph.Client | null

  constructor(msalClient: msal.ConfidentialClientApplication, userId: string) {
    this.client = this.getAuthenticatedClient(msalClient, userId)
  }

  private getAuthenticatedClient(
    msalClient: msal.ConfidentialClientApplication,
    userId: string
  ) {
    if (!msalClient || !userId) {
      throw new Error(
        `Invalid MSAL state. Client: ${
          msalClient ? 'present' : 'missing'
        }, User ID: ${userId ? 'present' : 'missing'}`
      )
    }

    // Initialize Graph client
    logger.debug('initializing microsoft client client')
    const client = graph.Client.init({
      // Implement an auth provider that gets a token
      // from the app's MSAL instance
      authProvider: async (done) => {
        try {
          // Get the user's account

          const account = await msalClient
            .getTokenCache()
            .getAccountByHomeId(userId)

          if (account) {
            // Attempt to get the token silently
            // This method uses the token cache and
            // refreshes expired tokens as needed
            const scopes =
              process.env.MICROSOFT_SCOPES ||
              'https://graph.microsoft.com/.default'
            const response = await msalClient.acquireTokenSilent({
              scopes: scopes.split(','),
              account: account,
            })
            logger.debug('ACCESS TOKEN', { token: response.accessToken })

            // First param to callback is the error,
            // Set to null in success case
            done(null, response.accessToken)
          }
        } catch (err) {
          logger.error(JSON.stringify(err, Object.getOwnPropertyNames(err)))
          done(err, null)
        }
      },
    })

    return client
  }
  public async getMe() {
    const user = await this.client?.api('/me').get()
    return user
  }
  public async getUserTodoLists() {
    return await this.client?.api('/me/todo/lists').get()
  }

  public async getUserTodosByListId(listId: string) {
    return await this.client?.api(`/me/todo/lists/${listId}/tasks`).get()
  }

  public async getAllUserListsAndTodos() {
    const lists = await this.getUserTodoLists()
    const todos = await Promise.all(
      lists.value.map(async (list: any) => {
        const todosResponse = await this.getUserTodosByListId(list.id)
        return { ...list, todos: todosResponse.value }
      })
    )
    return todos
  }

  public async syncMicrosoftWithDatabase(dbUserId: string) {
    const microsoftAllUserListsAndTodos =
      await this.getAllUserListsAndTodos()
    await Promise.all([
      microsoftAllUserListsAndTodos.map(async (list) => {
        const { id, displayName } = list
        const dbList = await TodoListService.createUserTodoList(
          dbUserId,
          displayName,
          id
        )
        await Promise.all([
          list?.todos?.map(async (todo: any) => {
            const { id, title, body } = todo
            const description = body?.content
            const completed = todo?.status === 'completed'
            const dbTodo = await TodoService.createUserTodo(
              dbUserId,
              title,
              description,
              dbList.id
            )
            if (completed) {
              await TodoService.completeUserTodoById(dbUserId, dbTodo.id)
            }
          }),
        ])
      }),
    ])
  }
}
