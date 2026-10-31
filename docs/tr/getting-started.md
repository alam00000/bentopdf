# Başlarken

BentoPDF'e hoş geldiniz! Bu rehber hızlıca çalışır hale gelmenize yardımcı olacak.

## BentoPDF Nedir?

BentoPDF, **tamamen tarayıcınızda** çalışan ücretsiz, açık kaynaklı, gizlilik odaklı bir PDF araç setidir. Dosyalarınız cihazınızdan asla çıkmaz. Tüm işlemler WebAssembly (WASM) teknolojisiyle yerel olarak yapılır.

## Hızlı Başlangıç

### Seçenek 1: Barındırılan Sürümü Kullanın

BentoPDF'i anında kullanmak için [bentopdf.com](https://www.bentopdf.com) adresini ziyaret edin, kurulum gerekmez.

### Seçenek 2: Docker ile Kendi Sunucunuzda Barındırın

> [!IMPORTANT]
> Office dosya dönüştürme için `SharedArrayBuffer` gerekir ve bunun için şunların ikisi de gereklidir:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
> - güvenli bir bağlam
>
> `http://localhost` yerel testler için çalışır, çünkü tarayıcılar geri döngü adresine güvenir. `http://192.168.x.x` gibi yerel ağ IP'lerine genellikle güvenmez, bu yüzden ağınızdaki diğer cihazlardan erişirken Word/Excel/PowerPoint dönüştürmeleri HTTPS gerektirir.

```bash
# Pull and run the Docker image (self-hosted build)
docker run -d -p 3000:8080 ghcr.io/alam00000/bentopdf-simple:latest

# Or use Docker Compose
curl -O https://raw.githubusercontent.com/alam00000/bentopdf/main/docker-compose.yml
docker compose up -d
```

> [!TIP]
> BentoPDF iki sürüm olarak sunulur: dahili/ekip/kurum dağıtımları için **Kendi Sunucunda Barındırma sürümü** (`bentopdf-simple`, yukarıda kullanılan) ve bentopdf.com'un kendisi ile herkese açık dağıtım yapan ticari lisans sahipleri tarafından kullanılan **Ticari sürüm** (`bentopdf:latest`). İkisi de aynı PDF araçlarını sunar. Ticari sürüm bentopdf.com ana sayfa bölümünü, SSS'yi, kullanıcı yorumlarını ve alt bilgiyi ekler. Emin değilseniz Kendi Sunucunda Barındırma sürümünü kullanın.

Ardından tarayıcınızda `http://localhost:3000` adresini açın.

> [!NOTE]
> İnternetten yalıtılmış (air-gapped) bir OCR dağıtımı hazırlıyorsanız, Tesseract worker, çekirdek çalışma zamanı ve traineddata dosyalarına ek olarak OCR metin katmanı yazı tiplerini de kendi ağınızda barındırmanız gerekir. Tam kurulum, `VITE_OCR_FONT_BASE_URL` ve paketle gelen `ocr-fonts/` dizini dahil, [Kendi Sunucunda Barındırma](/tr/self-hosting/) sayfasında anlatılmıştır.

### Seçenek 3: Kaynaktan Derleyin

```bash
# Clone the repository
git clone https://github.com/alam00000/bentopdf.git
cd bentopdf

# Install dependencies
npm install

# Start development server
npm run dev
```

## Özelliklere Genel Bakış

| Kategori                | Araçlar                                                                  |
| ----------------------- | ------------------------------------------------------------------------ |
| **PDF'e Dönüştür**      | Word, Excel, PowerPoint, Görseller, Markdown, EPUB, MOBI ve daha fazlası |
| **PDF'den Dönüştür**    | JPG, PNG, Metin, Excel, SVG ve daha fazlası                              |
| **Düzenle ve Not Ekle** | İmzala, Vurgula, Karart, Form Doldur, Damga Ekle                         |
| **Düzenle (Sayfalar)**  | Birleştir, Böl, Döndür, Sayfa Sil, Yeniden Sırala                        |
| **Optimize Et**         | Sıkıştır, Onar, Düzleştir, OCR                                           |
| **Güvenlik**            | Şifrele, Şifreyi Kaldır, Kısıtlamaları Kaldır                            |

## Tarayıcı Desteği

BentoPDF modern tarayıcılarda en iyi şekilde çalışır:

- ✅ Chrome/Edge 90+
- ✅ Firefox 90+
- ✅ Safari 15+

## Sonraki Adımlar

- [Tüm araçları keşfedin](/tr/tools/)
- [BentoPDF'i kendi sunucunuzda barındırın](/tr/self-hosting/)
- [Projeye katkıda bulunun](/tr/contributing)
