# 証明書取得用のCORSプロキシ

デジタル署名ツールは、外部の認証局（CA）から発行者証明書を取得するためにCORSプロキシを使います。多くのCAサーバーはレスポンスにCORSヘッダーを含めないため、ブラウザから直接取得することができません。

さらに、多くのCAサーバーはプレーンなHTTPで証明書を提供しています。BentoPDFのインスタンスをHTTPSでホストしている場合、ブラウザはこれらのHTTPリクエストをブロックします（混合コンテンツポリシー）。CORSプロキシは、適切なヘッダーを付けたHTTPSエンドポイント経由でリクエストを中継することで、この2つの問題を解決します。

## 仕組み

証明書でPDFに署名するとき：

1. `zgapdfsigner` ライブラリが完全な証明書チェーンの構築を試みます
2. 証明書のAIA（Authority Information Access）拡張に埋め込まれたURLから、発行者証明書を取得します
3. これらのリクエストは、必要な `Access-Control-Allow-Origin` ヘッダーを追加するCORSプロキシ経由で送られます
4. プロキシが証明書データをブラウザに返します

## CORSプロキシのセルフホスト

BentoPDFをセルフホストしている場合、チェーンの取得が必要な証明書でデジタル署名を使うには、独自のCORSプロキシをデプロイする必要があります。

### オプション1：Cloudflare Workers（推奨）

1. **Wrangler CLIをインストールする**：

   ```bash
   npm install -g wrangler
   ```

2. **Cloudflareにログインする**：

   ```bash
   wrangler login
   ```

3. **BentoPDFをクローンし、許可するオリジンを更新する**：

   ```bash
   git clone https://github.com/alam00000/bentopdf.git
   cd bentopdf/cloudflare
   ```

   `cors-proxy-worker.js` を開き、`ALLOWED_ORIGINS` 配列を自分のドメインに変更します。

   ```js
   const ALLOWED_ORIGINS = [
     'https://your-domain.com',
     'https://www.your-domain.com',
   ];
   ```

   ::: warning 重要
   この変更をしないと、プロキシはサイトからのすべてのリクエストを **403 Forbidden** エラーで拒否します。デフォルトでは `bentopdf.com` からのリクエストのみ許可されています。
   :::

4. **プロキシをデプロイする**：

   ```bash
   wrangler deploy
   ```

   WorkerのURL（例：`https://bentopdf-cors-proxy.your-subdomain.workers.dev`）を控えておきます。

5. **プロキシURLを指定してBentoPDFを再ビルドする**：

   Dockerを使う場合：

   ```bash
   export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
   DOCKER_BUILDKIT=1 docker build \
     --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
     -t your-bentopdf .
   ```

   ソースからビルドする場合：

   ```bash
   VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
   ```

### オプション2：独自のバックエンドプロキシ

独自のプロキシエンドポイントを作ることもできます。要件は次のとおりです。

1. `url` クエリパラメータ付きのGETリクエストを受け付ける
2. サーバーからそのURLを取得する（サーバー側ではCORSの制限はありません）
3. 次のヘッダーを付けてレスポンスを返す：
   - `Access-Control-Allow-Origin: https://your-domain.com`
   - `Access-Control-Allow-Methods: GET, OPTIONS`
   - `X-Content-Type-Options: nosniff`

Express.jsでの実装例：

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

## セキュリティ上の考慮事項

同梱のCloudflare Workerには、いくつかのセキュリティ対策があります。

| 機能                         | 説明                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------- |
| **オリジン検証**             | `ALLOWED_ORIGINS` に記載されたドメインからのリクエストのみ許可                                    |
| **URL制限**                  | 証明書のURL（`.crt`、`.cer`、`.pem`、`/certs/`、`/ocsp`、`/crl`）のみ許可                         |
| **プライベートIPのブロック** | IPv4/IPv6のプライベート範囲、リンクローカル、ループバック、10進数IP、クラウドメタデータをブロック |
| **Content-Typeの安全性**     | 安全な証明書のMIMEタイプのみ返し、上流のcontent-typeインジェクションをブロック                    |
| **ファイルサイズ制限**       | レスポンスを10MBの上限でストリーミングし、超過するとダウンロード途中で中断                        |
| **レート制限**               | IPまたはIPv6 /64ごとに1分あたり60リクエスト（KVが必要、KVエラー時はフェイルオープン）             |
| **HMAC署名**                 | 任意のクライアント側署名（気軽な悪用の抑止）                                                      |

### DNSリバインディング（Cloudflare以外でのセルフホスト）

このWorkerは、プライベートまたは内部のIPに解決されるURLをすべて拒否します。証明書チェーンのURLは、その証明書を発行したCA（FNMT、企業のCAなど）を指すため、ホストの固定許可リストは使えず、宛先を事前に把握できません。そのため、リバインディングの小さな隙が残ります。自分のドメインのDNSを運用する人が、安全性チェックには公開IPを、その直後の実際のリクエストにはプライベートIPを返す可能性があります。

Cloudflare上では、WorkersがプライベートIPや `169.254.169.254` のメタデータエンドポイントに到達できないため、悪用はできません。リバインドしても何にも届きません。ただし、Workerに侵入経路を与えないでください。Tunnel、Service、プライベートネットワークのバインディングはアタッチしないでください（必要なのは `RATE_LIMIT_KV` だけです）。

VPC内でCloudflare以外（workerdやNodeなど）で実行する場合、ランタイムは内部IPに到達*できてしまいます*。前段にエグレスファイアウォールを置き、プライベート範囲（`10.0.0.0/8`、`172.16.0.0/12`、`192.168.0.0/16`、`127.0.0.0/8`、`169.254.0.0/16`、およびそのIPv6相当）をブロックしてください。Cloudflareを離れると、アプリケーションコードではこれを強制できません。

## プロキシを無効にする

CORSプロキシを使いたくない場合は、環境変数を空文字列に設定します。

```
VITE_CORS_PROXY_URL=
```

**注**：プロキシがないと、外部からのチェーン取得が必要な証明書（FNMTや一部の企業CAなど）での署名は、「Failed to fetch」エラーで失敗します。

## トラブルシューティング

### 「Signing error: TypeError: Failed to fetch」

通常は、次のいずれかを意味します。

1. **CORSプロキシが未設定**：`VITE_CORS_PROXY_URL` を設定して再ビルドしてください
2. **混合コンテンツがブロックされている**：サイトはHTTPSですが、証明書の発行者URLはHTTPです。CORSプロキシで解決できます。
3. **CORSプロキシがオリジンを拒否している**：`cors-proxy-worker.js` の `ALLOWED_ORIGINS` 配列にドメインが含まれているか確認してください

### プロキシからの「403 Forbidden」

ドメインが `ALLOWED_ORIGINS` リストに含まれていません。`cors-proxy-worker.js` を編集します。

```js
const ALLOWED_ORIGINS = ['https://your-domain.com'];
```

その後、再デプロイします：`npx wrangler deploy`

### プロキシのテスト

```bash
curl -H "Origin: https://your-domain.com" \
  "https://your-proxy.workers.dev?url=http://www.cert.fnmt.es/certs/ACUSU.crt"
```

### プロキシなしで動作する証明書

一部の証明書はP12/PFXファイルに完全なチェーンを含んでおり、外部からの取得を必要としません。

- 自己署名証明書
- 中間証明書をバンドルしている一部の商用CA
- 完全なチェーンを手動で組み立てた証明書
