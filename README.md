<p align="center">
  <img src="public/android-chrome-512x512.png" alt="Aptora logo" width="150" />
</p>

<h1 align="center">Aptora</h1>

<p align="center">
  A placement discovery and management platform connecting University of Ilorin technology students with meaningful career opportunities.
</p>

<p align="center">
  <a href="https://nextjs.org/docs">Next.js 16</a> ·
  <a href="https://www.typescriptlang.org/docs/">TypeScript</a> ·
  <a href="https://supabase.com/docs">Supabase</a> ·
  <a href="https://tailwindcss.com/docs">Tailwind CSS 4</a>
</p>

## About Aptora

Aptora helps students discover placements that fit their academic background and technical skills. Employers can publish and manage opportunities, while administrators oversee verification, applications, and platform activity.

The application is built with the Next.js App Router and TypeScript. Supabase provides authentication, PostgreSQL data, and private document storage. Database access is organized in the `aptora` schema, with row-level security policies protecting user and organization data.

## What’s included

- Public placement discovery, search, filters, and opportunity details
- Student and employer registration, email verification, sign-in, and password recovery
- Role-protected student, employer, and administrator dashboards
- Student profiles, academic details, technical skills, career interests, saved placements, and applications
- Eligibility-aware placement recommendations with configurable weighted matching
- Employer verification, placement management, and candidate review
- Administrative review workflows, analytics, notifications, and audit records
- Private document uploads with ownership-aware access policies
- Responsive layouts and persistent light, dark, and system themes

## Technology

| Area | Tools |
| --- | --- |
| Web application | Next.js 16 App Router, React 19, TypeScript |
| Styling | Tailwind CSS 4 and project CSS |
| Authentication and data | Supabase Auth, PostgreSQL, PostgREST, Storage |
| Validation | Zod |
| Tests | Vitest, React Testing Library, jsdom |
| Code quality | ESLint, TypeScript |

## Getting started

### Requirements

- Node.js 20 or newer
- npm
- A Supabase project for authentication and live data

### Install dependencies

```bash
npm install
```

Create a local environment file:

```powershell
Copy-Item .env.example .env.local
```

Add the values from your Supabase project settings to `.env.local`:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_ONLY_SERVICE_ROLE_KEY
SUPABASE_DB_URL=YOUR_URL_ENCODED_POSTGRES_CONNECTION_STRING
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only and is not needed by the current application. Never expose it through a `NEXT_PUBLIC_` variable or commit it. `SUPABASE_DB_URL` is for trusted local database administration with the Supabase CLI; keep it private and URL-encode reserved characters in the database password. `.env.local` is ignored by Git.

Start the development server:

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## Supabase setup

The checked-in migrations are the source of truth for database setup and updates. The initial migration creates the application schema, RLS policies, functions, triggers, and private storage buckets. The following migrations expose the `aptora` schema to PostgREST and refresh its schema cache. The standalone [`supabase/aptora_complete_schema.sql`](supabase/aptora_complete_schema.sql) contains the initial schema for review or manual application; do not apply it as well as the migrations to the same database.

To link the CLI to a Supabase project and apply pending migrations:

```powershell
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push --db-url "$env:SUPABASE_DB_URL"
```

The CLI is included as a development dependency. You can review the ordered migrations in [`supabase/migrations`](supabase/migrations/). They have been applied to the Aptora Supabase project; use `db push` for a new or updated environment.

In the Supabase dashboard, configure **Authentication → URL Configuration** with the app’s local and production URLs. Add the appropriate `/auth/callback` redirect URLs. Configure SMTP and the confirmation and recovery email templates before relying on email delivery in production. The database schema creates private `aptora-documents` and `aptora-avatars` buckets with access controlled by storage policies.

### First super administrator

Public signup can create student and employer accounts only. To promote a verified account to the first super administrator, use the Supabase SQL Editor with the project owner account and replace the UUID below:

```sql
update aptora.profiles
set role = 'super_admin'
where id = 'REPLACE-WITH-VERIFIED-AUTH-USER-UUID'
  and role in ('student', 'employer');
```

Confirm that exactly one row changed. Keep project-owner access private and record this bootstrap in the institution’s administrative process.

## Project structure

```text
actions/        Server actions for authentication and role workflows
app/            Public pages, auth routes, and role-based dashboard routes
components/     Shared UI, forms, public chrome, and dashboard navigation
lib/            Supabase clients, authorization, validation, and matching helpers
public/         Aptora identity and static assets
supabase/       Database schema, CLI configuration, and SQL migrations
tests/          Validation and interface tests
types/          Shared database and application types
```

## Quality checks

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

The test suite covers authentication and placement validation plus accessible sign-in controls. Changes to database policies, triggers, storage rules, and authentication redirects should also be verified against a non-production Supabase project.

## Deployment

Deploy the Next.js application to Vercel or another Node.js hosting platform. Set the required public Supabase URL and anon/publishable key in the deployment environment, and set the production `NEXT_PUBLIC_SITE_URL`. Add any server-only keys only when the deployed server needs them. Configure matching Supabase Auth redirect URLs and SMTP before enabling production signup and password recovery.

Apply schema updates through reviewed migrations. Run the quality checks above before release and keep database backups according to your institution’s retention policy.

## Security

- Supabase Auth sessions are verified on the server for protected routes.
- Row-level security remains the data access boundary; route checks alone do not secure database records.
- The public client uses the anon/publishable key and the typed `aptora` schema.
- The service-role key must never be sent to the browser.
- Student documents are stored in private buckets with owner-scoped policies.
- Public placement queries are limited to eligible, published opportunities and avoid exposing employer contact details.

## Documentation

- [Next.js documentation](https://nextjs.org/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Supabase documentation](https://supabase.com/docs)
- [Supabase CLI and local development](https://supabase.com/docs/guides/local-development/cli/getting-started)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Tailwind CSS documentation](https://tailwindcss.com/docs)
- [Vitest documentation](https://vitest.dev/guide/)
- [Vercel deployment documentation](https://vercel.com/docs/deployments)
