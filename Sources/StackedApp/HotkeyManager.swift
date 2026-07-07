import Carbon.HIToolbox
import AppKit

/// Global hotkeys via Carbon. Works without Accessibility permission.
final class HotkeyManager {
    struct Hotkey {
        static let toggleStack = Hotkey(id: 1, keyCode: UInt32(kVK_ANSI_C), modifiers: UInt32(cmdKey | shiftKey))
        static let togglePanel = Hotkey(id: 2, keyCode: UInt32(kVK_ANSI_C), modifiers: UInt32(shiftKey | optionKey))

        let id: UInt32
        let keyCode: UInt32
        let modifiers: UInt32
    }

    private var hotKeyRefs: [UInt32: EventHotKeyRef] = [:]
    private var handlers: [UInt32: () -> Void] = [:]
    private var eventHandler: EventHandlerRef?

    func register(_ hotkey: Hotkey, handler: @escaping () -> Void) {
        guard hotKeyRefs[hotkey.id] == nil else { return }
        installEventHandlerIfNeeded()
        handlers[hotkey.id] = handler

        let hotKeyID = EventHotKeyID(signature: OSType(0x5354_4B44), id: hotkey.id) // 'STKD'
        var ref: EventHotKeyRef?
        RegisterEventHotKey(hotkey.keyCode, hotkey.modifiers, hotKeyID,
                            GetApplicationEventTarget(), 0, &ref)
        if let ref { hotKeyRefs[hotkey.id] = ref }
    }

    private func installEventHandlerIfNeeded() {
        guard eventHandler == nil else { return }
        var eventType = EventTypeSpec(eventClass: OSType(kEventClassKeyboard),
                                      eventKind: UInt32(kEventHotKeyPressed))
        let selfPtr = Unmanaged.passUnretained(self).toOpaque()
        InstallEventHandler(GetApplicationEventTarget(), { _, event, userData in
            guard let userData, let event else { return noErr }
            var hotKeyID = EventHotKeyID()
            GetEventParameter(event,
                              EventParamName(kEventParamDirectObject),
                              EventParamType(typeEventHotKeyID),
                              nil,
                              MemoryLayout<EventHotKeyID>.size,
                              nil,
                              &hotKeyID)
            Unmanaged<HotkeyManager>.fromOpaque(userData).takeUnretainedValue()
                .handlers[hotKeyID.id]?()
            return noErr
        }, 1, &eventType, selfPtr, &eventHandler)
    }

    func unregisterAll() {
        hotKeyRefs.values.forEach { UnregisterEventHotKey($0) }
        hotKeyRefs = [:]
        handlers = [:]
        if let eventHandler { RemoveEventHandler(eventHandler) }
        eventHandler = nil
    }

    deinit { unregisterAll() }
}
