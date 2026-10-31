# Deploy ke Vercel

[Vercel](https://vercel.com) menawarkan pengalaman deploy paling mudah untuk situs statis.

## Deploy Sekali Klik

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/alam00000/bentopdf)

## Deploy Manual

### Langkah 1: Fork Repositori

Fork [bentopdf/bentopdf](https://github.com/alam00000/bentopdf) ke akun GitHub Anda.

### Langkah 2: Impor ke Vercel

1. Buka [vercel.com/new](https://vercel.com/new)
2. Pilih repositori hasil fork Anda
3. Konfigurasikan proyek:

| Pengaturan       | Nilai           |
| ---------------- | --------------- |
| Framework Preset | Vite            |
| Build Command    | `npm run build` |
| Output Directory | `dist`          |
| Install Command  | `npm install`   |

### Langkah 3: Variabel Lingkungan (Opsional)

Tambahkan jika diperlukan:

| Variabel                | Deskripsi                                                        |
| ----------------------- | ---------------------------------------------------------------- |
| `SIMPLE_MODE`           | Atur ke `true` untuk UI minimal                                  |
| `VITE_BRAND_NAME`       | Nama merek kustom (menggantikan "BentoPDF")                      |
| `VITE_BRAND_LOGO`       | Path logo relatif terhadap `public/` (mis. `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | Teks footer/hak cipta kustom                                     |
| `VITE_DEFAULT_LANGUAGE` | Bahasa UI default (mis. `fr`, `de`, `es`)                        |

### Langkah 4: Deploy

Klik "Deploy" dan tunggu build selesai.

## Domain Kustom

1. Buka pengaturan proyek Anda
2. Buka "Domains"
3. Tambahkan domain kustom Anda
4. Konfigurasikan DNS sesuai petunjuk

## Batasan

::: warning File Besar
Fungsi serverless Vercel memiliki batas 50MB. Karena BentoPDF adalah situs statis, ini seharusnya tidak memengaruhi Anda, tetapi modul WASM berukuran besar (total ~100MB). Pastikan modul tersebut dilayani dari folder `/public`.
:::

## Pemecahan Masalah

### Batas Waktu Build

Jika build mengalami timeout, coba:

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### 404 Saat Refresh

Tambahkan `vercel.json` untuk routing SPA:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Word/ODT/Excel ke PDF Tidak Berfungsi

Konversi LibreOffice WASM memerlukan `SharedArrayBuffer`, yang membutuhkan header respons berikut pada semua halaman:

- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Opener-Policy: same-origin`

File `.wasm.gz` dan `.data.gz` yang sudah dikompresi juga memerlukan `Content-Encoding: gzip` agar browser mendekompresinya.

Tambahkan ini ke `vercel.json` Anda:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cross-Origin-Embedder-Policy", "value": "require-corp" },
        { "key": "Cross-Origin-Opener-Policy", "value": "same-origin" },
        { "key": "Cross-Origin-Resource-Policy", "value": "cross-origin" }
      ]
    },
    {
      "source": "/libreoffice-wasm/soffice.wasm.gz",
      "headers": [
        { "key": "Content-Type", "value": "application/wasm" },
        { "key": "Content-Encoding", "value": "gzip" }
      ]
    },
    {
      "source": "/libreoffice-wasm/soffice.data.gz",
      "headers": [
        { "key": "Content-Type", "value": "application/octet-stream" },
        { "key": "Content-Encoding", "value": "gzip" }
      ]
    }
  ]
}
```

Untuk memverifikasi, buka Konsol DevTools dan jalankan `console.log(window.crossOriginIsolated)`, hasilnya seharusnya `true`.
