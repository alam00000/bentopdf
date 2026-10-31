# Развертывание в Kubernetes

Kubernetes может быть избыточен для статического сайта, но он хорошо подходит, если вы уже стандартизировали процессы на Helm и GitOps.

> [!IMPORTANT]
> **Обязательные заголовки для конвертации офисных файлов**
>
> Инструментам на основе LibreOffice (конвертация Word, Excel, PowerPoint) для поддержки `SharedArrayBuffer` нужны следующие HTTP-заголовки:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> Официальные образы BentoPDF на nginx уже отправляют эти заголовки. В Kubernetes **контроллеры Ingress и Gateway тоже являются обратными прокси**, поэтому убедитесь, что заголовки сохраняются (или добавьте их на границе).

## Требования

- Кластер Kubernetes
- Helm v3
- Образ BentoPDF на nginx (например, `ghcr.io/alam00000/bentopdf:<tag>`), который работает на **порту 8080**

## Развертывание с помощью Helm

### Установка из этого репозитория (локальный чарт)

```bash
kubectl create namespace bentopdf

helm upgrade --install bentopdf /path/to/bentopdf/chart \
  --namespace bentopdf \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

### Установка из GHCR (чарт OCI)

Если чарт опубликован в GHCR как артефакт OCI:

```bash
export GHCR_USERNAME="<github-org-or-user>"

helm upgrade --install bentopdf oci://ghcr.io/$GHCR_USERNAME/charts/bentopdf \
  --namespace bentopdf \
  --create-namespace \
  --version 0.1.0 \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

## Как открыть доступ

### Port-forward (быстрая проверка)

```bash
kubectl -n bentopdf port-forward deploy/bentopdf 8080:8080
```

### Ingress (необязательно)

Включите Ingress (пример для nginx-ingress):

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

### Gateway API (необязательно)

Чарт поддерживает `Gateway` и `HTTPRoute` из Gateway API.

Пример (оператор Cloudflare Gateway API):

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

## Сохранение заголовков SharedArrayBuffer (Ingress/Gateway)

### Что должно происходить

Конфигурация nginx в BentoPDF задает нужные заголовки ответа. Большинство контроллеров Ingress и Gateway **передают заголовки ответа апстрима без изменений**.

### Что может сломаться

- Политика контроллера или границы, которая **переопределяет** или **удаляет** заголовки ответа
- Промежуточный слой «заголовков безопасности», который задает другие значения COOP/COEP

### Как проверить

Выполните команду для вашего публичного адреса:

```bash
curl -I https://pdf.example.com/ | egrep -i 'cross-origin-opener-policy|cross-origin-embedder-policy'
```

Вы должны увидеть:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

### Если ваш контроллер Ingress не сохраняет заголовки

Добавьте заголовки на границе (способ зависит от контроллера). Пример для **nginx-ingress**:

```yaml
ingress:
  enabled: true
  className: nginx
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      add_header Cross-Origin-Opener-Policy "same-origin" always;
      add_header Cross-Origin-Embedder-Policy "require-corp" always;
```

## Ошибки MIME-типа `.mjs` (пустой iframe в Sign PDF / Form Filler)

Если в консоли браузера появляется `Failed to load module script: ... non-JavaScript MIME type "application/octet-stream"` для запроса `.mjs`, значит контроллер Ingress или Gateway перед nginx из BentoPDF подменяет заголовок `Content-Type` апстрима на `application/octet-stream`.

Nginx в образе BentoPDF уже отдает `.mjs` как `application/javascript`. Нужно запретить контроллеру удалять или заменять этот заголовок. Для nginx-ingress:

```yaml
ingress:
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      location ~* \.mjs$ {
        types {} default_type application/javascript;
      }
```

Либо используйте фильтр `ResponseHeaderModifier` в Gateway API, чтобы задать `Content-Type: application/javascript` для путей `.mjs`. Проверьте на вкладке Network в DevTools: у неудавшегося запроса `.mjs` теперь должно быть `content-type: application/javascript`.

### Если вы используете Gateway API и хотите принудительно добавить заголовки

Gateway API поддерживает фильтр `ResponseHeaderModifier`. Его можно подключить в `httpRoute.rules[*].filters`:

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

Поддержка конкретных фильтров зависит от вашего контроллера Gateway. Если фильтр игнорируется, добавьте заголовки на уровне границы или контроллера.

## Отключение отдельных инструментов

Используйте ConfigMap, чтобы отключать инструменты во время работы без пересборки образа:

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

Смонтируйте его в раздаваемую директорию:

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

Идентификаторы инструментов совпадают с URL страницы без `.html`: откройте любой инструмент и посмотрите на адрес (например, `edit-pdf`, `merge-pdf`, `compress-pdf`). Отключенные инструменты скрыты с главной страницы, из поиска, быстрых клавиш, конструктора рабочих процессов и недоступны по прямому URL. Полный список параметров смотрите в [руководстве по Docker](/ru/self-hosting/docker#отключение-отдельных-инструментов).
