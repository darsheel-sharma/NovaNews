# Guild

Guild is a full-stack news app with:

- a `frontend` built with Next.js
- a `backend` built with Express and Prisma
- PostgreSQL for saved articles
- Google OAuth for login
- Gemini for AI article overviews

## Project Structure

```text
guild/
  backend/
  frontend/
```

## Prerequisites

Make sure these are installed on your machine:

- Node.js 18 or newer
- npm
- PostgreSQL

## Environment Variables

This project uses two separate env files.

### 1. Backend env

Create or update `backend/.env` with:

```env
PORT=4000
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/guild
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 2. Frontend env

Create or update `frontend/.env.local` with:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEWS_API=your_newsapi_key
GOOGLE_API_KEY=your_gemini_api_key
```

Notes:

- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` should match the backend `GOOGLE_CLIENT_ID`.
- `GOOGLE_API_KEY` is used by the Gemini summary feature.
- The backend CORS config currently allows `http://localhost:5000`, and the frontend already runs on port `5000`.

## Install Dependencies

Open a terminal in the root directory and run:

```bash
cd backend
npm install
```

Open another terminal in the root directory and run:

```bash
cd frontend
npm install
```

## Database Setup

Make sure PostgreSQL is running and the database in `DATABASE_URL` already exists.

Then run:

```bash
cd backend
npx prisma generate
npx prisma migrate deploy
```

If you are setting up the database for the first time during development, you can use:

```bash
cd backend
npx prisma migrate dev
```

## Start The Project Locally

You need two terminals.

### Terminal 1: Start backend

```bash
cd backend
node server.js
```

The backend will start on:

```text
http://localhost:4000
```

### Terminal 2: Start frontend

```bash
cd frontend
npm run dev
```

The frontend will start on:

```text
http://localhost:5000
```

## How To Use

1. Start both backend and frontend.
2. Open `http://localhost:5000`.
3. Log in with Google or the app auth flow.
4. Browse news, generate AI overviews, and save articles to your library.

## Helpful Commands

Frontend:

```bash
cd frontend
npm run dev
npm run build
npm run lint
```

Backend:

```bash
cd backend
node server.js
npx prisma studio
```

## Common Issues

### Frontend says API URL is not configured

Check that `frontend/.env.local` contains:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### Backend fails on startup because env vars are missing

Check that `backend/.env` exists and includes all required values:

- `PORT`
- `DATABASE_URL`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

### AI Overview does not work

Make sure `frontend/.env.local` contains a valid:

- `GOOGLE_API_KEY`

### Articles are not being saved

Check:

- PostgreSQL is running
- `DATABASE_URL` is correct
- Prisma migrations have been applied

