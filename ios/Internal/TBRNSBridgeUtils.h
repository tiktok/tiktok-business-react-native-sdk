#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

FOUNDATION_EXPORT id _Nullable TBRNSValueOrNil(id _Nullable value);

FOUNDATION_EXPORT NSError *TBRNSError(NSString *code, NSString *message);

FOUNDATION_EXPORT BOOL TBRNSFail(NSError * _Nullable * _Nullable error,
                                 NSString *message);

FOUNDATION_EXPORT BOOL TBRNSBoolValue(NSDictionary *dictionary,
                                      NSString *key,
                                      BOOL defaultValue,
                                      BOOL *result,
                                      NSError * _Nullable * _Nullable error);

FOUNDATION_EXPORT NSString * _Nullable TBRNSStringValue(id _Nullable value,
                                                        NSString *path,
                                                        NSError * _Nullable * _Nullable error);

FOUNDATION_EXPORT NSNumber * _Nullable TBRNSFiniteNumberValue(id _Nullable value,
                                                              NSString *path,
                                                              NSError * _Nullable * _Nullable error);

NS_ASSUME_NONNULL_END
