# Repository Discoveries

Durable notes about repository structure and migration decisions.

## 2026-05-13 PaperBridge Migration Scope

- PaperBridge is the primary project identity for repository workflow, CI, issue templates, security notes, and maintainer-facing docs.
- BentoPDF references remain valid when they describe the bundled PDF tools surface, tool-specific docs, upstream package names, or runtime components used by those tools.
- Legacy BentoPDF deployment artifacts were removed from the active repository surface: Docker/Helm release workflows, Helm chart files, Docker Compose/Unraid descriptors, container entrypoint/nginx files, and the air-gapped deployment script.
