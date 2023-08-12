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

To run integration tests:

1. Simply execute the following command:

   ```bash
   npm run test:integration
   ```

This script will handle setting up the test database, running the tests, and tearing down the Docker environment.

## API Documentation

The API is documented using OpenAPI and can be accessed at the `/api/docs` endpoint when the server is running.
