// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "Stacked",
    platforms: [.macOS(.v13)],
    targets: [
        .target(name: "StackedCore"),
        .executableTarget(name: "StackedApp", dependencies: ["StackedCore"]),
        .testTarget(name: "StackedCoreTests", dependencies: ["StackedCore"]),
    ]
)
