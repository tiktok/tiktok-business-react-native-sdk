# Architecture

`@tiktok-business/react-native-sdk` is a React Native TurboModule wrapper around the TikTok Business iOS and Android SDKs.

## Boundary diagram

```text
React Native app
  ↓
Public TypeScript API (`src/index.ts`, `src/sdk.ts`, `src/ios.ts`, `src/android.ts`)
  ↓
TurboModule contract (`src/NativeTiktokBusinessReactNativeSdk.ts`)
  ↓
Android Kotlin bridge / iOS Objective-C++ bridge
  ↓
TikTok Business Android SDK / TikTok Business iOS SDK
```

The JavaScript layer owns public TypeScript names, light payload shaping, and wrong-platform checks for public platform-specific methods. The native layer owns native SDK object construction and native error details.

## Public API layout

Cross-platform APIs live on the default root SDK object:

- `initialize`
- `trackEvent`
- `trackContentEvent`
- `trackCustomEvent`
- `trackAdRevenueEvent`
- `flush`
- `identify`
- `logout`

Platform-specific APIs stay on the root SDK object with unprefixed public names:

- `requestTrackingAuthorization`
- `trackGooglePlayPurchase`

These methods check `Platform.OS` in JavaScript before invoking native calls so shared code receives a clear unsupported-platform rejection on the wrong OS.

## TurboModule contract

`src/NativeTiktokBusinessReactNativeSdk.ts` is the Codegen-facing source of truth for bridge method signatures. Keep it aligned with:

- `src/sdk.ts` for cross-platform wrappers
- `src/ios.ts` for iOS-specific wrapper implementation
- `src/android.ts` for Android-specific wrapper implementation
- `android/src/main/java/com/tiktokbusinessreactnativesdk/TiktokBusinessReactNativeSdkModule.kt`
- `ios/TiktokBusinessReactNativeSdk.mm`

## Native mapping policy

Public APIs must map to confirmed native SDK capabilities. Consent-related RN APIs must map directly to stable native SDK APIs; this package must not create JavaScript-only consent state that the native SDK cannot enforce.

- Initialization maps JS `appId`, `accessToken`, and `tiktokAppId` to native config objects; `tiktokAppId` arrays are joined before native calls because both native SDKs expect a single TikTok App ID string value.
- Top-level initialization tracking controls are applied before native initialization.
- Standard and custom events map to native base event types.
- Content events map to native content event subclasses/builders.
- Ad revenue events map to native ad revenue event types.
- Advanced Matching passes identity fields to native SDK APIs.
- Android Google Play Purchase uses `trackGooglePlayPurchase` and checks Android before native invocation.
- ATT uses `requestTrackingAuthorization`, checks iOS before native invocation, and requires host app privacy setup.

If a native SDK version lacks a method, document unsupported behavior rather than inventing a JavaScript fallback.

## Capability ownership boundaries

The React Native bridge supports advertiser-facing iOS and Android App Events SDK capabilities that have stable native APIs and a clear JavaScript use case. The bridge does not own app-store permissions, consent UX, SKAN ownership decisions, Android repository setup, release shrinker policy, or native dependency conflict resolution.

Unity and the combined TikTok App Events + Pangle SDK are intentionally out of scope. They are documented in the local source docs so developers can understand the native SDK landscape, but this package only bridges the standalone TikTok Business iOS and Android SDKs.

For privacy-sensitive values, the RN layer only passes runtime values to native methods. It must not hash, persist, normalize, or rewrite email, phone, or other customer identifiers in JavaScript.

## Privacy and consent boundary

The React Native SDK does not provide a consent UI and does not decide whether tracking is allowed. The host app owns consent prompts, privacy policy compliance, ATT timing, and business-specific data eligibility.

Email and phone values in `identify(payload)` are pass-through values. The JavaScript layer does not hash, persist, or rewrite them.

## Error model

The JavaScript layer does not create a unified `SdkError`. Rejections surface native bridge payloads so platform-specific codes and details remain available to host apps.

## Example app role

The example app is a manual validation surface for initialization, automatic event configuration, event reporting, Advanced Matching, debug/log options, and platform-specific APIs. It must use sample payloads only and must not include real credentials or sensitive user data.
