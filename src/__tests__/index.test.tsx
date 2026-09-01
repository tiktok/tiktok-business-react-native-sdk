import TikTokBusinessSDK, { TikTokContentEventNames } from '../index';
import * as sdkExports from '../index';
import NativeTiktokBusinessReactNativeSdk from '../NativeTiktokBusinessReactNativeSdk';
import { getNativeStoreKitModule } from '../TiktokBusinessReactNativeStoreKit';
import { REACT_NATIVE_VERSION } from '../version';
import type {
  AdvancedMatchingPayload,
  AndroidGooglePlayPurchasePayload,
  DebugConfig,
  EventProperties,
  InitializeResult,
  IosConfig,
  LogLevel,
  TikTokBusinessInitializeConfig,
} from '../types';

jest.mock('../NativeTiktokBusinessReactNativeSdk', () => ({
  __esModule: true,
  default: {
    initialize: jest.fn(),
    trackEvent: jest.fn(),
    trackContentEvent: jest.fn(),
    trackCustomEvent: jest.fn(),
    trackAdRevenueEvent: jest.fn(),
    startTrack: jest.fn(),
    identify: jest.fn(),
    logout: jest.fn(),
    flush: jest.fn(),
    requestTrackingAuthorization: jest.fn(),
    trackGooglePlayPurchase: jest.fn(),
    fetchDeferredDeeplink: jest.fn(),
  },
}));

jest.mock('../TiktokBusinessReactNativeStoreKit', () => ({
  getNativeStoreKitModule: jest.fn(),
}));

const nativeModule = jest.mocked(NativeTiktokBusinessReactNativeSdk);
const nativeStoreKitModule = {
  trackStoreKit2PurchaseFailed: jest.fn<Promise<void>, [string]>(),
};
const platformInfo = `react_native@${REACT_NATIVE_VERSION}`;

const assertType = <T,>(value: T) => value;

