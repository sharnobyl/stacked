import XCTest
import AppKit
@testable import StackedCore

final class PasteboardIOTests: XCTestCase {
    private var pasteboards: [NSPasteboard] = []

    private func makePasteboard() -> NSPasteboard {
        let pb = NSPasteboard(name: NSPasteboard.Name("stacked-test-\(UUID().uuidString)"))
        pasteboards.append(pb)
        return pb
    }

    override func tearDown() {
        pasteboards.forEach { $0.releaseGlobally() }
        pasteboards = []
        super.tearDown()
    }

    func testSnapshotOfEmptyPasteboardIsNil() {
        let pb = makePasteboard()
        pb.clearContents()
        XCTAssertNil(PasteboardIO.snapshot(from: pb))
    }

    func testTextRoundTrip() {
        let src = makePasteboard()
        src.clearContents()
        src.setString("hello", forType: .string)
        guard let item = PasteboardIO.snapshot(from: src) else { return XCTFail("no snapshot") }
        XCTAssertEqual(item.preview, "hello")

        let dst = makePasteboard()
        PasteboardIO.write(item, to: dst, markSelfWrite: false)
        XCTAssertEqual(dst.string(forType: .string), "hello")
    }

    func testMultipleRepresentationsSurviveRoundTrip() {
        let src = makePasteboard()
        src.clearContents()
        let pbItem = NSPasteboardItem()
        pbItem.setString("plain", forType: .string)
        pbItem.setData(Data([1, 2]), forType: .rtf)
        src.writeObjects([pbItem])

        guard let item = PasteboardIO.snapshot(from: src) else { return XCTFail("no snapshot") }
        let dst = makePasteboard()
        PasteboardIO.write(item, to: dst, markSelfWrite: false)
        XCTAssertEqual(dst.string(forType: .string), "plain")
        XCTAssertEqual(dst.data(forType: .rtf), Data([1, 2]))
    }

    func testSelfWriteMarkerDetected() {
        let pb = makePasteboard()
        let item = StackItem(representations: [["public.utf8-plain-text": Data("x".utf8)]])
        PasteboardIO.write(item, to: pb, markSelfWrite: true)
        XCTAssertTrue(PasteboardIO.isSelfWrite(pb))

        PasteboardIO.write(item, to: pb, markSelfWrite: false)
        XCTAssertFalse(PasteboardIO.isSelfWrite(pb))
    }

    func testMarkerTypeNotCapturedBySnapshot() {
        let pb = makePasteboard()
        let item = StackItem(representations: [["public.utf8-plain-text": Data("x".utf8)]])
        PasteboardIO.write(item, to: pb, markSelfWrite: true)
        let recaptured = PasteboardIO.snapshot(from: pb)
        XCTAssertEqual(recaptured?.representations,
                       [["public.utf8-plain-text": Data("x".utf8)]])
    }

    func testOversizedSnapshotIsNil() {
        let pb = makePasteboard()
        pb.clearContents()
        pb.setString(String(repeating: "a", count: 100), forType: .string)
        XCTAssertNil(PasteboardIO.snapshot(from: pb, maxBytes: 10))
        XCTAssertNotNil(PasteboardIO.snapshot(from: pb, maxBytes: 10_000))
    }
}
