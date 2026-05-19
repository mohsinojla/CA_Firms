# CA Firms Directory

Community-driven directory of Chartered Accountant firms in Pakistan, built with Next.js 15, Supabase, and Clerk.

## Features

- Browse CA firms by city (Islamabad, Lahore)
- Search by firm name, TO code, MRS name, or address
- Filter by designation (FCA/ACA) and hiring status
- Suggest edits to any firm (requires Google sign-in)
- Admin review workflow — all changes go through moderation
- Real-time updates via Supabase realtime
- Contributors leaderboard
- Full audit trail

## Tech Stack

- **Framework**: Next.js 15 App Router + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui + framer-motion
- **Auth**: Clerk (Google OAuth only)
- **Database**: Supabase PostgreSQL (RLS + realtime)
- **Deployment**: Vercel

## Setup

### 1. Clone and install

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required keys:
- `NEXT_PUBLIC_SUPABASE_URL` — from Supabase project settings
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from Supabase project settings
- `SUPABASE_SERVICE_ROLE_KEY` — from Supabase project settings (keep secret)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — from Clerk dashboard
- `CLERK_SECRET_KEY` — from Clerk dashboard
- `CLERK_WEBHOOK_SECRET` — from Clerk webhook settings

### 3. Supabase setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL migration in the Supabase SQL editor:
   ```
   supabase/migrations/001_schema.sql
   ```
3. Enable realtime for: `firms`, `pending_changes`, `contributor_stats` in Database > Replication

### 4. Clerk setup

1. Create a Clerk app at [clerk.com](https://clerk.com)
2. Enable only **Google** as a social connection
3. Add a webhook pointing to `https://your-domain.com/api/webhooks/clerk`
4. Subscribe to `user.created` and `user.updated` events

### 5. Seed the database

```bash
npm run seed
```

This imports all firms from `islamabad.json` and `lahore.json` into Supabase.

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment (Vercel)

1. Push to GitHub
2. Import the repo in Vercel
3. Add all `.env.local` variables as Vercel environment variables
4. Deploy

After deploying:
- Update `NEXT_PUBLIC_APP_URL` to your production URL
- Update the Clerk webhook URL to `https://your-domain.com/api/webhooks/clerk`

## Admin Access

The following emails have admin access (hardcoded in `lib/constants.ts`):
- `asadrazaojla141678@gmail.com`
- `mohsinrazaojla32@gmail.com`

Admin dashboard: `/admin`

## Project Structure

```
app/                    Next.js App Router pages
components/             Reusable React components
  ui/                   shadcn/ui base components
  firms/                Firms table, cards, search
  contributions/        Edit dialogs, diff views
  admin/                Admin-only components
  contributors/         Leaderboard components
lib/                    Utilities, Supabase clients, constants
hooks/                  React hooks (realtime, debounce)
types/                  TypeScript type definitions
scripts/                Database seed script
supabase/migrations/    SQL schema and migrations
```
