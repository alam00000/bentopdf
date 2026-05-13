## Communication Style

- Be direct and to the point
- No apologies or conversational filler
- Answer questions directly without preamble
- Explain reasoning concisely when asked
- Avoid unnecessary elaboration

## Decision Making

- Ask clarifying questions before making assumptions
- Stop and ask when uncertain about project-specific details
- Confirm approach before making structural changes
- Request guidance on preferences (cross-platform vs specific tools, etc.)
- Verify understanding of requirements before proceeding

## Working Rules

- From the package root you can call `npm test`; all tests must pass before commit.
- Treat generated outputs (`dist`, caches, `node_modules`) as out of scope for manual edits.
- Add or update tests for the code you change, even if nobody asked.
- For tests that intentionally exercise failure/error paths, add explicit `[TEST]` log messages so expected noisy output is clearly distinguishable from real regressions.
- Keep translations up to date as ui is updated
- Frontend controls must include appropriate accessibility semantics for their role and state. Use native elements when possible, and add relevant attributes such as `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-controls`, `aria-expanded`, `aria-pressed`, `aria-selected`, and `disabled` when the control behavior requires them.
- All API endpoints must include proper error handling and logging.
- Use structured logging for all server-side events.
- Never expose, log, or commit secrets, API keys, or other sensitive information.
- Plans should be iterative and include checklists of steps for the plan. Checklists must be updated as tasks are created and completed.

## Preflight Checklist

Before making code changes:

- Confirm branch and working tree status. NEVER commit to `main`.
- If unexpected unrelated file changes are discovered, pause and ask how to proceed.
- Read relevant docs (`README.md`, `ARCHITECTURE.md`, `DEPLOYMENT.md`).
- Identify change scope (docs-only, client, server, activities, cross-workspace).
- If requirements conflict with repository safety or deployment guarantees, escalate before continuing.

## Verification Matrix

Run these minimum checks based on scope:

- Docs-only changes
  - Verify links/commands in changed docs are accurate.
- Workspace specific changes
  - Run the appropriate npm workspace tests, be sure to include lint and typecheck
- Sandbox/agent environments that block local port binding
  - Keep `npm test` as the primary merge gate when available.
  - If port-binding tests fail due environment constraints (for example `EPERM` on listen), run `npm run test:codex` and record the limitation in validation notes.

## Destructive Command Policy

- Do not run destructive commands (for example: `git reset --hard`, broad `rm -rf`, forced history rewrites) unless explicitly requested.
- If a potentially destructive action is required, ask for confirmation first.

## Frontend Accessibility

1. Prefer semantic HTML elements that already expose the correct accessibility role and keyboard behavior.
2. Treat visual-only state as insufficient. If a control has expanded/collapsed, pressed, selected, active, disabled, invalid, or busy state, expose that state with the appropriate native or ARIA attribute.
3. Icon-only controls must have an accessible name.
4. When creating or changing custom interactive components, verify keyboard interaction and screen-reader semantics along with visual behavior.

## Temporary Workaround Policy

1. Any temporary compatibility shim or workaround must include:
   - inline reason
   - owner
   - cleanup condition or target date

## Release-Impact Rule

If a change affects runtime, build, or deployment behavior:

1. Update `DEPLOYMENT.md` in the same PR.
2. Update `README.md` quick-start/build/run commands as needed.
3. Update `ARCHITECTURE.md` if system boundaries or runtime flow changed.

## Ownership and Escalation

1. If unexpected unrelated file changes are discovered, pause and ask how to proceed.
2. If requirements conflict with repository safety or deployment guarantees, escalate before continuing.

## Evidence and Tracking

Use these logs to keep work auditable:

1. `.agent/knowledge/repo_discoveries.md`
   - Durable notes/discoveries for future work.
2. `.agent/knowledge/react-best-practices.md`
   - React patterns, optimizations, and accessibility guidance.
3. `.agent/knowledge/testing-patterns.md`
   - Shared testing setups, failure patterns, and reliability guidance.
4. `.agent/knowledge/deployment-notes.md`
   - Environment/runtime deployment constraints and operational learnings.
5. `.agent/knowledge/data-contracts.md`
   - API contracts, payload assumptions, and compatibility expectations.
6. `.agent/knowledge/performance-notes.md`
   - Profiling findings, bottlenecks, and optimization tradeoffs.
7. `.agent/knowledge/security-notes.md`
   - Security boundaries, validation rules, and sensitive-data handling guidance.

If a log file is missing, create it when first needed.
If a discovery does not fit an existing knowledge file, create a new `.agent/knowledge/<category>.md` file and define its purpose at the top. Prefer extending an existing category first; create a new category only when the topic is durable and likely to be reused.

## Definition of Done (General)

1. Relevant tests pass.
2. Documentation is updated for any workflow/runtime/build change.
3. Notes are recorded in the appropriate log files.
4. If following a plan, appropriate step(s) are marked as complete.
