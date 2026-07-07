// V2 "calendar invite" story — all frames and coordinates.

export const S_DURATION = 480; // 16s @ 30fps

// --- Intro cards ---
export const INTRO1 = { from: 0, to: 52 }; // "The plan: Saturday climb"
export const INTRO2 = { from: 50, to: 100 }; // "The problem: ..."
export const DESKTOP_AT = 98; // desktop fades in

// --- Stack events ---
export const S_HOTKEY_AT = 112; // ⇧⌘C
export const S_PANEL_AT = 118;
export const SHOT_KEY_AT = 132; // ⇧⌘3 over the event page
export const SHOT_FLY_AT = 142;
export const FOCUS_MAPS_AT = 160;
export const MAPS_COPY_AT = 178;
export const FOCUS_CHAT_AT = 196;
export const CHAT_COPY_AT = 214;
export const FOCUS_CAL_AT = 232;
export const S_PASTE_AT = [244, 268, 292]; // screenshot→description, maps→location, emails→guests
export const SAVE_AT = 318; // Save button click
export const TOAST_AT = 324; // "Invitation sent"
export const S_END_AT = 356; // end card fade-in
export const S_FLIGHT = 9;

// --- Layout ---
export const EVENT = { x: 140, y: 80, w: 760, h: 600 }; // Safari: event page
export const MAPS = { x: 320, y: 320, w: 720, h: 550 }; // Safari: Google Maps
export const CHAT = { x: 90, y: 410, w: 560, h: 470 }; // Messages group chat
export const CAL = { x: 970, y: 100, w: 600, h: 810 }; // Google Calendar event
export const S_PANEL = { x: 1596, y: 100, w: 284, h: 350 };
export const S_ROW_H = 58;
export const s_rowY = (pos: number) => S_PANEL.y + 46 + 10 + pos * (S_ROW_H + 8);

// Copy-source anchor points (vertical centers of copied content)
export const MAPS_URL = { x: MAPS.x + 180, y: MAPS.y + 48 + 27 };
export const CHAT_BUBBLE = { x: CHAT.x + 24, y: CHAT.y + 48 + 250 };

// Calendar field rows (top edge, in canvas coords)
export const CAL_FIELD = {
  guests: CAL.y + 250,
  location: CAL.y + 350,
  description: CAL.y + 450,
};
export const CAL_FIELD_X = CAL.x + 90;
export const SAVE_BTN = { x: CAL.x + CAL.w - 170, y: CAL.y + CAL.h - 80, w: 140, h: 48 };

export const S_ITEMS = [
  { text: "Screenshot — Climb Night", kind: "image" as const },
  { text: "maps.google.com/?q=Brooklyn+Boulders", kind: "text" as const },
  { text: "maya@gmail.com, jon@gmail.com, priya@…", kind: "text" as const },
];
export const GUESTS_TEXT = "maya@gmail.com, jon@gmail.com, priya@gmail.com";
export const MAPS_LINK = "maps.google.com/?q=Brooklyn+Boulders";
