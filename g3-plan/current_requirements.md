# Requirements Contract — TASK-HARKLY-06-E6-SHARE

**Created:** 2026-03-08
**Project:** Harkly SaaS — E6 Share + Export
**Status:** ACTIVE

---

## Task Description

Share page — финальный шаг workflow. `/app/projects/[id]/share` — обзор артефактов с export (Markdown, PDF, ZIP). Shareable read-only links `/share/[token]` без авторизации. Copy to clipboard. ShareLink модель в БД.

Project root: `/c/Users/noadmin/nospace/development/harkly/harkly-saas/`

---

## Agent 1 — Backend

- REQ-101: `prisma/schema.prisma` — добавить `ShareLink` модель (`id`, `artifact_id`, `token @unique @default(uuid())`, `created_at`, relation to Artifact with Cascade delete)
- REQ-102: `prisma/migrations/e6_share.sql` — CREATE TABLE share_links; FK to artifacts; UNIQUE index on token
- REQ-103: `src/app/api/projects/[id]/artifacts/[artifactId]/share-link/route.ts` — POST (создать ShareLink, вернуть `{ share_link, url }` 201) + DELETE (удалить все ShareLink для артефакта, 200)
- REQ-104: `src/app/api/share/[token]/route.ts` — GET публичный (no auth), находит ShareLink по token → artifact + project title/frame_type, 404 если не найден
- REQ-105: `src/app/api/projects/[id]/artifacts/[artifactId]/export/zip/route.ts` — GET, генерирует ZIP со всеми Markdown экспортами артефактов проекта, Content-Disposition: attachment; filename="harkly-{projectId}.zip"
- REQ-106: `prisma/seed.ts` update — добавить 1 ShareLink для Fact Pack артефакта (token: "test-share-token-123")

**ZIP implementation:** используй `fflate` или `jszip` через `bun add`. Собери все артефакты проекта, для каждого сгенерируй Markdown через существующую логику из `src/lib/artifacts/export.ts`, запакуй в ZIP.

**Auth pattern:** POST/DELETE share-link — требуют session (как в artifacts routes). GET /api/share/[token] — без auth.

## Agent 2 — Frontend

- REQ-201: `src/app/app/projects/[id]/share/page.tsx` — Share page: project summary card (title, frame, stats), artifact cards (тип, дата или "Not generated", кнопки Download MD/PDF/Copy/Share), "Download all as ZIP" кнопка вверху
- REQ-202: `src/components/share/ShareLinkDialog.tsx` — Dialog: "Create link" → показывает URL /share/{token}, кнопка "Copy URL", "Revoke link" (DELETE → убирает URL из UI)
- REQ-203: `src/app/share/[token]/page.tsx` — Public read-only page (NO auth middleware), header с Harkly logo + artifact type badge, рендер артефакта по типу (read-only), footer "Created with Harkly · Sign up" CTA; og:title + og:description meta
- REQ-204: `src/utils/clipboard.ts` — `copyToClipboard(text: string): Promise<boolean>` (navigator.clipboard + execCommand fallback)
- REQ-205: Toast notification — "Copied!" при успешном copy (используй `sonner` если установлен, иначе простой state div с timeout 2000ms)
- REQ-206: Navigation — добавить "Share" ссылку в project navigation (если есть project sidebar/nav — добавь туда, иначе добавь как кнопку в layout.tsx)

**Read-only artifact render:** для `/share/[token]` используй упрощённый render без edit controls. Fact Pack → таблица фактов. Evidence Map → таблица матрицы. Empathy Map → 2×2 grid. Можно использовать существующие компоненты без edit режима.

**Public page не требует auth:** `/share/[token]` — маршрут вне `/app/*`, поэтому middleware не трогает. Проверь `src/middleware.ts` — убедись что `/share/*` не в protected list.

---

## Definition of Done

- All REQ checked off by Coach
- `bun run build` exits 0
- No TypeScript errors, no `any` types
- AC-601 through AC-620 from spec verified
