---
title: Excel'den PDF'ye
description: Excel e-tablolarını (XLS, XLSX), ODS ve CSV dosyalarını biçimlendirme korunarak PDF'ye dönüştürün.
---

# Excel'den PDF'ye

E-tablo dosyalarını PDF'ye dönüştürün. Araç modern Excel dosyalarını, eski XLS biçimini, OpenDocument E-tablolarını ve hatta CSV'yi işler. Hepsi, hücre biçimlendirmesini, formülleri (hesaplanmış değerler olarak), grafikleri ve çok sayfalı düzenleri koruyan tarayıcı tabanlı bir LibreOffice motoruyla işlenir.

## Desteklenen Biçimler

| Biçim                  | Uzantılar |
| :--------------------- | :-------- |
| Excel (modern)         | `.xlsx`   |
| Excel (eski)           | `.xls`    |
| OpenDocument E-tablosu | `.ods`    |
| CSV                    | `.csv`    |

## Nasıl Çalışır

1. Yükleme alanına tıklayın veya e-tablo dosyalarınızı sürükleyip bırakın.
2. Dosya listesini gözden geçirin. Daha fazla dosya ekleyin veya istemediklerinizi kaldırın.
3. **PDF'ye Dönüştür**'e tıklayın. LibreOffice motoru ilk kullanımda başlatılır, ardından her dosyayı işler.
4. Tek dosya doğrudan PDF olarak iner. Birden çok dosya `excel-converted.zip` olarak teslim edilir.

## Seçenekler

Bu aracın ek bir yapılandırması yoktur. LibreOffice motoru sayfa düzenini, ölçeklemeyi ve yazdırma alanını e-tablonun yerleşik ayarlarına göre belirler.

## Çıktı

| Girdi Sayısı | Çıktı                                                          |
| :----------- | :------------------------------------------------------------- |
| 1 dosya      | Tek PDF indirmesi (özgün dosya adı, `.pdf` uzantısıyla)        |
| 2+ dosya     | Dosya başına bir PDF içeren ZIP arşivi (`excel-converted.zip`) |

## Kullanım Alanları

- Finansal raporları veya bütçeleri dağıtım için Excel'den PDF'ye dönüştürmek
- Envanter veya ürün kataloğu e-tablolarından baskıya hazır PDF'ler oluşturmak
- Veri analizi sonuçlarını Excel'i kurulu olmayan paydaşlarla paylaşmak
- Üç aylık raporları düzenlenemez bir biçimde arşivlemek
- LibreOffice Calc'tan ODS dosyalarını PDF'ye dönüştürmek

## İpuçları

- E-tabloya gömülü grafikler PDF'de işlenir. Dönüştürmeden önce kaynak dosyada doğru göründüklerinden emin olun.
- E-tablonuzda birden çok sayfa varsa tüm sayfalar PDF çıktısına dahil edilir.
- Biçimlendirmesiz basit CSV verileri için [CSV'den PDF'ye](./csv-to-pdf) aracı daha hafif bir dönüştürme sağlar. Biçimlendirmenin, grafiklerin veya birden çok sayfanın korunması gerektiğinde Excel to PDF'yi kullanın.

## İlgili Araçlar

- [CSV'den PDF'ye](./csv-to-pdf)
- [Word'den PDF'ye](./word-to-pdf)
- [PowerPoint'ten PDF'ye](./powerpoint-to-pdf)
