# استقرار با Kubernetes

Kubernetes ممکن است برای یک سایت ایستا زیاده از حد باشد، اما اگر از قبل روی Helm و GitOps استانداردسازی کرده‌اید، گزینهٔ بسیار مناسبی است.

> [!IMPORTANT]
> **هدرهای لازم برای تبدیل فایل‌های Office**
>
> ابزارهای مبتنی بر LibreOffice (تبدیل Word، Excel، PowerPoint) برای پشتیبانی از `SharedArrayBuffer` به این هدرهای HTTP نیاز دارند:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> ایمیج‌های رسمی nginx در Pixel PDF این هدرها را دارند. در Kubernetes، **کنترلرهای Ingress/Gateway نیز پراکسی معکوس هستند**، پس مطمئن شوید این هدرها حفظ می‌شوند (یا آن‌ها را در لبه اضافه کنید).

## پیش‌نیازها

- یک کلاستر Kubernetes
- Helm v3
- یک ایمیج nginx از Pixel PDF (مثلاً `ghcr.io/mohammedalhinaki-cloud/pixel-pdf:<tag>`) که روی **پورت 8080** سرویس می‌دهد

## استقرار با Helm

### نصب از این مخزن (چارت محلی)

```bash
kubectl create namespace pixelpdf

helm upgrade --install pixelpdf /path/to/pixelpdf/chart \
  --namespace pixelpdf \
  --set image.repository=ghcr.io/mohammedalhinaki-cloud/pixel-pdf \
  --set image.tag=latest
```

### نصب از GHCR (چارت OCI)

اگر چارت به‌صورت یک آرتیفکت OCI در GHCR منتشر شده باشد:

```bash
export GHCR_USERNAME="<github-org-or-user>"

helm upgrade --install pixelpdf oci://ghcr.io/$GHCR_USERNAME/charts/pixelpdf \
  --namespace pixelpdf \
  --create-namespace \
  --version 0.1.0 \
  --set image.repository=ghcr.io/mohammedalhinaki-cloud/pixel-pdf \
  --set image.tag=latest
```

## در دسترس قرار دادن

### Port-forward (آزمایش سریع)

```bash
kubectl -n pixelpdf port-forward deploy/pixelpdf 8080:8080
```

### Ingress (اختیاری)

Ingress را فعال کنید (نمونه برای nginx-ingress):

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

### Gateway API (اختیاری)

این چارت از `Gateway` و `HTTPRoute` در Gateway API پشتیبانی می‌کند.

نمونه (اپراتور Cloudflare Gateway API):

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

## اطمینان از کارکرد هدرهای SharedArrayBuffer (Ingress/Gateway)

### چه چیزی «باید» اتفاق بیفتد

پیکربندی nginx در Pixel PDF هدرهای پاسخ لازم را تنظیم می‌کند. بیشتر کنترلرهای Ingress/Gateway **هدرهای پاسخ بالادستی را بدون تغییر عبور می‌دهند**.

### چه چیزی می‌تواند آن را خراب کند

- سیاست کنترلر/لبه‌ای که هدرهای پاسخ را **بازنویسی** یا **حذف** می‌کند
- یک میان‌افزار «هدرهای امنیتی» که مقادیر متفاوتی برای COOP/COEP تنظیم می‌کند

### نحوهٔ بررسی

این را روی نقطهٔ پایانی عمومی خود اجرا کنید:

```bash
curl -I https://pdf.example.com/ | egrep -i 'cross-origin-opener-policy|cross-origin-embedder-policy'
```

باید این‌ها را ببینید:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

### اگر کنترلر Ingress شما آن‌ها را حفظ نمی‌کند

هدرها را در لبه اضافه کنید (وابسته به کنترلر). نمونه برای **nginx-ingress**:

```yaml
ingress:
  enabled: true
  className: nginx
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      add_header Cross-Origin-Opener-Policy "same-origin" always;
      add_header Cross-Origin-Embedder-Policy "require-corp" always;
```

## خطاهای نوع MIME برای `.mjs` (خالی بودن iframe امضای PDF / پرکنندهٔ فرم)

اگر کنسول مرورگر برای یک درخواست `.mjs` خطای `Failed to load module script: ... non-JavaScript MIME type "application/octet-stream"` را نشان می‌دهد، یک کنترلر Ingress/Gateway جلوی nginx در Pixel PDF هدر `Content-Type` بالادستی را با `application/octet-stream` جایگزین می‌کند.

nginx در ایمیج Pixel PDF از قبل `.mjs` را با `application/javascript` ارائه می‌دهد. راه‌حل این است که جلوی حذف یا جایگزینی آن توسط کنترلر را بگیرید. برای nginx-ingress:

```yaml
ingress:
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      location ~* \.mjs$ {
        types {} default_type application/javascript;
      }
```

یا از فیلتر `ResponseHeaderModifier` در Gateway API برای تنظیم `Content-Type: application/javascript` روی مسیرهای `.mjs` استفاده کنید. با DevTools ← زبانهٔ Network بررسی کنید: درخواست ناموفق `.mjs` اکنون باید `content-type: application/javascript` را نشان دهد.

### اگر از Gateway API استفاده می‌کنید و می‌خواهید هدرها را اجباری اضافه کنید

Gateway API از فیلتر `ResponseHeaderModifier` پشتیبانی می‌کند. می‌توانید آن را در `httpRoute.rules[*].filters` قرار دهید:

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

پشتیبانی از فیلترهای خاص به کنترلر Gateway شما بستگی دارد؛ اگر فیلتری نادیده گرفته شد، هدرها را به‌جای آن در لایهٔ لبه/کنترلر اضافه کنید.

## غیرفعال کردن ابزارهای خاص

از یک ConfigMap برای غیرفعال کردن ابزارها در زمان اجرا، بدون ساخت دوبارهٔ ایمیج، استفاده کنید:

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

آن را در پوشهٔ ارائه‌شده mount کنید:

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

شناسهٔ ابزارها همان URL صفحه بدون `.html` است؛ هر ابزاری را باز کنید و به URL نگاه کنید (مثلاً `edit-pdf`، `merge-pdf`، `compress-pdf`). ابزارهای غیرفعال از صفحهٔ اصلی، جستجو، میان‌برها، سازندهٔ گردش کار و دسترسی مستقیم با URL پنهان می‌شوند. برای فهرست کامل گزینه‌ها [راهنمای Docker](/fa/self-hosting/docker#غیرفعال-کردن-ابزارهای-مشخص) را ببینید.
