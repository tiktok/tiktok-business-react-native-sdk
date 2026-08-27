# Architecture

`@tiktok-for-business/react-native-sdk` is a React Native New Architecture TurboModule wrapper around the TikTok Business iOS and Android SDKs.

## Runtime boundary

```text
Host React Native app
  ↓
Public TypeScript API
  ├─ src/index.ts
  ├─ src/sdk.ts
  ├─ src/ios.ts
  └─ src/android.ts
  ↓
Codegen TurboModule contracts
  ├─ NativeTiktokBusinessReactNativeSdk
  └─ NativeTiktokBusinessReactNativeStoreKitIOS
  ↓
Android Kotlin bridge / iOS Objective-C++ bridge
  ↓
TikTok Business Android SDK / TikTok Business iOS SDK
```

The JavaScript layer owns typed public names, light normalization, and wrong-platform checks. Native code owns SDK configuration, native event objects, callbacks, and native error details.

## Public API organization

The default SDK object and named exports expose:

- Shared: `initialize`, `trackEvent`, `trackContentEvent`, `trackCustomEvent`, `trackAdRevenueEvent`, `flush`, `identify`, `logout`, `fetchDeferredDeeplink`
- iOS-only: `requestTrackingAuthorization`, `trackStoreKit2PurchaseFailed`
- Android-only: `trackGooglePlayPurchase`

Platform-specific wrappers reject before invoking native code when called on the wrong OS.

## TurboModule contracts

`src/NativeTiktokBusinessReactNativeSdk.ts` defines the main cross-platform Codegen contract. StoreKit 2 purchase-failure reporting uses a separate iOS-only contract in `src/NativeTiktokBusinessReactNativeStoreKitIOS.ts`, retrieved lazily so Android does not resolve an unavailable native module.

Keep these layers synchronized:

- Public exports and types
- JavaScript wrappers
- Codegen specs
- Android generated-spec implementation
- iOS generated-spec implementation
- Unit tests and Example App actions

## Payload and capability policy

Public APIs must map to confirmed native SDK capabilities; the package does not simulate native behavior in JavaScript.

- `tiktokAppId: string[]` is normalized to the native SDK's single string representation.
- Startup tracking, debug, EDP, limited-data-use, performance, and iOS settings are applied before native initialization.
- Standard/custom/content/ad-revenue APIs construct corresponding native event objects.
- Advanced Matching values pass through to native code; the React Native layer does not hash or persist email/phone data.
- Deferred deeplink calls resolve to a small cross-platform result object.
- iOS ATT, iOS StoreKit 2 failure reporting, and Android Google Play purchase reporting remain explicit platform APIs.

If native parity is absent, document the capability as unsupported instead of adding JavaScript-only state or a misleading fallback.

## Host-app ownership

The host app—not this bridge—owns:

- Consent UI, privacy disclosures, and data eligibility
- `NSUserTrackingUsageDescription` and ATT timing
- SKAdNetwork ownership decisions
- Android permissions, repositories, dependency conflict resolution, and R8/Proguard policy
- Deep-link routing and URI/app/universal-link setup
- Valid Billing/StoreKit transaction collection
- Production credential storage

## Example App role

The Example App is a manual bridge-validation surface. It stores credentials only in runtime state, exposes supported SDK actions, and uses sample payloads. The committed dependency is `workspace:*`, so normal development validates the current checkout. Published npm artifacts can be tested by temporarily pinning an exact package version.

## Build architecture

The repository is a pnpm workspace orchestrated by Turborepo:

- Bob builds ESM and TypeScript declarations into `lib/`.
- Jest, TypeScript, ESLint, and Prettier validate the shared codebase.
- Android CI builds the Example App with Gradle.
- iOS CI installs CocoaPods dependencies and builds the Example App for an iOS Simulator with Turborepo task caching.

Turborepo task caching can skip an unchanged native build.

## Release architecture

`.github/workflows/release.yml` is manually dispatched:

- `main` invokes `release-it`, producing a semantic-version release commit/tag, npm publication, git push, and GitHub release.
- Other refs publish `<base>-dev.<short-sha>` with npm dist-tag `dev` and do not create release commits/tags.
- npm authentication uses GitHub OIDC Trusted Publishing (`id-token: write`) rather than a long-lived repository token.

See `docs/releasing.md` for operational setup and checks.
