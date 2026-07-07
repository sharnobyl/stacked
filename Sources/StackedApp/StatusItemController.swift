import AppKit

/// Menu-bar icon: filled while the stack is active; menu with toggle/about/quit.
final class StatusItemController: NSObject {
    private let statusItem: NSStatusItem
    private let onToggle: () -> Void

    init(onToggle: @escaping () -> Void) {
        self.onToggle = onToggle
        self.statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)
        super.init()

        setActive(false)

        let menu = NSMenu()
        let toggleItem = NSMenuItem(title: "Toggle Stack", action: #selector(toggleClicked), keyEquivalent: "c")
        toggleItem.keyEquivalentModifierMask = [.command, .shift]
        toggleItem.target = self
        menu.addItem(toggleItem)
        menu.addItem(.separator())
        let aboutItem = NSMenuItem(title: "About Stacked", action: #selector(aboutClicked), keyEquivalent: "")
        aboutItem.target = self
        menu.addItem(aboutItem)
        menu.addItem(NSMenuItem(title: "Quit Stacked", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q"))
        statusItem.menu = menu
    }

    func setActive(_ active: Bool) {
        let name = active ? "square.stack.3d.up.fill" : "square.stack.3d.up"
        statusItem.button?.image = NSImage(systemSymbolName: name,
                                           accessibilityDescription: "Stacked")
    }

    @objc private func toggleClicked() { onToggle() }

    @objc private func aboutClicked() {
        NSApp.orderFrontStandardAboutPanel(nil)
        NSApp.activate(ignoringOtherApps: true)
    }
}
