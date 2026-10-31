# Deploy ke Netlify

[Netlify](https://netlify.com) menyediakan hosting situs statis yang sangat baik dengan paket gratis yang lapang.

## Deploy Sekali Klik

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/alam00000/bentopdf)

## Deploy Manual

### Langkah 1: Hubungkan Repositori

1. Masuk ke [Netlify](https://app.netlify.com)
2. Klik "Add new site" → "Import an existing project"
3. Hubungkan akun GitHub Anda
4. Pilih fork BentoPDF Anda

### Langkah 2: Atur Pengaturan Build

| Pengaturan        | Nilai           |
| ----------------- | --------------- |
| Perintah build    | `npm run build` |
| Direktori publish | `dist`          |
| Versi Node        | 18+             |

### Langkah 3: Deploy

Klik "Deploy site" dan tunggu build selesai.

## File Konfigurasi

Buat `netlify.toml` di root proyek Anda:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

# Required security headers for SharedArrayBuffer (used by LibreOffice WASM)
[[headers]]
  for = "/*"
  [headers.values]
    Cross-Origin-Embedder-Policy = "require-corp"
    Cross-Origin-Opener-Policy = "same-origin"
    Cross-Origin-Resource-Policy = "cross-origin"

# Pre-compressed LibreOffice WASM binary - must be served with Content-Encoding
[[headers]]
  for = "/libreoffice-wasm/soffice.wasm.gz"
  [headers.values]
    Content-Type = "application/wasm"
    Content-Encoding = "gzip"
    Cache-Control = "public, max-age=31536000, immutable"

# Pre-compressed LibreOffice WASM data - must be served with Content-Encoding
[[headers]]
  for = "/libreoffice-wasm/soffice.data.gz"
  [headers.values]
    Content-Type = "application/octet-stream"
    Content-Encoding = "gzip"
    Cache-Control = "public, max-age=31536000, immutable"

# Cache other WASM files
[[headers]]
  for = "*.wasm"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
    Content-Type = "application/wasm"

# SPA routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

::: warning Penting
Header `Cross-Origin-Embedder-Policy` dan `Cross-Origin-Opener-Policy` diperlukan untuk konversi Word/ODT/Excel/PowerPoint ke PDF. Tanpa keduanya, `SharedArrayBuffer` tidak tersedia dan mesin LibreOffice WASM gagal diinisialisasi.

Header `Content-Encoding: gzip` pada file `.wasm.gz` dan `.data.gz` memberi tahu browser untuk mendekompresinya secara otomatis. Tanpa header ini, browser menerima byte gzip mentah dan kompilasi WASM gagal.
:::

## Variabel Lingkungan

Atur variabel ini di Site settings → Environment variables:

| Variabel                | Deskripsi                                                        |
| ----------------------- | ---------------------------------------------------------------- |
| `SIMPLE_MODE`           | Atur ke `true` untuk build minimal                               |
| `VITE_BRAND_NAME`       | Nama merek kustom (menggantikan "BentoPDF")                      |
| `VITE_BRAND_LOGO`       | Path logo relatif terhadap `public/` (mis. `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | Teks footer/hak cipta kustom                                     |
| `VITE_DEFAULT_LANGUAGE` | Bahasa UI default (mis. `fr`, `de`, `es`)                        |

## Domain Kustom

1. Buka Site settings → Domain management
2. Klik "Add custom domain"
3. Ikuti petunjuk konfigurasi DNS

## Large Media

Untuk file WASM berukuran besar, pertimbangkan mengaktifkan [Netlify Large Media](https://docs.netlify.com/large-media/overview/):

```bash
netlify lm:setup
git lfs track "*.wasm"
```

## Pemecahan Masalah

### Word/ODT/Excel ke PDF Macet di 55%

Jika konversi dokumen macet di 55%, buka Konsol DevTools dan periksa:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

Jika `crossOriginIsolated` bernilai `false`, header COEP/COOP dari `netlify.toml` Anda tidak diterapkan. Pastikan file berada di root proyek Anda lalu deploy ulang.

Jika Anda melihat `expected magic word 00 61 73 6d, found 1f 8b 08 08` di konsol, berarti file `.wasm.gz` tidak memiliki header `Content-Encoding: gzip`. Pastikan blok `[[headers]]` untuk `soffice.wasm.gz` dan `soffice.data.gz` ada di `netlify.toml` Anda.

### Build Gagal

Periksa kompatibilitas versi Node:

```toml
[build.environment]
  NODE_VERSION = "20"
```

### Pemuatan Awal Lambat

Aktifkan optimasi aset di Site settings → Build & deploy → Asset optimization.
