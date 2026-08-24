package com.tiktokbusinessreactnativesdk

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import java.util.HashMap

class TiktokBusinessReactNativeSdkPackage : BaseReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    return if (name == TiktokBusinessReactNativeSdkModule.NAME) {
      TiktokBusinessReactNativeSdkModule(reactContext)
    } else {
      null
    }
  }

  override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
    mapOf(
      TiktokBusinessReactNativeSdkModule.NAME to ReactModuleInfo(
        name = TiktokBusinessReactNativeSdkModule.NAME,
        className = TiktokBusinessReactNativeSdkModule.NAME,
        canOverrideExistingModule = false,
        needsEagerInit = false,
        isCxxModule = false,
        isTurboModule = true
      )
    )
  }
}
