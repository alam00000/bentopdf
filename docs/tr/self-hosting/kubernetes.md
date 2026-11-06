# Kubernetes ile Dağıtım

Kubernetes statik bir site için gereğinden fazla olabilir, ancak zaten Helm + GitOps standardını kullanıyorsanız çok iyi bir seçim olabilir.

> [!IMPORTANT]
> **Office Dosyası Dönüştürme için Gerekli Başlıklar**
>
> LibreOffice tabanlı araçlar (Word, Excel, PowerPoint dönüştürme) `SharedArrayBuffer` desteği için şu HTTP başlıklarını gerektirir:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> Resmi Pixel PDF nginx imajları bu başlıkları içerir. Kubernetes'te **Ingress/Gateway denetleyicileri de birer ters proxy'dir**, bu nedenle bu başlıkların korunduğundan emin olun (veya uç katmanda ekleyin).

## Ön Koşullar

- Kubernetes kümesi
- Helm v3
- **8080 numaralı bağlantı noktasında** hizmet veren bir Pixel PDF nginx imajı (örn. `ghcr.io/mohammedalhinaki-cloud/pixel-pdf:<tag>`)

## Helm ile Dağıtım

### Bu depodan kurulum (yerel chart)

```bash
kubectl create namespace pixelpdf

helm upgrade --install pixelpdf /path/to/pixelpdf/chart \
  --namespace pixelpdf \
  --set image.repository=ghcr.io/mohammedalhinaki-cloud/pixel-pdf \
  --set image.tag=latest
```

### GHCR'den kurulum (OCI chart)

Chart GHCR'de OCI yapıtı olarak yayımlanmışsa:

```bash
export GHCR_USERNAME="<github-org-or-user>"

helm upgrade --install pixelpdf oci://ghcr.io/$GHCR_USERNAME/charts/pixelpdf \
  --namespace pixelpdf \
  --create-namespace \
  --version 0.1.0 \
  --set image.repository=ghcr.io/mohammedalhinaki-cloud/pixel-pdf \
  --set image.tag=latest
```

## Erişime Açma

### Port-forward (hızlı test)

```bash
kubectl -n pixelpdf port-forward deploy/pixelpdf 8080:8080
```

### Ingress (isteğe bağlı)

Ingress'i etkinleştirin (nginx-ingress için örnek):

```yaml
ingress:
  enabled: true
  className: nginx
  hosts:
    - host: pdf.example.com
      paths:
        - path: /
          pathType: Prefix
```

### Gateway API (isteğe bağlı)

Bu chart, Gateway API `Gateway` + `HTTPRoute` yapılarını destekler.

Örnek (Cloudflare Gateway API operatörü):

```yaml
gateway:
  enabled: true
  name: pixel-tunnel
  namespace: pixelpdf
  gatewayClassName: cloudflare

httpRoute:
  enabled: true
  parentRefs:
    - name: pixel-tunnel
      namespace: pixelpdf
      sectionName: http
  hostnames:
    - pdfs.example.com
```

## SharedArrayBuffer Başlıklarının Hâlâ Çalıştığından Emin Olma (Ingress/Gateway)

### Ne olması "gerekir"

Pixel PDF'in nginx yapılandırması gerekli yanıt başlıklarını ayarlar. Çoğu Ingress/Gateway denetleyicisi **üst akış yanıt başlıklarını değiştirmeden iletir**.

### Neyi bozabilir

- Yanıt başlıklarını **geçersiz kılan** veya **kaldıran** bir denetleyici/uç politikası
- Farklı COOP/COEP değerleri ayarlayan bir "güvenlik başlıkları" ara katmanı

### Nasıl doğrulanır

Bunu herkese açık uç noktanıza karşı çalıştırın:

```bash
curl -I https://pdf.example.com/ | egrep -i 'cross-origin-opener-policy|cross-origin-embedder-policy'
```

Şunları görmelisiniz:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

### Ingress denetleyiciniz bunları korumuyorsa

Başlıkları uç katmanda ekleyin (denetleyiciye özgüdür). **nginx-ingress** için örnek:

```yaml
ingress:
  enabled: true
  className: nginx
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      add_header Cross-Origin-Opener-Policy "same-origin" always;
      add_header Cross-Origin-Embedder-Policy "require-corp" always;
```

## `.mjs` MIME türü hataları (PDF İmzala / Form Doldurucu iframe'i boş)

Tarayıcı konsolunda bir `.mjs` isteğinde `Failed to load module script: ... non-JavaScript MIME type "application/octet-stream"` görüyorsanız, Pixel PDF nginx'inin önündeki bir Ingress/Gateway denetleyicisi üst akıştaki `Content-Type` başlığını `application/octet-stream` ile değiştiriyor demektir.

Pixel PDF imajındaki nginx `.mjs` dosyalarını zaten `application/javascript` olarak sunar. Çözüm, denetleyicinin bunu kaldırmasını/değiştirmesini engellemektir. nginx-ingress için:

```yaml
ingress:
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      location ~* \.mjs$ {
        types {} default_type application/javascript;
      }
```

Veya Gateway API'de `.mjs` yolları için `Content-Type: application/javascript` ayarlamak üzere bir `ResponseHeaderModifier` filtresi kullanın. DevTools → Network sekmesiyle doğrulayın: başarısız olan `.mjs` isteği artık `content-type: application/javascript` göstermelidir.

### Gateway API kullanıyorsanız ve başlıkları zorla eklemek istiyorsanız

Gateway API bir `ResponseHeaderModifier` filtresi destekler. Bunu `httpRoute.rules[*].filters` içine ekleyebilirsiniz:

```yaml
httpRoute:
  enabled: true
  hostnames: [pdf.example.com]
  parentRefs:
    - name: pixel-tunnel
      namespace: misc
      sectionName: http
  rules:
    - matches:
        - path: { type: PathPrefix, value: / }
      filters:
        - type: ResponseHeaderModifier
          responseHeaderModifier:
            set:
              - name: Cross-Origin-Opener-Policy
                value: same-origin
              - name: Cross-Origin-Embedder-Policy
                value: require-corp
```

Belirli filtrelerin desteği Gateway denetleyicinize bağlıdır; bir filtre yok sayılırsa başlıkları bunun yerine uç/denetleyici katmanında ekleyin.

## Belirli Araçları Devre Dışı Bırakma

İmajı yeniden derlemeden çalışma zamanında araçları devre dışı bırakmak için bir ConfigMap kullanın:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: pixelpdf-config
  namespace: pixelpdf
data:
  config.json: |
    {
      "disabledTools": ["edit-pdf", "sign-pdf", "encrypt-pdf"]
    }
```

Bunu sunulan dizine bağlayın:

```yaml
spec:
  containers:
    - name: pixelpdf
      volumeMounts:
        - name: config
          mountPath: /usr/share/nginx/html/config.json
          subPath: config.json
          readOnly: true
  volumes:
    - name: config
      configMap:
        name: pixelpdf-config
```

Araç kimlikleri, `.html` olmadan sayfa URL'sidir: herhangi bir aracı açıp URL'ye bakın (örn. `edit-pdf`, `merge-pdf`, `compress-pdf`). Devre dışı bırakılan araçlar ana sayfadan, aramadan, kısayollardan, iş akışı oluşturucudan ve doğrudan URL erişiminden gizlenir. Seçeneklerin tam listesi için [Docker kılavuzuna](/tr/self-hosting/docker#belirli-aracları-devre-dısı-bırakma) bakın.
