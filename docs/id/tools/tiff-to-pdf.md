---
title: TIFF ke PDF
description: Konversi gambar TIFF satu halaman dan multi-halaman ke format PDF di browser Anda dengan dukungan halaman penuh.
---

# TIFF ke PDF

Konversi file TIFF ke PDF, termasuk TIFF multi-halaman. Setiap halaman (atau "IFD") dalam file TIFF menjadi halaman terpisah di PDF hasil. Ini sangat berguna untuk dokumen pindaian, fax, dan gambar medis yang umumnya disimpan sebagai TIFF multi-halaman.

## Format yang Didukung

| Format | Ekstensi        |
| :----- | :-------------- |
| TIFF   | `.tiff`, `.tif` |

## Cara Kerja

1. Klik area unggah atau seret dan lepas file TIFF Anda.
2. Periksa daftar file dan kelola sesuai kebutuhan.
3. Klik **Konversi ke PDF**. Hasilnya diunduh sebagai `from_tiff.pdf`.

Alat ini mendekode setiap file TIFF menggunakan dekoder TIFF JavaScript, mengekstrak data piksel RGBA mentah setiap halaman. Setiap halaman dirender ke kanvas, diekspor sebagai PNG, dan disematkan ke PDF. Dimensi halaman sesuai dengan halaman TIFF asli.

## Opsi

Alat ini tidak menyediakan pengaturan kualitas tambahan. Gambar disematkan pada resolusi aslinya.

## Kasus Penggunaan

- Mengonversi dokumen fax multi-halaman (TIFF-F) ke format PDF yang lebih portabel
- Mengubah arsip dokumen pindaian yang tersimpan sebagai TIFF menjadi PDF yang dapat dicari (gabungkan dengan alat OCR setelahnya)
- Memproses file pencitraan medis (slide patologi, ekspor radiologi) yang menggunakan TIFF
- Mengonversi file TIFF GIS atau citra satelit menjadi dokumen yang dapat dibagikan

## Tips

- TIFF multi-halaman didukung sepenuhnya. TIFF 10 halaman akan menghasilkan PDF 10 halaman. Anda tidak perlu memisahkan TIFF terlebih dahulu.
- File TIFF yang sangat besar (ratusan megabyte) mungkin memerlukan waktu lebih lama karena seluruh file harus didekode di memori browser.
- Jika Anda memerlukan OCR pada PDF hasil, jalankan melalui alat [OCR PDF](./ocr-pdf) setelah konversi.

## Alat Terkait

- [Gambar ke PDF](./image-to-pdf)
- [BMP ke PDF](./bmp-to-pdf)
- [JPG ke PDF](./jpg-to-pdf)
