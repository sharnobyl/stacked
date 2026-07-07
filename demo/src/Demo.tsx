import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  COPY_AT,
  END_CARD_AT,
  FLIGHT_FRAMES,
  FOCUS_MAIL_AT,
  FOCUS_MSGS_AT,
  FOCUS_SAFARI_AT,
  FONT,
  FPS,
  ITEMS,
  MAIL,
  MAIL_LINE_X,
  mailLineY,
  MSG_BUBBLE,
  MSGS,
  NOTE_LINE,
  NOTES,
  PANEL,
  PANEL_HEADER_H,
  PANEL_IN_AT,
  PASTE_AT,
  PASTED_IMG,
  ROW_H,
  rowY,
  SAFARI,
  SAFARI_URL,
  SHOT_AT,
  SHOT_FLIGHT_AT,
  STACK_HOTKEY_AT,
} from "./timeline";
import {
  Bubble,
  ItemCard,
  Keycap,
  MenuBar,
  ScreenshotThumb,
  UrlBar,
  Wallpaper,
  Window,
} from "./ui";

const ROW_W = PANEL.w - 20;
// Frame at which item i is "copied" (starts flying to the panel).
const copyAt = (i: number) => (i < 3 ? COPY_AT[i] : SHOT_FLIGHT_AT);

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

// Progress + position along an arced flight path.
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

