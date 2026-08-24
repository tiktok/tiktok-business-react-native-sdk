#import "TBRNSInitializeOptions.h"

#import "TBRNSBridgeUtils.h"
#import <TikTokBusinessSDK/TikTokBusiness.h>
#import <limits.h>
#import <math.h>

@interface TBRNSInitializeOptions ()

@property (nonatomic, copy) NSString *accessToken;
@property (nonatomic, copy) NSString *appId;
@property (nonatomic, copy) NSString *tiktokAppId;
@property (nonatomic, assign) BOOL disableTrack;
@property (nonatomic, assign) BOOL disableAutoTrack;
@property (nonatomic, assign) BOOL disableRetentionTrack;
@property (nonatomic, assign) BOOL disablePayTrack;
@property (nonatomic, assign) BOOL disableInstallTrack;
@property (nonatomic, assign) BOOL disableLaunchTrack;
@property (nonatomic, assign) BOOL disableEnhancedDataPostbackTrack;
@property (nonatomic, assign) BOOL openLimitedDataUse;
@property (nonatomic, assign) BOOL lowPerformanceDevice;
@property (nonatomic, assign) BOOL hasDebugConfig;
@property (nonatomic, assign) BOOL debugEnabled;
@property (nonatomic, assign) BOOL hasLogLevel;
@property (nonatomic, assign) TikTokLogLevel logLevel;
@property (nonatomic, assign) BOOL disableSKAdNetworkSupport;
@property (nonatomic, assign) BOOL hasATTAuthorizationDelay;
@property (nonatomic, assign) long attAuthorizationDelay;

+ (BOOL)parseTrackingOptions:(NSDictionary *)dictionary
                     options:(TBRNSInitializeOptions *)options
                       error:(NSError **)error;
+ (BOOL)parseDebugOptions:(id)debugConfigValue
                 options:(TBRNSInitializeOptions *)options
                   error:(NSError **)error;
+ (BOOL)parseIOSOptions:(id)iosConfigValue
               options:(TBRNSInitializeOptions *)options
                 error:(NSError **)error;

@end

@implementation TBRNSInitializeOptions

+ (nullable instancetype)optionsWithDictionary:(NSDictionary *)dictionary
                                         error:(NSError **)error
{
  TBRNSInitializeOptions *options = [TBRNSInitializeOptions new];
  options.accessToken = TBRNSStringValue(dictionary[@"accessToken"], @"accessToken", error);
  options.appId = TBRNSStringValue(dictionary[@"appId"], @"appId", error);
  options.tiktokAppId = TBRNSStringValue(dictionary[@"tiktokAppId"], @"tiktokAppId", error);
  if (error != NULL && *error != nil) {
    return nil;
  }
  if (options.accessToken.length == 0) {
    TBRNSFail(error, @"accessToken is required");
    return nil;
  }
  if (options.appId.length == 0) {
    TBRNSFail(error, @"appId is required");
    return nil;
  }
  if (options.tiktokAppId.length == 0) {
    TBRNSFail(error, @"tiktokAppId is required");
    return nil;
  }

  if (![self parseTrackingOptions:dictionary options:options error:error] ||
      ![self parseDebugOptions:dictionary[@"debug"] options:options error:error] ||
      ![self parseIOSOptions:dictionary[@"ios"] options:options error:error]) {
    return nil;
  }
  return options;
}

+ (BOOL)parseTrackingOptions:(NSDictionary *)dictionary
                     options:(TBRNSInitializeOptions *)options
                       error:(NSError **)error
{
  return TBRNSBoolValue(dictionary, @"disableTrack", NO, &options->_disableTrack, error) &&
      TBRNSBoolValue(dictionary, @"disableAutoTrack", NO, &options->_disableAutoTrack, error) &&
      TBRNSBoolValue(dictionary, @"disableRetentionTrack", NO, &options->_disableRetentionTrack, error) &&
      TBRNSBoolValue(dictionary, @"disablePayTrack", NO, &options->_disablePayTrack, error) &&
      TBRNSBoolValue(dictionary, @"disableInstallTrack", NO, &options->_disableInstallTrack, error) &&
      TBRNSBoolValue(dictionary, @"disableLaunchTrack", NO, &options->_disableLaunchTrack, error) &&
      TBRNSBoolValue(dictionary,
                     @"disableEnhancedDataPostbackTrack",
                     NO,
                     &options->_disableEnhancedDataPostbackTrack,
                     error) &&
      TBRNSBoolValue(dictionary, @"openLimitedDataUse", NO, &options->_openLimitedDataUse, error) &&
      TBRNSBoolValue(dictionary,
                     @"setIsLowPerformanceDevice",
                     NO,
                     &options->_lowPerformanceDevice,
                     error);
}

