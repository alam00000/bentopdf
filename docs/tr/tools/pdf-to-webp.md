---
title: PDF'den WebP'ye
description: PDF sayfalarını ayarlanabilir kalitede WebP görsellerine dönüştürün. Karşılaştırılabilir görsel kalitede JPG'den daha küçük dosya boyutları.
---

# PDF'den WebP'ye

Bir PDF'in her sayfasını WebP görseline dönüştürür. WebP, aynı algılanan kalitede genellikle JPG'den %25-35 daha küçük dosyalar üretir; bu da onu web kullanımı için güçlü bir seçim yapar.

## Nasıl Çalışır

1. Bırakma alanına tıklayarak veya bir dosyayı üzerine sürükleyerek bir PDF yükleyin.
2. **Görüntü Kalitesi** kaydırıcısını ayarlayın.
3. Dosyayı işlemek için **Dönüştür** düğmesine tıklayın.
4. Tek bir `.webp` dosyası veya bir ZIP arşivi otomatik olarak iner.

## Seçenekler

- **Görüntü Kalitesi**: %0 ile %100 arasında bir kaydırıcı (varsayılan %85). Kayıplı sıkıştırma düzeyini denetler. Yüksek değerler daha fazla ayrıntıyı korur.

Sayfalar dahili olarak 2x ölçekte işlenir ve PDF'in özgün boyutlarının kabaca iki katı boyutunda görseller üretir.

## Çıktı Biçimi

- **Tek sayfa**: `filename.webp`
- **Birden fazla sayfa**: `page_1.webp`, `page_2.webp` vb. içeren `filename_webps.zip`

## Kullanım Alanları

- Bant genişliğinin önemli olduğu web siteleri için sayfa önizlemeleri hazırlamak.
- Broşürlerin veya el ilanlarının sosyal medya için hafif görsel sürümlerini oluşturmak.
- Çok sayfalı belgeleri web için optimize edilmiş bir görsel setine toplu dönüştürmek.

## İpuçları

- WebP tüm modern tarayıcılarda desteklenir. Eski uyumluluk için [PDF'den JPG'ye](./pdf-to-jpg) aracına geçin.
- %80-85 kalite genellikle ekranda özgünden ayırt edilemez ve dosya boyutlarını küçük tutar.

## İlgili Araçlar

- [PDF'den JPG'ye](./pdf-to-jpg)
- [PDF'den PNG'ye](./pdf-to-png)
- [PDF'den BMP'ye](./pdf-to-bmp)
