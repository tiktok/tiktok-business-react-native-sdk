# API 参考

本文档说明 `@tiktok-for-business/react-native-sdk` 的公共 API、平台支持、原生 SDK 映射、错误行为和发布注意事项。英文版本见 `docs/api.md`。

## 原生能力支持矩阵

支持状态说明：

- **支持**：通过 iOS 和 Android 共享的 React Native API 可用。
- **平台特定**：只在支持该能力的原生平台可用；错误平台调用会先在 JavaScript 层拒绝。
- **宿主 App 负责**：集成所需能力，但由 App target 或原生 SDK 配置负责，不由本 React Native 包托管。
- **暂不支持**：原生 SDK 有文档能力，但当前 bridge 尚未暴露。
- **范围外**：有意不纳入当前 React Native bridge。

| 原生 SDK 能力 | RN bridge 状态 | RN API 或责任方 |
| --- | --- | --- |
| Android SDK 安装 | 宿主 App 负责 | 包内 Gradle 配置包含 SDK 依赖；宿主 App 负责仓库、权限、版本冲突和 release shrinker 规则。 |
| iOS SDK 安装 | 宿主 App 负责 | 包内 podspec 安装原生 SDK；宿主 App 执行 CocoaPods 并负责 app target 配置。 |
| SDK 初始化 | 支持 | `initialize(config)` |
| App ID、access token、TikTok App IDs | 支持 | `initialize({ appId, accessToken, tiktokAppId })`；`tiktokAppId` 支持 `string` 或 `string[]`。 |
| 多个 TikTok App IDs | 支持 | 传入 `tiktokAppId: ['sample-tiktok-app-id', 'sample-tiktok-app-id-2']`；JS wrapper 会拼接后传给原生 SDK。 |
| 初始化 tracking 控制 | 支持 | `disableAutoTrack`、`disablePayTrack`、`disableInstallTrack`、`disableLaunchTrack` 等顶层开关在原生 SDK 启动前生效。 |
| 标准事件 | 支持 | `trackEvent(eventName, options?)`；导出标准常量，但仍允许自定义字符串。 |
| 内容事件 | 支持 | `trackContentEvent(eventName, options)` 和 `TikTokContentEventNames`。 |
| 自定义事件 | 支持 | `trackCustomEvent(eventName, options?)`。 |
| App 内广告收入上报 | 支持 | `trackAdRevenueEvent(options)`。 |
| 运行时恢复 tracking | 支持 | `startTrack()` 在启动时禁用 tracking 后恢复事件发送。 |
| 手动 flush | 支持 | `flush()`。 |
| Advanced Matching identify/logout | 支持 | `identify(payload)` 和 `logout()`；RN 层不 hash、持久化或改写 email/phone。 |
| iOS App Tracking Transparency | 平台特定 | iOS 使用 `requestTrackingAuthorization()`；宿主 App 负责 `NSUserTrackingUsageDescription`、弹窗时机和同意流程。 |
| iOS StoreKit 2 购买失败上报 | 平台特定 | iOS 15+ 使用 `trackStoreKit2PurchaseFailed(productId)`；Promise 只表示原生接受请求，不表示事件已上传。 |
| iOS SKAdNetwork 归属 | 平台特定 | 当宿主 App 或 MMP 负责 SKAN 时使用 `initialize({ ios: { disableSKAdNetworkSupport: true } })`。 |
| Android Google Play 购买上报 | 平台特定 | Android 使用 `trackGooglePlayPurchase(payload)`。 |
| Android install referrer 和 lifecycle 集成 | 宿主 App 负责 | 包内 Gradle 包含依赖；宿主 App 负责 app 级配置和冲突处理。 |
| Deferred deeplink | 支持 | 初始化成功后调用 `fetchDeferredDeeplink()`。 |
| 用户同意后的数据共享 | 支持 | `initialize({ disableTrack: true })` 可延迟启动 tracking；用户同意后调用 `startTrack()` 恢复事件发送。宿主 App 负责同意流程和政策判断。 |
| Advertiser ID 采集控制 | 暂不支持 | 没有稳定原生双端对等能力前，不新增共享 RN 抽象；宿主 App 负责 Android 权限、iOS ATT 时机和隐私政策。 |
| 同意前 tracking 延迟 | 支持 | `initialize({ disableTrack: true })` 在启动时禁用 tracking；`startTrack()` 在运行时恢复。 |
| Enhance data postback 初始化控制 | 支持 | `disableEnhancedDataPostbackTrack` 映射原生 auto-EDP 禁用开关；`setIsLowPerformanceDevice` 为 `true` 时应用原生低性能设备模式。 |
| Unity SDK | 范围外 | 不提供 React Native bridge。 |
| TikTok App Events 和 Pangle 组合 SDK | 范围外 | 不提供组合 SDK 或 Pangle 迁移 bridge。 |

