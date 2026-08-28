import Foundation
import React
import StoreKit

@objc(StoreKitSandbox)
final class StoreKitSandbox: NSObject {
  private static let productIDs = [
    "tiktokbusinessreactnativesdk.example.coins",
    "tiktokbusinessreactnativesdk.example.premium",
    "tiktokbusinessreactnativesdk.example.monthly",
    "tiktokbusinessreactnativesdk.example.seasonpass",
  ]

  @objc
  static func requiresMainQueueSetup() -> Bool {
    false
  }

  @objc(loadProducts:rejecter:)
  func loadProducts(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Task {
      do {
        let (products, source) = try await Self.loadConfiguredProducts()
        let payload = products
          .sorted { $0.id < $1.id }
          .map(Self.productPayload)
        resolve([
          "source": source,
          "products": payload,
        ])
      } catch {
        reject("E_STOREKIT_LOAD_PRODUCTS", error.localizedDescription, error)
      }
    }
  }

  @objc(purchase:resolver:rejecter:)
  func purchase(
    _ productID: String,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    guard Self.productIDs.contains(productID) else {
      reject(
        "E_STOREKIT_UNKNOWN_PRODUCT",
        "Product \(productID) is not defined in StoreKitConfig.storekit.",
        nil
      )
      return
    }

    Task {
      do {
        let (products, _) = try await Self.loadConfiguredProducts()
        guard let product = products.first(where: { $0.id == productID }) else {
          reject(
            "E_STOREKIT_PRODUCT_NOT_FOUND",
            "StoreKit did not return product \(productID). Check the active scheme's StoreKit configuration.",
            nil
          )
          return
        }

        switch try await product.purchase() {
        case .success(let verificationResult):
          switch verificationResult {
          case .verified(let transaction):
            let payload = Self.transactionPayload(transaction, state: "purchased")
            await transaction.finish()
            resolve(payload)
          case .unverified(_, let error):
            reject("E_STOREKIT_UNVERIFIED", error.localizedDescription, error)
          }
        case .pending:
          resolve([
            "productId": productID,
            "state": "pending",
          ])
        case .userCancelled:
          reject("E_STOREKIT_USER_CANCELLED", "The StoreKit purchase was cancelled.", nil)
        @unknown default:
          reject("E_STOREKIT_UNKNOWN_RESULT", "StoreKit returned an unknown purchase result.", nil)
        }
      } catch {
        reject("E_STOREKIT_PURCHASE", error.localizedDescription, error)
      }
    }
  }

  @objc(restorePurchases:rejecter:)
  func restorePurchases(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) {
    Task {
      do {
        _ = try await Self.loadConfiguredProducts()
        try await AppStore.sync()

        var restored: [[String: Any]] = []
        for await result in Transaction.currentEntitlements {
          if case .verified(let transaction) = result {
            restored.append(Self.transactionPayload(transaction, state: "restored"))
          }
        }
        resolve(restored)
      } catch {
        reject("E_STOREKIT_RESTORE", error.localizedDescription, error)
      }
    }
  }

  private static func productPayload(_ product: Product) -> [String: Any] {
    [
      "id": product.id,
      "displayName": product.displayName,
      "description": product.description,
      "displayPrice": product.displayPrice,
      "price": product.price.description,
      "type": productTypeName(product.type),
    ]
  }

  private static func loadConfiguredProducts() async throws -> ([Product], String) {
    let products = try await Product.products(for: productIDs)
    guard !products.isEmpty else {
      throw sandboxError(
        code: "E_STOREKIT_CONFIGURATION_INACTIVE",
        message: "No StoreKit products were returned. Open example/ios/TiktokBusinessReactNativeSdkExample.xcworkspace in Xcode, select the shared TiktokBusinessReactNativeSdkExample scheme, confirm Run > Options > StoreKit Configuration is StoreKitConfig.storekit, then run the app from Xcode. This works on both Simulator and a Developer Mode device; pnpm example:ios does not activate Xcode's local StoreKit configuration."
      )
    }
    return (products, "xcodeStoreKitConfiguration")
  }

  private static func sandboxError(code: String, message: String) -> NSError {
    NSError(
      domain: "StoreKitSandbox",
      code: 1,
      userInfo: [
        NSLocalizedDescriptionKey: message,
        "code": code,
      ]
    )
  }

  private static func productTypeName(_ type: Product.ProductType) -> String {
    switch type {
    case .consumable:
      return "consumable"
    case .nonConsumable:
      return "nonConsumable"
    case .autoRenewable:
      return "autoRenewableSubscription"
    case .nonRenewable:
      return "nonRenewingSubscription"
    default:
      return "unknown"
    }
  }

  private static func transactionPayload(
    _ transaction: Transaction,
    state: String
  ) -> [String: Any] {
    [
      "productId": transaction.productID,
      "transactionId": String(transaction.id),
      "originalTransactionId": String(transaction.originalID),
      "purchaseDate": ISO8601DateFormatter().string(from: transaction.purchaseDate),
      "state": state,
    ]
  }
}
