import AppKit

/// Menu-bar icon: filled + item-count badge while the stack is active;
/// menu separates the stack feature toggle from panel visibility.
final class StatusItemController: NSObject {
    private let statusItem: NSStatusItem
    private let onToggleStack: () -> Void
    private let onTogglePanel: () -> Void
    private var panelItem: NSMenuItem!

    init(onToggleStack: @escaping () -> Void, onTogglePanel: @escaping () -> Void) {
        self.onToggleStack = onToggleStack
        self.onTogglePanel = onTogglePanel
        self.statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        super.init()

        let menu = NSMenu()
        menu.autoenablesItems = false

        let toggleItem = NSMenuItem(title: "Toggle Stack", action: #selector(toggleStackClicked), keyEquivalent: "c")
        toggleItem.keyEquivalentModifierMask = [.command, .shift]
        toggleItem.target = self
        menu.addItem(toggleItem)

        panelItem = NSMenuItem(title: "Show Panel", action: #selector(togglePanelClicked), keyEquivalent: "")
        panelItem.target = self
        menu.addItem(panelItem)

        menu.addItem(.separator())
        let aboutItem = NSMenuItem(title: "About Stacked", action: #selector(aboutClicked), keyEquivalent: "")
        aboutItem.target = self
        menu.addItem(aboutItem)
        menu.addItem(NSMenuItem(title: "Quit Stacked", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q"))
        statusItem.menu = menu

        update(active: false, panelVisible: false, count: 0)
    }

    func update(active: Bool, panelVisible: Bool, count: Int) {
        let name = active ? "square.stack.3d.up.fill" : "square.stack.3d.up"
        statusItem.button?.image = NSImage(systemSymbolName: name,
                                           accessibilityDescription: "Stacked")
        statusItem.button?.imagePosition = .imageLeft
        statusItem.button?.title = (active && count > 0) ? " \(count)" : ""
        panelItem.isEnabled = active
        panelItem.title = panelVisible ? "Hide Panel" : "Show Panel"
    }

    @objc private func toggleStackClicked() { onToggleStack() }

    @objc private func togglePanelClicked() { onTogglePanel() }

    @objc private func aboutClicked() {
        NSApp.orderFrontStandardAboutPanel(nil)
        NSApp.activate(ignoringOtherApps: true)
    }
}
