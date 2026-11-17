// No Gravity port (GPL-3.0-or-later; translated in 2026 by the freegames project from realtech VR's
// No Gravity 2.0, GPL-2.0-or-later; LICENSE.md): the drop-down console (src/console.c), opened with
// the key left of 1 (s_tilda): the game's messages, and commands such as "god", "stealth", "/cheat".
import { sKEY, sKEY_IsClicked, s, timer_ms } from '../sys/sys.ts';
import { GX, gi, CSP_Color, DrawText, csp, type SpriteGroup } from '../gx/gx.ts';

const lines: string[] = [];
let current = -1;
const cmds: { name: string; fn: (parms: string | null) => void }[] = [];
let input = '';
let numLines = 0, scanCode = 0, active = false;
let x0 = 0, y0 = 0, w0 = 0, h0 = 0, cHd = 0, cH = 0;
let font: SpriteGroup | null = null;

export function conPrint(msg: string): void {
  lines.push(msg.slice(0, 511));
  current = lines.length - 1;
}
export const conLines = (): readonly string[] => lines;
export const conIsActive = (): boolean => active;
export function conToggle(): void {
  if (!cHd) { cHd = 16; active = true; } else cHd = -cHd;
}
export function conHandleInput(): void {
  cH += cHd;
  if (cH < 0) { cH = 0; active = false; cHd = 0; }
  if (cH > h0) cH = h0;
  if (sKEY_IsClicked(s.tilda)) { conToggle(); return; }
  if (!active) return;
  if (sKEY.scanCode === scanCode) return;
  scanCode = sKEY.scanCode;
  switch (sKEY.scanCode) {
    case s.space: if (input.length < 510) input += ' '; break;
    case s.delete: case s.backspace: input = input.slice(0, -1); break;
    case s.tilda: break;
    case s.return: conPrint(input); conParse(input); input = ''; break;
    case s.down: if (current < lines.length - 1) current++; break;
    case s.pagedown: current = Math.min(lines.length - 1, current + numLines); break;
    case s.up: if (current > 0) current--; break;
    case s.pageup: current = Math.max(0, current - numLines); break;
    case s.end: current = lines.length - 1; break;
    case s.home: current = 0; break;
    case s.esc: active = false; break;
    default:
      if (input.length < 510 && sKEY.charCode) input += String.fromCharCode(sKEY.charCode);
      break;
  }
}
export function conBindCmd(name: string, fn: (parms: string | null) => void): void { cmds.push({ name, fn }); }
export function conParse(cmd: string): number {
  const tok = cmd.split(' ').filter((t) => t);
  if (!tok.length) return -2;
  const c = cmds.find((x) => x.name === tok[0]);
  if (!c) return -1;
  c.fn(tok[1] ?? null);
  return 0;
}
export function conCreate(): void {
  conBindCmd('/clear', () => { lines.length = 0; current = -1; });
  conBindCmd('/close', () => { active = false; });
  conBindCmd('/cmdlist', () => { for (const c of cmds) conPrint(c.name); conPrint(`${cmds.length} command(s) found`); });
  conBindCmd('/cvarlist', () => conPrint('0 var(s) found'));
  conBindCmd('/condump', () => conPrint("Can't write file"));
}
export function conSetLimits(x: number, y: number, w: number, h: number): void {
  x0 = x; y0 = y; w0 = w; h0 = h;
  if (font) numLines = Math.trunc(h / font.item[0].LY);
}
export function conSetFont(f: SpriteGroup): void { font = f; }
export function conRender(): void {
  if (!active || !font) return;
  const left = x0 + 10, top = y0 + 10, bottom = y0 + cH - 10;
  let y = bottom - font.item[0].LY;
  CSP_Color(0);
  GX.csp_cfg.alpha = 128;
  gi.drawShadedRect(x0, y0, w0, cH);
  CSP_Color(0xffffff);
  const v = font.item[0].LY + 1;
  if (y >= top) { DrawText(input + (timer_ms() % 1000 < 500 ? '_' : ' '), left, y, font, csp.put); y -= v; }
  for (let i = current; i >= 0; i--) {
    y -= v;
    if (y < top) break;
    DrawText(lines[i], left, y, font, csp.put);
  }
}
