# Розгортання в Kubernetes

Kubernetes може бути надмірним для статичного сайту, але він чудово підходить, якщо ви вже стандартизувалися на Helm + GitOps.

> [!IMPORTANT]
> **Обов’язкові заголовки для перетворення офісних файлів**
>
> Інструменти на основі LibreOffice (перетворення Word, Excel, PowerPoint) потребують таких HTTP-заголовків для підтримки `SharedArrayBuffer`:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> Офіційні образи BentoPDF на nginx містять ці заголовки. У Kubernetes **контролери Ingress/Gateway також є зворотними проксі**, тож переконайтеся, що ці заголовки зберігаються (або додайте їх на межі).

## Вимоги

- Кластер Kubernetes
- Helm v3
- Образ BentoPDF на nginx (наприклад, `ghcr.io/alam00000/bentopdf:<tag>`), що обслуговує **порт 8080**

## Розгортання через Helm

### Встановлення з цього репозиторію (локальний чарт)

```bash
kubectl create namespace bentopdf

helm upgrade --install bentopdf /path/to/bentopdf/chart \
  --namespace bentopdf \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

### Встановлення з GHCR (OCI-чарт)

Якщо чарт опубліковано в GHCR як артефакт OCI:

```bash
export GHCR_USERNAME="<github-org-or-user>"

helm upgrade --install bentopdf oci://ghcr.io/$GHCR_USERNAME/charts/bentopdf \
  --namespace bentopdf \
  --create-namespace \
  --version 0.1.0 \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

## Відкриття доступу

### Port-forward (швидка перевірка)

```bash
kubectl -n bentopdf port-forward deploy/bentopdf 8080:8080
```

### Ingress (необов’язково)

Увімкніть Ingress (приклад для nginx-ingress):

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

### Gateway API (необов’язково)

Цей чарт підтримує Gateway API `Gateway` + `HTTPRoute`.

Приклад (оператор Cloudflare Gateway API):

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

## Як переконатися, що заголовки SharedArrayBuffer працюють (Ingress/Gateway)

### Що "має" відбуватися

Конфігурація nginx у BentoPDF встановлює потрібні заголовки відповіді. Більшість контролерів Ingress/Gateway **передають заголовки відповіді вихідного сервера без змін**.

### Що може це зламати

- Політика контролера/межі, що **перевизначає** або **видаляє** заголовки відповіді
- Проміжне ПЗ "security headers", яке встановлює інші значення COOP/COEP

### Як перевірити

Виконайте це для свого публічного endpoint:

```bash
curl -I https://pdf.example.com/ | egrep -i 'cross-origin-opener-policy|cross-origin-embedder-policy'
```

Ви маєте побачити:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

### Якщо ваш контролер Ingress їх не зберігає

Додайте заголовки на межі (залежить від контролера). Приклад для **nginx-ingress**:

```yaml
ingress:
  enabled: true
  className: nginx
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      add_header Cross-Origin-Opener-Policy "same-origin" always;
      add_header Cross-Origin-Embedder-Policy "require-corp" always;
```

## Помилки MIME-типу `.mjs` (порожній iframe у Sign PDF / Form Filler)

Якщо консоль браузера показує `Failed to load module script: ... non-JavaScript MIME type "application/octet-stream"` для запиту `.mjs`, то контролер Ingress/Gateway перед nginx BentoPDF підмінює заголовок `Content-Type` вихідного сервера на `application/octet-stream`.

nginx в образі BentoPDF уже віддає `.mjs` як `application/javascript`. Рішення: заборонити контролеру видаляти/замінювати його. Для nginx-ingress:

```yaml
ingress:
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      location ~* \.mjs$ {
        types {} default_type application/javascript;
      }
```

Або скористайтеся фільтром `ResponseHeaderModifier` у Gateway API, щоб встановити `Content-Type: application/javascript` для шляхів `.mjs`. Перевірте у DevTools → вкладка Network: невдалий запит `.mjs` тепер має показувати `content-type: application/javascript`.

### Якщо ви використовуєте Gateway API і хочете примусово додати заголовки

Gateway API підтримує фільтр `ResponseHeaderModifier`. Його можна підключити в `httpRoute.rules[*].filters`:

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

Підтримка окремих фільтрів залежить від вашого контролера Gateway; якщо фільтр ігнорується, додайте заголовки на рівні межі/контролера.

## Вимкнення окремих інструментів

Використайте ConfigMap, щоб вимкнути інструменти під час виконання без перебудови образу:

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

Змонтуйте його в каталог, що обслуговується:

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

Ідентифікатори інструментів є URL сторінки без `.html`: відкрийте будь-який інструмент і подивіться на URL (наприклад, `edit-pdf`, `merge-pdf`, `compress-pdf`). Вимкнені інструменти приховуються на головній сторінці, у пошуку, ярликах, конструкторі робочих процесів і при прямому доступі за URL. Повний перелік параметрів дивіться в [посібнику з Docker](/uk/self-hosting/docker#вимкнення-окремих-інструментів).
