# APTORA implementation checklist

The repository started as a minimal Next.js 16.4.6 App Router project. This checklist tracks the requested phased build. A phase is marked complete only after its deliverables are implemented and checked.

## Phase 1 — Project inspection and foundation

- [x] Inspect existing files, configuration, dependencies, and assets.
- [x] Read the installed Next.js documentation for App Router components, authentication, Cache Components, and environment variables.
- [x] Establish Aptora visual tokens and a responsive public landing page.
- [x] Add persisted light, dark, and system themes, pre-hydration theme selection, and reduced-motion styling.
- [x] Add Supabase browser and server clients using `@supabase/ssr`.
- [x] Add a request proxy for Supabase session cookie refresh.
- [x] Add server-side user verification helper.
- [x] Add `.env.example` without credentials.
- [x] Run ESLint, TypeScript, and production build checks; resolve any issues.

## Phase 2 — Database implementation

- [x] Design and review `supabase/aptora_complete_schema.sql`.
- [x] Add tables, constraints, indexes, functions, triggers, RLS policies, and Storage policies.
- [x] Generate TypeScript database types and document secure first-admin setup.
- [x] Apply the schema and migrations to the configured Supabase project; verify the tables, RLS policies, storage buckets, exposed API schema, and PostgREST access.

## Phase 3 — Public website

- [x] Implement About, How It Works, Opportunities, Contact, FAQ, Privacy, and Terms pages.
- [x] Connect public placement listings and aggregate statistics to approved Supabase data.
- [x] Add real featured listings, filters, sorting, pagination, and honest unconfigured/empty states.

## Phase 4 — Authentication and onboarding

- [x] Implement role-safe registration, login, logout, email verification, and password reset.
- [x] Add protected role route layouts and authorization checks.
- [ ] Add student/employer onboarding completion screens and verify flows against live Supabase Auth settings.

## Phase 5 — Student platform

- [x] Implement student profile, academic data, skills, interests, documents, settings, and dashboard.
- [x] Implement applications, saved opportunities, and notification inbox.
- [x] Add event-driven in-app notifications for applications, employer verification, and placement decisions.
- [x] Add owner-scoped document deletion from private Storage and metadata records.
- [ ] Add document version history and complete end-to-end authorization checks.

## Phase 6 — Intelligent matching

- [x] Implement eligibility filtering and configurable weighted matching in the database.
- [x] Add explanations, persisted scores, and recommendation screens.
- [ ] Add matching unit/integration tests and validate scoring against representative profiles.

## Phase 7 — Employer platform

- [x] Implement employer onboarding, organization verification, placement authoring, and candidate application review.
- [x] Add employer dashboard and an owner-scoped candidate RPC; allow draft preparation before verification while publishing remains admin-only.

## Phase 8 — Administrator platform

- [x] Implement role-gated administration, approval workflows, analytics, contact message handling, notifications, and audit logs.

## Phase 9 — Notifications and document management

- [x] Implement in-app notification workflows and private, validated document uploads with owner-scoped access.
- [x] Add student document deletion while preserving private storage access rules.
- [ ] Add document version management and validate Storage policies against a disposable Supabase project.

## Phase 10 — Quality and deployment

- [x] Add Vitest unit coverage for authentication and placement validation plus a React Testing Library sign-in form test.
- [ ] Add end-to-end coverage for live authentication, role authorization, applications, matching, and administrator workflows.
- [x] Run TypeScript, lint, and production build checks.
- [x] Validate the live schema, RLS policy setup, storage buckets, migration history, and PostgREST access against the configured Supabase project.
- [x] Document setup, Supabase schema/bootstrap, email, storage, local checks, and deployment configuration in README.
