import Combine

/// UI-facing state beyond the stack itself.
final class AppState: ObservableObject {
    @Published var isActive = false
    @Published var hasAccessibility = false
}
