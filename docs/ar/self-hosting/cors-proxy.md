# وكيل CORS لجلب الشهادات

تستخدم أداة التوقيع الرقمي وكيل CORS لجلب شهادات الجهات المُصدِرة من جهات إصدار الشهادات (CA) الخارجية. هذا ضروري لأن كثيرًا من خوادم CA لا تتضمن ترويسات CORS في استجاباتها، مما يمنع الجلب المباشر من المتصفح.

إضافة إلى ذلك، تقدّم كثير من خوادم CA الشهادات عبر HTTP عادي. وعندما تكون نسخة BentoPDF لديك مستضافة عبر HTTPS، تحظر المتصفحات هذه الطلبات (سياسة المحتوى المختلط). يحل وكيل CORS المشكلتين بتوجيه الطلبات عبر نقطة HTTPS بترويسات صحيحة.

## كيف يعمل

عند توقيع ملف PDF بشهادة:

1. تحاول مكتبة `zgapdfsigner` بناء سلسلة شهادات كاملة
2. تجلب شهادات الجهات المُصدِرة من الروابط المضمّنة في امتداد AIA (Authority Information Access) في شهادتك
3. تُوجَّه هذه الطلبات عبر وكيل CORS يضيف ترويسات `Access-Control-Allow-Origin` اللازمة
4. يعيد الوكيل بيانات الشهادة إلى المتصفح

## استضافة وكيل CORS ذاتيًا

إذا كنت تستضيف BentoPDF ذاتيًا، فستحتاج إلى نشر وكيل CORS خاص بك لكي تعمل التوقيعات الرقمية مع الشهادات التي تتطلب جلب السلسلة.

### الخيار 1: Cloudflare Workers (موصى به)

1. **ثبّت Wrangler CLI**:

   ```bash
   npm install -g wrangler
   ```

2. **سجّل الدخول إلى Cloudflare**:

   ```bash
   wrangler login
   ```

3. **انسخ BentoPDF وحدّث المصادر المسموح بها**:

   ```bash
   git clone https://github.com/alam00000/bentopdf.git
   cd bentopdf/cloudflare
   ```

   افتح `cors-proxy-worker.js` وغيّر المصفوفة `ALLOWED_ORIGINS` إلى نطاقك:

   ```js
   const ALLOWED_ORIGINS = [
     'https://your-domain.com',
     'https://www.your-domain.com',
   ];
   ```

   ::: warning مهم
   بدون هذا التغيير، سيرفض الوكيل كل الطلبات القادمة من موقعك بخطأ **403 Forbidden**. الإعداد الافتراضي يسمح فقط بالطلبات القادمة من `bentopdf.com`.
   :::

4. **انشر الوكيل**:

   ```bash
   wrangler deploy
   ```

   دوّن رابط الـ Worker الخاص بك (مثل `https://bentopdf-cors-proxy.your-subdomain.workers.dev`).

5. **أعد بناء BentoPDF مع رابط الوكيل**:

   إذا كنت تستخدم Docker:

   ```bash
   export VITE_CORS_PROXY_URL="https://your-worker.workers.dev"
   DOCKER_BUILDKIT=1 docker build \
     --secret id=VITE_CORS_PROXY_URL,env=VITE_CORS_PROXY_URL \
     -t your-bentopdf .
   ```

   إذا كنت تبني من المصدر:

   ```bash
   VITE_CORS_PROXY_URL=https://your-worker.workers.dev npm run build
   ```

### الخيار 2: وكيل خلفي مخصص

يمكنك أيضًا إنشاء نقطة وكيل خاصة بك. المتطلبات هي:

1. قبول طلبات GET مع معامل الاستعلام `url`
2. جلب الرابط من خادمك (لا توجد قيود CORS على جهة الخادم)
3. إرجاع الاستجابة بهذه الترويسات:
   - `Access-Control-Allow-Origin: https://your-domain.com`
   - `Access-Control-Allow-Methods: GET, OPTIONS`
   - `X-Content-Type-Options: nosniff`

مثال على تنفيذ باستخدام Express.js:

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

## اعتبارات الأمان

يتضمن Cloudflare Worker المرفق عدة إجراءات أمنية:

