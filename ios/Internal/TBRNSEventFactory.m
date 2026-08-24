#import "TBRNSEventFactory.h"

#import "TBRNSBridgeUtils.h"
#import <TikTokBusinessSDK/TikTokBaseEvent.h>
#import <TikTokBusinessSDK/TikTokContentsEvent.h>
#import <TikTokBusinessSDK/TikTokConstants.h>
#import <limits.h>
#import <math.h>

@interface TBRNSEventFactory ()

+ (nullable TikTokContentParams *)contentParamsWithDictionary:(NSDictionary *)dictionary
                                                         path:(NSString *)path
                                                        error:(NSError **)error;
+ (nullable NSArray<TikTokContentParams *> *)contentParamsArray:(NSArray *)contents
                                                           error:(NSError **)error;
+ (nullable TTCurrency)currencyValue:(nullable NSString *)currency;
+ (BOOL)applyContentProperties:(NSDictionary *)properties
                        toEvent:(TikTokContentsEvent *)event
                          error:(NSError **)error;
+ (nullable TikTokContentsEvent *)emptyContentEventWithName:(NSString *)eventName;
+ (NSString *)iOSStandardEventName:(NSString *)eventName;
+ (BOOL)validateAdRevenueProperties:(NSDictionary *)properties
                              error:(NSError **)error;

@end

@implementation TBRNSEventFactory

+ (TikTokBaseEvent *)standardEventWithName:(NSString *)eventName
                                properties:(NSDictionary *)properties
{
  return [[TikTokBaseEvent alloc] initWithEventName:[self iOSStandardEventName:eventName]
                                        properties:properties
                                           eventId:nil];
}

+ (nullable TikTokContentsEvent *)contentEventWithName:(NSString *)eventName
                                             properties:(NSDictionary *)properties
                                                  error:(NSError **)error
{
  TikTokContentsEvent *event = [self emptyContentEventWithName:eventName];
  if (event == nil) {
    if (error != NULL) {
      *error = [NSError errorWithDomain:@"NSInvalidArgumentException"
                                   code:0
                               userInfo:@{
                                 NSLocalizedDescriptionKey :
                                     [NSString stringWithFormat:@"Unsupported content event: %@", eventName],
                               }];
    }
    return nil;
  }
  if (![self applyContentProperties:properties toEvent:event error:error]) {
    return nil;
  }
  return event;
}

+ (TikTokBaseEvent *)customEventWithName:(NSString *)eventName
                               properties:(NSDictionary *)properties
{
  return [[TikTokBaseEvent alloc] initWithEventName:eventName
                                        properties:properties
                                           eventId:nil];
}

+ (nullable TikTokAdRevenueEvent *)adRevenueEventWithProperties:(NSDictionary *)properties
                                                          error:(NSError **)error
{
  if (![self validateAdRevenueProperties:properties error:error]) {
    return nil;
  }
  TikTokAdRevenueEvent *event = [TikTokAdRevenueEvent new];
  [event addPropertyWithKey:@"ad_revenue" value:properties];
  return event;
}

+ (nullable TikTokContentParams *)contentParamsWithDictionary:(NSDictionary *)dictionary
                                                         path:(NSString *)path
                                                        error:(NSError **)error
{
  TikTokContentParams *contentParams = [TikTokContentParams new];

  NSNumber *price = TBRNSFiniteNumberValue(dictionary[@"price"],
                                            [path stringByAppendingString:@".price"],
                                            error);
  if (error != NULL && *error != nil) {
    return nil;
  }
  if (price != nil) {
    contentParams.price = price;
  }

  NSNumber *quantity = TBRNSFiniteNumberValue(dictionary[@"quantity"],
                                               [path stringByAppendingString:@".quantity"],
                                               error);
  if (error != NULL && *error != nil) {
    return nil;
  }
  if (quantity != nil) {
    double quantityValue = quantity.doubleValue;
    if (floor(quantityValue) != quantityValue ||
        quantityValue < INT_MIN || quantityValue > INT_MAX) {
      TBRNSFail(error, [NSString stringWithFormat:@"%@.quantity must be an integer in range", path]);
      return nil;
    }
    contentParams.quantity = quantity.integerValue;
  }

  contentParams.contentId = TBRNSStringValue(dictionary[@"contentId"],
                                              [path stringByAppendingString:@".contentId"],
                                              error);
  if (error != NULL && *error != nil) return nil;
  contentParams.contentCategory = TBRNSStringValue(dictionary[@"contentCategory"],
                                                    [path stringByAppendingString:@".contentCategory"],
                                                    error);
  if (error != NULL && *error != nil) return nil;
  contentParams.contentName = TBRNSStringValue(dictionary[@"contentName"],
                                                [path stringByAppendingString:@".contentName"],
                                                error);
  if (error != NULL && *error != nil) return nil;
  contentParams.brand = TBRNSStringValue(dictionary[@"brand"],
                                          [path stringByAppendingString:@".brand"],
                                          error);
  if (error != NULL && *error != nil) return nil;

  return contentParams;
}