beforeEach(() => {
  jest
    .mocked(getNativeStoreKitModule)
    .mockReturnValue(
      nativeStoreKitModule as ReturnType<typeof getNativeStoreKitModule>
    );
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('public sdk api', () => {
  it('exposes root sdk methods from the bridge contract', () => {
    expect(TikTokBusinessSDK).toEqual(
      expect.objectContaining({
        initialize: expect.any(Function),
        trackEvent: expect.any(Function),
        trackContentEvent: expect.any(Function),
        trackCustomEvent: expect.any(Function),
        trackAdRevenueEvent: expect.any(Function),
        startTrack: expect.any(Function),
        flush: expect.any(Function),
        identify: expect.any(Function),
        logout: expect.any(Function),
        requestTrackingAuthorization: expect.any(Function),
        trackStoreKit2PurchaseFailed: expect.any(Function),
        trackGooglePlayPurchase: expect.any(Function),
      })
    );
  });

  it('does not expose legacy platform helpers on the root sdk', () => {
    expect('iosSetTrackingEnabled' in TikTokBusinessSDK).toBe(false);
    expect('iosSetCustomUserAgent' in TikTokBusinessSDK).toBe(false);
    expect('iosTrackPurchaseEvent' in TikTokBusinessSDK).toBe(false);
    expect('androidFetchDeferredDeeplink' in TikTokBusinessSDK).toBe(false);
    expect('iosRequestTrackingAuthorization' in TikTokBusinessSDK).toBe(false);
    expect('androidTrackGooglePlayPurchase' in TikTokBusinessSDK).toBe(false);
  });

  it('exports individual public methods and constants without legacy helpers', () => {
    expect(typeof sdkExports.initialize).toBe('function');
    expect(typeof sdkExports.trackEvent).toBe('function');
    expect(typeof sdkExports.trackContentEvent).toBe('function');
    expect(typeof sdkExports.trackCustomEvent).toBe('function');
    expect(typeof sdkExports.trackAdRevenueEvent).toBe('function');
    expect(typeof sdkExports.startTrack).toBe('function');
    expect(typeof sdkExports.flush).toBe('function');
    expect(typeof sdkExports.identify).toBe('function');
    expect(typeof sdkExports.logout).toBe('function');
    expect(typeof sdkExports.fetchDeferredDeeplink).toBe('function');
    expect(typeof sdkExports.requestTrackingAuthorization).toBe('function');
    expect(typeof sdkExports.trackStoreKit2PurchaseFailed).toBe('function');
    expect(typeof sdkExports.trackGooglePlayPurchase).toBe('function');
    expect('iosRequestTrackingAuthorization' in sdkExports).toBe(false);
    expect('androidTrackGooglePlayPurchase' in sdkExports).toBe(false);
    expect(sdkExports.TikTokEventPropertyKey).toMatchObject({
      AdNetwork: 'adNetwork',
      AdUnit: 'adUnit',
      ContentCategory: 'contentCategory',
      ContentId: 'contentId',
      ContentName: 'contentName',
      ContentType: 'contentType',
    });
  });

  it('exports documented content event constants', () => {
    expect(TikTokContentEventNames).toEqual(
      expect.objectContaining({
        AddToCart: 'AddToCart',
        AddToWishlist: 'AddToWishlist',
        Checkout: 'Checkout',
        Purchase: 'Purchase',
        ViewContent: 'ViewContent',
      })
    );
  });

  it('exports documented standard event constants', () => {
    expect(sdkExports.TikTokEventNames).toEqual(
      expect.objectContaining({
        ImpressionLevelAdRevenue: 'ImpressionLevelAdRevenue',
        LaunchApp: 'LaunchApp',
      })
    );
  });

  it('keeps shared public type names available to consumers', () => {
    const logLevel = assertType<LogLevel>('verbose');
    const debug = assertType<DebugConfig>({ enabled: true, logLevel });
    const ios = assertType<IosConfig>({
      disableSKAdNetworkSupport: true,
      setDelayForATTUserAuthorizationInSeconds: 30,
    });
    const config = assertType<TikTokBusinessInitializeConfig>({
      appId: 'app-id',
      accessToken: 'access-token',
      tiktokAppId: ['123', '456'],
      disableTrack: true,
      disableAutoTrack: true,
      disableRetentionTrack: true,
      disablePayTrack: true,
      disableInstallTrack: true,
      disableLaunchTrack: true,
      disableEnhancedDataPostbackTrack: true,
      openLimitedDataUse: true,
      setIsLowPerformanceDevice: true,
      debug,
      ios,
    });
    const initializeResult = assertType<InitializeResult>({
      success: true,
      message: 'initialized',
      platform: 'ios',
    });
    const properties = assertType<EventProperties>({
      contentId: 'sku-123',
      content_id: 'sku-123',
      contentType: 'product',
      content_type: 'product',
      currency: 'USD',
      quantity: 1,
      price: 9.99,
      value: 9.99,
    });
    const advancedMatching = assertType<AdvancedMatchingPayload>({
      externalId: 'external-id',
      externalUserName: 'external-user',
      phoneNumber: 'sample-phone-value',
      email: 'sample-email-value',
    });
    const purchase = assertType<AndroidGooglePlayPurchasePayload>({
      purchase: { orderId: 'order-123' },
      skuDetails: { sku: 'sku-123' },
    });

    expect(config.accessToken).toBe('access-token');
    expect(initializeResult.success).toBe(true);
    expect(properties.contentId).toBe('sku-123');
    expect(advancedMatching.email).toBe('sample-email-value');
    expect(purchase.purchase?.orderId).toBe('order-123');
  });

  it('exposes fetchDeferredDeeplink on the root SDK when native APIs are supported', () => {
    expect(typeof TikTokBusinessSDK.fetchDeferredDeeplink).toBe('function');
  });

  it('delegates fetchDeferredDeeplink to native on supported platforms', async () => {
    nativeModule.fetchDeferredDeeplink.mockResolvedValueOnce({
      url: 'exampleapp://product/123',
      raw: { source: 'native' },
    });

    await expect(TikTokBusinessSDK.fetchDeferredDeeplink()).resolves.toEqual({
      url: 'exampleapp://product/123',
      raw: { source: 'native' },
    });

    expect(nativeModule.fetchDeferredDeeplink).toHaveBeenCalledWith();
  });

  it('delegates iOS ATT requests to the TurboModule', async () => {
    nativeModule.requestTrackingAuthorization.mockResolvedValueOnce(3);

    await expect(
      TikTokBusinessSDK.requestTrackingAuthorization()
    ).resolves.toBe(3);

    expect(nativeModule.requestTrackingAuthorization).toHaveBeenCalledTimes(1);
  });

  it('delegates StoreKit 2 purchase failures to the iOS native module', async () => {
    nativeStoreKitModule.trackStoreKit2PurchaseFailed.mockResolvedValueOnce();

    await expect(
      TikTokBusinessSDK.trackStoreKit2PurchaseFailed('product-123')
    ).resolves.toBeUndefined();

    expect(
      nativeStoreKitModule.trackStoreKit2PurchaseFailed
    ).toHaveBeenCalledWith('product-123');
  });

  it('rejects Android Google Play purchases before native calls on iOS', async () => {
    await expect(
      TikTokBusinessSDK.trackGooglePlayPurchase({
        purchase: { orderId: 'order-123' },
        skuDetails: { sku: 'sku-123' },
      })
    ).rejects.toMatchObject({
      code: 'unsupported-platform',
      message: 'trackGooglePlayPurchase is only available on Android.',
    });

    expect(nativeModule.trackGooglePlayPurchase).not.toHaveBeenCalled();
  });

  it('passes native rejections through unchanged after platform checks pass', async () => {
    const nativeError = {
      code: 'E_NATIVE',
      message: 'Native failed.',
    };
    nativeModule.requestTrackingAuthorization.mockRejectedValueOnce(
      nativeError
    );

    await expect(TikTokBusinessSDK.requestTrackingAuthorization()).rejects.toBe(
      nativeError
    );
  });

  it('normalizes the new initialize contract and forwards all init flags', async () => {
    nativeModule.initialize.mockResolvedValueOnce({
      success: true,
      platform: 'ios',
    });

    const config: TikTokBusinessInitializeConfig = {
      appId: 'test-app-id',
      accessToken: 'test-access-token',
      tiktokAppId: ['tt-app-1', 'tt-app-2'],
      disableTrack: true,
      disableAutoTrack: true,
      disableRetentionTrack: true,
      disablePayTrack: true,
      disableInstallTrack: true,
      disableLaunchTrack: true,
      disableEnhancedDataPostbackTrack: true,
      openLimitedDataUse: true,
      setIsLowPerformanceDevice: true,
      debug: {
        enabled: true,
        logLevel: 'debug',
      },
      ios: {
        disableSKAdNetworkSupport: true,
        setDelayForATTUserAuthorizationInSeconds: 30,
      },
    };

    await expect(sdkExports.initialize(config)).resolves.toEqual({
      success: true,
      platform: 'ios',
    });

    expect(nativeModule.initialize).toHaveBeenCalledWith({
      ...config,
      tiktokAppId: 'tt-app-1,tt-app-2',
    });
  });

  it('forwards initialize arguments without JS-owned validation helpers', async () => {
    nativeModule.initialize.mockResolvedValueOnce({ success: true });

    await TikTokBusinessSDK.initialize({
      appId: '',
      accessToken: '',
      tiktokAppId: 'test-tiktok-app-id',
    });

    expect(nativeModule.initialize).toHaveBeenCalledWith({
      appId: '',
      accessToken: '',
      tiktokAppId: 'test-tiktok-app-id',
    });
  });

  it('delegates standard event properties without hard enum restrictions', async () => {
    nativeModule.trackEvent.mockResolvedValueOnce();

    await TikTokBusinessSDK.trackEvent('PartnerDefinedEvent', {
      properties: { contentId: 'sku-123', value: 9.99 },
    });

    expect(nativeModule.trackEvent).toHaveBeenCalledWith(
      'PartnerDefinedEvent',
      {
        api_platform: platformInfo,
        contentId: 'sku-123',
        value: 9.99,
      }
    );
  });

  it('keeps trackEvent permissive for partner-defined event names', async () => {
    nativeModule.trackEvent.mockResolvedValueOnce(undefined);

    await expect(
      TikTokBusinessSDK.trackEvent('PartnerDefinedCheckoutStep', {
        properties: {
          step: 'shipping',
        },
      })
    ).resolves.toBeUndefined();

    expect(nativeModule.trackEvent).toHaveBeenCalledWith(
      'PartnerDefinedCheckoutStep',
      {
        api_platform: platformInfo,
        step: 'shipping',
      }
    );
  });

  it('delegates content event properties and contents arrays', async () => {
    nativeModule.trackContentEvent.mockResolvedValueOnce();

    await TikTokBusinessSDK.trackContentEvent('ViewContent', {
      properties: {
        contentId: 'sku-123',
        contentType: 'product',
        currency: 'USD',
        value: 9.99,
      },
      contents: [
        {
          contentId: 'sku-123',
          contentName: 'Example product',
          contentCategory: 'apparel',
          quantity: 1,
          price: 9.99,
        },
      ],
    });

    expect(nativeModule.trackContentEvent).toHaveBeenCalledWith('ViewContent', {
      api_platform: platformInfo,
      contentId: 'sku-123',
      contentType: 'product',
      currency: 'USD',
      value: 9.99,
      contents: [
        {
          contentId: 'sku-123',
          contentName: 'Example product',
          contentCategory: 'apparel',
          quantity: 1,
          price: 9.99,
        },
      ],
    });
  });

  it('delegates custom events with pass-through properties', async () => {
    nativeModule.trackCustomEvent.mockResolvedValueOnce();

    await TikTokBusinessSDK.trackCustomEvent('CustomCheckoutStep', {
      properties: { step: 'shipping' },
    });

    expect(nativeModule.trackCustomEvent).toHaveBeenCalledWith(
      'CustomCheckoutStep',
      {
        api_platform: platformInfo,
        step: 'shipping',
      }
    );
  });

  it('delegates ad revenue options as the native payload', async () => {
    nativeModule.trackAdRevenueEvent.mockResolvedValueOnce();

    await TikTokBusinessSDK.trackAdRevenueEvent({
      adNetwork: 'example-network',
      adPlatform: 'example-platform',
      revenue: 1.23,
      currency: 'USD',
      adUnit: 'banner-home',
    });

    expect(nativeModule.trackAdRevenueEvent).toHaveBeenCalledWith({
      api_platform: platformInfo,
      adNetwork: 'example-network',
      adPlatform: 'example-platform',
      revenue: 1.23,
      currency: 'USD',
      adUnit: 'banner-home',
    });
  });

  it('delegates startTrack to native without exposing a boolean setter', async () => {
    nativeModule.startTrack.mockResolvedValueOnce();

    await expect(TikTokBusinessSDK.startTrack()).resolves.toBeUndefined();

    expect(nativeModule.startTrack).toHaveBeenCalledTimes(1);
    expect('setTrackingEnabled' in TikTokBusinessSDK).toBe(false);
  });

  it('delegates flush, identify, and logout', async () => {
    nativeModule.flush.mockResolvedValueOnce();
    nativeModule.identify.mockResolvedValueOnce();
    nativeModule.logout.mockResolvedValueOnce();

    await TikTokBusinessSDK.flush();
    await TikTokBusinessSDK.identify({ externalId: 'external-id' });
    await TikTokBusinessSDK.logout();

    expect(nativeModule.flush).toHaveBeenCalledTimes(1);
    expect(nativeModule.identify).toHaveBeenCalledWith({
      externalId: 'external-id',
    });
    expect(nativeModule.logout).toHaveBeenCalledTimes(1);
  });

  it('passes native event rejections through unchanged', async () => {
    const nativeError = { code: 'E_NATIVE', message: 'Native call failed.' };
    nativeModule.trackEvent.mockRejectedValueOnce(nativeError);

    await expect(TikTokBusinessSDK.trackEvent('ViewContent')).rejects.toBe(
      nativeError
    );
  });
});
