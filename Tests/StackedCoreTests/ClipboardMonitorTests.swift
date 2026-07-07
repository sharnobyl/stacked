import XCTest
import AppKit
@testable import StackedCore

final class ClipboardMonitorTests: XCTestCase {
    private var pb: NSPasteboard!
    private var monitor: ClipboardMonitor!
    private var captured: [StackItem] = []

    override func setUp() {
        super.setUp()
        pb = NSPasteboard(name: NSPasteboard.Name("stacked-mon-\(UUID().uuidString)"))
        monitor = ClipboardMonitor(pasteboard: pb)
        captured = []
        monitor.onCapture = { [weak self] in self?.captured.append($0) }
    }

    override func tearDown() {
        pb.releaseGlobally()
        super.tearDown()
    }

    func testCapturesNewCopy() {
        pb.clearContents()
        pb.setString("hi", forType: .string)
        monitor.checkForChanges()
        XCTAssertEqual(captured.map(\.preview), ["hi"])
    }

    func testNoCaptureWithoutChange() {
        pb.clearContents()
        pb.setString("hi", forType: .string)
        monitor.checkForChanges()
        monitor.checkForChanges()
        XCTAssertEqual(captured.count, 1)
    }

    func testIgnoresSelfWrites() {
        let item = StackItem(representations: [["public.utf8-plain-text": Data("x".utf8)]])
        PasteboardIO.write(item, to: pb, markSelfWrite: true)
        monitor.checkForChanges()
        XCTAssertTrue(captured.isEmpty)
    }

    func testCapturesChangeAfterSelfWrite() {
        let item = StackItem(representations: [["public.utf8-plain-text": Data("x".utf8)]])
        PasteboardIO.write(item, to: pb, markSelfWrite: true)
        monitor.checkForChanges()
        pb.clearContents()
        pb.setString("real copy", forType: .string)
        monitor.checkForChanges()
        XCTAssertEqual(captured.map(\.preview), ["real copy"])
    }

    func testIgnoresContentPresentBeforeStart() {
        pb.clearContents()
        pb.setString("old", forType: .string)
        let fresh = ClipboardMonitor(pasteboard: pb)
        var items: [StackItem] = []
        fresh.onCapture = { items.append($0) }
        fresh.checkForChanges()
        XCTAssertTrue(items.isEmpty)
    }
}
