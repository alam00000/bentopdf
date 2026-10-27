---
title: PDF Form Doldurucu
description: XFA formları dahil PDF formlarını tarayıcınızda gömülü bir görüntüleyiciyle doldurun.
---

# PDF Form Doldurucu

Form alanları içeren bir PDF'yi açın ve gömülü bir görüntüleyicide doğrudan doldurun. Araç hem standart AcroForm alanlarını hem de eski XFA (XML Forms Architecture) formlarını destekler. Formu tamamladıktan sonra doldurulmuş sürümü tek tıkla indirebilirsiniz.

## Nasıl Çalışır

1. Form alanları içeren bir PDF yükleyin.
2. Belge, form alanlarını etkileşimli girişler olarak gösteren tümleşik bir PDF görüntüleyicide açılır.
3. Doldurmak için metin alanlarına, onay kutularına, açılır listelere ve radyo düğmelerine tıklayın.
4. Tamamlanmış PDF'yi almak için **Kaydet ve Doldurulmuş Formu İndir**'e tıklayın.

## Özellikler

- Tam form alanı etkileşimini destekleyen gömülü PDF.js görüntüleyici
- Standart AcroForm alanları desteği (metin girişleri, onay kutuları, açılır listeler, radyo düğmeleri)
- XML tabanlı eski formlar için XFA form desteği
- Sayfa boyutlarına göre otomatik görüntüleyici boyutlandırma
- Ad ve boyut bilgisiyle dosya gösterimi

## Seçenekler

Ek yapılandırma seçeneği yoktur. Formu yükleyin, doldurun ve indirin.

## Kullanım Alanları

- Vergi formlarını, sigorta başvurularını veya resmi evrakları doldurmak
- PDF eki olarak gelen iş başvuru formlarını doldurmak
- Tedarikçi kayıt formlarını veya tedarikçi anketlerini tamamlamak
- Onay kutusu alanlarıyla uyumluluk kontrol listelerini onaylamak
- Randevudan önce tıbbi kabul formlarını doldurmak

## İpuçları

- XFA formları yalnızca bazı PDF görüntüleyiciler tarafından desteklenen eski bir biçimdir. Bir XFA PDF'yi Chrome'da veya çoğu diğer araçta açıp boş sayfalar görüyorsanız, bu görüntüleyicilerin XFA desteği olmadığı anlamına gelir. BentoPDF'in Form Doldurucusu ve Firefox, XFA'yı düzgün işler.
- Mevcut form alanı olmayan PDF'ler için önce alan eklemek üzere [PDF Formu Oluştur](./form-creator) aracını kullanın, ardından burada doldurun.
- Görüntüleyici boyutunu PDF'nin sayfa ölçülerine uyacak şekilde otomatik ayarlar.

## İlgili Araçlar

- [PDF Formu Oluştur](./form-creator)
- [PDF İmzala](./sign-pdf)
- [PDF Düzenleyici](./edit-pdf)
