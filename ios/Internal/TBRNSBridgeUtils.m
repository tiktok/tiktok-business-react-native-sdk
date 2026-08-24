#import "TBRNSBridgeUtils.h"

#import <CoreFoundation/CoreFoundation.h>
#import <math.h>

id TBRNSValueOrNil(id value)
{
  return value == [NSNull null] ? nil : value;
}

NSError *TBRNSError(NSString *code, NSString *message)
{
  return [NSError errorWithDomain:code
                             code:0
                         userInfo:@{NSLocalizedDescriptionKey : message}];
}

BOOL TBRNSFail(NSError **error, NSString *message)
{
  if (error != NULL) {
    *error = TBRNSError(@"E_INVALID_ARGUMENT", message);
  }
  return NO;
}

static BOOL TBRNSIsBoolean(id value)
{
  return [value isKindOfClass:[NSNumber class]] &&
      CFGetTypeID((__bridge CFTypeRef)value) == CFBooleanGetTypeID();
}

BOOL TBRNSBoolValue(NSDictionary *dictionary,
                    NSString *key,
                    BOOL defaultValue,
                    BOOL *result,
                    NSError **error)
{
  id value = TBRNSValueOrNil(dictionary[key]);
  if (value == nil) {
    *result = defaultValue;
    return YES;
  }
  if (!TBRNSIsBoolean(value)) {
    return TBRNSFail(error, [NSString stringWithFormat:@"%@ must be a boolean", key]);
  }
  *result = [value boolValue];
  return YES;
}

NSString *TBRNSStringValue(id value, NSString *path, NSError **error)
{
  value = TBRNSValueOrNil(value);
  if (value == nil) {
    return nil;
  }
  if (![value isKindOfClass:[NSString class]]) {
    TBRNSFail(error, [NSString stringWithFormat:@"%@ must be a string", path]);
    return nil;
  }
  return value;
}

NSNumber *TBRNSFiniteNumberValue(id value, NSString *path, NSError **error)
{
  value = TBRNSValueOrNil(value);
  if (value == nil) {
    return nil;
  }
  if (![value isKindOfClass:[NSNumber class]] || TBRNSIsBoolean(value)) {
    TBRNSFail(error, [NSString stringWithFormat:@"%@ must be a number", path]);
    return nil;
  }
  if (!isfinite([value doubleValue])) {
    TBRNSFail(error, [NSString stringWithFormat:@"%@ must be a finite number", path]);
    return nil;
  }
  return value;
}
