# Development Quick Reference

## Environment Setup

### Create .env file

Create a `.env` file in the root directory and copy the contents from `env.example`.

## Installation

Install all dependencies:

```bash
bun install
```

## Database Setup

### Start PostgreSQL Database

Start a Docker container with the PostgreSQL database:

```bash
bun docker:dev
```

### Run Database Migrations

Apply all database migrations (up functions):

```bash
bun db:migrate
```

### Generate a New Migration

Generate a new database migration with a custom name:

```bash
bun migration:generate --name=your_migration_name
```

## Development

### Start Development Server

Start the development server with hot reload:

```bash
bun dev
```

The application will be available at the configured port (check your `.env` file).

## Production

### Run in Production Mode

Start the application in production mode:

```bash
bun start
```

## Additional Scripts

- `bun build` - Build the application
- `bun test` - Run tests with the configured test setup
- `bun docker:dev` - Start the Docker PostgreSQL container

## Tech Stack

This project uses:

- [Bun](https://bun.sh) - Fast all-in-one JavaScript runtime
- React 19 - UI framework
- TanStack Router - Type-safe routing
- TanStack Query - Data fetching and caching
- Drizzle ORM - Type-safe database toolkit
- PostgreSQL - Database
- Tailwind CSS - Styling
- Shadcn/ui - UI components
- Zod - Schema validation
- React Hook Form - Form management
