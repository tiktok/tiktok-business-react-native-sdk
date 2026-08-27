import {
  defaultAndroidGooglePlayPurchasePayload,
  defaultContentEventName,
  defaultCustomEventName,
  defaultIdentifyPayload,
  defaultInitializeConfig,
  defaultStandardEventName,
  defaultTrackAdRevenueEventProperties,
  defaultTrackContentEventProperties,
  defaultTrackCustomEventProperties,
  defaultTrackEventProperties,
} from '../../constants/debugPayloads';

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

jest.mock('@tiktok-for-business/react-native-sdk', () => ({
  __esModule: true,
  TikTokEventNames: {
    LaunchApp: 'LaunchApp',
  },
  TikTokContentEventNames: {
    ViewContent: 'ViewContent',
  },
  default: {
    initialize: jest.fn(),
    trackEvent: jest.fn(),
    trackContentEvent: jest.fn(),
    trackCustomEvent: jest.fn(),
    trackAdRevenueEvent: jest.fn(),
    identify: jest.fn(),
    flush: jest.fn(),
    logout: jest.fn(),
    requestTrackingAuthorization: jest.fn(),
    trackGooglePlayPurchase: jest.fn(),
    fetchDeferredDeeplink: jest.fn(),
  },
}));
import TikTokBusinessSDK from '@tiktok-for-business/react-native-sdk';
import type {
  EditablePayloads,
  RuntimeSdkConfig,
} from '../../types/debugConsole';
import {
  actionPlatformMap,
  buildSdkActions,
  requiredActionIds,
} from '../sdkActions';

function createRuntimeConfig(): RuntimeSdkConfig {
  return defaultInitializeConfig;
}

function createEditablePayloads(): EditablePayloads {
  return {
    trackEventProperties: defaultTrackEventProperties,
    trackContentEventProperties: defaultTrackContentEventProperties,
    trackCustomEventProperties: defaultTrackCustomEventProperties,
    trackAdRevenueEventProperties: defaultTrackAdRevenueEventProperties,
    identifyPayload: defaultIdentifyPayload,
    androidPurchasePayload: defaultAndroidGooglePlayPurchasePayload,
    standardEventName: defaultStandardEventName,
    contentEventName: defaultContentEventName,
    customEventName: defaultCustomEventName,
  };
}

const mockedSdk = jest.mocked(TikTokBusinessSDK);

const defaultDebugState = {
  runtimeConfig: createRuntimeConfig(),
  editablePayloads: createEditablePayloads(),
  trackEventProperties: defaultTrackEventProperties,
  identifyPayload: defaultIdentifyPayload,
  androidPurchasePayload: defaultAndroidGooglePlayPurchasePayload,
};

async function runSdkAction(
  actionId: string,
  debugState: typeof defaultDebugState
) {
  const action = buildSdkActions(debugState).find(
    (item) => item.id === actionId
  );

  if (!action) {
    throw new Error(`Unknown SDK action: ${actionId}`);
  }

  const result = await action.run();

  return {
    status: 'success',
    result,
  };
}

