#import "TiktokBusinessReactNativeSdk.h"

#import "Internal/TBRNSBridgeUtils.h"
#import "Internal/TBRNSEventFactory.h"
#import "Internal/TBRNSInitializeOptions.h"
#import <TikTokBusinessSDK/TikTokBusiness.h>

@interface TikTokBusiness (TBRNSStoreKit2PurchaseFailure)
- (void)trackStoreKit2PurchaseFailedWithProductId:(NSString *)productId API_AVAILABLE(ios(15.0));
@end

@implementation TiktokBusinessReactNativeSdk

static void TBRNSRunOnMainQueue(dispatch_block_t block)
{
  if ([NSThread isMainThread]) {
    block();
  } else {
    dispatch_async(dispatch_get_main_queue(), block);
  }
}

static void TBRNSRejectPlatformNotSupported(RCTPromiseRejectBlock reject)
{
  NSError *error = [NSError errorWithDomain:@"unsupported-platform"
                                       code:0
                                   userInfo:@{NSLocalizedDescriptionKey : @"This API is not available on the current platform."}];
  reject(error.domain, error.localizedDescription, error);
}

static void TBRNSRejectError(RCTPromiseRejectBlock reject,
                             NSError *error,
                             NSString *fallbackCode)
{
  NSString *code = error.domain.length > 0 ? error.domain : fallbackCode;
  NSString *message = error.localizedDescription.length > 0
      ? error.localizedDescription
      : @"TikTok Business SDK operation failed";
  reject(code, message, error);
}

static void TBRNSRejectException(RCTPromiseRejectBlock reject, NSException *exception)
{
  NSString *message = exception.reason.length > 0 ? exception.reason : exception.name;
  NSDictionary *userInfo = message.length > 0 ? @{NSLocalizedDescriptionKey : message} : @{};
  NSError *error = [NSError errorWithDomain:@"E_NATIVE_SDK_ERROR"
                                       code:0
                                   userInfo:userInfo];
  reject(error.domain, error.localizedDescription, error);
}

- (void)initialize:(NSDictionary *)config
          resolve:(RCTPromiseResolveBlock)resolve
           reject:(RCTPromiseRejectBlock)reject
{
  TBRNSRunOnMainQueue(^{
    @try {
      NSError *validationError = nil;
      TBRNSInitializeOptions *options =
          [TBRNSInitializeOptions optionsWithDictionary:config error:&validationError];
      if (options == nil) {
        TBRNSRejectError(reject, validationError, @"E_INVALID_ARGUMENT");
        return;
      }

      TikTokConfig *tiktokConfig = [options makeTikTokConfig];
      if (tiktokConfig == nil) {
        NSError *error = TBRNSError(@"E_INVALID_ARGUMENT", @"TikTok configuration is invalid");
        TBRNSRejectError(reject, error, @"E_INVALID_ARGUMENT");
        return;
      }

      [TikTokBusiness initializeSdk:tiktokConfig completionHandler:^(BOOL success, NSError *error) {
        if (success) {
          resolve(@{@"success": @YES, @"platform": @"ios"});
          return;
        }
        NSError *initializationError = error ?:
            TBRNSError(@"E_INITIALIZATION_FAILED", @"TikTok Business SDK initialization failed");
        reject(@"E_INITIALIZATION_FAILED", initializationError.localizedDescription, initializationError);
      }];
    } @catch (NSException *exception) {
      TBRNSRejectException(reject, exception);
    }
  });
}

- (void)trackEvent:(NSString *)eventName
        properties:(NSDictionary *)properties
           resolve:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject
{
  @try {
    NSDictionary *eventProperties =
        [TBRNSValueOrNil(properties) isKindOfClass:[NSDictionary class]] ? properties : @{};
    TikTokBaseEvent *event = [TBRNSEventFactory standardEventWithName:eventName
                                                           properties:eventProperties];
    [TikTokBusiness trackTTEvent:event];
    resolve(nil);
  } @catch (NSException *exception) {
    TBRNSRejectException(reject, exception);
  }
}

