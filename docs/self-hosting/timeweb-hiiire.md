# Deploy hiiirePDF on Timeweb App

This fork can be deployed as a branded public PDF tool at `https://pdf.hiiire.com`.

## Recommended build

Use the dedicated build command:

```bash
npm run build:hiiire
```

It sets the Hiiire defaults before building:

| Variable                     | Value                                      |
| ---------------------------- | ------------------------------------------ |
| `SITE_URL`                   | `https://pdf.hiiire.com`                   |
| `VITE_BRAND_NAME`            | `hiiirePDF`                                |
| `VITE_BRAND_LOGO`            | `images/hiiire-pdf-mark.svg`               |
| `VITE_DEFAULT_LANGUAGE`      | `ru`                                       |
| `VITE_USE_CDN`               | `true`                                     |
| `VITE_SOURCE_REPOSITORY_URL` | `https://github.com/vladkolchik/hiiirepdf` |

Timeweb can either run this command directly or use `npm ci` as the install command and `npm run build:hiiire` as the build command.

## Static output

The production files are written to `dist/`. hiiirePDF is a client-side app, so the Timeweb app only needs to serve static files from that directory.

## Custom environment

Every default can still be overridden in Timeweb environment variables. The most important one is `SITE_URL`, because it controls canonical links, sitemap URLs, and `robots.txt`.

## License note

This deployment uses the public commercial-build path described by hiiirePDF. Keep the commercial license purchase record outside the repository.
