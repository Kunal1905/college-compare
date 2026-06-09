# College Discovery Platform

A full-stack web app for discovering Indian colleges, comparing fees and placement data, viewing detailed college profiles, and saving colleges to a personal shortlist.

The project has two separate apps:

- `frontend/` - Next.js app for the user interface
- `backend/` - Express API connected to PostgreSQL

## Features

- Browse colleges with search, filters, sorting, and pagination
- View detailed college pages with courses, fees, placements, recruiters, and reviews
- Sign up and log in with email/password
- Save colleges to a personal shortlist
- Protected saved colleges page for logged-in users
- Seeded demo data for quick testing

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Axios
- lucide-react
- sonner

### Backend

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Drizzle ORM
- JWT authentication
- bcryptjs
- Zod

## Project Structure

```text
college discovery platform/
├── frontend/
│   ├── app/
│   └── src/
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       └── types/
└── backend/
    ├── drizzle/
    └── src/
        ├── controllers/
        ├── db/
        ├── middleware/
        ├── routes/
        ├── seed/
        └── validations/
```

## Pages

| Page | Description |
| --- | --- |
| `/` | Homepage with search and featured colleges |
| `/colleges` | College listing with filters and pagination |
| `/colleges/[slug]` | College detail page |
| `/login` | Login page |
| `/signup` | Signup page |
| `/saved` | Saved colleges page |

## Backend API

Base URL locally:

```text
http://localhost:5000
```

### Auth

```text
POST /api/auth/signup
POST /api/auth/login
```

### Colleges

```text
GET /api/colleges
GET /api/colleges/:slug
```

Supported filters for `GET /api/colleges`:

- `search`
- `location`
- `course`
- `minRating`
- `maxFees`
- `sort`
- `page`
- `limit`

### Saved Colleges

These routes require a JWT token.

```text
POST /api/saved-colleges
GET /api/saved-colleges
DELETE /api/saved-colleges/:collegeId
```

## Database

The database uses PostgreSQL with Drizzle ORM.

Main tables:

- `users`
- `colleges`
- `courses`
- `placements`
- `reviews`
- `saved_colleges`

Seed data includes colleges, courses, placement records, reviews, and a demo user.

## Environment Variables

### Backend

Create `backend/.env`:

```env
PORT=5000
DATABASE_URL=
JWT_SECRET=
FRONTEND_URL=http://localhost:3000
```

### Frontend

Create `frontend/.env.local`:

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

Add your `DATABASE_URL` and `JWT_SECRET`, then run:

```bash
npm run db:push
npm run db:seed
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

### 2. Frontend

Open another terminal:

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

The frontend runs on:

```text
http://localhost:3000
```

## Demo Login

After running the seed script, use:

```text
Email: demo@example.com
Password: password123
```

## Available Scripts

### Backend

```bash
npm run dev
npm run build
npm start
npm run db:generate
npm run db:push
npm run db:seed
```

### Frontend

```bash
npm run dev
npm run build
npm start
npm run lint
```

## Important Seed Note

College data comes from the database, not directly from the seed file.

If you edit:

```text
backend/src/seed/seed.ts
```

run this again:

```bash
cd backend
npm run db:seed
```

This is needed for changes like updated college image URLs to appear in the app.

## Deployment

### Backend

Deploy the backend to a Node-compatible host such as Render, Railway, Fly.io, or a VPS.

Set these environment variables:

- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL`

Build and start:

```bash
npm run build
npm start
```

### Frontend

Deploy the frontend to Vercel or another Next.js host.

Set:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

## Notes

- Passwords are hashed before being stored.
- JWT tokens are used for protected saved-college routes.
- The frontend stores the auth token and user in local storage.
- Drizzle ORM is used instead of Prisma.
