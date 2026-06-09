# College Discovery Platform

A full-stack college discovery web application built for exploring Indian colleges, comparing fees and placements, viewing college details, creating an account, and saving colleges to a personal shortlist.

The project is split into two independent applications:

- `frontend/`: Next.js client application
- `backend/`: Express.js REST API with PostgreSQL and Drizzle ORM

This separation keeps the UI, API, authentication, and database concerns clear and makes the project easier to deploy, test, and explain.

## Table of Contents

- [Project Overview](#project-overview)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Architecture](#architecture)
- [Frontend Details](#frontend-details)
- [Backend Details](#backend-details)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Local Setup](#local-setup)
- [Database Setup and Seeding](#database-setup-and-seeding)
- [Available Scripts](#available-scripts)
- [Demo Account](#demo-account)
- [Deployment Guide](#deployment-guide)
- [Troubleshooting](#troubleshooting)

## Project Overview

College Discovery Platform helps students browse colleges using practical decision-making data such as:

- college name, location, and state
- annual fees
- ratings
- course offerings
- average and highest placement packages
- placement rate
- top recruiters
- student reviews
- saved college shortlist

The frontend fetches all college data from the backend API. College records are stored in PostgreSQL and seeded through a backend seed script.

## Core Features

### College Discovery

- Browse colleges on the `/colleges` page.
- Search by college name, city, state, or course.
- Filter by location, course category, minimum rating, and maximum fees.
- Sort by highest rating or lowest fees.
- Paginated listing view.

### College Detail Page

Each college has a dedicated detail page at:

```text
/colleges/[slug]
```

The detail page includes:

- large college image
- location and rating
- annual fees
- average package
- highest package
- placement rate
- overview
- courses table
- top recruiters
- student reviews
- related colleges from the same state
- save college action

### Authentication

Users can:

- create an account
- log in with email and password
- stay logged in using a JWT stored in local storage
- log out from the navbar

Authentication is handled by the backend using:

- bcrypt password hashing
- JWT token generation
- protected API middleware

### Saved Colleges

Logged-in users can save colleges to a shortlist.

The `/saved` page is protected on the frontend. If a user is not logged in, they are redirected to `/login`.

Saved colleges can also be removed from the shortlist.

## Tech Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Axios
- lucide-react
- sonner
- React Hook Form
- Zod

### Backend

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Drizzle ORM
- Drizzle Kit
- bcryptjs
- jsonwebtoken
- Zod
- cors
- dotenv
- tsx

### Database

- PostgreSQL
- Neon-compatible connection string
- Drizzle schema and migrations

## Folder Structure

```text
college discovery platform/
├── README.md
├── backend/
│   ├── drizzle/
│   │   ├── 0000_amazing_the_hand.sql
│   │   └── meta/
│   ├── src/
│   │   ├── constants/
│   │   │   └── courseCategories.ts
│   │   ├── controllers/
│   │   │   ├── authController.ts
│   │   │   ├── collegeController.ts
│   │   │   └── savedCollegeController.ts
│   │   ├── db/
│   │   │   ├── index.ts
│   │   │   └── schema.ts
│   │   ├── middleware/
│   │   │   └── authMiddleware.ts
│   │   ├── routes/
│   │   │   ├── authRoutes.ts
│   │   │   ├── collegeRoutes.ts
│   │   │   └── savedCollegeRoutes.ts
│   │   ├── seed/
│   │   │   └── seed.ts
│   │   ├── validations/
│   │   │   ├── authValidation.ts
│   │   │   └── collegeValidation.ts
│   │   └── index.ts
│   ├── drizzle.config.ts
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── app/
    │   ├── colleges/
    │   │   ├── [slug]/
    │   │   │   └── page.tsx
    │   │   └── page.tsx
    │   ├── login/
    │   │   └── page.tsx
    │   ├── saved/
    │   │   └── page.tsx
    │   ├── sign-in/
    │   ├── sign-up/
    │   ├── signup/
    │   │   └── page.tsx
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx
    ├── src/
    │   ├── components/
    │   ├── hooks/
    │   ├── lib/
    │   └── types/
    ├── package.json
    └── next.config.ts
```

## Architecture

```text
Browser
  |
  | Next.js pages and client components
  v
Frontend app
  |
  | Axios requests using NEXT_PUBLIC_API_URL
  v
Express API
  |
  | Drizzle ORM queries
  v
PostgreSQL database
```

Authentication flow:

```text
User submits login form
  -> frontend sends credentials to POST /api/auth/login
  -> backend validates password with bcrypt
  -> backend returns JWT and user object
  -> frontend stores token and user in localStorage
  -> Axios attaches Authorization: Bearer <token>
  -> protected backend routes verify the token
```

## Frontend Details

The frontend lives in `frontend/`.

### Important Pages

| Page | Purpose |
| --- | --- |
| `/` | Homepage with search, stats, degree categories, and featured colleges |
| `/colleges` | Searchable and filterable college listing |
| `/colleges/[slug]` | Full college profile page |
| `/login` | Login form |
| `/signup` | Account creation form |
| `/saved` | Protected saved colleges page |

### Important Frontend Files

| File | Purpose |
| --- | --- |
| `frontend/src/lib/api.ts` | Shared Axios instance with API base URL and auth header interceptor |
| `frontend/src/lib/auth.ts` | localStorage helpers for token and user session |
| `frontend/src/components/providers/auth-provider.tsx` | React auth context |
| `frontend/src/hooks/use-saved-college-ids.ts` | Fetches saved college IDs for logged-in users |
| `frontend/src/components/college-card.tsx` | Reusable college listing card |
| `frontend/src/components/save-college-button.tsx` | Handles save action and login redirect |
| `frontend/src/components/pages/colleges-page-client.tsx` | Main search/filter/pagination logic |
| `frontend/src/types/index.ts` | Shared frontend TypeScript types |

### Frontend State and Data Flow

- The frontend reads `NEXT_PUBLIC_API_URL` from `frontend/.env.local`.
- API requests are made through the shared Axios instance in `frontend/src/lib/api.ts`.
- If a JWT exists in local storage, Axios attaches it as a bearer token.
- The auth provider hydrates user state from local storage after the browser loads.
- The saved colleges page redirects unauthenticated users to login.

## Backend Details

The backend lives in `backend/`.

### Important Backend Files

| File | Purpose |
| --- | --- |
| `backend/src/index.ts` | Express app setup, CORS, JSON middleware, route mounting |
| `backend/src/db/schema.ts` | Drizzle table definitions and relations |
| `backend/src/db/index.ts` | Database connection |
| `backend/src/controllers/authController.ts` | Signup and login logic |
| `backend/src/controllers/collegeController.ts` | College list and detail logic |
| `backend/src/controllers/savedCollegeController.ts` | Save, list, and remove saved colleges |
| `backend/src/middleware/authMiddleware.ts` | JWT verification middleware |
| `backend/src/validations/authValidation.ts` | Zod validation for auth payloads |
| `backend/src/validations/collegeValidation.ts` | Zod validation for query params and college IDs |
| `backend/src/seed/seed.ts` | Demo data seed script |

### Backend Behavior

- CORS allows `FRONTEND_URL` and `http://localhost:3000`.
- `FRONTEND_URL` can contain comma-separated origins.
- The root route `/` returns a basic API health message.
- Unknown routes return a 404 JSON response.
- Server errors return a consistent JSON error response.

## Database Schema

The database contains six main tables.

### `users`

Stores registered users.

Important columns:

- `id`
- `name`
- `email`
- `password`
- `created_at`

The password is stored as a bcrypt hash.

### `colleges`

Stores the main college profile data.

Important columns:

- `id`
- `name`
- `slug`
- `location`
- `state`
- `fees`
- `rating`
- `image_url`
- `overview`
- `created_at`

The `slug` is unique and is used for detail page URLs.

### `courses`

Stores courses offered by each college.

Important columns:

- `id`
- `name`
- `duration`
- `fees`
- `college_id`

Each course belongs to one college.

### `placements`

Stores placement data for each college.

Important columns:

- `id`
- `average_package`
- `highest_package`
- `placement_rate`
- `top_recruiters`
- `college_id`

Each college has one placement record.

### `reviews`

Stores seeded student reviews.

Important columns:

- `id`
- `student`
- `rating`
- `comment`
- `college_id`
- `created_at`

### `saved_colleges`

Stores the user's saved shortlist.

Important columns:

- `id`
- `user_id`
- `college_id`
- `created_at`

There is a unique constraint on `user_id` and `college_id`, so a user cannot save the same college twice.

## API Reference

Base URL in local development:

```text
http://localhost:5000
```

All API responses use a `success` field.

### Health Check

```http
GET /
```

Response:

```json
{
  "success": true,
  "message": "College Discovery API is running."
}
```

### Auth Routes

#### Signup

```http
POST /api/auth/signup
```

Request body:

```json
{
  "name": "Demo User",
  "email": "demo@example.com",
  "password": "password123"
}
```

Success response:

```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "id": 1,
    "name": "Demo User",
    "email": "demo@example.com",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

#### Login

```http
POST /api/auth/login
```

Request body:

```json
{
  "email": "demo@example.com",
  "password": "password123"
}
```

Success response:

```json
{
  "success": true,
  "message": "Logged in successfully.",
  "data": {
    "token": "jwt-token",
    "user": {
      "id": 1,
      "name": "Demo User",
      "email": "demo@example.com",
      "createdAt": "2026-01-01T00:00:00.000Z"
    }
  }
}
```

### College Routes

#### Get Colleges

```http
GET /api/colleges
```

Supported query parameters:

| Query | Type | Description |
| --- | --- | --- |
| `search` | string | Searches college name, location, state, and course name |
| `location` | string | Comma-separated locations or states |
| `course` | string | Course category or course search term |
| `minRating` | number | Minimum rating from 0 to 5 |
| `maxFees` | number | Maximum annual fees |
| `sort` | string | `rating_desc` or `fees_asc` |
| `page` | number | Page number, defaults to `1` |
| `limit` | number | Page size, defaults to `8`, max `24` |

Example:

```http
GET /api/colleges?search=computer&location=Delhi,Mumbai&course=Engineering&minRating=4&maxFees=500000&sort=rating_desc&page=1&limit=6
```

Response shape:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "IIT Delhi",
      "slug": "iit-delhi",
      "location": "New Delhi",
      "state": "Delhi",
      "fees": 230000,
      "rating": 4.8,
      "imageUrl": "https://example.com/image.jpg",
      "overview": "College overview",
      "averagePackage": 21.5,
      "highestPackage": 120,
      "placementRate": 92,
      "courses": ["B.Tech Computer Science", "M.Tech AI"]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 6,
    "total": 20,
    "totalPages": 4
  }
}
```

#### Get College by Slug

```http
GET /api/colleges/:slug
```

Example:

```http
GET /api/colleges/iit-delhi
```

Response shape:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "IIT Delhi",
    "slug": "iit-delhi",
    "location": "New Delhi",
    "state": "Delhi",
    "fees": 230000,
    "rating": 4.8,
    "imageUrl": "https://example.com/image.jpg",
    "overview": "College overview",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "courses": [
      {
        "id": 1,
        "name": "B.Tech Computer Science",
        "duration": "4 years",
        "fees": 230000
      }
    ],
    "placement": {
      "averagePackage": 21.5,
      "highestPackage": 120,
      "placementRate": 92,
      "topRecruiters": ["Google", "Microsoft"]
    },
    "reviews": [
      {
        "id": 1,
        "student": "Aarav Sharma",
        "rating": 4.9,
        "comment": "Strong academics and placements.",
        "createdAt": "2026-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Saved College Routes

Saved college routes require an auth token:

```http
Authorization: Bearer <token>
```

#### Save a College

```http
POST /api/saved-colleges
```

Request body:

```json
{
  "collegeId": 1
}
```

#### Get Saved Colleges

```http
GET /api/saved-colleges
```

Returns the logged-in user's saved college list.

#### Remove a Saved College

```http
DELETE /api/saved-colleges/:collegeId
```

Example:

```http
DELETE /api/saved-colleges/1
```

## Environment Variables

### Backend

Create `backend/.env` from `backend/.env.example`.

```env
PORT=5000
DATABASE_URL=
JWT_SECRET=
FRONTEND_URL=http://localhost:3000
```

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | Backend port. Defaults to `5000` |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret used to sign JWT tokens |
| `FRONTEND_URL` | Yes | Allowed frontend origin for CORS |

### Frontend

Create `frontend/.env.local` from `frontend/.env.example`.

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Yes | Base URL for the backend API |

## Local Setup

### Prerequisites

- Node.js
- npm
- PostgreSQL database, such as Neon

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

Create the backend environment file:

```bash
cp .env.example .env
```

Fill in:

- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL`

### 2. Set Up the Database

Generate and push the schema:

```bash
npm run db:generate
npm run db:push
```

Seed demo data:

```bash
npm run db:seed
```

Start the backend:

```bash
npm run dev
```

The backend should run at:

```text
http://localhost:5000
```

### 3. Install Frontend Dependencies

Open a new terminal:

```bash
cd frontend
npm install
```

Create the frontend environment file:

```bash
cp .env.example .env.local
```

Set:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

The frontend should run at:

```text
http://localhost:3000
```

## Database Setup and Seeding

The seed file is:

```text
backend/src/seed/seed.ts
```

The seed script:

- clears saved colleges, reviews, placements, courses, and colleges
- preserves or updates the demo user
- inserts seeded college data
- inserts courses, placements, and reviews for each college

Run the seed script with:

```bash
cd backend
npm run db:seed
```

Important: editing the seed file does not automatically update the database. After changing seed data, run `npm run db:seed` again.

Also make sure you edit:

```text
backend/src/seed/seed.ts
```

Do not edit generated files in `backend/dist/` as your source of truth. The seed command runs the TypeScript source file.

## Available Scripts

### Backend Scripts

Run from `backend/`.

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the backend in watch mode with `tsx` |
| `npm run build` | Compiles TypeScript to `dist/` |
| `npm start` | Runs the compiled backend from `dist/index.js` |
| `npm run db:generate` | Generates Drizzle migration files |
| `npm run db:push` | Pushes schema changes to the database |
| `npm run db:seed` | Seeds demo data |

### Frontend Scripts

Run from `frontend/`.

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the Next.js dev server |
| `npm run build` | Builds the production frontend |
| `npm start` | Starts the production Next.js server |
| `npm run lint` | Runs ESLint |

## Demo Account

After running the backend seed script, you can log in with:

```text
Email: demo@example.com
Password: password123
```

## Deployment Guide

### Backend Deployment

Recommended hosts:

- Render
- Railway
- Fly.io
- VPS or EC2

Steps:

1. Create a PostgreSQL database.
2. Add backend environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `FRONTEND_URL`
3. Install dependencies.
4. Run:

```bash
npm run build
npm run db:push
npm run db:seed
npm start
```

For production, run the seed command only when you intentionally want to reset and reload demo data.

### Frontend Deployment

Recommended host:

- Vercel

Steps:

1. Deploy the `frontend/` directory.
2. Add:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

3. Rebuild the frontend after changing environment variables.

## Troubleshooting

### The frontend cannot connect to the backend

Check:

- backend server is running
- frontend `NEXT_PUBLIC_API_URL` points to the backend URL
- backend `FRONTEND_URL` includes the frontend origin
- CORS is not blocking the request

### Login works, but saved colleges fail

Check:

- `JWT_SECRET` is set in the backend
- the token exists in browser local storage
- requests include `Authorization: Bearer <token>`
- the user still exists in the database

### I changed image URLs in the seed file, but the UI still shows old images

The frontend reads image URLs from the database, not directly from the seed file.

After changing `backend/src/seed/seed.ts`, run:

```bash
cd backend
npm run db:seed
```

Also check that image URLs are valid. A valid Unsplash URL usually looks like:

```text
https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80
```

Common URL mistakes:

- missing `-` in the photo ID
- missing `?` before query params
- using `&amp;` instead of `&` inside a TypeScript string
- editing `backend/dist/seed/seed.js` instead of `backend/src/seed/seed.ts`

### The database is empty

Run:

```bash
cd backend
npm run db:push
npm run db:seed
```

### `Route not found`

Make sure API routes include `/api`.

Correct:

```text
/api/colleges
/api/auth/login
/api/saved-colleges
```

Incorrect:

```text
/colleges
/auth/login
/saved-colleges
```

### Frontend build fails because the API is unavailable

Most data fetching happens in client components, but make sure `NEXT_PUBLIC_API_URL` is set before building.

## Notes

- Prisma is not used. Drizzle ORM is used instead.
- Passwords are hashed before storage.
- JWT tokens expire after 7 days.
- Saved colleges are protected by backend middleware.
- The frontend stores auth session data in local storage.
- The backend seed data is meant for demo and assignment presentation purposes.
