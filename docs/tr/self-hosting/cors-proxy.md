# Sertifika Alımı için CORS Proxy

Dijital imza aracı, harici Sertifika Otoritelerinden (CA) düzenleyici sertifikaları almak için bir CORS proxy kullanır. Bu gereklidir, çünkü birçok CA sunucusu yanıtlarında CORS başlıkları içermez ve bu da tarayıcıdan doğrudan almayı engeller.

Ayrıca birçok CA sunucusu sertifikaları düz HTTP üzerinden sunar. BentoPDF örneğiniz HTTPS üzerinden barındırıldığında tarayıcılar bu HTTP isteklerini engeller (karma içerik politikası). CORS proxy, istekleri uygun başlıklara sahip bir HTTPS uç noktası üzerinden yönlendirerek her iki sorunu da çözer.

## Nasıl Çalışır

Bir PDF'i sertifikayla imzalarken:

1. `zgapdfsigner` kütüphanesi eksiksiz bir sertifika zinciri oluşturmaya çalışır
2. Düzenleyici sertifikaları, sertifikanızın AIA (Authority Information Access) uzantısına gömülü URL'lerden alır
3. Bu istekler, gerekli `Access-Control-Allow-Origin` başlıklarını ekleyen bir CORS proxy üzerinden yönlendirilir
4. Proxy, sertifika verilerini tarayıcıya döndürür

## CORS Proxy'yi Kendi Sunucunuzda Barındırma

BentoPDF'i kendi sunucunuzda barındırıyorsanız, zincir alımı gerektiren sertifikalarla dijital imzaların çalışması için kendi CORS proxy'nizi dağıtmanız gerekir.

### Seçenek 1: Cloudflare Workers (Önerilir)

1. **Wrangler CLI'ı kurun**:

   ```bash
   npm install -g wrangler
   ```

2. **Cloudflare'e giriş yapın**:

   ```bash
   wrangler login
   ```

3. **BentoPDF'i klonlayın ve izin verilen kaynakları güncelleyin**:

   ```bash
   git clone https://github.com/alam00000/bentopdf.git
   cd bentopdf/cloudflare
   ```

   `cors-proxy-worker.js` dosyasını açın ve `ALLOWED_ORIGINS` dizisini kendi alan adınıza göre değiştirin:

   ```js
   const ALLOWED_ORIGINS = [
     'https://your-domain.com',
     'https://www.your-domain.com',
   ];
   ```

   ::: warning Önemli
   Bu değişiklik olmadan proxy, sitenizden gelen tüm istekleri **403 Forbidden** hatasıyla reddeder. Varsayılan yalnızca `bentopdf.com` kaynağından gelen isteklere izin verir.
   :::

4. **Proxy'yi dağıtın**:

   ```bash
   wrangler deploy
   ```

   Worker URL'nizi not edin (örn. `https://bentopdf-cors-proxy.your-subdomain.workers.dev`).

5. **BentoPDF'i proxy URL ile yeniden derleyin**:

   Docker kullanıyorsanız:

   ```bash
   export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
   DOCKER_BUILDKIT=1 docker build \
     --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
     -t your-bentopdf .
   ```

   Kaynaktan derliyorsanız:

   ```bash
   VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
   ```

### Seçenek 2: Özel Arka Uç Proxy

Kendi proxy uç noktanızı da oluşturabilirsiniz. Gereksinimler:

1. `url` sorgu parametresiyle GET isteklerini kabul edin
2. URL'yi sunucunuzdan alın (sunucu tarafında CORS kısıtlaması yoktur)
3. Yanıtı şu başlıklarla döndürün:
   - `Access-Control-Allow-Origin: https://your-domain.com`
   - `Access-Control-Allow-Methods: GET, OPTIONS`
   - `X-Content-Type-Options: nosniff`

Örnek Express.js uygulaması:

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

## Güvenlik Hususları

Pakete dahil Cloudflare Worker'ın çeşitli güvenlik önlemleri vardır:

