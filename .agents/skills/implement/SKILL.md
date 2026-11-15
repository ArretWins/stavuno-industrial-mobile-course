---
name: implement
description: Run an approved Stavuno implementation-plan step through an implementer and an independent instruction-level read-only verifier. Use only when explicitly invoked for this course repository.
---

# Implement an approved Stavuno step

Use this workflow only after the user explicitly invokes `$implement` and identifies an approved plan step, requirement, user story, or narrowly scoped defect.

## Preconditions

1. Confirm the current repository is `stavuno-industrial-mobile-course`.
2. Read `AGENTS.md`, `SPEC.md`, `DESIGN.md`, `BACKLOG.md`, and the relevant section of `IMPLEMENTATION_PLAN.md`.
3. Confirm `DESIGN.md` is marked `Approved baseline`.
4. Inspect `git status --short` and preserve unrelated changes.
5. Record the baseline commit with `git rev-parse HEAD`.
6. Resolve the requested scope to explicit `UC`, `FR`, `US`, task, acceptance criteria, and plan step.

If the request changes product scope, conflicts with the approved documents, names no resolvable step, or requires an unauthorized production action, stop and ask for the missing decision. Do not infer approval from this skill.

## Orchestration

### 1. Implementation pass

Spawn the project custom agent `implementer`. Give it:

- the selected plan step and linked requirement identifiers;
- the baseline commit;
- the acceptance criteria;
- any existing uncommitted files that must be preserved;
- explicit validation commands from the plan.

The implementer owns edits and targeted tests. The coordinator remains responsible for authorization boundaries and for checking that the returned status matches the actual working tree.

### 2. Integrated validation

After implementation, run the integrated validation required by the selected plan step before spawning the verifier. If validation fails, return the observed failures to the implementer and repeat targeted plus integrated validation. Do not ask a verifier to approve a diff whose required suite is failing.

Record the exact commands and results. Also capture the pre-verifier state with `git status --porcelain=v1 -uall`, `git diff --binary`, and `git diff --cached --binary`.

### 3. Independent verification pass

After implementation and required local validation, spawn a new project custom agent `verifier` with fresh context. Give it:

- the baseline commit and current working tree or resulting commit;
- the selected requirements and plan step;
- the implementer's summary and observed test results;
- the integrated validation commands and observed results;
- an instruction to inspect the actual diff and independently verify it.

Do not ask the verifier to fix anything. Its read-only behavior is an instruction-level constraint, not a separate sandbox. Its output must be `PASS`, `REVISE`, or `BLOCKED` according to `.codex/agents/verifier.toml`.

After the verifier finishes, capture the same three Git views again and compare them with the pre-verifier state. Any unexpected mutation means `BLOCKED`; do not silently restore or accept it.

### 4. Revision loop

On `REVISE`, send only the concrete verifier findings back to the implementer. After corrections, rerun targeted and integrated validation, record a new pre-verifier Git state, and create a new verifier pass with fresh context. Allow at most two revision rounds without a new user decision. Then report unresolved findings and risk instead of looping indefinitely.

On `BLOCKED`, stop and ask only for the missing decision, permission, environment, or artifact.

On `PASS`, inspect `git diff --check`, confirm the post-verifier Git state matches the pre-verifier state, and report the already completed integrated validation.

## Fallback rule

If subagent tooling or either custom agent is unavailable, do not pretend the pipeline ran. Report the limitation. Implement in the main agent only after the user accepts that fallback, and still obtain a separate fresh-context review before calling the work verified.

## External actions

This workflow does not authorize commits, pushes, deployments, publishing, production database changes, secret creation, account changes, or release distribution. Perform those only when separately and explicitly requested by the user.

## Final report

Report:

- selected plan step and requirement identifiers;
- implementation outcome and changed files;
- implementer validation evidence;
- verifier verdict and revision rounds;
- integrated validation results;
- manual checks and live-environment boundaries;
- working-tree and commit status;
- external actions intentionally not performed.