## 原生 SDK 兼容性

| 平台 | 原生 SDK 依赖 | 版本来源 | 说明 |
| --- | --- | --- | --- |
| Android | `com.github.tiktok:tiktok-business-android-sdk` `1.7.0` | `android/build.gradle` | 包内还固定 Lifecycle `2.8.7`、Billing `7.1.1` 和 Install Referrer `2.2`；宿主 App 负责仓库配置和冲突处理。 |
| iOS | `TikTokBusinessSDK` `1.7.2` | `TiktokBusinessReactNativeSdk.podspec` | CocoaPods 安装固定版本；宿主 App 仍负责 app target、ATT 文案和 SKAN 归属。 |

## 错误行为

公共 Promise API 直接调用原生 bridge。拒绝时的 code、message 和附加信息来自对应原生 bridge 路径。

JavaScript 层不额外包装错误模型。共享业务代码处理 rejection 时，应检查运行时返回的错误对象。

## 平台支持矩阵

| API | iOS | Android | 原生映射 |
| --- | --- | --- | --- |
| `initialize(config)` | Yes | Yes | iOS `TikTokBusiness.initializeSdk`；Android `TikTokBusinessSdk.initializeSdk` |
| `trackEvent(eventName, options?)` | Yes | Yes | iOS `TikTokBaseEvent`；Android `TTBaseEvent` |
| `trackContentEvent(eventName, options)` | Yes | Yes | iOS `TikTokContentsEvent` 子类；Android `TTContentsEvent` builders |
| `trackCustomEvent(eventName, options?)` | Yes | Yes | iOS `TikTokBaseEvent`；Android `TTBaseEvent` |
| `trackAdRevenueEvent(options)` | Yes | Yes | iOS `TikTokAdRevenueEvent`；Android `TTAdRevenueEvent` |
| `startTrack()` | Yes | Yes | iOS `setTrackingEnabled:YES`；Android `startTrack` |
| `flush()` | Yes | Yes | iOS `explicitlyFlush`；Android `flush` |
| `identify(payload)` | Yes | Yes | iOS `identifyWithExternalID...`；Android `identify` |
| `logout()` | Yes | Yes | iOS `logout`；Android `logout` |
| `fetchDeferredDeeplink()` | Yes | Yes | iOS deferred deeplink fetch；Android deferred deeplink fetch |
| `requestTrackingAuthorization()` | Yes | No | JS 平台检查后调用 iOS `requestTrackingAuthorizationWithCompletionHandler` |
| `trackStoreKit2PurchaseFailed(productId)` | Yes | No | JS 平台检查后在 iOS 15+ 调用 `trackStoreKit2PurchaseFailedWithProductId:` |
| `trackGooglePlayPurchase(payload)` | No | Yes | JS 平台检查后调用 Android `trackGooglePlayPurchase`，传入 `TTPurchaseInfo` |

错误平台调用会在 JavaScript 方法内拒绝，不会调用原生平台 API。

## 类型

```ts
export type LogLevel =
  | 'none'
  | 'error'
  | 'warning'
  | 'info'
  | 'debug'
  | 'verbose';

export interface TikTokBusinessInitializeConfig {
  appId: string;
  accessToken: string;
  tiktokAppId: string | string[];
  disableTrack?: boolean;
  disableAutoTrack?: boolean;
  disableRetentionTrack?: boolean;
  disablePayTrack?: boolean;
  disableInstallTrack?: boolean;
  disableLaunchTrack?: boolean;
  disableEnhancedDataPostbackTrack?: boolean;
  openLimitedDataUse?: boolean;
  setIsLowPerformanceDevice?: boolean;
  debug?: DebugConfig;
  ios?: IosConfig;
}
```

`tiktokAppId` 可以是单个字符串或字符串数组。多个 TikTok App ID 请使用数组，每一项保持为单个 ID，不包含逗号或空格。初始化时 bridge 会将数组拼接为原生 SDK 使用的字符串。配置多个 ID 时，Test Events 通常显示在第一个 TikTok App ID 对应的 Events Manager 条目下。

## `initialize(config)`

初始化原生 SDK。请在 tracking 事件前调用。

