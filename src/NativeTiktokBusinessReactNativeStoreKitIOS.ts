import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  trackStoreKit2PurchaseFailed(productId: string): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>(
  'TiktokBusinessReactNativeStoreKitIOS'
);
