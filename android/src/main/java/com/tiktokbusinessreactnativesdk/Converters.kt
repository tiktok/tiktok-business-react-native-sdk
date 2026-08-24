package com.tiktokbusinessreactnativesdk

import android.app.Application
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableType
import com.tiktok.TikTokBusinessSdk.LogLevel
import com.tiktok.TikTokBusinessSdk.TTConfig
import com.tiktok.appevents.TTPurchaseInfo
import com.tiktok.appevents.base.EventName
import com.tiktok.appevents.base.TTAdRevenueEvent
import com.tiktok.appevents.base.TTBaseEvent
import com.tiktok.appevents.contents.TTAddToCartEvent
import com.tiktok.appevents.contents.TTAddToWishlistEvent
import com.tiktok.appevents.contents.TTCheckoutEvent
import com.tiktok.appevents.contents.TTContentParams
import com.tiktok.appevents.contents.TTContentsEvent
import com.tiktok.appevents.contents.TTContentsEventConstants
import com.tiktok.appevents.contents.TTPurchaseEvent
import com.tiktok.appevents.contents.TTViewContentEvent
import org.json.JSONArray
import org.json.JSONObject

internal fun ReadableMap.toJsonObject(): JSONObject {
  val json = JSONObject()
  val iterator = keySetIterator()

  while (iterator.hasNextKey()) {
    val key = iterator.nextKey()
    when (getType(key)) {
      ReadableType.Null -> json.put(key, JSONObject.NULL)
      ReadableType.Boolean -> json.put(key, getBoolean(key))
      ReadableType.Number -> json.put(key, getDouble(key))
      ReadableType.String -> json.put(key, getString(key))
      ReadableType.Map -> json.put(key, getMap(key)!!.toJsonObject())
      ReadableType.Array -> json.put(key, getArray(key)!!.toJsonArray())
    }
  }

  return json
}

internal fun ReadableArray.toJsonArray(): JSONArray {
  val json = JSONArray()

  for (index in 0 until size()) {
    when (getType(index)) {
      ReadableType.Null -> json.put(JSONObject.NULL)
      ReadableType.Boolean -> json.put(getBoolean(index))
      ReadableType.Number -> json.put(getDouble(index))
      ReadableType.String -> json.put(getString(index))
      ReadableType.Map -> json.put(getMap(index)!!.toJsonObject())
      ReadableType.Array -> json.put(getArray(index)!!.toJsonArray())
    }
  }

  return json
}

internal fun ReadableMap.toTikTokConfig(reactContext: ReactApplicationContext): TTConfig {
  val config = TTConfig(
    reactContext.applicationContext as Application,
    requireNotNull(getString("accessToken"))
  )
    .setAppId(requireNotNull(getString("appId")))
    .setTTAppId(requireNotNull(getString("tiktokAppId")))

  config.applyInitializeFlags(this)
  getMapOrNull("debug")?.let { config.applyDebugConfig(it) }

  return config
}

internal fun ReadableMap.toIdentifyPayload(): IdentifyPayload {
  return IdentifyPayload(
    externalId = optionalString("externalId"),
    externalUserName = optionalString("externalUserName"),
    phoneNumber = optionalString("phoneNumber"),
    email = optionalString("email")
  )
}

internal fun ReadableMap.toGooglePlayPurchaseInfo(): TTPurchaseInfo {
  return TTPurchaseInfo(
    requireNotNull(getMap("purchase")).toJsonObject(),
    requireNotNull(getMap("skuDetails")).toJsonObject(),
    optionalString("eventId")
  )
}

internal fun eventPayload(eventName: String, properties: ReadableMap?): TrackEventPayload {
  return TrackEventPayload(
    eventName = eventName,
    properties = properties?.toJsonObject(),
  )
}

internal fun contentEventPayload(eventName: String, properties: ReadableMap?): ContentEventPayload {
  return ContentEventPayload(
    eventName = eventName,
    properties = properties?.toJsonObject() ?: JSONObject(),
  )
}

internal fun adRevenuePayload(properties: ReadableMap): AdRevenuePayload {
  return AdRevenuePayload(properties = properties.toJsonObject())
}

@Suppress("DEPRECATION")
internal fun String.toAndroidStandardEventName(): String {
  return when (this) {
    "InAppAdClick" -> EventName.IN_APP_AD_CLICK.toString()
    "InAppAdImpression" -> EventName.IN_APP_AD_IMPR.toString()
    "LaunchApp" -> EventName.LAUNCH_APP.toString()
    "LoanApply" -> EventName.LOAN_APPLICATION.toString()
    "SpendCredit" -> EventName.SPEND_CREDITS.toString()
    else -> this
  }
}

internal data class IdentifyPayload(
  val externalId: String?,
  val externalUserName: String?,
  val phoneNumber: String?,
  val email: String?
)

internal data class TrackEventPayload(
  val eventName: String,
  val properties: JSONObject?,
)

internal data class ContentEventPayload(
  val eventName: String,
  val properties: JSONObject,
)

internal data class AdRevenuePayload(
  val properties: JSONObject,
)

