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
import { FONT, FPS } from "./timeline";
import {
  CAL,
  CAL_FIELD,
  CAL_FIELD_X,
  CHAT,
  CHAT_BUBBLE,
  CHAT_COPY_AT,
  DESKTOP_AT,
  EVENT,
  FOCUS_CAL_AT,
  FOCUS_CHAT_AT,
  FOCUS_MAPS_AT,
  GUESTS_TEXT,
  INTRO1,
  INTRO2,
  MAPS,
  MAPS_COPY_AT,
  MAPS_LINK,
  MAPS_URL,
  S_DURATION,
  S_END_AT,
  S_FLIGHT,
  S_HOTKEY_AT,
  S_ITEMS,
  S_PANEL,
  S_PANEL_AT,
  S_PASTE_AT,
  S_ROW_H,
  s_rowY,
  SAVE_AT,
  SAVE_BTN,
  SHOT_FLY_AT,
  SHOT_KEY_AT,
  TOAST_AT,
} from "./storyTimeline";
import { Bubble, ItemCard, Keycap, MenuBar, UrlBar, Wallpaper, Window } from "./ui";

const ROW_W = S_PANEL.w - 20;
const copyAt = [SHOT_FLY_AT, MAPS_COPY_AT, CHAT_COPY_AT];
// paste i fills: 0 → description, 1 → location, 2 → guests
const PASTE_FIELD_Y = [CAL_FIELD.description + 30, CAL_FIELD.location + 24, CAL_FIELD.guests + 24];

const springAt = (frame: number, at: number, config = { damping: 16, stiffness: 170 }) =>
  frame < at ? 0 : spring({ frame: frame - at, fps: FPS, config });

