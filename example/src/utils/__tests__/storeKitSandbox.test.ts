jest.mock('react-native', () => ({
  NativeModules: {
    StoreKitSandbox: {
      loadProducts: jest.fn(),
      purchase: jest.fn(),
      restorePurchases: jest.fn(),
    },
  },
  Platform: {
    OS: 'ios',
  },
}));

jest.mock('@tiktok-for-business/react-native-sdk', () => ({
  __esModule: true,
  default: {
    trackStoreKit2PurchaseFailed: jest.fn(),
  },
}));

import { NativeModules } from 'react-native';
import TikTokBusinessSDK from '@tiktok-for-business/react-native-sdk';

import {
  loadStoreKitProducts,
  purchaseStoreKitProduct,
  restoreStoreKitPurchases,
  storeKitProductIds,
} from '../storeKitSandbox';

const nativeStoreKitSandbox = jest.mocked(NativeModules.StoreKitSandbox);
const mockedSdk = jest.mocked(TikTokBusinessSDK);

describe('storeKitSandbox', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('delegates product loading and restore to the example native module', async () => {
    const products = [
      {
        id: storeKitProductIds.consumable,
        displayName: 'Demo Coins',
        description: 'Demo',
        displayPrice: '$0.99',
        price: '0.99',
        type: 'consumable',
      },
    ];
    const productsResult = {
      source: 'xcodeStoreKitConfiguration' as const,
      products,
    };
    nativeStoreKitSandbox.loadProducts.mockResolvedValueOnce(productsResult);
    nativeStoreKitSandbox.restorePurchases.mockResolvedValueOnce([]);

    await expect(loadStoreKitProducts()).resolves.toEqual(productsResult);
    await expect(restoreStoreKitPurchases()).resolves.toEqual([]);
  });

  it('returns successful StoreKit transactions without failure reporting', async () => {
    const transaction = {
      productId: storeKitProductIds.nonConsumable,
      transactionId: '1001',
      state: 'purchased',
    };
    nativeStoreKitSandbox.purchase.mockResolvedValueOnce(transaction);

    await expect(
      purchaseStoreKitProduct(storeKitProductIds.nonConsumable)
    ).resolves.toEqual(transaction);
    expect(mockedSdk.trackStoreKit2PurchaseFailed).not.toHaveBeenCalled();
  });

  it('reports failed StoreKit 2 purchases before preserving the native error', async () => {
    const nativeError = new Error('The StoreKit purchase was cancelled.');
    nativeStoreKitSandbox.purchase.mockRejectedValueOnce(nativeError);
    mockedSdk.trackStoreKit2PurchaseFailed.mockResolvedValueOnce();

    await expect(
      purchaseStoreKitProduct(storeKitProductIds.autoRenewableSubscription)
    ).rejects.toBe(nativeError);
    expect(mockedSdk.trackStoreKit2PurchaseFailed).toHaveBeenCalledWith(
      storeKitProductIds.autoRenewableSubscription
    );
  });
});
