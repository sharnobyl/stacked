import React from "react";
import { FONT, MENUBAR_H, WIDTH } from "./timeline";

// --- macOS chrome ---------------------------------------------------------

export const Wallpaper: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background:
        "linear-gradient(135deg, #1e3a6d 0%, #274b8f 30%, #5a4fa2 65%, #8a4d9e 100%)",
    }}
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(1200px 700px at 70% 20%, rgba(255,180,120,0.25), transparent 70%)",
      }}
    />
  </div>
);

export const MenuBar: React.FC<{
  appName: string;
  stackCount: number;
  stackVisible: boolean;
}> = ({ appName, stackCount, stackVisible }) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      width: WIDTH,
      height: MENUBAR_H,
      background: "rgba(250, 250, 252, 0.72)",
      backdropFilter: "blur(20px)",
      display: "flex",
      alignItems: "center",
      padding: "0 20px",
      fontFamily: FONT,
      fontSize: 17,
      color: "#1d1d1f",
      boxShadow: "0 1px 0 rgba(0,0,0,0.08)",
      zIndex: 9,
    }}
  >
    <span style={{ fontSize: 19, marginRight: 22 }}></span>
    <span style={{ fontWeight: 700, marginRight: 22 }}>{appName}</span>
    {["File", "Edit", "Format", "View", "Window", "Help"].map((m) => (
      <span key={m} style={{ marginRight: 22 }}>
        {m}
      </span>
    ))}
    <div style={{ flex: 1 }} />
    {stackVisible && (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          marginRight: 24,
          fontWeight: 600,
        }}
      >
        <StackGlyph />
        {stackCount > 0 ? stackCount : ""}
      </span>
    )}
    <span>Mon 9:41 AM</span>
  </div>
);

// Small stack-of-cards glyph for the menu bar
const StackGlyph: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 20 20">
    <rect x="3" y="3" width="14" height="5" rx="1.5" fill="#1d1d1f" />
    <rect x="3" y="10" width="14" height="4" rx="1.5" fill="#1d1d1f" opacity={0.55} />
    <rect x="3" y="16" width="14" height="3" rx="1.5" fill="#1d1d1f" opacity={0.3} />
  </svg>
);

export const TrafficLights: React.FC = () => (
  <div style={{ display: "flex", gap: 8, position: "absolute", left: 18, top: 17 }}>
    {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
      <div key={c} style={{ width: 13, height: 13, borderRadius: 7, background: c }} />
    ))}
  </div>
);

export const Window: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  focused?: boolean;
  zIndex?: number;
  children?: React.ReactNode;
}> = ({ x, y, w, h, title, focused = true, zIndex = 1, children }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: h,
      borderRadius: 12,
      background: "#ffffff",
      boxShadow: focused
        ? "0 24px 60px rgba(0,0,0,0.42), 0 0 0 1px rgba(0,0,0,0.12)"
        : "0 12px 32px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.10)",
      overflow: "hidden",
      fontFamily: FONT,
      zIndex,
    }}
  >
    <div
      style={{
        height: 48,
        background: focused ? "#f3f2f2" : "#fafafa",
        borderBottom: "1px solid rgba(0,0,0,0.09)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        fontSize: 17,
        fontWeight: 600,
        color: focused ? "#3a3a3c" : "#b0b0b3",
      }}
    >
      <TrafficLights />
      {title}
    </div>
    {children}
  </div>
);

// Safari-style URL bar; `sel` (0..1) animates the selection highlight.
export const UrlBar: React.FC<{ url: string; w: number; sel: number }> = ({ url, w, sel }) => (
  <div
    style={{
      position: "absolute",
      left: 100,
      top: 9,
      width: w,
      height: 34,
      borderRadius: 9,
      background: "#e9e8ea",
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "0 12px",
      fontSize: 16,
      color: "#3a3a3c",
    }}
  >
    <span style={{ fontSize: 13, color: "#8e8e93" }}>🔒</span>
    <span
      style={{
        background: `rgba(0, 122, 255, ${0.32 * sel})`,
        borderRadius: 4,
        padding: "2px 5px",
        margin: "-2px -5px",
        whiteSpace: "nowrap",
      }}
    >
      {url}
    </span>
  </div>
);

// iMessage-style chat bubble.
export const Bubble: React.FC<{
  text: string;
  mine?: boolean;
  sel?: number;
}> = ({ text, mine = false, sel = 0 }) => (
  <div
    style={{
      display: "flex",
      justifyContent: mine ? "flex-end" : "flex-start",
      padding: "5px 20px",
    }}
  >
    <div
      style={{
        maxWidth: "72%",
        borderRadius: 20,
        padding: "10px 16px",
        fontSize: 19,
        lineHeight: 1.3,
        background: mine ? "#0a84ff" : "#e9e9eb",
        color: mine ? "#ffffff" : "#1d1d1f",
        boxShadow: sel > 0 ? `0 0 0 ${3 * sel}px rgba(0,122,255,${0.45 * sel})` : "none",
      }}
    >
      {text}
    </div>
  </div>
);

// Miniature of the demo desktop, used as the "screenshot" item.
export const ScreenshotThumb: React.FC<{ w: number; h: number }> = ({ w, h }) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: Math.max(4, w * 0.03),
      background: "linear-gradient(135deg, #1e3a6d 0%, #5a4fa2 65%, #8a4d9e 100%)",
      position: "relative",
      overflow: "hidden",
      boxShadow: "0 0 0 1px rgba(0,0,0,0.15)",
      flexShrink: 0,
    }}
  >
    <div
      style={{
        position: "absolute",
        left: "10%",
        top: "16%",
        width: "46%",
        height: "58%",
        borderRadius: 3,
        background: "rgba(255,255,255,0.92)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: "48%",
        top: "34%",
        width: "42%",
        height: "52%",
        borderRadius: 3,
        background: "rgba(255,255,255,0.8)",
      }}
    />
  </div>
);

// --- Keycap overlay (screencast-style) ------------------------------------

export const Keycap: React.FC<{ label: string; pop: number }> = ({ label, pop }) => (
  <div
    style={{
      position: "absolute",
      bottom: 70,
      left: "50%",
      transform: `translateX(-50%) scale(${0.7 + 0.3 * pop})`,
      opacity: pop,
      background: "rgba(28, 28, 30, 0.88)",
      color: "#ffffff",
      borderRadius: 16,
      padding: "18px 34px",
      fontFamily: FONT,
      fontSize: 44,
      fontWeight: 700,
      letterSpacing: 4,
      boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
      zIndex: 12,
    }}
  >
    {label}
  </div>
);

// --- Stack panel pieces ----------------------------------------------------

export const RowIcon: React.FC<{ kind: "text" | "image" }> = ({ kind }) =>
  kind === "image" ? (
    <ScreenshotThumb w={34} h={34} />
  ) : (
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: 8,
        background: "#eef1f6",
        color: "#5b6472",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 19,
        fontWeight: 800,
        fontFamily: FONT,
        flexShrink: 0,
      }}
    >
      T
    </div>
  );

export const ItemCard: React.FC<{ text: string; kind: "text" | "image"; w: number }> = ({
  text,
  kind,
  w,
}) => (
  <div
    style={{
      width: w,
      height: 58,
      borderRadius: 10,
      background: "#ffffff",
      boxShadow: "0 1px 3px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.06)",
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "0 12px",
      fontFamily: FONT,
      fontSize: 17,
      color: "#2c2c2e",
      whiteSpace: "nowrap",
      overflow: "hidden",
    }}
  >
    <RowIcon kind={kind} />
    <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{text}</span>
  </div>
);
