# CORS Proxy untuk Pengambilan Sertifikat

Alat tanda tangan digital menggunakan CORS proxy untuk mengambil sertifikat penerbit dari Certificate Authority (CA) eksternal. Ini diperlukan karena banyak server CA tidak menyertakan header CORS dalam responsnya, sehingga pengambilan langsung dari browser tidak dapat dilakukan.

Selain itu, banyak server CA menyajikan sertifikat melalui HTTP biasa. Saat instans BentoPDF Anda dihosting melalui HTTPS, browser memblokir permintaan HTTP ini (kebijakan mixed content). CORS proxy mengatasi kedua masalah tersebut dengan mengarahkan permintaan melalui endpoint HTTPS dengan header yang tepat.

## Cara Kerjanya

Saat menandatangani PDF dengan sertifikat:

1. Pustaka `zgapdfsigner` mencoba membangun rantai sertifikat yang lengkap
2. Pustaka ini mengambil sertifikat penerbit dari URL yang tertanam di ekstensi AIA (Authority Information Access) sertifikat Anda
3. Permintaan ini diarahkan melalui CORS proxy yang menambahkan header `Access-Control-Allow-Origin` yang diperlukan
4. Proxy mengembalikan data sertifikat ke browser

## Hosting Mandiri CORS Proxy

Jika Anda menghosting BentoPDF sendiri, Anda perlu men-deploy CORS proxy sendiri agar tanda tangan digital dapat bekerja dengan sertifikat yang memerlukan pengambilan rantai.

### Opsi 1: Cloudflare Workers (Disarankan)

1. **Instal Wrangler CLI**:

   ```bash
   npm install -g wrangler
   ```

2. **Login ke Cloudflare**:

   ```bash
   wrangler login
   ```

3. **Clone BentoPDF dan perbarui origin yang diizinkan**:

   ```bash
   git clone https://github.com/alam00000/bentopdf.git
   cd bentopdf/cloudflare
   ```

   Buka `cors-proxy-worker.js` dan ubah array `ALLOWED_ORIGINS` ke domain Anda:

   ```js
   const ALLOWED_ORIGINS = [
     'https://your-domain.com',
     'https://www.your-domain.com',
   ];
   ```

   ::: warning Penting
   Tanpa perubahan ini, proxy akan menolak semua permintaan dari situs Anda dengan error **403 Forbidden**. Secara default hanya permintaan dari `bentopdf.com` yang diizinkan.
   :::

4. **Deploy proxy**:

   ```bash
   wrangler deploy
   ```

   Catat URL worker Anda (mis., `https://bentopdf-cors-proxy.your-subdomain.workers.dev`).

5. **Build ulang BentoPDF dengan URL proxy**:

   Jika menggunakan Docker:

   ```bash
   export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
   DOCKER_BUILDKIT=1 docker build \
     --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
     -t your-bentopdf .
   ```

   Jika build dari sumber:

   ```bash
   VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
   ```

### Opsi 2: Proxy Backend Kustom

Anda juga dapat membuat endpoint proxy sendiri. Persyaratannya:

1. Menerima permintaan GET dengan parameter query `url`
2. Mengambil URL tersebut dari server Anda (tanpa pembatasan CORS di sisi server)
3. Mengembalikan respons dengan header berikut:
   - `Access-Control-Allow-Origin: https://your-domain.com`
   - `Access-Control-Allow-Methods: GET, OPTIONS`
   - `X-Content-Type-Options: nosniff`

Contoh implementasi Express.js:

```javascript
app.get('/api/cert-proxy', async (req, res) => {
  const targetUrl = req.query.url;

  // Validate it's a certificate URL
  if (!isValidCertUrl(targetUrl)) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const response = await fetch(targetUrl);
    const data = await response.arrayBuffer();

    res.set('Access-Control-Allow-Origin', 'https://your-domain.com');
    res.set('Content-Type', 'application/octet-stream');
    res.set('X-Content-Type-Options', 'nosniff');
    res.send(Buffer.from(data));
  } catch (error) {
    res.status(500).json({ error: 'Proxy error' });
  }
});
```

## Pertimbangan Keamanan

Cloudflare Worker yang disertakan memiliki beberapa langkah keamanan:

