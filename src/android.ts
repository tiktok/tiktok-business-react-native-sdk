import NativeTiktokBusinessReactNativeSdk from './NativeTiktokBusinessReactNativeSdk';
import type { AndroidGooglePlayPurchasePayload } from './types';
import { getCurrentPlatform, rejectUnsupportedPlatform } from './utils';

/**
 * Tracks a Google Play purchase through the Android native SDK.
 * @param payload Google Play Billing purchase and SKU detail payload collected by the host app.
 * @returns A promise that resolves when Android native purchase tracking accepts the request.
 */
export const trackGooglePlayPurchase = (
  payload: AndroidGooglePlayPurchasePayload
): Promise<void> => {
  if (getCurrentPlatform() !== 'android') {
    return rejectUnsupportedPlatform('trackGooglePlayPurchase', 'Android');
  }

  return NativeTiktokBusinessReactNativeSdk.trackGooglePlayPurchase(payload);
};
