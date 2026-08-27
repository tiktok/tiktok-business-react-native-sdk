import type {
  AdvancedMatchingPayload,
  AndroidGooglePlayPurchasePayload,
  EventProperties,
  LogLevel,
  TikTokBusinessInitializeConfig,
  TikTokContentEventName,
  TikTokEventName,
  TrackAdRevenueEventOptions,
} from '@tiktok-for-business/react-native-sdk';

export type SupportedPlatform = 'ios' | 'android' | 'both';
export type ActionStatus = 'idle' | 'running' | 'success' | 'error';

export interface RuntimeSdkConfig extends TikTokBusinessInitializeConfig {
  tiktokAppId: string[];
  debug: {
    enabled: boolean;
    logLevel: LogLevel;
  };
  ios: {
    disableSKAdNetworkSupport: boolean;
    setDelayForATTUserAuthorizationInSeconds?: number;
  };
}

export interface EditablePayloads {
  trackEventProperties: EventProperties;
  trackContentEventProperties: EventProperties;
  trackCustomEventProperties: EventProperties;
  trackAdRevenueEventProperties: TrackAdRevenueEventOptions;
  identifyPayload: AdvancedMatchingPayload;
  androidPurchasePayload: AndroidGooglePlayPurchasePayload;
  standardEventName: TikTokEventName;
  contentEventName: TikTokContentEventName;
  customEventName: string;
}

export interface SdkAction {
  id: string;
  label: string;
  apiName: string;
  supportedPlatform: SupportedPlatform;
  description: string;
  run(): Promise<unknown>;
  getPayloadPreview(): unknown;
}

export interface DebugTimelineEntry {
  id: string;
  apiName: string;
  platform: string;
  startedAt: string;
  durationMs: number;
  status: 'success' | 'error';
  paramsSummary: unknown;
  resultSummary?: unknown;
  error?: {
    name?: string;
    code?: string;
    message: string;
    platform?: string;
  };
}

export interface DebugContextSummary {
  environment: {
    platform: string;
    debugModeEnabled: boolean;
  };
  recentEntries: DebugTimelineEntry[];
  notes: string[];
}

export interface NormalizedDebugError {
  name?: string;
  code?: string;
  message: string;
  platform?: string;
}

export function toInitializeConfig(
  config: RuntimeSdkConfig
): TikTokBusinessInitializeConfig {
  return {
    appId: config.appId,
    accessToken: config.accessToken,
    tiktokAppId: config.tiktokAppId,
    disableTrack: config.disableTrack,
    disableAutoTrack: config.disableAutoTrack,
    disableRetentionTrack: config.disableRetentionTrack,
    disablePayTrack: config.disablePayTrack,
    disableInstallTrack: config.disableInstallTrack,
    disableLaunchTrack: config.disableLaunchTrack,
    disableEnhancedDataPostbackTrack: config.disableEnhancedDataPostbackTrack,
    openLimitedDataUse: config.openLimitedDataUse,
    setIsLowPerformanceDevice: config.setIsLowPerformanceDevice,
    debug: config.debug,
    ios: config.ios,
  };
}
