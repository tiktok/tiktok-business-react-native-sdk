import {
  TikTokContentEventNames,
  TikTokEventNames,
  type AdvancedMatchingPayload,
  type AndroidGooglePlayPurchasePayload,
  type EventProperties,
  type TrackAdRevenueEventOptions,
} from '@tiktok-business/react-native-sdk';

import type { RuntimeSdkConfig } from '../types/debugConsole';

export const defaultInitializeConfig: RuntimeSdkConfig = {
  appId: '',
  accessToken: '',
  tiktokAppId: [],
  disableTrack: false,
  disableAutoTrack: false,
  disableRetentionTrack: false,
  disablePayTrack: false,
  disableInstallTrack: false,
  disableLaunchTrack: false,
  disableEnhancedDataPostbackTrack: false,
  openLimitedDataUse: false,
  setIsLowPerformanceDevice: false,
  debug: {
    enabled: true,
    logLevel: 'debug',
  },
  ios: {
    disableSKAdNetworkSupport: false,
    setDelayForATTUserAuthorizationInSeconds: undefined,
  },
};

export const defaultTrackEventProperties: EventProperties = {
  currency: 'USD',
  value: 9.99,
  description: 'Debug console standard event',
};

export const defaultTrackContentEventProperties: EventProperties = {
  contentId: 'demo-content-id',
  contentType: 'product',
  value: 9.99,
  currency: 'USD',
  description: 'Debug console content event',
  contents: [
    {
      contentId: 'demo-content-id',
      contentName: 'Debug console content',
      contentCategory: 'demo',
      quantity: 1,
      price: 9.99,
      brand: 'Example Brand',
    },
  ],
};

export const defaultTrackCustomEventProperties: EventProperties = {
  source: 'debug-console',
  flow: 'example',
};

export const defaultTrackAdRevenueEventProperties: TrackAdRevenueEventOptions =
  {
    adNetwork: 'example-network',
    adPlatform: 'example-platform',
    adUnit: 'rewarded-video',
    placement: 'home_feed',
    currency: 'USD',
    revenue: 1.25,
  };

export const defaultIdentifyPayload: AdvancedMatchingPayload = {
  externalId: 'demo-user-id',
  externalUserName: 'demo-user',
};

export const defaultAndroidGooglePlayPurchasePayload: AndroidGooglePlayPurchasePayload =
  {
    purchase: {
      orderId: 'demo-order-id',
      packageName: 'com.example.debug',
      purchaseToken: 'enter-purchase-token-at-runtime',
      productId: 'demo.sku.monthly',
    },
    skuDetails: {
      productId: 'demo.sku.monthly',
      price: '$9.99',
      price_amount_micros: 9990000,
      price_currency_code: 'USD',
      title: 'Demo Monthly Plan',
    },
    eventId: 'android-purchase-event-id',
  };

export const standardEventNames = Object.values(TikTokEventNames);
export const contentEventNames = Object.values(TikTokContentEventNames);

export const defaultCustomEventName = 'DebugCustomEvent';
export const defaultStandardEventName = TikTokEventNames.LaunchApp;
export const defaultContentEventName = TikTokContentEventNames.ViewContent;
