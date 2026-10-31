---
title: RTF'den PDF'ye
description: Zengin Metin Biçimi (RTF) dosyalarını LibreOffice destekli bir motorla tarayıcınızda PDF'e dönüştürün.
---

# RTF'den PDF'ye

Zengin Metin Biçimi belgelerini PDF'e dönüştürün. RTF, hemen her kelime işlemcinin desteklediği platformlar arası bir belge biçimidir. Bu araç, RTF dosyalarını biçimlendirmeleri bozulmadan işlemek için tarayıcı tabanlı bir LibreOffice motoru kullanır: kalın, italik, tablolar ve gömülü görseller PDF'e aynen aktarılır.

## Desteklenen Biçimler

| Biçim | Uzantılar | MIME Türleri                  |
| :---- | :-------- | :---------------------------- |
| RTF   | `.rtf`    | `text/rtf`, `application/rtf` |

## Nasıl Çalışır

1. Yükleme alanına tıklayın veya bir ya da daha fazla RTF dosyasını sürükleyip bırakın.
2. Dosya listesini gözden geçirin. Gerektiği gibi dosya ekleyin veya kaldırın.
3. **PDF'e Dönüştür**'e tıklayın. LibreOffice motoru ilk kullanımda başlatılır, ardından her dosyayı işler.
4. Tek dosya doğrudan PDF olarak iner. Birden fazla dosya `rtf-converted.zip` olarak sunulur.

## Seçenekler

Bu aracın ek bir ayarı yoktur. Dönüştürme, özgün RTF biçimlendirmesini korur.

## Çıktı

| Girdi Sayısı | Çıktı                                                          |
| :----------- | :------------------------------------------------------------- |
| 1 dosya      | Tek PDF indirmesi (örn. `letter.pdf`)                          |
| 2+ dosya     | Her dosya için bir PDF içeren ZIP arşivi (`rtf-converted.zip`) |

## Kullanım Alanları

- Eski kelime işlemcilerden kalan RTF belgelerini modern PDF'lere dönüştürmek
- RTF e-posta şablonlarını PDF önizlemelerine çevirmek
- Hukuk veya tıp yazılım sistemlerinin RTF çıktılarını işlemek
- Bir belge yönetim sistemindeki RTF dosyalarını arşivleme için toplu olarak PDF'e dönüştürmek

## İpuçları

- LibreOffice motoru bir kez yüklenir ve önbelleğe alınır. Bir oturumdaki ilk dönüştürme birkaç saniye fazla sürer, sonrakiler daha hızlıdır.
- Gömülü OLE nesneleri içeren RTF dosyalarında tüm nesneler kusursuz işlenmeyebilir. Düz metin, görseller ve standart biçimlendirme güvenilir biçimde dönüştürülür.
- RTF dosyalarınız Microsoft Word ile oluşturulduysa, DOC ve DOCX ile birlikte RTF'yi de kabul eden [Word'den PDF'ye](./word-to-pdf) aracıyla doğrudan dönüştürebilirsiniz.

## İlgili Araçlar

- [Word'den PDF'ye](./word-to-pdf)
- [ODT'den PDF'ye](./odt-to-pdf)
- [Metinden PDF'ye](./txt-to-pdf)
