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

## What SkillSwap does

SkillSwap is a peer-to-peer learning marketplace. Every user can be both a
learner and a teacher: search for a skill, choose a provider, agree on the
session details, and exchange knowledge using points instead of direct
payments. The application is designed for local and remote connections in
Sweden, with Swedish time formatting and seeded examples for software,
design, business, language, and career skills.

## Dashboard guide

After signing in, the dashboard is the user's control centre:

| Dashboard area | What it does |
| --- | --- |
| **Points balance** | Shows the points currently available to pay for accepted exchanges. |
| **My Exchanges** | Lists every exchange where the user is the requester or provider. Use the tabs to filter all, pending, active, or completed exchanges. |
| **Pending exchanges** | Shows requests waiting for the other participant. A requester can revoke a pending request; the provider can open it and accept or decline it. |
| **Active exchanges** | Shows accepted or in-progress sessions. Open an exchange to view its schedule, participants, status, points, and conversation. |
| **Completed exchanges** | Shows finished learning sessions that can be reviewed and rated. |
| **Recent Activity** | Displays notifications for new requests, accepted exchanges, messages, point deductions, refunds, and earned points. |
| **View Messages** | Opens the conversation list for the user's exchanges. |
| **New Exchange / Find Teachers** | Opens Skill Search, where the user can filter providers by skill, category, location, level, rating, and hourly rate. |
| **Profile** | Shows the user's bio, location, points, offered skills, ratings, and learning preferences. |
| **Transactions** | Shows the complete points ledger, including payments, refunds, and points earned from teaching. |

## How an exchange works

1. **Find a skill:** Open **Search**, select a skill or filter, and review the
   available providers.
2. **Send a request:** Select **Request Exchange**, choose the skill level,
   session type, duration, schedule, and description. The application
   calculates the estimated cost as `hourly rate × duration`.
3. **Wait for a decision:** The request starts as **Pending**. The provider
   receives an in-app notification and can accept or decline it.
4. **Accept and reserve points:** When the request is accepted, the calculated
   points are deducted from the requester. Points are not deducted when a
   request is merely created, so declined requests do not charge the requester.
5. **Hold the session:** Participants use the exchange details page and its
   conversation to coordinate the learning session. The exchange can move
   through **Accepted**, **In Progress**, and **Completed**.
6. **Finish and review:** When the exchange is completed, the provider earns
   the agreed points and participants can submit ratings and reviews.
7. **Cancel or revoke:** A pending request can be revoked. If an already
   accepted exchange is cancelled, the requester's payment is refunded
   according to the exchange workflow and both participants are notified.

## How points and transactions work

Points are SkillSwap's internal unit for valuing time and keeping an auditable
record of exchanges. The transaction history is a ledger; it does not charge
credit cards or connect to a bank.

- **Payment:** created when an exchange is accepted; the requester pays
  `hourly rate × duration`.
- **Earned points:** credited to the provider when the teaching exchange is
  completed.
- **Refund:** returned to the requester when the application cancels an
  accepted exchange according to the cancellation workflow.
- **Balance check:** a requester must have enough points before creating a
  request.
- **Transaction History page:** displays the transaction type, amount,
  related skill, exchange status, description, and date. Positive and
  negative amounts are shown separately so users can understand every
  balance change.

The database stores users' balances and transaction records in PostgreSQL.
Each transaction is linked to its exchange where applicable, allowing the
history to be traced back to the learning activity that created it.

## How communication works

Communication is tied to an exchange so that participants can keep planning,
questions, and session details in one place.

- The **Messages** page lists the user's exchanges and opens the relevant
  conversation.
- The **Exchange Details** page shows the same conversation together with
  participants, skill, schedule, duration, hourly rate, status, ratings, and
  actions.
- Messages are sent through the authenticated API and saved in PostgreSQL.
- Socket.IO provides real-time delivery: both participants join an
  exchange-specific room and receive new messages without refreshing.
- Notifications are generated for exchange requests, acceptance, messages,
  point deductions, refunds, and completed activity.
- A user can only read or send messages for exchanges in which they
  participate.

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
| Users | `/users/:id`, `/users/my-transactions`, `/users/search` |
| Skills | `/skills/available`, `/skills/categories`, `/skills/search`, `/skills/filters` |
| Exchanges | `/exchanges`, `/exchanges/my-exchanges`, `/exchanges/:id`, `/exchanges/:id/message`, `/exchanges/:id/status` |
| Notifications | `/notifications`, `/notifications/unread-count`, `/notifications/:id/read` |
| Health | `/health` |

Authenticated routes require:

```text
Authorization: Bearer <jwt>
```

## Verification

Start the development stack before running the application smoke tests:

```powershell
docker compose up -d --build
npm test
```

The smoke suite uses Node's built-in test runner and checks:

- API health and Swedish timezone configuration
- seeded skill, category, filter, and user search endpoints
- demo login, protected routes, and token refresh
- exchanges, messages, transactions, and notifications
- frontend serving every application route

Set `SKILLSWAP_API_URL` or `SKILLSWAP_WEB_URL` to test another running
environment.

Run the type check and production build separately:

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
