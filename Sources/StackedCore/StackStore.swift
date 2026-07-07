import Foundation
import Combine

/// Main-thread only. Ordered clipboard stack with reversible paste direction.
public final class StackStore: ObservableObject {
    public enum Direction { case firstCopiedFirst, lastCopiedFirst }

    /// Copy order: oldest first.
    @Published public private(set) var items: [StackItem] = []
    @Published public private(set) var direction: Direction = .firstCopiedFirst

    public init() {}

    public var isEmpty: Bool { items.isEmpty }

    /// Next item Cmd-V would paste, without removing it.
    public var next: StackItem? {
        direction == .firstCopiedFirst ? items.first : items.last
    }

    /// Items listed next-to-paste first — the UI display order.
    public var orderedForPaste: [StackItem] {
        direction == .firstCopiedFirst ? items : items.reversed()
    }

    public func push(_ item: StackItem) { items.append(item) }

    @discardableResult
    public func popNext() -> StackItem? {
        guard !items.isEmpty else { return nil }
        return direction == .firstCopiedFirst ? items.removeFirst() : items.removeLast()
    }

    public func remove(id: UUID) { items.removeAll { $0.id == id } }

    /// Reorder items using display-order offsets (as shown in the panel,
    /// next-to-paste first), regardless of the current direction.
    /// Same semantics as SwiftUI's onMove: `toOffset` is in pre-removal
    /// coordinates. (Not using SwiftUI's Array.move — Core doesn't link SwiftUI.)
    public func moveDisplayed(fromOffsets: IndexSet, toOffset: Int) {
        var displayed = orderedForPaste
        let moving = fromOffsets.compactMap { displayed.indices.contains($0) ? displayed[$0] : nil }
        guard !moving.isEmpty else { return }
        let adjustedTarget = toOffset - fromOffsets.filter { $0 < toOffset }.count
        for index in fromOffsets.sorted(by: >) where displayed.indices.contains(index) {
            displayed.remove(at: index)
        }
        displayed.insert(contentsOf: moving, at: min(adjustedTarget, displayed.count))
        items = direction == .firstCopiedFirst ? displayed : displayed.reversed()
    }

    public func toggleDirection() {
        direction = direction == .firstCopiedFirst ? .lastCopiedFirst : .firstCopiedFirst
    }

    public func clear() { items = [] }
}