const keycapPop = (frame: number, at: number) => {
  const inP = springAt(frame, at);
  const out = interpolate(frame, [at + 13, at + 19], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return inP * out;
};

const flight = (frame: number, at: number, from: [number, number], to: [number, number]) => {
  const t = interpolate(frame, [at, at + S_FLIGHT], [0, 1], {
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

const selAt = (frame: number, at: number) =>
  springAt(frame, at - 8) *
  interpolate(frame, [at + 4, at + 10], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

// Miniature of the event page, used as the screenshot item.
const EventShot: React.FC<{ w: number; h: number }> = ({ w, h }) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: Math.max(4, w * 0.03),
      background: "#ffffff",
      overflow: "hidden",
      boxShadow: "0 0 0 1px rgba(0,0,0,0.15)",
      flexShrink: 0,
      position: "relative",
    }}
  >
    <div
      style={{
        height: "58%",
        background: "linear-gradient(120deg, #f2994a 0%, #eb5757 55%, #9b51e0 100%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: "8%",
        top: "64%",
        width: "70%",
        height: "10%",
        borderRadius: 3,
        background: "#3a3a3c",
      }}
    />
    <div
      style={{
        position: "absolute",
        left: "8%",
        top: "80%",
        width: "48%",
        height: "8%",
        borderRadius: 3,
        background: "#c7c7cc",
      }}
    />
  </div>
);

const introOpacity = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, from + 8, to - 8, to], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

export const Story: React.FC = () => {
  const frame = useCurrentFrame();

  const panelIn = springAt(frame, S_PANEL_AT, { damping: 13, stiffness: 140 });
  const landed = copyAt.filter((at) => frame >= at + S_FLIGHT).length;
  const pasted = S_PASTE_AT.filter((f) => frame >= f).length;
  const stackCount = landed - pasted;

  const phase =
    frame >= FOCUS_CAL_AT ? 3 : frame >= FOCUS_CHAT_AT ? 2 : frame >= FOCUS_MAPS_AT ? 1 : 0;
  const appName = ["Safari", "Safari", "Messages", "Safari"][phase];
  const z = [
    { event: 4, maps: 3, chat: 2, cal: 1 },
    { event: 2, maps: 4, chat: 3, cal: 1 },
    { event: 2, maps: 3, chat: 4, cal: 1 },
    { event: 1, maps: 2, chat: 3, cal: 4 },
  ][phase];

  const flash = interpolate(frame, [SHOT_KEY_AT + 4, SHOT_KEY_AT + 6, SHOT_KEY_AT + 12], [0, 0.9, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const desktopIn = interpolate(frame, [DESKTOP_AT, DESKTOP_AT + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const savePress = springAt(frame, SAVE_AT, { damping: 11, stiffness: 300 });
  const savePressScale = frame >= SAVE_AT && frame < SAVE_AT + 8 ? 0.93 : 1;
  const toastIn = springAt(frame, TOAST_AT, { damping: 13, stiffness: 160 });

  // Cursor eases onto the Save button just before the click.
  const cursorT = interpolate(frame, [SAVE_AT - 18, SAVE_AT - 2], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });
  const cursorX = CAL.x + 260 + (SAVE_BTN.x + SAVE_BTN.w / 2 - CAL.x - 260) * cursorT;
  const cursorY = CAL.y + 640 + (SAVE_BTN.y + SAVE_BTN.h / 2 - CAL.y - 640) * cursorT;

  const endIn = interpolate(frame, [S_END_AT, S_END_AT + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const logoPop = springAt(frame, S_END_AT + 4, { damping: 12, stiffness: 120 });

  const caretVisible = phase === 3 && pasted < 3 && frame < SAVE_AT;
  const caretY = PASTE_FIELD_Y[pasted] ?? 0;

  return (
    <AbsoluteFill style={{ fontFamily: FONT, background: "#101014" }}>
      {/* Desktop scene */}
      <AbsoluteFill style={{ opacity: desktopIn }}>
        <Wallpaper />
        <MenuBar appName={appName} stackCount={stackCount} stackVisible={frame >= S_PANEL_AT} />

        {/* Safari: the event page */}
        <Window {...EVENT} title="" focused={phase === 0} zIndex={z.event}>
          <UrlBar url="brooklynboulders.com/climb-night" w={EVENT.w - 300} sel={0} />
          <div
            style={{
              position: "absolute",
              left: 44,
              top: 96,
              width: EVENT.w - 88,
              height: 260,
              borderRadius: 12,
              background: "linear-gradient(120deg, #f2994a 0%, #eb5757 55%, #9b51e0 100%)",
            }}
          />
          <div style={{ position: "absolute", left: 44, top: 380, fontSize: 34, fontWeight: 800, color: "#1d1d1f" }}>
            Friday Climb Night 🧗
          </div>
          <div style={{ position: "absolute", left: 44, top: 434, fontSize: 21, color: "#6e6e73" }}>
            Brooklyn Boulders · Sat July 11, 10 AM
          </div>
          <div style={{ position: "absolute", left: 44, top: 472, fontSize: 21, color: "#6e6e73" }}>
            $25 day pass · All levels welcome
          </div>
        </Window>

        {/* Safari: Google Maps */}
        <Window {...MAPS} title="" focused={phase === 1} zIndex={z.maps}>
          <UrlBar url={MAPS_LINK} w={MAPS.w - 260} sel={selAt(frame, MAPS_COPY_AT)} />
          <div style={{ position: "absolute", left: 0, top: 48, right: 0, bottom: 0, background: "#e8e4da" }}>
            {/* water, park, roads */}
            <div style={{ position: "absolute", left: 0, bottom: 0, width: "34%", height: "42%", background: "#aad3df" }} />
            <div style={{ position: "absolute", right: "8%", top: "10%", width: "26%", height: "30%", borderRadius: 10, background: "#c9e7c0" }} />
            <div style={{ position: "absolute", left: 0, top: "38%", width: "100%", height: 14, background: "#ffffff" }} />
            <div style={{ position: "absolute", left: "46%", top: 0, width: 14, height: "100%", background: "#ffffff" }} />
            <div style={{ position: "absolute", left: "12%", top: "72%", width: "80%", height: 9, background: "#ffe49a", transform: "rotate(-7deg)" }} />
            {/* pin */}
            <div style={{ position: "absolute", left: "44.2%", top: "30%", fontSize: 46 }}>📍</div>
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "22%",
                background: "#ffffff",
                borderRadius: 8,
                padding: "8px 14px",
                fontSize: 17,
                fontWeight: 600,
                color: "#1d1d1f",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              Brooklyn Boulders <span style={{ color: "#f5a623" }}>★ 4.8</span>
            </div>
          </div>
        </Window>

        {/* Messages: the group chat */}
        <Window {...CHAT} title="The Crew 🧗" focused={phase === 2} zIndex={z.chat}>
          <div style={{ paddingTop: 16 }}>
            <Bubble text="Saturday climb — who's in?" />
            <Bubble text="🙋 me! setting up the invite" mine />
            <Bubble text="add the others too:" />
            <Bubble text={GUESTS_TEXT} sel={selAt(frame, CHAT_COPY_AT)} />
          </div>
        </Window>

        {/* Google Calendar event */}
        <Window {...CAL} title="Google Calendar" focused={phase === 3} zIndex={z.cal}>
          <div
            style={{
              position: "absolute",
              left: 40,
              top: 84,
              fontSize: 34,
              fontWeight: 700,
              color: "#1d1d1f",
              borderBottom: "2px solid #0a84ff",
              paddingBottom: 8,
              width: CAL.w - 80,
            }}
          >
            Climb Night 🧗
          </div>
          <div style={{ position: "absolute", left: 40, top: 168, fontSize: 20, color: "#6e6e73" }}>
            🕙 Saturday, July 11 · 10:00 AM – 12:00 PM
          </div>
          {(
            [
              ["👥", "Add guests", CAL_FIELD.guests, 2, GUESTS_TEXT],
              ["📍", "Add location", CAL_FIELD.location, 1, MAPS_LINK],
              ["📝", "Add description", CAL_FIELD.description, 0, ""],
            ] as const
          ).map(([icon, placeholder, y, pasteIdx, filled]) => {
            const isFilled = frame >= S_PASTE_AT[pasteIdx] + S_FLIGHT;
            const fillIn = springAt(frame, S_PASTE_AT[pasteIdx] + S_FLIGHT);
            return (
              <div key={placeholder}>
                <div style={{ position: "absolute", left: 40, top: y - CAL.y + 6, fontSize: 24 }}>{icon}</div>
                <div
                  style={{
                    position: "absolute",
                    left: CAL_FIELD_X - CAL.x,
                    top: y - CAL.y,
                    width: CAL.w - 140,
                    minHeight: 44,
                    borderBottom: pasteIdx === 0 ? "none" : "1px solid rgba(0,0,0,0.12)",
                    fontSize: 18,
                    paddingTop: 10,
                    color: isFilled && filled ? "#1d1d1f" : "#a8a8ad",
                    opacity: isFilled && filled ? fillIn : 1,
                  }}
                >
                  {isFilled ? filled : placeholder}
                </div>
                {pasteIdx === 0 && isFilled && (
                  <div
                    style={{
                      position: "absolute",
                      left: CAL_FIELD_X - CAL.x,
                      top: y - CAL.y + 44,
                      opacity: fillIn,
                    }}
                  >
                    <EventShot w={260} h={150} />
                  </div>
                )}
              </div>
            );
          })}
          {/* blinking caret in the next field to be pasted into */}
          {caretVisible && (
            <div
              style={{
                position: "absolute",
                left: CAL_FIELD_X - CAL.x,
                top: caretY - CAL.y - 12,
                width: 2.5,
                height: 30,
                background: "#0a84ff",
                opacity: Math.floor(frame / 12) % 2 === 0 ? 1 : 0,
              }}
            />
          )}
          {/* Save button */}
          <div
            style={{
              position: "absolute",
              left: SAVE_BTN.x - CAL.x,
              top: SAVE_BTN.y - CAL.y,
              width: SAVE_BTN.w,
              height: SAVE_BTN.h,
              borderRadius: 12,
              background: frame >= SAVE_AT ? "#0060df" : "#0a84ff",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 19,
              fontWeight: 700,
              transform: `scale(${savePressScale})`,
              boxShadow: "0 4px 14px rgba(10,132,255,0.4)",
            }}
          >
            Send invite
          </div>
          {/* sent toast */}
          {toastIn > 0.01 && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 20,
                transform: `translateX(-50%) scale(${0.8 + 0.2 * toastIn})`,
                opacity: toastIn,
                background: "#2e9e44",
                color: "#ffffff",
                borderRadius: 12,
                padding: "12px 22px",
                fontSize: 19,
                fontWeight: 700,
                boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                whiteSpace: "nowrap",
              }}
            >
              ✓ Invitation sent to 3 guests
            </div>
          )}
        </Window>

        {/* Stacked floating panel */}
        <div
          style={{
            position: "absolute",
            left: S_PANEL.x,
            top: S_PANEL.y,
            width: S_PANEL.w,
            height: S_PANEL.h,
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
              height: 46,
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
          {stackCount === 0 && frame > S_PASTE_AT[2] && (
            <div
              style={{
                position: "absolute",
                top: 46,
                left: 0,
                right: 0,
                bottom: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#aeaeb2",
                fontSize: 18,
                opacity: springAt(frame, S_PASTE_AT[2] + S_FLIGHT + 2),
              }}
            >
              Stack is empty
            </div>
          )}
        </div>

        {/* Panel rows */}
        {S_ITEMS.map((item, i) => {
          const landedAt = copyAt[i] + S_FLIGHT;
          if (frame < landedAt || frame >= S_PASTE_AT[i]) return null;
          const shift = S_PASTE_AT.slice(0, i).reduce(
            (acc, p) => acc + springAt(frame, p, { damping: 18, stiffness: 190 }),
            0
          );
          const pop = springAt(frame, landedAt, { damping: 12, stiffness: 200 });
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: S_PANEL.x + 10,
                top: s_rowY(i - shift),
                transform: `scale(${0.85 + 0.15 * pop})`,
                opacity: pop * panelIn,
                zIndex: 10,
              }}
            >
              <ItemCard
                text={item.text}
                kind={item.kind}
                w={ROW_W}
                icon={item.kind === "image" ? <EventShot w={34} h={34} /> : undefined}
              />
            </div>
          );
        })}

        {/* Screenshot flight: event-page preview shrinks into the panel */}
        {frame >= SHOT_FLY_AT && frame <= SHOT_FLY_AT + S_FLIGHT && (
          (() => {
            const f = flight(frame, SHOT_FLY_AT, [EVENT.x + 180, EVENT.y + 160], [S_PANEL.x + 10, s_rowY(0)]);
            const w = 400 - (400 - 64) * f.t;
            const h = 250 - (250 - 40) * f.t;
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
                <EventShot w={w} h={h} />
              </div>
            );
          })()
        )}

        {/* Copy flights for the two text items */}
        {[1, 2].map((i) => {
          if (frame < copyAt[i] || frame > copyAt[i] + S_FLIGHT) return null;
          const from: [number, number] = i === 1
            ? [MAPS_URL.x, MAPS_URL.y - S_ROW_H / 2]
            : [CHAT_BUBBLE.x, CHAT_BUBBLE.y - S_ROW_H / 2];
          const f = flight(frame, copyAt[i], from, [S_PANEL.x + 10, s_rowY(i)]);
          return (
            <div key={i} style={{ position: "absolute", left: f.x, top: f.y, opacity: 1 - f.t * 0.25, zIndex: 11 }}>
              <ItemCard text={S_ITEMS[i].text} kind="text" w={ROW_W} />
            </div>
          );
        })}

        {/* Paste flights: panel top slot → calendar field */}
        {S_ITEMS.map((item, i) => {
          if (frame < S_PASTE_AT[i] || frame > S_PASTE_AT[i] + S_FLIGHT) return null;
          const f = flight(
            frame,
            S_PASTE_AT[i],
            [S_PANEL.x + 10, s_rowY(0)],
            [CAL_FIELD_X, PASTE_FIELD_Y[i] - S_ROW_H / 2]
          );
          return (
            <div key={i} style={{ position: "absolute", left: f.x, top: f.y, opacity: 1 - f.t * 0.5, zIndex: 11 }}>
              <ItemCard
                text={item.text}
                kind={item.kind}
                w={ROW_W}
                icon={item.kind === "image" ? <EventShot w={34} h={34} /> : undefined}
              />
            </div>
          );
        })}

        {/* Cursor for the Save click */}
        {frame >= SAVE_AT - 18 && frame < S_END_AT + 6 && (
          <svg
            width="30"
            height="34"
            viewBox="0 0 30 34"
            style={{ position: "absolute", left: cursorX, top: cursorY, zIndex: 14 }}
          >
            <path
              d="M2 1 L2 26 L9 20 L14 31 L19 29 L14 18 L23 18 Z"
              fill="#000000"
              stroke="#ffffff"
              strokeWidth="1.8"
            />
          </svg>
        )}

        {/* Screenshot flash */}
        {flash > 0 && <AbsoluteFill style={{ background: "#ffffff", opacity: flash, zIndex: 13 }} />}

        {/* Keycaps */}
        {keycapPop(frame, S_HOTKEY_AT) > 0.01 && <Keycap label="⇧ ⌘ C" pop={keycapPop(frame, S_HOTKEY_AT)} />}
        {keycapPop(frame, SHOT_KEY_AT) > 0.01 && <Keycap label="⇧ ⌘ 3" pop={keycapPop(frame, SHOT_KEY_AT)} />}
        {[MAPS_COPY_AT, CHAT_COPY_AT].map((at, i) =>
          keycapPop(frame, at) > 0.01 ? <Keycap key={`c${i}`} label="⌘ C" pop={keycapPop(frame, at)} /> : null
        )}
        {S_PASTE_AT.map((at, i) =>
          keycapPop(frame, at) > 0.01 ? <Keycap key={`v${i}`} label="⌘ V" pop={keycapPop(frame, at)} /> : null
        )}
      </AbsoluteFill>

      {/* Intro cards */}
      {frame < DESKTOP_AT + 14 && (
        <AbsoluteFill
          style={{
            background: "#101014",
            opacity: interpolate(frame, [DESKTOP_AT, DESKTOP_AT + 12], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            zIndex: 25,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              textAlign: "center",
              opacity: introOpacity(frame, INTRO1.from, INTRO1.to),
              color: "#ffffff",
            }}
          >
            <div style={{ fontSize: 68, fontWeight: 800 }}>Saturday: climbing with the crew 🧗</div>
            <div style={{ fontSize: 32, color: "#98989f", marginTop: 22 }}>Time to send the invite.</div>
          </div>
          <div
            style={{
              position: "absolute",
              textAlign: "center",
              opacity: introOpacity(frame, INTRO2.from, INTRO2.to),
              color: "#ffffff",
              maxWidth: 1250,
            }}
          >
            <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.25 }}>
              The event, the directions, the people —
              <br />
              <span style={{ color: "#6ea8ff" }}>all in different apps.</span>
            </div>
          </div>
        </AbsoluteFill>
      )}

      {/* End card */}
      {endIn > 0 && (
        <AbsoluteFill
          style={{
            background: "#101014",
            opacity: endIn,
            zIndex: 30,
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
            Copy everything. Paste it out in order. Free & open source.
          </div>
          <div style={{ fontSize: 26, fontWeight: 600, color: "#6ea8ff", opacity: logoPop }}>
            github.com/sharnobyl/stacked
          </div>
        </AbsoluteFill>
      )}

      {/* Music + sound effects */}
      <Audio src={staticFile("music.wav")} volume={0.85} />
      <Sequence from={S_PANEL_AT}>
        <Audio src={staticFile("swish.wav")} />
      </Sequence>
      <Sequence from={SHOT_KEY_AT + 4}>
        <Audio src={staticFile("shutter.wav")} />
      </Sequence>
      {copyAt.map((at, i) => (
        <Sequence key={`pop${i}`} from={at + S_FLIGHT}>
          <Audio src={staticFile("pop.wav")} />
        </Sequence>
      ))}
      {S_PASTE_AT.map((at, i) => (
        <Sequence key={`paste${i}`} from={at}>
          <Audio src={staticFile("paste.wav")} />
        </Sequence>
      ))}
      <Sequence from={SAVE_AT}>
        <Audio src={staticFile("click.wav")} />
      </Sequence>
      <Sequence from={S_END_AT + 6}>
        <Audio src={staticFile("chime.wav")} />
      </Sequence>
    </AbsoluteFill>
  );
};
