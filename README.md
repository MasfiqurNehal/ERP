# NexusCore ERP

A role-aware enterprise resource planning system for inventory, sales, HR, and finance operations.

The repository is intentionally split into two independently runnable applications:

- `backend/`: Express, TypeScript, Prisma, PostgreSQL, and JWT authentication.
- `frontend/`: Next.js App Router, React, TypeScript, and Recharts.

## Features

- JWT login and role-aware access control
- Inventory catalog, categories, suppliers, stock levels, and low-stock alerts
- Customers, sales orders, invoices, and order status tracking
- Employees, attendance, leave requests, and payroll workflows
- Finance transactions and summary metrics
- Dashboard views tailored to the signed-in user's role

## Architecture

```text
backend/
  prisma/schema.prisma       Database models and enums
  src/config/                Shared infrastructure, including Prisma
  src/controllers/           HTTP request handlers by business module
  src/middleware/            JWT authentication and role authorization
  src/routes/                Versionless REST route definitions
  src/index.ts               Express application and server bootstrap
  src/seed.ts                Local demo data

frontend/
  src/app/                   Next.js routes and dashboard screens
  src/context/               Client authentication state
  src/lib/api.ts             Authenticated API client
```

The backend is the source of truth for authorization. Frontend role checks control navigation and presentation, while protected backend routes enforce access for every request.

## Requirements

- Node.js 20 or newer
- npm 10 or newer
- PostgreSQL 14 or newer
- Git

## Local Setup

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd test-project
```

### 2. Create the backend environment file

PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
```

macOS/Linux:

```bash
cp backend/.env.example backend/.env
```

Update `backend/.env` with the PostgreSQL connection and a local JWT secret. Never commit that file.

### 3. Create the frontend environment file

PowerShell:

```powershell
Copy-Item frontend/.env.example frontend/.env.local
```

macOS/Linux:

```bash
cp frontend/.env.example frontend/.env.local
```

The default API URL is `http://localhost:5000/api`.

### 4. Install dependencies

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run seed
```

In a second terminal:

```bash
cd frontend
npm install
```

### 5. Start development servers

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

Open `http://localhost:3000`. The API health check is available at `http://localhost:5000/api/health`.

## Demo Accounts

The seed script creates these local development accounts. Every seeded account uses the password `password123`.

| Role            | Email               |
| --------------- | ------------------- |
| Admin           | `admin@erp.com`     |
| Manager         | `manager@erp.com`   |
| Inventory staff | `inventory@erp.com` |
| Sales staff     | `sales@erp.com`     |
| HR staff        | `hr@erp.com`        |
| Finance staff   | `finance@erp.com`   |

These credentials are for local development only. Change or remove them before deploying anywhere shared.

## API Surface

All API routes are prefixed with `/api`.

| Module    | Endpoints                                                              |
| --------- | ---------------------------------------------------------------------- |
| Health    | `GET /health`                                                          |
| Auth      | `POST /auth/register`, `POST /auth/login`, `GET /auth/me`              |
| Inventory | `/inventory/products`, `/inventory/categories`, `/inventory/suppliers` |
| Sales     | `/sales/customers`, `/sales/orders`, `/sales/invoices`                 |
| HR        | `/hr/employees`, `/hr/attendance`, `/hr/leaves`, `/hr/payroll`         |
| Finance   | `/finance/transactions`, `GET /finance/summary`                        |

Protected endpoints require `Authorization: Bearer <token>`.

## Useful Commands

Backend commands:

```bash
npm run dev              # Start the API with reloads
npm run build            # Compile TypeScript to dist/
npm start                # Run the compiled API
npm run seed             # Insert local demo data
npm run prisma:studio    # Open Prisma Studio
npm run prisma:migrate   # Create/apply a development migration
```

Frontend commands:

```bash
npm run dev              # Start Next.js locally
npm run build            # Create a production build
npm start                # Serve the production build
npm run lint             # Run ESLint
```

## Team Development

Create a branch for each piece of work:

```bash
git switch -c feat/short-description
```

Before opening a pull request:

```bash
cd backend && npm run build
cd ../frontend && npm run lint && npm run build
```

Keep pull requests focused, explain database or environment changes, and include screenshots for frontend changes. Do not commit `.env`, credentials, generated build output, or local database files.

To give another developer access on GitHub, add them to the repository under **Settings -> Collaborators** (or **Settings -> Collaborators and teams**) with the least privilege they need. For a team workflow, protect `main` and require pull-request review before merging.

## Production Checklist

- Set a strong, unique `JWT_SECRET`.
- Use a managed PostgreSQL database and a production `DATABASE_URL`.
- Restrict CORS to the deployed frontend origin instead of allowing every origin.
- Replace demo credentials and do not run the seed script against production data.
- Add HTTPS, backups, monitoring, and a migration release step.
- Store secrets in the hosting provider's secret manager, never in Git.
