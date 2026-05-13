# Project Workflow

This docs page covers the repository workflow for PaperBridge.

## Setup

```bash
git clone https://github.com/mrbdahlem/paperbridge.git
cd paperbridge
npm install
npm run dev
```

## Validation

- `npm run ci:paperbridge` for PaperBridge-specific changes
- `npm run ci:tools` for the bundled BentoPDF tools surface
- `npm test -- --run` for the full repository suite

## Project Areas

- `src/js/paperbridge/` for PaperBridge workflows
- `src/js/logic/` and `src/pages/` for the BentoPDF tools surface
- `src/tests/` for tests
- `docs/` for repository documentation

## More Detail

Use the root [CONTRIBUTING.md](https://github.com/mrbdahlem/paperbridge/blob/main/CONTRIBUTING.md) for the full workflow.
