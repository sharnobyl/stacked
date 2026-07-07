import SwiftUI
import StackedCore

struct StackView: View {
    @ObservedObject var store: StackStore
    @ObservedObject var state: AppState

    var onReverse: () -> Void
    var onDelete: (StackItem) -> Void
    var onCopyItem: (StackItem) -> Void
    var onMove: (IndexSet, Int) -> Void
    var onClearAll: () -> Void
    var onRequestPermission: () -> Void
    var onDismissBanner: () -> Void
    var onHidePanel: () -> Void

    var body: some View {
        VStack(spacing: 0) {
            header
            Divider()
            if !state.hasAccessibility && !state.bannerDismissed { permissionBanner }
            if store.isEmpty { emptyState } else { itemList }
        }
        .frame(minWidth: 220, maxWidth: .infinity, minHeight: 180, maxHeight: .infinity)
        .background(Color(nsColor: .windowBackgroundColor))
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .strokeBorder(Color.primary.opacity(0.12), lineWidth: 1)
        )
    }

    private var header: some View {
        HStack(spacing: 6) {
            Image(systemName: "square.stack.3d.up.fill")
                .font(.caption)
            Text("Stack").font(.subheadline.bold())
            Text("\(store.items.count)")
                .font(.caption).foregroundStyle(.secondary)
            Spacer()
            if !state.hasAccessibility {
                Button(action: onRequestPermission) {
                    Image(systemName: "exclamationmark.triangle.fill")
                        .font(.caption).foregroundStyle(.yellow)
                }
                .buttonStyle(.borderless)
                .help("⌘V interception is off — grant Accessibility in System Settings")
            }
            Button(action: onReverse) {
                Image(systemName: "arrow.up.arrow.down").font(.caption)
            }
            .buttonStyle(.borderless)
            .help("Reverse paste direction")
            Button(action: onClearAll) {
                Image(systemName: "trash").font(.caption)
            }
            .buttonStyle(.borderless)
            .help("Empty the stack")
            Button(action: onHidePanel) {
                Image(systemName: "xmark.circle.fill")
                    .font(.caption).foregroundStyle(.secondary)
            }
            .buttonStyle(.borderless)
            .help("Hide panel (stack stays active) — ⇧⌥C")
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
    }

    private var permissionBanner: some View {
        HStack(alignment: .top, spacing: 6) {
            VStack(alignment: .leading, spacing: 4) {
                Text("Grant Accessibility to paste with ⌘V")
                    .font(.caption).bold()
                Text("Until then, use an item's copy button, then paste manually.")
                    .font(.caption2).foregroundStyle(.secondary)
                Button("Open System Settings", action: onRequestPermission)
                    .font(.caption)
            }
            Spacer(minLength: 0)
            Button(action: onDismissBanner) {
                Image(systemName: "xmark")
                    .font(.caption2).foregroundStyle(.secondary)
            }
            .buttonStyle(.borderless)
            .help("Dismiss")
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(8)
        .background(.yellow.opacity(0.15))
    }

    private var emptyState: some View {
        VStack(spacing: 6) {
            Spacer()
            Image(systemName: "doc.on.clipboard")
                .font(.title2).foregroundStyle(.secondary)
            Text("Copy things to add them to the stack")
                .font(.caption).foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
            Text("Then press ⌘V to paste them out in order")
                .font(.caption2).foregroundStyle(.tertiary)
            Spacer()
        }
        .padding()
        .frame(maxWidth: .infinity)
    }

    private var itemList: some View {
        ScrollViewReader { proxy in
            List {
                ForEach(Array(store.orderedForPaste.enumerated()), id: \.element.id) { index, item in
                    row(for: item, isNext: index == 0)
                        .id(item.id)
                        .contextMenu {
                            Button("Delete") { onDelete(item) }
                        }
                        .swipeActions(edge: .trailing) {
                            Button(role: .destructive) { onDelete(item) } label: {
                                Label("Delete", systemImage: "trash")
                            }
                        }
                        .listRowInsets(EdgeInsets(top: 2, leading: 8, bottom: 2, trailing: 8))
                }
                .onMove { indices, newOffset in onMove(indices, newOffset) }
            }
            .listStyle(.plain)
            .onChange(of: store.items.count) { _ in scrollToTop(proxy) }
            .onChange(of: store.direction) { _ in scrollToTop(proxy) }
        }
    }

    private func scrollToTop(_ proxy: ScrollViewProxy) {
        if let firstID = store.orderedForPaste.first?.id {
            withAnimation { proxy.scrollTo(firstID, anchor: .top) }
        }
    }

    @ViewBuilder
    private func row(for item: StackItem, isNext: Bool) -> some View {
        HStack(spacing: 6) {
            icon(for: item)
            VStack(alignment: .leading, spacing: 1) {
                Text(item.preview)
                    .lineLimit(1)
                    .font(.caption)
                if isNext {
                    Text("Next · ⌘V").font(.caption2).foregroundStyle(.blue)
                }
            }
            Spacer(minLength: 0)
            if !state.hasAccessibility {
                Button(action: { onCopyItem(item) }) {
                    Image(systemName: "doc.on.doc")
                        .font(.caption2).foregroundStyle(.secondary)
                }
                .buttonStyle(.borderless)
                .help("Copy to clipboard for a manual paste")
            }
            Button(action: { onDelete(item) }) {
                Image(systemName: "xmark.circle.fill")
                    .font(.caption2).foregroundStyle(.tertiary)
            }
            .buttonStyle(.borderless)
            .help("Delete")
        }
        .padding(.vertical, 1)
    }

    @ViewBuilder
    private func icon(for item: StackItem) -> some View {
        if let data = item.imageData, let nsImage = NSImage(data: data) {
            Image(nsImage: nsImage)
                .resizable().aspectRatio(contentMode: .fill)
                .frame(width: 22, height: 22)
                .clipShape(RoundedRectangle(cornerRadius: 4))
        } else if item.kind == .text {
            Text("T")
                .font(.caption.weight(.semibold))
                .frame(width: 22, height: 22)
                .foregroundStyle(.secondary)
        } else {
            Image(systemName: symbolName(for: item.kind))
                .font(.caption)
                .frame(width: 22, height: 22)
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
