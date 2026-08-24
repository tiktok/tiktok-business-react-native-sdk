# Troubleshooting

This guide lists common setup and runtime issues for `@tiktok-business/react-native-sdk`.

## SDK not initialized

Call `initialize` before tracking events:

```ts
await TikTokBusinessSDK.initialize({
  appId: 'sample-app-id',
  accessToken: 'sample-access-token',
  tiktokAppId: ['sample-tiktok-app-id'],
});
```

## Test Events with multiple TikTok App IDs

When `tiktokAppId` contains multiple IDs, pass an array such as `['sample-tiktok-app-id', 'sample-tiktok-app-id-2']`. Keep each entry as one ID with no commas or spaces. During Test Events validation, start with the first ID in the array as the Events Manager app where you expect debug traffic to appear, then verify any additional app IDs according to your measurement setup.

## Native error payloads

The JavaScript layer preserves native bridge rejection details. Log the received rejection payload directly while debugging instead of expecting a JavaScript-owned `SdkError` shape.

## Initialization controls did not change

Initialization controls must be passed before native initialization. Changing these fields after initialization does not retroactively alter SDK startup behavior.

```ts
await TikTokBusinessSDK.initialize({
  appId: 'sample-app-id',
  accessToken: 'sample-access-token',
  tiktokAppId: ['sample-tiktok-app-id'],
  disableAutoTrack: true,
  disableRetentionTrack: true,
  disablePayTrack: true,
  disableInstallTrack: true,
  disableLaunchTrack: true,
});
```

## Platform-specific API errors

`requestTrackingAuthorization()` is iOS-only and `trackGooglePlayPurchase(payload)` is Android-only. Wrong-platform calls reject from JavaScript with an unsupported-platform payload before invoking native platform APIs. Guard shared JavaScript with `Platform.OS` when needed.

## Deferred deeplink returned no URL

Check these items when `fetchDeferredDeeplink()` resolves without `url`:

- SDK initialization completed before calling the method.
- The campaign is configured with a supported URI scheme deferred deeplink.
- The app has installed/launched in a flow eligible for deferred deeplink attribution.
- The host app has implemented normal deeplink routing for the returned URI.

## iOS ATT setup

Run `cd ios && bundle exec pod install` after adding the package so CocoaPods installs the native TikTok Business iOS SDK from this package's podspec.

Use `requestTrackingAuthorization()` only after the host app includes `NSUserTrackingUsageDescription` in `Info.plist`. The host app owns ATT timing, consent UX, and business rules for which events are allowed before or after consent.

## iOS ATT and SKAN validation

If ATT or SKAN behavior does not match expectations:

- Confirm `NSUserTrackingUsageDescription` exists in the host app `Info.plist` before calling `requestTrackingAuthorization()`.
- Confirm the host app calls `requestTrackingAuthorization()` only at the intended consent moment.
- Confirm whether the host app, MMP, or TikTok SDK owns SKAN conversion updates.
- If an MMP or host app owns SKAN, initialize with `ios.disableSKAdNetworkSupport: true` before SDK startup.
- Reinstall pods after native SDK version changes.

## iOS build issues

If CocoaPods cannot resolve `TikTokBusinessSDK`:

```sh
cd example
bundle install
bundle exec pod repo update
bundle exec pod install --project-directory=ios
```

If generated TurboModule headers are missing, reinstall pods after changing `src/NativeTiktokBusinessReactNativeSdk.ts`.

If Xcode reports that an iOS simulator runtime is not installed, install the matching runtime from Xcode Settings > Components.

## Android dependency/version conflicts

This package declares TikTok Business SDK, AndroidX Lifecycle, Google Play Billing, and Install Referrer dependencies from its Gradle configuration. If a host app pins different versions, inspect Gradle dependency resolution:

```sh
cd example/android
./gradlew :app:dependencies --configuration debugRuntimeClasspath
```

Check for:

- Missing JitPack repository configuration.
- Conflicting Google Play Billing versions.
- Conflicting AndroidX Lifecycle versions.
- Release shrinker rules removing native SDK classes.
- Host app compile options that do not support Java 8 APIs required by dependencies.

## Android host app requirements

Check these host app items when Android events do not appear as expected:

- AD_ID permission is configured when required by your target SDK and measurement plan.
- Java 8 compile options are enabled in the app-level Gradle file.
- TikTok Business SDK, Lifecycle, Google Play Billing, and Install Referrer dependencies are present.
- Google Play Billing purchase payload collection is present before calling `trackGooglePlayPurchase`.
- Install Referrer setup matches native SDK requirements.
- Lifecycle integration is available so launch/retention style automatic events can be observed.
- Initialization runs in the main app process and not only from a WebView-only process.
- Release Proguard/R8 rules preserve required native SDK classes if the native SDK version requires them.

## Purchase duplication

If automatic purchase tracking is enabled, do not also report the same Google Play purchase manually through `trackGooglePlayPurchase(payload)` unless your measurement plan explicitly requires duplicate signals.

Check these items when Purchase counts look too high:

- Whether `disablePayTrack` is set before initialization.
- Whether the Android app calls `trackGooglePlayPurchase(payload)` for purchases already observed by automatic IAP tracking.
- Whether retry logic in the host app can send the same purchase payload more than once.
- Whether ad monetization revenue was accidentally sent as a Purchase event instead of `trackAdRevenueEvent(options)`.

## Debug and Test Events

Enable debug mode and verbose logging only for development or QA validation:

```ts
await TikTokBusinessSDK.initialize({
  appId: 'sample-app-id',
  accessToken: 'sample-access-token',
  tiktokAppId: ['sample-tiktok-app-id'],
  debug: {
    enabled: true,
    logLevel: 'debug',
  },
});
```

Disable debug mode and verbose logging before production release. Use TikTok Test Events or your native SDK validation workflow to confirm events are received.

## Sensitive values in debugging

Do not paste real App IDs, access tokens, phone numbers, email addresses, screenshots containing secrets, internal links, or internal business assumptions into debug logs, issue reports, or documentation. Use sample values when validating bridge behavior.

## Metro and pnpm resolution

This workspace uses pnpm with hoisted node modules for React Native compatibility.

```sh
pnpm install
pnpm example:start -- --reset-cache
```

## Package validation failures

If `pnpm package:validate` includes unexpected files:

1. Review the `files` field in `package.json`.
2. Run `pnpm clean` and `pnpm prepare`.
3. Rerun `pnpm package:validate`.
