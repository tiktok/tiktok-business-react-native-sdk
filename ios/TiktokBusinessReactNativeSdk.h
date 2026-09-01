#import <TiktokBusinessReactNativeSdkSpec/TiktokBusinessReactNativeSdkSpec.h>

@interface TiktokBusinessReactNativeSdk : NSObject <NativeTiktokBusinessReactNativeSdkSpec>

- (void)initialize:(NSDictionary *)config
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject;
- (void)trackEvent:(NSString *)eventName
        properties:(NSDictionary *)properties
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject;
- (void)trackContentEvent:(NSString *)eventName
               properties:(NSDictionary *)properties
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject;
- (void)trackCustomEvent:(NSString *)eventName
              properties:(NSDictionary *)properties
                 resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject;
- (void)trackAdRevenueEvent:(NSDictionary *)properties
                    resolve:(RCTPromiseResolveBlock)resolve
                     reject:(RCTPromiseRejectBlock)reject;
- (void)startTrack:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject;
- (void)flush:(RCTPromiseResolveBlock)resolve
       reject:(RCTPromiseRejectBlock)reject;
- (void)identify:(NSDictionary *)payload
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject;
- (void)logout:(RCTPromiseResolveBlock)resolve
        reject:(RCTPromiseRejectBlock)reject;
- (void)requestTrackingAuthorization:(RCTPromiseResolveBlock)resolve
                                  reject:(RCTPromiseRejectBlock)reject;
- (void)trackStoreKit2PurchaseFailed:(NSString *)productId
                             resolve:(RCTPromiseResolveBlock)resolve
                              reject:(RCTPromiseRejectBlock)reject;
- (void)trackGooglePlayPurchase:(NSDictionary *)payload
                               resolve:(RCTPromiseResolveBlock)resolve
                                reject:(RCTPromiseRejectBlock)reject;
- (void)fetchDeferredDeeplink:(RCTPromiseResolveBlock)resolve
                       reject:(RCTPromiseRejectBlock)reject;

@end
