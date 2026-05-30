# College Discovery Platform

Production-oriented MVP for an internship assignment.

## Role Chosen

Full Stack Engineer

## Track Chosen

Track B — College Discovery Platform

## Features Implemented

1. College Listing + Search
2. College Detail Page
3. Authentication + Saved Items

## Folder Structure

This project intentionally uses two separate applications instead of a monorepo package setup:

```text
college-discovery-platform/
├── frontend/
└── backend/
```

## Why Frontend and Backend Are Separate

- The frontend and backend can be deployed independently.
- The UI remains fully decoupled from data and auth logic.
- The API can be reused later by mobile apps or admin dashboards.
- This structure keeps the assignment easy to explain in a Loom video because responsibilities are clearly separated.

## Architecture

### Frontend

- Next.js App Router
- React
- TypeScript
- TailwindCSS
- Axios
- lucide-react
- sonner

### Backend

- Node.js
- Express.js
- TypeScript
- Drizzle ORM
- PostgreSQL on Neon
- JWT authentication
- bcryptjs
- zod
- cors
- dotenv

### Database

- PostgreSQL using Neon
- Drizzle ORM schema and seed flow

## Why Drizzle Instead of Prisma

- Drizzle keeps the schema close to SQL and gives more direct control over queries.
- It is lightweight and fits well for a small production-style MVP with explicit joins and filtering.
- The assignment explicitly disallowed Prisma, so Drizzle was the best type-safe alternative.

## Implemented Pages

- `/` hero section, search prompt, featured colleges, and CTA
- `/colleges` search, filters, sorting, pagination, loading/error/empty states
- `/colleges/[slug]` overview, stats, placements, recruiters, courses, reviews, save button
- `/signup` account creation form
- `/login` login form with demo credentials
- `/saved` protected saved-colleges page with remove action

## Backend API Routes

### Auth

- `POST /api/auth/signup`
- `POST /api/auth/login`

### Colleges

- `GET /api/colleges`
- `GET /api/colleges/:slug`

### Saved Colleges

- `POST /api/saved-colleges`
- `GET /api/saved-colleges`
- `DELETE /api/saved-colleges/:collegeId`

## Query Support for `GET /api/colleges`

- `search`
- `location`
- `minRating`
- `maxFees`
- `sort`
- `page`
- `limit`

Supported sort values:

- `rating_desc`
- `fees_asc`

## Database Schema

Tables created with Drizzle:

- `users`
- `colleges`
- `courses`
- `placements`
- `reviews`
- `saved_colleges`

High-level structure:

- `users` stores name, email, hashed password, created timestamp
- `colleges` stores summary and discovery metadata
- `courses` stores 2-3 courses per college
- `placements` stores average package, highest package, placement rate, recruiters
- `reviews` stores seeded student feedback
- `saved_colleges` stores user-college shortlist records with a unique composite constraint

## Seed Data

- 20 realistic Indian colleges
- 2-3 courses per college
- placement data per college
- 1-2 reviews per college
- demo user:
  - `demo@example.com`
  - `password123`

## Environment Variables

### Backend: `backend/.env`

Use `backend/.env.example` as the template.

```env
PORT=5000
DATABASE_URL=
JWT_SECRET=
FRONTEND_URL=http://localhost:3000
```

Notes:

- `JWT_SECRET` is read only from environment variables and is never hardcoded.
- If you already have JWT signing material you want to use, place it in `JWT_SECRET`.

### Frontend: `frontend/.env.local`

Use `frontend/.env.example` as the template.

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Local Setup

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Fill in:

- `DATABASE_URL` with your Neon PostgreSQL connection string
- `JWT_SECRET` with your JWT signing secret

Then run:

```bash
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Build Commands

Both apps were configured to build successfully.

### Backend

```bash
cd backend
npm run build
```

### Frontend

```bash
cd frontend
npm run build
```

## Deployment Steps

### Backend

1. Create a Neon PostgreSQL database.
2. Set `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL` on the backend host.
3. Run `npm run db:push`.
4. Run `npm run db:seed` once for initial demo data.
5. Start the server with `npm start`.

Good options:

- Render
- Railway
- Fly.io
- EC2 or a VPS

### Frontend

1. Deploy the Next.js app on Vercel or another Node-compatible host.
2. Set `NEXT_PUBLIC_API_URL` to the deployed backend URL.
3. Rebuild and deploy.

## Tradeoffs

- Authentication uses email/password + JWT only to match the assignment scope and stay easy to demo.
- Saved status on the detail page is optimistic after a successful save instead of pre-fetching every saved ID globally.
- College images use remote URLs for realistic presentation; the platform still works if an image is unavailable because cards fall back gracefully.
- Search and filters are client-triggered against the backend API for simplicity and clarity, rather than adding server-side state syncing complexity.

## Notes for Reviewers

- No college data is hardcoded in frontend pages. The UI fetches everything from backend APIs.
- Prisma was not used.
- The two-app structure was preserved exactly as requested.
- The backend seed includes a demo account and realistic discovery data for presentation.
