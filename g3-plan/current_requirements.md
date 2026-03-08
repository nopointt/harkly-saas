# Requirements Contract — TASK-HARKLY-001-E0-SCAFFOLD

**Created:** 2026-03-08
**Project:** Harkly SaaS (`harkly-saas`)
**Spec:** `C:\Users\noadmin\nospace\development\harkly\branches\saas-v1\specs\e0-scaffold-auth.md`
**Status:** ACTIVE

---

## Context (already done — DO NOT redo)

- Next.js 16 + Bun installed at `C:\Users\noadmin\nospace\development\harkly\harkly-saas`
- Prisma 7 installed, full schema at `prisma/schema.prisma` (12 models)
- Tailwind CSS v4 installed
- `.env.local` has: DATABASE_URL (pooler), DIRECT_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
- `package.json` build script: `prisma generate && next build`
- `.gitignore` correctly excludes `.env.local`

---

## Task Description

Implement the E0 scaffold epic: shadcn/ui setup, Supabase Auth (email/password), auth pages (login/register/forgot-password), protected route middleware, app layout placeholder, landing page with waitlist form, waitlist API route. Apply Prisma migration to Supabase DB.

---

## Requirements

- [ ] REQ-001: `shadcn/ui` установлен (`bunx shadcn@latest init`), компонент `Button` и `Input` работают без ошибок импорта
- [ ] REQ-002: `@supabase/ssr` установлен, файл `src/lib/supabase/server.ts` с `createServerClient` и `src/lib/supabase/client.ts` с `createBrowserClient`
- [ ] REQ-003: `/login` — страница с формой email+password, `signInWithPassword` через Supabase, redirect на `/app/[workspaceId]` после успешного входа
- [ ] REQ-004: `/register` — страница с формой email+password, `signUp` через Supabase, показывает "Check your email" после успешной регистрации
- [ ] REQ-005: `/forgot-password` — форма email, `resetPasswordForEmail` через Supabase
- [ ] REQ-006: `src/middleware.ts` — защищает `/app/*` маршруты (если нет сессии → redirect `/login`), публичные маршруты (`/`, `/login`, `/register`, `/share/*`) пропускает
- [ ] REQ-007: Лендинг `/` — hero секция (заголовок Harkly + описание) + waitlist форма (email input + submit button)
- [ ] REQ-008: `POST /api/waitlist` — принимает `{ email }`, сохраняет в таблицу `waitlist_entries` через Prisma, возвращает `201 { success: true }` или `409` если email уже есть
- [ ] REQ-009: Prisma migration применена к Supabase БД (`bunx prisma migrate dev --name init` с DIRECT_URL как DATABASE_URL), все 12 таблиц существуют
- [ ] REQ-010: `bun run build` завершается exit 0, TypeScript без ошибок

---

## Definition of Done

- Все REQ-XXX проверены Coach независимо
- `bun run build` = exit 0
- `/login`, `/register`, `/forgot-password` рендерятся (200)
- `/app/test` без auth → redirect `/login`
- POST `/api/waitlist` с email → 201 в БД
- Нет хардкода credentials

---

## Coach Verification Checklist

- [ ] `bun run build` — exit 0
- [ ] GET `/login` → 200
- [ ] GET `/app/test` (no auth) → redirect `/login`
- [ ] POST `/api/waitlist` `{"email":"test@test.com"}` → 201
- [ ] `select count(*) from waitlist_entries` в Supabase SQL editor → 1 row
- [ ] shadcn компоненты импортируются без ошибок
- [ ] Нет `.env.local` в git (`git status` не показывает)
- [ ] Нет `any` типов в auth файлах
