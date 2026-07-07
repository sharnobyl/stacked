import AppKit
import SwiftUI

/// Floating, non-activating panel so it never steals focus from the paste target.
/// Borderless: the SwiftUI content draws its own rounded background, so there is
/// no title-bar dead space.
final class StackPanel: NSPanel {
    init(contentView: some View) {
        super.init(contentRect: NSRect(x: 0, y: 0, width: 260, height: 300),
                   styleMask: [.borderless, .nonactivatingPanel],
                   backing: .buffered,
                   defer: false)
        isFloatingPanel = true
        level = .floating
        collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary]
        isMovableByWindowBackground = true
        hidesOnDeactivate = false
        isReleasedWhenClosed = false
        isOpaque = false
        backgroundColor = .clear
        hasShadow = true
        self.contentView = NSHostingView(rootView: contentView)
    }

    override var canBecomeKey: Bool { true }
    override var canBecomeMain: Bool { false }

    /// Show near the top-right of the screen containing the mouse.
    func showNearTopRight() {
        let mouse = NSEvent.mouseLocation
        let screen = NSScreen.screens.first { NSMouseInRect(mouse, $0.frame, false) }
            ?? NSScreen.main
        if let visible = screen?.visibleFrame {
            let x = visible.maxX - frame.width - 24
            let y = visible.maxY - frame.height - 24
            setFrameOrigin(NSPoint(x: x, y: y))
        }
        orderFrontRegardless()
    }
}
