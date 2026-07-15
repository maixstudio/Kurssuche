# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This project was scaffolded from the AI Coding Starter Kit but **has not been initialized yet**: `docs/PRD.md` still contains placeholder text and `features/INDEX.md` has no features listed. Before writing any implementation code, tell the user to run `/init` with a description of what they want to build (see `.claude/rules/general.md` — this check is mandatory).

## Build & Test Commands

```bash
npm run dev          # Dev server at localhost:3000 (Turbopack)
npm run build        # Production build
npm run start         # Serve the production build
npm run lint          # ESLint (flat config: eslint.config.mjs)
npm test              # Vitest — unit/integration tests, run once
npm run test:watch    # Vitest in watch mode
npx vitest run path/to/file.test.ts   # Run a single Vitest file
npm run test:e2e      # Playwright E2E (auto-starts the dev server)
npm run test:e2e:ui   # Playwright with UI mode
npx playwright test tests/foo.spec.ts # Run a single Playwright spec
npm run test:all      # Vitest + Playwright
npx shadcn@latest add <component>     # Add a new shadcn/ui component
```

Note: `next lint` was removed in Next.js 16, so `lint` runs ESLint directly against `eslint.config.mjs` (which pulls in `eslint-config-next/core-web-vitals`).

Unit tests are co-located next to source files (`useHook.test.ts` beside `useHook.ts`); Playwright specs live in `tests/`.

## Architecture: the skill-driven workflow

This repo is built around a Claude Code workflow where **state lives in markdown files, not conversation memory**. Every skill re-reads these files at the start of each turn and writes back to them before finishing — that's how work survives context compaction and new sessions. When picking up any task, read `features/INDEX.md` first to see what already exists.

The pipeline, one skill per stage, each with a slash command in `.claude/skills/<name>/SKILL.md`:

```
/init          -> docs/PRD.md + features/INDEX.md (once, at project start)
/write-spec    -> features/PROJ-X-name.md (user stories, AC, edge cases)
/refine PROJ-X -> revise an existing spec
/architecture  -> adds tech design to the feature spec (no code)
/frontend      -> implements UI (forked sub-agent, .claude/agents/frontend-dev.md)
/backend       -> implements API/DB (forked sub-agent, .claude/agents/backend-dev.md)
/qa            -> tests against AC + security audit (forked sub-agent, .claude/agents/qa-engineer.md)
/deploy        -> ships to Vercel
/help          -> reports current workflow position and suggests the next command
```

`/frontend`, `/backend`, and `/qa` run as **forked sub-agents** (isolated context) because they generate heavy diffs/output; the others run inline because they need a live back-and-forth with the user. Handoffs between stages are always user-initiated — a skill suggests the next command but never chains into it automatically.

Feature status flows: `Roadmap -> Planned -> Architected -> In Progress -> In Review -> Approved -> Deployed`, tracked in the `features/INDEX.md` table and mirrored in each feature spec's header (see `.claude/rules/general.md` for the mandatory write-then-verify update sequence).

`.claude/rules/*.md` are auto-applied by path glob (frontmatter `paths:`), not manually loaded — `frontend.md` on `src/components/**` and page/layout files, `backend.md` and `security.md` on `src/app/api/**` and Supabase/env files, `general.md` always.

## Key conventions

- Feature IDs are sequential (`PROJ-1`, `PROJ-2`, ...); one feature per spec file in `features/`.
- Commit format: `type(PROJ-X): description` (types: feat, fix, refactor, test, docs, deploy, chore).
- shadcn/ui first: never hand-roll a component that shadcn already provides (see the disallowed list in `.claude/rules/frontend.md`); install missing ones with `npx shadcn@latest add <name> --yes`. Custom components should only compose shadcn primitives for business-specific needs.
- Path alias `@/*` maps to `./src/*` (see `tsconfig.json`, mirrored in `vitest.config.ts`).
- Supabase client lives in `src/lib/supabase.ts` and is commented out until a project actually needs a backend (`.env.local.example` documents the required env vars). When backend work starts, every table needs RLS with explicit policies for SELECT/INSERT/UPDATE/DELETE — see `.claude/rules/backend.md` and `.claude/rules/security.md`.
- Read a file before editing it — never assume contents from memory; after any context compaction, re-read `features/INDEX.md` and the relevant spec before continuing.
