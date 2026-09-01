# API Reference

This document describes the public API surface for `@tiktok-for-business/react-native-sdk`, platform support, native SDK mapping, error behavior, and release-sensitive warnings.

## Native capability support matrix

Support status values:

- **Supported**: available through the shared React Native API on iOS and Android.
- **Platform-specific**: available through the React Native API only on the native platform that supports it; wrong-platform calls reject from JavaScript before invoking native code.
- **Host-app responsibility**: required for integration, but owned by the app target or native SDK setup rather than this React Native package.
- **Not supported**: documented native SDK capability that is not currently bridged.
- **Out of scope**: intentionally not part of this React Native bridge.

| Native SDK capability | RN bridge status | RN API or owner |
| --- | --- | --- |
| Android SDK installation | Host-app responsibility | Package Gradle includes the SDK dependencies; host app owns repositories, permissions, version conflicts, and release shrinker rules. |
| iOS SDK installation | Host-app responsibility | Package podspec installs the native SDK; host app runs CocoaPods and owns app target setup. |
| SDK initialization | Supported | `initialize(config)` |
| App ID, access token, TikTok App IDs | Supported | `initialize({ appId, accessToken, tiktokAppId })`; `tiktokAppId` accepts `string` or `string[]`. |
| Multiple TikTok App IDs | Supported | Pass `tiktokAppId: ['sample-tiktok-app-id', 'sample-tiktok-app-id-2']`; the JS wrapper joins values for native SDK initialization. |
| Initialization tracking controls | Supported | Top-level initialization switches such as `disableAutoTrack`, `disablePayTrack`, `disableInstallTrack`, and `disableLaunchTrack` are applied before native SDK startup. |
| Standard events | Supported | `trackEvent(eventName, options?)`; standard constants are exported but custom strings remain accepted. |
| Content events | Supported | `trackContentEvent(eventName, options)` and `TikTokContentEventNames`. |
| Custom events | Supported | `trackCustomEvent(eventName, options?)`. |
| In-app ad revenue reporting | Supported | `trackAdRevenueEvent(options)`. |
| Manual flush | Supported | `flush()`. |
| Debug mode and log level | Supported | `initialize({ debug })`; disable debug mode and verbose logs before release. |
| Advanced Matching identify/logout | Supported | `identify(payload)` and `logout()`. The RN layer does not hash, persist, or rewrite email/phone values. |
| iOS App Tracking Transparency | Platform-specific | `requestTrackingAuthorization()` on iOS only; host app owns `NSUserTrackingUsageDescription`, prompt timing, and consent UX. |
| iOS StoreKit 2 purchase failure reporting | Platform-specific | `trackStoreKit2PurchaseFailed(productId)` on iOS 15 or later. The promise confirms native acceptance, not event upload completion. |
| iOS SKAdNetwork ownership | Platform-specific | `initialize({ ios: { disableSKAdNetworkSupport: true } })` when host app or MMP owns SKAN. |
| Android Google Play purchase reporting | Platform-specific | `trackGooglePlayPurchase(payload)` on Android only. |
| Android install referrer and lifecycle integration | Host-app responsibility | Dependencies are included by package Gradle; host app owns app-level setup and conflict resolution. |
| Deferred deeplinks | Supported | `fetchDeferredDeeplink()` after successful SDK initialization. |
| Data sharing after user consent | Not supported | The bridge exposes startup tracking controls but no shared runtime method to resume tracking after consent; host app owns consent UX and policy. |
| Advertiser ID collection controls | Not supported | Do not add a shared RN abstraction without stable native parity; host app owns Android permissions, iOS ATT timing, and privacy policy. |
| Pre-consent tracking delay | Not supported | `initialize({ disableTrack: true })` disables tracking at startup, but the bridge does not expose a shared runtime method to resume it. |
| Enhance data postback initialization controls | Supported | `disableEnhancedDataPostbackTrack` maps to the native auto-EDP disable switch, and `setIsLowPerformanceDevice` applies native low-performance-device mode when `true`. |
| Unity SDK | Out of scope | No React Native bridge work. |
| Combined TikTok App Events and Pangle SDK | Out of scope | No combined SDK or Pangle migration bridge work. |

## Native SDK compatibility

| Platform | Native SDK dependency | Version source | Notes |
| --- | --- | --- | --- |
| Android | `com.github.tiktok:tiktok-business-android-sdk` `1.7.1` | `android/build.gradle` | The package also pins Lifecycle `2.8.7`, Billing `7.1.1`, and Install Referrer `2.2`; host apps own repository configuration and conflict resolution. |
| iOS | `TikTokBusinessSDK` `1.7.1` | `TiktokBusinessReactNativeSdk.podspec` | CocoaPods installs the pinned version. Host apps still own app target setup, ATT copy, and SKAN ownership decisions. |

## Error behavior

Public promise APIs forward calls to the native bridge directly. Rejection codes, messages, and attached details come from the native bridge path for that call.

The JavaScript layer does not wrap native failures in a separate SDK-owned error model. If shared app code handles rejections, inspect the payload returned at runtime.

