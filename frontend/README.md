# ERP Frontend

This is the Next.js client for the Antigravity ERP system. It provides the login experience and role-aware dashboard modules for inventory, sales, HR, and finance.

For complete architecture, database setup, demo accounts, API routes, and team workflow, see the repository [README](../README.md).

## Run locally

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`. Set `NEXT_PUBLIC_API_URL` in `.env.local` when the backend runs somewhere other than `http://localhost:5000/api`.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm start
```