+ (nullable NSArray<TikTokContentParams *> *)contentParamsArray:(NSArray *)contents
                                                           error:(NSError **)error
{
  NSMutableArray<TikTokContentParams *> *contentParams = [NSMutableArray array];
  for (NSUInteger index = 0; index < contents.count; index++) {
    id content = contents[index];
    NSString *path = [NSString stringWithFormat:@"properties.contents[%lu]", (unsigned long)index];
    if (![content isKindOfClass:[NSDictionary class]]) {
      TBRNSFail(error, [NSString stringWithFormat:@"%@ must be an object", path]);
      return nil;
    }
    TikTokContentParams *params = [self contentParamsWithDictionary:content path:path error:error];
    if (params == nil) {
      return nil;
    }
    [contentParams addObject:params];
  }
  return contentParams;
}

+ (nullable TTCurrency)currencyValue:(nullable NSString *)currency
{
  NSString *normalizedCurrency = currency.uppercaseString;
  if (normalizedCurrency.length == 0) {
    return nil;
  }

  static NSDictionary<NSString *, TTCurrency> *currencyMap;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    currencyMap = @{
      @"AED": TTCurrencyAED, @"ARS": TTCurrencyARS, @"AUD": TTCurrencyAUD,
      @"BDT": TTCurrencyBDT, @"BGN": TTCurrencyBGN, @"BHD": TTCurrencyBHD,
      @"BIF": TTCurrencyBIF, @"BOB": TTCurrencyBOB, @"BRL": TTCurrencyBRL,
      @"CAD": TTCurrencyCAD, @"CHF": TTCurrencyCHF, @"CLP": TTCurrencyCLP,
      @"CNY": TTCurrencyCNY, @"COP": TTCurrencyCOP, @"CRC": TTCurrencyCRC,
      @"CZK": TTCurrencyCZK, @"DKK": TTCurrencyDKK, @"DZD": TTCurrencyDZD,
      @"EGP": TTCurrencyEGP, @"EUR": TTCurrencyEUR, @"GBP": TTCurrencyGBP,
      @"GTQ": TTCurrencyGTQ, @"HKD": TTCurrencyHKD, @"HNL": TTCurrencyHNL,
      @"HUF": TTCurrencyHUF, @"IDR": TTCurrencyIDR, @"ILS": TTCurrencyILS,
      @"INR": TTCurrencyINR, @"IQD": TTCurrencyIQD, @"ISK": TTCurrencyISK,
      @"JOD": TTCurrencyJOD, @"JPY": TTCurrencyJPY, @"KES": TTCurrencyKES,
      @"KHR": TTCurrencyKHR, @"KRW": TTCurrencyKRW, @"KWD": TTCurrencyKWD,
      @"KZT": TTCurrencyKZT, @"LBP": TTCurrencyLBP, @"MAD": TTCurrencyMAD,
      @"MOP": TTCurrencyMOP, @"MXN": TTCurrencyMXN, @"MYR": TTCurrencyMYR,
      @"NGN": TTCurrencyNGN, @"NIO": TTCurrencyNIO, @"NOK": TTCurrencyNOK,
      @"NZD": TTCurrencyNZD, @"OMR": TTCurrencyOMR, @"PEN": TTCurrencyPEN,
      @"PHP": TTCurrencyPHP, @"PKR": TTCurrencyPKR, @"PLN": TTCurrencyPLN,
      @"PYG": TTCurrencyPYG, @"QAR": TTCurrencyQAR, @"RON": TTCurrencyRON,
      @"RUB": TTCurrencyRUB, @"SAR": TTCurrencySAR, @"SEK": TTCurrencySEK,
      @"SGD": TTCurrencySGD, @"THB": TTCurrencyTHB, @"TRY": TTCurrencyTRY,
      @"TWD": TTCurrencyTWD, @"TZS": TTCurrencyTZS, @"UAH": TTCurrencyUAH,
      @"USD": TTCurrencyUSD, @"VES": TTCurrencyVES, @"VND": TTCurrencyVND,
      @"ZAR": TTCurrencyZAR,
    };
  });
  return currencyMap[normalizedCurrency];
}