- (void)trackContentEvent:(NSString *)eventName
               properties:(NSDictionary *)properties
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject
{
  @try {
    NSDictionary *eventProperties =
        [TBRNSValueOrNil(properties) isKindOfClass:[NSDictionary class]] ? properties : @{};
    NSError *validationError = nil;
    TikTokContentsEvent *event = [TBRNSEventFactory contentEventWithName:eventName
                                                              properties:eventProperties
                                                                   error:&validationError];
    if (event == nil) {
      TBRNSRejectError(reject, validationError, @"E_INVALID_ARGUMENT");
      return;
    }
    [TikTokBusiness trackTTEvent:event];
    resolve(nil);
  } @catch (NSException *exception) {
    TBRNSRejectException(reject, exception);
  }
}

- (void)trackCustomEvent:(NSString *)eventName
              properties:(NSDictionary *)properties
                 resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject
{
  @try {
    NSDictionary *eventProperties =
        [TBRNSValueOrNil(properties) isKindOfClass:[NSDictionary class]] ? properties : @{};
    TikTokBaseEvent *event = [TBRNSEventFactory customEventWithName:eventName
                                                         properties:eventProperties];
    [TikTokBusiness trackTTEvent:event];
    resolve(nil);
  } @catch (NSException *exception) {
    TBRNSRejectException(reject, exception);
  }
}

- (void)trackAdRevenueEvent:(NSDictionary *)properties
                    resolve:(RCTPromiseResolveBlock)resolve
                     reject:(RCTPromiseRejectBlock)reject
{
  @try {
    NSDictionary *eventProperties =
        [TBRNSValueOrNil(properties) isKindOfClass:[NSDictionary class]] ? properties : @{};
    NSError *validationError = nil;
    TikTokAdRevenueEvent *event =
        [TBRNSEventFactory adRevenueEventWithProperties:eventProperties error:&validationError];
    if (event == nil) {
      TBRNSRejectError(reject, validationError, @"E_INVALID_ARGUMENT");
      return;
    }
    [TikTokBusiness trackTTEvent:event];
    resolve(nil);
  } @catch (NSException *exception) {
    TBRNSRejectException(reject, exception);
  }
}

- (void)startTrack:(RCTPromiseResolveBlock)resolve
            reject:(RCTPromiseRejectBlock)reject
{
  @try {
    [TikTokBusiness setTrackingEnabled:YES];
    resolve(nil);
  } @catch (NSException *exception) {
    TBRNSRejectException(reject, exception);
  }
}

- (void)flush:(RCTPromiseResolveBlock)resolve
       reject:(RCTPromiseRejectBlock)reject
{
  @try {
    [TikTokBusiness explicitlyFlush];
    resolve(nil);
  } @catch (NSException *exception) {
    TBRNSRejectException(reject, exception);
  }
}

- (void)identify:(NSDictionary *)payload
         resolve:(RCTPromiseResolveBlock)resolve
          reject:(RCTPromiseRejectBlock)reject
{
  @try {
    NSError *validationError = nil;
    NSString *externalId = TBRNSStringValue(payload[@"externalId"], @"payload.externalId", &validationError);
    NSString *externalUserName = TBRNSStringValue(payload[@"externalUserName"], @"payload.externalUserName", &validationError);
    NSString *phoneNumber = TBRNSStringValue(payload[@"phoneNumber"], @"payload.phoneNumber", &validationError);
    NSString *email = TBRNSStringValue(payload[@"email"], @"payload.email", &validationError);
    if (validationError != nil) {
      TBRNSRejectError(reject, validationError, @"E_INVALID_ARGUMENT");
      return;
    }
    // Email and phone are pass-through values; hashing and persistence stay inside the native SDK.
    [TikTokBusiness identifyWithExternalID:externalId
                          externalUserName:externalUserName
                               phoneNumber:phoneNumber
                                     email:email];
    resolve(nil);
  } @catch (NSException *exception) {
    TBRNSRejectException(reject, exception);
  }
}

- (void)logout:(RCTPromiseResolveBlock)resolve
        reject:(RCTPromiseRejectBlock)reject
{
  @try {
    [TikTokBusiness logout];
    resolve(nil);
  } @catch (NSException *exception) {
    TBRNSRejectException(reject, exception);
  }
}

