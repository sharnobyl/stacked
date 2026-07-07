import XCTest
@testable import StackedCore

final class StackItemTests: XCTestCase {
    private func textItem(_ s: String) -> StackItem {
        StackItem(representations: [["public.utf8-plain-text": s.data(using: .utf8)!]])
    }

    func testPreviewUsesPlainText() {
        XCTAssertEqual(textItem("hello world").preview, "hello world")
    }

    func testPreviewTrimsAndTruncates() {
        let long = "  " + String(repeating: "a", count: 300)
        XCTAssertEqual(textItem(long).preview.count, 200)
        XCTAssertFalse(textItem(long).preview.hasPrefix(" "))
    }

    func testPreviewForFileURL() {
        let url = "file:///Users/me/Report.pdf".data(using: .utf8)!
        let item = StackItem(representations: [["public.file-url": url]])
        XCTAssertEqual(item.preview, "Report.pdf")
        XCTAssertEqual(item.kind, .file)
    }

    func testPreviewForImage() {
        let item = StackItem(representations: [["public.png": Data([1, 2, 3])]])
        XCTAssertEqual(item.preview, "Image")
        XCTAssertEqual(item.kind, .image)
    }

    func testPreviewForMultipleItemsAppendsCount() {
        let a = "file:///a/One.txt".data(using: .utf8)!
        let b = "file:///a/Two.txt".data(using: .utf8)!
        let item = StackItem(representations: [["public.file-url": a], ["public.file-url": b]])
        XCTAssertEqual(item.preview, "One.txt +1 more")
    }

    func testKindText() {
        XCTAssertEqual(textItem("x").kind, .text)
    }

    func testKindOtherForUnknownType() {
        let item = StackItem(representations: [["com.example.custom": Data()]])
        XCTAssertEqual(item.kind, .other)
    }

    func testImageDataReturnsPNGOrTIFF() {
        let png = Data([9, 9])
        XCTAssertEqual(StackItem(representations: [["public.png": png]]).imageData, png)
        XCTAssertNil(StackItem(representations: [["public.utf8-plain-text": Data()]]).imageData)
    }

    func testTotalByteCount() {
        let item = StackItem(representations: [["a": Data(count: 10), "b": Data(count: 5)], ["c": Data(count: 1)]])
        XCTAssertEqual(item.totalByteCount, 16)
    }
}

extension StackItemTests {
    func testKindImageForJPEG() {
        let jpeg = Data([0xFF, 0xD8])
        let item = StackItem(representations: [["public.jpeg": jpeg]])
        XCTAssertEqual(item.kind, .image)
        XCTAssertEqual(item.preview, "Image")
        XCTAssertEqual(item.imageData, jpeg)
    }
}
