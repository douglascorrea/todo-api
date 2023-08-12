# Todo API

This project provides an API for managing todos and todo lists for users. It's built using Node.js, Express, Prisma, and PostgreSQL.

## Prerequisites

- Node.js
- Docker and Docker Compose

## Setup

### Environment Variables

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

### Docker Setup

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
The API is documented using OpenAPI / Swagger and can be accessed at the `/api/docs` endpoint when the server is running.

### Editing swagger defintion online
If you want to quickly see the API documentation without bringing the server up, you can use the online swagger editor and import the swagger.json (since this repo is public) file from this repository. The link to the online editor is below:

1) Go to https://editor-next.swagger.io/
2) Import the swagger.json file from this repository: using File -> Import URL
https://raw.githubusercontent.com/douglascorrea/todo-api/master/swagger.json