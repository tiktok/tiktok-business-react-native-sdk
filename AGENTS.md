# Repository Guidelines

## Project Structure & Module Organization

This is a pnpm workspace for the `@tiktok-business/react-native-sdk` React Native library. Core TypeScript lives in `src/`, with the TurboModule spec in `src/NativeTiktokBusinessReactNativeSdk.ts` and public exports in `src/index.tsx`. Native implementations live in `android/src/main/java/com/tiktokbusinessreactnativesdk/` and `ios/`. The runnable sample app is under `example/`, including `example/src/`, `example/android/`, and `example/ios/`. Generated build output goes to `lib/`, `build/`, and platform build directories; do not edit generated files directly. Project docs are in `docs/`.

## Build, Test, and Development Commands

Use pnpm, not npm; Node version is defined in `.nvmrc`.

- `pnpm install`: install workspace dependencies.
- `pnpm dev` or `pnpm example:start`: start Metro for the example app.
- `pnpm example:ios` / `pnpm example:android`: build and run the example app.
- `pnpm typecheck`: run TypeScript checks.
- `pnpm lint`: run ESLint and Prettier validation.
- `pnpm test`: run Jest tests.
- `pnpm check`: run lint, typecheck, and tests.
- `pnpm build`: build distributable JS/types with Bob.
- `pnpm release:prepare`: full pre-release validation.

## Coding Style & Naming Conventions

Follow `.editorconfig`: 2-space indentation, LF endings, UTF-8, trimmed trailing whitespace, and final newlines. Prettier settings use single quotes, `tabWidth: 2`, trailing commas where valid in ES5, and consistent quoted object props. Keep TypeScript exports explicit and place public SDK APIs in `src/index.tsx`. Use PascalCase for React components and native classes, camelCase for functions, and package names matching existing Android/iOS namespaces.

## Testing Guidelines

Jest with the React Native preset is configured in `package.json`. Put unit tests near source files in `__tests__/` or use `*.test.ts(x)` naming, as in `src/__tests__/index.test.tsx`. Add or update tests for behavior changes, then run `pnpm test`; run `pnpm check` before handing off larger changes. For native changes, also validate through the example app on the affected platform.

## Commit & Pull Request Guidelines

Commits use Conventional Commits enforced by commitlint, for example `feat: add login helper`, `fix: handle Android null activity`, or `docs: update release notes`. Keep PRs focused and small. Include a clear summary, testing evidence (`pnpm check`, platform runs), linked issues when applicable, and screenshots or screen recordings for UI/example app changes. Discuss API or native architecture changes with maintainers before opening a large PR.
