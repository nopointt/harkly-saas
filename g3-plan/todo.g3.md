# G3 Todo — Harkly SaaS

## Completed (2026-03-08)
- REQ-002: Installed @supabase/ssr + @supabase/supabase-js, created `src/lib/supabase/client.ts` (browser client) and `src/lib/supabase/server.ts` (server client with cookies)
- REQ-003: Created `/auth/login` page with email+password form, signInWithPassword, redirects to /app/dashboard on success
- REQ-004: Created `/auth/register` page with email+password+name form, signUp, shows success message
- REQ-005: Created `/auth/forgot-password` page with email form, resetPasswordForEmail
- REQ-006: Created `src/middleware.ts` — protects /app/* routes (redirects to /auth/login if no session), allows public routes
- REQ-007: Created landing page `/` with hero section ("Harkly — AI research assistant"), dark minimal design, waitlist form with email input + submit button, success/error handling
- REQ-008: Created `POST /api/waitlist` endpoint — validates email, upserts to `waitlist_entries` via Prisma, returns 201/400/409/500
- REQ-001: Created `src/lib/prisma.ts` singleton using `@/generated/prisma` PrismaClient
