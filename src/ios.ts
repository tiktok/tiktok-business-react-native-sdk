import NativeTiktokBusinessReactNativeSdk from './NativeTiktokBusinessReactNativeSdk';
import { getNativeStoreKitModule } from './TiktokBusinessReactNativeStoreKit';
import { getCurrentPlatform, rejectUnsupportedPlatform } from './utils';

/**
 * Requests iOS App Tracking Transparency authorization through the native SDK.
 * @returns A promise that resolves with the native ATT authorization status.
 */
export const requestTrackingAuthorization = (): Promise<number | string> => {
  if (getCurrentPlatform() !== 'ios') {
    return rejectUnsupportedPlatform('requestTrackingAuthorization', 'iOS');
  }

  return NativeTiktokBusinessReactNativeSdk.requestTrackingAuthorization();
};

/**
 * Reports a StoreKit 2 purchase failure through the iOS native SDK.
 * The promise resolves when native accepts the request, not when event upload completes.
 * @param productId StoreKit product identifier whose purchase failed.
 * @returns A promise that resolves after the request is submitted to native.
 */
export const trackStoreKit2PurchaseFailed = (
  productId: string
): Promise<void> => {
  if (getCurrentPlatform() !== 'ios') {
    return rejectUnsupportedPlatform('trackStoreKit2PurchaseFailed', 'iOS');
  }

  return getNativeStoreKitModule().trackStoreKit2PurchaseFailed(productId);
};
