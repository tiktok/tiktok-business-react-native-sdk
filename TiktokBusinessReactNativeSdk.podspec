require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "TiktokBusinessReactNativeSdk"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.homepage     = package["homepage"]
  s.license      = package["license"]
  s.authors      = package["author"]

  s.platform     = :ios, "13.0"
  s.source       = {
    :git => "https://github.com/tiktok/tiktok-business-react-native-sdk.git",
    :tag => "v#{s.version}"
  }

  s.source_files = "ios/**/*.{h,m,mm,swift,cpp}"
  s.private_header_files = "ios/**/*.h"

  s.dependency 'TikTokBusinessSDK', '1.7.1'

  install_modules_dependencies(s)
end
