# Todo API

This project provides an API for managing todos and todo lists for users. It's built using Typescript, Node.js, Express, Prisma, and PostgreSQL.

## Features as required

### Requirements as per the assignment

- [x] API to query Todos (potentially many!)
- [x] Query Todos that are not done
- [x] Todos can be grouped in lists
- [x] API to add a Todo
- [x] API to update Todos
- [x] Mark Todos as done

---
**THIS IS STILL WORKING IN PROGRESS**

- [x] We would like you to integrate with another service provider. It can be any Todo service (e.g. Microsoft Todo APIs), or you can also use a mock provider. Todos should be kept in sync between our service and the third-party integration
**I've decide to sync with Microsoft Todo Api via Microsoft Graph API**

- [X] Todos created in the third-party integration should always be created in our service
    - **THIS IS NOT ENTIRELY IMPLEMENTED EXPLAINED BELOW**
- [X] The status of todos should always be in sync between our service and the integration
---

- **Tech**
  - [x] If possible use a relational DB, PostgreSQL would be perfect!
  - [x] Provide data model for Todos

Bonus:

- [ ] Let's create GraphQL APIs **This is not implemented in this version, will implement soon**
- [x] typescript would be great, but most common languages are okay

> Note: We expect you to treat the challenge as a real world production app development that is meant to:
> Scale to 10+ engineers contributing simultaneous
> Wherever you might have to take shortcuts point it out and explain what you would do differently!
> We would like you to take assumptions and decisions of how the product and the third-party integration should work, if needed you can highlight and explain decisions in a README inside the project.

# Technical Decisions and Assumptions:

## Decisions

## Using Typescript
I've decided to use Typescript as requested and also because I'm more familiar with it. It provides a good way to have a typed code and also a good way to document the code. It also provides a good way to have a good IDE support.

## Using Prisma as ORM

I decided to use Prisma as ORM for this project. It provides a way to easy manage the database schema and migrations. And it is decouple from the application code. So, if we need to change the database, we can do it easily.

## Scoping the API for a specific user

Besides we don't have authentication/authorization for this application, I decided to scope all requests under `/api/users/:userId` which seems to be a real use case for a simple todo app. So, all requests for getting `todoLists` and `todos` must have a valid `userId` in the path. This is a simple way to avoid any security issues.

## Having 3 main entities: User, TodoList and Todo

The 3 main entities for this project are `User`, `TodoList` and `Todo`. Each one of them have their own endpoints and can be managed separately. The `TodoList` and `Todo` entities are scoped by `User` so that is why we have the `userId` in the path for all requests.

## Using OpenAPI / Swagger for API Documentation

I decided to use OpenAPI / Swagger for API Documentation because it is a standard and it is easy to use. It also provide a way to test the API endpoints using a web interface directly from the docs. You can easily go to the `/api/docs` endpoint, read documentation and test the API.
There is a `swagger.json` definition on the root of the project which is used by the `swagger-ui-express` package to generate the documentation.

## Using Jest and Supertest for Integration Tests

I decided to use Jest and Supertest for Integration Tests because they are easy to use and provide a good way to test the API endpoints and the database layer. I also used the `jest-openapi` package to validate the API responses against the OpenAPI / Swagger definition.

I've focused in integration tests since the application has a CRUD API and the business logic is very simple. So, I think it is not necessary to have unit tests for the project as is. And the integration tests cover the most important parts of the application.

I've also set a `test:integration:coverage` script for getting coverage report which shows that the integration tests cover almost 100% of the code. **Check documentation for running the tests and coverage report**

Currently are **101 tests** separated in *4 test suites* and covering **88.52%** of the code.

Check [all tests screenshot](./all-tests.png)


## Using express-validator for Request Validation

I decided to use express-validator for Request Validation because it is easy to use and provide a good way to validate the request body, param and query parameters.

I put a lot of efforts on validation, since I think this is a important part of this project to demonstrate how to validate the requests and avoid any data inconsistency in the database. And also this plays the role of implementing part of the business logic and also demonstrate my skills in this area.

## Using Winston and Morgan for Logging

I decided to use Winston and Morgan for Logging because they are easy to use and provide a good way to log the application events. For production environment we will have a `log/error.log` and `log/combined.log` if we need to debug the application.
I've decided to silent logs on test environment to avoid noise in the test output, as I'm using TDD approach to develop this project.

