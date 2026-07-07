import AppKit
import StackedCore

/// Intercepts Cmd-V while the stack is active and swaps in the next stack item.
final class PasteInterceptor {
    private static let vKeyCode: Int64 = 9

    private var tap: CFMachPort?
    private var runLoopSource: CFRunLoopSource?

    /// Pops and returns the next stack item; nil lets the event pass untouched.
    var consumeNextItem: (() -> StackItem?)?

    static func hasAccessibilityPermission(promptIfNeeded: Bool = false) -> Bool {
        let key = kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String
        return AXIsProcessTrustedWithOptions([key: promptIfNeeded] as CFDictionary)
    }

    /// Returns false when the tap can't be created (no Accessibility permission).
    @discardableResult
    func start() -> Bool {
        guard tap == nil else { return true }
        let mask = CGEventMask(1 << CGEventType.keyDown.rawValue)
        let selfPtr = Unmanaged.passUnretained(self).toOpaque()
        guard let tap = CGEvent.tapCreate(
            tap: .cgSessionEventTap,
            place: .headInsertEventTap,
            options: .defaultTap,
            eventsOfInterest: mask,
            callback: { _, type, event, userData in
                guard let userData else { return Unmanaged.passUnretained(event) }
                return Unmanaged<PasteInterceptor>.fromOpaque(userData)
                    .takeUnretainedValue()
                    .handle(type: type, event: event)
            },
            userInfo: selfPtr
        ) else { return false }

        self.tap = tap
        let source = CFMachPortCreateRunLoopSource(kCFAllocatorDefault, tap, 0)
        runLoopSource = source
        CFRunLoopAddSource(CFRunLoopGetMain(), source, .commonModes)
        CGEvent.tapEnable(tap: tap, enable: true)
        return true
    }

    func stop() {
        if let tap {
            CGEvent.tapEnable(tap: tap, enable: false)
            if let runLoopSource {
                CFRunLoopRemoveSource(CFRunLoopGetMain(), runLoopSource, .commonModes)
            }
        }
        runLoopSource = nil
        tap = nil
    }

    private func handle(type: CGEventType, event: CGEvent) -> Unmanaged<CGEvent>? {
        if type == .tapDisabledByTimeout || type == .tapDisabledByUserInput {
            if let tap { CGEvent.tapEnable(tap: tap, enable: true) }
            return Unmanaged.passUnretained(event)
        }
        guard type == .keyDown,
              event.getIntegerValueField(.keyboardEventKeycode) == Self.vKeyCode,
              event.flags.contains(.maskCommand),
              !event.flags.contains(.maskShift),
              !event.flags.contains(.maskAlternate),
              !event.flags.contains(.maskControl),
              let item = consumeNextItem?()
        else { return Unmanaged.passUnretained(event) }

        PasteboardIO.write(item, to: .general, markSelfWrite: true)
        return Unmanaged.passUnretained(event)
    }

    deinit { stop() }
}
