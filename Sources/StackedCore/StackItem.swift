import Foundation

public struct StackItem: Identifiable, Equatable {
    public enum Kind: Equatable { case text, image, file, other }

    public static let textType = "public.utf8-plain-text"
    public static let fileURLType = "public.file-url"
    public static let imageTypes = ["public.png", "public.tiff", "public.jpeg"]

    public let id: UUID
    public let capturedAt: Date
    /// One dictionary per NSPasteboardItem: raw UTI string -> data.
    public let representations: [[String: Data]]

    public init(id: UUID = UUID(), capturedAt: Date = Date(), representations: [[String: Data]]) {
        self.id = id
        self.capturedAt = capturedAt
        self.representations = representations
    }

    public var totalByteCount: Int {
        representations.reduce(0) { $0 + $1.values.reduce(0) { $0 + $1.count } }
    }

    public var kind: Kind {
        guard let first = representations.first else { return .other }
        if first[Self.textType] != nil { return .text }
        if first[Self.fileURLType] != nil { return .file }
        if Self.imageTypes.contains(where: { first[$0] != nil }) { return .image }
        return .other
    }

    public var imageData: Data? {
        guard let first = representations.first else { return nil }
        return Self.imageTypes.compactMap { first[$0] }.first
    }

    public var preview: String {
        guard let first = representations.first else { return "Empty item" }
        let base: String
        if let d = first[Self.textType], let s = String(data: d, encoding: .utf8) {
            let trimmed = s.trimmingCharacters(in: .whitespacesAndNewlines)
            base = trimmed.isEmpty ? "Whitespace" : String(trimmed.prefix(200))
        } else if let d = first[Self.fileURLType], let s = String(data: d, encoding: .utf8),
                  let url = URL(string: s) {
            base = url.lastPathComponent
        } else if kind == .image {
            base = "Image"
        } else {
            base = first.keys.sorted().first ?? "Item"
        }
        let extra = representations.count - 1
        return extra > 0 ? "\(base) +\(extra) more" : base
    }
}
