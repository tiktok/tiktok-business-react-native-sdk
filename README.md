# @tiktok-for-business/react-native-sdk

[![npm](https://img.shields.io/npm/v/%40tiktok-for-business%2Freact-native-sdk?label=npm)](https://www.npmjs.com/package/@tiktok-for-business/react-native-sdk)
[![build](https://img.shields.io/github/actions/workflow/status/tiktok/tiktok-business-react-native-sdk/ci.yml?label=build)](https://github.com/tiktok/tiktok-business-react-native-sdk/actions/workflows/ci.yml)
[![downloads](https://img.shields.io/npm/dw/%40tiktok-for-business%2Freact-native-sdk?label=downloads)](https://www.npmjs.com/package/@tiktok-for-business/react-native-sdk)
[![license](https://img.shields.io/npm/l/%40tiktok-for-business%2Freact-native-sdk?label=license)](https://www.npmjs.com/package/@tiktok-for-business/react-native-sdk)

React Native SDK for advertiser apps integrating TikTok Business event measurement on iOS and Android.

This package exposes a typed React Native API over the TikTok Business native iOS and Android SDKs. It keeps JavaScript behavior close to native SDK behavior: initialization, tracking controls, event reporting, Advanced Matching, debug/log configuration, and platform-specific APIs are bridged without a JavaScript-owned error wrapper.

## Native SDKs

- iOS: [tiktok-business-ios-sdk 1.7.2](https://github.com/tiktok/tiktok-business-ios-sdk)
- Android: [tiktok-business-android-sdk 1.7.0](https://github.com/tiktok/tiktok-business-android-sdk)

## Install

```sh
pnpm add @tiktok-for-business/react-native-sdk
```

### iOS

Install pods after adding the package:

```sh
cd ios
bundle exec pod install
```

The native TikTok Business iOS SDK is installed through this package's podspec. The host app must add the native SDK setup owned by the app target, including `NSUserTrackingUsageDescription` in `Info.plist` before calling `requestTrackingAuthorization()`. The host app owns ATT prompt timing, consent copy, and SKAN ownership decisions; if an MMP owns SKAN conversion updates, initialize with `ios.disableSKAdNetworkSupport: true`.

### Android

Ensure JitPack is available if your Android build centralizes repositories:

```gradle
maven { url 'https://jitpack.io' }
```

The TikTok Business Android SDK, AndroidX Lifecycle, Google Play Billing, and Install Referrer dependencies are included by this package's Gradle configuration. The host app still owns Android permissions, repository resolution, version conflict management, and release ProGuard/R8 rules required by the native SDK.

Also configure `INTERNET` and `AD_ID` permissions according to your target SDK and measurement plan. Add ProGuard/R8 keep rules for the TikTok native SDK before release.

## Import

```ts
import TikTokBusinessSDK, {
  TikTokContentEventNames,
  TikTokEventNames,
} from '@tiktok-for-business/react-native-sdk';
```

## Initialize

Call `initialize(config)` once before tracking events. Use sample or runtime-loaded credentials only; do not commit real App IDs or access tokens.

```ts
await TikTokBusinessSDK.initialize({
  appId: 'sample-app-id',
  accessToken: 'sample-access-token',
  tiktokAppId: ['sample-tiktok-app-id'],
  debug: {
    enabled: __DEV__,
    logLevel: __DEV__ ? 'debug' : 'none',
  },
});
```

`tiktokAppId` accepts a single string or an array of strings. Use an array for multiple TikTok App IDs, keep each array entry as one ID with no commas or spaces, and keep the first ID as the Events Manager app where you expect Test Events to appear. The bridge joins arrays for the native SDK during initialization.

### Automatic event controls

Automatic event controls must be supplied before initialization.

```ts
await TikTokBusinessSDK.initialize({
  appId: 'sample-app-id',
  accessToken: 'sample-access-token',
  tiktokAppId: ['sample-tiktok-app-id'],
  disableTrack: true,
  disableAutoTrack: true,
  disableRetentionTrack: true,
  disablePayTrack: true,
  disableInstallTrack: true,
  disableLaunchTrack: true,
});

await TikTokBusinessSDK.startTrack();
```

Use `startTrack()` to resume event sending after initialization with `disableTrack: true`. This is a one-way runtime resume API; the shared React Native surface does not expose a runtime tracking-disable setter.

### iOS SKAN ownership

If a host app or MMP owns SKAN conversion updates, disable native SDK SKAN support before initialization.

```ts
await TikTokBusinessSDK.initialize({
  appId: 'sample-app-id',
  accessToken: 'sample-access-token',
  tiktokAppId: ['sample-tiktok-app-id'],
  ios: {
    disableSKAdNetworkSupport: true,
  },
});
```

## Track events

```ts
await TikTokBusinessSDK.trackEvent(TikTokEventNames.LaunchApp, {
  properties: {
    currency: 'USD',
    value: 1,
  },
});

await TikTokBusinessSDK.trackContentEvent(TikTokContentEventNames.ViewContent, {
  properties: {
    contentId: 'sku-123',
    contentType: 'product',
    currency: 'USD',
    value: 9.99,
  },
  contents: [
    {
      contentId: 'sku-123',
      contentName: 'Example product',
      quantity: 1,
      price: 9.99,
    },
  ],
});

await TikTokBusinessSDK.trackCustomEvent('CheckoutStepSelected', {
  properties: {
    step: 'shipping',
  },
});

await TikTokBusinessSDK.trackAdRevenueEvent({
  adNetwork: 'example-network',
  adPlatform: 'example-platform',
  revenue: 1.25,
  currency: 'USD',
  adUnit: 'rewarded-video',
});

await TikTokBusinessSDK.flush();

const deeplink = await TikTokBusinessSDK.fetchDeferredDeeplink();
```

Call `fetchDeferredDeeplink()` only after `initialize(config)` succeeds. A result without `url` means no deferred deeplink is available for the current install/session. Host apps still own normal deeplink routing, URI scheme setup, and app-link/universal-link configuration.

Custom event properties pass through to native and may be ignored by the native SDK or TikTok backend if unsupported.

`TikTokEventNames.ImpressionLevelAdRevenue` is exported for parity with native standard event names. Prefer `trackAdRevenueEvent(options)` for in-app ad revenue reporting because it maps to the dedicated native ad revenue event object.

## Advanced Matching

```ts
await TikTokBusinessSDK.identify({
  externalId: 'sample-user-id',
  externalUserName: 'sample-user',
  email: runtimeEmail,
  phoneNumber: runtimePhoneNumber,
});

await TikTokBusinessSDK.logout();
```

The React Native layer does not hash, persist, normalize, or rewrite email or phone values. It passes runtime values to the native SDK, and the native SDK handles official Advanced Matching behavior. The host app owns consent timing, disclosure text, and policy decisions about which values may be provided.

## Platform-specific APIs

```ts
const attStatus = await TikTokBusinessSDK.requestTrackingAuthorization();

await TikTokBusinessSDK.trackGooglePlayPurchase({
  purchase: purchaseJson,
  skuDetails: skuDetailsJson,
});
```

Platform-specific public methods are intentionally unprefixed. They check the current platform in JavaScript before invoking native calls and reject with an unsupported-platform payload on the wrong OS.

### Purchase, automatic IAP, and ad revenue

The native TikTok App Events SDK can automatically report supported StoreKit and Google Play Billing purchases when automatic purchase tracking is enabled during initialization. Use automatic purchase tracking when your app relies on the native SDK-supported purchase flow and you do not need to attach additional app-specific purchase metadata from JavaScript.

Use `trackGooglePlayPurchase(payload)` only when your Android app collects the Google Play Billing purchase and SKU detail payloads and your measurement plan requires manual purchase reporting. Do not report the same purchase through both automatic purchase tracking and `trackGooglePlayPurchase(payload)` unless your measurement owner explicitly expects duplicate signals.

Use `trackAdRevenueEvent(options)` for in-app ad revenue signals. Do not use ad revenue events as a replacement for StoreKit or Google Play purchase reporting.

## Validation

Use the example app to validate these golden paths before release:

1. Initialize with sample runtime credentials.
2. Initialize with top-level tracking controls disabled.
3. Fire one standard event, content event, custom event, ad revenue event, and flush.
4. Call `identify(payload)` and `logout()`.
5. Validate ATT on iOS after host app setup.
6. Validate Google Play purchase reporting on Android only when native purchase support is configured.

Run local checks:

```sh
pnpm check
pnpm build
```

Run native examples when the platform environment is available:

```sh
pnpm example:android
pnpm example:ios
```

## Release safety

- Do not commit real credentials, phone numbers, email addresses, screenshots containing secrets, internal links, or internal business assumptions.
- Disable debug mode and verbose logging before production release.
- Avoid duplicate Purchase reporting when automatic IAP tracking and manual purchase reporting could both send the same purchase.

See `docs/troubleshooting.md` for multiple TikTok App ID validation, Android dependency conflicts, duplicate purchase reporting, ATT/SKAN conflicts, and deferred deeplink no-result cases when deferred deeplink support is enabled.