private fun TTConfig.applyInitializeFlags(configMap: ReadableMap) {
  if (configMap.optionalBoolean("disableTrack") == true) {
    invokeOptionalConfigMethod("disableAutoStart")
  }
  if (configMap.optionalBoolean("disableAutoTrack") == true) {
    disableAutoEvents()
  }
  if (configMap.optionalBoolean("disableRetentionTrack") == true) {
    invokeOptionalConfigMethod("disableRetentionLogging")
  }
  if (configMap.optionalBoolean("disablePayTrack") == true) {
    invokeOptionalConfigMethod("disableAutoIapTrack")
  }
  if (configMap.optionalBoolean("disableInstallTrack") == true) {
    invokeOptionalConfigMethod("disableInstallLogging")
  }
  if (configMap.optionalBoolean("disableLaunchTrack") == true) {
    invokeOptionalConfigMethod("disableLaunchLogging")
  }
  if (configMap.optionalBoolean("disableEnhancedDataPostbackTrack") == true) {
    invokeOptionalConfigMethod("disableAutoEnhancedDataPostbackEvent")
  }
  if (configMap.optionalBoolean("openLimitedDataUse") == true) {
    invokeOptionalConfigMethod("enableLimitedDataUse")
  }
  if (configMap.optionalBoolean("setIsLowPerformanceDevice") == true) {
    invokeOptionalConfigMethod("setIsLowPerformanceDevice", true)
  }
}

private fun TTConfig.applyDebugConfig(debug: ReadableMap) {
  if (debug.optionalBoolean("enabled") == true) {
    openDebugMode()
  }

  debug.optionalString("logLevel")?.takeUnless { it == "none" }?.let { logLevel ->
    runCatching { setLogLevel(LogLevel.valueOf(logLevel.uppercase())) }
  }
}

private fun TTConfig.invokeOptionalConfigMethod(methodName: String) {
  runCatching { javaClass.getMethod(methodName).invoke(this) }
}

private fun TTConfig.invokeOptionalConfigMethod(methodName: String, argument: Boolean) {
  runCatching {
    javaClass.getMethod(methodName, java.lang.Boolean.TYPE).invoke(this, argument)
  }
}

internal fun TrackEventPayload.toTTBaseEvent(): TTBaseEvent {
  return TTBaseEvent.newBuilder(eventName)
    .applyJsonProperties(properties)
    .build()
}

internal fun ContentEventPayload.toTTContentsEvent(): TTContentsEvent {
  val builder = when (eventName) {
    "AddToCart" -> TTAddToCartEvent.newBuilder()
    "AddToWishlist" -> TTAddToWishlistEvent.newBuilder()
    "Checkout" -> TTCheckoutEvent.newBuilder()
    "Purchase" -> TTPurchaseEvent.newBuilder()
    "ViewContent" -> TTViewContentEvent.newBuilder()
    else -> throw IllegalArgumentException("Unsupported content event: $eventName")
  }

  return builder
    .applyContentsProperties(properties)
    .build()
}

internal fun AdRevenuePayload.toTTAdRevenueEvent(): TTBaseEvent {
  return TTAdRevenueEvent.newBuilder(properties).build()
}

private fun TTBaseEvent.Builder.applyJsonProperties(properties: JSONObject?): TTBaseEvent.Builder {
  if (properties == null) {
    return this
  }

  val keys = properties.keys()
  while (keys.hasNext()) {
    val key = keys.next()
    val value = properties.opt(key)
    if (value != JSONObject.NULL) {
      addProperty(key, value)
    }
  }

  return this
}

private fun JSONObject.optionalString(vararg keys: String): String? {
  for (key in keys) {
    optString(key).takeIf { it.isNotBlank() }?.let { return it }
  }
  return null
}

private fun TTContentsEvent.Builder.applyContentsProperties(properties: JSONObject): TTContentsEvent.Builder {
  properties.optString("description").takeIf { it.isNotBlank() }?.let { setDescription(it) }
  properties.optString("currency").takeIf { it.isNotBlank() }?.let { currency ->
    runCatching {
      setCurrency(TTContentsEventConstants.Currency.valueOf(currency.uppercase()))
    }
  }

  if (properties.has("value") && !properties.isNull("value")) {
    val value = properties.opt("value")
    if (value is Number) {
      setValue(value.toDouble())
    } else {
      throw IllegalArgumentException("trackContentEvent value must be numeric")
    }
  }

  properties.optionalString("contentType", "content_type")?.let { setContentType(it) }
  properties.optionalString("contentId", "content_id")?.let { setContentId(it) }

  if (properties.has("contents") && !properties.isNull("contents")) {
    val contents = properties.optJSONArray("contents")
    if (contents != null) {
      val params = mutableListOf<TTContentParams>()
      for (index in 0 until contents.length()) {
        val item = contents.optJSONObject(index) ?: continue
        params += TTContentParams.newBuilder()
          .applyContentParam(item)
          .build()
      }
      setContents(*params.toTypedArray())
    }
  }

  return this
}

private fun TTContentParams.Builder.applyContentParam(content: JSONObject): TTContentParams.Builder {
  if (content.has("price") && !content.isNull("price")) {
    setPrice(content.optDouble("price").toFloat())
  }
  if (content.has("quantity") && !content.isNull("quantity")) {
    setQuantity(content.optInt("quantity"))
  }
  content.optString("contentId").takeIf { it.isNotBlank() }?.let { setContentId(it) }
  content.optString("contentCategory").takeIf { it.isNotBlank() }?.let { setContentCategory(it) }
  content.optString("contentName").takeIf { it.isNotBlank() }?.let { setContentName(it) }
  content.optString("brand").takeIf { it.isNotBlank() }?.let { setBrand(it) }
  return this
}

internal fun ReadableMap.optionalString(key: String): String? {
  return if (hasKey(key) && !isNull(key)) getString(key) else null
}

internal fun ReadableMap.optionalBoolean(key: String): Boolean? {
  return if (hasKey(key) && !isNull(key)) getBoolean(key) else null
}

internal fun ReadableMap.getMapOrNull(key: String): ReadableMap? {
  return if (hasKey(key) && !isNull(key)) getMap(key) else null
}

internal fun ReadableMap.getArrayOrNull(key: String): ReadableArray? {
  return if (hasKey(key) && !isNull(key)) getArray(key) else null
}
