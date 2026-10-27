# Commercial License

BentoPDF is dual-licensed under **AGPL-3.0** (for open-source projects) and a **Commercial License** (for proprietary/closed-source applications).

::: tip Full Details
For complete licensing information, delivery details, AGPL component notices, and invoicing, visit our [Licensing Page](https://www.bentopdf.com/licensing).
:::

## Get a Commercial License

**[Get Lifetime License for $79](https://buy.polar.sh/polar_cl_ThDfffbl733x7oAodcIryCzhlO57ZtcWPq6HJ1qMChd)**. A one-time purchase that includes all future updates forever.

## When Do You Need a Commercial License?

| Use Case                                    | License Required       |
| ------------------------------------------- | ---------------------- |
| Open-source project with public source code | AGPL-3.0 (Free)        |
| Internal company tool (not distributed)     | AGPL-3.0 (Free)        |
| Proprietary/closed-source application       | **Commercial License** |
| SaaS product without source code disclosure | **Commercial License** |
| Redistributing without AGPL compliance      | **Commercial License** |

## Delivery & Licensing Model

- **No license key is required or provided.** BentoPDF intentionally does not use license keys to streamline deployment and reduce operational friction for users.
- Upon purchase, users receive a ZIP archive containing the complete BentoPDF source code and binaries.
- The source code provided is identical to the code published in our public open-source repository.

**GitHub Repository:** [github.com/alam00000/bentopdf](https://github.com/alam00000/bentopdf)

## Important Notice on Third-Party Components

::: info AGPL Components — Pre-configured via CDN
BentoPDF **does not bundle** AGPL-licensed processing libraries in its source code. These components are loaded at runtime from CDN URLs that are **pre-configured by default** — all features work out of the box with zero setup.

| Component       | License  | Status                 |
| --------------- | -------- | ---------------------- |
| **PyMuPDF**     | AGPL-3.0 | Pre-configured via CDN |
| **Ghostscript** | AGPL-3.0 | Pre-configured via CDN |
| **CoherentPDF** | AGPL-3.0 | Pre-configured via CDN |

WASM module URLs are configured via environment variables at build time (`.env.production`). The defaults point to jsDelivr CDN. For custom deployments (air-gapped, self-hosted), you can override via environment variables, Docker build args, or per-user via **Advanced Settings** in the UI.

See [Self-Hosting > WASM Configuration](/uk/self-hosting/#конфігурація-wasm-компоненти-під-agpl) for details.

This approach ensures:

- BentoPDF's core code remains under its dual-license (AGPL-3.0 / Commercial)
- WASM binaries are loaded at runtime, not included in the source
- Clear compliance boundaries for commercial users
  :::

::: tip Commercial License & AGPL Features
The commercial license covers BentoPDF's own code. If you configure and use AGPL components (PyMuPDF, Ghostscript, CoherentPDF), you must still comply with their respective AGPL-3.0 license terms, which may require source code disclosure if you distribute modified versions.
:::

## Invoicing

- Payments are handled by [Polar](https://polar.sh), which automatically emails an invoice after purchase.
- Polar handles VAT invoices for businesses in applicable regions. Select **"I'm purchasing as a business"** at checkout and enter your billing address and Tax/VAT number.

**Questions?** Contact [contact@bentopdf.com](mailto:contact@bentopdf.com) with your purchase details.

## What's Included

| Feature                       | Included       |
| ----------------------------- | -------------- |
| Full source code              | ✅             |
| All 50+ PDF tools             | ✅             |
| Self-hosting rights           | ✅             |
| Lifetime updates              | ✅             |
| Remove branding (Simple Mode) | ✅             |
| Hyper Compress (bundled)      | ✅             |
| Commercial support            | ✅ (via email) |
| Priority feature requests     | ✅             |

## Bundled Components

**Building on BentoPDF? Hyper Compress is included.** The BentoPDF commercial license includes [Hyper Compress](https://github.com/alam00000/bentopdf-hyper-compress) as a bundled component, so you don't need a separate Hyper Compress license to use it inside BentoPDF.

You may use a bundled component only through BentoPDF's own tools, as part of the BentoPDF application you deploy, including your branded or modified version of BentoPDF. You may not:

- call it from your own code through an API, SDK, command line, or headless or server process;
- separate, repackage or sublicense it, or use it in other software;
- offer a product or service whose main purpose is what the bundled component does, such as a compression-only app or website;
- modify the bundled component itself.

Any other use requires a separate [Hyper Compress license](https://www.bentopdf.com/hyper-compress#pricing), from $99/year. [Kura](https://github.com/alam00000/bentopdf-kura) is not a bundled component and is always licensed separately, with [commercial licenses](https://www.bentopdf.com/kura#pricing) from $99/year.

## FAQ

### Do I need a license key to use BentoPDF?

No. BentoPDF does not use license keys. The commercial license grants you legal rights to use the software in proprietary applications.

### Can I use BentoPDF in my SaaS product?

Yes, with a commercial license. Without it, you must comply with AGPL-3.0, which requires you to make your full source code available to users.

### Does the commercial license cover Hyper Compress or Kura?

Hyper Compress, yes, when you use it through BentoPDF. It is included as a [bundled component](#bundled-components). Using the engine on its own, or inside other software, needs a separate [Hyper Compress license](https://www.bentopdf.com/hyper-compress#pricing), from $99/year. Kura is not included and is licensed separately, from [$99/year](https://www.bentopdf.com/kura#pricing).

### What about the AGPL components?

Components like CoherentPDF are licensed under AGPL v3 and remain under that license. The commercial license covers BentoPDF's own code but does not override third-party AGPL obligations.

### How do I get an invoice?

Polar emails your invoice automatically after purchase. For a VAT invoice, select "I'm purchasing as a business" at checkout. If you need anything else, email [contact@bentopdf.com](mailto:contact@bentopdf.com) with your purchase details.
