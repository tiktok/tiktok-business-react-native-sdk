package com.tiktokbusinessreactnativesdk

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableNativeMap
import com.tiktok.TikTokBusinessSdk
import com.tiktok.appevents.ErrorData

class TiktokBusinessReactNativeSdkModule(reactContext: ReactApplicationContext) :
  NativeTiktokBusinessReactNativeSdkSpec(reactContext) {

  private fun Promise.rejectWithThrowable(throwable: Throwable) {
    reject(throwable)
  }

  private fun Promise.rejectWithMessage(message: String, domain: String) {
    val userInfo = WritableNativeMap().apply {
      putString("domain", domain)
      putString("message", message)
    }
    reject(domain, message, userInfo)
  }

  private fun Promise.rejectPlatformNotSupported() {
    rejectWithMessage(
      "This API is not available on the current platform.",
      "unsupported-platform"
    )
  }

  private fun Promise.resolveInitializationSuccess() {
    val result = Arguments.createMap()
    result.putBoolean("success", true)
    result.putString("platform", "android")
    resolve(result)
  }

  private fun trackBaseEvent(eventName: String, properties: ReadableMap?, promise: Promise) {
    try {
      TikTokBusinessSdk.trackTTEvent(eventPayload(eventName, properties).toTTBaseEvent())
      promise.resolve(null)
    } catch (throwable: Throwable) {
      promise.rejectWithThrowable(throwable)
    }
  }

  override fun initialize(config: ReadableMap, promise: Promise) {
    try {
      if (TikTokBusinessSdk.isInitialized()) {
        promise.resolveInitializationSuccess()
        return
      }

      // Initialize from the main app process/thread; WebView-only processes should not create SDK state.
      TikTokBusinessSdk.initializeSdk(
        config.toTikTokConfig(reactApplicationContext),
        object : TikTokBusinessSdk.TTInitCallback {
          override fun success() {
            promise.resolveInitializationSuccess()
          }

          override fun fail(errorCode: Int, errorMessage: String?) {
            promise.reject(
              errorCode.toString(),
              errorMessage ?: "Failed to initialize TikTok Business SDK"
            )
          }
        }
      )
    } catch (throwable: Throwable) {
      promise.rejectWithThrowable(throwable)
    }
  }

  override fun trackEvent(
    eventName: String,
    properties: ReadableMap?,
    promise: Promise
  ) {
    trackBaseEvent(eventName.toAndroidStandardEventName(), properties, promise)
  }

  override fun trackContentEvent(
    eventName: String,
    properties: ReadableMap?,
    promise: Promise
  ) {
    try {
      TikTokBusinessSdk.trackTTEvent(
        contentEventPayload(eventName, properties).toTTContentsEvent()
      )
      promise.resolve(null)
    } catch (throwable: Throwable) {
      promise.rejectWithThrowable(throwable)
    }
  }

  override fun trackCustomEvent(
    eventName: String,
    properties: ReadableMap?,
    promise: Promise
  ) {
    trackBaseEvent(eventName, properties, promise)
  }

  override fun trackAdRevenueEvent(properties: ReadableMap, promise: Promise) {
    try {
      TikTokBusinessSdk.trackTTEvent(adRevenuePayload(properties).toTTAdRevenueEvent())
      promise.resolve(null)
    } catch (throwable: Throwable) {
      promise.rejectWithThrowable(throwable)
    }
  }

  override fun flush(promise: Promise) {
    try {
      TikTokBusinessSdk.flush()
      promise.resolve(null)
    } catch (throwable: Throwable) {
      promise.rejectWithThrowable(throwable)
    }
  }

  override fun identify(payload: ReadableMap, promise: Promise) {
    try {
      val identifyPayload = payload.toIdentifyPayload()
      TikTokBusinessSdk.identify(
        identifyPayload.externalId,
        identifyPayload.externalUserName,
        identifyPayload.phoneNumber,
        identifyPayload.email
      )
      promise.resolve(null)
    } catch (throwable: Throwable) {
      promise.rejectWithThrowable(throwable)
    }
  }

  override fun logout(promise: Promise) {
    try {
      TikTokBusinessSdk.logout()
      promise.resolve(null)
    } catch (throwable: Throwable) {
      promise.rejectWithThrowable(throwable)
    }
  }

  override fun requestTrackingAuthorization(promise: Promise) {
    promise.rejectPlatformNotSupported()
  }

  override fun trackGooglePlayPurchase(payload: ReadableMap, promise: Promise) {
    try {
      TikTokBusinessSdk.trackGooglePlayPurchase(payload.toGooglePlayPurchaseInfo())
      promise.resolve(null)
    } catch (throwable: Throwable) {
      promise.rejectWithThrowable(throwable)
    }
  }

  @ReactMethod
  override fun fetchDeferredDeeplink(promise: Promise) {
    try {
      TikTokBusinessSdk.fetchDeferredDeeplinkWithCompletion(
        object : TikTokBusinessSdk.FetchDeferredDeeplinkCompletion {
          override fun completion(deepLinkUrl: String?, errorData: ErrorData?) {
            if (errorData != null) {
              promise.reject(
                errorData.code.toString(),
                errorData.msg ?: "Failed to fetch deferred deeplink"
              )
              return
            }

            val result = Arguments.createMap()
            if (!deepLinkUrl.isNullOrEmpty()) {
              result.putString("url", deepLinkUrl)
            }
            promise.resolve(result)
          }
        }
      )
    } catch (throwable: Throwable) {
      promise.rejectWithThrowable(throwable)
    }
  }

  companion object {
    const val NAME = NativeTiktokBusinessReactNativeSdkSpec.NAME
  }
}
