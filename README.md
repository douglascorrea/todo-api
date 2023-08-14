# Todo API

This project provides an API for managing todos and todo lists for users. It's built using Node.js, Express, Prisma, and PostgreSQL.

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
- [ ] We would like you to integrate with another service provider. It can be any Todo service (e.g. Microsoft Todo APIs), or you can also use a mock provider. Todos should be kept in sync between our service and the third-party integration
- [ ] Todos created in the third-party integration should always be created in our service
- [ ] The status of todos should always be in sync between our service and the integration
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

## Technical Decisions and Assumptions:

### Decisions

#### Using Prisma as ORM

I decided to use Prisma as ORM for this project. It provides a way to easy manage the database schema and migrations. And it is decouple from the application code. So, if we need to change the database, we can do it easily.

#### Scoping the API for a specific user

Besides we don't have authentication/authorization for this application, I decided to scope all requests under `/api/users/:userId` which seems to be a real use case for a simple todo app. So, all requests for getting `todoLists` and `todos` must have a valid `userId` in the path. This is a simple way to avoid any security issues.

#### Having 3 main entities: User, TodoList and Todo

The 3 main entities for this project are `User`, `TodoList` and `Todo`. Each one of them have their own endpoints and can be managed separately. The `TodoList` and `Todo` entities are scoped by `User` so that is why we have the `userId` in the path for all requests.

#### Using OpenAPI / Swagger for API Documentation

I decided to use OpenAPI / Swagger for API Documentation because it is a standard and it is easy to use. It also provide a way to test the API endpoints using a web interface directly from the docs. You can easily go to the `/api/docs` endpoint, read documentation and test the API.
There is a `swagger.json` definition on the root of the project which is used by the `swagger-ui-express` package to generate the documentation.

#### Using Jest and Supertest for Integration Tests

I decided to use Jest and Supertest for Integration Tests because they are easy to use and provide a good way to test the API endpoints and the database layer. I also used the `jest-openapi` package to validate the API responses against the OpenAPI / Swagger definition.

I've focused in integration tests since the application has a CRUD API and the business logic is very simple. So, I think it is not necessary to have unit tests for the project as is. And the integration tests cover the most important parts of the application.

I've also set a `test:integration:coverage` script for getting coverage report which shows that the integration tests cover almost 100% of the code. **Check documentation for running the tests and coverage report**

#### Using express-validator for Request Validation

I decided to use express-validator for Request Validation because it is easy to use and provide a good way to validate the request body, param and query parameters.

#### Using Winston and Morgan for Logging

I decided to use Winston and Morgan for Logging because they are easy to use and provide a good way to log the application events. For production environment we will have a `log/error.log` and `log/combined.log` if we need to debug the application.
I've decided to silent logs on test environment to avoid noise in the test output, as I'm using TDD approach to develop this project.

#### Using Docker and Docker Compose for Development and Testing

I decided to use docker for the DB environment since it is easy to use in development and also easy to setup for integration tests

#### Using ESLint and Prettier for Code Formatting
ESLint and Prettier are pretty standard for NodeJS projects. I've used a simple rule set for ESLint and Prettier to avoid any conflicts between them. *No Semicolons* and *Single Quotes* are the only rules that I've changed from the default configuration.

#### Third Party API Integration
**This is work in progress**

#### File Structure

I decided to have 4 main root folders: `src`, `test`, `prisma` and `log`.
`src` folder contains all the source code for the application.
`test` folder contains all the integration tests.
`prisma` folder contains all the database schema and migrations.
`log` folder contains all the logs for the application.

Inside `src` I've separated like this:
`api` folder contains all the API endpoints. (Even that all are scoped by `userId`, I've decided to have a separate folder for each entity). Each entity has its own `controller`, `service`, `validation` files. Only the `User` entity has `routes` as every route is scoped by `userId`.
`config` folder contains the configuration files for the application, for this project we have only `db`
`middleware` some middleware for handling errors and notFound pages
`utils` some utility functions for the application
`validators/common` some common utilities for using with express-validator

### Assumptions

#### There is no authentication for this project

As asked by email, I didn't implemented authentication for this project. So, all requests must have a valid `userId` in the path. This is a simple way to isolate the data for each user.

## Prerequisites to Run this Project

- Node.js (The app run in local NodeJS environment) - v16+
- Docker and Docker Compose (the DB run in Docker container)

## How to Setup

### Environment Variables

# THIS IS A IMPORTANT STEP

Before running the project, you need to set up environment variables. This project uses two environment files: `.env.development` for development and `.env.test` for integration tests.

1. Create a `.env.development` file in the root directory with the following content:

```env
NODE_ENV=development
DATABASE_URL=postgres://postgres:postgres@localhost:5432/todoapi
```

2. Create a `.env.test` file in the root directory with the following content:

```env
NODE_ENV=test
DATABASE_URL=postgres://prisma:prisma@localhost:5433/tests
```

**Note**: It's a good practice not to commit `.env` files to version control. That is why .env files are in `.gitignore`.

### The Docker Setup for this project

This project uses Docker to run PostgreSQL for both development and testing environments.

For development, the setup is handled by the `dev` script in the `package.json`.

For testing, the `test:integration` script will automatically handle the setup and teardown of the Docker environment.

## Running the Project

### Development

To run the project in development mode:

1. Start the development server:

   ```bash
   npm run dev
   ```

It will automatically start docker containers for PostgreSQL, run the migrations and start development server. The development server run in your local machine so that is why you need to have NodeJS installed.

The development server will be running at `http://localhost:3000`. And the API DOCs will be available at `http://localhost:3000/api/docs`.

### Testing

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

## API Documentation

The API is documented using OpenAPI / Swagger and can be accessed at the `http://localhost:3000/api/docs` endpoint when the server is running.

### Editing swagger defintion online

If you want to quickly see the API documentation without bringing the server up, you can use the online swagger editor and import the swagger.json (since this repo is public) file from this repository. The link to the online editor is below:

1. Go to https://editor-next.swagger.io/
2. Import the swagger.json file from this repository: using File -> Import URL
   https://raw.githubusercontent.com/douglascorrea/todo-api/master/swagger.json
