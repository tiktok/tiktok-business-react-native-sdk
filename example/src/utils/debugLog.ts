import { Platform } from 'react-native';

import type {
  DebugContextSummary,
  DebugTimelineEntry,
  NormalizedDebugError,
} from '../types/debugConsole';

const REDACTED_VALUE = '[REDACTED]';
const SENSITIVE_KEY_PATTERN =
  /(access.?token|newAccessToken|appSecret|email|phone|phoneNumber)/i;
const PHONE_LIKE_PATTERN = /^\+?[0-9][0-9\-()\s]{6,}$/;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function shouldRedact(key: string, value: unknown): boolean {
  return (
    SENSITIVE_KEY_PATTERN.test(key) ||
    (typeof value === 'string' && PHONE_LIKE_PATTERN.test(value))
  );
}

export function redactSensitiveValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redactSensitiveValue(item));
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        shouldRedact(key, nestedValue)
          ? REDACTED_VALUE
          : redactSensitiveValue(nestedValue),
      ])
    );
  }

  if (typeof value === 'string' && PHONE_LIKE_PATTERN.test(value)) {
    return REDACTED_VALUE;
  }

  return value;
}

export function normalizeDebugError(error: unknown): NormalizedDebugError {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      code:
        'code' in error && typeof error.code === 'string'
          ? error.code
          : undefined,
      platform:
        'platform' in error && typeof error.platform === 'string'
          ? error.platform
          : undefined,
    };
  }

  if (error && typeof error === 'object') {
    const value = error as {
      name?: unknown;
      code?: unknown;
      message?: unknown;
      platform?: unknown;
    };

    return {
      name: typeof value.name === 'string' ? value.name : undefined,
      code: typeof value.code === 'string' ? value.code : undefined,
      message:
        typeof value.message === 'string'
          ? value.message
          : 'Unknown SDK error.',
      platform: typeof value.platform === 'string' ? value.platform : undefined,
    };
  }

  return {
    message: typeof error === 'string' ? error : 'Unknown SDK error.',
  };
}

export function createDebugTimelineEntry({
  apiName,
  platform,
  startedAt,
  durationMs,
  status,
  paramsSummary,
  resultSummary,
  error,
}: Omit<DebugTimelineEntry, 'id'>): DebugTimelineEntry {
  return {
    id: `${apiName}-${startedAt}-${durationMs}`,
    apiName,
    platform,
    startedAt,
    durationMs,
    status,
    paramsSummary: redactSensitiveValue(paramsSummary),
    resultSummary: redactSensitiveValue(resultSummary),
    error: error ? normalizeDebugError(error) : undefined,
  };
}

export function formatParamsSummary(value: unknown): string {
  return JSON.stringify(redactSensitiveValue(value), null, 2);
}

export function formatDebugContext(summary: DebugContextSummary): string {
  const payload = {
    environment: {
      platform: summary.environment.platform || Platform.OS,
      debugModeEnabled: summary.environment.debugModeEnabled,
    },
    recentEntries: summary.recentEntries.map((entry) => ({
      ...entry,
      paramsSummary: redactSensitiveValue(entry.paramsSummary),
      resultSummary: redactSensitiveValue(entry.resultSummary),
      error: entry.error ? normalizeDebugError(entry.error) : undefined,
    })),
    notes: summary.notes,
  };

  return JSON.stringify(payload, null, 2);
}
