import AppKit
import SwiftUI
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

    func applicationDidFinishLaunching(_ notification: Notification) {
        monitor.onCapture = { [weak self] item in self?.store.push(item) }
        interceptor.consumeNextItem = { [weak self] in self?.store.popNext() }

        let view = StackView(
            store: store,
            state: state,
            onReverse: { [weak self] in self?.store.toggleDirection() },
            onDelete: { [weak self] item in self?.store.remove(id: item.id) },
            onItemClick: { [weak self] item in self?.itemClicked(item) },
            onRequestPermission: { [weak self] in self?.requestPermission() },
            onClose: { [weak self] in self?.deactivate() }
        )
        panel = StackPanel(contentView: view)
        statusItemController = StatusItemController(onToggle: { [weak self] in self?.toggle() })
        hotkey = HotkeyManager(onToggle: { [weak self] in self?.toggle() })
        hotkey?.register()
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
        panel?.showNearTopRight()
        statusItemController?.setActive(true)
    }

    private func deactivate() {
        state.isActive = false
        monitor.stop()
        interceptor.stop()
        store.clear()
        panel?.orderOut(nil)
        statusItemController?.setActive(false)
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
