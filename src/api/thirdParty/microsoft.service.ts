import {
  MicrosoftAuthProvider,
  MicrosoftGraphClient,
} from '../../config/microsoft-graph-client'

export class MicrosoftTodoService extends MicrosoftGraphClient {
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
  public async getUserTodoLists() {
    return await this.client?.api('/me/todo/lists').get()
  }
}