## Using Docker and Docker Compose for Development and Testing

I decided to use docker for the DB environment since it is easy to use in development and also easy to setup for integration tests

## Using ESLint and Prettier for Code Formatting
ESLint and Prettier are pretty standard for NodeJS projects. I've used a simple rule set for ESLint and Prettier to avoid any conflicts between them. *No Semicolons* and *Single Quotes* are the only rules that I've changed from the default configuration.

## Third Party API Integration
I've decided to sync with Microsoft Todos, using Microsoft Graph API.

I will describe the flow below, but before let me explain how I've setup this integration.

I've to create an application on Azure as described in [this tutorial](https://learn.microsoft.com/en-us/graph/auth-register-app-v2).

I'm using `@azure/msal-node` library for authenticating and `@microsoft/microsoft-graph-client`

There is one **important detail** while using `msal-node`. As we need to do sync "offline", we should be able to call the API in behalf of the user without need the consent OAuth flow, even if the `accessToken` expires. Normally we could use a `refreshToken` in an OAuth flow, but the `msal-node` library does not exposes this token. And they advice to keep using they `acquireTokenSilent` method, which will check in **cache** if you have a valid `accessToken` and if not they will use the `refreshToken` from the same cache.

The challenge here was that the default **cache** is `in-memory` so it will not persist between application restarts. So, I've decided to create a `cachePlugin` to persist such cache in the database.

Let's go to authentication flow:

Since there is no authentication in our side, but an OAuth flow is necessary on Microsoft Todo side, I've used the following approach to sync:
1) We create a user in our application using the `/api/users` endpoint as documented in `/api/docs`
2) We get the `userId` from the response
3) I've created a specific endpoint for handling the OAuth flow. Normally this endpoint should be called by the client or even handled entirely by the frontend client. But for demonstration purposes I've decided to implement the entire flow in the backend.
So with the `userId` from step 2 we call `/api/users/:userId/auth/microsoft/signin` endpoint which will redirect to Microsoft OAuth flow.
4) The user will login in Microsoft and grant access to our application to access the Microsoft Todo API
5) When the OAuth flow is completed, Microsoft will redirect to our `/api/users/:userId/auth/microsoft/callback` endpoint with the `code` and `state` parameters and we will sync the user's `todoLists` and `todos` with Microsoft Todo API.
So the user that has `userId` will have all lists and todo lists from the Microsoft logged account.

6) From now forward the Todos and TodosList should be kept in sync.
For doing this I've implemented a *hook* in `TodoListsService` and `TodoService` that every mutation on our side will also call `MicrosoftTodoService` for doing that mutation in Microsoft Todo API.

7) Also, during the sync process on step 5, I've created a `subscribeToMicrosoftTodoListChanges` method in the `MicrosoftTodoService` that will use the `subscribe` endpoint from Microsoft Graph API to set a webhook for our application to receive notifications when the user's `todoLists` and `todos` are changed in Microsoft Todo API. So, when a change is detected in Microsoft Todo API, we will also update our database.
** THIS NOTIFICATION API HAS A LIMITATION **
The limitation is that we can only set a notification ona specific list which will monitor only the underneat tasks. Which means if the user creates another in microsoft side we will not be able to
receive notifications
https://learn.microsoft.com/en-us/graph/webhooks#supported-resources

** THIS FEATURE IS NOT FULLY TESTED I WILL CONTINUE IMPROVING IT AFTER THE DEADLINE **

## File Structure

I decided to have 4 main root folders: `src`, `test`, `prisma` and `log`.
- `src` folder contains all the source code for the application.
- `test` folder contains all the integration tests.
- `prisma` folder contains all the database schema and migrations.
- `log` folder contains all the logs for the application.