| الميزة                   | الوصف                                                                                              |
| ------------------------ | -------------------------------------------------------------------------------------------------- |
| **التحقق من المصدر**     | يسمح فقط بالطلبات القادمة من النطاقات المدرجة في `ALLOWED_ORIGINS`                                 |
| **قيود الروابط**         | يسمح فقط بروابط الشهادات (`.crt` و`.cer` و`.pem` و`/certs/` و`/ocsp` و`/crl`)                      |
| **حظر عناوين IP الخاصة** | يحظر النطاقات الخاصة في IPv4/IPv6 وlink-local وloopback وعناوين IP العشرية وبيانات السحابة الوصفية |
| **أمان Content-Type**    | يعيد أنواع MIME الآمنة للشهادات فقط، ويمنع حقن content-type من المصدر                              |
| **حد حجم الملف**         | يبثّ الاستجابة بحد 10MB ويقطع التنزيل في منتصفه إذا تم تجاوزه                                      |
| **تحديد المعدل**         | 60 طلبًا في الدقيقة لكل IP أو IPv6 /64 (يتطلب KV، ويسمح بالمرور عند أخطاء KV)                      |
| **توقيعات HMAC**         | توقيع اختياري من جهة العميل (يردع الاستغلال العابر)                                                |

### إعادة ربط DNS (عند الاستضافة الذاتية خارج Cloudflare)

يرفض الـ Worker أي رابط يُحلّ إلى عنوان IP خاص أو داخلي. ولا يمكنه استخدام قائمة ثابتة بالمضيفين المسموح بهم، لأن روابط سلسلة الشهادات تشير إلى أي جهة CA أصدرت الشهادة (FNMT وجهات CA المؤسسية وغيرها)، فلا تُعرف الوجهات مسبقًا. وهذا يترك نافذة صغيرة لإعادة الربط: يمكن لمن يدير DNS لنطاقه أن يعطي فحص الأمان عنوان IP عامًا، ثم يعطي الطلب الفعلي عنوانًا خاصًا بعد لحظة.

على Cloudflare لا يمكن استغلال ذلك: لا تستطيع Workers الوصول إلى عناوين IP الخاصة ولا إلى نقطة البيانات الوصفية `169.254.169.254`، فتنتهي إعادة الربط إلى لا شيء. فقط لا تمنح الـ Worker طريقًا إلى الداخل: لا تربط Tunnel أو Service أو ربطًا بشبكة خاصة (فهو يحتاج فقط إلى `RATE_LIMIT_KV`).

إذا شغّلته خارج Cloudflare (workerd أو Node وما شابههما) داخل VPC، فإن بيئة التشغيل _تستطيع_ الوصول إلى عناوين IP الداخلية. ضع جدار حماية للحركة الصادرة أمامه واحظر النطاقات الخاصة: `10.0.0.0/8` و`172.16.0.0/12` و`192.168.0.0/16` و`127.0.0.0/8` و`169.254.0.0/16` ونظائرها في IPv6. لا يمكن لكود التطبيق فرض ذلك بمجرد أن تخرج من Cloudflare.

## تعطيل الوكيل

إذا كنت لا تريد استخدام وكيل CORS، فاضبط متغير البيئة على سلسلة فارغة:

```
VITE_CORS_PROXY_URL=
```

**ملاحظة**: بدون الوكيل، سيفشل التوقيع بالشهادات التي تتطلب جلب سلسلة خارجية (مثل FNMT أو بعض جهات CA المؤسسية) بخطأ "Failed to fetch".

## استكشاف الأخطاء وإصلاحها

### "Signing error: TypeError: Failed to fetch"

يعني هذا عادةً أحد الأمرين:

1. **لم يُضبط وكيل CORS**: عيّن `VITE_CORS_PROXY_URL` وأعد البناء
2. **حظر المحتوى المختلط**: موقعك يعمل عبر HTTPS لكن رابط مُصدِر الشهادة يعمل عبر HTTP. يحل وكيل CORS هذه المشكلة.
3. **وكيل CORS يرفض مصدرك**: تأكد من وجود نطاقك في المصفوفة `ALLOWED_ORIGINS` في `cors-proxy-worker.js`

### خطأ "403 Forbidden" من الوكيل

نطاقك غير موجود في قائمة `ALLOWED_ORIGINS`. عدّل `cors-proxy-worker.js`:

```js
const ALLOWED_ORIGINS = ['https://your-domain.com'];
```

ثم أعد النشر: `npx wrangler deploy`

### اختبار الوكيل

```bash
curl -H "Origin: https://your-domain.com" \
  "https://your-proxy.workers.dev?url=http://www.cert.fnmt.es/certs/ACUSU.crt"
```

### الشهادات التي تعمل بدون وكيل

تتضمن بعض الشهادات السلسلة كاملة في ملف P12/PFX ولا تتطلب جلبًا خارجيًا:

- الشهادات الموقّعة ذاتيًا
- بعض جهات CA التجارية التي تضمّن الشهادات الوسيطة
- الشهادات التي جمعتَ سلسلتها الكاملة يدويًا