```ts
await TikTokBusinessSDK.initialize({
  appId: 'sample-app-id',
  accessToken: 'sample-access-token',
  tiktokAppId: ['sample-tiktok-app-id'],
  disableAutoTrack: true,
  disablePayTrack: true,
  debug: {
    enabled: __DEV__,
    logLevel: __DEV__ ? 'debug' : 'none',
  },
  ios: {
    disableSKAdNetworkSupport: true,
    setDelayForATTUserAuthorizationInSeconds: 30,
  },
});
```

### 初始化控制

初始化控制必须在初始化前设置，因为原生 SDK 会在启动期间应用这些开关。只有在确实需要对应行为被禁用或启用时，才将开关设为 `true`。

`disableTrack` 禁用启动 tracking。`disableAutoTrack`、`disableRetentionTrack`、`disablePayTrack`、`disableInstallTrack` 和 `disableLaunchTrack` 分别控制对应 tracking 路径。`disableEnhancedDataPostbackTrack`、`openLimitedDataUse` 和 `setIsLowPerformanceDevice` 只有设为 `true` 时才应用。

`openLimitedDataUse` 在当前原生 bridge 中仅 Android 生效，iOS 会忽略。`setIsLowPerformanceDevice` 在双端为 `true` 时生效。`disableEnhancedDataPostbackTrack` 映射原生 auto-EDP 禁用行为。

### 运行时恢复 tracking

年龄门禁或同意流程需要延迟启动 tracking 时，可以先用 `disableTrack: true` 初始化，然后在宿主 App 允许发送事件后调用 `startTrack()`：

```ts
await TikTokBusinessSDK.initialize({
  appId: 'sample-app-id',
  accessToken: 'sample-access-token',
  tiktokAppId: ['sample-tiktok-app-id'],
  disableTrack: true,
});

await TikTokBusinessSDK.startTrack();
```

`startTrack()` 映射到 Android `TikTokBusinessSdk.startTrack()` 和 iOS `[TikTokBusiness setTrackingEnabled:YES]`。它有意设计为单向恢复 API；共享 React Native API 不暴露 `setTrackingEnabled(boolean)`，因为 Android 原生 SDK 没有对等的运行时关闭 API。

### iOS SKAN 归属

如果 MMP 或宿主 App 负责 SKAN conversion updates，请在初始化前禁用 SDK SKAN 支持：

```ts
await TikTokBusinessSDK.initialize({
  appId: 'sample-app-id',
  accessToken: 'sample-access-token',
  tiktokAppId: ['sample-tiktok-app-id'],
  ios: {
    disableSKAdNetworkSupport: true,
  },
});
```

## 事件

### 事件常量

`TikTokEventNames` 和 `TikTokContentEventNames` 包含 `src/types.ts` 中实现的稳定、非废弃事件名。这些常量只是便捷导出：`trackEvent` 和 `trackCustomEvent` 仍接受任意字符串，以便广告主 App 发送 measurement plan 支持的自定义或合作伙伴事件。

`TikTokEventNames.ImpressionLevelAdRevenue` 已导出以对齐原生 SDK 标准事件常量。广告变现收入仍建议优先使用 `trackAdRevenueEvent(options)`，因为它在双端都映射到专用原生广告收入事件类。

内容事件常量包含 `AddToCart`、`AddToWishlist`、`Checkout`、`Purchase` 和 `ViewContent`。

### `trackEvent(eventName, options?)`

用于标准事件或合作伙伴定义事件名。SDK 不会把 `eventName` 强限制为枚举值。

```ts
await TikTokBusinessSDK.trackEvent('LaunchApp', {
  properties: {
    currency: 'USD',
    value: 1,
  },
});
```

### `trackContentEvent(eventName, options)`

用于内容相关事件，例如 `AddToCart`、`AddToWishlist`、`Checkout`、`Purchase` 和 `ViewContent`。

```ts
await TikTokBusinessSDK.trackContentEvent('ViewContent', {
  properties: {
    contentId: 'sku-123',
    contentType: 'product',
    currency: 'USD',
    value: 9.99,
  },
  contents: [
    {
      contentId: 'sku-123',
      contentName: 'Example product',
      quantity: 1,
      price: 9.99,
    },
  ],
});
```

### `trackCustomEvent(eventName, options?)`

自定义事件名和属性会透传给原生。原生 SDK 或 TikTok 后端可能忽略不支持的属性。

```ts
await TikTokBusinessSDK.trackCustomEvent('CheckoutStepSelected', {
  properties: {
    step: 'shipping',
  },
});
```

### `trackAdRevenueEvent(options)`

