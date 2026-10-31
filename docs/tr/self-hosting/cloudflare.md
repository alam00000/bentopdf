# Cloudflare Pages'e Dağıtım

[Cloudflare Pages](https://pages.cloudflare.com), sınırsız bant genişliğiyle hızlı, küresel statik site barındırma sunar.

## Hızlı Dağıtım

1. [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages) sayfasına gidin
2. "Create a project" düğmesine tıklayın
3. GitHub deponuzu bağlayın

## Derleme Yapılandırması

| Ayar                   | Değer           |
| ---------------------- | --------------- |
| Framework preset       | None            |
| Build command          | `npm run build` |
| Build output directory | `dist`          |
| Root directory         | `/`             |

## Ortam Değişkenleri

Bunları Settings → Environment variables bölümüne ekleyin:

| Değişken                | Değer                                             |
| ----------------------- | ------------------------------------------------- |
| `NODE_VERSION`          | `18`                                              |
| `SIMPLE_MODE`           | `false` (isteğe bağlı)                            |
| `VITE_BRAND_NAME`       | Özel marka adı (isteğe bağlı)                     |
| `VITE_BRAND_LOGO`       | `public/` klasörüne göre logo yolu (isteğe bağlı) |
| `VITE_FOOTER_TEXT`      | Özel alt bilgi/telif hakkı metni (isteğe bağlı)   |
| `VITE_DEFAULT_LANGUAGE` | Varsayılan arayüz dili, örn. `fr` (isteğe bağlı)  |

## Yapılandırma Dosyası

`public` klasörünüzde `_headers` dosyasını oluşturun:

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

::: warning Önemli
`Cross-Origin-Embedder-Policy` ve `Cross-Origin-Opener-Policy` başlıkları Word/ODT/Excel/PowerPoint'ten PDF'e dönüştürmeler için gereklidir. Bunlar olmadan `SharedArrayBuffer` kullanılamaz ve LibreOffice WASM motoru başlatılamaz.
:::

SPA yönlendirmesi için `_redirects` dosyasını oluşturun:

```
/*    /index.html   200
```

## Özel Alan Adı

1. Pages projenize gidin
2. "Custom domains" düğmesine tıklayın
3. Alan adınızı ekleyin
4. Alan adı Cloudflare'deyse Cloudflare DNS'i otomatik yapılandırır

## Avantajlar

- **Ücretsiz sınırsız bant genişliği**
- 300'den fazla uç noktası olan **küresel CDN**
- **Otomatik HTTPS**
- Pull request'ler için **önizleme dağıtımları**
- **Hızlı derlemeler**

## Sorun Giderme

### Büyük Dosya Yüklemeleri

Cloudflare Pages 25 MB'a kadar dosyaları destekler. WASM modüllerinde sorun olmaması gerekir, ancak sınırlara takılırsanız şunu düşünün:

```bash
# Split large files during build
npm run build
```

### Worker Boyut Sınırları

Gelişmiş yönlendirme için Cloudflare Workers kullanıyorsanız, ücretsiz planlardaki 1 MB sınırını göz önünde bulundurun.

## CORS Proxy Worker (Dijital İmzalar için)

Dijital İmza aracı, sertifika zincirlerini almak için bir CORS proxy gerektirir. Pakete dahil worker'ı dağıtın:

```bash
cd cloudflare
npx wrangler login
npx wrangler deploy
```

### Güvenlik Özellikleri

| Özellik                 | Açıklama                                   |
| ----------------------- | ------------------------------------------ |
| **URL Kısıtlamaları**   | Yalnızca sertifika URL'lerine izin verilir |
| **Dosya Boyutu Sınırı** | İstek başına en fazla 10MB                 |
| **Hız Sınırlama**       | 60 istek/IP/dk (KV gerekir)                |
| **Özel IP Engelleme**   | localhost ve dahili IP'leri engeller       |

### Hız Sınırlamayı Etkinleştirme

```bash
# Create KV namespace
npx wrangler kv namespace create "RATE_LIMIT_KV"

# Add to wrangler.toml with returned ID:
# [[kv_namespaces]]
# binding = "RATE_LIMIT_KV"
# id = "YOUR_ID"

npx wrangler deploy
```

### Proxy URL ile Derleme

```bash
VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
```

Veya Docker ile:

```bash
export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
DOCKER_BUILDKIT=1 docker build \
  --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
  -t your-bentopdf .
```

> **Not:** HMAC imza kurulumu için [README](https://github.com/alam00000/bentopdf#digital-signature-cors-proxy-required) dosyasına bakın.
