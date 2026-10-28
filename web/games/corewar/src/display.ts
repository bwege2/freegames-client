// What the simulator, cdb and pmars.c call of the X11 display (xwindisp.h, xwindisp.c). The browser's
// is the canvas in xwindisp.ts; the tests use recording ones (test/record.ts), like the oracle's
// xwinrec.c.
export interface XDisplay {
  /** display_init(): xWin_open_graphics() */
  open_graphics(): Promise<void>;
  /** display_clear(): a round starts */
  display_clear(): void;
  /** display_cycle(), before every instruction; true: the simulator awaits pause() before going on */
  display_cycle(): boolean;
  pause(): Promise<void>;
  display_read(addr: number): void;
  display_dec(addr: number): void;
  display_inc(addr: number): void;
  display_write(addr: number): void;
  display_exec(addr: number): void;
  display_spl(warrior: number, tasks: number): void;
  display_dat(addr: number, warNum: number, tasks: number): void;
  /** xWin_display_close(WAIT or NOWAIT): WAIT shows "Press any key .." and waits for one */
  display_close(wait: boolean): Promise<void>;
  /** xWin_puts(): text into the current panel (cdb) */
  puts(s: string): void;
  /** xWin_gets(): a line typed into the panel, with its '\n'; null at EOF (redirected input) */
  gets(maxchar: number): Promise<string | null>;
  write_menu(): void;
  /** xWin_clear(): clear the current panel */
  clear(): void;
  /** xWin_update(panel): 0 one panel, 1 left, 2 right */
  update(panel: number): void;
  resize(): void;
  /** xWinTextLines: cdb's page length */
  readonly textLines: number;
}

/** graphio_init()'s layout of the window (xwindisp.c), for a window of xDim x yDim and a font */
export interface Layout {
  size: number;
  verticalSize: number;
  leftUpperX: number;
  leftUpperY: number;
  cycleY: number;
  splY: number[];
  cycleRatio: number;
  processRatio: number;
  grwindy0: number;
  grwindy1: number;
  textLines: number;
}

/** init_xwin()'s window size for -v's display mode */
export function window_size(displayMode: number): [number, number] {
  switch (displayMode) {
    case 1: return [640, 480];
    case 2: return [800, 600];
    case 3: return [1024, 768];
    case 4: return [640, 200];
    case 5: return [640, 350];
    case 6: return [320, 200];
    case 7: return [1280, 960];
    default: return [640, 480];
  }
}

/**
 * The font init_xwin() finds: the largest "-*-fixed-medium-r-normal--<n>-*" from xsize/40 down to 9
 * on an X server with the misc-fixed fonts (20: 10x20, 18: 9x18, 15: 9x15, 14: 7x14, 13: 8x13,
 * 10: 6x10), else "fixed" (6x13).
 */
export function font_metrics(xsize: number): { width: number; ascent: number; descent: number } {
  const fonts: [number, number, number, number][] = [[20, 10, 16, 4], [18, 9, 14, 4], [15, 9, 12, 3], [14, 7, 11, 3], [13, 8, 11, 2], [10, 6, 8, 2]];
  for (let f = Math.trunc(xsize / 40); f > 8; f--)
    for (const [px, w, a, d] of fonts) if (px === f) return { width: w, ascent: a, descent: d };
  return { width: 6, ascent: 11, descent: 2 };
}

/** xWin_open_graphics() and graphio_init(): where the arena, the meters and the text panel are */
export function layout(xDim: number, yDim: number, font: { ascent: number; descent: number }, warriors: number,
  coreSize: number, cycles: bigint, taskNum: number): Layout {
  const MAXWARRIOR = 36;
  const splY = new Array<number>(MAXWARRIOR).fill(0);
  if (warriors <= 2) {
    splY[0] = font.ascent + font.descent + 1;
    splY[1] = splY[0] + 2;
  } else for (let i = 0; i < 21; i++) splY[i] = warriors <= 10 ? 2 * i + 1 : i + 1;
  const leftUpperX = 5;
  const leftUpperY = splY[warriors - 1] + 15;
  const cycleY = leftUpperY - 10;
  const borderWidth = 3;
  const verspace = font.ascent + font.descent;
  let size = 40, verticalSize: number;
  const ykoord = (addr: number) => leftUpperY + Math.trunc(addr / verticalSize) * (size + 1);
  do {
    --size;
    verticalSize = Math.trunc((xDim - 2 * leftUpperX) / (size + 1));
  } while (ykoord(coreSize) > Math.trunc((2 * yDim) / 3) && size > 1);
  let cycleRatio = Number((2n * BigInt(warriors) * cycles) / BigInt(yDim));
  if (cycleRatio === 0) cycleRatio = 1;
  let processRatio = Math.trunc(taskNum / yDim);
  if (processRatio === 0) processRatio = 1;
  const grwindy0 = ykoord(coreSize) + 2 * borderWidth + size + verspace + 4;
  const grwindy1 = yDim - verspace;
  const textLines = Math.trunc((yDim - grwindy0) / verspace);
  return { size, verticalSize, leftUpperX, leftUpperY, cycleY, splY, cycleRatio, processRatio, grwindy0, grwindy1, textLines };
}