| Fitur                     | Deskripsi                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------ |
| **Validasi Origin**       | Hanya mengizinkan permintaan dari domain yang tercantum di `ALLOWED_ORIGINS`                     |
| **Pembatasan URL**        | Hanya mengizinkan URL sertifikat (`.crt`, `.cer`, `.pem`, `/certs/`, `/ocsp`, `/crl`)            |
| **Pemblokiran IP Privat** | Memblokir rentang privat IPv4/IPv6, link-local, loopback, IP desimal, dan metadata cloud         |
| **Keamanan Content-Type** | Hanya mengembalikan MIME type sertifikat yang aman, memblokir injeksi content-type dari upstream |
| **Batas Ukuran File**     | Men-stream respons dengan batas 10MB, menghentikan unduhan jika terlampaui                       |
| **Pembatasan Laju**       | 60 permintaan per menit per IP atau IPv6 /64 (memerlukan KV, tetap lolos saat KV error)          |
| **Tanda Tangan HMAC**     | Penandatanganan sisi klien opsional (mencegah penyalahgunaan biasa)                              |

### DNS rebinding (hosting mandiri di luar Cloudflare)

Worker menolak setiap URL yang me-resolve ke IP privat atau internal. Worker tidak dapat memakai allowlist host tetap, karena URL rantai sertifikat menunjuk ke CA mana pun yang menerbitkan sertifikat (FNMT, CA korporat, dan seterusnya), sehingga tujuannya tidak diketahui sebelumnya. Hal ini menyisakan celah rebinding kecil: seseorang yang menjalankan DNS untuk domainnya sendiri dapat memberikan IP publik pada pemeriksaan keamanan dan IP privat pada permintaan sebenarnya beberapa saat kemudian.

Di Cloudflare hal ini tidak dapat dieksploitasi: Workers tidak dapat menjangkau IP privat atau endpoint metadata `169.254.169.254`, sehingga rebind tidak mengenai apa pun. Hanya saja, jangan beri worker jalan masuk: jangan pasang Tunnel, Service, atau binding jaringan privat (worker hanya memerlukan `RATE_LIMIT_KV`).

Jika Anda menjalankannya di luar Cloudflare (workerd, Node, dan sejenisnya) di dalam VPC, runtime _dapat_ menjangkau IP internal. Pasang firewall egress di depannya dan blokir rentang privat: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16`, beserta padanan IPv6-nya. Kode aplikasi tidak dapat menegakkannya setelah Anda berada di luar Cloudflare.

## Menonaktifkan Proxy

Jika Anda tidak ingin menggunakan CORS proxy, atur environment variable ke string kosong:

```
VITE_CORS_PROXY_URL=
```

**Catatan**: Tanpa proxy, penandatanganan dengan sertifikat yang memerlukan pengambilan rantai eksternal (seperti FNMT atau beberapa CA korporat) akan gagal dengan error "Failed to fetch".

## Pemecahan Masalah

### "Signing error: TypeError: Failed to fetch"

Ini biasanya berarti salah satu dari:

1. **CORS proxy belum dikonfigurasi**: Atur `VITE_CORS_PROXY_URL` dan build ulang
2. **Mixed content diblokir**: Situs Anda HTTPS tetapi URL penerbit sertifikat adalah HTTP. CORS proxy mengatasi hal ini.
3. **CORS proxy menolak origin Anda**: Periksa apakah domain Anda ada di array `ALLOWED_ORIGINS` pada `cors-proxy-worker.js`

### "403 Forbidden" dari proxy

Domain Anda tidak ada di daftar `ALLOWED_ORIGINS`. Edit `cors-proxy-worker.js`:

```js
const ALLOWED_ORIGINS = ['https://your-domain.com'];
```

Lalu deploy ulang: `npx wrangler deploy`

### Menguji proxy

```bash
curl -H "Origin: https://your-domain.com" \
  "https://your-proxy.workers.dev?url=http://www.cert.fnmt.es/certs/ACUSU.crt"
```

### Sertifikat yang Berfungsi Tanpa Proxy

Beberapa sertifikat menyertakan rantai lengkap di file P12/PFX dan tidak memerlukan pengambilan eksternal:

- Sertifikat self-signed
- Beberapa CA komersial yang menyertakan sertifikat perantara
- Sertifikat yang Anda rakit sendiri dengan rantai lengkap
