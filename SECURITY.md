# Security

PaperBridge does not currently document a public deployment recipe in this repository. Treat runtime hosting, network controls, and production secrets as environment-specific concerns until a PaperBridge deployment path is defined.

## Reporting

Do not open a public issue for vulnerabilities or suspected secret exposure. Use a private maintainer contact path for security reports.

## Repository Expectations

- Do not commit secrets, access tokens, private keys, student data, or production configuration.
- Keep security-sensitive validation in tests when changing upload, parsing, PDF processing, or submission flows.
- Use structured server-side logging where server code is introduced, and never log secrets or sensitive document contents.
- Keep third-party PDF-processing license and security notices current when enabling or redistributing bundled components.
