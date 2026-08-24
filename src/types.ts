export type Platform = 'ios' | 'android';

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = { [key: string]: JsonValue | undefined };

export type LogLevel =
  | 'none'
  | 'error'
  | 'warning'
  | 'info'
  | 'debug'
  | 'verbose';

export const UnsupportedPlatformErrorCode = 'unsupported-platform';

export interface DebugConfig {
  enabled?: boolean;
  logLevel?: LogLevel;
}

export interface IosConfig {
  disableSKAdNetworkSupport?: boolean;
  setDelayForATTUserAuthorizationInSeconds?: number;
}

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

export interface InitializeResult {
  success: boolean;
  message?: string;
  platform?: Platform;
}

export interface DeferredDeeplinkResult extends JsonObject {
  url?: string;
  raw?: JsonValue;
}

export interface EventProperties extends JsonObject {
  currency?: string;
  value?: number;
  content_id?: string;
  contentId?: string;
  content_type?: string;
  contentType?: string;
  price?: number;
  quantity?: number;
}

export interface ContentParams extends JsonObject {
  price?: number;
  quantity?: number;
  contentId?: string;
  contentCategory?: string;
  contentName?: string;
  brand?: string;
}

export interface TrackEventOptions {
  properties?: EventProperties;
}

export interface TrackContentEventOptions {
  properties?: EventProperties;
  contents?: ContentParams[];
}

export interface TrackCustomEventOptions extends TrackEventOptions {}

export interface TrackAdRevenueEventOptions extends JsonObject {
  adNetwork: string;
  revenue: number;
  currency: string;
  adUnit?: string;
  adPlatform?: string;
}

export interface AdvancedMatchingPayload {
  externalId?: string;
  externalUserName?: string;
  phoneNumber?: string;
  email?: string;
}

export interface AndroidGooglePlayPurchasePayload extends JsonObject {
  purchase?: JsonObject;
  skuDetails?: JsonObject;
  eventId?: string;
}

export const TikTokEventName = {
  AchieveLevel: 'AchieveLevel',
  AddPaymentInfo: 'AddPaymentInfo',
  AddToCart: 'AddToCart',
  AddToWishlist: 'AddToWishlist',
  Checkout: 'Checkout',
  CompleteTutorial: 'CompleteTutorial',
  CreateGroup: 'CreateGroup',
  CreateRole: 'CreateRole',
  GenerateLead: 'GenerateLead',
  InAppAdClick: 'InAppAdClick',
  InAppAdImpression: 'InAppAdImpression',
  JoinGroup: 'JoinGroup',
  LaunchApp: 'LaunchApp',
  LoanApply: 'LoanApply',
  LoanApproval: 'LoanApproval',
  LoanDisbursal: 'LoanDisbursal',
  Login: 'Login',
  Purchase: 'Purchase',
  Rate: 'Rate',
  Registration: 'Registration',
  Search: 'Search',
  SpendCredit: 'SpendCredit',
  StartTrial: 'StartTrial',
  Subscribe: 'Subscribe',
  UnlockAchievement: 'UnlockAchievement',
  ViewContent: 'ViewContent',
} as const;

export type TikTokEventName =
  (typeof TikTokEventName)[keyof typeof TikTokEventName];

export const TikTokContentEventName = {
  AddToCart: 'AddToCart',
  AddToWishlist: 'AddToWishlist',
  Checkout: 'Checkout',
  Purchase: 'Purchase',
  ViewContent: 'ViewContent',
} as const;

export type TikTokContentEventName =
  (typeof TikTokContentEventName)[keyof typeof TikTokContentEventName];

export const TikTokEventPropertyKey = {
  AdNetwork: 'adNetwork',
  AdPlatform: 'adPlatform',
  AdUnit: 'adUnit',
  Brand: 'brand',
  ContentCategory: 'contentCategory',
  ContentId: 'contentId',
  ContentName: 'contentName',
  ContentType: 'contentType',
  Contents: 'contents',
  Currency: 'currency',
  Description: 'description',
  Placement: 'placement',
  Price: 'price',
  Quantity: 'quantity',
  Query: 'query',
  Value: 'value',
} as const;

export type TikTokEventPropertyKey =
  (typeof TikTokEventPropertyKey)[keyof typeof TikTokEventPropertyKey];

export interface TikTokBusinessSdk {
  initialize(config: TikTokBusinessInitializeConfig): Promise<InitializeResult>;
  trackEvent(eventName: string, options?: TrackEventOptions): Promise<void>;
  trackContentEvent(
    eventName: string,
    options: TrackContentEventOptions
  ): Promise<void>;
  trackCustomEvent(
    eventName: string,
    options?: TrackCustomEventOptions
  ): Promise<void>;
  trackAdRevenueEvent(options: TrackAdRevenueEventOptions): Promise<void>;
  flush(): Promise<void>;
  identify(payload: AdvancedMatchingPayload): Promise<void>;
  logout(): Promise<void>;
  requestTrackingAuthorization(): Promise<number | string>;
  trackStoreKit2PurchaseFailed(productId: string): Promise<void>;
  trackGooglePlayPurchase(
    payload: AndroidGooglePlayPurchasePayload
  ): Promise<void>;
  fetchDeferredDeeplink(): Promise<DeferredDeeplinkResult>;
}
