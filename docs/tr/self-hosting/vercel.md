# Vercel'e Dağıtım

[Vercel](https://vercel.com), statik siteler için en kolay dağıtım deneyimini sunar.

## Tek Tıkla Dağıtım

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/alam00000/bentopdf)

## Elle Dağıtım

### Adım 1: Depoyu Fork'layın

[bentopdf/bentopdf](https://github.com/alam00000/bentopdf) deposunu GitHub hesabınıza fork'layın.

### Adım 2: Vercel'e Aktarın

1. [vercel.com/new](https://vercel.com/new) adresine gidin
2. Fork'ladığınız depoyu seçin
3. Projeyi yapılandırın:

| Ayar             | Değer           |
| ---------------- | --------------- |
| Framework Preset | Vite            |
| Build Command    | `npm run build` |
| Output Directory | `dist`          |
| Install Command  | `npm install`   |

### Adım 3: Ortam Değişkenleri (İsteğe Bağlı)

Gerekirse bunları ekleyin:

| Değişken                | Açıklama                                                      |
| ----------------------- | ------------------------------------------------------------- |
| `SIMPLE_MODE`           | Asgari arayüz için `true` yapın                               |
| `VITE_BRAND_NAME`       | Özel marka adı ("BentoPDF" yerine geçer)                      |
| `VITE_BRAND_LOGO`       | `public/` dizinine göre logo yolu (örn. `images/my-logo.svg`) |
| `VITE_FOOTER_TEXT`      | Özel alt bilgi/telif hakkı metni                              |
| `VITE_DEFAULT_LANGUAGE` | Varsayılan arayüz dili (örn. `fr`, `de`, `es`)                |

### Adım 4: Dağıtın

"Deploy"a tıklayın ve derlemenin tamamlanmasını bekleyin.

## Özel Alan Adı

1. Proje ayarlarınıza gidin
2. "Domains" bölümüne gidin
3. Özel alan adınızı ekleyin
4. DNS'i yönergelere göre yapılandırın

## Sınırlamalar

::: warning Büyük Dosyalar
Vercel'in sunucusuz işlevlerinin 50MB sınırı vardır. BentoPDF statik bir site olduğu için bu sizi etkilememelidir, ancak WASM modülleri büyüktür (toplam ~100MB). Bunların `/public` klasöründen sunulduğundan emin olun.
:::

## Sorun Giderme

### Derleme Zaman Aşımı

Derlemeler zaman aşımına uğruyorsa şunu deneyin:

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### Yenilemede 404

SPA yönlendirmesi için bir `vercel.json` ekleyin:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Word/ODT/Excel'den PDF'ye Dönüştürme Çalışmıyor

LibreOffice WASM dönüştürmeleri `SharedArrayBuffer` gerektirir; bunun için tüm sayfalarda şu yanıt başlıkları gerekir:

- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Opener-Policy: same-origin`

Önceden sıkıştırılmış `.wasm.gz` ve `.data.gz` dosyalarının da tarayıcının bunları açabilmesi için `Content-Encoding: gzip` başlığına ihtiyacı vardır.

Bunları `vercel.json` dosyanıza ekleyin:

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

Doğrulamak için DevTools Konsolu'nu açın ve `console.log(window.crossOriginIsolated)` komutunu çalıştırın: `true` döndürmelidir.
