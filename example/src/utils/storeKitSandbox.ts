import { NativeModules, Platform } from 'react-native';

import TikTokBusinessSDK from '@tiktok-for-business/react-native-sdk';

export const storeKitProductIds = {
  consumable: 'tiktokbusinessreactnativesdk.example.coins',
  nonConsumable: 'tiktokbusinessreactnativesdk.example.premium',
  autoRenewableSubscription: 'tiktokbusinessreactnativesdk.example.monthly',
  nonRenewingSubscription: 'tiktokbusinessreactnativesdk.example.seasonpass',
} as const;

export interface StoreKitProductInfo {
  id: string;
  displayName: string;
  description: string;
  displayPrice: string;
  price: string;
  type: string;
}

export interface StoreKitProductsResult {
  source: 'xcodeStoreKitConfiguration';
  products: StoreKitProductInfo[];
}

export interface StoreKitTransactionInfo {
  productId: string;
  transactionId?: string;
  originalTransactionId?: string;
  purchaseDate?: string;
  state: 'purchased' | 'pending' | 'restored';
}

interface StoreKitSandboxNativeModule {
  loadProducts(): Promise<StoreKitProductsResult>;
  purchase(productId: string): Promise<StoreKitTransactionInfo>;
  restorePurchases(): Promise<StoreKitTransactionInfo[]>;
}

function getStoreKitSandbox(): StoreKitSandboxNativeModule {
  if (Platform.OS !== 'ios') {
    throw new Error('The example StoreKit sandbox is only available on iOS.');
  }

  const module = NativeModules?.StoreKitSandbox as
    | StoreKitSandboxNativeModule
    | undefined;

  if (!module) {
    throw new Error(
      'StoreKitSandbox native module is unavailable. Rebuild the iOS example app before retrying.'
    );
  }

  return module;
}

export function loadStoreKitProducts() {
  return getStoreKitSandbox().loadProducts();
}

export async function purchaseStoreKitProduct(productId: string) {
  try {
    return await getStoreKitSandbox().purchase(productId);
  } catch (error) {
    await TikTokBusinessSDK.trackStoreKit2PurchaseFailed(productId).catch(
      () => undefined
    );
    throw error;
  }
}

export function restoreStoreKitPurchases() {
  return getStoreKitSandbox().restorePurchases();
}