+ (BOOL)parseDebugOptions:(id)debugConfigValue
                  options:(TBRNSInitializeOptions *)options
                    error:(NSError **)error
{
  debugConfigValue = TBRNSValueOrNil(debugConfigValue);
  if (debugConfigValue == nil) {
    return YES;
  }
  if (![debugConfigValue isKindOfClass:[NSDictionary class]]) {
    return TBRNSFail(error, @"debug must be an object");
  }

  NSDictionary *debugConfig = debugConfigValue;
  options.hasDebugConfig = YES;
  if (!TBRNSBoolValue(debugConfig, @"enabled", NO, &options->_debugEnabled, error)) {
    return NO;
  }

  NSString *logLevel = TBRNSStringValue(debugConfig[@"logLevel"], @"debug.logLevel", error);
  if ((error != NULL && *error != nil) || logLevel == nil) {
    return error == NULL || *error == nil;
  }

  NSDictionary<NSString *, NSNumber *> *levels = @{
    @"none": @(TikTokLogLevelSuppress),
    @"error": @(TikTokLogLevelError),
    @"warning": @(TikTokLogLevelWarn),
    @"info": @(TikTokLogLevelInfo),
    @"debug": @(TikTokLogLevelDebug),
    @"verbose": @(TikTokLogLevelVerbose),
  };
  NSNumber *nativeLevel = levels[logLevel];
  if (nativeLevel == nil) {
    return TBRNSFail(error, @"debug.logLevel is unsupported");
  }
  options.hasLogLevel = YES;
  options.logLevel = (TikTokLogLevel)nativeLevel.integerValue;
  return YES;
}

+ (BOOL)parseIOSOptions:(id)iosConfigValue
                options:(TBRNSInitializeOptions *)options
                  error:(NSError **)error
{
  iosConfigValue = TBRNSValueOrNil(iosConfigValue);
  if (iosConfigValue == nil) {
    return YES;
  }
  if (![iosConfigValue isKindOfClass:[NSDictionary class]]) {
    return TBRNSFail(error, @"ios must be an object");
  }

  NSDictionary *iosConfig = iosConfigValue;
  if (!TBRNSBoolValue(iosConfig,
                      @"disableSKAdNetworkSupport",
                      NO,
                      &options->_disableSKAdNetworkSupport,
                      error)) {
    return NO;
  }

  NSNumber *attDelay = TBRNSFiniteNumberValue(iosConfig[@"setDelayForATTUserAuthorizationInSeconds"],
                                               @"ios.setDelayForATTUserAuthorizationInSeconds",
                                               error);
  if (error != NULL && *error != nil) {
    return NO;
  }
  if (attDelay == nil) {
    return YES;
  }

  double seconds = attDelay.doubleValue;
  if (floor(seconds) != seconds || seconds < 0 || seconds > LONG_MAX) {
    return TBRNSFail(error,
                     @"ios.setDelayForATTUserAuthorizationInSeconds must be a non-negative integer in range");
  }
  options.hasATTAuthorizationDelay = YES;
  options.attAuthorizationDelay = attDelay.longValue;
  return YES;
}

- (nullable TikTokConfig *)makeTikTokConfig
{
  TikTokConfig *config = [TikTokConfig configWithAccessToken:self.accessToken
                                                       appId:self.appId
                                                 tiktokAppId:self.tiktokAppId];
  if (config == nil) {
    return nil;
  }

  if (self.disableTrack) {
    [config disableTracking];
  }
  if (self.disableAutoTrack) {
    [config disableAutomaticTracking];
  }
  if (self.disableRetentionTrack) {
    [config disableRetentionTracking];
  }
  if (self.disablePayTrack) {
    [config disablePaymentTracking];
  }
  if (self.disableInstallTrack) {
    [config disableInstallTracking];
  }
  if (self.disableLaunchTrack) {
    [config disableLaunchTracking];
  }
  if (self.disableEnhancedDataPostbackTrack) {
    [config disableAutoEnhancedDataPostbackEvent];
  }
  if (self.openLimitedDataUse) {
    [config enableLDUMode];
  }
  if (self.lowPerformanceDevice) {
    [config setIsLowPerformanceDevice:YES];
  }

  if (self.hasDebugConfig) {
    config.debugModeEnabled = self.debugEnabled;
  }
  if (self.hasLogLevel) {
    [config setLogLevel:self.logLevel];
  }
  if (self.disableSKAdNetworkSupport) {
    [config disableSKAdNetworkSupport];
  }
  if (self.hasATTAuthorizationDelay) {
    [config setDelayForATTUserAuthorizationInSeconds:self.attAuthorizationDelay];
  }
  return config;
}

@end
