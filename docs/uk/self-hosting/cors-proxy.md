# CORS-проксі для отримання сертифікатів

Інструмент цифрового підпису використовує CORS-проксі, щоб отримувати сертифікати емітентів із зовнішніх центрів сертифікації (CA). Це потрібно, бо багато серверів CA не додають заголовків CORS у відповіді, що унеможливлює пряме отримання з браузера.

Крім того, багато серверів CA віддають сертифікати через звичайний HTTP. Коли ваш екземпляр BentoPDF розміщено через HTTPS, браузери блокують такі HTTP-запити (політика змішаного контенту). CORS-проксі вирішує обидві проблеми, спрямовуючи запити через HTTPS-ендпоінт із потрібними заголовками.

## Як це працює

Під час підписання PDF сертифікатом:

1. Бібліотека `zgapdfsigner` намагається побудувати повний ланцюжок сертифікатів
2. Вона отримує сертифікати емітентів за URL, вбудованими в розширення AIA (Authority Information Access) вашого сертифіката
3. Ці запити проходять через CORS-проксі, який додає потрібні заголовки `Access-Control-Allow-Origin`
4. Проксі повертає дані сертифіката в браузер

## Самостійне розгортання CORS-проксі

Якщо ви самостійно розгортаєте BentoPDF, вам потрібно розгорнути власний CORS-проксі, щоб цифрові підписи працювали із сертифікатами, які потребують отримання ланцюжка.

### Варіант 1: Cloudflare Workers (рекомендовано)

1. **Встановіть Wrangler CLI**:

   ```bash
   npm install -g wrangler
   ```

2. **Увійдіть у Cloudflare**:

   ```bash
   wrangler login
   ```

3. **Клонуйте BentoPDF і змініть дозволені origin**:

   ```bash
   git clone https://github.com/alam00000/bentopdf.git
   cd bentopdf/cloudflare
   ```

   Відкрийте `cors-proxy-worker.js` і змініть масив `ALLOWED_ORIGINS` на свій домен:

   ```js
   const ALLOWED_ORIGINS = [
     'https://your-domain.com',
     'https://www.your-domain.com',
   ];
   ```

   ::: warning Важливо
   Без цієї зміни проксі відхилятиме всі запити з вашого сайту з помилкою **403 Forbidden**. За замовчуванням дозволено лише запити з `bentopdf.com`.
   :::

4. **Розгорніть проксі**:

   ```bash
   wrangler deploy
   ```

   Запам'ятайте URL вашого worker (напр., `https://bentopdf-cors-proxy.your-subdomain.workers.dev`).

5. **Перезберіть BentoPDF з URL проксі**:

   Якщо використовуєте Docker:

   ```bash
   export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
   DOCKER_BUILDKIT=1 docker build \
     --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
     -t your-bentopdf .
   ```

   Якщо збираєте з вихідного коду:

   ```bash
   VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
   ```

### Варіант 2: власний бекенд-проксі

Ви також можете створити власний ендпоінт проксі. Вимоги такі:

1. Приймати GET-запити з параметром запиту `url`
2. Отримувати URL зі свого сервера (на сервері обмежень CORS немає)
3. Повертати відповідь із такими заголовками:
   - `Access-Control-Allow-Origin: https://your-domain.com`
   - `Access-Control-Allow-Methods: GET, OPTIONS`
   - `X-Content-Type-Options: nosniff`

Приклад реалізації на Express.js:

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

## Міркування щодо безпеки

Вбудований Cloudflare Worker має кілька заходів безпеки:

| Функція                     | Опис                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------ |
| **Перевірка origin**        | Дозволяє запити лише з доменів зі списку `ALLOWED_ORIGINS`                                 |
| **Обмеження URL**           | Дозволяє лише URL сертифікатів (`.crt`, `.cer`, `.pem`, `/certs/`, `/ocsp`, `/crl`)        |
| **Блокування приватних IP** | Блокує приватні діапазони IPv4/IPv6, link-local, loopback, десяткові IP та метадані хмари  |
| **Безпечний Content-Type**  | Повертає лише безпечні MIME-типи сертифікатів, блокує підміну content-type від джерела     |
| **Ліміт розміру файлу**     | Передає відповідь потоком з лімітом 10MB, перериває завантаження, якщо його перевищено     |
| **Обмеження частоти**       | 60 запитів на хвилину на IP або IPv6 /64 (потрібен KV, у разі помилок KV пропускає запити) |
| **Підписи HMAC**            | Необов'язкове підписування на стороні клієнта (стримує випадкові зловживання)              |

### DNS rebinding (самостійне розгортання поза Cloudflare)

Worker відхиляє будь-який URL, що вказує на приватну або внутрішню IP-адресу. Він не може використовувати фіксований список дозволених хостів, бо URL ланцюжків сертифікатів вказують на будь-який CA, що видав сертифікат (FNMT, корпоративні CA тощо), тож призначення наперед невідомі. Через це залишається невелике вікно для rebinding: той, хто керує DNS власного домену, може віддати публічну IP під час перевірки безпеки, а приватну в реальному запиті за мить.

На Cloudflare це не експлуатується: Workers не мають доступу до приватних IP чи ендпоінта метаданих `169.254.169.254`, тож rebind нікуди не веде. Просто не давайте worker шляху всередину: не підключайте Tunnel, Service чи binding приватної мережі (йому потрібен лише `RATE_LIMIT_KV`).

Якщо ви запускаєте це поза Cloudflare (workerd, Node тощо) усередині VPC, середовище _може_ звертатися до внутрішніх IP. Поставте перед ним egress-фаєрвол і заблокуйте приватні діапазони: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16` та їхні IPv6-еквіваленти. Код застосунку не може цього забезпечити поза Cloudflare.

## Вимкнення проксі

Якщо ви не хочете використовувати CORS-проксі, задайте змінній середовища порожній рядок:

```
VITE_CORS_PROXY_URL=
```

**Примітка**: Без проксі підписання сертифікатами, що потребують отримання зовнішнього ланцюжка (як-от FNMT чи деякі корпоративні CA), завершиться помилкою "Failed to fetch".

## Усунення несправностей

### "Signing error: TypeError: Failed to fetch"

Зазвичай це означає одне з двох:

1. **CORS-проксі не налаштовано**: задайте `VITE_CORS_PROXY_URL` і перезберіть
2. **Змішаний контент заблоковано**: ваш сайт працює через HTTPS, а URL емітента сертифіката через HTTP. CORS-проксі це вирішує.
3. **CORS-проксі відхиляє ваш origin**: перевірте, чи ваш домен є в масиві `ALLOWED_ORIGINS` у `cors-proxy-worker.js`

### "403 Forbidden" від проксі

Вашого домену немає у списку `ALLOWED_ORIGINS`. Відредагуйте `cors-proxy-worker.js`:

```js
const ALLOWED_ORIGINS = ['https://your-domain.com'];
```

Потім розгорніть заново: `npx wrangler deploy`

### Тестування проксі

```bash
curl -H "Origin: https://your-domain.com" \
  "https://your-proxy.workers.dev?url=http://www.cert.fnmt.es/certs/ACUSU.crt"
```

### Сертифікати, що працюють без проксі

Деякі сертифікати містять повний ланцюжок у файлі P12/PFX і не потребують зовнішнього отримання:

- Самопідписані сертифікати
- Деякі комерційні CA, що включають проміжні сертифікати
- Сертифікати, які ви вручну зібрали з повним ланцюжком
