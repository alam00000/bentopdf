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
> Resmi BentoPDF nginx imajları bu başlıkları içerir. Kubernetes'te **Ingress/Gateway denetleyicileri de birer ters proxy'dir**, bu nedenle bu başlıkların korunduğundan emin olun (veya uç katmanda ekleyin).

## Ön Koşullar

- Kubernetes kümesi
- Helm v3
- **8080 numaralı bağlantı noktasında** hizmet veren bir BentoPDF nginx imajı (örn. `ghcr.io/alam00000/bentopdf:<tag>`)

## Helm ile Dağıtım

### Bu depodan kurulum (yerel chart)

```bash
kubectl create namespace bentopdf

helm upgrade --install bentopdf /path/to/bentopdf/chart \
  --namespace bentopdf \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

### GHCR'den kurulum (OCI chart)

Chart GHCR'de OCI yapıtı olarak yayımlanmışsa:

```bash
export GHCR_USERNAME="<github-org-or-user>"

helm upgrade --install bentopdf oci://ghcr.io/$GHCR_USERNAME/charts/bentopdf \
  --namespace bentopdf \
  --create-namespace \
  --version 0.1.0 \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

## Erişime Açma

### Port-forward (hızlı test)

```bash
kubectl -n bentopdf port-forward deploy/bentopdf 8080:8080
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
  name: bento-tunnel
  namespace: bentopdf
  gatewayClassName: cloudflare

httpRoute:
  enabled: true
  parentRefs:
    - name: bento-tunnel
      namespace: bentopdf
      sectionName: http
  hostnames:
    - pdfs.example.com
```

## SharedArrayBuffer Başlıklarının Hâlâ Çalıştığından Emin Olma (Ingress/Gateway)

### Ne olması "gerekir"

BentoPDF'in nginx yapılandırması gerekli yanıt başlıklarını ayarlar. Çoğu Ingress/Gateway denetleyicisi **üst akış yanıt başlıklarını değiştirmeden iletir**.

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

Tarayıcı konsolunda bir `.mjs` isteğinde `Failed to load module script: ... non-JavaScript MIME type "application/octet-stream"` görüyorsanız, BentoPDF nginx'inin önündeki bir Ingress/Gateway denetleyicisi üst akıştaki `Content-Type` başlığını `application/octet-stream` ile değiştiriyor demektir.

BentoPDF imajındaki nginx `.mjs` dosyalarını zaten `application/javascript` olarak sunar. Çözüm, denetleyicinin bunu kaldırmasını/değiştirmesini engellemektir. nginx-ingress için:

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
    - name: bento-tunnel
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
  name: bentopdf-config
  namespace: bentopdf
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
    - name: bentopdf
      volumeMounts:
        - name: config
          mountPath: /usr/share/nginx/html/config.json
          subPath: config.json
          readOnly: true
  volumes:
    - name: config
      configMap:
        name: bentopdf-config
```

Araç kimlikleri, `.html` olmadan sayfa URL'sidir: herhangi bir aracı açıp URL'ye bakın (örn. `edit-pdf`, `merge-pdf`, `compress-pdf`). Devre dışı bırakılan araçlar ana sayfadan, aramadan, kısayollardan, iş akışı oluşturucudan ve doğrudan URL erişiminden gizlenir. Seçeneklerin tam listesi için [Docker kılavuzuna](/tr/self-hosting/docker#belirli-aracları-devre-dısı-bırakma) bakın.