+ (BOOL)applyContentProperties:(NSDictionary *)properties
                        toEvent:(TikTokContentsEvent *)event
                          error:(NSError **)error
{
  NSString *description = TBRNSStringValue(properties[@"description"], @"properties.description", error);
  if (error != NULL && *error != nil) return NO;
  if (description != nil) {
    [event setDescription:description];
  }

  NSString *currencyCode = TBRNSStringValue(properties[@"currency"], @"properties.currency", error);
  if (error != NULL && *error != nil) return NO;
  TTCurrency currency = [self currencyValue:currencyCode];
  if (currencyCode != nil && currency == nil) {
    return TBRNSFail(error, @"properties.currency is unsupported");
  }
  if (currency != nil) {
    [event setCurrency:currency];
  }

  NSNumber *value = TBRNSFiniteNumberValue(properties[@"value"], @"properties.value", error);
  if (error != NULL && *error != nil) return NO;
  if (value != nil) {
    [event setValue:value.stringValue];
  }

  id rawContentType = TBRNSValueOrNil(properties[@"contentType"]);
  if (rawContentType == nil) rawContentType = TBRNSValueOrNil(properties[@"content_type"]);
  NSString *contentType = TBRNSStringValue(rawContentType, @"properties.contentType", error);
  if (error != NULL && *error != nil) return NO;
  if (contentType != nil) {
    [event setContentType:contentType];
  }

  id rawContentId = TBRNSValueOrNil(properties[@"contentId"]);
  if (rawContentId == nil) rawContentId = TBRNSValueOrNil(properties[@"content_id"]);
  NSString *contentId = TBRNSStringValue(rawContentId, @"properties.contentId", error);
  if (error != NULL && *error != nil) return NO;
  if (contentId != nil) {
    [event setContentId:contentId];
  }

  id contents = TBRNSValueOrNil(properties[@"contents"]);
  if (contents != nil) {
    if (![contents isKindOfClass:[NSArray class]]) {
      return TBRNSFail(error, @"properties.contents must be an array");
    }
    NSArray<TikTokContentParams *> *params = [self contentParamsArray:contents error:error];
    if (params == nil) return NO;
    [event setContents:params];
  }
  return YES;
}

+ (nullable TikTokContentsEvent *)emptyContentEventWithName:(NSString *)eventName
{
  if ([eventName isEqualToString:@"AddToCart"]) return [TikTokAddToCartEvent new];
  if ([eventName isEqualToString:@"AddToWishlist"]) return [TikTokAddToWishlistEvent new];
  if ([eventName isEqualToString:@"Checkout"]) return [TikTokCheckoutEvent new];
  if ([eventName isEqualToString:@"Purchase"]) return [TikTokPurchaseEvent new];
  if ([eventName isEqualToString:@"ViewContent"]) return [TikTokViewContentEvent new];
  return nil;
}

+ (NSString *)iOSStandardEventName:(NSString *)eventName
{
  if ([eventName isEqualToString:@"InAppAdClick"]) return TTEventNameInAppADClick;
  if ([eventName isEqualToString:@"InAppAdImpression"]) return TTEventNameInAppADImpr;
  if ([eventName isEqualToString:@"LaunchApp"]) return TTEventNameLaunchAPP;
  if ([eventName isEqualToString:@"LoanApply"]) {
#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wdeprecated-declarations"
    return TTEventNameLoanApplication;
#pragma clang diagnostic pop
  }
  if ([eventName isEqualToString:@"SpendCredit"]) return TTEventNameSpendCredits;
  return eventName;
}

+ (BOOL)validateAdRevenueProperties:(NSDictionary *)properties
                              error:(NSError **)error
{
  NSString *adNetwork = TBRNSStringValue(properties[@"adNetwork"], @"properties.adNetwork", error);
  if (error != NULL && *error != nil) return NO;
  if (adNetwork == nil) return TBRNSFail(error, @"properties.adNetwork is required");

  NSNumber *revenue = TBRNSFiniteNumberValue(properties[@"revenue"], @"properties.revenue", error);
  if (error != NULL && *error != nil) return NO;
  if (revenue == nil) return TBRNSFail(error, @"properties.revenue is required");

  NSString *currencyCode = TBRNSStringValue(properties[@"currency"], @"properties.currency", error);
  if (error != NULL && *error != nil) return NO;
  if (currencyCode == nil) return TBRNSFail(error, @"properties.currency is required");
  if ([self currencyValue:currencyCode] == nil) {
    return TBRNSFail(error, @"properties.currency is unsupported");
  }

  TBRNSStringValue(properties[@"adUnit"], @"properties.adUnit", error);
  if (error != NULL && *error != nil) return NO;
  TBRNSStringValue(properties[@"adPlatform"], @"properties.adPlatform", error);
  return error == NULL || *error == nil;
}

@end
