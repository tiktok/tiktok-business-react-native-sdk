# Development Guide

This guide covers local development for `@tiktok-for-business/react-native-sdk`.

## Prerequisites

- Node.js matching `.nvmrc` (`v22`)
- pnpm matching `packageManager` in `package.json`
- Xcode and CocoaPods/Bundler for iOS
- Android Studio, Android SDK, and JDK 17 for Android

## Install dependencies

```sh
nvm use
pnpm install --frozen-lockfile
```

The pnpm workspace contains the library root and `example/`. Hoisted node modules are enabled for React Native compatibility.

## Source layout and Codegen

- Public exports: `src/index.ts`
- Shared wrappers: `src/sdk.ts`
- iOS wrappers: `src/ios.ts`
- Android wrappers: `src/android.ts`
- Main TurboModule spec: `src/NativeTiktokBusinessReactNativeSdk.ts`
- iOS StoreKit TurboModule spec: `src/NativeTiktokBusinessReactNativeStoreKitIOS.ts`
- Android implementation: `android/src/main/java/com/tiktokbusinessreactnativesdk/`
- iOS implementation: `ios/`

When changing a native method, keep the TypeScript wrapper, Codegen spec, native implementation, tests, Example App actions, and `docs/api.md` aligned. Reinstall iOS pods after Codegen-facing changes.

## Library validation

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm check
pnpm build
pnpm package:validate
```

`pnpm build` runs version synchronization and Bob, writing ESM and declarations to `lib/`. `pnpm package:validate` shows the npm tarball without publishing it. `pnpm release:prepare` combines lint, typecheck, tests, and library build.

## Example App dependency modes

The committed Example App uses:

```json
"@tiktok-for-business/react-native-sdk": "workspace:*"
```

This is the development mode and validates the current checkout. To smoke-test an already published artifact, temporarily set an exact npm version such as:

```json
"@tiktok-for-business/react-native-sdk": "0.1.0-dev.<sha>"
```

Run `pnpm install`, inspect the resolved package under `node_modules`, validate both platforms, then restore `workspace:*` before committing unless the repository intentionally changes its test strategy.

## Android Example

Build or launch:

```sh
pnpm build:android
pnpm example:android
```

The CI build targets `arm64-v8a` and uses plain Gradle output. For runtime validation:

1. Start an Android Studio emulator.
2. Start Metro with `pnpm example:start`.
3. Run `pnpm example:android`.
4. Enter sample credentials at runtime and call `initialize`.
5. Exercise standard/content/custom/ad-revenue events, identity, flush, logout, deferred deeplink, and Android purchase only when valid Billing payloads exist.

For a proxy running on the host Mac, Android Emulator reaches it through `10.0.2.2`, not `127.0.0.1`. The Example App has a Debug-only network security config for user-installed CA certificates.

## iOS Example

Install gems and pods:

```sh
cd example
bundle install
bundle exec pod install --project-directory=ios
cd ..
```

Build or launch from the repository root:

```sh
pnpm build:ios
pnpm example:ios
```

The iOS build uses the standard React Native CocoaPods source build. A cold CI build can take several minutes because React Native and its native dependencies must be compiled. Turborepo can skip the task when its inputs are unchanged.

If you need unformatted compiler logs locally, run the React Native command with `--verbose` or invoke `xcodebuild` from `example/ios`.

## Manual golden path

Use sample runtime credentials only:

1. Initialize with `appId`, `accessToken`, and one or more `tiktokAppId` values.
2. Validate startup switches such as `disableAutoTrack`, `disablePayTrack`, and privacy/platform options.
3. Track one standard, content, custom, and ad-revenue event.
4. Run `identify`, `flush`, `logout`, and `fetchDeferredDeeplink`.
5. On iOS, validate ATT and StoreKit 2 purchase-failure behavior where supported.
6. On Android, validate Google Play purchase only with real purchase/SKU payloads.
7. Confirm requests/responses with TikTok Test Events, native logs, or an HTTPS proxy; disable debug logging afterward.

## Documentation updates

Every public API, native dependency, build, or release change should update the relevant files under `docs/` in the same pull request:

- `api.md`: signatures, mappings, support, runtime notes
- `architecture.md`: module boundaries and ownership
- `development.md`: local and CI validation workflow
- `releasing.md`: npm/GitHub release behavior
- `troubleshooting.md`: known failures and diagnostics