describe('sdkActions', () => {
  it('contains every required action id', () => {
    const actions = buildSdkActions({
      runtimeConfig: createRuntimeConfig(),
      editablePayloads: createEditablePayloads(),
      trackEventProperties: defaultTrackEventProperties,
      identifyPayload: defaultIdentifyPayload,
      androidPurchasePayload: defaultAndroidGooglePlayPurchasePayload,
    });

    expect(actions.map((action) => action.id)).toEqual(
      expect.arrayContaining([...requiredActionIds])
    );
  });

  it('maps action availability metadata correctly', () => {
    const actions = buildSdkActions({
      runtimeConfig: createRuntimeConfig(),
      editablePayloads: createEditablePayloads(),
      trackEventProperties: defaultTrackEventProperties,
      identifyPayload: defaultIdentifyPayload,
      androidPurchasePayload: defaultAndroidGooglePlayPurchasePayload,
    });

    const supportById = Object.fromEntries(
      actions.map((action) => [action.id, action.supportedPlatform])
    );

    expect(supportById).toMatchObject(actionPlatformMap);
  });

  it('builds content event previews with contents arrays', () => {
    const actions = buildSdkActions({
      runtimeConfig: createRuntimeConfig(),
      editablePayloads: createEditablePayloads(),
      trackEventProperties: defaultTrackEventProperties,
      identifyPayload: defaultIdentifyPayload,
      androidPurchasePayload: defaultAndroidGooglePlayPurchasePayload,
    });

    const contentAction = actions.find(
      (action) => action.id === 'root.trackContentEvent'
    );

    expect(contentAction?.getPayloadPreview()).toMatchObject({
      eventName: defaultContentEventName,
      properties: {
        contentId: 'demo-content-id',
        contentType: 'product',
        contents: [
          expect.objectContaining({
            contentName: 'Debug console content',
            contentCategory: 'demo',
          }),
        ],
      },
    });
  });

  it('runs root actions with the current payloads', async () => {
    mockedSdk.initialize.mockResolvedValueOnce({
      success: true,
      platform: 'ios',
    });
    mockedSdk.trackEvent.mockResolvedValueOnce();
    mockedSdk.trackContentEvent.mockResolvedValueOnce();
    mockedSdk.trackCustomEvent.mockResolvedValueOnce();
    mockedSdk.trackAdRevenueEvent.mockResolvedValueOnce();
    mockedSdk.identify.mockResolvedValueOnce();
    mockedSdk.flush.mockResolvedValueOnce();
    mockedSdk.logout.mockResolvedValueOnce();

    const editablePayloads = createEditablePayloads();
    const runtimeConfig = createRuntimeConfig();
    const actions = buildSdkActions({
      runtimeConfig,
      editablePayloads,
      trackEventProperties: defaultTrackEventProperties,
      identifyPayload: defaultIdentifyPayload,
      androidPurchasePayload: defaultAndroidGooglePlayPurchasePayload,
    });

    await actions.find((action) => action.id === 'root.initialize')?.run();
    await actions.find((action) => action.id === 'root.trackEvent')?.run();
    await actions
      .find((action) => action.id === 'root.trackContentEvent')
      ?.run();
    await actions
      .find((action) => action.id === 'root.trackCustomEvent')
      ?.run();
    await actions
      .find((action) => action.id === 'root.trackAdRevenueEvent')
      ?.run();
    await actions.find((action) => action.id === 'root.identify')?.run();
    await actions.find((action) => action.id === 'root.flush')?.run();
    await actions.find((action) => action.id === 'root.logout')?.run();

    expect(mockedSdk.initialize).toHaveBeenCalledWith(runtimeConfig);
    expect(mockedSdk.trackEvent).toHaveBeenCalledWith(
      editablePayloads.standardEventName,
      {
        properties: defaultTrackEventProperties,
      }
    );
    expect(mockedSdk.trackContentEvent).toHaveBeenCalledWith(
      editablePayloads.contentEventName,
      {
        properties: defaultTrackContentEventProperties,
      }
    );
    expect(mockedSdk.trackCustomEvent).toHaveBeenCalledWith(
      defaultCustomEventName,
      {
        properties: defaultTrackCustomEventProperties,
      }
    );
    expect(mockedSdk.trackAdRevenueEvent).toHaveBeenCalledWith(
      defaultTrackAdRevenueEventProperties
    );
    expect(mockedSdk.identify).toHaveBeenCalledWith(defaultIdentifyPayload);
    expect(mockedSdk.flush).toHaveBeenCalledTimes(1);
    expect(mockedSdk.logout).toHaveBeenCalledTimes(1);
  });

  it('runs deferred deeplink action', async () => {
    mockedSdk.fetchDeferredDeeplink.mockResolvedValueOnce({
      url: 'exampleapp://product/123',
    });

    await expect(
      runSdkAction('fetchDeferredDeeplink', defaultDebugState)
    ).resolves.toEqual(
      expect.objectContaining({
        status: 'success',
      })
    );

    expect(mockedSdk.fetchDeferredDeeplink).toHaveBeenCalledWith();
  });

  it('runs platform actions with the current payloads', async () => {
    mockedSdk.requestTrackingAuthorization.mockResolvedValueOnce(3);
    mockedSdk.trackGooglePlayPurchase.mockResolvedValueOnce();

    const actions = buildSdkActions({
      runtimeConfig: createRuntimeConfig(),
      editablePayloads: createEditablePayloads(),
      trackEventProperties: defaultTrackEventProperties,
      identifyPayload: defaultIdentifyPayload,
      androidPurchasePayload: defaultAndroidGooglePlayPurchasePayload,
    });

    await actions
      .find((action) => action.id === 'requestTrackingAuthorization')
      ?.run();
    await actions
      .find((action) => action.id === 'trackGooglePlayPurchase')
      ?.run();

    expect(mockedSdk.requestTrackingAuthorization).toHaveBeenCalledTimes(1);
    expect(mockedSdk.trackGooglePlayPurchase).toHaveBeenCalledWith(
      defaultAndroidGooglePlayPurchasePayload
    );
  });

  it('logs initialization failures without remapping native errors', async () => {
    const nativeError = { code: 'E_NATIVE', message: 'Native failed.' };
    mockedSdk.initialize.mockRejectedValueOnce(nativeError);

    const actions = buildSdkActions({
      runtimeConfig: createRuntimeConfig(),
      editablePayloads: createEditablePayloads(),
    });

    await expect(
      actions.find((action) => action.id === 'root.initialize')?.run()
    ).rejects.toBe(nativeError);
  });

  it('passes the new initialize payload to the public sdk', async () => {
    mockedSdk.initialize.mockResolvedValueOnce({
      success: true,
      platform: 'ios',
    });

    const runtimeConfig: RuntimeSdkConfig = {
      ...createRuntimeConfig(),
      accessToken: 'example-access-token',
      disablePayTrack: true,
      setIsLowPerformanceDevice: true,
    };

    const initializeAction = buildSdkActions({
      runtimeConfig,
      editablePayloads: createEditablePayloads(),
    }).find((action) => action.id === 'root.initialize');

    await initializeAction?.run();

    expect(mockedSdk.initialize).toHaveBeenCalledWith(
      expect.objectContaining({
        accessToken: 'example-access-token',
        disablePayTrack: true,
        setIsLowPerformanceDevice: true,
      })
    );
  });

  it('shows debug release and purchase duplication guidance in action descriptions', () => {
    const actions = buildSdkActions({
      runtimeConfig: createRuntimeConfig(),
      editablePayloads: createEditablePayloads(),
    });

    expect(
      actions.find((action) => action.id === 'root.initialize')?.description
    ).toContain('disable debug logs before release');
    expect(
      actions.find((action) => action.id === 'trackGooglePlayPurchase')
        ?.description
    ).toContain('avoid duplicate Purchase signals');
  });

  it('keeps platform-specific APIs clearly marked', () => {
    const actions = buildSdkActions({
      runtimeConfig: createRuntimeConfig(),
      editablePayloads: createEditablePayloads(),
    });

    expect(
      actions.find((action) => action.id === 'requestTrackingAuthorization')
    ).toMatchObject({
      apiName: 'requestTrackingAuthorization',
      supportedPlatform: 'ios',
    });
    expect(
      actions.find((action) => action.id === 'trackGooglePlayPurchase')
    ).toMatchObject({
      apiName: 'trackGooglePlayPurchase',
      supportedPlatform: 'android',
    });
  });
});
