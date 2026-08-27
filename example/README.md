# TikTok Business React Native SDK Example

This example app validates the current workspace build of `@tiktok-for-business/react-native-sdk` against React Native iOS and Android projects. For a published-package smoke test, replace the workspace dependency temporarily with an exact npm version, reinstall with a frozen lockfile update, validate both platforms, and restore the workspace dependency before committing.

## Prerequisites

From the repository root, install dependencies first:

```sh
pnpm install
```

For iOS, install CocoaPods dependencies after the JavaScript install:

```sh
pnpm --filter tiktok-business-react-native-sdk-example pods
```

## Run the example

Start Metro from the repository root:

```sh
pnpm example:start
```

Run Android:

```sh
pnpm example:android
```

Run iOS:

```sh
pnpm example:ios
```

## Debug console workflow

The example app now exposes an example-only SDK Debug Console for validating the local workspace package.

### Runtime credential guidance

- Enter `appId`, `accessToken`, and `tiktokAppId` at runtime inside the app; the current `initialize` bridge/native contract requires all three fields.
- Configure initialization behavior with top-level switches such as `disableAutoTrack` and `disablePayTrack`; use the iOS options for SKAdNetwork ownership and ATT authorization delay when needed.
- `tiktokAppId` follows the official iOS SDK naming; the Android bridge maps it to Android `TTConfig.setTTAppId(...)`.
- Keep real credentials out of tracked files, README snippets, and local source edits.
- Enable `debug.enabled` and verbose `debug.logLevel` only during development or QA, then disable them before release.

### Supported SDK actions

Root APIs:

- `initialize(config)`
- `trackEvent(eventName, options?)`
- `trackContentEvent(eventName, options)`
- `trackCustomEvent(eventName, options?)`
- `trackAdRevenueEvent(options)`
- `identify(payload)`
- `flush()`
- `logout()`

Platform-specific root methods:

- `requestTrackingAuthorization()` on iOS only
- `trackGooglePlayPurchase(payload)` on Android only

Shared root methods:

- `fetchDeferredDeeplink()`

### In-app validation flow

1. Open the example app and switch between `Config`, `Actions`, `Identity`, and `Platform`.
2. Enter runtime SDK config values in `Config`.
3. Run `initialize` first from `Actions`.
4. In `Actions`, follow the root API path in order: `trackEvent`, `trackContentEvent`, `trackCustomEvent`, then `trackAdRevenueEvent`.
5. Open `Identity` to edit the identify payload and run `identify`, `flush`, or `logout`.
6. Open `Platform` to run current-platform root methods only.

### Network debugging notes

- The example UI runs public SDK actions, but it does not provide an in-app network timeline.
- Use Bifrost, Charles, Proxyman, or another system proxy to inspect native network traffic.
- On iOS, configure the simulator or device proxy and trust the proxy certificate.
- On Android Studio Emulator, route traffic to the host proxy through `10.0.2.2:<proxy-port>`; the example app includes a Debug-only network security config for local user CA certificates.
- TikTok batch requests may use `Content-Encoding: gzip`; decode the body before inspecting JSON.

## Validation commands

Run lint, typecheck, and tests from the repository root:

```sh
pnpm lint
pnpm typecheck
pnpm test
```

Run the Android example build from the repository root:

```sh
pnpm --filter tiktok-business-react-native-sdk-example build:android
```

Run iOS pods and build validation from the repository root:

```sh
pnpm --filter tiktok-business-react-native-sdk-example pods
pnpm --filter tiktok-business-react-native-sdk-example build:ios
```

Run both example build validations through the root scripts:

```sh
pnpm build:android
pnpm build:ios
```
