# Getting Started

This guide is for working on the PaperBridge repository locally.

## What Lives Here

- PaperBridge: the classroom packet/submission workflow under `src/js/paperbridge/`
- BentoPDF tools: the broader PDF tool surface that is still bundled in the app
- Shared infrastructure: build scripts, translations, docs, and tests used by both surfaces

## Local Setup

```bash
git clone https://github.com/mrbdahlem/paperbridge.git
cd paperbridge
npm install
```

Start the dev server:

```bash
npm run dev
```

The app is available at `http://localhost:5173` by default.

## Validation Commands

Use the narrowest command that matches your change:

- `npm run ci:paperbridge` for PaperBridge-specific work
- `npm run ci:tools` for the BentoPDF tools surface
- `npm test -- --run` for the full repository suite
- `npm run docs:dev` for local docs work

## Project Areas

| Area                  | Purpose                                             |
| --------------------- | --------------------------------------------------- |
| `src/js/paperbridge/` | PaperBridge assignment, packet, and dashboard flows |
| `src/pages/`          | Tool pages and shared entry pages                   |
| `src/js/logic/`       | BentoPDF tool logic                                 |
| `src/tests/`          | Repository test suite                               |
| `docs/`               | Repository documentation                            |

## Next Steps

- [Contributing](/contributing)
- [Tools Reference](/tools/)
- [Licenses](/licensing)
