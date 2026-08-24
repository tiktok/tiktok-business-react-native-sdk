import {
  createDebugTimelineEntry,
  formatDebugContext,
  normalizeDebugError,
  redactSensitiveValue,
} from '../debugLog';

describe('debugLog', () => {
  it('redacts app secret fields', () => {
    expect(
      redactSensitiveValue({ appSecret: 'sample-secret-value' })
    ).toMatchObject({ appSecret: '[REDACTED]' });
  });

  it('redacts email and phone fields', () => {
    expect(
      redactSensitiveValue({
        email: 'sample-email-value',
        phoneNumber: 'sample-phone-value',
      })
    ).toMatchObject({ email: '[REDACTED]', phoneNumber: '[REDACTED]' });
  });

  it('redacts nested phone values', () => {
    expect(
      redactSensitiveValue({
        nested: { profile: { phone: 'sample-phone-value' } },
      })
    ).toEqual({ nested: { profile: { phone: '[REDACTED]' } } });
  });

  it('creates timeline entries with passthrough native fields', () => {
    expect(
      createDebugTimelineEntry({
        apiName: 'trackEvent',
        platform: 'android',
        startedAt: '2026-05-24T00:00:00.000Z',
        durationMs: 35,
        status: 'error',
        paramsSummary: { appSecret: 'sample-secret-value' },
        resultSummary: { ok: false },
        error: {
          code: 'E_NATIVE',
          message: 'boom',
          platform: 'android',
        },
      })
    ).toEqual({
      id: 'trackEvent-2026-05-24T00:00:00.000Z-35',
      apiName: 'trackEvent',
      platform: 'android',
      startedAt: '2026-05-24T00:00:00.000Z',
      durationMs: 35,
      status: 'error',
      paramsSummary: { appSecret: '[REDACTED]' },
      resultSummary: { ok: false },
      error: {
        name: undefined,
        code: 'E_NATIVE',
        message: 'boom',
        platform: 'android',
      },
    });
  });

  it('creates redacted copied context with release validation notes', () => {
    const output = formatDebugContext({
      environment: {
        platform: 'ios',
        debugModeEnabled: true,
      },
      recentEntries: [
        createDebugTimelineEntry({
          apiName: 'initialize',
          platform: 'ios',
          startedAt: '2026-05-24T00:00:00.000Z',
          durationMs: 12,
          status: 'success',
          paramsSummary: { appSecret: 'sample-secret-value' },
          resultSummary: { success: true },
        }),
      ],
      notes: [
        'Disable debug mode before release.',
        'Use TikTok Test Events to confirm received events.',
      ],
    });

    expect(output).toContain('Disable debug mode before release.');
    expect(output).toContain('Use TikTok Test Events');
    expect(output).toContain('environment');
    expect(output).toContain('recentEntries');
    expect(output).toContain('[REDACTED]');
    expect(output).not.toContain('sample-secret-value');
  });

  it('keeps native-like error payloads readable', () => {
    expect(
      normalizeDebugError({
        code: 'E_NATIVE',
        message: 'boom',
        platform: 'ios',
      })
    ).toEqual({
      name: undefined,
      code: 'E_NATIVE',
      message: 'boom',
      platform: 'ios',
    });
  });
});
