# ADR-001: Adopt BentoPDF as Internal PDF Toolkit

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-03-06 |
| Decision Makers | Caide Spriestersbach, Juan Cano, Mike Niszl |

## Context

Cainmani needs an internal PDF toolkit to replace Adobe Acrobat Pro subscriptions. The tool must support six core functions: redact, organise/delete pages, compress, combine, remove passwords, and sign/edit PDFs.

The team evaluated three options: Adobe Acrobat Pro (incumbent), Stirling-PDF (popular open-source alternative), and BentoPDF (client-side open-source toolkit).

The tool will be deployed on the Cainmani server behind Keycloak authentication, accessible to all staff via `https://pdf.cainmani.cloud`.

## Requirements & Constraints

- **Client-side processing**: PDF files must never leave the user's machine (data sensitivity)
- **No per-user licensing costs**: tool must scale to the full team without recurring fees
- **Keycloak integration**: must work behind our existing SSO infrastructure
- **Lightweight deployment**: minimal server resources (server is shared with other apps)
- **Six core functions**: redact, organise/delete pages, compress, combine, remove passwords, sign & edit
- **Budget**: 30,000 EUR total, minimize recurring costs

## Decision

Adopt **BentoPDF** (AGPL-3.0) as the internal PDF toolkit.

BentoPDF is a static web application that performs all PDF processing client-side in the browser using WebAssembly. It provides 100+ PDF tools covering all six required functions. It is served as static files via nginx, requiring no backend processing or database.

Authentication is handled by **oauth2-proxy** in Traefik forwardAuth mode, authenticating against our existing Keycloak instance. This is a new pattern for the Cainmani infrastructure (existing apps handle OIDC in their application code), chosen because BentoPDF is a static site with no backend to validate JWTs.

The forwardAuth pattern is reusable for future static applications that need Keycloak protection.

### Stack Deviation

BentoPDF is an upstream JavaScript/HTML application, not Python or TypeScript (the SOP-11 defaults). This deviation is accepted because:
- We are deploying an existing open-source tool, not building a new application
- No custom application code is written — only infrastructure configuration (Docker Compose, oauth2-proxy)
- The stack deviation is limited to the served static files, which we do not modify

### Licensing

BentoPDF is licensed under AGPL-3.0. To comply:
- This fork repository remains **public** on GitHub
- All modifications are pushed to the public repo
- No secrets are committed (enforced via CI secrets scanning + GitHub Secret Scanning)
- Fallback option: $49 one-time commercial license if public repo becomes untenable

### Technology Evaluation (SOP-11 Section 3.5)

| Dimension | Score | Rationale |
|---|---|---|
| Necessity | 5 | Replaces $180+/yr Adobe licenses; all six required functions covered |
| Feasibility | 5 | Pre-built Docker image, no custom code, deploys in under a day |
| Cost | 5 | $0 (AGPL) or $49 one-time (commercial). No recurring costs |
| Sustainability | 4 | Active upstream development, 1.5k+ GitHub stars, regular releases. Risk: single-maintainer project |
| Compatibility | 4 | Static site + nginx + Docker. Integrates via oauth2-proxy + Traefik (existing infra). New auth pattern but reusable |

All dimensions score >= 3. Overall: strong fit.

## Alternatives Considered

### Adobe Acrobat Pro

**Description:** Industry-standard commercial PDF editor. Per-user subscription via Adobe Creative Cloud.

**Pros:**
- Full-featured professional PDF editor
- Native desktop application (works offline)
- Industry standard, well-supported

**Cons:**
- $22.99/user/month ($275.88/user/year) recurring cost
- Per-user licensing does not scale
- Files processed locally but software requires Adobe account and cloud sync
- No self-hosted option

**Why not chosen:** Recurring per-user cost conflicts with budget constraints. BentoPDF covers all six required functions at zero cost.

### Stirling-PDF

**Description:** Popular open-source PDF toolkit with a web UI. Server-side processing using LibreOffice, PDFBox, and other tools.

**Pros:**
- 50k+ GitHub stars, large community
- Comprehensive PDF operations
- Docker deployment available

**Cons:**
- Server-side processing: PDF files are uploaded to and processed on the server
- OAuth2/OIDC (Keycloak) integration requires paid Server plan ($99/month) as of v2.1+
- Open-core model with features being moved behind paywalls over time
- Cannot edit existing text in PDFs (only add new text)
- Heavier server resource usage (Java + LibreOffice)

**Why not chosen:** Keycloak OIDC requires $99/month paid plan. Server-side processing means files leave the user's machine. Open-core trajectory creates long-term cost risk.

## Consequences

### Positive

- Zero recurring licensing costs (vs $276/user/year for Adobe)
- Client-side processing ensures PDF files never leave the user's machine
- Lightweight deployment: one nginx container + one oauth2-proxy container
- Keycloak SSO via oauth2-proxy forwardAuth — reusable pattern for future static apps
- 100+ PDF tools covering all required functions and more

### Negative

- AGPL-3.0 requires the repository to remain public (or pay $49 for commercial license)
- BentoPDF is a single-maintainer open-source project — upstream abandonment risk
- oauth2-proxy introduces a new authentication pattern not used by other Cainmani apps
- No offline capability (requires browser access to the server)

### Risks & Mitigation

| Risk | Likelihood | Mitigation |
|---|---|---|
| Upstream project abandoned | Low | Fork is self-contained. Static files continue to work indefinitely. No server-side dependencies to maintain. |
| AGPL compliance violation (secret committed to public repo) | Low | GitHub Secret Scanning enabled, TruffleHog in CI, pre-commit hooks (SOP-08). Secrets only in .env (gitignored) and GitHub Secrets. |
| oauth2-proxy vulnerability | Low | Pin to specific image tag (v7.7.1), monitor CVEs, update as part of regular dependency review. |
| Keycloak audience mapper misconfigured | Medium | Documented in .env.prod.example setup instructions. Verified during staging test before production deploy. |

## References

- BentoPDF: https://github.com/alam00000/bentopdf
- BentoPDF licensing: https://www.bentopdf.com/licensing.html
- XDA comparison (BentoPDF vs Stirling-PDF): https://www.xda-developers.com/bentopdf-over-stirlingpdf-as-primary-pdf-toolkit/
- oauth2-proxy Traefik integration: https://oauth2-proxy.github.io/oauth2-proxy/configuration/integrations/traefik/
- oauth2-proxy Keycloak OIDC provider: https://oauth2-proxy.github.io/oauth2-proxy/configuration/providers/keycloak_oidc/
- Cainmani SOP-11 Architecture Standards: https://github.com/Cainmani/docs-sop/blob/main/docs/11-architecture-standards/README.md
