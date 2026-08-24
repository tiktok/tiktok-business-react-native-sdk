# Releasing Guide

This guide covers release preparation and npm publishing for `@tiktok-business/react-native-sdk`.

## Versioning

Use semantic versioning:

- Patch: bug fixes, documentation fixes, and internal changes that do not alter public API behavior.
- Minor: new backwards-compatible APIs, new unprefixed platform-specific root capabilities, or native SDK compatibility updates that do not break consumers.
- Major: breaking TypeScript API changes, changed native setup requirements, removed APIs, or changed runtime behavior that requires app code changes.

This initialize-contract replacement is a major change because it changes required credentials and initialization controls.

## Release preparation

Start from a clean working tree and install dependencies:

```sh
pnpm install
```

Run the release validation checks:

```sh
pnpm check
pnpm build
pnpm package:validate
```

Validate examples when native code or dependencies changed:

```sh
pnpm example:android
pnpm example:ios
pnpm --filter tiktok-business-react-native-sdk-example build:android
pnpm --filter tiktok-business-react-native-sdk-example build:ios
```

Use the Example App manual golden paths before release: initialize with required credentials and initialization controls, track standard/content/custom/ad revenue events, flush, identify, logout, validate iOS ATT/SKAN ownership, and validate Android purchase reporting only when native purchase prerequisites are configured. Confirm the Example App only shows controls supported by the running OS and uses checkbox/switch-style controls for boolean options.

## Package contents

The package is controlled by the `files` field in `package.json`. The publish tarball should include:

- `src/`
- `lib/`
- `android/`
- `ios/`
- `TiktokBusinessReactNativeSdk.podspec`
- `README.md`
- `LICENSE`
- `package.json`

Run this before release:

```sh
pnpm package:validate
```

Confirm build directories, caches, tests, example app files, and local native artifacts are not included.

## Native SDK compatibility

Before release, verify the native SDK versions declared by this package:

- iOS: `TiktokBusinessReactNativeSdk.podspec` dependency on `TikTokBusinessSDK`
- Android: `android/build.gradle` dependency on `com.github.tiktok:tiktok-business-android-sdk`

If a native SDK version changes, update:

1. `docs/api.md` if mappings or supported APIs changed.
2. `docs/troubleshooting.md` if setup or dependency resolution changed.
3. `README.md` compatibility notes if host-app requirements changed.
4. Unit tests and native bridge code if signatures changed.

- When updating native SDK versions, re-check deferred deeplink, consent/data-sharing, advertiser ID, pre-consent tracking delay, enhance data postback, automatic IAP, and ad revenue APIs against `docs/api.md` and `docs/tiktok-app-events-sdk/`.

## release-it flow

The package uses `release-it` for versioning and publishing.

Dry-run the release flow first:

```sh
pnpm release --dry-run
```

Create the release when validation is complete:

```sh
pnpm release
```

The release configuration updates the version, creates a git tag, publishes to npm, and creates a GitHub release.

## npm publish requirements

- Confirm npm authentication with publish rights for `@tiktok-business`.
- Confirm `publishConfig.access` is `public`.
- Confirm the package name is `@tiktok-business/react-native-sdk`.
- Confirm the package tarball contents with `pnpm package:validate`.

## Release checklist

- [ ] Version bump follows semantic versioning.
- [ ] `pnpm check` passes.
- [ ] `pnpm build` passes and produces `lib/`.
- [ ] `pnpm package:validate` contains only intended publish artifacts.
- [ ] Android example run or build passes when Android bridge or dependencies changed.
- [ ] iOS example run or build passes when iOS bridge or dependencies changed.
- [ ] README and API docs match the release API surface and support matrix.
- [ ] Native SDK compatibility notes are current.
- [ ] No real App IDs, access tokens, phone numbers, email addresses, internal links, or internal business assumptions are present.
- [ ] Do not commit real App IDs, access tokens, internal links, internal business assumptions, phone, or email values.
- [ ] Docs and comments may help external developers integrate and troubleshoot, but must not expose App IDs, access tokens, internal links, internal business assumptions, or other sensitive information.
- [ ] Debug mode and verbose logging are disabled for production guidance.
- [ ] Duplicate Purchase reporting risks are documented when automatic IAP tracking and manual purchase APIs can overlap.