## Platform support matrix

| API                                     | iOS | Android | Native mapping                                                                  |
| --------------------------------------- | --- | ------- | ------------------------------------------------------------------------------- |
| `initialize(config)`                    | Yes | Yes     | iOS `TikTokBusiness.initializeSdk`; Android `TikTokBusinessSdk.initializeSdk`   |
| `trackEvent(eventName, options?)`       | Yes | Yes     | iOS `TikTokBaseEvent`; Android `TTBaseEvent`                                    |
| `trackContentEvent(eventName, options)` | Yes | Yes     | iOS `TikTokContentsEvent` subclasses; Android `TTContentsEvent` builders        |
| `trackCustomEvent(eventName, options?)` | Yes | Yes     | iOS `TikTokBaseEvent`; Android `TTBaseEvent`                                    |
| `trackAdRevenueEvent(options)`          | Yes | Yes     | iOS `TikTokAdRevenueEvent`; Android `TTAdRevenueEvent`                          |
| `flush()`                               | Yes | Yes     | iOS `explicitlyFlush`; Android `flush`                                          |
| `identify(payload)`                     | Yes | Yes     | iOS `identifyWithExternalID...`; Android `identify`                             |
| `logout()`                              | Yes | Yes     | iOS `logout`; Android `logout`                                                  |
| `fetchDeferredDeeplink()`               | Yes | Yes     | iOS deferred deeplink fetch; Android deferred deeplink fetch                     |
| `requestTrackingAuthorization()`        | Yes | No      | JS platform check, then iOS `requestTrackingAuthorizationWithCompletionHandler` |
| `trackStoreKit2PurchaseFailed(productId)` | Yes | No    | JS platform check, then iOS `trackStoreKit2PurchaseFailedWithProductId:` on iOS 15+ |
| `trackGooglePlayPurchase(payload)`      | No  | Yes     | JS platform check, then Android `trackGooglePlayPurchase` with `TTPurchaseInfo` |

Wrong-platform calls reject from the JavaScript method before invoking native platform APIs.

## Types

```ts
export type LogLevel =
  | 'none'
  | 'error'
  | 'warning'
  | 'info'
  | 'debug'
  | 'verbose';

export interface TikTokBusinessInitializeConfig {
  appId: string;
  accessToken: string;
  tiktokAppId: string | string[];
  disableTrack?: boolean;
  disableAutoTrack?: boolean;
  disableRetentionTrack?: boolean;
  disablePayTrack?: boolean;
  disableInstallTrack?: boolean;
  disableLaunchTrack?: boolean;
  disableEnhancedDataPostbackTrack?: boolean;
  openLimitedDataUse?: boolean;
  setIsLowPerformanceDevice?: boolean;
  debug?: DebugConfig;
  ios?: IosConfig;
}
```

`tiktokAppId` may be a single string or an array of strings. Use arrays for multiple TikTok App IDs; each array entry should be one ID with no commas or spaces. During initialization, the bridge joins arrays for the native SDK. When multiple IDs are configured, Test Events usually appear under the first TikTok App ID's Events Manager entry, so keep that first ID aligned with the validation account.

## `initialize(config)`

Initializes the native SDK. Call this before tracking events.

```ts
await TikTokBusinessSDK.initialize({
  appId: 'sample-app-id',
  accessToken: 'sample-access-token',
  tiktokAppId: ['sample-tiktok-app-id'],
  disableAutoTrack: true,
  disablePayTrack: true,
  debug: {
    enabled: __DEV__,
    logLevel: __DEV__ ? 'debug' : 'none',
  },
  ios: {
    disableSKAdNetworkSupport: true,
    setDelayForATTUserAuthorizationInSeconds: 30,
  },
});
```

### Initialization controls

Initialization controls must be set before initialization because the native SDK applies them during startup. Set a switch to `true` only when the corresponding behavior should be disabled or enabled as named.

`disableTrack` disables startup tracking. `disableAutoTrack`, `disableRetentionTrack`, `disablePayTrack`, `disableInstallTrack`, and `disableLaunchTrack` control their respective tracking paths. `disableEnhancedDataPostbackTrack`, `openLimitedDataUse`, and `setIsLowPerformanceDevice` are applied only when set to `true`.

`openLimitedDataUse` is Android-only in the current native bridge; iOS ignores it. `setIsLowPerformanceDevice` is applied by both native bridges when `true`. `disableEnhancedDataPostbackTrack` maps to the native auto-EDP disable behavior.

### iOS SKAN ownership

If an MMP or the host app owns SKAN conversion updates, disable SDK SKAN support before initialization:

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

## Events

### Event constants

`TikTokEventNames` and `TikTokContentEventNames` contain the stable, non-deprecated event names implemented in `src/types.ts`. These constants are convenience exports only: `trackEvent` and `trackCustomEvent` continue to accept arbitrary strings so advertiser apps can send custom or partner-defined events supported by their measurement plan.

Content event constants include `AddToCart`, `AddToWishlist`, `Checkout`, `Purchase`, and `ViewContent`.