Inside `src` I've separated like this:
- `api` folder contains all the API endpoints. (Even that all are scoped by `userId`, I've decided to have a separate folder for each entity). Each entity has its own `controller`, `service`, `validation` files. Only the `User` entity has `routes` as every route is scoped by `userId`.
- `config` folder contains the configuration files for the application, for this project we have only `db`
- `middleware` some middleware for handling errors and notFound pages
- `utils` some utility functions for the application
- `validators/common` some common utilities for using with express-validator

# Assumptions

## There is no authentication for this project

As asked by email, I didn't implemented authentication for this project. So, all requests must have a valid `userId` in the path. This is a simple way to isolate the data for each user.

# Prerequisites to Run this Project

- Node.js (The app run in local NodeJS environment) - v16+
    - You can use **Homebrew** to install NodeJS on Mac or **nvm** to manage multiple NodeJS versions
- Docker and Docker Compose (the DB run in Docker container)

# How to Setup

## Clone this project

```bash
git clone git@github.com:douglascorrea/todo-api.git
```

## Install dependencies

```bash
cd todo-api
npm install
```

## Environment Variables

# THIS IS A IMPORTANT STEP

Before running the project, you need to set up environment variables. This project uses two environment files: `.env.development` for development and `.env.test` for integration tests.

1. Create a `.env.development` file in the root directory with the following content:

```env
NODE_ENV=development
DATABASE_URL=postgres://postgres:postgres@localhost:5432/todoapi

# Microsoft Graph API Integration
MICROSOFT_AUTHORITY='https://login.microsoftonline.com/common'
MICROSOFT_REDIRECT_URI='http://localhost:3000/auth/microsoft/callback'
MICROSOFT_SCOPES='user.read,calendars.readwrite,offline_access,tasks.readwrite'

# It is not a good practice to store secrets and client id in github, that is why the .env files are not in Github.
# But I'm putting this data here to make it easier to run this project
# Feel free to create your own application on Azure I will include steps below
MICROSOFT_CLIENT_ID='5374e251-11a5-4d76-8669-adfb45bb807e'
MICROSOFT_CLIENT_SECRET='hBJ8Q~c~t1qeXqMIJ.8uTrmz7JZnm3_3zQskfaSG'
```

2. Create a `.env.test` file in the root directory with the following content:

```env
NODE_ENV=test
DATABASE_URL=postgres://prisma:prisma@localhost:5433/tests

# Microsoft Graph API Integration
MICROSOFT_AUTHORITY='https://login.microsoftonline.com/common'
MICROSOFT_REDIRECT_URI='http://localhost:3000/auth/microsoft/callback'
MICROSOFT_SCOPES='user.read,calendars.readwrite,offline_access,tasks.readwrite'

# It is not a good practice to store secrets and client id in github, that is why the .env files are not in Github.
# But I'm putting this data here to make it easier to run this project
# Feel free to create your own application on Azure I will include steps below
MICROSOFT_CLIENT_ID='5374e251-11a5-4d76-8669-adfb45bb807e'
MICROSOFT_CLIENT_SECRET='hBJ8Q~c~t1qeXqMIJ.8uTrmz7JZnm3_3zQskfaSG'
```

**Note**: It's a good practice not to commit `.env` files to version control. That is why .env files are in `.gitignore`.

## The Docker Setup for this project

This project uses Docker to run PostgreSQL for both development and testing environments.

For development, the setup is handled by the `dev` script in the `package.json`.

For testing, the `test:integration` script will automatically handle the setup and teardown of the Docker environment.

# Running the Project

## Development

To run the project in development mode:

1. Start the development server:

   ```bash
   npm run dev
   ```

It will automatically start docker containers for PostgreSQL, run the migrations and start development server. The development server run in your local machine so that is why you need to have NodeJS installed.

The development server will be running at `http://localhost:3000`. And the API DOCs will be available at `http://localhost:3000/api/docs`.

## Testing

Most of the tests are **Integration Tests**. They test the API endpoints and the database layer. They are written using Jest and Supertest.

To run integration tests:

1. Simply execute the following command:

   ```bash
   npm run test:integration
   ```

   To run integration tests with coverage:

1. Simply execute the following command:

   ```bash
   npm run test:integration:coverage
   ```

This script will handle setting up the test database, running the tests, and tearing down the Docker environment.

# API Documentation

The API is documented using OpenAPI / Swagger and can be accessed at the `http://localhost:3000/api/docs` endpoint when the server is running.

## Editing swagger defintion online

If you want to quickly see the API documentation without bringing the server up, you can use the online swagger editor and import the swagger.json (since this repo is public) file from this repository. The link to the online editor is below:

1. Go to https://editor-next.swagger.io/
2. Import the swagger.json file from this repository: using File -> Import URL
   https://raw.githubusercontent.com/douglascorrea/todo-api/master/swagger.json
