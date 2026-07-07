import SwiftUI
import StackedCore

struct StackView: View {
    @ObservedObject var store: StackStore
    @ObservedObject var state: AppState

    var onReverse: () -> Void
    var onDelete: (StackItem) -> Void
    var onItemClick: (StackItem) -> Void
    var onRequestPermission: () -> Void
    var onClose: () -> Void

    var body: some View {
        VStack(spacing: 0) {
            header
            Divider()
            if !state.hasAccessibility { permissionBanner }
            if store.isEmpty { emptyState } else { itemList }
        }
        .frame(width: 320, height: 420)
    }

    private var header: some View {
        HStack {
            Image(systemName: "square.stack.3d.up.fill")
            Text("Stack").font(.headline)
            Text("\(store.items.count)")
                .font(.subheadline).foregroundStyle(.secondary)
            Spacer()
            Button(action: onReverse) {
                Image(systemName: "arrow.up.arrow.down")
            }
            .buttonStyle(.borderless)
            .help("Reverse paste direction")
            Button(action: onClose) {
                Image(systemName: "xmark.circle.fill").foregroundStyle(.secondary)
            }
            .buttonStyle(.borderless)
            .help("Close and clear the stack (⇧⌘C)")
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
    }

    private var permissionBanner: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Grant Accessibility to paste with ⌘V")
                .font(.caption).bold()
            Text("Until then, click an item to copy it, then paste manually.")
                .font(.caption2).foregroundStyle(.secondary)
            Button("Open System Settings", action: onRequestPermission)
                .font(.caption)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(10)
        .background(.yellow.opacity(0.15))
    }

    private var emptyState: some View {
        VStack(spacing: 8) {
            Spacer()
            Image(systemName: "doc.on.clipboard")
                .font(.largeTitle).foregroundStyle(.secondary)
            Text("Copy things to add them to the stack")
                .font(.callout).foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            Text("Then press ⌘V to paste them out in order")
                .font(.caption).foregroundStyle(.tertiary)
            Spacer()
        }
        .padding()
        .frame(maxWidth: .infinity)
    }

    private var itemList: some View {
        List {
            ForEach(Array(store.orderedForPaste.enumerated()), id: \.element.id) { index, item in
                row(for: item, isNext: index == 0)
                    .contentShape(Rectangle())
                    .onTapGesture { onItemClick(item) }
                    .contextMenu {
                        Button("Delete") { onDelete(item) }
                    }
                    .swipeActions(edge: .trailing) {
                        Button(role: .destructive) { onDelete(item) } label: {
                            Label("Delete", systemImage: "trash")
                        }
                    }
            }
        }
        .listStyle(.plain)
    }

    @ViewBuilder
    private func row(for item: StackItem, isNext: Bool) -> some View {
        HStack(spacing: 8) {
            icon(for: item)
            VStack(alignment: .leading, spacing: 2) {
                Text(item.preview)
                    .lineLimit(2)
                    .font(.callout)
                if isNext {
                    Text("Next · ⌘V").font(.caption2).foregroundStyle(.blue)
                }
            }
            Spacer(minLength: 0)
        }
        .padding(.vertical, 2)
    }

    @ViewBuilder
    private func icon(for item: StackItem) -> some View {
        if let data = item.imageData, let nsImage = NSImage(data: data) {
            Image(nsImage: nsImage)
                .resizable().aspectRatio(contentMode: .fill)
                .frame(width: 28, height: 28)
                .clipShape(RoundedRectangle(cornerRadius: 4))
        } else {
            Image(systemName: symbolName(for: item.kind))
                .frame(width: 28, height: 28)
                .foregroundStyle(.secondary)
        }
    }

    private func symbolName(for kind: StackItem.Kind) -> String {
        switch kind {
        case .text: return "text.alignleft"
        case .image: return "photo"
        case .file: return "doc"
        case .other: return "shippingbox"
        }
    }
}
