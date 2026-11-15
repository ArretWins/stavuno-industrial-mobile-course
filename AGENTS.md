# Stavuno course repository instructions

## Purpose

This repository is the isolated educational version of Stavuno. Keep it separate from the production Stavuno repository, Supabase project, Cloudflare Pages project, Android package, credentials, and release artifacts.

## Sources of truth

Read these files before planning implementation work:

1. `project.md` — product problem, users, MVP and non-goals.
2. `SPEC.md` — functional requirements and acceptance criteria.
3. `DESIGN.md` — approved architecture and UX decisions.
4. `BACKLOG.md` — initiative, epics, user stories and tasks.
5. `IMPLEMENTATION_PLAN.md` — executable steps and verification gates.

If documents conflict, stop and ask the project owner which requirement wins. Do not silently expand the MVP.

## Working agreements

- Inspect `git status --short` before editing and preserve unrelated user changes.
- Keep the educational Android identity `sk.stavuno.course`.
- Never add `.env`, service-role credentials, signing keys, private tokens or production URLs.
- Do not deploy, push, publish, apply remote migrations or modify production services unless the user explicitly requests that exact external action.
- Use `apply_patch` for focused text edits and keep commits scoped to one logical change.
- Prefer domain logic that can be tested without rendering React Native screens.
- Keep role enforcement in PostgreSQL RLS and server functions, not only in UI visibility.
- Treat offline operations as durable and idempotent; never discard pending user data after a network failure.
- State validation boundaries honestly. Local tests and an Expo export do not prove a live backend, RLS, e-mail delivery, OCR provider or two-device flow.

## Validation

Run the smallest relevant tests while iterating. Before declaring a step complete, run:

```bash
npm run validate
npm run build:worker-portal
git diff --check
```

For a release-oriented change, also run:

```bash
npx expo export --platform android --output-dir dist-android-course
```

Database changes require migration tests. A linked Supabase command must remain `--dry-run` unless the user explicitly authorizes applying it to a named environment.

## Implementer and verifier workflow

When the user explicitly invokes `$implement`, follow `.agents/skills/implement/SKILL.md`.

- The `implementer` custom agent owns edits and targeted validation.
- The `verifier` custom agent receives a fresh context and reviews the resulting diff against the approved documents.
- Its read-only behavior is enforced by instructions, not by a separate sandbox. The coordinator must compare `git status --porcelain=v1 -uall`, tracked diff and staged diff before and after verification.
- The verifier reports findings and must not edit files. Any unexpected verifier mutation is `BLOCKED` and must be disclosed rather than silently restored.
- The coordinator decides whether findings require another implementation pass.
- Do not claim the two-agent workflow ran if subagent tooling or the custom agents were unavailable.

## Commit conventions

Use concise Conventional Commit messages:

- `docs:` requirements, design, backlog and course documentation;
- `feat:` user-visible behavior;
- `fix:` defect correction;
- `test:` tests and validation contracts;
- `refactor:` behavior-preserving restructuring;
- `chore:` tooling and agent configuration.

Do not rewrite published history without explicit permission.
