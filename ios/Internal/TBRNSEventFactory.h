#import <Foundation/Foundation.h>
#import <TikTokBusinessSDK/TikTokBaseEvent.h>
#import <TikTokBusinessSDK/TikTokContentsEvent.h>

NS_ASSUME_NONNULL_BEGIN

@interface TBRNSEventFactory : NSObject

+ (TikTokBaseEvent *)standardEventWithName:(NSString *)eventName
                                properties:(NSDictionary *)properties;

+ (nullable TikTokContentsEvent *)contentEventWithName:(NSString *)eventName
                                             properties:(NSDictionary *)properties
                                                  error:(NSError * _Nullable * _Nullable)error;

+ (TikTokBaseEvent *)customEventWithName:(NSString *)eventName
                               properties:(NSDictionary *)properties;

+ (nullable TikTokAdRevenueEvent *)adRevenueEventWithProperties:(NSDictionary *)properties
                                                          error:(NSError * _Nullable * _Nullable)error;

@end

NS_ASSUME_NONNULL_END
