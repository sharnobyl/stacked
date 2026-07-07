import AppKit

final class SmokeDelegate: NSObject, NSApplicationDelegate {
    var hotkey: HotkeyManager?
    func applicationDidFinishLaunching(_ notification: Notification) {
        hotkey = HotkeyManager(onToggle: { print("hotkey fired") })
        hotkey?.register()
        print("Stacked smoke build running — press Shift-Cmd-C, Ctrl-C to quit")
    }
}

let app = NSApplication.shared
let delegate = SmokeDelegate()
app.delegate = delegate
app.setActivationPolicy(.accessory)
app.run()
