import AppKit

public enum PasteboardIO {
    /// Private marker type identifying pasteboard contents written by Stacked itself.
    public static let selfWriteMarker = "com.stacked.self-write"
    /// Default per-item cap (50 MB) — protects memory; it's an ad-hoc pinboard.
    public static let defaultMaxBytes = 50 * 1024 * 1024

    /// Snapshot all items/representations. Returns nil for empty or oversized content.
    public static func snapshot(from pasteboard: NSPasteboard,
                                maxBytes: Int = defaultMaxBytes) -> StackItem? {
        guard let pbItems = pasteboard.pasteboardItems, !pbItems.isEmpty else { return nil }
        var representations: [[String: Data]] = []
        var total = 0
        for pbItem in pbItems {
            var dict: [String: Data] = [:]
            for type in pbItem.types where type.rawValue != selfWriteMarker {
                guard let data = pbItem.data(forType: type) else { continue }
                total += data.count
                if total > maxBytes { return nil }
                dict[type.rawValue] = data
            }
            if !dict.isEmpty { representations.append(dict) }
        }
        guard !representations.isEmpty else { return nil }
        return StackItem(representations: representations)
    }

    /// Write an item's full representations back to a pasteboard.
    public static func write(_ item: StackItem, to pasteboard: NSPasteboard, markSelfWrite: Bool) {
        pasteboard.clearContents()
        var pbItems: [NSPasteboardItem] = []
        for (index, dict) in item.representations.enumerated() {
            let pbItem = NSPasteboardItem()
            for (type, data) in dict {
                pbItem.setData(data, forType: NSPasteboard.PasteboardType(type))
            }
            if markSelfWrite && index == 0 {
                pbItem.setData(Data(), forType: NSPasteboard.PasteboardType(selfWriteMarker))
            }
            pbItems.append(pbItem)
        }
        pasteboard.writeObjects(pbItems)
    }

    public static func isSelfWrite(_ pasteboard: NSPasteboard) -> Bool {
        pasteboard.pasteboardItems?.first?.types
            .contains(NSPasteboard.PasteboardType(selfWriteMarker)) ?? false
    }
}
