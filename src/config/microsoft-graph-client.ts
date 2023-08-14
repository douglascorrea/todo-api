import 'isomorphic-fetch'
import * as msal from '@azure/msal-node'
import * as graph from '@microsoft/microsoft-graph-client'
import logger from '../utils/logger'
import prisma from './database'

export class MicrosoftAuthProvider {
  private msalConfig: msal.Configuration
  private msalInstance: msal.ConfidentialClientApplication | null
  private scopes: string
  private redirectUri: string
  private urlParameters: {
    scopes: string[]
    redirectUri: string
  }

  constructor() {
    this.msalConfig = {
      auth: {
        clientId: process.env.MICROSOFT_CLIENT_ID || '',
        authority: process.env.MICROSOFT_AUTHORITY || '',
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
      },
      system: {
        loggerOptions: {
          loggerCallback(loglevel: any, message: any, containsPii: any) {
            if (!containsPii) logger.info(message)
          },
          piiLoggingEnabled: false,
          logLevel: msal.LogLevel.Verbose,
        },
      },
      cache: {
        cachePlugin: this.getCachePlugin(),
      },
    }
    this.msalInstance = null
    this.scopes = process.env.MICROSOFT_SCOPES || ''
    this.redirectUri = process.env.MICROSOFT_REDIRECT_URI || ''
    this.urlParameters = {
      redirectUri: this.redirectUri,
      scopes: this.scopes.split(','),
    }
  }

  private getCachePlugin() {
    return {
      beforeCacheAccess: async (cacheContext: msal.TokenCacheContext) => {
        const tokens = await this.getTokensFromDb()
        const dbCache = tokens ? tokens : ''
        cacheContext.tokenCache.deserialize(dbCache)
      },
      afterCacheAccess: async (cacheContext: msal.TokenCacheContext) => {
        if (cacheContext.cacheHasChanged) {
          const cache = cacheContext.tokenCache.serialize()
          await this.putTokensInDb(cache)
        }
      },
    }
  }
  private async getTokensFromDb() {
    logger.debug('Reading cache from DB')
    const cache = await prisma.thirdPartyCacheStore.findUnique({
      where: { key: 'microsoft' },
    })
    return cache?.value
  }
  private async putTokensInDb(cache: string) {
    logger.debug('Writing cache to DB')
    await prisma.thirdPartyCacheStore.upsert({
      where: { key: 'microsoft' },
      update: { value: cache },
      create: { key: 'microsoft', value: cache },
    })
  }
  public async getMsalInstance() {
    if (!this.msalInstance) {
      this.msalInstance = new msal.ConfidentialClientApplication(
        this.msalConfig
      )
    }
    return this.msalInstance
  }

  public async getAuthCodeUrl(state?: string) {
    const msalInstance = await this.getMsalInstance()
    return msalInstance.getAuthCodeUrl({ ...this.urlParameters, state })
  }

  public async acquireTokenByCode(code: string) {
    const tokenRequest = {
      code: code,
      ...this.urlParameters,
    }
    const msalInstance = await this.getMsalInstance()
    return msalInstance.acquireTokenByCode(tokenRequest)
  }
}

export class MicrosoftGraphClient {
  protected client: graph.Client | null

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
}
