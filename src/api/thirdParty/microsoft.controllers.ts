import { Request, Response } from 'express'
import logger from '../../utils/logger'
import {
  MicrosoftAuthProvider,
} from '../../config/microsoft-graph-client'
import { UserService } from '../users/user.service'
import { MicrosoftTodoService } from './microsoft.service'

export async function signIn(req: Request, res: Response) {
  try {
    const currentUserId = req?.params?.userId
    logger.debug('STATE BEING SENT', { userId: currentUserId })
    const stateAsString = JSON.stringify({ userId: currentUserId })
    const authProvider = new MicrosoftAuthProvider()
    const authUrl = await authProvider.getAuthCodeUrl(stateAsString)
    logger.debug('MICROSOFT AUTH REDIRECTING')
    res.redirect(authUrl)
  } catch (error) {
    logger.error(`Error: ${error}`)
    res.redirect('/error')
  }
}
export async function callback(req: Request, res: Response) {
  let dbUserId = ''
  try {
    const stateAsString = req?.query?.state as string
    const state = JSON.parse(stateAsString)
    dbUserId = state?.userId
    const authProvider = new MicrosoftAuthProvider()
    const response = await authProvider.acquireTokenByCode(
      req?.query?.code as string
    )
    const microsoftUserId = response?.account?.homeAccountId

    if (microsoftUserId) {
      const microsoftGraphClient = new MicrosoftTodoService(
        await authProvider.getMsalInstance(),
        microsoftUserId
      )
      const user = await microsoftGraphClient.getMe()
      if (user) {
        // persist microsoftUserId to dbUser
        logger.debug('PERSISTING MICROSOFT USER ID', { microsoftUserId })
        await UserService.setUserMicrosoftUserId(dbUserId, microsoftUserId)
        // now we need to sync all todoLists and respective todos to our database
        await microsoftGraphClient.syncMicrosoftWithDatabase(dbUserId)
      }
      logger.debug('USER', { user })
    } else {
      logger.error('No user ID returned from Microsoft')
    }
  } catch (error) {
    logger.error('error_msg', {
      message: 'Error completing authentication',
      debug: JSON.stringify(error, Object.getOwnPropertyNames(error)),
    })
  }

  res.redirect(`/api/users/${dbUserId}/auth/microsoft/me`)
}

export async function getMe(req: Request, res: Response) {
  const microsoftUserId = await getMicrosoftUserId(req)
  if (!microsoftUserId) {
    return res.status(404).send('No Microsoft user ID found')
  }
  const authProvider = new MicrosoftAuthProvider()
  const microsoftGraphClient = new MicrosoftTodoService(
    await authProvider.getMsalInstance(),
    microsoftUserId
  )
  const microsoftUser = await microsoftGraphClient.getMe()
  return res.json({
    microsoftUser,
  })
}

export async function getUserTodoLists(req: Request, res: Response) {
  const microsoftUserId = await getMicrosoftUserId(req)
  if (!microsoftUserId) {
    return res.status(404).send('No Microsoft user ID found')
  }
  const authProvider = new MicrosoftAuthProvider()
  const microsoftTodoService = new MicrosoftTodoService(
    await authProvider.getMsalInstance(),
    microsoftUserId
  )
  const todoLists = await microsoftTodoService.getUserTodoLists()
  return res.json({
    todoLists,
  })
}

export async function getAllUserTodosByListId(req: Request, res: Response) {
    const listId = req?.params?.todoListId
    const microsoftUserId = await getMicrosoftUserId(req)
    if (!microsoftUserId) {
        return res.status(404).send('No Microsoft user ID found')
    }
    const authProvider = new MicrosoftAuthProvider()
    const microsoftTodoService = new MicrosoftTodoService(
        await authProvider.getMsalInstance(),
        microsoftUserId
    )
    const allTodosByListId = await microsoftTodoService.getUserTodosByListId(listId)
    return res.json(allTodosByListId)

}

export async function getAllUserListsAndTodos(req: Request, res:Response) {
    const microsoftUserId = await getMicrosoftUserId(req)
    if (!microsoftUserId) {
        return res.status(404).send('No Microsoft user ID found')
    }
    const authProvider = new MicrosoftAuthProvider()
    const microsoftTodoService = new MicrosoftTodoService(
        await authProvider.getMsalInstance(),
        microsoftUserId
    )
    const allTodos = await microsoftTodoService.getAllUserListsAndTodos()
    return res.json(allTodos)
}

export async function notificationUrl(req: Request, res: Response) {
    logger.error(req.query)
    res.status(200).send('OK')
}

async function getMicrosoftUserId(req: Request) {
  const userId = req?.params?.userId
  const user = await UserService.getUserById(userId)
  const microsoftUserId = user?.microsoftUserId
  return microsoftUserId
}
