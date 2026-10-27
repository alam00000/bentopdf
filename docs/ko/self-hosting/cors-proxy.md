# 인증서 가져오기용 CORS 프록시

디지털 서명 도구는 CORS 프록시를 사용해 외부 인증 기관(CA)에서 발급자 인증서를 가져옵니다. 많은 CA 서버가 응답에 CORS 헤더를 포함하지 않아 브라우저에서 직접 가져올 수 없기 때문입니다.

또한 많은 CA 서버가 일반 HTTP로 인증서를 제공합니다. BentoPDF 인스턴스가 HTTPS로 호스팅되면 브라우저가 이러한 HTTP 요청을 차단합니다(혼합 콘텐츠 정책). CORS 프록시는 적절한 헤더를 붙인 HTTPS 엔드포인트를 거쳐 요청을 전달하여 두 문제를 모두 해결합니다.

## 작동 방식

인증서로 PDF에 서명할 때:

1. `zgapdfsigner` 라이브러리가 전체 인증서 체인을 구성하려고 시도합니다
2. 인증서의 AIA(Authority Information Access) 확장에 포함된 URL에서 발급자 인증서를 가져옵니다
3. 이 요청은 필요한 `Access-Control-Allow-Origin` 헤더를 추가하는 CORS 프록시를 거칩니다
4. 프록시가 인증서 데이터를 브라우저에 반환합니다

## CORS 프록시 직접 호스팅하기

BentoPDF를 직접 호스팅한다면, 체인 가져오기가 필요한 인증서로 디지털 서명이 작동하도록 자체 CORS 프록시를 배포해야 합니다.

### 옵션 1: Cloudflare Workers (권장)

1. **Wrangler CLI 설치**:

   ```bash
   npm install -g wrangler
   ```

2. **Cloudflare에 로그인**:

   ```bash
   wrangler login
   ```

3. **BentoPDF를 클론하고 허용 origin 업데이트**:

   ```bash
   git clone https://github.com/alam00000/bentopdf.git
   cd bentopdf/cloudflare
   ```

   `cors-proxy-worker.js`를 열고 `ALLOWED_ORIGINS` 배열을 사용자의 도메인으로 변경하세요:

   ```js
   const ALLOWED_ORIGINS = [
     'https://your-domain.com',
     'https://www.your-domain.com',
   ];
   ```

   ::: warning 중요
   이 변경이 없으면 프록시가 사이트의 모든 요청을 **403 Forbidden** 오류로 거부합니다. 기본값은 `bentopdf.com`의 요청만 허용합니다.
   :::

4. **프록시 배포**:

   ```bash
   wrangler deploy
   ```

   worker URL을 메모해 두세요 (예: `https://bentopdf-cors-proxy.your-subdomain.workers.dev`).

5. **프록시 URL로 BentoPDF 다시 빌드**:

   Docker를 사용하는 경우:

   ```bash
   export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
   DOCKER_BUILDKIT=1 docker build \
     --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
     -t your-bentopdf .
   ```

   소스에서 빌드하는 경우:

   ```bash
   VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
   ```

### 옵션 2: 사용자 지정 백엔드 프록시

자체 프록시 엔드포인트를 만들 수도 있습니다. 요구 사항은 다음과 같습니다:

1. `url` 쿼리 매개변수가 있는 GET 요청을 받습니다
2. 서버에서 해당 URL을 가져옵니다 (서버 측에는 CORS 제한이 없습니다)
3. 다음 헤더와 함께 응답을 반환합니다:
   - `Access-Control-Allow-Origin: https://your-domain.com`
   - `Access-Control-Allow-Methods: GET, OPTIONS`
   - `X-Content-Type-Options: nosniff`

Express.js 구현 예시:

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

## 보안 고려 사항

포함된 Cloudflare Worker에는 여러 보안 장치가 있습니다:

