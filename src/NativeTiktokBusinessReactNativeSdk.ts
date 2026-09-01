import { TurboModuleRegistry, type TurboModule } from 'react-native';
import type { CodegenTypes } from 'react-native';

export interface Spec extends TurboModule {
  initialize(
    config: CodegenTypes.UnsafeObject
  ): Promise<CodegenTypes.UnsafeObject>;
  trackEvent(
    eventName: string,
    properties?: CodegenTypes.UnsafeObject
  ): Promise<void>;
  trackContentEvent(
    eventName: string,
    properties?: CodegenTypes.UnsafeObject
  ): Promise<void>;
  trackCustomEvent(
    eventName: string,
    properties?: CodegenTypes.UnsafeObject
  ): Promise<void>;
  trackAdRevenueEvent(properties: CodegenTypes.UnsafeObject): Promise<void>;
  startTrack(): Promise<void>;
  flush(): Promise<void>;
  identify(payload: CodegenTypes.UnsafeObject): Promise<void>;
  logout(): Promise<void>;
  requestTrackingAuthorization(): Promise<CodegenTypes.Int32 | string>;
  trackGooglePlayPurchase(payload: CodegenTypes.UnsafeObject): Promise<void>;
  fetchDeferredDeeplink(): Promise<CodegenTypes.UnsafeObject>;
}

export default TurboModuleRegistry.getEnforcing<Spec>(
  'TiktokBusinessReactNativeSdk'
);
