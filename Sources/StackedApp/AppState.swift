import Combine
import Foundation

/// UI-facing state beyond the stack itself.
final class AppState: ObservableObject {
    private static let bannerDismissedKey = "permissionBannerDismissed"

    @Published var isActive = false
    @Published var isPanelVisible = false
    @Published var hasAccessibility = false
    @Published var bannerDismissed: Bool {
        didSet { UserDefaults.standard.set(bannerDismissed, forKey: Self.bannerDismissedKey) }
    }

    init() {
        bannerDismissed = UserDefaults.standard.bool(forKey: Self.bannerDismissedKey)
    }
}
