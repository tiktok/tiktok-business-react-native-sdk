#import <Foundation/Foundation.h>

@class TikTokConfig;

NS_ASSUME_NONNULL_BEGIN

@interface TBRNSInitializeOptions : NSObject

+ (nullable instancetype)optionsWithDictionary:(NSDictionary *)dictionary
                                         error:(NSError * _Nullable * _Nullable)error;

- (nullable TikTokConfig *)makeTikTokConfig;

@end

NS_ASSUME_NONNULL_END
