---
title: JSON'dan PDF'ye
description: PDF dosyalarını BentoPDF'in JSON biçiminden yeniden oluşturun. JSON dışa aktarımlarını özgün PDF belgelerine geri dönüştürün.
---

# JSON'dan PDF'ye

Daha önce BentoPDF'in **PDF'den JSON'a** aracıyla oluşturulmuş JSON dosyalarından PDF belgelerini yeniden oluşturun. Bu, gidiş-dönüş bir dönüştürme aracıdır: bir PDF'nin yapılandırılmış JSON temsilini alır ve özgün belgeyi yeniden oluşturur.

::: warning
Bu araç yalnızca BentoPDF'in PDF'den JSON'a dönüştürücüsünün ürettiği JSON dosyalarını kabul eder. API'lerden, veritabanlarından veya diğer araçlardan gelen standart JSON dosyaları desteklenmez.
:::

## Desteklenen Biçimler

| Girdi   | Açıklama                                                          |
| :------ | :---------------------------------------------------------------- |
| `.json` | BentoPDF'in PDF'den JSON'a aracıyla dışa aktarılan JSON dosyaları |

## Nasıl Çalışır

1. Yükleme alanına tıklayın veya bir veya daha fazla JSON dosyasını sürükleyip bırakın.
2. Dosya listesi, seçilen her dosyayı boyutuyla birlikte gösterir.
3. **PDF'ye Dönüştür**'e tıklayın. Araç tüm dosyaları bir Web Worker ve CPDF motoruyla işler.
4. Çıktı, her girdi JSON dosyası için bir PDF içeren `jsons-to-pdf.zip` olarak iner.

Dönüştürme arka planda bir Web Worker'da çalışır; bu sayede büyük dosyalarda bile arayüz yanıt vermeye devam eder.

## Seçenekler

Bu aracın yapılandırılabilir seçeneği yoktur. Çıktı PDF'yi tamamen JSON yapısı belirler.

## Çıktı

Birden fazla JSON dosyası dönüştürülürken sonuçlar ZIP arşivi olarak teslim edilir. Her PDF, kaynak JSON dosyasının adını alır (ör. `report.json` dosyası `report.pdf` olur).

## Kullanım Alanları

- JSON tabanlı bir yedekten veya arşiv hattından PDF'leri geri yüklemek
- İnceleme için bir PDF'yi JSON üzerinden geçirip tekrar PDF'ye döndürmek
- JSON yapısında programatik değişikliklerden sonra belgeleri yeniden oluşturmak
- PDF'den JSON'a dışa aktarımın tüm belge içeriğini yakaladığını geri dönüştürerek doğrulamak

## İpuçları

- Rastgele JSON verilerini (API yanıtları veya yapılandırma dosyaları gibi) biçimlendirilmiş bir PDF'ye dönüştürmeniz gerekiyorsa [Metinden PDF'ye](./txt-to-pdf) aracı daha uygundur. JSON'u metin olarak yapıştırın; düzgün biçimlendirmeyle işlenecektir.
- Bu aracın çalışması için CPDF WebAssembly motorunun erişilebilir olması gerekir. Kendi sunucusunda barındırılan örneklerde CPDF WASM dosyalarının yapılandırılması gerekir.

## İlgili Araçlar

- [Metinden PDF'ye](./txt-to-pdf)
- [Markdown'dan PDF'ye](./markdown-to-pdf)
- [CSV'den PDF'ye](./csv-to-pdf)
