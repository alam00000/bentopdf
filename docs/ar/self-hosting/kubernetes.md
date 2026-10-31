# النشر باستخدام Kubernetes

قد يكون Kubernetes أكثر مما يلزم لموقع ثابت، لكنه قد يكون خيارًا ممتازًا إذا كنت تعتمد أصلًا Helm وGitOps.

> [!IMPORTANT]
> **الترويسات المطلوبة لتحويل ملفات Office**
>
> تتطلب الأدوات المعتمدة على LibreOffice (تحويل Word وExcel وPowerPoint) ترويسات HTTP هذه لدعم `SharedArrayBuffer`:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> تتضمن صور nginx الرسمية لـ BentoPDF هذه الترويسات. في Kubernetes، **تُعد وحدات تحكم Ingress/Gateway أيضًا وكلاء عكسيين**، لذا تأكد من الحفاظ على هذه الترويسات (أو أضفها على الحافة).

## المتطلبات المسبقة

- عنقود Kubernetes
- Helm v3
- صورة nginx لـ BentoPDF (مثل `ghcr.io/alam00000/bentopdf:<tag>`) تعمل على **المنفذ 8080**

## النشر باستخدام Helm

### التثبيت من هذا المستودع (مخطط محلي)

```bash
kubectl create namespace bentopdf

helm upgrade --install bentopdf /path/to/bentopdf/chart \
  --namespace bentopdf \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

### التثبيت من GHCR (مخطط OCI)

إذا كان المخطط منشورًا على GHCR كعنصر OCI:

```bash
export GHCR_USERNAME="<github-org-or-user>"

helm upgrade --install bentopdf oci://ghcr.io/$GHCR_USERNAME/charts/bentopdf \
  --namespace bentopdf \
  --create-namespace \
  --version 0.1.0 \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

## إتاحته

### إعادة توجيه المنفذ (اختبار سريع)

```bash
kubectl -n bentopdf port-forward deploy/bentopdf 8080:8080
```

### Ingress (اختياري)

فعّل Ingress (مثال لـ nginx-ingress):

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

### Gateway API (اختياري)

يدعم هذا المخطط `Gateway` + `HTTPRoute` الخاصين بـ Gateway API.

مثال (مشغّل Cloudflare Gateway API):

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

## التأكد من استمرار عمل ترويسات SharedArrayBuffer (Ingress/Gateway)

### ما الذي "يجب" أن يحدث

يضبط إعداد nginx في BentoPDF ترويسات الاستجابة المطلوبة. تقوم معظم وحدات تحكم Ingress/Gateway بـ**تمرير ترويسات استجابة المصدر كما هي دون تغيير**.

### ما الذي قد يعطّل ذلك

- سياسة في وحدة التحكم أو على الحافة **تستبدل** ترويسات الاستجابة أو **تحذفها**
- وسيط "ترويسات أمان" يضبط قيم COOP/COEP مختلفة

### كيف تتحقق

نفّذ هذا على نقطة النهاية العامة لديك:

```bash
curl -I https://pdf.example.com/ | egrep -i 'cross-origin-opener-policy|cross-origin-embedder-policy'
```

يجب أن ترى:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

### إذا كانت وحدة تحكم Ingress لا تحافظ عليها

أضف الترويسات على الحافة (بحسب وحدة التحكم). مثال لـ **nginx-ingress**:

```yaml
ingress:
  enabled: true
  className: nginx
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      add_header Cross-Origin-Opener-Policy "same-origin" always;
      add_header Cross-Origin-Embedder-Policy "require-corp" always;
```

## أخطاء نوع MIME لملفات `.mjs` (عارض توقيع PDF / ملء النماذج فارغ)

إذا عرضت وحدة تحكم المتصفح `Failed to load module script: ... non-JavaScript MIME type "application/octet-stream"` عند طلب `.mjs`، فإن وحدة تحكم Ingress/Gateway الموجودة أمام nginx الخاص بـ BentoPDF تستبدل ترويسة `Content-Type` الأصلية بـ `application/octet-stream`.

يقدّم nginx في صورة BentoPDF ملفات `.mjs` أصلًا بنوع `application/javascript`. الحل هو منع وحدة التحكم من حذفها أو استبدالها. بالنسبة إلى nginx-ingress:

```yaml
ingress:
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      location ~* \.mjs$ {
        types {} default_type application/javascript;
      }
```

أو استخدم مرشح `ResponseHeaderModifier` في Gateway API لضبط `Content-Type: application/javascript` لمسارات `.mjs`. تحقق عبر DevTools ثم تبويب Network: يجب أن يعرض طلب `.mjs` الفاشل الآن `content-type: application/javascript`.

### إذا كنت تستخدم Gateway API وتريد إضافة الترويسات قسرًا

يدعم Gateway API مرشح `ResponseHeaderModifier`. يمكنك إرفاقه في `httpRoute.rules[*].filters`:

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

يعتمد دعم مرشحات محددة على وحدة تحكم Gateway لديك. إذا تم تجاهل مرشح، فأضف الترويسات في طبقة الحافة/وحدة التحكم بدلًا من ذلك.

## تعطيل أدوات محددة

استخدم ConfigMap لتعطيل الأدوات وقت التشغيل دون إعادة بناء الصورة:

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

اربطه بالمجلد المقدَّم:

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

معرّفات الأدوات هي عنوان URL للصفحة بدون `.html`: افتح أي أداة وانظر إلى العنوان (مثل `edit-pdf` و`merge-pdf` و`compress-pdf`). تُخفى الأدوات المعطلة من الصفحة الرئيسية والبحث والاختصارات ومنشئ سير العمل والوصول المباشر عبر URL. راجع [دليل Docker](/ar/self-hosting/docker#تعطيل-أدوات-محددة) للاطلاع على القائمة الكاملة للخيارات.
