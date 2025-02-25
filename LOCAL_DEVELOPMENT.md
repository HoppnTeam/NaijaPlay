# NaijaPlay Local Development Guide

This guide provides detailed instructions for setting up and using a local Supabase instance for NaijaPlay development. Using a local instance helps reduce costs and provides a faster development experience.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- [Supabase CLI](https://supabase.com/docs/guides/cli) installed (`npm install -g supabase`)
- Node.js and npm

## Initial Setup

### 1. Initialize Local Supabase Project

If you haven't already initialized a local Supabase project:

```bash
supabase init
```

### 2. Start the Local Supabase Instance

```bash
npm run supabase:start
```

This will start a local Supabase instance with all the necessary services (PostgreSQL, Auth, Storage, etc.).

### 3. Switch to Local Environment

```bash
npm run supabase:local
```

This updates your `.env.local` file to use the local Supabase instance.

### 4. Migrate Data from Production (Optional)

If you want to copy data from the production Supabase instance to your local instance:

```bash
npm run supabase:migrate
```

This script will:
- Check which tables exist in both production and local databases
- Fetch data from production tables
- Transform data if schema differences exist
- Insert data into your local tables
- Seed additional data for tables that don't exist in production

### 5. Generate TypeScript Types for Local Database

```bash
npm run update-types:local
```

This generates TypeScript types based on your local database schema.

### 6. Start the Next.js Development Server

```bash
npm run dev
```

## Daily Development Workflow

1. Start Docker Desktop
2. Start the local Supabase instance:
   ```bash
   npm run supabase:start
   ```
3. Ensure you're using the local environment:
   ```bash
   npm run supabase:local
   ```
4. Check your current environment:
   ```bash
   npm run supabase:check-env
   ```
5. Start the Next.js development server:
   ```bash
   npm run dev
   ```

## Switching Between Environments

### Switch to Local Environment

```bash
npm run supabase:local
```

### Switch to Production Environment

```bash
npm run supabase:prod
```

Remember to restart your Next.js server after switching environments.

## Managing the Local Supabase Instance

### Check Environment

```bash
npm run supabase:check-env
```

This will show your current Supabase environment (local or production), connection details, and status of the local instance.

### Check Status

```bash
npm run supabase:status
```

### Stop the Instance

```bash
npm run supabase:stop
```

### Reset the Database

```bash
npm run supabase:reset
```

This will reset your local database to its initial state based on the migration files.

### Check Available Tables

To see what tables are available in your local database:

```bash
node scripts/check-tables.js
```

### Compare Schema Between Production and Local

To compare the schema of a specific table between production and local:

```bash
node scripts/check-schema.js [table_name]
```

## Database Management

### Creating New Migrations

To create a new migration file:

```bash
supabase migration new [migration_name]
```

This will create a new SQL file in the `supabase/migrations` directory.

### Applying Migrations

Migrations are automatically applied when you start the local Supabase instance. To manually apply migrations:

```bash
supabase db reset
```

### Accessing the Local Dashboard

The local Supabase dashboard is available at:
- URL: http://127.0.0.1:54323
- Email: `admin@example.com`
- Password: `admin`

### Accessing the Local Database Directly

You can connect to the local PostgreSQL database using:
- Host: `127.0.0.1`
- Port: `54322`
- Database: `postgres`
- Username: `postgres`
- Password: `postgres`

## Troubleshooting

### Port Conflicts

If you see errors about ports being already allocated, you may have another Supabase project running. Stop it first:

```bash
supabase stop --project-id <other-project-id>
```

### Database Connection Issues

If you're having trouble connecting to the local database, check that the Docker containers are running:

```bash
docker ps
```

You should see several containers with names starting with `supabase_`.

### Authentication Issues

If you're having authentication issues, try resetting the local database:

```bash
supabase db reset
```

### Email Verification

For local development, email verification is simulated. You can check emails at:
- http://127.0.0.1:54324

### Migration Script Errors

If the migration script fails:

1. Check that both production and local Supabase instances are accessible
2. Verify that your service role keys have the necessary permissions
3. Check for schema differences between production and local tables
4. Try running the script with specific tables:
   ```bash
   node scripts/migrate-to-local.js
   ```

## Best Practices

1. **Always commit migration files**: This ensures that all developers have the same database schema.
2. **Use the local environment for development**: Avoid consuming production resources.
3. **Regularly update your local database**: Keep it in sync with production.
4. **Test migrations locally before applying to production**: Prevent potential issues.
5. **Use TypeScript types**: Always regenerate types after schema changes.

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/) 