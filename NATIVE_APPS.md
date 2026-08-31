# BentoPDF native apps (Android & iOS)

This turns BentoPDF into real Android and iOS apps you install on your own
devices. It is set up for **personal use and sideloading** - there is no store
listing, no signing identity for distribution, no analytics, and no update
channel. You build it, you install it, it runs offline on your phone.

Everything still runs on-device, exactly like the web version: no file ever
leaves the phone.

---

## What you get

- A real app icon, splash screen and app switcher entry.
- Native chrome instead of a website: a platform-correct header (large titles
  and a frosted bar on iOS, a Material top app bar on Android) and a bottom tab
  bar - **Home**, **Tools**, **Editor**, **More**.
- Results delivered through the **system share sheet**, so "Save to Files",
  AirDrop, Drive, Mail and friends all work. No mystery browser downloads.
- Working Android hardware back button, haptic feedback, keyboard-aware layout
  and safe-area handling on notched devices.
- The marketing furniture (hero, feature grid, testimonials, FAQ, donation
  ribbon, GitHub links, footer) is stripped out of the app build.

None of this affects the website - the whole native layer is compiled out of
the normal `npm run build`.

---

## Prerequisites

| Target  | You need                                                                                                                  |
| ------- | ------------------------------------------------------------------------------------------------------------------------- |
| Android | [Android Studio](https://developer.android.com/studio) (includes the SDK and a JDK). Works on macOS, Windows and Linux.   |
| iOS     | A **Mac** with [Xcode](https://developer.apple.com/xcode/) and an Apple ID. iOS apps cannot be built on Windows or Linux. |

Plus Node.js 20+ and the repo's dependencies (`npm install`).

---

## First-time setup

```bash
npm install
npm run native:init      # creates android/ and ios/
npm run native:assets    # generates app icons and splash screens
```

`native:init` generates the `android/` and `ios/` project folders. They are
gitignored on purpose - they are build output, and you can delete and
regenerate them at any time without losing anything.

On Linux or Windows the iOS step is skipped automatically.

---

## Build and install

### Android

```bash
npm run native:android
```

This rebuilds the web app, syncs it into the Android project and opens Android
Studio. From there: **Run ▶** with your phone connected over USB (with
[USB debugging](https://developer.android.com/studio/debug/dev-options) turned
on), and the app installs and launches.

Prefer an APK you can copy to the phone and tap to install?

```bash
npm run native:apk
# -> android/app/build/outputs/apk/debug/app-debug.apk
```

The debug APK is signed with Android's auto-generated debug key. That is fine
for your own devices - it just cannot be published to Play, which is the point
here. You will need to allow "install unknown apps" for whichever app you use
to open the APK.

### iOS

```bash
npm run native:ios
```

This rebuilds, syncs, and opens the project in Xcode. Then, once:

1. Select the **App** target → **Signing & Capabilities**.
2. Tick **Automatically manage signing** and pick your personal Apple ID team
   (add your Apple ID under Xcode → Settings → Accounts if it is not listed).
3. Change the **Bundle Identifier** to something unique to you, e.g.
   `com.yourname.bentopdf` - Apple rejects identifiers already in use.
4. Plug in your iPhone, select it as the run destination, and press **Run ▶**.
5. On the phone: **Settings → General → VPN & Device Management** → trust your
   developer certificate.

**The free Apple Developer tier signs apps for 7 days.** After that the app
stops opening and you re-run step 4 to re-sign it. A paid Apple Developer
account ($99/year) extends this to a year. This is Apple's restriction on
sideloading, not something the project can work around.

---

## After you change the code

```bash
npm run native:sync      # rebuild the web app + copy it into both projects
```

Then hit Run in Android Studio / Xcode again. `native:android` and
`native:ios` already do the sync for you.

---

## How it is wired together

| Piece                                                                          | Where                                          |
| ------------------------------------------------------------------------------ | ---------------------------------------------- |
| App id, name, splash, status bar, WebView settings                             | `capacitor.config.ts`                          |
| Native build target (no service worker, no gzip/brotli copies, resolved links) | `vite.config.ts`, behind `BUILD_TARGET=native` |
| Native runtime shell                                                           | `src/js/native/`                               |
| Native design layer                                                            | `src/css/native.css`                           |
| Icon and splash sources                                                        | `assets/`                                      |

The shell is loaded from `src/js/main.ts` behind `if (__NATIVE_APP__)`, which
is `false` for every non-native build, so the whole directory - Capacitor
included - is tree-shaken out of the website bundle.

`src/js/native/` breaks down as:

- `platform.ts` - platform detection, plugin availability guards
- `shell.ts` - strips web chrome, injects the header, tab bar and More sheet
- `save.ts` - intercepts `<a download>` and routes results to the share sheet
- `navigation.ts` - Android back button, extensionless link resolution
- `system-ui.ts` - status bar, splash, keyboard, safe areas
- `feedback.ts` / `toast.ts` - haptics and confirmations

Want different tabs? They are a plain list in `src/js/native/routes.ts`.

---

## Things worth knowing

- **App size.** BentoPDF bundles a lot of WebAssembly (LibreOffice, Ghostscript,
  Tesseract, PDFium, vips). The installed app is large - expect several hundred
  MB. That is the cost of every tool working with no server; if you only want a
  subset, `DISABLE_TOOLS` in `.env` trims the UI, and you can drop the matching
  WASM payloads from `public/`.
- **Very large files.** Handing a file to the OS goes through an in-memory
  base64 copy, so a multi-hundred-MB PDF can be tight on an older phone.
- **Threaded WASM.** A few tools use `SharedArrayBuffer` for multi-threading,
  which needs cross-origin isolation headers the WebView does not send. Those
  tools fall back to their single-threaded path - slower, still correct.
- **Not store-ready.** No privacy manifest, age rating, store metadata or
  release signing config is set up here, and the AGPL-3.0 licence has its own
  implications for App Store distribution. This is a personal build.
