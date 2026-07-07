import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
} from "remotion";
import {
  COPY_AT,
  FLIGHT_FRAMES,
  FONT,
  FPS,
  MAIL,
  MAIL_LINE_X,
  mailLineY,
  NOTE_LINE_X,
  NOTES,
  noteLineY,
  PANEL,
  PANEL_HEADER_H,
  PANEL_IN_AT,
  PASTE_AT,
  ROW_H,
  rowY,
  SNIPPETS,
  STACK_HOTKEY_AT,
} from "./timeline";
import { ItemCard, Keycap, MenuBar, Wallpaper, Window } from "./ui";

const ROW_W = PANEL.w - 20;

const springAt = (frame: number, at: number, config = { damping: 16, stiffness: 170 }) =>
  frame < at ? 0 : spring({ frame: frame - at, fps: FPS, config });

// Screencast keycap: pops in at `at`, fades ~0.6s later.
const keycapPop = (frame: number, at: number) => {
  const inP = springAt(frame, at);
  const out = interpolate(frame, [at + 13, at + 19], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return inP * out;
};

// Position along an arced flight path.
const flight = (frame: number, at: number, from: [number, number], to: [number, number]) => {
  const t = interpolate(frame, [at, at + FLIGHT_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  return {
    t,
    x: from[0] + (to[0] - from[0]) * t,
    y: from[1] + (to[1] - from[1]) * t - 60 * Math.sin(t * Math.PI),
  };
};

export const Demo: React.FC = () => {
  const frame = useCurrentFrame();

  const panelIn = springAt(frame, PANEL_IN_AT, { damping: 13, stiffness: 140 });
  const copied = COPY_AT.filter((f) => frame >= f).length;
  const pasted = PASTE_AT.filter((f) => frame >= f).length;
  const stackCount = copied - pasted;
  const pastePhase = frame >= PASTE_AT[0] - 10;

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <Wallpaper />
      <MenuBar stackCount={stackCount} stackVisible={frame >= PANEL_IN_AT} />

      {/* Source: Notes */}
      <Window x={NOTES.x} y={NOTES.y} w={NOTES.w} h={NOTES.h} title="Team sync" focused={!pastePhase}>
        <div style={{ position: "absolute", left: 40, top: 76, fontSize: 30, fontWeight: 800, color: "#1d1d1f" }}>
          Team sync — notes
        </div>
        <div style={{ position: "absolute", left: 40, top: 128, fontSize: 21, color: "#8e8e93" }}>
          Attendees: Maya, Jon, Priya
        </div>
        {SNIPPETS.map((text, i) => {
          // Selection highlight builds just before ⌘C, flashes off after.
          const sel =
            springAt(frame, COPY_AT[i] - 8) *
            interpolate(frame, [COPY_AT[i] + 4, COPY_AT[i] + 10], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: NOTE_LINE_X - NOTES.x,
                top: noteLineY(i) - NOTES.y - 18,
                fontSize: 22,
                color: "#2c2c2e",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <span style={{ color: "#c7c7cc" }}>•</span>
              <span
                style={{
                  background: `rgba(0, 122, 255, ${0.3 * sel})`,
                  borderRadius: 4,
                  padding: "3px 6px",
                  margin: "-3px -6px",
                }}
              >
                {text}
              </span>
            </div>
          );
        })}
        <div style={{ position: "absolute", left: 40, top: noteLineY(3) - NOTES.y - 18, fontSize: 21, color: "#8e8e93" }}>
          Next sync: Friday
        </div>
      </Window>

      {/* Destination: Mail compose */}
      <Window x={MAIL.x} y={MAIL.y} w={MAIL.w} h={MAIL.h} title="New Message" focused={pastePhase}>
        {[
          ["To:", "team@acme.com"],
          ["Subject:", "Kickoff update"],
        ].map(([label, value], i) => (
          <div
            key={label}
            style={{
              position: "absolute",
              left: 32,
              top: 48 + i * 46 + 12,
              fontSize: 19,
              color: "#8e8e93",
              width: MAIL.w - 64,
              borderBottom: "1px solid rgba(0,0,0,0.07)",
              paddingBottom: 10,
            }}
          >
            {label} <span style={{ color: "#2c2c2e" }}>{value}</span>
          </div>
        ))}
        <div style={{ position: "absolute", left: 32, top: 165, fontSize: 21, color: "#2c2c2e" }}>
          Hi all — quick update:
        </div>
        {SNIPPETS.map((text, i) => {
          const landed = frame >= PASTE_AT[i] + FLIGHT_FRAMES;
          const inP = springAt(frame, PASTE_AT[i] + FLIGHT_FRAMES);
          if (!landed) return null;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: MAIL_LINE_X - MAIL.x,
                top: mailLineY(i) - MAIL.y - 15,
                fontSize: 21,
                color: "#2c2c2e",
                opacity: inP,
              }}
            >
              {text}
            </div>
          );
        })}
        {/* blinking insertion point at the next paste target */}
        {pastePhase && pasted < 3 && (
          <div
            style={{
              position: "absolute",
              left: MAIL_LINE_X - MAIL.x - 2,
              top: mailLineY(pasted) - MAIL.y - 16,
              width: 2.5,
              height: 30,
              background: "#0a84ff",
              opacity: Math.floor(frame / 12) % 2 === 0 ? 1 : 0,
            }}
          />
        )}
      </Window>

      {/* Stacked floating panel */}
      <div
        style={{
          position: "absolute",
          left: PANEL.x,
          top: PANEL.y,
          width: PANEL.w,
          height: PANEL.h,
          borderRadius: 14,
          background: "rgba(246, 246, 248, 0.97)",
          boxShadow: "0 18px 50px rgba(0,0,0,0.38), 0 0 0 1px rgba(0,0,0,0.10)",
          transform: `scale(${0.75 + 0.25 * panelIn})`,
          transformOrigin: "top right",
          opacity: panelIn,
        }}
      >
        <div
          style={{
            height: PANEL_HEADER_H,
            display: "flex",
            alignItems: "center",
            padding: "0 14px",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
            fontSize: 18,
            fontWeight: 700,
            color: "#1d1d1f",
            gap: 10,
          }}
        >
          Stacked
          <span
            style={{
              background: "#e3e3e8",
              borderRadius: 10,
              padding: "1px 10px",
              fontSize: 15,
              fontWeight: 700,
              color: "#5b6472",
            }}
          >
            {stackCount}
          </span>
          <div style={{ flex: 1 }} />
          <span style={{ color: "#8e8e93", fontSize: 16, letterSpacing: 2 }}>⇅ ✕</span>
        </div>
        {stackCount === 0 && frame > PASTE_AT[2] && (
          <div
            style={{
              position: "absolute",
              top: PANEL_HEADER_H,
              left: 0,
              right: 0,
              bottom: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#aeaeb2",
              fontSize: 18,
              opacity: springAt(frame, PASTE_AT[2] + FLIGHT_FRAMES + 2),
            }}
          >
            Stack is empty
          </div>
        )}
      </div>

      {/* Panel rows (drawn above the panel so exits can fly out of it) */}
      {SNIPPETS.map((text, i) => {
        const landedAt = COPY_AT[i] + FLIGHT_FRAMES;
        if (frame < landedAt || frame >= PASTE_AT[i]) return null;
        // Earlier pastes shift this row up one slot each.
        const shift = PASTE_AT.slice(0, i).reduce(
          (acc, p) => acc + springAt(frame, p, { damping: 18, stiffness: 190 }),
          0
        );
        const pop = springAt(frame, landedAt, { damping: 12, stiffness: 200 });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: PANEL.x + 10,
              top: rowY(i - shift),
              transform: `scale(${0.85 + 0.15 * pop})`,
              opacity: pop * panelIn,
            }}
          >
            <ItemCard text={text} w={ROW_W} />
          </div>
        );
      })}

      {/* Copy flights: note line → panel slot */}
      {SNIPPETS.map((text, i) => {
        if (frame < COPY_AT[i] || frame > COPY_AT[i] + FLIGHT_FRAMES) return null;
        const f = flight(
          frame,
          COPY_AT[i],
          [NOTE_LINE_X, noteLineY(i) - ROW_H / 2],
          [PANEL.x + 10, rowY(i)]
        );
        return (
          <div key={i} style={{ position: "absolute", left: f.x, top: f.y, opacity: 1 - f.t * 0.25 }}>
            <ItemCard text={text} w={ROW_W} />
          </div>
        );
      })}

      {/* Paste flights: panel top slot → mail body line */}
      {SNIPPETS.map((text, i) => {
        if (frame < PASTE_AT[i] || frame > PASTE_AT[i] + FLIGHT_FRAMES) return null;
        const f = flight(
          frame,
          PASTE_AT[i],
          [PANEL.x + 10, rowY(0)],
          [MAIL_LINE_X, mailLineY(i) - ROW_H / 2 + 8]
        );
        return (
          <div key={i} style={{ position: "absolute", left: f.x, top: f.y, opacity: 1 - f.t * 0.5 }}>
            <ItemCard text={text} w={ROW_W} />
          </div>
        );
      })}

      {/* Keycap overlay */}
      {keycapPop(frame, STACK_HOTKEY_AT) > 0.01 && (
        <Keycap label="⇧ ⌘ C" pop={keycapPop(frame, STACK_HOTKEY_AT)} />
      )}
      {COPY_AT.map((at, i) =>
        keycapPop(frame, at) > 0.01 ? <Keycap key={`c${i}`} label="⌘ C" pop={keycapPop(frame, at)} /> : null
      )}
      {PASTE_AT.map((at, i) =>
        keycapPop(frame, at) > 0.01 ? <Keycap key={`v${i}`} label="⌘ V" pop={keycapPop(frame, at)} /> : null
      )}
    </AbsoluteFill>
  );
};
