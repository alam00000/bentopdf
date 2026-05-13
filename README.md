<p align="center"><img src="public/images/favicon-no-bg.svg" width="80"></p>
<h1 align="center">PaperBridge</h1>

PaperBridge is the primary project in this repository. It focuses on printable PDF assignments, QR-stamped packet generation, and submission workflows for paper-first classrooms.

This repository also still ships the BentoPDF tool surface as a secondary capability. Public tool pages can remain BentoPDF-branded where they describe those PDF utilities.

## Repository Scope

- PaperBridge application code lives under `src/js/paperbridge/`.
- Shared tool pages and PDF utilities remain available in the broader app.
- Repository documentation now focuses on development and maintenance, not commercial terms, deployment recipes, or external agreement processes.

## Development

```bash
git clone https://github.com/mrbdahlem/paperbridge.git
cd paperbridge
npm install
npm run dev
```

By default, `npm run dev` serves on `http://localhost:5173` and `npm run preview` serves on `http://localhost:4173`.
Set `VITE_DEV_PORT` in your shell or `.env.development.local` if you need a different dev server port.
Set `VITE_PREVIEW_PORT` in your shell, `.env.local`, or `.env.production.local` if you need a different preview server port.
Dependency optimization is disabled by default to keep local startup memory low; set `VITE_ENABLE_DEP_OPTIMIZER=true` to opt into Vite pre-bundling for heavier tool-page development.

Useful scripts:

- `npm run ci:paperbridge` runs lint, typecheck, tests, and build for the PaperBridge slice.
- `npm run ci:tools` runs lint, typecheck, tests, and build for the bundled PDF tools surface.
- `npm test -- --run` runs the full repository test suite.
- `npm run docs:dev` starts the docs site.

## Documentation

- [docs/getting-started.md](docs/getting-started.md) covers local repository setup.
- [docs/contributing.md](docs/contributing.md) covers the lightweight project workflow.
- [docs/licensing.md](docs/licensing.md) and [licensing.html](licensing.html) summarize the repository license notices.

## Project Workflow

Use [CONTRIBUTING.md](CONTRIBUTING.md) for issue, pull request, and validation expectations.

## License

See [LICENSE](LICENSE) for the repository license terms.
