import { Platform } from 'react-native';
import TikTokBusinessSDK, {
  type AdvancedMatchingPayload,
  type AndroidGooglePlayPurchasePayload,
  type EventProperties,
  type TrackAdRevenueEventOptions,
} from '@tiktok-for-business/react-native-sdk';

import type {
  EditablePayloads,
  RuntimeSdkConfig,
  SdkAction,
  SupportedPlatform,
} from '../types/debugConsole';
import { toInitializeConfig } from '../types/debugConsole';

export const requiredActionIds = [
  'root.initialize',
  'root.trackEvent',
  'root.trackContentEvent',
  'root.trackCustomEvent',
  'root.trackAdRevenueEvent',
  'root.identify',
  'root.flush',
  'root.logout',
  'fetchDeferredDeeplink',
  'requestTrackingAuthorization',
  'trackGooglePlayPurchase',
] as const;

export const actionPlatformMap: Record<
  (typeof requiredActionIds)[number],
  SupportedPlatform
> = {
  'root.initialize': 'both',
  'root.trackEvent': 'both',
  'root.trackContentEvent': 'both',
  'root.trackCustomEvent': 'both',
  'root.trackAdRevenueEvent': 'both',
  'root.identify': 'both',
  'root.flush': 'both',
  'root.logout': 'both',
  'fetchDeferredDeeplink': 'both',
  'requestTrackingAuthorization': 'ios',
  'trackGooglePlayPurchase': 'android',
};

interface BuildSdkActionsOptions {
  runtimeConfig: RuntimeSdkConfig;
  editablePayloads: EditablePayloads;
  trackEventProperties?: EventProperties;
  identifyPayload?: AdvancedMatchingPayload;
  androidPurchasePayload?: AndroidGooglePlayPurchasePayload;
  adRevenuePayload?: TrackAdRevenueEventOptions;
}

function currentPlatform() {
  return Platform.OS === 'android' ? 'android' : 'ios';
}

export function buildSdkActions({
  runtimeConfig,
  editablePayloads,
  trackEventProperties,
  identifyPayload,
  androidPurchasePayload,
  adRevenuePayload,
}: BuildSdkActionsOptions): SdkAction[] {
  const platform = currentPlatform();
  const initializeConfig = toInitializeConfig(runtimeConfig);

  return [
    {
      id: 'root.initialize',
      label: 'Initialize',
      apiName: 'initialize',
      supportedPlatform: 'both',
      description:
        'Initialize the SDK with current app credentials, tracking, debug, and platform config; disable debug logs before release.',
      run: () => TikTokBusinessSDK.initialize(initializeConfig),
      getPayloadPreview: () => initializeConfig,
    },
    {
      id: 'root.trackEvent',
      label: 'Track standard event',
      apiName: 'trackEvent',
      supportedPlatform: 'both',
      description: 'Send a standard event with shared event properties.',
      run: () =>
        TikTokBusinessSDK.trackEvent(editablePayloads.standardEventName, {
          properties: trackEventProperties,
        }),
      getPayloadPreview: () => ({
        eventName: editablePayloads.standardEventName,
        properties: trackEventProperties,
      }),
    },
    {
      id: 'root.trackContentEvent',
      label: 'Track content event',
      apiName: 'trackContentEvent',
      supportedPlatform: 'both',
      description: 'Send a content event with content-specific properties.',
      run: () =>
        TikTokBusinessSDK.trackContentEvent(editablePayloads.contentEventName, {
          properties: editablePayloads.trackContentEventProperties,
        }),
      getPayloadPreview: () => ({
        eventName: editablePayloads.contentEventName,
        properties: editablePayloads.trackContentEventProperties,
      }),
    },
    {
      id: 'root.trackCustomEvent',
      label: 'Track custom event',
      apiName: 'trackCustomEvent',
      supportedPlatform: 'both',
      description: 'Send a custom event with a caller-defined event name.',
      run: () =>
        TikTokBusinessSDK.trackCustomEvent(editablePayloads.customEventName, {
          properties: editablePayloads.trackCustomEventProperties,
        }),
      getPayloadPreview: () => ({
        eventName: editablePayloads.customEventName,
        properties: editablePayloads.trackCustomEventProperties,
      }),
    },
    {
      id: 'root.trackAdRevenueEvent',
      label: 'Track ad revenue event',
      apiName: 'trackAdRevenueEvent',
      supportedPlatform: 'both',
      description: 'Send an ad revenue event with revenue-specific properties.',
      run: () =>
        TikTokBusinessSDK.trackAdRevenueEvent(
          adRevenuePayload ?? editablePayloads.trackAdRevenueEventProperties
        ),
      getPayloadPreview: () =>
        adRevenuePayload ?? editablePayloads.trackAdRevenueEventProperties,
    },
    {
      id: 'root.identify',
      label: 'Identify',
      apiName: 'identify',
      supportedPlatform: 'both',
      description:
        'Pass Advanced Matching identifiers through to the native SDK.',
      run: () => TikTokBusinessSDK.identify(identifyPayload ?? {}),
      getPayloadPreview: () => identifyPayload,
    },
    {
      id: 'root.flush',
      label: 'Flush',
      apiName: 'flush',
      supportedPlatform: 'both',
      description: 'Flush queued SDK events immediately.',
      run: () => TikTokBusinessSDK.flush(),
      getPayloadPreview: () => ({ platform }),
    },
    {
      id: 'root.logout',
      label: 'Logout',
      apiName: 'logout',
      supportedPlatform: 'both',
      description: 'Clear native Advanced Matching state.',
      run: () => TikTokBusinessSDK.logout(),
      getPayloadPreview: () => ({ platform }),
    },
    {
      id: 'fetchDeferredDeeplink',
      label: 'Fetch Deferred Deeplink',
      apiName: 'fetchDeferredDeeplink',
      supportedPlatform: 'both',
      description: 'Fetches a deferred deeplink after SDK initialization.',
      run: () => TikTokBusinessSDK.fetchDeferredDeeplink(),
      getPayloadPreview: () => ({ platform }),
    },
    {
      id: 'requestTrackingAuthorization',
      label: 'Request tracking authorization',
      apiName: 'requestTrackingAuthorization',
      supportedPlatform: 'ios',
      description:
        'Request ATT authorization through the iOS-only API after host app setup.',
      run: () => TikTokBusinessSDK.requestTrackingAuthorization(),
      getPayloadPreview: () => ({ platform }),
    },
    {
      id: 'trackGooglePlayPurchase',
      label: 'Track Google Play purchase',
      apiName: 'trackGooglePlayPurchase',
      supportedPlatform: 'android',
      description:
        'Track the current Google Play purchase payload on Android; avoid duplicate Purchase signals when auto IAP tracking is enabled.',
      run: () =>
        TikTokBusinessSDK.trackGooglePlayPurchase(
          androidPurchasePayload ?? { purchase: {}, skuDetails: {} }
        ),
      getPayloadPreview: () => androidPurchasePayload,
    },
  ];
}
