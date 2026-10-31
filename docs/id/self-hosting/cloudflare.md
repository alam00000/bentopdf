# Deploy ke Cloudflare Pages

[Cloudflare Pages](https://pages.cloudflare.com) menawarkan hosting situs statis global yang cepat dengan bandwidth tak terbatas.

## Deploy Cepat

1. Buka [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages)
2. Klik "Create a project"
3. Hubungkan repositori GitHub Anda

## Konfigurasi Build

| Pengaturan             | Nilai           |
| ---------------------- | --------------- |
| Framework preset       | Tidak ada       |
| Build command          | `npm run build` |
| Build output directory | `dist`          |
| Root directory         | `/`             |

## Environment Variable

Tambahkan ini di Settings → Environment variables:

| Variabel                | Nilai                                           |
| ----------------------- | ----------------------------------------------- |
| `NODE_VERSION`          | `18`                                            |
| `SIMPLE_MODE`           | `false` (opsional)                              |
| `VITE_BRAND_NAME`       | Nama merek kustom (opsional)                    |
| `VITE_BRAND_LOGO`       | Path logo relatif terhadap `public/` (opsional) |
| `VITE_FOOTER_TEXT`      | Teks footer/hak cipta kustom (opsional)         |
| `VITE_DEFAULT_LANGUAGE` | Bahasa UI default, mis. `fr` (opsional)         |

## File Konfigurasi

Buat `_headers` di folder `public` Anda:

```
# Required security headers for SharedArrayBuffer (used by LibreOffice WASM)
/*
  Cross-Origin-Embedder-Policy: require-corp
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Resource-Policy: cross-origin

# Pre-compressed LibreOffice WASM binary
/libreoffice-wasm/soffice.wasm.gz
  Content-Type: application/wasm
  Content-Encoding: gzip
  Cache-Control: public, max-age=31536000, immutable

# Pre-compressed LibreOffice WASM data
/libreoffice-wasm/soffice.data.gz
  Content-Type: application/octet-stream
  Content-Encoding: gzip
  Cache-Control: public, max-age=31536000, immutable

# Cache WASM files aggressively
/*.wasm
  Cache-Control: public, max-age=31536000, immutable
  Content-Type: application/wasm

# Service worker
/sw.js
  Cache-Control: no-cache
```

::: warning Penting
Header `Cross-Origin-Embedder-Policy` dan `Cross-Origin-Opener-Policy` diperlukan untuk konversi Word/ODT/Excel/PowerPoint ke PDF. Tanpa keduanya, `SharedArrayBuffer` tidak tersedia dan mesin LibreOffice WASM gagal diinisialisasi.
:::

Buat `_redirects` untuk routing SPA:

```
/*    /index.html   200
```

## Domain Kustom

1. Buka proyek Pages Anda
2. Klik "Custom domains"
3. Tambahkan domain Anda
4. Cloudflare akan mengonfigurasi DNS secara otomatis jika domain berada di Cloudflare

## Keunggulan

- **Bandwidth tak terbatas gratis**
- **CDN global** dengan 300+ lokasi edge
- **HTTPS otomatis**
- **Deployment pratinjau** untuk pull request
- **Build cepat**

## Pemecahan Masalah

### Unggahan File Besar

Cloudflare Pages mendukung file hingga 25 MB. Modul WASM seharusnya aman, tetapi jika Anda mencapai batas, pertimbangkan:

```bash
# Split large files during build
npm run build
```

### Batas Ukuran Worker

Jika menggunakan Cloudflare Workers untuk routing lanjutan, perhatikan batas 1 MB untuk paket gratis.

## Worker CORS Proxy (Untuk Tanda Tangan Digital)

Alat Tanda Tangan Digital memerlukan CORS proxy untuk mengambil rantai sertifikat. Deploy worker yang disertakan:

```bash
cd cloudflare
npx wrangler login
npx wrangler deploy
```

### Fitur Keamanan

| Fitur                     | Deskripsi                           |
| ------------------------- | ----------------------------------- |
| **Pembatasan URL**        | Hanya URL sertifikat yang diizinkan |
| **Batas Ukuran File**     | Maks 10MB per permintaan            |
| **Pembatasan Laju**       | 60 req/IP/menit (memerlukan KV)     |
| **Pemblokiran IP Privat** | Memblokir localhost, IP internal    |

### Aktifkan Pembatasan Laju

```bash
# Create KV namespace
npx wrangler kv namespace create "RATE_LIMIT_KV"

# Add to wrangler.toml with returned ID:
# [[kv_namespaces]]
# binding = "RATE_LIMIT_KV"
# id = "YOUR_ID"

npx wrangler deploy
```

### Build dengan URL Proxy

```bash
VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
```

Atau dengan Docker:

```bash
export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
DOCKER_BUILDKIT=1 docker build \
  --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
  -t your-bentopdf .
```

> **Catatan:** Lihat [README](https://github.com/alam00000/bentopdf#digital-signature-cors-proxy-required) untuk penyiapan tanda tangan HMAC.
