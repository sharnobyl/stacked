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

    func applicationDidFinishLaunching(_ notification: Notification) {
        monitor.onCapture = { [weak self] item in self?.store.push(item) }
        interceptor.consumeNextItem = { [weak self] in self?.store.popNext() }

        let view = StackView(
            store: store,
            state: state,
            onReverse: { [weak self] in self?.store.toggleDirection() },
            onDelete: { [weak self] item in self?.store.remove(id: item.id) },
            onItemClick: { [weak self] item in self?.itemClicked(item) },
            onClearAll: { [weak self] in self?.store.clear() },
            onRequestPermission: { [weak self] in self?.requestPermission() },
            onHidePanel: { [weak self] in self?.hidePanel() }
        )
        panel = StackPanel(contentView: view)
        statusItemController = StatusItemController(
            onToggleStack: { [weak self] in self?.toggle() },
            onTogglePanel: { [weak self] in self?.togglePanel() }
        )
        hotkey = HotkeyManager(onToggle: { [weak self] in self?.toggle() })
        hotkey?.register()

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
        showPanel()
    }

    private func deactivate() {
        state.isActive = false
        monitor.stop()
        interceptor.stop()
        store.clear()
        hidePanel()
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

    private func itemClicked(_ item: StackItem) {
        guard !state.hasAccessibility else { return }
        PasteboardIO.write(item, to: .general, markSelfWrite: true)
        store.remove(id: item.id)
    }

    private func requestPermission() {
        _ = PasteInterceptor.hasAccessibilityPermission(promptIfNeeded: true)
        if let url = URL(string: "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility") {
            NSWorkspace.shared.open(url)
        }
    }
}
