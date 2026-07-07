// Every coordinate and event frame in the demo, in one place.

export const WIDTH = 1920;
export const HEIGHT = 1080;
export const FPS = 30;
export const DURATION = 144; // 4.8s

// --- Event frames ---
export const STACK_HOTKEY_AT = 4; // ⇧⌘C keycap appears
export const PANEL_IN_AT = 10; // panel springs in
export const COPY_AT = [26, 46, 66]; // ⌘C presses
export const PASTE_AT = [88, 104, 120]; // ⌘V presses
export const FLIGHT_FRAMES = 9; // card travel time (both directions)

// --- Layout ---
export const MENUBAR_H = 38;

export const NOTES = { x: 120, y: 130, w: 760, h: 740 };
export const NOTES_TITLEBAR_H = 48;
// vertical center of snippet line i inside the Notes window
export const noteLineY = (i: number) => NOTES.y + NOTES_TITLEBAR_H + 150 + i * 96;
export const NOTE_LINE_X = NOTES.x + 40;

export const MAIL = { x: 940, y: 170, w: 600, h: 620 };
export const MAIL_TITLEBAR_H = 48;
// vertical center of pasted body line i inside the Mail window
export const mailLineY = (i: number) => MAIL.y + MAIL_TITLEBAR_H + 46 + 46 + 100 + i * 66;
export const MAIL_LINE_X = MAIL.x + 32;

export const PANEL = { x: 1596, y: 110, w: 284, h: 420 };
export const PANEL_HEADER_H = 46;
export const ROW_H = 58;
export const ROW_GAP = 8;
// top edge of panel row at display position `pos`
export const rowY = (pos: number) => PANEL.y + PANEL_HEADER_H + 10 + pos * (ROW_H + ROW_GAP);

export const SNIPPETS = [
  "Kickoff moved to Tue, 10am",
  "Budget approved: $48k",
  "figma.com/design/stacked-v2",
];

export const FONT =
  "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif";