```ts
await TikTokBusinessSDK.trackAdRevenueEvent({
  adNetwork: 'example-network',
  adPlatform: 'example-platform',
  revenue: 1.25,
  currency: 'USD',
  adUnit: 'rewarded-video',
});
```

### `flush()`

在当前原生 SDK 路径支持时 flush 队列事件。

```ts
await TikTokBusinessSDK.flush();
```

### `fetchDeferredDeeplink()`

初始化后获取 deferred deeplink。

```ts
const deeplink = await TikTokBusinessSDK.fetchDeferredDeeplink();
```

仅在 `initialize(config)` 成功后调用 `fetchDeferredDeeplink()`。没有 `url` 的结果表示当前安装或会话没有可用 deferred deeplink。宿主 App 仍负责正常 deeplink 路由、URI scheme、app link 和 universal link 配置。

### `trackStoreKit2PurchaseFailed(productId)`

在 iOS 15 或更高版本上报告 StoreKit 2 购买失败。

```ts
await TikTokBusinessSDK.trackStoreKit2PurchaseFailed('product-123');
```

`trackStoreKit2PurchaseFailed` 同时作为命名函数和默认 SDK 对象方法导出。它由懒加载的 iOS-only `TiktokBusinessReactNativeStoreKitIOS` TurboModule 支持，因此在 Android 导入包时不需要解析 StoreKit 模块。

Promise resolve 表示 iOS SDK 已接受请求。原生 SDK 异步上报事件，不提供上传完成回调。空 product ID 会拒绝；iOS 15 以下会按不支持拒绝。

## Advanced Matching

```ts
await TikTokBusinessSDK.identify({
  externalId: 'sample-user-id',
  externalUserName: 'sample-user',
  email: runtimeEmail,
  phoneNumber: runtimePhoneNumber,
});

await TikTokBusinessSDK.logout();
```

React Native 层不会 hash、持久化或改写 email/phone。它只将值传给原生 SDK，由原生 SDK 执行官方 Advanced Matching 行为。

### 隐私与合规边界

React Native SDK 本身不收集敏感数据，也不改写、normalize、hash 或持久化 email/phone。它只将运行时值传递给原生 SDK，由原生 SDK 执行官方 Advanced Matching 行为。

宿主 App 负责同意时机、用户披露和数据共享政策。本包不实现 JavaScript consent manager，也不存储客户标识符。除非宿主 App 已根据适用政策和条款判断允许，否则不要向 TikTok 传递敏感数据。

## iOS 专用 API

### `requestTrackingAuthorization()`

```ts
const status = await TikTokBusinessSDK.requestTrackingAuthorization();
```

宿主 App 必须提供 `NSUserTrackingUsageDescription` 并负责同意 UX。只有当它符合 App 隐私流程和 Apple 政策要求时才调用。

## Android 专用 API

### `trackGooglePlayPurchase(payload)`

```ts
await TikTokBusinessSDK.trackGooglePlayPurchase({
  purchase: purchaseJson,
  skuDetails: skuDetailsJson,
});
```

仅在宿主 App 已有 Google Play Billing purchase 和 SKU detail payload 时使用。避免重复 Purchase 上报：如果自动 IAP tracking 已启用，除非 measurement plan 明确要求，否则不要再手动报告同一笔购买。

## 购买上报建议

自动 IAP tracking 和手动购买上报都可能产生类似 Purchase 的信号。除非 measurement plan 明确要求重复上报，否则同一笔交易只选择一种上报路径。

- 当原生 SDK 支持的 StoreKit 或 Google Play Billing 流程足够时，保持自动购买 tracking 启用。
- 如果宿主 App 会手动报告同一类购买，请在 SDK 启动前设置 `disablePayTrack: true`。
- 仅在 Android 上调用 `trackGooglePlayPurchase(payload)`，并且只传入从 Google Play Billing 获取的 purchase payload。
- iOS StoreKit 自动付款 tracking 保持为原生 SDK 和宿主 App 行为；本 RN 包不暴露手动 iOS StoreKit 购买 bridge。
- `trackAdRevenueEvent(options)` 只用于广告变现收入，不用于 App Store 或 Google Play 购买。

## 发布警告

- 不要提交真实 App IDs、access tokens、电话号码、邮箱、内部链接或内部业务假设。
- 生产发布前关闭 debug mode 和 verbose logging。
- 在宿主 App 中配置 Android AD_ID、Billing、Install Referrer、Lifecycle、WebView/main process 和 Proguard 要求。
- 在宿主 App 中配置 iOS ATT、SKAN 归属、linker flags 和 `NSUserTrackingUsageDescription`。
