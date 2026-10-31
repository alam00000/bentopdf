# 用於擷取憑證的 CORS 代理

數位簽章工具使用 CORS 代理，從外部憑證授權單位（CA）擷取簽發者憑證。這是必要的，因為許多 CA 伺服器的回應不包含 CORS 標頭，導致瀏覽器無法直接擷取。

此外，許多 CA 伺服器以一般 HTTP 提供憑證。當您的 BentoPDF 執行個體以 HTTPS 架設時，瀏覽器會封鎖這些 HTTP 請求（混合內容政策）。CORS 代理透過具備正確標頭的 HTTPS 端點轉送請求，同時解決這兩個問題。

## 運作方式

以憑證簽署 PDF 時：

1. `zgapdfsigner` 函式庫會嘗試建立完整的憑證鏈
2. 它會從您憑證的 AIA（Authority Information Access）延伸欄位中內嵌的 URL 擷取簽發者憑證
3. 這些請求會透過 CORS 代理轉送，由代理加上必要的 `Access-Control-Allow-Origin` 標頭
4. 代理將憑證資料回傳給瀏覽器

## 自行架設 CORS 代理

如果您自行架設 BentoPDF，就需要部署自己的 CORS 代理，數位簽章才能搭配需要擷取憑證鏈的憑證使用。

### 選項 1：Cloudflare Workers（建議）

1. **安裝 Wrangler CLI**：

   ```bash
   npm install -g wrangler
   ```

2. **登入 Cloudflare**：

   ```bash
   wrangler login
   ```

3. **複製 BentoPDF 並更新允許的來源**：

   ```bash
   git clone https://github.com/alam00000/bentopdf.git
   cd bentopdf/cloudflare
   ```

   開啟 `cors-proxy-worker.js`，將 `ALLOWED_ORIGINS` 陣列改為您的網域：

   ```js
   const ALLOWED_ORIGINS = [
     'https://your-domain.com',
     'https://www.your-domain.com',
   ];
   ```

   ::: warning 重要
   若未進行此修改，代理會以 **403 Forbidden** 錯誤拒絕來自您網站的所有請求。預設只允許來自 `bentopdf.com` 的請求。
   :::

4. **部署代理**：

   ```bash
   wrangler deploy
   ```

   記下您的 worker URL（例如 `https://bentopdf-cors-proxy.your-subdomain.workers.dev`）。

5. **以代理 URL 重新建置 BentoPDF**：

   若使用 Docker：

   ```bash
   export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
   DOCKER_BUILDKIT=1 docker build \
     --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
     -t your-bentopdf .
   ```

   若從原始碼建置：

   ```bash
   VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
   ```

### 選項 2：自訂後端代理

您也可以建立自己的代理端點。需求如下：

1. 接受帶有 `url` 查詢參數的 GET 請求
2. 從您的伺服器擷取該 URL（伺服器端沒有 CORS 限制）
3. 回傳帶有以下標頭的回應：
   - `Access-Control-Allow-Origin: https://your-domain.com`
   - `Access-Control-Allow-Methods: GET, OPTIONS`
   - `X-Content-Type-Options: nosniff`

Express.js 實作範例：

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

## 安全性考量

內附的 Cloudflare Worker 具備多項安全措施：

| 功能                  | 說明                                                                    |
| --------------------- | ----------------------------------------------------------------------- |
| **來源驗證**          | 僅允許來自 `ALLOWED_ORIGINS` 所列網域的請求                             |
| **URL 限制**          | 僅允許憑證 URL（`.crt`、`.cer`、`.pem`、`/certs/`、`/ocsp`、`/crl`）    |
| **私人 IP 封鎖**      | 封鎖 IPv4/IPv6 私人範圍、link-local、迴路位址、十進位 IP 與雲端中繼資料 |
| **Content-Type 安全** | 僅回傳安全的憑證 MIME 類型，封鎖上游 content-type 注入                  |
| **檔案大小限制**      | 以 10MB 上限串流回應，超過時中途中止下載                                |
| **速率限制**          | 每個 IP 或 IPv6 /64 每分鐘 60 次請求（需要 KV，KV 發生錯誤時放行）      |
| **HMAC 簽章**         | 選用的用戶端簽署（嚇阻隨意濫用）                                        |

### DNS rebinding（在 Cloudflare 以外自行架設）

worker 會拒絕任何解析為私人或內部 IP 的 URL。它無法使用固定的主機允許清單，因為憑證鏈 URL 指向簽發該憑證的 CA（FNMT、企業 CA 等），事先無法得知目的地。這留下一個小小的 rebinding 空窗：掌控自己網域 DNS 的人，可以在安全檢查時回傳公開 IP，片刻後在實際請求時回傳私人 IP。

在 Cloudflare 上這無法被利用：Workers 無法連線到私人 IP 或 `169.254.169.254` 中繼資料端點，因此 rebind 不會打到任何東西。只要別給 worker 進入的管道即可：不要附加 Tunnel、Service 或私人網路繫結（它只需要 `RATE_LIMIT_KV`）。

如果您在 Cloudflare 以外（workerd、Node 等）於 VPC 內執行，執行環境*確實能*連線到內部 IP。請在前方設置對外防火牆並封鎖私人範圍：`10.0.0.0/8`、`172.16.0.0/12`、`192.168.0.0/16`、`127.0.0.0/8`、`169.254.0.0/16`，以及對應的 IPv6 範圍。離開 Cloudflare 後，應用程式碼無法強制執行這點。

## 停用代理

如果您不想使用 CORS 代理，請將環境變數設為空字串：

```
VITE_CORS_PROXY_URL=
```

**注意**：沒有代理時，使用需要從外部擷取憑證鏈的憑證（例如 FNMT 或部分企業 CA）簽署會失敗，並出現「Failed to fetch」錯誤。

## 疑難排解

### "Signing error: TypeError: Failed to fetch"

這通常代表以下其中之一：

1. **未設定 CORS 代理**：設定 `VITE_CORS_PROXY_URL` 並重新建置
2. **混合內容遭封鎖**：您的網站是 HTTPS，但憑證的簽發者 URL 是 HTTP。CORS 代理可解決此問題。
3. **CORS 代理拒絕您的來源**：確認您的網域在 `cors-proxy-worker.js` 的 `ALLOWED_ORIGINS` 陣列中

### 代理回傳「403 Forbidden」

您的網域不在 `ALLOWED_ORIGINS` 清單中。請編輯 `cors-proxy-worker.js`：

```js
const ALLOWED_ORIGINS = ['https://your-domain.com'];
```

然後重新部署：`npx wrangler deploy`

### 測試代理

```bash
curl -H "Origin: https://your-domain.com" \
  "https://your-proxy.workers.dev?url=http://www.cert.fnmt.es/certs/ACUSU.crt"
```

### 不需要代理的憑證

有些憑證在 P12/PFX 檔案中已包含完整憑證鏈，不需要從外部擷取：

- 自簽憑證
- 部分會附帶中繼憑證的商業 CA
- 您手動組合了完整憑證鏈的憑證