### `trackEvent(eventName, options?)`

Use for standard or partner-defined event names. The SDK does not hard-restrict `eventName` to an enum.

```ts
await TikTokBusinessSDK.trackEvent('LaunchApp', {
  properties: {
    currency: 'USD',
    value: 1,
  },
});
```

### `trackContentEvent(eventName, options)`

Use for content-aware events such as `AddToCart`, `AddToWishlist`, `Checkout`, `Purchase`, and `ViewContent`.

```ts
await TikTokBusinessSDK.trackContentEvent('ViewContent', {
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
```

### `trackCustomEvent(eventName, options?)`

Custom event names and properties pass through to native. Unsupported properties may be ignored by the native SDK or TikTok backend.

```ts
await TikTokBusinessSDK.trackCustomEvent('CheckoutStepSelected', {
  properties: {
    step: 'shipping',
  },
});
```

### `trackAdRevenueEvent(options)`

```ts
await TikTokBusinessSDK.trackAdRevenueEvent({
  adNetwork: 'example-network',
  adPlatform: 'example-platform',
  revenue: 1.25,
  currency: 'USD',
  adUnit: 'rewarded-video',
});
```

### `flush()`

Flushes queued events when supported by the current native SDK path.

```ts
await TikTokBusinessSDK.flush();
```

### `fetchDeferredDeeplink()`

Fetches a deferred deeplink after SDK initialization.

```ts
const deeplink = await TikTokBusinessSDK.fetchDeferredDeeplink();
```

Call `fetchDeferredDeeplink()` only after `initialize(config)` succeeds. A result without `url` means no deferred deeplink is available for the current install/session. Host apps still own normal deeplink routing, URI scheme setup, and app-link/universal-link configuration.

### `trackStoreKit2PurchaseFailed(productId)`

Reports a StoreKit 2 purchase failure on iOS 15 or later.

```ts
await TikTokBusinessSDK.trackStoreKit2PurchaseFailed('product-123');
```

`trackStoreKit2PurchaseFailed` is exported as both a named function and a method on the default SDK object. It is backed by the lazily resolved iOS-only `TiktokBusinessReactNativeStoreKitIOS` TurboModule so importing the package on Android does not require the StoreKit module.

The promise resolves after the iOS SDK accepts the request. The native SDK performs reporting asynchronously and does not provide an upload completion callback. Empty product IDs reject; iOS versions below 15 reject as unsupported.

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

The React Native layer does not hash, persist, or rewrite email or phone values. It passes values to the native SDK, which applies official native SDK behavior.

### Privacy and compliance boundary

RN SDK 不收集敏感数据，也不自动改写 email/phone；只透传给原生 SDK，由原生 SDK 按官方行为处理。React Native 层不对 email/phone 做 hash、持久化、normalize 或 rewrite；仅将运行时值传递给原生 SDK，由原生 SDK 处理官方 Advanced Matching。

The host app owns consent timing, user disclosure, and data-sharing policy. This package does not implement a JavaScript consent manager and does not store customer identifiers. Do not pass sensitive data to TikTok unless the host app has determined it is allowed under its applicable policy and terms.

## iOS-specific API

### `requestTrackingAuthorization()`

```ts
const status = await TikTokBusinessSDK.requestTrackingAuthorization();
```

The host app must provide `NSUserTrackingUsageDescription` and own the consent UX. Call this only when it fits the app's privacy flow and Apple policy requirements.

## Android-specific API

### `trackGooglePlayPurchase(payload)`

```ts
await TikTokBusinessSDK.trackGooglePlayPurchase({
  purchase: purchaseJson,
  skuDetails: skuDetailsJson,
});
```

Use this only when the host app has Google Play Billing purchase and SKU detail payloads available. Avoid duplicate Purchase reporting: if automatic IAP tracking is enabled, do not also report the same purchase manually unless your measurement plan explicitly requires it.

## Purchase reporting guidance

Automatic IAP tracking and manual purchase reporting can both produce Purchase-like signals. Choose one reporting path for the same transaction unless your measurement plan explicitly requires duplicates.

- Keep automatic purchase tracking enabled when the native SDK-supported StoreKit or Google Play Billing flow is sufficient.
- Set `disablePayTrack: true` before SDK startup if the host app will manually report the same purchases.
- Call `trackGooglePlayPurchase(payload)` only on Android and only with purchase payloads collected from Google Play Billing.
- Keep iOS StoreKit automatic payment tracking as native SDK and host-app behavior; this RN package does not expose a manual iOS StoreKit purchase bridge.
- Use `trackAdRevenueEvent(options)` only for ad monetization revenue, not app-store purchases.

## Release warnings

- Do not commit real App IDs, access tokens, phone numbers, email addresses, internal links, or internal business assumptions.
- Disable debug mode and verbose logging before production release.
- Configure Android AD_ID, Billing, Install Referrer, Lifecycle, WebView/main process, and Proguard requirements in the host app.
- Configure iOS ATT, SKAN ownership, linker flags, and `NSUserTrackingUsageDescription` in the host app.