- (void)requestTrackingAuthorization:(RCTPromiseResolveBlock)resolve
                               reject:(RCTPromiseRejectBlock)reject
{
  TBRNSRunOnMainQueue(^{
    @try {
      if (@available(iOS 14, *)) {
        NSString *trackingDescription =
            [[NSBundle mainBundle] objectForInfoDictionaryKey:@"NSUserTrackingUsageDescription"];
        if (![trackingDescription isKindOfClass:[NSString class]] || trackingDescription.length == 0) {
          NSError *error = TBRNSError(@"E_ATT_USAGE_DESCRIPTION_MISSING",
                                      @"NSUserTrackingUsageDescription must be configured before requesting ATT authorization");
          TBRNSRejectError(reject, error, @"E_ATT_USAGE_DESCRIPTION_MISSING");
          return;
        }
        [TikTokBusiness requestTrackingAuthorizationWithCompletionHandler:^(NSUInteger status) {
          resolve(@(status));
        }];
      } else {
        // ATT does not apply before iOS 14; tracking is treated as authorized.
        resolve(@3);
      }
    } @catch (NSException *exception) {
      TBRNSRejectException(reject, exception);
    }
  });
}

- (void)trackStoreKit2PurchaseFailed:(NSString *)productId
                             resolve:(RCTPromiseResolveBlock)resolve
                              reject:(RCTPromiseRejectBlock)reject
{
  if (![productId isKindOfClass:[NSString class]] || productId.length == 0) {
    NSError *error = TBRNSError(@"E_INVALID_ARGUMENT", @"productId must be a non-empty string");
    TBRNSRejectError(reject, error, @"E_INVALID_ARGUMENT");
    return;
  }

  if (@available(iOS 15.0, *)) {
    @try {
      TikTokBusiness *tiktokBusiness = [TikTokBusiness getInstance];
      SEL selector = @selector(trackStoreKit2PurchaseFailedWithProductId:);
      if (![tiktokBusiness respondsToSelector:selector]) {
        NSError *error = TBRNSError(@"E_NATIVE_API_UNAVAILABLE",
                                    @"TikTok Business SDK does not support StoreKit2 purchase failure tracking");
        TBRNSRejectError(reject, error, @"E_NATIVE_API_UNAVAILABLE");
        return;
      }

      [tiktokBusiness trackStoreKit2PurchaseFailedWithProductId:productId];
      resolve(nil);
    } @catch (NSException *exception) {
      TBRNSRejectException(reject, exception);
    }
    return;
  }

  NSError *error = TBRNSError(@"unsupported-platform",
                              @"trackStoreKit2PurchaseFailed requires iOS 15 or later");
  TBRNSRejectError(reject, error, @"unsupported-platform");
}

- (void)trackGooglePlayPurchase:(NSDictionary *)payload
                        resolve:(RCTPromiseResolveBlock)resolve
                         reject:(RCTPromiseRejectBlock)reject
{
  TBRNSRejectPlatformNotSupported(reject);
}

- (void)fetchDeferredDeeplink:(RCTPromiseResolveBlock)resolve
                       reject:(RCTPromiseRejectBlock)reject
{
  TBRNSRunOnMainQueue(^{
    @try {
      [TikTokBusiness fetchDeferredDeeplinkWithCompletion:^(NSURL * _Nullable url, NSError * _Nullable error) {
        if (error) {
          reject(@"deferred-deeplink-error", error.localizedDescription, error);
          return;
        }

        NSMutableDictionary *result = [NSMutableDictionary dictionary];
        if (url.absoluteString) {
          result[@"url"] = url.absoluteString;
        }
        resolve(result);
      }];
    } @catch (NSException *exception) {
      TBRNSRejectException(reject, exception);
    }
  });
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeTiktokBusinessReactNativeSdkSpecJSI>(params);
}

+ (NSString *)moduleName
{
  return @"TiktokBusinessReactNativeSdk";
}

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

@end

@interface TiktokBusinessReactNativeStoreKitIOS : TiktokBusinessReactNativeSdk <NativeTiktokBusinessReactNativeStoreKitIOSSpec>
@end

@implementation TiktokBusinessReactNativeStoreKitIOS

RCT_EXPORT_MODULE(TiktokBusinessReactNativeStoreKitIOS)

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
  return std::make_shared<facebook::react::NativeTiktokBusinessReactNativeStoreKitIOSSpecJSI>(params);
}

@end
