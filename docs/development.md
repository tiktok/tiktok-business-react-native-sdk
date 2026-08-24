# Development Guide

This guide covers the local development flow for `@tiktok-business/react-native-sdk`.

## Prerequisites

- Node.js matching `.nvmrc`
- pnpm matching the `packageManager` field in `package.json`
- Xcode and CocoaPods for iOS example validation
- Android Studio, Android SDK, and JDK 17 for Android example validation

## Install dependencies

From the repository root:

```sh
pnpm install
```

The workspace uses pnpm with hoisted node modules for React Native compatibility.

## Codegen and native bridge shape

The TurboModule contract lives in `src/NativeTiktokBusinessReactNativeSdk.ts` and is consumed by React Native Codegen through the `codegenConfig` in `package.json`.

When changing native method signatures:

1. Update `src/NativeTiktokBusinessReactNativeSdk.ts`.
2. Update the public wrappers in `src/sdk.ts`, `src/ios.ts`, or `src/android.ts`.
3. Update both native implementations so each platform satisfies the generated spec.
4. Reinstall pods for iOS example validation if generated iOS headers change.

## Build the library

Build the distributable JavaScript and TypeScript output with Bob:

```sh
pnpm prepare
```

Equivalent root script:

```sh
pnpm build
```

Generated output is written under `lib/`.

## Tests and static checks

Run lint:

```sh
pnpm lint
```

Run TypeScript checks:

```sh
pnpm typecheck
```

Run unit tests:

```sh
pnpm test
```

Run the combined root check:

```sh
pnpm check
```

Documentation consistency is manually verified during review by comparing `README.md`, `docs/api.md`, `docs/architecture.md`, and `docs/troubleshooting.md` against the public TypeScript API and native bridge method list.

## Package validation

Verify npm package contents before publishing:

```sh
pnpm package:validate
```

This runs `pnpm pack --dry-run` and prints the files that would be included in the tarball.

## Example App manual golden paths

Use sample runtime credentials only. Validate these paths after API, native bridge, or example UI changes:

1. Initialize with `appId`, `accessToken`, and `tiktokAppId`, including a `string[]` `tiktokAppId` when validating multiple TikTok App IDs.
2. Initialize with top-level tracking controls disabled, such as `disableTrack`, `disableAutoTrack`, and `disablePayTrack`.
3. Track one standard event, one content event, one custom event, one ad revenue event, and call `flush()`.
4. Call `identify(payload)` and `logout()` with sample Advanced Matching values.
5. Enable debug mode and verbose logging only for development or QA, then disable them before release.
6. Use TikTok Test Events or the native SDK validation workflow to confirm events are received.

## Android example

Run the example app on Android:

```sh
pnpm example:android
```

Build the Android example for validation:

```sh
pnpm --filter tiktok-business-react-native-sdk-example build:android
```

On Android, also validate `trackGooglePlayPurchase` only when Google Play Billing purchase and SKU detail payloads are available. Avoid duplicate Purchase reporting when automatic IAP tracking is enabled.

The Android example resolves the TikTok Business Android SDK from JitPack. If dependency resolution fails in a host app, ensure `https://jitpack.io`, Java 8 compile options, TikTok Business SDK, Lifecycle, Billing, and Install Referrer dependencies are available in the Android app-level Gradle configuration.

## iOS example

Install CocoaPods dependencies:

```sh
cd example
bundle install
bundle exec pod install --project-directory=ios
```

Run the example app on iOS:

```sh
pnpm example:ios
```

Build the iOS example for validation:

```sh
pnpm --filter tiktok-business-react-native-sdk-example build:ios
```

On iOS, also validate `requestTrackingAuthorization()` only after the example host app has `NSUserTrackingUsageDescription`, and validate `ios.disableSKAdNetworkSupport` when SKAN conversion updates are owned outside the SDK.

If Xcode reports that an iOS platform is not installed, install the matching simulator runtime from Xcode Settings > Components and rerun the build.

## Troubleshooting entry points

- API behavior and native mappings: `docs/api.md`
- Architecture and bridge boundaries: `docs/architecture.md`
- Common local setup and native build failures: `docs/troubleshooting.md`
- Release and package validation: `docs/releasing.md`
