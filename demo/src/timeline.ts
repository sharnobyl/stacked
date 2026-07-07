// Every coordinate and event frame in the demo, in one place.

export const WIDTH = 1920;
export const HEIGHT = 1080;
export const FPS = 30;
export const DURATION = 300; // 10s

// --- Event frames ---
export const STACK_HOTKEY_AT = 6; // ⇧⌘C keycap appears
export const PANEL_IN_AT = 12; // panel springs in
export const COPY_AT = [34, 64, 96]; // ⌘C in Notes, Messages, Safari
export const SHOT_AT = 112; // ⇧⌘3 screenshot keycap
export const SHOT_FLIGHT_AT = 118; // screenshot thumb starts flying
export const PASTE_AT = [148, 170, 192, 214]; // ⌘V presses in Mail
export const END_CARD_AT = 252; // end card fade-in starts
export const FLIGHT_FRAMES = 9; // card travel time (both directions)

// When each source window comes to the front.
export const FOCUS_MSGS_AT = 50;
export const FOCUS_SAFARI_AT = 80;
export const FOCUS_MAIL_AT = 138;

// --- Layout ---
export const MENUBAR_H = 38;

export const NOTES = { x: 90, y: 80, w: 600, h: 430 };
export const MSGS = { x: 200, y: 430, w: 560, h: 450 };
export const SAFARI = { x: 330, y: 190, w: 750, h: 560 };
export const MAIL = { x: 960, y: 130, w: 600, h: 780 };
export const PANEL = { x: 1596, y: 100, w: 284, h: 440 };

export const TITLEBAR_H = 48;
export const PANEL_HEADER_H = 46;
export const ROW_H = 58;
export const ROW_GAP = 8;
// top edge of panel row at display position `pos`
export const rowY = (pos: number) => PANEL.y + PANEL_HEADER_H + 10 + pos * (ROW_H + ROW_GAP);

// Copy sources: vertical center of the copied content, per item.
export const NOTE_LINE = { x: NOTES.x + 40, y: NOTES.y + TITLEBAR_H + 160 };
export const MSG_BUBBLE = { x: MSGS.x + 24, y: MSGS.y + TITLEBAR_H + 210 };
export const SAFARI_URL = { x: SAFARI.x + 180, y: SAFARI.y + TITLEBAR_H + 27 };

// Mail body: vertical center of pasted line i (item 3 is the screenshot image).
export const MAIL_LINE_X = MAIL.x + 32;
export const mailLineY = (i: number) => MAIL.y + TITLEBAR_H + 46 + 46 + 100 + i * 62;
export const PASTED_IMG = { w: 250, h: 140 };

export const ITEMS = [
  { text: "Kickoff moved to Tue, 10am", kind: "text" as const },
  { text: "Budget approved 🎉", kind: "text" as const },
  { text: "figma.com/design/stacked-v2", kind: "text" as const },
  { text: "Screenshot", kind: "image" as const },
];

export const FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif";
