import { TurboModuleRegistry } from 'react-native';
import type { Spec } from './NativeTiktokBusinessReactNativeStoreKitIOS';

export const getNativeStoreKitModule = (): Spec => {
  return TurboModuleRegistry.getEnforcing<Spec>(
    'TiktokBusinessReactNativeStoreKitIOS'
  );
};
