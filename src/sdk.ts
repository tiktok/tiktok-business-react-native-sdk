import NativeTiktokBusinessReactNativeSdk from './NativeTiktokBusinessReactNativeSdk';
import { trackGooglePlayPurchase } from './android';
import {
  requestTrackingAuthorization,
  trackStoreKit2PurchaseFailed,
} from './ios';
import type {
  AdvancedMatchingPayload,
  DeferredDeeplinkResult,
  InitializeResult,
  TikTokBusinessInitializeConfig,
  TikTokBusinessSdk,
  TrackAdRevenueEventOptions,
  TrackContentEventOptions,
  TrackCustomEventOptions,
  TrackEventOptions,
} from './types';
import {
  normalizeContentProperties,
  normalizeInitializeConfig,
  normalizeProperties,
} from './utils';

/**
 * Initializes the native TikTok Business SDK.
 * @param config Runtime app credentials, TikTok App ID values, and optional platform/debug configuration.
 * @returns A promise that resolves with the native initialization result.
 */
export const initialize = (
  config: TikTokBusinessInitializeConfig
): Promise<InitializeResult> => {
  return NativeTiktokBusinessReactNativeSdk.initialize(
    normalizeInitializeConfig(config)
  ).then((result) => result as InitializeResult);
};

/**
 * Tracks a standard or partner-defined event through the native SDK.
 * @param eventName Native event name to report.
 * @param options Optional event properties to pass to native.
 * @returns A promise that resolves when native accepts the tracking request.
 */
export const trackEvent = (
  eventName: string,
  options?: TrackEventOptions
): Promise<void> => {
  return NativeTiktokBusinessReactNativeSdk.trackEvent(
    eventName,
    normalizeProperties(options?.properties)
  );
};

/**
 * Tracks a content event with optional content item details.
 * @param eventName Content event name to report.
 * @param options Event properties and content item payloads to pass to native.
 * @returns A promise that resolves when native accepts the tracking request.
 */
export const trackContentEvent = (
  eventName: string,
  options: TrackContentEventOptions
): Promise<void> => {
  return NativeTiktokBusinessReactNativeSdk.trackContentEvent(
    eventName,
    normalizeContentProperties(options)
  );
};

/**
 * Tracks a custom event through the native SDK.
 * @param eventName Custom event name to report.
 * @param options Optional custom event properties to pass to native.
 * @returns A promise that resolves when native accepts the tracking request.
 */
export const trackCustomEvent = (
  eventName: string,
  options?: TrackCustomEventOptions
): Promise<void> => {
  return NativeTiktokBusinessReactNativeSdk.trackCustomEvent(
    eventName,
    normalizeProperties(options?.properties)
  );
};

/**
 * Tracks an in-app ad revenue event through the native SDK.
 * @param options Ad network, revenue, currency, and optional placement metadata.
 * @returns A promise that resolves when native accepts the tracking request.
 */
export const trackAdRevenueEvent = (
  options: TrackAdRevenueEventOptions
): Promise<void> => {
  return NativeTiktokBusinessReactNativeSdk.trackAdRevenueEvent(
    normalizeProperties(options)
  );
};

/**
 * Resumes event sending after initialization with startup tracking disabled.
 * @returns A promise that resolves after the native SDK accepts the request.
 */
export const startTrack = (): Promise<void> => {
  return NativeTiktokBusinessReactNativeSdk.startTrack();
};

/**
 * Flushes queued events through the native SDK when supported.
 * @returns A promise that resolves after the native flush request completes.
 */
export const flush = (): Promise<void> => {
  return NativeTiktokBusinessReactNativeSdk.flush();
};

/**
 * Passes Advanced Matching identity values to the native SDK.
 * @param payload External ID, username, phone number, and email values to pass through.
 * @returns A promise that resolves after native accepts the identity payload.
 */
export const identify = (payload: AdvancedMatchingPayload): Promise<void> => {
  return NativeTiktokBusinessReactNativeSdk.identify(payload);
};

/**
 * Clears native Advanced Matching identity state.
 * @returns A promise that resolves after native logout completes.
 */
export const logout = (): Promise<void> => {
  return NativeTiktokBusinessReactNativeSdk.logout();
};

/**
 * Fetches a deferred deeplink from the native SDK after initialization.
 * @returns A promise that resolves with a deferred deeplink result, or an empty result when no URL is available.
 */
export const fetchDeferredDeeplink = (): Promise<DeferredDeeplinkResult> => {
  return NativeTiktokBusinessReactNativeSdk.fetchDeferredDeeplink().then(
    (result) => result as DeferredDeeplinkResult
  );
};

const TikTokBusinessSDK: TikTokBusinessSdk = {
  initialize,
  trackEvent,
  trackContentEvent,
  trackCustomEvent,
  trackAdRevenueEvent,
  startTrack,
  flush,
  identify,
  logout,
  requestTrackingAuthorization,
  trackStoreKit2PurchaseFailed,
  trackGooglePlayPurchase,
  fetchDeferredDeeplink,
};

export default TikTokBusinessSDK;
