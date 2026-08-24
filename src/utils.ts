import { Platform } from 'react-native';
import type {
  ContentParams,
  EventProperties,
  JsonObject,
  TikTokBusinessInitializeConfig,
  TrackContentEventOptions,
} from './types';
import { UnsupportedPlatformErrorCode } from './types';
import { REACT_NATIVE_VERSION } from './version';

const platformInfo = `react_native@${REACT_NATIVE_VERSION}`;

const withPlatformInfo = (properties?: EventProperties): JsonObject => {
  return {
    ...properties,
    api_platform: platformInfo,
  };
};

/**
 * Normalizes optional event properties for the native bridge.
 * @param properties Event properties supplied by the caller.
 * @returns The properties object for native, or undefined when no properties were supplied.
 */
export const normalizeProperties = (
  properties?: EventProperties
): JsonObject => {
  return withPlatformInfo(properties);
};

/**
 * Combines content event properties and content item payloads for the native bridge.
 * @param options Content event options supplied by the caller.
 * @returns A native bridge payload containing properties and optional contents.
 */
export const normalizeContentProperties = (
  options: TrackContentEventOptions
): JsonObject => {
  if (!options.contents) {
    return withPlatformInfo(options.properties);
  }

  return {
    ...withPlatformInfo(options.properties),
    contents: options.contents as ContentParams[],
  };
};

/**
 * Normalizes initialization config before passing it to native.
 * @param config Initialization config supplied by the caller.
 * @returns Initialization config with TikTok App ID arrays joined for native SDK input.
 */
export const normalizeInitializeConfig = (
  config: TikTokBusinessInitializeConfig
): TikTokBusinessInitializeConfig => {
  return {
    ...config,
    tiktokAppId: Array.isArray(config.tiktokAppId)
      ? config.tiktokAppId.join(',')
      : config.tiktokAppId,
  };
};

/**
 * Reads the current React Native platform value.
 * @returns The current React Native platform string.
 */
export const getCurrentPlatform = () => {
  return Platform.OS;
};

/**
 * Creates a rejected promise for APIs called on an unsupported platform.
 * @param apiName Public API name that was called.
 * @param supportedPlatform Platform where the API is supported.
 * @returns A rejected promise with unsupported-platform metadata.
 */
export const rejectUnsupportedPlatform = (
  apiName: string,
  supportedPlatform: 'iOS' | 'Android'
): Promise<never> => {
  const error = Object.assign(
    new Error(`${apiName} is only available on ${supportedPlatform}.`),
    {
      code: UnsupportedPlatformErrorCode,
      platform: getCurrentPlatform(),
    }
  );

  return Promise.reject(error);
};

/**
 * Checks whether an unknown error matches the unsupported-platform shape.
 * @param error Error value to inspect.
 * @returns True when the error carries unsupported-platform metadata.
 */
export const isUnsupportedPlatformError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const candidate = error as {
    code?: unknown;
    userInfo?: { domain?: unknown };
  };
  return (
    candidate.code === UnsupportedPlatformErrorCode ||
    candidate.userInfo?.domain === UnsupportedPlatformErrorCode
  );
};