| Özellik                    | Açıklama                                                                                              |
| -------------------------- | ----------------------------------------------------------------------------------------------------- |
| **Kaynak Doğrulama**       | Yalnızca `ALLOWED_ORIGINS` içinde listelenen alan adlarından gelen isteklere izin verir               |
| **URL Kısıtlamaları**      | Yalnızca sertifika URL'lerine izin verir (`.crt`, `.cer`, `.pem`, `/certs/`, `/ocsp`, `/crl`)         |
| **Özel IP Engelleme**      | IPv4/IPv6 özel aralıklarını, link-local, loopback, ondalık IP'leri ve bulut metadata'sını engeller    |
| **Content-Type Güvenliği** | Yalnızca güvenli sertifika MIME türlerini döndürür, üst kaynaktan content-type enjeksiyonunu engeller |
| **Dosya Boyutu Sınırı**    | Yanıtı 10MB sınırıyla akıtır, aşılırsa indirmeyi yarıda keser                                         |
| **Hız Sınırlama**          | IP veya IPv6 /64 başına dakikada 60 istek (KV gerekir, KV hatalarında açık kalır)                     |
| **HMAC İmzaları**          | İsteğe bağlı istemci tarafı imzalama (sıradan kötüye kullanımı caydırır)                              |

### DNS rebinding (Cloudflare dışında kendi sunucunuzda barındırma)

Worker, özel veya dahili bir IP'ye çözümlenen her URL'yi reddeder. Sabit bir ana bilgisayar izin listesi kullanamaz, çünkü sertifika zinciri URL'leri sertifikayı hangi CA verdiyse ona işaret eder (FNMT, kurumsal CA'lar vb.), dolayısıyla hedefler önceden bilinmez. Bu da küçük bir rebinding penceresi bırakır: kendi alan adının DNS'ini yöneten biri, güvenlik kontrolüne genel bir IP, bir an sonra gerçek isteğe ise özel bir IP verebilir.

Cloudflare üzerinde bu istismar edilemez: Workers özel IP'lere veya `169.254.169.254` metadata uç noktasına erişemez, dolayısıyla bir rebind hiçbir yere ulaşmaz. Yeter ki worker'a bir giriş yolu vermeyin: Tunnel, Service veya özel ağ binding'i eklemeyin (yalnızca `RATE_LIMIT_KV` gerekir).

Bunu Cloudflare dışında (workerd, Node vb.) bir VPC içinde çalıştırırsanız, çalışma zamanı dahili IP'lere _erişebilir_. Önüne bir çıkış güvenlik duvarı koyun ve özel aralıkları engelleyin: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16` ve bunların IPv6 karşılıkları. Cloudflare dışına çıktığınızda uygulama kodu bunu zorunlu kılamaz.

## Proxy'yi Devre Dışı Bırakma

CORS proxy kullanmak istemiyorsanız, ortam değişkenini boş bir dizeye ayarlayın:

```
VITE_CORS_PROXY_URL=
```

**Not**: Proxy olmadan, harici zincir alımı gerektiren sertifikalarla (FNMT veya bazı kurumsal CA'lar gibi) imzalama "Failed to fetch" hatasıyla başarısız olur.

## Sorun Giderme

### "Signing error: TypeError: Failed to fetch"

Bu genellikle şunlardan birini ifade eder:

1. **CORS proxy yapılandırılmamış**: `VITE_CORS_PROXY_URL` değerini ayarlayın ve yeniden derleyin
2. **Karma içerik engellendi**: Siteniz HTTPS, ancak sertifikanın düzenleyici URL'si HTTP. CORS proxy bunu çözer.
3. **CORS proxy kaynağınızı reddediyor**: Alan adınızın `cors-proxy-worker.js` içindeki `ALLOWED_ORIGINS` dizisinde olduğunu kontrol edin

### Proxy'den "403 Forbidden"

Alan adınız `ALLOWED_ORIGINS` listesinde değil. `cors-proxy-worker.js` dosyasını düzenleyin:

```js
const ALLOWED_ORIGINS = ['https://your-domain.com'];
```

Ardından yeniden dağıtın: `npx wrangler deploy`

### Proxy'yi test etme

```bash
curl -H "Origin: https://your-domain.com" \
  "https://your-proxy.workers.dev?url=http://www.cert.fnmt.es/certs/ACUSU.crt"
```

### Proxy Olmadan Çalışan Sertifikalar

Bazı sertifikalar tam zinciri P12/PFX dosyasında içerir ve harici alım gerektirmez:

- Kendinden imzalı sertifikalar
- Ara sertifikaları paketleyen bazı ticari CA'lar
- Tam zincirle elle oluşturduğunuz sertifikalar
