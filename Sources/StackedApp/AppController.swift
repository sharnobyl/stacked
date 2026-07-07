import AppKit
import SwiftUI
import Combine
import StackedCore

@MainActor
final class AppController: NSObject, NSApplicationDelegate {
    private let store = StackStore()
    private let state = AppState()
    private let monitor = ClipboardMonitor()
    private let interceptor = PasteInterceptor()
    private var hotkey: HotkeyManager?
    private var panel: StackPanel?
    private var statusItemController: StatusItemController?
    private var cancellables: Set<AnyCancellable> = []
    private var permissionTimer: Timer?

    func applicationDidFinishLaunching(_ notification: Notification) {
        monitor.onCapture = { [weak self] item in self?.store.push(item) }
        interceptor.consumeNextItem = { [weak self] in self?.store.popNext() }

        let view = StackView(
            store: store,
            state: state,
            onReverse: { [weak self] in self?.store.toggleDirection() },
            onDelete: { [weak self] item in self?.store.remove(id: item.id) },
            onCopyItem: { [weak self] item in self?.copyItem(item) },
            onMove: { [weak self] indices, offset in
                self?.store.moveDisplayed(fromOffsets: indices, toOffset: offset)
            },
            onClearAll: { [weak self] in self?.store.clear() },
            onRequestPermission: { [weak self] in self?.requestPermission() },
            onDismissBanner: { [weak self] in self?.state.bannerDismissed = true },
            onHidePanel: { [weak self] in self?.hidePanel() }
        )
        panel = StackPanel(contentView: view)
        statusItemController = StatusItemController(
            onToggleStack: { [weak self] in self?.toggle() },
            onTogglePanel: { [weak self] in self?.togglePanel() }
        )
        let hotkey = HotkeyManager()
        hotkey.register(.toggleStack) { [weak self] in self?.toggle() }
        hotkey.register(.togglePanel) { [weak self] in self?.togglePanel() }
        self.hotkey = hotkey

        // Badge count follows the stack even while the panel is hidden.
        store.$items
            .map(\.count)
            .removeDuplicates()
            .sink { [weak self] count in self?.refreshStatusItem(count: count) }
            .store(in: &cancellables)
    }

    func toggle() {
        state.isActive ? deactivate() : activate()
    }

    private func activate() {
        state.isActive = true
        state.hasAccessibility = PasteInterceptor.hasAccessibilityPermission()
        monitor.start()
        if state.hasAccessibility {
            state.hasAccessibility = interceptor.start()
        }
        startPermissionRecheck()
        showPanel()
    }

    private func deactivate() {
        state.isActive = false
        permissionTimer?.invalidate()
        permissionTimer = nil
        monitor.stop()
        interceptor.stop()
        store.clear()
        hidePanel()
    }

    /// The Accessibility grant can appear (user grants it in System Settings)
    /// or vanish (app re-signed) while the stack is active — poll and adapt.
    private func startPermissionRecheck() {
        permissionTimer?.invalidate()
        let timer = Timer(timeInterval: 2.0, repeats: true) { [weak self] _ in
            MainActor.assumeIsolated { self?.recheckPermission() }
        }
        RunLoop.main.add(timer, forMode: .common)
        permissionTimer = timer
    }

    private func recheckPermission() {
        guard state.isActive else { return }
        let granted = PasteInterceptor.hasAccessibilityPermission()
        guard granted != state.hasAccessibility else { return }
        if granted {
            state.hasAccessibility = interceptor.start()
        } else {
            interceptor.stop()
            state.hasAccessibility = false
        }
    }

    private func togglePanel() {
        guard state.isActive else { return activate() }
        state.isPanelVisible ? hidePanel() : showPanel()
    }

    private func showPanel() {
        panel?.showNearTopRight()
        state.isPanelVisible = true
        refreshStatusItem()
    }

    private func hidePanel() {
        panel?.orderOut(nil)
        state.isPanelVisible = false
        refreshStatusItem()
    }

    private func refreshStatusItem(count: Int? = nil) {
        statusItemController?.update(active: state.isActive,
                                     panelVisible: state.isPanelVisible,
                                     count: count ?? store.items.count)
    }

    // Fallback mode only: load the item onto the clipboard for a manual
    // paste. The item stays in the stack — deletion is explicit.
    private func copyItem(_ item: StackItem) {
        PasteboardIO.write(item, to: .general, markSelfWrite: true)
    }

    private func requestPermission() {
        _ = PasteInterceptor.hasAccessibilityPermission(promptIfNeeded: true)
        if let url = URL(string: "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility") {
            NSWorkspace.shared.open(url)
        }
    }
}
