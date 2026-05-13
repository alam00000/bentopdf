# Contributing to PaperBridge

This repository uses a lightweight contribution workflow. There is no separate contributor agreement process.

## Repository Setup

```bash
git clone https://github.com/mrbdahlem/paperbridge.git
cd paperbridge
npm install
npm run dev
```

## Validation

Run the narrowest validation path that matches your change:

- `npm run ci:paperbridge` for PaperBridge-specific work
- `npm run ci:tools` for the bundled PDF tools surface
- `npm test -- --run` for the full repository gate

If you changed shared code or shared docs, prefer the full test suite plus the most relevant scoped CI script.

## Issues and Pull Requests

- Use the GitHub issue forms in `.github/ISSUE_TEMPLATE/` when opening bugs or feature requests.
- Use the pull request template at `.github/pull_request_template.md`.
- Keep pull requests focused on one change set.
- Include validation details in the PR description.

## Security Reporting

Do not open a public issue for a security vulnerability. Contact the maintainer directly at [contact@bentopdf.com](mailto:contact@bentopdf.com).

## Code of Conduct

All contributors are expected to follow [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
