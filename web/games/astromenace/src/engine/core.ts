// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later): the platform layer the game code
// calls (vw_GetTimeThread and friends of src/core/time_thread, the input state of src/platform and
// src/core, the text table of src/core/text/text.cpp). Time is SDL_GetTicks()-like whole milliseconds
// from a clock the browser front end (or a test) drives. Changed for the browser by the freegames
// project, 2026.

// ---- time (core/time_thread/time_thread.cpp)

export const clock = { ticks: 0 };
export const SDL_GetTicks = (): number => clock.ticks;

interface TimeThread { Paused: boolean; LastGetTicks: number; DiffGetTicks: number; Speed: number; Buffer: number }
const threads = new Map<number, TimeThread>();

export function vw_InitTimeThread(n: number): void {
  threads.set(n, { Paused: false, LastGetTicks: 0, DiffGetTicks: 0, Speed: 1, Buffer: 0 });
}

export function vw_ReleaseAllTimeThread(): void {
  threads.clear();
}

export function vw_GetTimeThread(n: number): number {
  const t = threads.get(n);
  if (!t) return 0;
  if (t.Speed !== 1) return Math.fround(Math.fround((clock.ticks - t.DiffGetTicks) * t.Speed) / 1000) + t.Buffer;
  return t.Buffer + Math.fround((clock.ticks - t.DiffGetTicks) / 1000);
}

export function vw_PauseTimeThreads(): void {
  for (const t of threads.values()) {
    if (!t.Paused) {
      t.LastGetTicks = clock.ticks;
      t.Paused = true;
    }
  }
}

export function vw_ResumeTimeThreads(): void {
  for (const t of threads.values()) {
    if (t.Paused) {
      t.DiffGetTicks += clock.ticks - t.LastGetTicks;
      t.Paused = false;
    }
  }
}

export function vw_SetTimeThreadSpeed(n: number, speed: number): void {
  const t = threads.get(n);
  if (!t) return;
  t.Buffer += Math.fround(Math.fround((clock.ticks - t.DiffGetTicks) * t.Speed) / 1000);
  t.DiffGetTicks = clock.ticks;
  t.Speed = Math.fround(speed);
}

// ---- input (platform/ and core/ key, mouse state)

const keys = new Set<number>();
export const mouse = {
  x: 0,
  y: 0,
  buttons: new Set<number>(),
  leftClick: false,
  rightClick: false,
  leftDoubleClick: false,
  wheel: 0,
  /** a typed character for text input (the profile name) */
  typed: [] as string[],
};

export const vw_GetKeyStatus = (k: number): boolean => keys.has(k);
export const vw_SetKeyStatus = (k: number, down: boolean): void => { if (down) keys.add(k); else keys.delete(k); };
export const vw_SetKeyReleased = (k: number): void => { keys.delete(k); };
export const vw_KeyboardStatus = (): number[] => [...keys];
export const vw_GetMousePos = (): [number, number] => [mouse.x, mouse.y];
export const vw_GetMouseButtonStatus = (b: number): boolean => mouse.buttons.has(b);

/** vw_GetMouseLeftClick(ResetStatus) */
export function vw_GetMouseLeftClick(reset: boolean): boolean {
  const v = mouse.leftClick;
  if (reset) mouse.leftClick = false;
  return v;
}
export function vw_GetMouseRightClick(reset: boolean): boolean {
  const v = mouse.rightClick;
  if (reset) mouse.rightClick = false;
  return v;
}
export function vw_GetMouseLeftDoubleClick(reset: boolean): boolean {
  const v = mouse.leftDoubleClick;
  if (reset) mouse.leftDoubleClick = false;
  return v;
}
export const vw_ResetMouseButtons = (): void => {
  mouse.buttons.clear();
  mouse.leftClick = mouse.rightClick = mouse.leftDoubleClick = false;
};
export const vw_GetWheelStatus = (): number => mouse.wheel;
export const vw_ResetWheelStatus = (): void => { mouse.wheel = 0; };
/** vw_MouseOverRect: is the mouse inside the rectangle (inclusive edges, as the original) */
export function vw_MouseOverRect(r: { left: number; top: number; right: number; bottom: number }): boolean {
  return mouse.x >= r.left && mouse.x <= r.right && mouse.y >= r.top && mouse.y <= r.bottom;
}
export const vw_GetCurrentUnicodeChar = (): string => mouse.typed.shift() ?? '';
export const vw_SetCurrentUnicodeChar = (_c: string): void => { mouse.typed.length = 0; };

// ---- text (core/text/text.cpp)

const table: Map<string, string>[] = [];
let currentLanguage = 0;

/** vw_InitText: the .csv with one column per language, ';' separated, '\n' at the line ends */
export function vw_InitText(data: Uint8Array): void {
  table.length = 0;
  currentLanguage = 0;
  const sep = 59; // ';'
  const eol = 10; // '\n'
  const dec = new TextDecoder();
  let rowCode = '';
  let needRowCode = true;
  let col = 0;
  for (let i = 0; i < data.length; i++) {
    for (; i < data.length && data[i] !== eol; i++) {
      const bytes: number[] = [];
      const quoted = data[i] === 34;
      if (quoted) i++;
      for (; ((!quoted && data[i] !== sep && data[i] !== eol) || (quoted && data[i] !== 34)) && i < data.length; i++) {
        if (bytes.length && bytes[bytes.length - 1] === 92 && data[i] === 110) bytes[bytes.length - 1] = 10;
        else bytes.push(data[i]);
      }
      if (quoted) i++;
      const block = dec.decode(new Uint8Array(bytes));
      if (needRowCode) {
        rowCode = block;
        needRowCode = false;
      }
      if (!table[col]) table[col] = new Map();
      table[col].set(rowCode, block);
      col++;
      if (table[col]?.has(rowCode)) {
        for (; i < data.length && data[i] !== eol; i++) { /* skip the duplicate's rest */ }
      }
      if (data[i] === eol) break;
    }
    col = 0;
    needRowCode = true;
  }
}

export const vw_GetLanguageListCount = (): number => (table.length ? table.length : 1);
export const vw_SetTextLanguage = (l: number): void => { currentLanguage = l; };

/** vw_GetText (the language, or the current one); unknown ids are returned unchanged */
export function vw_GetText(id: string, language = -1): string {
  if (language < 0 || language > vw_GetLanguageListCount()) language = currentLanguage;
  const v = table[language]?.get(id);
  if (v !== undefined) return v;
  for (let i = 0; i < vw_GetLanguageListCount(); i++) {
    if (!table[i]) table[i] = new Map();
    table[i].set(id, id);
  }
  return id;
}
