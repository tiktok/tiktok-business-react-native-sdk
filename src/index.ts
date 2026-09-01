export {
  default,
  fetchDeferredDeeplink,
  flush,
  identify,
  initialize,
  logout,
  startTrack,
  trackAdRevenueEvent,
  trackContentEvent,
  trackCustomEvent,
  trackEvent,
} from './sdk';
export { trackGooglePlayPurchase } from './android';
export {
  requestTrackingAuthorization,
  trackStoreKit2PurchaseFailed,
} from './ios';

export type {
  AdvancedMatchingPayload,
  AndroidGooglePlayPurchasePayload,
  ContentParams,
  DebugConfig,
  DeferredDeeplinkResult,
  EventProperties,
  InitializeResult,
  IosConfig,
  JsonObject,
  JsonPrimitive,
  JsonValue,
  LogLevel,
  Platform,
  TikTokBusinessInitializeConfig,
  TikTokBusinessSdk,
  TikTokContentEventName,
  TikTokEventName,
  TrackAdRevenueEventOptions,
  TrackContentEventOptions,
  TrackCustomEventOptions,
  TrackEventOptions,
} from './types';

export {
  TikTokContentEventName as TikTokContentEventNames,
  TikTokEventName as TikTokEventNames,
  TikTokEventPropertyKey,
  UnsupportedPlatformErrorCode,
} from './types';
