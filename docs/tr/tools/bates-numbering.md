---
title: Bates Numaralandırma
description: Özelleştirilebilir şablonlar, dolgu, yazı tipleri ve konumlandırmayla bir veya birden fazla PDF'ye Bates numaraları uygulayın.
---

# Bates Numaralandırma

Bates numaralandırma, PDF'lerinizin her sayfasına sıralı tanımlayıcılar basar. Hukuki süreçlerde, denetimlerde ve uyumluluk iş akışlarında belgeleri etiketlemenin standart yöntemidir. Bu araç birden fazla dosyayı ve özelleştirilebilir şablonları destekler; ayrı ayrı numaralandırılmış PDF'ler veya tek bir ZIP arşivi üretir.

## Nasıl Çalışır

1. Bir veya daha fazla PDF dosyası yükleyin. Aynı anda birden fazla dosya sürükleyebilirsiniz.
2. Bir stil ön ayarı seçin veya özel bir şablon oluşturun.
3. Konumu, yazı tipini, boyutu, rengi ve başlangıç numaralarını yapılandırın.
4. İşlemek için **Bates Numaralarını Uygula**'ya tıklayın.
5. Tek dosya doğrudan indirilir. Birden fazla dosya ZIP arşivi olarak indirilir.

## Seçenekler

- **Stil Ön Ayarı** -- Yerleşik biçimlerden birini seçin:
  - Exhibit + Case + Bates + Page (örn. "Exhibit 1 Case XYZ 000001 Page 1")
  - Exhibit + Case + Bates (sayfa numarasız)
  - Case + Bates
  - Yalnızca Bates Numarası (örn. "000001")
  - Özel (kendi şablonunuzu yazın)
- **Stili Özelleştir** -- Yer tutucular kullanan bir şablon dizesi: `[BATES]`, `[PAGE]`, `[FILE]`, `[FILENAME]`.
- **Bates Dolgusu** -- Sıfır dolgulu Bates numaraları için basamak sayısı (3 ile 6 arası). Yalnızca özel modda görünür.
- **Konum** -- Üst bilgi veya Alt bilgi; Sol, Orta veya Sağ.
- **Bates Başlangıcı** -- İlk Bates numarası. Varsayılan 1'dir. Numaralandırma dosyalar arasında devam eder.
- **Dosya Sayacı Başlangıcı** -- `[FILE]` yer tutucusu için başlangıç numarası.
- **Yazı Tipi** -- Helvetica, Times New Roman veya Courier.
- **Yazı Boyutu** -- Basılan metnin boyutu.
- **Renk** -- Bates numarası metni için renk seçici.

## Özellikler

- Bates numaralarının yüklenen tüm dosyalarda nasıl görüneceğini gösteren canlı önizleme
- Belgeler arasında kesintisiz numaralandırmayla çoklu dosya desteği
- Numaralandırma sırasını belirlemek için sürükle-bırak dosya yeniden sıralama
- Altı konum seçeneği (üst bilgi/alt bilgi, sol/orta/sağ)
- Farklı sayfa boyutlarına uyan uyarlanabilir kenar boşluğu hesaplaması
- Çoklu dosya toplu işlemleri için ZIP çıktısı
- Azami esneklik için şablon yer tutucuları

## Kullanım Alanları

- Dava keşif belgelerine sıralı delil numaraları basmak
- Onlarca dosyaya yayılan denetim kanıt paketlerini numaralandırmak
- Uyumluluk belgelerine düzenleyici referans numaraları uygulamak
- Patent başvurusu eklerini davaya özgü tanımlayıcılarla etiketlemek

## İpuçları

- İşlemeden önce sıralarını değiştirmek için dosya listesindeki dosyaları sürükleyin. Bates numaralandırma sırası bu sırayı izler.
- Basılan metne özgün dosya adını eklemek için `[FILENAME]` yer tutucusunu kullanın; bu, sayfaları kaynak belgelere kadar izlemenize yardımcı olur.
- Önizleme kutusu ayarları değiştirdikçe gerçek zamanlı güncellenir, böylece işlemeden önce biçimi doğrulayabilirsiniz.

## İlgili Araçlar

- [Sayfa Numaraları](./page-numbers)
- [Sayfa etiketleri ekle](./add-page-labels)
- [Üst Bilgi & Alt Bilgi](./header-footer)
