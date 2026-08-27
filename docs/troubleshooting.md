# Troubleshooting

This guide covers common setup, runtime, CI, and publishing failures for `@tiktok-for-business/react-native-sdk`.

## SDK not initialized

Call `initialize` before event, identity, flush, or deferred-deeplink operations:

```ts
await TikTokBusinessSDK.initialize({
  appId: 'sample-app-id',
  accessToken: 'sample-access-token',
  tiktokAppId: ['sample-tiktok-app-id'],
});
```

Initialization controls are startup settings. Changing them after initialization does not retroactively alter the native SDK instance.

## Native errors and platform APIs

The JavaScript layer preserves native rejection details rather than wrapping them in an SDK-specific error class. Log the runtime rejection payload while debugging.

- `requestTrackingAuthorization()` and `trackStoreKit2PurchaseFailed()` are iOS-only.
- `trackStoreKit2PurchaseFailed()` additionally requires iOS 15+ and a non-empty product ID.
- `trackGooglePlayPurchase()` is Android-only.
- Wrong-platform calls reject before invoking a native platform API.

## Deferred deeplink returned no URL

Check that initialization completed, the campaign and install are eligible, and the host app can route the returned URI. An empty result means no URL was available for the current install/session; it is not necessarily a bridge failure.

## iOS pods or lockfile changed in deployment mode

CocoaPods may recalculate the Hermes podspec checksum across environments. CI preserves the committed Hermes checksum before comparing the generated lockfile, so any other dependency or checksum change causes:

```text
There were changes to the lockfile in deployment mode
```

Regenerate `example/ios/Podfile.lock` with the same Ruby/Bundler, CocoaPods, and React Native versions used by CI, then review and commit the legitimate lockfile update. Do not disable deployment verification merely to hide an unexplained diff.

The current CI normalizes the known machine-specific Hermes checksum before comparing the lockfile; changes to other entries still fail intentionally.

## iOS build takes a long time

A cold React Native New Architecture build can spend many minutes installing pods and compiling React Native and its native dependencies from source. Turborepo can skip the native build when all tracked inputs are unchanged, but a cache miss performs the full build.

If logs appear idle, run the underlying build with `--verbose` or inspect the active `xcodebuild` process before cancelling. Long compile periods are expected on a fresh GitHub-hosted macOS runner.

## iOS ATT and SKAN

- Add `NSUserTrackingUsageDescription` before requesting ATT.
- Call ATT only at the host app's intended consent moment.
- Decide whether the host app, MMP, or TikTok SDK owns SKAN conversion updates.
- Use `ios.disableSKAdNetworkSupport: true` before initialization when SDK SKAN support must be disabled.
- Reinstall pods after native SDK or Codegen changes.

## Android dependency conflicts

Inspect the resolved runtime graph:

```sh
cd example/android
./gradlew :app:dependencies --configuration debugRuntimeClasspath
```

Check JitPack access, compile/target SDK compatibility, Java 8 support, Lifecycle, Google Play Billing, Install Referrer, and R8/Proguard rules. The package currently declares Android TikTok Business SDK `1.7.0`, Lifecycle `2.8.7`, Billing `7.1.1`, and Install Referrer `2.2`.

## Android emulator HTTPS proxy

For a proxy running on the host Mac, configure Android Studio Emulator with the special host address:

```sh
adb shell settings put global http_proxy 10.0.2.2:9900
adb shell settings get global http_proxy
```

Replace `9900` with the actual proxy port. `127.0.0.1` points to the emulator itself. Install/trust the proxy CA in the emulator; the Example App's Debug network security configuration permits user CAs. Remove the proxy afterward:

```sh
adb shell settings put global http_proxy :0
```

If CONNECT requests appear but HTTPS bodies do not, verify CA trust and TLS interception. Certificate pinning cannot be decoded by a normal MITM proxy.

## Gzip request bodies in Bifrost

TikTok batch requests may send `Content-Encoding: gzip` with `Content-Type: application/json`. A binary-looking Body is compressed, not necessarily encrypted. Use a Bifrost Decode rule that reads the automatically decompressed request body and formats JSON; apply the rule to the target endpoint and trigger a new request because existing history is not reprocessed.

## Metro and pnpm resolution

```sh
pnpm install --frozen-lockfile
pnpm example:start -- --reset-cache
```

The committed Example App resolves the workspace package through `workspace:*`. If validating a published npm artifact, temporarily pin an exact version, reinstall, verify the resolved package, and restore the workspace dependency before committing.

## Purchase duplication

Do not manually submit the same purchase already reported by automatic IAP tracking. If the host app owns manual purchase reporting, set `disablePayTrack: true` before initialization according to the measurement plan. `trackAdRevenueEvent` is for ad monetization, not store purchases.

## npm publish fails with `EOTP`

`EOTP` means npm requires an authenticator one-time password for that credential/publish operation. An interactive OTP is unsuitable for unattended GitHub Actions. Configure npm Trusted Publishing for the exact GitHub repository and `.github/workflows/release.yml`, ensure the workflow grants `id-token: write`, and publish without `NPM_TOKEN`.

## npm publish returns 403

Verify:

- The package/scope is exactly `@tiktok-for-business/react-native-sdk`.
- The npm account or trusted publisher has publish access to `@tiktok-for-business`.
- The trusted publisher repository owner, repository name, and workflow filename match exactly.
- The version does not already exist; npm versions are immutable.
- `publishConfig.registry` is `https://registry.npmjs.org/` and access is public.

## Package validation includes unexpected files

```sh
pnpm clean
pnpm build
pnpm package:validate
```

Review the root `package.json` `files` field and do not publish Example App artifacts, caches, credentials, logs, or platform build directories.

## Sensitive debugging values

Never commit or paste real App IDs, access tokens, personal identifiers, private links, or business-sensitive values into source, docs, CI logs, screenshots, or issue reports. Use runtime-only sample values and disable verbose logging for production.
