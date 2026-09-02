# Releasing Guide

This guide describes the release workflow for `@tiktok-for-business/react-native-sdk` as implemented in `package.json` and `.github/workflows/release.yml`.

## Versioning

Use semantic versioning:

- **Patch**: backwards-compatible fixes and documentation-only changes.
- **Minor**: backwards-compatible public APIs or native SDK compatibility updates.
- **Major**: breaking TypeScript APIs, runtime behavior, or host-app setup requirements.

## Pre-release validation

Start from a clean working tree and use the pinned workspace tools:

```sh
nvm use
pnpm install --frozen-lockfile
pnpm release:prepare
pnpm package:validate
pnpm build:android
pnpm build:ios
```

`pnpm release:prepare` runs lint, typecheck, tests, and the library build. `pnpm package:validate` runs a dry-run pack so the publish manifest can be reviewed without uploading anything.

When native behavior changed, also launch the Example App and run the manual golden path: initialize, standard/content/custom/ad-revenue events, identify, flush, logout, deferred deeplink, iOS ATT/StoreKit where applicable, and Android Google Play purchase where real Billing payloads are available.

## Package contents

The `files` field in the root `package.json` controls the tarball. Expected publish inputs are:

- `src/`
- `lib/`
- `android/`
- `ios/`
- `TiktokBusinessReactNativeSdk.podspec`
- npm-standard root files such as `README.md`, `LICENSE`, and `package.json`

Build directories, caches, tests, Example App files, credentials, and local native artifacts must not be included.

## GitHub Actions release workflow

Releases are manually dispatched from **Actions → Release → Run workflow**. The selected Git ref determines the behavior.

### `main`: production release

Input `version` accepts `major`, `minor`, `patch`, or a concrete semantic version such as `1.2.3`.

The workflow:

1. Checks out full git history.
2. Installs pnpm/Node dependencies.
3. Upgrades npm so OIDC trusted publishing is supported and runs `pnpm check`.
4. Selects the same Xcode version as iOS CI, installs Ruby `4.0.6` to match `example/Gemfile.lock`, and installs the Bundler version pinned by that lockfile. Ruby gems are installed in frozen mode under the runner's temporary directory, so setup cannot rewrite the lockfile or create repository-local Bundler configuration.
5. Configures the GitHub Actions bot identity.
6. Runs `pnpm release --ci <version>`; after the version bump, declarative release hooks synchronize `src/version.ts`, run CocoaPods to regenerate `example/ios/Podfile.lock`, and verify that no other tracked iOS project file changed.
7. `release-it` commits `package.json`, `src/version.ts`, and `example/ios/Podfile.lock` together, creates the `v<version>` tag, publishes npm through Trusted Publishing, pushes git changes, and creates the GitHub release. npm's `prepare` lifecycle runs `pnpm build:root` before publication. The release-it npm authentication preflight is disabled because OIDC credentials are minted only during the actual `npm publish` process.

All releases run on a GitHub-hosted macOS runner because CocoaPods is part of every version bump. `Podfile.lock`, including its podspec checksums, is generated entirely by CocoaPods. If setup dirties the repository, CocoaPods cannot resolve dependencies, or CocoaPods modifies another tracked file under `example/ios`, the release stops before npm publication. Release workflow runs are serialized so two publications cannot overlap.

### Non-`main`: development release

The `version` input is ignored. The workflow creates:

```text
<package.json version>-dev.<short-sha>
```

It passes that immutable version through the same `release-it` hooks as a production release, including `src/version.ts` synchronization, CocoaPods lockfile generation, package build, and npm publication with dist-tag `dev`. Git commit, tag, push, and GitHub Release creation are disabled:

```sh
pnpm release "$DEV_VERSION" --ci --git=false --github=false --npm.tag=dev
```

A development release does not create or push a version commit, git tag, or GitHub release.

## npm Trusted Publishing setup

The workflow uses npm Trusted Publishing rather than a long-lived `NPM_TOKEN`. The workflow grants `id-token: write`; npm exchanges the GitHub OIDC identity for short-lived publish credentials.

On npmjs.com, open the package settings for `@tiktok-for-business/react-native-sdk` and add a trusted publisher with:

- Provider: GitHub Actions
- Organization/user: `tiktok`
- Repository: `tiktok-business-react-native-sdk`
- Workflow filename: `release.yml`
- Environment: leave empty unless the workflow job is later assigned a matching GitHub Environment

The repository/ref restriction is enforced by the workflow itself: `main` publishes production versions, while other manually selected branches publish `dev` versions.

Do not restore `NPM_TOKEN` unless Trusted Publishing is unavailable and the fallback is explicitly approved. A normal user/granular token can trigger npm `EOTP` when the account or package requires publish-time 2FA; passing an interactive OTP is not suitable for unattended CI.

## Native SDK compatibility check

Before publishing, verify:

- iOS `TikTokBusinessSDK` version in `TiktokBusinessReactNativeSdk.podspec`.
- Android `com.github.tiktok:tiktok-business-android-sdk` version in `android/build.gradle`.
- `docs/api.md` support matrix and examples.
- `docs/troubleshooting.md` host-app and dependency requirements.
- Example App builds on both platforms.

## Release checklist

- [ ] Semantic version is correct.
- [ ] Working tree contains only intended changes.
- [ ] `example/ios/Podfile.lock` is clean before dispatch; the workflow updates it during the version bump.
- [ ] `pnpm release:prepare` passes.
- [ ] `pnpm package:validate` contains only intended files.
- [ ] Android and iOS example builds pass for native/dependency changes.
- [ ] Manual SDK golden path passes where runtime credentials are available.
- [ ] README and all files under `docs/` match the public TypeScript API.
- [ ] Native SDK versions and host-app requirements are current.
- [ ] npm Trusted Publisher exactly matches repository and `release.yml`.
- [ ] No real App IDs, access tokens, personal data, private URLs, or debug secrets are committed.
- [ ] Production guidance keeps debug mode and verbose logging disabled.
- [ ] Automatic and manual purchase reporting cannot double-count the same transaction.
