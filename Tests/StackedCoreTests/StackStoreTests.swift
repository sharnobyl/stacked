import XCTest
@testable import StackedCore

final class StackStoreTests: XCTestCase {
    private func item(_ s: String) -> StackItem {
        StackItem(representations: [["public.utf8-plain-text": s.data(using: .utf8)!]])
    }

    private func makeStore(_ texts: [String]) -> StackStore {
        let store = StackStore()
        texts.forEach { store.push(item($0)) }
        return store
    }

    func testPushAppendsInCopyOrder() {
        let store = makeStore(["a", "b", "c"])
        XCTAssertEqual(store.items.map(\.preview), ["a", "b", "c"])
    }

    func testPopNextIsFIFOByDefault() {
        let store = makeStore(["a", "b"])
        XCTAssertEqual(store.popNext()?.preview, "a")
        XCTAssertEqual(store.popNext()?.preview, "b")
        XCTAssertNil(store.popNext())
    }

    func testPopNextIsLIFOAfterToggle() {
        let store = makeStore(["a", "b"])
        store.toggleDirection()
        XCTAssertEqual(store.popNext()?.preview, "b")
        XCTAssertEqual(store.popNext()?.preview, "a")
    }

    func testToggleTwiceRestoresFIFO() {
        let store = makeStore(["a", "b"])
        store.toggleDirection()
        store.toggleDirection()
        XCTAssertEqual(store.popNext()?.preview, "a")
    }

    func testNextMatchesDirectionWithoutRemoving() {
        let store = makeStore(["a", "b"])
        XCTAssertEqual(store.next?.preview, "a")
        store.toggleDirection()
        XCTAssertEqual(store.next?.preview, "b")
        XCTAssertEqual(store.items.count, 2)
    }

    func testOrderedForPasteListsNextFirst() {
        let store = makeStore(["a", "b", "c"])
        XCTAssertEqual(store.orderedForPaste.map(\.preview), ["a", "b", "c"])
        store.toggleDirection()
        XCTAssertEqual(store.orderedForPaste.map(\.preview), ["c", "b", "a"])
    }

    func testRemoveById() {
        let store = StackStore()
        let victim = item("b")
        store.push(item("a"))
        store.push(victim)
        store.remove(id: victim.id)
        XCTAssertEqual(store.items.map(\.preview), ["a"])
    }

    func testClear() {
        let store = makeStore(["a", "b"])
        store.clear()
        XCTAssertTrue(store.isEmpty)
    }

    func testIsEmpty() {
        XCTAssertTrue(StackStore().isEmpty)
        XCTAssertFalse(makeStore(["a"]).isEmpty)
    }
}
