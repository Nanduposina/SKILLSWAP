# SkillSwap

SkillSwap is a full-stack peer-to-peer learning platform for people in Sweden. Users can discover teachers, request skill exchanges, chat in real time, earn points, and build a learning profile.

## Features

- JWT authentication with bcrypt password hashing
- Skill discovery by skill, category, location, level, rating, and hourly rate
- Exchange lifecycle: pending, accepted, in progress, completed, and cancelled
- Real-time exchange messaging and notifications with Socket.IO
- Points balance and transaction history
- Ratings and reviews
- Responsive React and Material UI frontend
- PostgreSQL persistence managed by Prisma
- Docker Compose development and production workflows

## Technology

| Area | Technology |
| --- | --- |
| Runtime | Node.js 24 |
| API | Express 4 |
| Database | PostgreSQL 17 |
| ORM | Prisma 6 |
| Frontend | React 18, React Router, Material UI |
| Real-time | Socket.IO |
| Security | Helmet, CORS, rate limiting, JWT, bcrypt |
| Containers | Docker Compose |

## Requirements

- Node.js 24 and npm
- Docker Desktop with Compose v2
- Git

## Quick start with Docker

```powershell
git clone https://github.com/Nanduposina/SKILLSWAP.git
Set-Location SKILLSWAP
Copy-Item .env.example .env
docker compose up --build
```

Open:

- Frontend: http://localhost:3000
- API: http://localhost:5002/api
- Health: http://localhost:5002/api/health
- PostgreSQL: localhost:5432

The development Compose stack starts PostgreSQL, applies Prisma migrations, seeds demo content, and starts both the API and React development server.

Stop the stack:

```powershell
docker compose down
```

Remove the database volume as well:

```powershell
docker compose down -v
```

## Local development

Install dependencies:

```powershell
npm ci
Set-Location src/frontend
npm ci
Set-Location ../..
```

Create `.env` from `.env.example`, then start PostgreSQL:

```powershell
docker compose up -d db
```

Apply migrations and seed the database:

```powershell
npm run db:generate
npm run db:migrate
npm run db:seed
```

Start the API:

```powershell
npm run dev
```

Start the frontend in a second terminal:

```powershell
npm run client
```

Production-style local run:

```powershell
npm run build
npm start
```

## Production Docker

Set strong secrets in the shell or an environment file:

```powershell
$env:POSTGRES_PASSWORD = "replace-with-a-strong-password"
$env:JWT_SECRET = "replace-with-a-long-random-secret"
$env:CORS_ORIGIN = "https://your-domain.example"
docker compose -f docker-compose.prod.yml up --build -d
```

The production image builds the frontend and serves it from the Express server. It applies migrations and runs the idempotent seed command before starting.

## Demo account

The seed creates this account:

```text
Email: demo@example.com
Password: password123
```

Seeded content includes Swedish users and skills such as TypeScript, React, Node.js, cloud architecture, UX research, accessibility, Swedish language, public speaking, and data analysis.

## Database

The source of truth is [prisma/schema.prisma](./prisma/schema.prisma). Migrations are stored in [prisma/migrations](./prisma/migrations), and repeatable demo data is in [prisma/seed.js](./prisma/seed.js).

Useful commands:

```powershell
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:reset
```

`db:reset` is destructive and recreates the development database.

## API overview

Base URL: `http://localhost:5002/api`

| Area | Routes |
| --- | --- |
| Auth | `/auth/register`, `/auth/login`, `/auth/me`, `/auth/refresh` |
| Users | `/users/me`, `/users/my-transactions`, `/users/search` |
| Skills | `/skills/available`, `/skills/categories`, `/skills/search`, `/skills/filters` |
| Exchanges | `/exchanges`, `/exchanges/:id`, `/exchanges/:id/messages`, `/exchanges/:id/status` |
| Notifications | `/notifications`, `/notifications/unread-count`, `/notifications/:id/read` |
| Health | `/health` |

Authenticated routes require:

```text
Authorization: Bearer <jwt>
```

## Verification

Run the type check and production build:

```powershell
npm run verify
```

Validate Docker configuration:

```powershell
docker compose config
$env:POSTGRES_PASSWORD = "local-production-password"
$env:JWT_SECRET = "local-production-secret"
docker compose -f docker-compose.prod.yml config
```

Check running services:

```powershell
docker compose ps
docker compose logs --tail=100 api
```

## Project structure

```text
src/
  backend/
    controllers/     HTTP request handlers
    middleware/      JWT authentication
    models/          Prisma-backed data service
    routes/          Express routes
    services/        Notifications and points workflows
    utils/           Swedish time formatting
    server.js        API and Socket.IO entry point
  frontend/
    src/
      components/    Shared UI
      contexts/      Authentication and Socket.IO state
      pages/         Application pages
      services/      API clients
      config/        Axios configuration
prisma/
  schema.prisma      PostgreSQL schema
  migrations/        Database migrations
  seed.js            Demo data
Dockerfile           Multi-stage API image
docker-compose.yml   Development stack
docker-compose.prod.yml
                      Production stack
```

## Environment variables

Required:

```text
NODE_ENV=development
PORT=5002
DATABASE_URL=postgresql://skillswap:skillswap_dev@localhost:5432/skillswap
JWT_SECRET=replace-this-secret
CORS_ORIGIN=http://localhost:3000
```

Optional:

```text
SOCKET_CORS_ORIGIN=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

Never commit `.env` or production secrets.

## GitHub Actions

The workflow in [.github/workflows/node.js.yml](./.github/workflows/node.js.yml) installs dependencies and runs `npm run verify` on pushes and pull requests to `main`.

## Troubleshooting

### Port already in use

```powershell
docker compose down
Get-NetTCPConnection -LocalPort 3000,5002,5432 -ErrorAction SilentlyContinue
```

Stop only the specific process holding the required port.

### Database connection failure

```powershell
docker compose up -d db
docker compose logs db
npm run db:migrate
```

Check that `DATABASE_URL` matches the running PostgreSQL instance.

### Stale frontend bundle

Restart the frontend container or development server:

```powershell
docker compose restart web
```

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE).
