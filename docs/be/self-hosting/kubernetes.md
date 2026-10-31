# Разгортванне з Kubernetes

Kubernetes можа быць залішнім для статычнага сайта, але выдатна падыходзіць, калі вы ўжо карыстаецеся Helm + GitOps як стандартам.

> [!IMPORTANT]
> **Абавязковыя загалоўкі для пераўтварэння офісных файлаў**
>
> Інструменты на базе LibreOffice (пераўтварэнне Word, Excel, PowerPoint) патрабуюць гэтыя HTTP-загалоўкі для падтрымкі `SharedArrayBuffer`:
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> Афіцыйныя вобразы BentoPDF з nginx уключаюць гэтыя загалоўкі. У Kubernetes **кантролеры Ingress/Gateway таксама з'яўляюцца зваротнымі проксі**, таму пераканайцеся, што гэтыя загалоўкі захоўваюцца (або дадайце іх на краі).

## Патрабаванні

- Кластар Kubernetes
- Helm v3
- Вобраз BentoPDF з nginx (напрыклад, `ghcr.io/alam00000/bentopdf:<tag>`), які працуе на **порце 8080**

## Разгортванне з Helm

### Усталяванне з гэтага рэпазіторыя (лакальны chart)

```bash
kubectl create namespace bentopdf

helm upgrade --install bentopdf /path/to/bentopdf/chart \
  --namespace bentopdf \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

### Усталяванне з GHCR (OCI chart)

Калі chart апублікаваны ў GHCR як артэфакт OCI:

```bash
export GHCR_USERNAME="<github-org-or-user>"

helm upgrade --install bentopdf oci://ghcr.io/$GHCR_USERNAME/charts/bentopdf \
  --namespace bentopdf \
  --create-namespace \
  --version 0.1.0 \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

## Адкрыццё доступу

### Port-forward (хуткая праверка)

```bash
kubectl -n bentopdf port-forward deploy/bentopdf 8080:8080
```

### Ingress (неабавязкова)

Уключыце Ingress (прыклад для nginx-ingress):

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

### Gateway API (неабавязкова)

Гэты chart падтрымлівае Gateway API `Gateway` + `HTTPRoute`.

Прыклад (аператар Cloudflare Gateway API):

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

## Як пераканацца, што загалоўкі SharedArrayBuffer працуюць (Ingress/Gateway)

### Што "павінна" адбывацца

Канфігурацыя nginx у BentoPDF задае патрэбныя загалоўкі адказу. Большасць кантролераў Ingress/Gateway **перадаюць загалоўкі адказу ад upstream без змен**.

### Што можа гэта зламаць

- Палітыка кантролера/краю, якая **перавызначае** або **выдаляе** загалоўкі адказу
- Прамежкавае ПЗ для "security headers", якое задае іншыя значэнні COOP/COEP

### Як праверыць

Выканайце гэта для свайго публічнага адраса:

```bash
curl -I https://pdf.example.com/ | egrep -i 'cross-origin-opener-policy|cross-origin-embedder-policy'
```

Вы павінны ўбачыць:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

### Калі ваш кантролер Ingress не захоўвае іх

Дадайце загалоўкі на краі (залежыць ад кантролера). Прыклад для **nginx-ingress**:

```yaml
ingress:
  enabled: true
  className: nginx
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      add_header Cross-Origin-Opener-Policy "same-origin" always;
      add_header Cross-Origin-Embedder-Policy "require-corp" always;
```

## Памылкі MIME-тыпу `.mjs` (пусты iframe у Падпісаць PDF / Запаўненне форм)

Калі ў кансолі браўзера бачна `Failed to load module script: ... non-JavaScript MIME type "application/octet-stream"` для запыту `.mjs`, кантролер Ingress/Gateway перад nginx BentoPDF замяняе загаловак `Content-Type` ад upstream на `application/octet-stream`.

Nginx у вобразе BentoPDF ужо аддае `.mjs` як `application/javascript`. Рашэнне: забараніць кантролеру выдаляць або замяняць яго. Для nginx-ingress:

```yaml
ingress:
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      location ~* \.mjs$ {
        types {} default_type application/javascript;
      }
```

Або выкарыстайце фільтр `ResponseHeaderModifier` у Gateway API, каб задаць `Content-Type: application/javascript` для шляхоў `.mjs`. Праверце ў DevTools → укладка Network: няўдалы раней запыт `.mjs` цяпер павінен паказваць `content-type: application/javascript`.

### Калі вы выкарыстоўваеце Gateway API і хочаце прымусова дадаць загалоўкі

Gateway API падтрымлівае фільтр `ResponseHeaderModifier`. Яго можна далучыць у `httpRoute.rules[*].filters`:

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

Падтрымка пэўных фільтраў залежыць ад вашага кантролера Gateway; калі фільтр ігнаруецца, дадайце загалоўкі на ўзроўні краю/кантролера.

## Адключэнне пэўных інструментаў

Выкарыстайце ConfigMap, каб адключаць інструменты падчас выканання без перазборкі вобраза:

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

Падключыце яго ў каталог, які раздаецца:

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

Ідэнтыфікатары інструментаў: гэта URL старонкі без `.html`. Адкрыйце любы інструмент і паглядзіце на URL (напрыклад, `edit-pdf`, `merge-pdf`, `compress-pdf`). Адключаныя інструменты схаваныя з галоўнай старонкі, пошуку, спалучэнняў клавіш, канструктара працоўных працэсаў і недаступныя па прамым URL. Поўны спіс параметраў глядзіце ў [кіраўніцтве па Docker](/be/self-hosting/docker#адключэнне-асобных-інструментау).
