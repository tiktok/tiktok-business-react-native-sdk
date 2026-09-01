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
- `startTrack()`
- `identify(payload)`
- `flush()`
- `logout()`

Platform-specific root methods:

- `requestTrackingAuthorization()` on iOS only
- `trackGooglePlayPurchase(payload)` on Android only

Example-only iOS StoreKit helpers:

- Load the product metadata in `ios/StoreKitConfig.storekit`.
- Purchase a consumable, non-consumable, auto-renewable subscription, or non-renewing subscription with StoreKit 2.
- Restore current non-consumable and subscription entitlements.

Shared root methods:

- `fetchDeferredDeeplink()`

### In-app validation flow

1. Open the example app and switch between `Config`, `Actions`, `Identity`, and the current platform tab (`iOS Platform` or `Android Platform`).
2. Enter runtime SDK config values in `Config`.
3. Run `initialize` first from `Actions`.
4. In `Actions`, follow the root API path in order: `trackEvent`, `trackContentEvent`, `trackCustomEvent`, then `trackAdRevenueEvent`. Use `startTrack` after initialization when validating `disableTrack`.
5. Open `Identity` to edit the identify payload and run `identify`, `flush`, or `logout`.
6. Open `iOS Platform` or `Android Platform` to run platform-specific root methods.

## iOS local StoreKit sandbox

The shared `TiktokBusinessReactNativeSdkExample` scheme is attached to
`ios/StoreKitConfig.storekit`, so Xcode supplies local products without App
Store Connect products or a Sandbox Apple Account. The app must be launched by
the scheme's Xcode Run action because building and launching it with
`pnpm example:ios` doesn't activate Xcode's local StoreKit test environment.
This configuration is for local StoreKit testing; it is separate from Apple's
server-backed App Store sandbox.

The same local configuration works on a Simulator and on a physical iOS device.
For a device running iOS 16 or later, enable Developer Mode, select the device as
the Xcode run destination, and run the shared scheme. A normally installed or
CLI-launched app can only load products configured in App Store Connect; the
local product IDs in this example aren't available in that environment.

To validate automatic iOS purchase reporting:

1. Open `ios/TiktokBusinessReactNativeSdkExample.xcworkspace`, select the shared
   `TiktokBusinessReactNativeSdkExample` scheme and a Simulator or Developer
   Mode device, then run the app from Xcode. In **Edit Scheme > Run > Options**,
   confirm **StoreKit Configuration** is `StoreKitConfig.storekit`.
2. On `Config`, enter valid TikTok SDK test credentials and leave `Disable
payment tracking` off.
3. Run `Initialize` on `Actions` before creating a transaction.
4. On `iOS Platform`, run `Load StoreKit products`. The returned product IDs,
   localized names, types, and prices appear below the action.
5. Purchase one of the four demo products. The local StoreKit purchase sheet is
   safe to confirm and does not charge a real account. The resulting transaction
   metadata appears below the action.
6. Run `Flush`, then validate the purchase signal with TikTok Test Events or the
   native SDK/network debugging workflow.

The example finishes successful StoreKit 2 transactions and reports failed or
cancelled purchases through `trackStoreKit2PurchaseFailed(productId)`. Use
Xcode's `Debug > StoreKit > Manage Transactions` to inspect/delete local
transactions, trigger refunds, or change the StoreKit test environment. The
restore action returns durable entitlements; consumables are intentionally not
restorable.

The load result includes `source: "xcodeStoreKitConfiguration"`. If loading
fails, confirm the app was launched with Xcode Run and the shared scheme's Run
action still selects `StoreKitConfig.storekit`. `StoreKitTest.SKTestSession` is
intended for unit and CI tests and isn't initialized from the normal example app
process.

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
