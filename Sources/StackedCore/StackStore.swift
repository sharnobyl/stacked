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

    public func toggleDirection() {
        direction = direction == .firstCopiedFirst ? .lastCopiedFirst : .firstCopiedFirst
    }

    public func clear() { items = [] }
}
