import type {
  AdvancedMatchingPayload,
  EventProperties,
  JsonObject,
  TikTokBusinessInitializeConfig,
  TrackAdRevenueEventOptions,
} from '@tiktok-business/react-native-sdk';

function isPlainObject(value: unknown): value is JsonObject {
  return Object.prototype.toString.call(value) === '[object Object]';
}

export interface ParseJsonObjectResult<T extends object = JsonObject> {
  raw: string;
  value?: T;
  error: string | null;
}

export function parseJsonObject<T extends object = JsonObject>(
  raw: string,
  label: string,
  options: { allowEmpty?: boolean } = {}
): ParseJsonObjectResult<T> {
  const trimmed = raw.trim();
  const allowEmpty = options.allowEmpty ?? true;

  if (trimmed.length === 0) {
    return {
      raw,
      value: undefined,
      error: allowEmpty ? null : `Enter ${label} to run this example action.`,
    };
  }

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (!isPlainObject(parsed)) {
      return {
        raw,
        value: undefined,
        error: `The example form expects ${label} to be a JSON object.`,
      };
    }

    return {
      raw,
      value: parsed as T,
      error: null,
    };
  } catch {
    return {
      raw,
      value: undefined,
      error: `The example form could not parse ${label} as JSON.`,
    };
  }
}

export function validateOptionalObject(
  label: string,
  error: string | null
): string[] {
  return error
    ? [
        error.replace(
          /^.+$/,
          `The example form could not parse ${label} as a JSON object.`
        ),
      ]
    : [];
}

export function validateRequiredString(label: string, value: string): string[] {
  return value.trim().length > 0
    ? []
    : [`Enter ${label} to run this example action.`];
}

export function validateTikTokAppId(value: string | string[]): string[] {
  const values = Array.isArray(value) ? value : [value];

  if (values.length === 0) {
    return ['Enter TikTok App ID to run this example action.'];
  }

  return values.flatMap((item) => {
    const trimmed = item.trim();
    const errors = validateRequiredString('TikTok App ID', trimmed);

    if (trimmed.includes(' ') || trimmed.includes(',')) {
      errors.push('TikTok App ID array values must be individual IDs.');
    }

    return errors;
  });
}

export function validateInitializeConfig(
  config: Pick<
    TikTokBusinessInitializeConfig,
    'appId' | 'accessToken' | 'tiktokAppId'
  >
): string[] {
  return [
    ...validateRequiredString('App ID', config.appId),
    ...validateRequiredString('Access Token', config.accessToken),
    ...validateTikTokAppId(config.tiktokAppId),
  ];
}

export function validateEventProperties(
  properties: EventProperties | undefined
): string[] {
  if (properties === undefined || isPlainObject(properties)) {
    return [];
  }

  return ['Event properties must be a JSON object.'];
}

export function validateAdRevenueOptions(
  options: Partial<TrackAdRevenueEventOptions>
): string[] {
  return [
    ...validateRequiredString('Ad network', options.adNetwork ?? ''),
    ...validateRequiredString('Ad platform', options.adPlatform ?? ''),
    ...validateRequiredString('Currency', options.currency ?? ''),
    typeof options.revenue === 'number'
      ? []
      : ['Enter Revenue to run this example action.'],
  ].flat();
}

export function validateAdvancedMatchingPayload(
  payload: AdvancedMatchingPayload
): string[] {
  return isPlainObject(payload)
    ? []
    : ['Advanced Matching payload must be a JSON object.'];
}
