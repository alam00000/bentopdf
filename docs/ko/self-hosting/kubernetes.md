# Kubernetes로 배포하기

정적 사이트에 Kubernetes는 과할 수 있지만, 이미 Helm + GitOps를 표준으로 사용하고 있다면 잘 맞을 수 있습니다.

> [!IMPORTANT]
> **Office 파일 변환에 필요한 헤더**
>
> LibreOffice 기반 도구(Word, Excel, PowerPoint 변환)에는 `SharedArrayBuffer` 지원을 위해 다음 HTTP 헤더가 필요합니다.
>
> - `Cross-Origin-Opener-Policy: same-origin`
> - `Cross-Origin-Embedder-Policy: require-corp`
>
> 공식 BentoPDF nginx 이미지에는 이 헤더가 포함되어 있습니다. Kubernetes에서는 **Ingress/Gateway 컨트롤러도 리버스 프록시**이므로 이 헤더가 유지되는지 확인하거나 엣지에서 추가하세요.

## 사전 준비

- Kubernetes 클러스터
- Helm v3
- **8080 포트**로 서비스하는 BentoPDF nginx 이미지 (예: `ghcr.io/alam00000/bentopdf:<tag>`)

## Helm으로 배포

### 이 저장소에서 설치 (로컬 차트)

```bash
kubectl create namespace bentopdf

helm upgrade --install bentopdf /path/to/bentopdf/chart \
  --namespace bentopdf \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

### GHCR에서 설치 (OCI 차트)

차트가 OCI 아티팩트로 GHCR에 게시된 경우:

```bash
export GHCR_USERNAME="<github-org-or-user>"

helm upgrade --install bentopdf oci://ghcr.io/$GHCR_USERNAME/charts/bentopdf \
  --namespace bentopdf \
  --create-namespace \
  --version 0.1.0 \
  --set image.repository=ghcr.io/alam00000/bentopdf \
  --set image.tag=latest
```

## 외부에 노출하기

### 포트 포워딩 (빠른 테스트)

```bash
kubectl -n bentopdf port-forward deploy/bentopdf 8080:8080
```

### Ingress (선택 사항)

Ingress를 활성화합니다 (nginx-ingress 예시).

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

### Gateway API (선택 사항)

이 차트는 Gateway API의 `Gateway`와 `HTTPRoute`를 지원합니다.

예시 (Cloudflare Gateway API 오퍼레이터):

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

## SharedArrayBuffer 헤더가 계속 작동하는지 확인 (Ingress/Gateway)

### 정상적으로 일어나야 하는 일

BentoPDF의 nginx 설정이 필요한 응답 헤더를 설정합니다. 대부분의 Ingress/Gateway 컨트롤러는 **업스트림 응답 헤더를 그대로 전달**합니다.

### 문제가 생길 수 있는 경우

- 응답 헤더를 **덮어쓰거나** **제거**하는 컨트롤러/엣지 정책
- 다른 COOP/COEP 값을 설정하는 "보안 헤더" 미들웨어

### 확인 방법

공개 엔드포인트에 대해 다음을 실행합니다.

```bash
curl -I https://pdf.example.com/ | egrep -i 'cross-origin-opener-policy|cross-origin-embedder-policy'
```

다음이 표시되어야 합니다.

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

### Ingress 컨트롤러가 헤더를 유지하지 않는 경우

엣지에서 헤더를 추가합니다(컨트롤러마다 다름). **nginx-ingress** 예시:

```yaml
ingress:
  enabled: true
  className: nginx
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      add_header Cross-Origin-Opener-Policy "same-origin" always;
      add_header Cross-Origin-Embedder-Policy "require-corp" always;
```

## `.mjs` MIME 타입 오류 (PDF 서명 / 양식 작성기 iframe이 비어 있음)

브라우저 콘솔에 `.mjs` 요청에 대해 `Failed to load module script: ... non-JavaScript MIME type "application/octet-stream"`이 표시되면, BentoPDF nginx 앞단의 Ingress/Gateway 컨트롤러가 업스트림 `Content-Type` 헤더를 `application/octet-stream`으로 바꾸고 있는 것입니다.

BentoPDF 이미지의 nginx는 이미 `.mjs`를 `application/javascript`로 제공합니다. 해결 방법은 컨트롤러가 이를 제거하거나 바꾸지 못하게 하는 것입니다. nginx-ingress의 경우:

```yaml
ingress:
  annotations:
    nginx.ingress.kubernetes.io/configuration-snippet: |
      location ~* \.mjs$ {
        types {} default_type application/javascript;
      }
```

또는 Gateway API의 `ResponseHeaderModifier` 필터를 사용해 `.mjs` 경로에 `Content-Type: application/javascript`를 설정할 수 있습니다. DevTools → Network 탭에서 확인하세요. 실패했던 `.mjs` 요청에 `content-type: application/javascript`가 표시되어야 합니다.

### Gateway API를 사용하며 헤더를 강제로 추가하려는 경우

Gateway API는 `ResponseHeaderModifier` 필터를 지원합니다. `httpRoute.rules[*].filters`에 연결할 수 있습니다.

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

특정 필터의 지원 여부는 Gateway 컨트롤러에 따라 다릅니다. 필터가 무시되면 엣지/컨트롤러 계층에서 헤더를 추가하세요.

## 특정 도구 비활성화

이미지를 다시 빌드하지 않고 ConfigMap으로 런타임에 도구를 비활성화합니다.

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

서비스되는 디렉터리에 마운트합니다.

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

도구 ID는 `.html`을 뺀 페이지 URL입니다. 아무 도구나 열어 URL을 확인하세요(예: `edit-pdf`, `merge-pdf`, `compress-pdf`). 비활성화된 도구는 홈페이지, 검색, 단축키, 워크플로 빌더, 직접 URL 접근에서 숨겨집니다. 전체 옵션 목록은 [Docker 가이드](/ko/self-hosting/docker#특정-도구-비활성화)를 참고하세요.
