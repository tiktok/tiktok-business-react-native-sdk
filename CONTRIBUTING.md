# Contributing

Contributions are welcome. Before contributing, please read the [Code of Conduct](./CODE_OF_CONDUCT.md).

## Project layout

- Root package: React Native library source, native bridge code, package configuration, and documentation.
- `example/`: React Native app used to validate the local package on iOS and Android.
- `docs/`: architecture, API, development, release, and troubleshooting documentation.

## Development workflow

Install dependencies from the repository root:

```sh
pnpm install
```

Start Metro:

```sh
pnpm example:start
```

Run the example apps:

```sh
pnpm example:android
pnpm example:ios
```

Native code changes require rebuilding the example app. Open `example/android` in Android Studio for Kotlin changes and `example/ios/TiktokBusinessReactNativeSdkExample.xcworkspace` in Xcode for Objective-C++ changes.

## Required checks

Run these before opening a pull request:

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm prepare
pnpm package:validate
```

If your change touches Android bridge code or Android dependencies, also run:

```sh
pnpm --filter tiktok-business-react-native-sdk-example build:android
```

If your change touches iOS bridge code, podspecs, or iOS dependencies, also run:

```sh
pnpm --filter tiktok-business-react-native-sdk-example build:ios
```

## Native bridge changes

When changing the TurboModule bridge:

1. Update `src/NativeTiktokBusinessReactNativeSdk.ts` first.
2. Update the public API composition in `src/index.ts`, `src/sdk.ts`, and any platform-specific method files.
3. Update both native platforms so they satisfy the generated spec.
4. Add or update unit tests in `src/__tests__/`.
5. Update `docs/api.md` with native SDK mappings and platform support.

If an API is supported by only one native SDK, expose it as an unprefixed root method with JavaScript wrong-platform rejection, not as a standalone named export or platform-prefixed public method.

## API mapping documentation rules

Every public API must document:

- TypeScript signature.
- Supported platform or whether it is an unprefixed platform-specific root method.
- Native iOS and/or Android SDK method mapping.
- Wrong-platform behavior for platform-specific root methods.
- Parameters and return type.
- Expected error behavior when relevant.

Do not document wrapper behavior that is not supported by the underlying TikTok Business native SDKs.

## Branch and PR expectations

- Keep pull requests focused on one feature or fix.
- Include documentation updates for public API, native setup, or release behavior changes.
- Include validation results in the PR description.
- Discuss large API changes with maintainers before implementation.
- Follow the pull request template when opening a PR.

## Commit messages

Use Conventional Commits:

- `feat`: new public functionality.
- `fix`: bug fixes.
- `docs`: documentation changes.
- `test`: tests.
- `refactor`: behavior-preserving code changes.
- `chore`: tooling, CI, and release maintenance.

## Publishing

Maintainers publish with `release-it` after validation:

```sh
pnpm release
```

See [docs/releasing.md](docs/releasing.md) for the full release checklist.