| 기능                    | 설명                                                                        |
| ----------------------- | --------------------------------------------------------------------------- |
| **Origin 검증**         | `ALLOWED_ORIGINS`에 나열된 도메인의 요청만 허용                             |
| **URL 제한**            | 인증서 URL만 허용 (`.crt`, `.cer`, `.pem`, `/certs/`, `/ocsp`, `/crl`)      |
| **사설 IP 차단**        | IPv4/IPv6 사설 대역, 링크 로컬, 루프백, 십진수 IP, 클라우드 메타데이터 차단 |
| **Content-Type 안전성** | 안전한 인증서 MIME 타입만 반환하고, 업스트림 content-type 주입 차단         |
| **파일 크기 제한**      | 응답을 10MB 제한으로 스트리밍하며, 초과하면 다운로드 도중 중단              |
| **속도 제한**           | IP 또는 IPv6 /64당 분당 60회 (KV 필요, KV 오류 시 fail open)                |
| **HMAC 서명**           | 선택적 클라이언트 측 서명 (단순한 악용 억제)                                |

### DNS 리바인딩 (Cloudflare 외부에서 직접 호스팅하는 경우)

worker는 사설 또는 내부 IP로 확인되는 모든 URL을 거부합니다. 인증서 체인 URL은 인증서를 발급한 CA(FNMT, 기업 CA 등)가 가리키는 곳 어디든 될 수 있어 미리 정해진 호스트 허용 목록을 쓸 수 없고, 목적지를 사전에 알 수 없습니다. 그래서 작은 리바인딩 틈이 남습니다. 자기 도메인의 DNS를 운영하는 누군가가 안전 검사에는 공개 IP를, 잠시 후의 실제 요청에는 사설 IP를 돌려줄 수 있습니다.

Cloudflare에서는 악용할 수 없습니다. Workers는 사설 IP나 `169.254.169.254` 메타데이터 엔드포인트에 접근할 수 없으므로 리바인딩해도 아무것도 닿지 않습니다. 다만 worker에 진입 경로를 만들지 마세요. Tunnel, Service, 사설 네트워크 바인딩을 연결하지 마세요 (필요한 것은 `RATE_LIMIT_KV`뿐입니다).

VPC 안에서 Cloudflare 외부(workerd, Node 등)로 실행하면 런타임이 내부 IP에 _접근할 수 있습니다_. 앞단에 송신 방화벽을 두고 사설 대역(`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16` 및 해당 IPv6 대역)을 차단하세요. Cloudflare를 벗어나면 앱 코드로는 이를 강제할 수 없습니다.

## 프록시 비활성화

CORS 프록시를 사용하고 싶지 않다면 환경 변수를 빈 문자열로 설정하세요:

```
VITE_CORS_PROXY_URL=
```

**참고**: 프록시가 없으면 외부 체인 가져오기가 필요한 인증서(FNMT 또는 일부 기업 CA 등)로 서명할 때 "Failed to fetch" 오류가 발생합니다.

## 문제 해결

### "Signing error: TypeError: Failed to fetch"

보통 다음 중 하나를 의미합니다:

1. **CORS 프록시가 설정되지 않음**: `VITE_CORS_PROXY_URL`을 설정하고 다시 빌드하세요
2. **혼합 콘텐츠 차단됨**: 사이트는 HTTPS인데 인증서의 발급자 URL은 HTTP입니다. CORS 프록시가 이를 해결합니다.
3. **CORS 프록시가 origin을 거부함**: `cors-proxy-worker.js`의 `ALLOWED_ORIGINS` 배열에 도메인이 있는지 확인하세요

### 프록시에서 "403 Forbidden"

도메인이 `ALLOWED_ORIGINS` 목록에 없습니다. `cors-proxy-worker.js`를 수정하세요:

```js
const ALLOWED_ORIGINS = ['https://your-domain.com'];
```

그런 다음 다시 배포하세요: `npx wrangler deploy`

### 프록시 테스트

```bash
curl -H "Origin: https://your-domain.com" \
  "https://your-proxy.workers.dev?url=http://www.cert.fnmt.es/certs/ACUSU.crt"
```

### 프록시 없이 작동하는 인증서

일부 인증서는 P12/PFX 파일에 전체 체인이 포함되어 있어 외부 가져오기가 필요하지 않습니다:

- 자체 서명 인증서
- 중간 인증서를 번들하는 일부 상용 CA
- 전체 체인을 직접 조립한 인증서
