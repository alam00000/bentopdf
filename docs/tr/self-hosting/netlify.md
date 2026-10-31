# Netlify'a Dağıtım

[Netlify](https://netlify.com), cömert bir ücretsiz katmanla mükemmel statik site barındırma sunar.

## Tek Tıkla Dağıtım

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/alam00000/bentopdf)

## Elle Dağıtım

### Adım 1: Depoyu Bağlayın

1. [Netlify](https://app.netlify.com)'a giriş yapın
2. "Add new site" → "Import an existing project" seçeneğine tıklayın
3. GitHub hesabınızı bağlayın
4. BentoPDF fork'unuzu seçin

### Adım 2: Derleme Ayarlarını Yapılandırın

| Ayar           | Değer           |
| -------------- | --------------- |
| Derleme komutu | `npm run build` |
| Yayın dizini   | `dist`          |
| Node sürümü    | 18+             |

### Adım 3: Dağıtın

"Deploy site"a tıklayın ve derlemenin bitmesini bekleyin.

## Yapılandırma Dosyası

Proje kök dizininizde `netlify.toml` oluşturun:

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

::: warning Önemli
`Cross-Origin-Embedder-Policy` ve `Cross-Origin-Opener-Policy` başlıkları Word/ODT/Excel/PowerPoint'ten PDF'ye dönüştürmeler için gereklidir. Bunlar olmadan `SharedArrayBuffer` kullanılamaz ve LibreOffice WASM motoru başlatılamaz.

`.wasm.gz` ve `.data.gz` dosyalarındaki `Content-Encoding: gzip` başlıkları, tarayıcıya bunları otomatik olarak açmasını söyler. Bunlar olmadan tarayıcı ham gzip baytlarını alır ve WASM derlemesi başarısız olur.
:::

## Ortam Değişkenleri

Bunları Site settings → Environment variables bölümünde ayarlayın:

| Değişken                | Açıklama                                                      |
| ----------------------- | ------------------------------------------------------------- |
| `SIMPLE_MODE`           | Asgari derleme için `true` yapın                              |
| `VITE_BRAND_NAME`       | Özel marka adı ("BentoPDF" yerine geçer)                      |
| `VITE_BRAND_LOGO`       | `public/` dizinine göre logo yolu (örn. `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | Özel alt bilgi/telif hakkı metni                              |
| `VITE_DEFAULT_LANGUAGE` | Varsayılan arayüz dili (örn. `fr`, `de`, `es`)                |

## Özel Alan Adı

1. Site settings → Domain management bölümüne gidin
2. "Add custom domain"e tıklayın
3. DNS yapılandırma yönergelerini izleyin

## Büyük Medya

Büyük WASM dosyaları için [Netlify Large Media](https://docs.netlify.com/large-media/overview/) özelliğini etkinleştirmeyi düşünebilirsiniz:

```bash
netlify lm:setup
git lfs track "*.wasm"
```

## Sorun Giderme

### Word/ODT/Excel'den PDF'ye Dönüştürme %55'te Takılıyor

Belge dönüştürmeleri %55'te takılırsa DevTools Konsolu'nu açıp şunları kontrol edin:

```js
console.log(window.crossOriginIsolated); // should be true
console.log(typeof SharedArrayBuffer); // should be "function"
```

`crossOriginIsolated` değeri `false` ise, `netlify.toml` dosyanızdaki COEP/COOP başlıkları uygulanmıyor demektir. Dosyanın proje kök dizininizde olduğundan emin olun ve yeniden dağıtın.

Konsolda `expected magic word 00 61 73 6d, found 1f 8b 08 08` görüyorsanız, `.wasm.gz` dosyalarında `Content-Encoding: gzip` başlıkları eksiktir. `soffice.wasm.gz` ve `soffice.data.gz` için `[[headers]]` bloklarının `netlify.toml` dosyanızda olduğundan emin olun.

### Derleme Başarısız Oluyor

Node sürümü uyumluluğunu kontrol edin:

```toml
[build.environment]
  NODE_VERSION = "20"
```

### Yavaş İlk Yükleme

Site settings → Build & deploy → Asset optimization bölümünde varlık optimizasyonunu etkinleştirin.
