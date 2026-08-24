import {
  parseJsonObject,
  validateAdRevenueOptions,
  validateAdvancedMatchingPayload,
  validateEventProperties,
  validateInitializeConfig,
  validateOptionalObject,
  validateRequiredString,
  validateTikTokAppId,
} from '../payloadValidation';

describe('payloadValidation', () => {
  it('parses a valid JSON object', () => {
    const result = parseJsonObject('{"event":"ok"}', 'Event properties');

    expect(result).toEqual({
      raw: '{"event":"ok"}',
      value: { event: 'ok' },
      error: null,
    });
  });

  it('returns an example-form error for invalid JSON', () => {
    const result = parseJsonObject('{"event":', 'Event properties');

    expect(result.error).toBe(
      'The example form could not parse Event properties as JSON.'
    );
  });

  it('returns an example-form error for non-object JSON', () => {
    const result = parseJsonObject('[]', 'Event properties');

    expect(result.error).toBe(
      'The example form expects Event properties to be a JSON object.'
    );
  });

  it('allows an empty optional payload', () => {
    const result = parseJsonObject('', 'Identify payload');

    expect(result).toEqual({
      raw: '',
      value: undefined,
      error: null,
    });
  });

  it('preserves raw input after parse errors', () => {
    const result = parseJsonObject('{oops', 'Identify payload');

    expect(result.raw).toBe('{oops');
    expect(result.value).toBeUndefined();
  });

  it('returns no errors for a valid required string', () => {
    expect(
      validateRequiredString('Custom user agent', 'ExampleApp/1.0')
    ).toEqual([]);
  });

  it('reports missing required strings as example-form guidance', () => {
    expect(validateRequiredString('Custom user agent', ' ')).toEqual([
      'Enter Custom user agent to run this example action.',
    ]);
  });

  it('returns no errors for valid optional object text', () => {
    expect(validateOptionalObject('Purchase payload', null)).toEqual([]);
  });

  it('normalizes optional object parse errors as example-form guidance', () => {
    expect(
      validateOptionalObject(
        'Purchase payload',
        'The example form could not parse Identify payload as JSON.'
      )
    ).toEqual([
      'The example form could not parse Purchase payload as a JSON object.',
    ]);
  });

  it('requires access token instead of app secret', () => {
    expect(
      validateInitializeConfig({ appId: '', accessToken: '', tiktokAppId: [] })
    ).toEqual([
      'Enter App ID to run this example action.',
      'Enter Access Token to run this example action.',
      'Enter TikTok App ID to run this example action.',
    ]);
  });

  it('validates TikTok App ID arrays', () => {
    expect(validateTikTokAppId(['123', '456'])).toEqual([]);
    expect(validateTikTokAppId(['123', '456,789', 'bad id'])).toEqual([
      'TikTok App ID array values must be individual IDs.',
      'TikTok App ID array values must be individual IDs.',
    ]);
  });

  it('accepts event payload objects', () => {
    expect(
      validateEventProperties({
        contentId: 'sku-123',
        currency: 'USD',
        value: 9.99,
      })
    ).toEqual([]);
  });

  it('validates ad revenue required fields', () => {
    expect(validateAdRevenueOptions({})).toEqual([
      'Enter Ad network to run this example action.',
      'Enter Ad platform to run this example action.',
      'Enter Currency to run this example action.',
      'Enter Revenue to run this example action.',
    ]);
  });

  it('treats Advanced Matching values as pass-through payload data', () => {
    const payload = {
      externalId: 'external-id',
      externalUserName: 'external-user',
      email: 'sample-email-value',
      phoneNumber: 'sample-phone-value',
    };

    expect(validateAdvancedMatchingPayload(payload)).toEqual([]);
    expect(payload.phoneNumber).toBe('sample-phone-value');
    expect(payload.email).toBe('sample-email-value');
  });
});
