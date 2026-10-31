---
title: PowerPoint'ten PDF'ye
description: PowerPoint sunumlarını (PPT, PPTX) ve ODP dosyalarını slayt biçimlendirmesi korunarak PDF'e dönüştürün.
---

# PowerPoint'ten PDF'ye

Sunum dosyalarını PDF'e dönüştürün. Her slayt çıktı belgesinde bir sayfa olur; metin, görseller, şekiller ve geçişler tarayıcı tabanlı bir LibreOffice motoruyla işlenir. Hem modern hem eski PowerPoint biçimlerini, ayrıca OpenDocument Presentation biçimini destekler.

## Desteklenen Biçimler

| Biçim                     | Uzantılar |
| :------------------------ | :-------- |
| PowerPoint (modern)       | `.pptx`   |
| PowerPoint (eski)         | `.ppt`    |
| OpenDocument Presentation | `.odp`    |

## Nasıl Çalışır

1. Yükleme alanına tıklayın veya sunum dosyalarınızı sürükleyip bırakın.
2. Dosya listesini gözden geçirin. Gerektiği gibi dosya ekleyin veya kaldırın.
3. **PDF'e Dönüştür**'e tıklayın. LibreOffice motoru ilk kullanımda yüklenir, ardından her dosyayı dönüştürür.
4. Tek dosya doğrudan PDF olarak iner. Birden fazla dosya `powerpoint-converted.zip` içinde paketlenir.

## Seçenekler

Bu aracın ek bir ayarı yoktur. Slaytlar özgün boyutlarında işlenir.

## Çıktı

| Girdi Sayısı | Çıktı                                                                 |
| :----------- | :-------------------------------------------------------------------- |
| 1 dosya      | Tek PDF indirmesi (özgün dosya adı, `.pdf` uzantısıyla)               |
| 2+ dosya     | Her dosya için bir PDF içeren ZIP arşivi (`powerpoint-converted.zip`) |

## Kullanım Alanları

- PowerPoint'i olmayabilecek bir kitleyle paylaşmadan önce sunumu PDF'e dönüştürmek
- Konferans veya atölye için slayt gösterisinin yazdırılabilir bir el notu sürümünü oluşturmak
- Sunumları her cihazda aynı görünen bir biçimde arşivlemek
- LibreOffice Impress'ten gelen ODP sunumlarından oluşan bir kitaplığı toplu olarak PDF'e dönüştürmek
- Bir yatırımcı sunumunun e-posta eki olarak PDF sürümünü hazırlamak

## İpuçları

- Slayt animasyonları ve geçişler PDF'te yer almaz. Her slayt statik bir sayfa olarak alınır.
- Gömülü videolar çıktıda görünmez. Gerekirse bunları bir ekran görüntüsü veya yer tutucu görselle değiştirin.
- Konuşmacı notları varsayılan PDF dışa aktarımına dahil edilmez. Notlara ihtiyacınız varsa önce PowerPoint'in yerel "Notları Yazdır" görünümünden dışa aktarmayı deneyin.
- LibreOffice motoru ilk yüklemeden sonra önbelleğe alınır, bu yüzden aynı oturumda ikinci bir sunumu dönüştürmek çok daha hızlıdır.

## İlgili Araçlar

- [Word'den PDF'ye](./word-to-pdf)
- [Excel'den PDF'ye](./excel-to-pdf)
- [Görselden PDF'ye](./image-to-pdf)