// Selection highlight: builds just before ⌘C, flashes off after.
const selAt = (frame: number, at: number) =>
  springAt(frame, at - 8) *
  interpolate(frame, [at + 4, at + 10], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const Demo: React.FC = () => {
  const frame = useCurrentFrame();

  const panelIn = springAt(frame, PANEL_IN_AT, { damping: 13, stiffness: 140 });
  const landed = ITEMS.filter((_, i) => frame >= copyAt(i) + FLIGHT_FRAMES).length;
  const pasted = PASTE_AT.filter((f) => frame >= f).length;
  const stackCount = landed - pasted;

  // Which window is front (drives menu bar app name, focus rings, z-order).
  const phase =
    frame >= FOCUS_MAIL_AT ? 3 : frame >= FOCUS_SAFARI_AT ? 2 : frame >= FOCUS_MSGS_AT ? 1 : 0;
  const appName = ["Notes", "Messages", "Safari", "Mail"][phase];
  const z = [
    { notes: 4, msgs: 3, safari: 2, mail: 1 },
    { notes: 2, msgs: 4, safari: 3, mail: 1 },
    { notes: 2, msgs: 3, safari: 4, mail: 1 },
    { notes: 1, msgs: 2, safari: 3, mail: 4 },
  ][phase];

  const flash = interpolate(frame, [SHOT_AT + 2, SHOT_AT + 4, SHOT_AT + 10], [0, 0.9, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const endIn = interpolate(frame, [END_CARD_AT, END_CARD_AT + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoPop = springAt(frame, END_CARD_AT + 4, { damping: 12, stiffness: 120 });

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <Wallpaper />
      <MenuBar appName={appName} stackCount={stackCount} stackVisible={frame >= PANEL_IN_AT} />

      {/* Source 1: Notes */}
      <Window {...NOTES} title="Team sync" focused={phase === 0} zIndex={z.notes}>
        <div style={{ position: "absolute", left: 40, top: 76, fontSize: 28, fontWeight: 800, color: "#1d1d1f" }}>
          Team sync — notes
        </div>
        <div style={{ position: "absolute", left: 40, top: 124, fontSize: 20, color: "#8e8e93" }}>
          Attendees: Maya, Jon, Priya
        </div>
        <div
          style={{
            position: "absolute",
            left: NOTE_LINE.x - NOTES.x,
            top: NOTE_LINE.y - NOTES.y - 16,
            fontSize: 21,
            color: "#2c2c2e",
            display: "flex",
            gap: 14,
          }}
        >
          <span style={{ color: "#c7c7cc" }}>•</span>
          <span
            style={{
              background: `rgba(0, 122, 255, ${0.3 * selAt(frame, COPY_AT[0])})`,
              borderRadius: 4,
              padding: "3px 6px",
              margin: "-3px -6px",
            }}
          >
            {ITEMS[0].text}
          </span>
        </div>
        <div style={{ position: "absolute", left: 40, top: NOTE_LINE.y - NOTES.y + 60, fontSize: 20, color: "#8e8e93" }}>
          Next sync: Friday
        </div>
      </Window>

      {/* Source 2: Messages */}
      <Window {...MSGS} title="Priya" focused={phase === 1} zIndex={z.msgs}>
        <div style={{ paddingTop: 16 }}>
          <Bubble text="Are we still on for Thursday?" />
          <Bubble text="Yes! Sending the details now" mine />
          <Bubble text="Also — finance got back to us" />
          <Bubble text={ITEMS[1].text} sel={selAt(frame, COPY_AT[1])} />
        </div>
      </Window>

      {/* Source 3: Safari */}
      <Window {...SAFARI} title="" focused={phase === 2} zIndex={z.safari}>
        <UrlBar url={ITEMS[2].text} w={SAFARI.w - 300} sel={selAt(frame, COPY_AT[2])} />
        <div style={{ position: "absolute", left: 44, top: 100, fontSize: 32, fontWeight: 800, color: "#1d1d1f" }}>
          Stacked v2 — Design
        </div>
        <div style={{ position: "absolute", left: 44, top: 160, width: SAFARI.w - 88 }}>
          {[0.95, 0.8, 0.9, 0.6].map((wf, i) => (
            <div
              key={i}
              style={{
                width: `${wf * 100}%`,
                height: 15,
                borderRadius: 7,
                background: "#e7e7ea",
                marginBottom: 16,
              }}
            />
          ))}
          <div
            style={{
              width: "100%",
              height: 250,
              borderRadius: 10,
              background: "linear-gradient(135deg, #dfe6f5, #ecdff2)",
              marginTop: 10,
            }}
          />
        </div>
      </Window>

      {/* Destination: Mail compose */}
      <Window {...MAIL} title="New Message" focused={phase === 3} zIndex={z.mail}>
        {[
          ["To:", "team@acme.com"],
          ["Subject:", "Thursday — details"],
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
        <div style={{ position: "absolute", left: 32, top: 168, fontSize: 21, color: "#2c2c2e" }}>
          Hi all — everything for Thursday:
        </div>
        {ITEMS.map((item, i) => {
          if (frame < PASTE_AT[i] + FLIGHT_FRAMES) return null;
          const inP = springAt(frame, PASTE_AT[i] + FLIGHT_FRAMES);
          return item.kind === "image" ? (
            <div
              key={i}
              style={{
                position: "absolute",
                left: MAIL_LINE_X - MAIL.x,
                top: mailLineY(i) - MAIL.y - 15,
                opacity: inP,
              }}
            >
              <ScreenshotThumb w={PASTED_IMG.w} h={PASTED_IMG.h} />
            </div>
          ) : (
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
              {item.text}
            </div>
          );
        })}
        {/* blinking insertion point at the next paste target */}
        {phase === 3 && pasted < 4 && frame < END_CARD_AT && (
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
          zIndex: 10,
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
        {stackCount === 0 && frame > PASTE_AT[3] && (
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
              opacity: springAt(frame, PASTE_AT[3] + FLIGHT_FRAMES + 2),
            }}
          >
            Stack is empty
          </div>
        )}
      </div>

      {/* Panel rows (drawn above the panel so exits can fly out of it) */}
      {ITEMS.map((item, i) => {
        const landedAt = copyAt(i) + FLIGHT_FRAMES;
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
              zIndex: 10,
            }}
          >
            <ItemCard text={item.text} kind={item.kind} w={ROW_W} />
          </div>
        );
      })}

      {/* Copy flights: source → panel slot */}
      {ITEMS.slice(0, 3).map((item, i) => {
        if (frame < COPY_AT[i] || frame > COPY_AT[i] + FLIGHT_FRAMES) return null;
        const from: [number, number][] = [
          [NOTE_LINE.x, NOTE_LINE.y - ROW_H / 2],
          [MSG_BUBBLE.x, MSG_BUBBLE.y - ROW_H / 2],
          [SAFARI_URL.x, SAFARI_URL.y - ROW_H / 2],
        ];
        const f = flight(frame, COPY_AT[i], from[i], [PANEL.x + 10, rowY(i)]);
        return (
          <div key={i} style={{ position: "absolute", left: f.x, top: f.y, opacity: 1 - f.t * 0.25, zIndex: 11 }}>
            <ItemCard text={item.text} kind="text" w={ROW_W} />
          </div>
        );
      })}

      {/* Screenshot flight: shrinks from a center preview into the panel */}
      {frame >= SHOT_FLIGHT_AT && frame <= SHOT_FLIGHT_AT + FLIGHT_FRAMES && (
        (() => {
          const f = flight(frame, SHOT_FLIGHT_AT, [700, 400], [PANEL.x + 10, rowY(3)]);
          const w = 380 - (380 - 64) * f.t;
          const h = 214 - (214 - 40) * f.t;
          return (
            <div
              style={{
                position: "absolute",
                left: f.x,
                top: f.y,
                zIndex: 11,
                boxShadow: "0 12px 36px rgba(0,0,0,0.4)",
                borderRadius: 8,
              }}
            >
              <ScreenshotThumb w={w} h={h} />
            </div>
          );
        })()
      )}

      {/* Paste flights: panel top slot → mail body */}
      {ITEMS.map((item, i) => {
        if (frame < PASTE_AT[i] || frame > PASTE_AT[i] + FLIGHT_FRAMES) return null;
        const f = flight(
          frame,
          PASTE_AT[i],
          [PANEL.x + 10, rowY(0)],
          [MAIL_LINE_X, mailLineY(i) - ROW_H / 2 + 8]
        );
        return (
          <div key={i} style={{ position: "absolute", left: f.x, top: f.y, opacity: 1 - f.t * 0.5, zIndex: 11 }}>
            <ItemCard text={item.text} kind={item.kind} w={ROW_W} />
          </div>
        );
      })}

      {/* Screenshot flash */}
      {flash > 0 && (
        <AbsoluteFill style={{ background: "#ffffff", opacity: flash, zIndex: 13 }} />
      )}

      {/* Keycap overlay */}
      {keycapPop(frame, STACK_HOTKEY_AT) > 0.01 && (
        <Keycap label="⇧ ⌘ C" pop={keycapPop(frame, STACK_HOTKEY_AT)} />
      )}
      {COPY_AT.map((at, i) =>
        keycapPop(frame, at) > 0.01 ? <Keycap key={`c${i}`} label="⌘ C" pop={keycapPop(frame, at)} /> : null
      )}
      {keycapPop(frame, SHOT_AT) > 0.01 && <Keycap label="⇧ ⌘ 3" pop={keycapPop(frame, SHOT_AT)} />}
      {PASTE_AT.map((at, i) =>
        keycapPop(frame, at) > 0.01 ? <Keycap key={`v${i}`} label="⌘ V" pop={keycapPop(frame, at)} /> : null
      )}

      {/* End card */}
      {endIn > 0 && (
        <AbsoluteFill
          style={{
            background: "#101014",
            opacity: endIn,
            zIndex: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 26,
          }}
        >
          <Img
            src={staticFile("logo.png")}
            style={{
              width: 190,
              height: 190,
              transform: `scale(${0.7 + 0.3 * logoPop})`,
              opacity: logoPop,
            }}
          />
          <div style={{ fontSize: 64, fontWeight: 800, color: "#ffffff", opacity: logoPop }}>
            Try Stacked today
          </div>
          <div style={{ fontSize: 28, color: "#98989f", opacity: logoPop }}>
            Free & open source · macOS 13+
          </div>
          <div style={{ fontSize: 26, fontWeight: 600, color: "#6ea8ff", opacity: logoPop }}>
            github.com/sharnobyl/stacked
          </div>
        </AbsoluteFill>
      )}

      {/* Sound effects */}
      <Sequence from={PANEL_IN_AT}>
        <Audio src={staticFile("swish.wav")} />
      </Sequence>
      {[...COPY_AT.map((at) => at + FLIGHT_FRAMES), SHOT_FLIGHT_AT + FLIGHT_FRAMES].map((at, i) => (
        <Sequence key={`pop${i}`} from={at}>
          <Audio src={staticFile("pop.wav")} />
        </Sequence>
      ))}
      <Sequence from={SHOT_AT + 2}>
        <Audio src={staticFile("shutter.wav")} />
      </Sequence>
      {PASTE_AT.map((at, i) => (
        <Sequence key={`paste${i}`} from={at}>
          <Audio src={staticFile("paste.wav")} />
        </Sequence>
      ))}
      <Sequence from={END_CARD_AT + 2}>
        <Audio src={staticFile("chime.wav")} />
      </Sequence>
    </AbsoluteFill>
  );
};
