# Repository Discoveries

Durable notes about repository structure and migration decisions.

## 2026-05-13 PaperBridge Migration Scope

- PaperBridge is the primary project identity for repository workflow, CI, issue templates, security notes, and maintainer-facing docs.
- BentoPDF references remain valid when they describe the bundled PDF tools surface, tool-specific docs, upstream package names, or runtime components used by those tools.
- Legacy BentoPDF deployment artifacts were removed from the active repository surface: Docker/Helm release workflows, Helm chart files, Docker Compose/Unraid descriptors, container entrypoint/nginx files, and the air-gapped deployment script.

## 2026-05-13 Vite Local Ports

- Vite dev defaults to port 5173 and reads `VITE_DEV_PORT` from the active dev-mode env files such as `.env.development.local`.
- Vite preview defaults to port 4173 and runs in production mode by default, so `VITE_PREVIEW_PORT` belongs in the shell, `.env.local`, or `.env.production.local`.
- Dependency discovery and broad pre-bundling are disabled by default in `vite.config.ts` to keep local startup memory low; set `VITE_ENABLE_DEP_OPTIMIZER=true` to opt into broader pre-bundling for heavier tool-page development.
- Default dev optimization still includes `jszip` because PaperBridge `create-assignment.html` imports it directly and needs browser ESM conversion even when dependency discovery is disabled.
- Vite dev and preview bind to `0.0.0.0` by default so forwarded devcontainer ports are reachable from the host machine. Use `VITE_DEV_HOST=localhost` or `VITE_PREVIEW_HOST=localhost` for loopback-only serving.
- `docs/.vitepress/dist/**` is generated docs output and is ignored by ESLint; source docs remain linted where applicable.
