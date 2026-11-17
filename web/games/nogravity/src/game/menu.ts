// No Gravity port (GPL-3.0-or-later; translated in 2026 by the freegames project from realtech VR's
// No Gravity 2.0, GPL-2.0-or-later; LICENSE.md): the menus (src/lt_menu.c) on the zones of gui_os.c
// (RW_Interface_Scan: up/down or left/right, Enter, Esc and the mouse): main menu, pilots, episodes,
// the mission map with the ship choice, the briefing, options, hall of fame, help, credits, the end of
// a mission.
import {
  GX, csp, gi, CSP_Color, rgb, DrawText, DrawTextC, WriteText, WriteCenterText, DrawCenterText, TxLen,
  type Sprite, type SpriteGroup,
} from '../gx/gx.ts';
import {
  Flip, sKEY, sMOU, sKEY_IsClicked, sKEY_IsHeld, sMOU_IsHeld, sMOU_IsClicked, sMOU_IsReleased, s, timer_ms, timer_sec,
  timer_Start, STUB_TaskControl, fileText, SCAN_NAMES,
} from '../sys/sys.ts';
import { loadTextList, fgetsLines } from '../sys/ini.ts';
import {
  loadBackground, loadSpriteGroup, flcSpriteGroup, interfaceFromSpc, T, setLanguage, g_szLanguageList, readMissionList,
  highScoresUpdate, rosterSaveSlot,
} from './data.ts';
import { conHandleInput, conIsActive, conRender, conSetLimits, conPrint } from './console.ts';
import {
  NG_AudioPlaySound, NG_AudioGetByName, NG_AudioBeep, NG_AudioPlayTrack, NG_AudioStopMusic, NG_AudioStopTrack, NG_AudioSetMusicVolume,
} from './sound.ts';
import { NG_DrawBackgroundPic, NG_PlayTheEnd, NG_WaitForKeyPress } from './video.ts';
import { persist } from './persist.ts';
import {
  G, g_SGSettings, g_SGGame, type RWInterface, type SGMenu, RW_VERT, RW_HORIZ, RW_BOTH, MAX_SAVE_GAMES, MAX_GAME_EPISODE,
  Ms_MENU1, Ms_CREDITS, Ms_SUCCESS, LK_MAX,
} from './state.ts';

// ---------------------------------------------------------------- colours and the fade-in
let g_cFadeValue = 0, g_cFadeValueDir = 0;
export let gamma = 1;
export function setGamma(g: number): void { gamma = g; }
const xMUL8 = (a: number, b: number): number => ((a * b) >>> 8);
export function NG_PixelFormat(r: number, g: number, b: number): number {
  return rgb(Math.min(255, gamma + xMUL8(r, g_cFadeValue)), Math.min(255, gamma + xMUL8(g, g_cFadeValue)), Math.min(255, gamma + xMUL8(b, g_cFadeValue)));
}
let COLOR_WHITE = 0, COLOR_GRAY = 0, COLOR_GRAY1 = 0, COLOR_GRAY2 = 0, COLOR_GRAY3 = 0, COLOR_GRAY4 = 0, COLOR_BLUE = 0;
export function NG_UpdateColor(): void {
  COLOR_WHITE = NG_PixelFormat(255, 255, 255); COLOR_GRAY = NG_PixelFormat(180, 180, 190); COLOR_GRAY1 = NG_PixelFormat(100, 100, 110);
  COLOR_GRAY2 = NG_PixelFormat(180, 180, 190); COLOR_GRAY3 = NG_PixelFormat(180, 180, 255); COLOR_GRAY4 = NG_PixelFormat(210, 210, 220);
  COLOR_BLUE = NG_PixelFormat(0, 0, 180);
  if (!g_cFadeValueDir) g_cFadeValueDir = 8;
  g_cFadeValue += g_cFadeValueDir;
  if (g_cFadeValue > 255) g_cFadeValue = 255;
  if (g_cFadeValue < 0) g_cFadeValue = 0;
}
export function NG_ResetColor(): void { g_cFadeValue = 0; g_cFadeValueDir = 8; NG_UpdateColor(); }

// ---------------------------------------------------------------- the menu screen
const P = {
  Xtitle: 220, Ytitle: 60, item2X: 60, item1X: 132, XZoneMin: 30, YZoneMin: 150, YZoneSize: 285, Width2: 280, captionX: 84, captionY: 398,
  YZoneMax: 463, Font: null as unknown as SpriteGroup, name: '', menu: [] as string[], def: 0, defColor: 0, HSpacing: 0, Help: 0,
  pMenu: [] as SGMenu[],
};
let g_csBackground: Sprite | null = null;
const cursor = { pShapeAnim: null as SpriteGroup | null, pSelectAnim: null as SpriteGroup | null, Frame: 0, Frame2: 0, Time: 0, Time2: 0, Mode: 0, Max: 0, desp: null as SpriteGroup | null };
let g_pRewards: SpriteGroup;
let shipAnims: SpriteGroup[] = [];
let g_nShipAnim = 0;
const RW = { pFont: null as unknown as SpriteGroup, isMouseHidden: 0, isLocked: 0, insideMouse: 0, dx: 0, dy: 0, ch: 0, current: 0, key: 0, szInputText: '' };

const GAMEVERSION = 'v2.00';
function NG_RenderingBackground(): void {
  csp.zoom_pset(g_csBackground!, 0, 0, GX.View.lWidth, GX.View.lHeight);
  if (P.Help === 1) {
    DrawTextC(T(163) + T(164), P.XZoneMin, P.YZoneMax, COLOR_GRAY, COLOR_WHITE, P.Font, csp.put);
    const tex = GAMEVERSION.slice(0, 5);
    DrawTextC(tex, GX.View.xmax - TxLen(tex, P.Font) - 4, P.YZoneMax, COLOR_GRAY, COLOR_WHITE, P.Font, csp.put);
  }
  if (P.Help === 2) DrawTextC('3D driver : ~OpenGL~', P.XZoneMin, P.YZoneMax, COLOR_GRAY, COLOR_WHITE, P.Font, csp.put);
  if (P.Help === 4) DrawTextC('Display driver : ~SDL~', P.XZoneMin, P.YZoneMax, COLOR_GRAY, COLOR_WHITE, P.Font, csp.put);
  if (P.Help === 3) DrawTextC('Sound driver : ~SDL_mixer~', P.XZoneMin, P.YZoneMax, COLOR_GRAY, COLOR_WHITE, P.Font, csp.put);
  CSP_Color(COLOR_WHITE);
}
function NG_LoadMenuInterface(): void {
  g_pRewards = loadSpriteGroup('medaille', 0);
  g_pRewards.HSpacing = 2;
  shipAnims = ['viper', 'raiden', 'raptor'].map((n) => flcSpriteGroup(`menu/${n}.flc`));
  cursor.pSelectAnim = flcSpriteGroup('menu/select.flc');
  cursor.pShapeAnim = flcSpriteGroup('menu/shape.flc');
  cursor.Frame2 = 0; cursor.Frame = 0;
  P.YZoneMax = GX.View.ymax - 16;
  P.Font = G.g_pFont;
}
function NG_GetCursorSprite(): Sprite {
  const g = cursor.pShapeAnim!;
  if (timer_ms() - cursor.Time > g.speed) { cursor.Frame++; cursor.Time = timer_ms(); }
  if (cursor.Frame >= g.maxItem) cursor.Frame = 0;
  return g.item[cursor.Frame];
}
function NG_GetCursorSprite2(): Sprite {
  const g = cursor.pSelectAnim!;
  if (timer_ms() - cursor.Time2 > g.speed) { cursor.Frame2++; cursor.Time2 = timer_ms(); }
  if (cursor.Frame2 >= g.maxItem) cursor.Frame2 = 0;
  return g.item[cursor.Frame2];
}
function GX_DrawBoxEffect3D(x: number, y: number, lx: number, ly: number): void {
  gi.drawHorizontalLine(x - 1, y - 1, lx + 3, COLOR_GRAY1);
  gi.drawHorizontalLine(x - 1, y + ly + 1, lx + 3, COLOR_GRAY2);
  gi.drawVerticalLine(x - 1, y - 1, ly + 2, COLOR_GRAY1);
  gi.drawVerticalLine(x + lx + 1, y - 1, ly + 2, COLOR_GRAY2);
}
let OldCurs = -1;
function RW_RenderSelection(I: RWInterface): number {
  let ret = 0;
  const sp = NG_GetCursorSprite();
  const b = I.item[RW.current];
  if (!b) return 0;
  const x = b.X - (b.X > 0 ? 1 : 0);
  let yy = GX.View.ymin + b.Y - (b.Y > 0 ? 1 : 0);
  GX.csp_cfg.alpha = 0x80;
  CSP_Color(COLOR_BLUE);
  gi.drawShadedRect(x, yy - 1, x + b.LX, yy + b.LY + 1);
  GX_DrawBoxEffect3D(x, yy, b.LX, b.LY);
  yy -= (sp.LY - b.LY) >> 1;
  CSP_Color(COLOR_WHITE);
  csp.put(x - sp.LX - 2, yy, sp);
  if (cursor.Mode === 2) csp.put(x + b.LX + 2, yy, cursor.pShapeAnim!.item[cursor.pShapeAnim!.maxItem - cursor.Frame - 1]);
  if (RW.current !== OldCurs) { OldCurs = RW.current; ret = 1; }
  CSP_Color(COLOR_WHITE);
  if (!RW.isMouseHidden) csp.put(sMOU.x, sMOU.y, G.g_pFontMenuLrg.item[54]);
  if (conIsActive()) conRender();
  return ret;
}
const newInterface = (mode: number): RWInterface => ({ numItem: 0, item: [], keymode: mode });
function zone(I: RWInterface, x: number, y: number, lx: number, ly: number): void { I.item.push({ X: x, Y: y, LX: lx, LY: ly, parent: null }); I.numItem++; }
function RW_Zone_CreateWithText(I: RWInterface, text: string, x: number, y: number, bAllocate: number): void {
  const area = { X: x, Y: y, LX: TxLen(text, RW.pFont) + 6, LY: RW.pFont.item[0].LY + 6 };
  WriteText(text, area.X + 4, area.Y + 3, RW.pFont);
  if (!bAllocate) zone(I, area.X + 2, area.Y + 2, area.LX - 3, area.LY - 3);
}
const overlap = (I: RWInterface, i: number): boolean => {
  const b = I.item[i];
  return !!b && sMOU.x >= GX.View.xmin + b.X && sMOU.x <= b.X + b.LX && sMOU.y >= GX.View.ymin + b.Y && sMOU.y <= b.Y + b.LY;
};
function CheckMouseOverlap(I: RWInterface, OldF: number): number {
  let f = OldF, i = 0;
  RW.insideMouse = 0;
  do { if (overlap(I, i)) { f = i; RW.insideMouse = 1; } i++; } while (!(f !== OldF || i > I.numItem - 1));
  return f;
}
function ScanKeys(I: RWInterface, sel: { cur: number; prev: number }): number {
  RW.dx = 0; RW.dy = 0; RW.ch = 0;
  if (sKEY_IsClicked(s.return)) RW.ch = 13;
  if (sKEY_IsClicked(s.esc)) RW.ch = 27;
  RW.dx = Number(sKEY_IsClicked(s.right)) - Number(sKEY_IsClicked(s.left));
  RW.dy = Number(sKEY_IsClicked(s.down)) - Number(sKEY_IsClicked(s.up));
  if (RW.ch || RW.dx || RW.dy) {
    RW.isMouseHidden = 1;
    if (I.keymode === RW_BOTH) sel.cur += RW.dx ? RW.dx : RW.dy;
    else if (I.keymode === RW_HORIZ) sel.cur += RW.dx;
    else if (I.keymode === RW_VERT) sel.cur += RW.dy;
  } else if (sMOU.lX || sMOU.lY) RW.isMouseHidden = 0;
  if (sel.cur < 0) { sel.cur = I.numItem - 1; sel.prev = -1; }
  if (sel.cur >= I.numItem) { sel.cur = 0; sel.prev = -1; }
  return RW.ch;
}
type Callback = (I: RWInterface, mode: number) => Promise<number>;
/** RW_Interface_Scan: returns the zone chosen; ok.v = 0 when left with Esc */
async function RW_Interface_Scan(I: RWInterface, cur: number, ok: { v: number }, cb: Callback): Promise<number> {
  let key = 0;
  const sel = { cur, prev: cur };
  let pushed = 0, pushOn = -1;
  if (!RW.isMouseHidden) sel.cur = CheckMouseOverlap(I, sel.prev);
  ok.v = 1;
  RW.current = sel.cur;
  await cb(I, 0);
  do {
    sKEY.Update(); sMOU.Update();
    if (!RW.isLocked) {
      key = ScanKeys(I, sel);
      if (!RW.isMouseHidden) {
        sel.cur = CheckMouseOverlap(I, sel.cur);
        if (sMOU_IsHeld(0) && overlap(I, sel.cur)) { pushed = 1; pushOn = sel.cur; }
        if (sMOU_IsReleased(0)) pushed = pushed && overlap(I, pushOn) ? 2 : 0;
        if (pushed === 2 && overlap(I, sel.cur)) key = 13;
      }
    }
    RW.ch = key;
    RW.current = sel.cur;
    const ret = await cb(I, 1);
    if (ret === -1) key = 27;
    if (ret === 1) key = 13;
    if (key === 27) ok.v = 0;
  } while (!(key === 13 || key === 27));
  return RW.current;
}
/** RW_InputText: typing a name (the scan codes as SDL reports them) */
async function RW_InputText(I: RWInterface, t: { v: string }, numChar: number, cb: Callback): Promise<number> {
  let finish = 0;
  let text = t.v;
  let m_scanCode = sKEY.scanCode;
  RW.current = 0;
  await cb(I, 0);
  do {
    sKEY.Update();
    if (sKEY.scanCode !== m_scanCode) {
      m_scanCode = sKEY.scanCode;
      switch (sKEY.scanCode) {
        case s.space: if (text.length < numChar - 2) text += ' '; break;
        case s.delete: case s.backspace: text = text.slice(0, -1); break;
        case s.esc: finish = 2; break;
        case s.return: finish = 1; break;
        default: if (text.length < numChar - 2 && sKEY.charCode) text += String.fromCharCode(sKEY.charCode); break;
      }
    }
    RW.szInputText = text + (timer_ms() % 1000 < 500 ? '_' : ' ');
    await cb(I, 2);
  } while (!finish);
  if (finish === 1) t.v = text.slice(0, numChar);
  return finish;
}

// ---------------------------------------------------------------- menus
const menuText = (x: string | (() => string)): string => (typeof x === 'function' ? x() : x);
async function frame(): Promise<number> {
  await Flip();
  NG_UpdateColor();
  conHandleInput();
  RW.isLocked = conIsActive() ? 1 : 0;
  return STUB_TaskControl() ? 1 : 0;
}
async function NG_RenderingSubMenu(I: RWInterface, mode: number): Promise<number> {
  const pMenu = P.pMenu, pFont = G.g_pFontMenuSml;
  const x = P.item2X, dy = pFont.item[0].LY + 1;
  cursor.Mode = 1;
  const numItems = pMenu.length;
  let y = P.YZoneMin + ((P.YZoneSize - numItems * pFont.item[0].LY) >> 1);
  NG_RenderingBackground();
  for (let i = 0; i < numItems; i++, y += dy) {
    const M = pMenu[i];
    if (i === numItems - 1) y += dy;
    CSP_Color(COLOR_WHITE);
    WriteText(menuText(M.szTitle), x, y, pFont);
    if (i < numItems - 1 && M.ptr) {
      if (M.ptr.get() > M.max) M.ptr.set(M.max - 1);
      const tex = M.Val.length === 0 ? `${Math.trunc((M.ptr.get() * 100) / M.max)}%` : menuText(M.Val[M.ptr.get()] ?? '');
      CSP_Color(COLOR_GRAY);
      WriteText(tex, x + P.Width2, y, pFont);
    }
    if (!mode) zone(I, x, y, P.Width2 - 8, pFont.item[0].LY);
  }
  CSP_Color(COLOR_GRAY4);
  WriteText(P.name, P.Xtitle, P.Ytitle, G.g_pFontMenuSml);
  RW_RenderSelection(I);
  return frame();
}
async function NG_RenderingKeybMenu(I: RWInterface, mode: number): Promise<number> {
  const pMenu = P.pMenu, pFont = G.g_pFontMenuSml;
  const x = P.item2X, dy = pFont.item[0].LY + 1;
  cursor.Mode = 1;
  const numItems = pMenu.length;
  const y0 = P.YZoneMin;
  let y = y0;
  const oldYmin = GX.View.ymin;
  NG_RenderingBackground();
  while (GX.View.ymin + y0 + dy * (RW.current + 1) > P.YZoneMax - dy) { GX.View.ymin -= dy; y -= dy; }
  for (let i = 0; i < numItems; i++, y += dy) {
    const M = pMenu[i];
    if (y >= y0 && y + dy < P.YZoneMax - dy) {
      CSP_Color(COLOR_WHITE);
      WriteText(menuText(M.szTitle), x, y, pFont);
      let tex = '';
      if (i < numItems - 1 && M.ptr) {
        tex = SCAN_NAMES[M.ptr.get()] ?? '';
        if (g_SGSettings.mou[i]) tex += `,MB${g_SGSettings.mou[i]}`;
      }
      CSP_Color(COLOR_GRAY);
      WriteText(tex, x + ((P.Width2 * 3) >> 2), y, pFont);
    }
    if (!mode) zone(I, x, y, ((P.Width2 * 3) >> 2) - 8, pFont.item[0].LY);
  }
  CSP_Color(COLOR_GRAY4);
  WriteText(P.name, P.Xtitle, P.Ytitle, G.g_pFontMenuSml);
  RW_RenderSelection(I);
  GX.View.ymin = oldYmin;
  return frame();
}
const MEDAL_ODD = 2;
function MedalTotal(medal: number): string {
  if (medal === 0) return '';
  let c = 65;
  let med = String.fromCharCode(c).repeat(medal % MEDAL_ODD); c++;
  medal = Math.trunc(medal / MEDAL_ODD);
  for (let j = 0; j < g_pRewards.maxItem - 1; j++) { med += String.fromCharCode(c).repeat(medal % MEDAL_ODD); c++; medal = Math.trunc(medal / MEDAL_ODD); }
  return med;
}
const g_pEpisodeMenu = (): string[] => [T(53), T(61), T(54), T(55), T(56), T(57), T(58), T(118)];
function asctime(t: number): string {
  const d = new Date(t * 1000);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const p = (n: number): string => String(n).padStart(2, '0');
  return `${days[d.getDay()]} ${mon[d.getMonth()]} ${String(d.getDate()).padStart(2, ' ')} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())} ${d.getFullYear()}\n`;
}
async function NG_RenderingMainMenu(I: RWInterface, mode: number): Promise<number> {
  const menu = P.menu, HSpacing = P.HSpacing;
  const sm = HSpacing === 2 ? P.Font : HSpacing === 1 ? G.g_pFontMenuSml : G.g_pFontMenuLrg;
  let numItems = menu.length - 1;
  cursor.Mode = 2;
  let maxLength = 0;
  for (let i = 0; i < numItems; i++) maxLength = Math.max(maxLength, TxLen(menu[i], sm));
  if (mode === 2) numItems++;
  const hh = numItems * (sm.item[0].LY + 3);
  let y = P.YZoneMin + ((P.YZoneSize - hh) >> 1);
  maxLength += 32;
  const x = (GX.View.xmax - maxLength) >> 1;
  NG_RenderingBackground();
  CSP_Color(COLOR_GRAY4);
  WriteText(menu[0], P.Xtitle, P.Ytitle, G.g_pFontMenuLrg);
  for (let i = 0; i < numItems; i++) {
    if (menu[i + 1] === T(169)) y += sm.item[0].LY;
    if (i === RW.current && menuSaves[i + 1] !== undefined) {
      const sv = G.g_pSaveGames[menuSaves[i + 1]];
      let a = 0, b = 0;
      for (let k = 0; k < 8; k++) { a += sv.level[k]; b += G.g_pGameItem[k].numLevel; }
      const tex = `Score: ~${sv.score}~ Level: ~${g_pEpisodeMenu()[sv.episode === 7 ? 1 : sv.episode + 2]}~ ${asctime(sv.last_time)}`;
      DrawTextC(tex, P.XZoneMin, P.YZoneMax, COLOR_GRAY, COLOR_WHITE, P.Font, csp.put);
      const pct = `${((a * 100) / b).toFixed(1)} %`;
      DrawTextC(pct, P.XZoneMin, P.YZoneMax - 30, COLOR_GRAY, COLOR_WHITE, G.g_pFontMenuLrg, csp.put);
      const x2 = P.XZoneMin + TxLen(pct, G.g_pFontMenuLrg) + 20;
      CSP_Color(COLOR_WHITE);
      WriteText(MedalTotal(sv.rank), x2, P.YZoneMax - 30, g_pRewards);
    }
    CSP_Color(NG_PixelFormat(255 - i * 6, 255 - i * 5, 255 - i * 6));
    if (i >= P.defColor) CSP_Color(COLOR_GRAY);
    const sTxt = mode === 2 ? (i === 0 ? RW.szInputText : menu[i]) : menu[i + 1];
    let dx: number, dy: number;
    if (HSpacing && sTxt !== T(118)) {
      dy = dx = sm.item[0].LY + 3;
      WriteCenterText(sTxt, y, sm);
      if (sTxt === T(61)) dy += dx >> 1;
    } else {
      dy = dx = RW.pFont.item[0].LY + 3;
      if (sTxt === T(118) || sTxt === T(52)) y += dx;
      WriteCenterText(sTxt, y, G.g_pFontMenuLrg);
    }
    if (!mode) zone(I, x, y, maxLength, dx - 3);
    y += dy;
  }
  let ret = 0;
  if (mode !== 2) ret = RW_RenderSelection(I);
  const r = await frame();
  if (ret) NG_AudioBeep(5);
  return r;
}
/** which roster slot a line of the current menu shows (the original compares the strings' addresses) */
let menuSaves: Record<number, number> = {};

async function NG_ExecSubMenu(name: string, pMenu: SGMenu[], pf: Callback): Promise<void> {
  const bKeyboardSetup = pMenu[0].max < 0;
  let ok = { v: 1 };
  const jm = pMenu.length - 1;
  RW.current = 0;
  let I = newInterface(RW_VERT);
  P.name = name;
  while (ok.v !== 0) {
    if (!bKeyboardSetup) I = newInterface(RW_VERT);
    else I = newInterface(RW_VERT);
    P.pMenu = pMenu;
    const but = await RW_Interface_Scan(I, RW.current, ok, pf);
    if (STUB_TaskControl()) break;
    if (ok.v) NG_AudioPlaySound(NG_AudioGetByName('bloup') - 1, 0);
    if (but >= jm) ok = { v: 0 };
    if (!ok.v) break;
    const M = pMenu[but];
    if (bKeyboardSetup) {
      // wait for the keys to be released, then for a key or a mouse button
      do { await Flip(); sKEY.Update(); sMOU.Update(); } while (sKEY.scanCode && !STUB_TaskControl());
      let mb = 0;
      do {
        await Flip(); sKEY.Update(); sMOU.Update(); conHandleInput();
        for (let b = 0; b < 3; b++) if (sMOU_IsClicked(b)) mb = b + 1;
      } while (!sKEY.scanCode && !mb && !STUB_TaskControl());
      if (mb) {
        for (let i = 0; i < jm; i++) if (g_SGSettings.mou[i] === mb) g_SGSettings.mou[i] = g_SGSettings.mou[but];
        g_SGSettings.mou[but] = mb;
      } else if (sKEY.scanCode && sKEY.scanCode < 255 && M.ptr) {
        const old = M.ptr.get();
        for (let i = 0; i < jm; i++) if (pMenu[i].ptr && pMenu[i].ptr!.get() === sKEY.scanCode) pMenu[i].ptr!.set(old);
        M.ptr.set(sKEY.scanCode);
      }
      sKEY.Update();
    } else if (M.ptr) {
      let vv = M.ptr.get() + (RW.dx ? RW.dx : 1);
      if (vv < M.min) vv = M.max;
      if (vv > M.max) vv = M.min;
      M.ptr.set(vv);
      if (M === audioMenu[1]) NG_AudioSetMusicVolume();
    }
  }
}
export async function NG_ExecMainMenu(menu: string[], def: number, defColor: number, HSpacing: number): Promise<number> {
  const j = menu.length - 1;
  const I = newInterface(RW_VERT);
  P.menu = menu; P.def = def; P.defColor = defColor; P.HSpacing = HSpacing;
  if (!g_SGSettings.NextMenu) g_SGSettings.NextMenu = 2;
  const ok = { v: 0 };
  const but = await RW_Interface_Scan(I, def, ok, NG_RenderingMainMenu);
  if (STUB_TaskControl()) return 0;
  if (but === j - 1) ok.v = 0;
  NG_AudioPlaySound(NG_AudioGetByName('door') - 1, 0);
  return ok.v === 1 ? but : -1;
}

// ---------------------------------------------------------------- pilots
async function NG_PlayerRosterMenu(): Promise<number> {
  let ok = 0;
  cursor.Mode = 2;
  P.Help = 0;
  g_SGSettings.NextMenu = 2;
  do {
    const szMenus: string[] = [T(106)];
    const val: number[] = [];
    let p = -1;
    menuSaves = {};
    for (let i = 0; i < MAX_SAVE_GAMES; i++) {
      if (G.g_pSaveGames[i].active) { menuSaves[szMenus.length] = i; szMenus.push(G.g_pSaveGames[i].name); val.push(i); }
      else p = i;
    }
    const m = val.length;
    szMenus.push(T(108), T(109));
    szMenus.push(T(118));
    const ret = await NG_ExecMainMenu(szMenus, 0, m, 0);
    if (ret < 0) ok = -1;
    else if (ret < m) { g_SGSettings.player = val[ret]; G.g_pCurrentGame = G.g_pSaveGames[g_SGSettings.player]; ok = 2; }
    else if (ret - m === 0) {
      if (p >= 0) {
        szMenus[0] = T(108);
        rosterSaveSlot(p);
        const name = { v: 'Pilot' };
        const I = newInterface(RW_VERT);
        if ((await RW_InputText(I, name, 16, NG_RenderingMainMenu)) === 1) {
          const sv = G.g_pSaveGames[p];
          sv.name = name.v || 'Pilot';
          sv.active = 1;
          sv.last_time = Math.trunc(Date.now() / 1000);
          ok = 0;
          G.g_pCurrentGame = sv;
        }
      }
    } else if (ret - m === 1) {
      const del = [T(109), ...val.map((i) => G.g_pSaveGames[i].name), T(118)];
      g_SGSettings.NextMenu = 2;
      menuSaves = {};
      const r2 = await NG_ExecMainMenu(del, 0, 0xffffffff, 0);
      if (r2 >= 0 && r2 < val.length) {
        if (!(await NG_ExecMainMenu([T(162), T(66), T(67)], 0, 0xffffffff, 0))) G.g_pSaveGames[val[r2]].active = 0;
      }
      g_SGSettings.NextMenu = 3;
      ok = 0;
    }
  } while (ok === 0);
  menuSaves = {};
  persist.saveRoster();
  P.Help = 1;
  return ok;
}

// ---------------------------------------------------------------- the mission map and the briefing
async function NG_SelectBriefing(): Promise<boolean> {
  const cg = G.g_pCurrentGame;
  const Level = G.g_pGameItem[cg.episode].LI[cg.level[cg.episode]];
  const ly = G.g_pFontMenuSml.item[0].LY + 2;
  const episode = cg.episode === 7 ? 7 : 1 + cg.episode;
  let ok = 0;
  NG_AudioStopMusic();
  P.Help = 0;
  await NG_DrawBackgroundPic(`brief/bb${episode}0.png`, -1);
  const ymin = (GX.View.ymax - ly * 16) >> 1;
  NG_ResetColor();
  do {
    CSP_Color(COLOR_WHITE);
    csp.zoom_pset(G.g_csPicture!, 0, 0, GX.View.lWidth, GX.View.lHeight);
    WriteCenterText(Level.name, 30, G.g_pFontMenuLrg);
    for (let y = ymin, i = 0; i < 16; i++, y += ly) {
      const x = GX.View.xmin + (((GX.View.xmax - GX.View.xmin) - TxLen(Level.tex[i], G.g_pFontMenuSml)) >> 1);
      CSP_Color(NG_PixelFormat(255 - i * 8, 255 - i * 8, 255 - i * 8));
      WriteText(Level.tex[i], x, y, G.g_pFontMenuSml);
    }
    sKEY.Update(); sMOU.Update();
    CSP_Color(COLOR_WHITE);
    csp.put(sMOU.x, sMOU.y, G.g_pFontMenuLrg.item[54]);
    if (conIsActive()) conRender();
    await Flip();
    NG_UpdateColor();
    if (sMOU_IsClicked(0) || sKEY.charCode) ok = 1;
    if (sKEY_IsClicked(s.esc)) ok = 2;
    if (sKEY_IsClicked(s.return)) ok = 1;
    if (STUB_TaskControl()) ok = 2;
  } while (ok === 0);
  G.g_csPicture = null;
  return ok === 1;
}
async function CallbackMenuMap(I: RWInterface, _mode: number): Promise<number> {
  const cg = G.g_pCurrentGame;
  const id = cg.ship;
  const numLevelAvail = g_SGSettings.Cheater ? G.g_pGameItem[cg.episode].numLevel - 1 : cg.level[cg.episode];
  const sp = NG_GetCursorSprite();
  if (RW.current === 0) RW.current++;
  let sel = RW.current + (RW.current & 1 ? 0 : 1);
  if (sel >= cursor.Max) sel = cursor.Max;
  const b = I.item[sel];
  let sp2: Sprite | null = null;
  if (g_nShipAnim) {
    const a = shipAnims[id];
    shipFrame.t ??= timer_ms();
    if (timer_ms() - shipFrame.t > a.speed) { shipFrame.t = timer_ms(); shipFrame.f = (shipFrame.f + 1) % a.maxItem; }
    sp2 = a.item[shipFrame.f % a.maxItem];
  }
  if (RW.dy) {
    let x = cg.ship + RW.dy;
    NG_AudioPlaySound(NG_AudioGetByName('bloup') - 1, 0);
    if (x > 2) x = 0;
    if (x < 0) x = 2;
    cg.ship = x;
    RW.dy = RW.key = 0;
  }
  NG_UpdateColor();
  // NG_RenderMap
  CSP_Color(COLOR_WHITE);
  csp.zoom_pset(G.g_csPicture!, 0, 0, GX.View.lWidth, GX.View.lHeight);
  CSP_Color(COLOR_GRAY4);
  WriteText(g_pEpisodeMenu()[cg.episode === 7 ? 1 : cg.episode + 2], 20, 30, G.g_pFontMenuLrg);
  CSP_Color(COLOR_WHITE);
  WriteText('Select your mission and your ship with arrows or mouse.', 2, GX.View.ymax - G.g_pFont.item[0].LY - 2, G.g_pFont);
  for (let j = 0, k = 0; j < G.g_pGameItem[cg.episode].numLevel; j++, k += 2) {
    const bt = I.item[k];
    if (j <= numLevelAvail && bt) WriteText(G.g_pGameItem[cg.episode].LI[j].name, bt.X, bt.Y, j === numLevelAvail ? G.g_pFontMenuSml : G.g_pFont);
  }
  if (sp2) {
    csp.put(0, GX.View.ymax - sp2.LY, sp2);
    if (cursor.desp) { const d = cursor.desp.item[2 - id]; csp.put(0, GX.View.ymax - sp2.LY - d.LY + 20, d); }
    const s2 = NG_GetCursorSprite2();
    if (b) csp.put(b.X + ((b.LX - s2.LX) >> 1), b.Y + ((b.LY - s2.LY) >> 1), s2);
  }
  void sp;
  if (!RW.isMouseHidden) csp.put(sMOU.x, sMOU.y, G.g_pFontMenuLrg.item[54]);
  if (conIsActive()) conRender();
  const r = await Flip().then(() => { conHandleInput(); RW.isLocked = conIsActive() ? 1 : 0; return STUB_TaskControl() ? 1 : 0; });
  RW.current = sel;
  return r;
}
const shipFrame = { t: undefined as number | undefined, f: 0 };
async function NG_SelectMap(): Promise<number> {
  const cg = G.g_pCurrentGame;
  const numLevelAvail = g_SGSettings.Cheater ? G.g_pGameItem[cg.episode].numLevel - 1 : cg.level[cg.episode];
  const episode = cg.episode === 7 ? 7 : 1 + cg.episode;
  NG_AudioStopTrack();
  NG_ResetColor();
  cursor.desp = loadSpriteGroup('bbspec', 128);
  const I = interfaceFromSpc(`brief/br${episode}0.spc`);
  I.keymode = RW_HORIZ;
  zone(I, 0, GX.View.ymax - 128, 148, 80);
  cursor.Max = numLevelAvail * 2 + 1;
  await NG_DrawBackgroundPic(`brief/br${episode}0.png`, Ms_CREDITS);
  g_nShipAnim = 1;
  let but = cursor.Max;
  let ok = { v: 1 };
  do {
    ok = { v: 1 };
    but = await RW_Interface_Scan(I, but, ok, CallbackMenuMap);
    if (ok.v && !RW.dy) {
      if (but > 0) { cg.level[cg.episode] = (but - 1) >> 1; ok.v = 2; NG_AudioBeep(2); }
      else RW.dy = 1;
    }
  } while (ok.v === 1);
  cursor.desp = null;
  g_nShipAnim = 0;
  g_SGSettings.NextMenu = 66;
  return ok.v;
}
async function NG_SelectEpisode(): Promise<number> {
  g_SGSettings.AddOn = 0;
  menuSaves = {};
  const j = await NG_ExecMainMenu(g_pEpisodeMenu(), 0, 0xffffffff, 1);
  if (j < 0) return 0;
  G.g_pCurrentGame.episode = j === 0 ? 7 : j - 1;
  if (G.g_pCurrentGame.episode >= 8) return 0;
  return 1;
}
function XCancel(): void { NG_AudioStopTrack(); NG_AudioPlayTrack(Ms_MENU1); }
async function NG_NewGameMenu(): Promise<number> {
  for (;;) {
    if (g_SGSettings.GoToBrief !== 2 && !(await NG_SelectPlayer())) return 0;
    g_SGGame.IdPlayer = 0; g_SGGame.IsHost = 1; g_SGGame.numPlayer = 1; g_SGSettings.SerialGame = 0;
    for (;;) {
      g_SGSettings.GoToBrief = 0;
      if (!(await NG_SelectEpisode())) break;
      const ok4 = await NG_SelectMap();
      if (ok4) {
        if (await NG_SelectBriefing()) return 1;
        XCancel();
      } else { XCancel(); return 0; }
    }
    // Esc in the episodes: back to the pilots
  }
}
async function NG_SelectPlayer(): Promise<number> {
  let j: number;
  do { j = await NG_PlayerRosterMenu(); if (j === -1) return 0; } while (j === 3);
  return j;
}
async function RenderHallOfFame(I: RWInterface, mode: number): Promise<number> {
  let y = P.YZoneMin + RW.pFont.item[0].LY;
  CSP_Color(COLOR_WHITE);
  csp.zoom_pset(g_csBackground!, 0, 0, GX.View.lWidth, GX.View.lHeight);
  CSP_Color(COLOR_GRAY4);
  WriteText(T(105), P.Xtitle, P.Ytitle, G.g_pFontMenuLrg);
  for (let i = 0; i < 10; i++, y += G.g_pFontMenuSml.item[0].LY + 3) {
    const b = G.g_pBestGames[i];
    CSP_Color(i & 1 ? COLOR_GRAY4 : COLOR_GRAY2);
    WriteText(b.name, 40, y, G.g_pFontMenuSml);
    WriteText(MedalTotal(b.rank), 240, y, g_pRewards);
    const ep = G.g_pGameItem[b.episode] ?? G.g_pGameItem[0];
    WriteText(ep.LI[b.level[b.episode]]?.name ?? '', 310, y, P.Font);
    WriteText(String(b.score), 460, y, G.g_pFontMenuSml);
  }
  RW_Zone_CreateWithText(I, T(118), P.captionX, P.captionY, mode);
  RW_RenderSelection(I);
  return frame();
}
async function NG_HallOfFame(): Promise<void> {
  cursor.Mode = 1;
  await RW_Interface_Scan(newInterface(RW_VERT), 0, { v: 0 }, RenderHallOfFame);
}

// ---------------------------------------------------------------- options
const num = (get: () => number, set: (v: number) => void): SGMenu['ptr'] => ({ get, set });
const S = g_SGSettings;
const videoMenu: SGMenu[] = [
  { szTitle: () => T(80), ptr: num(() => S.DisplayIndex, (v) => { S.DisplayIndex = v; }), min: 0, max: 0, Val: ['640x480x32'] },
  { szTitle: 'Vertical Sync.', ptr: num(() => S.VerticalSync, (v) => { S.VerticalSync = v; }), min: 0, max: 1, Val: [() => T(69), () => T(68)] },
  { szTitle: 'Multisampling', ptr: num(() => S.Multisampling, (v) => { S.Multisampling = v; }), min: 0, max: 2, Val: ['OFF', '2X', '4X'] },
  { szTitle: 'Limit FPS', ptr: num(() => S.FrameSkip, (v) => { S.FrameSkip = v; }), min: 0, max: 2, Val: ['70fps', '35fps', '24fps'] },
  { szTitle: 'Tex. filtering', ptr: num(() => S.TexFiltering, (v) => { S.TexFiltering = v; }), min: 0, max: 1, Val: ['Bilinear', 'Trilinear'] },
  { szTitle: 'Tex. rectangle', ptr: num(() => S.TexPOT, (v) => { S.TexPOT = v; }), min: 0, max: 1, Val: [() => T(68), () => T(69)] },
  { szTitle: 'Tex. compression', ptr: num(() => S.TexCompression, (v) => { S.TexCompression = v; }), min: 0, max: 1, Val: [() => T(69), () => T(68)] },
  { szTitle: '3D effects', ptr: num(() => S.VisualsFx, (v) => { S.VisualsFx = v; }), min: 1, max: 4, Val: [] },
  { szTitle: () => T(147), ptr: num(() => S.LensFX, (v) => { S.LensFX = v; }), min: 0, max: 1, Val: [() => T(69), () => T(68)] },
  { szTitle: () => T(118), ptr: null, min: 0, max: 0, Val: [] },
];
const audioMenu: SGMenu[] = [
  { szTitle: () => T(98), ptr: num(() => S.VolFX, (v) => { S.VolFX = v; }), min: 0, max: 100, Val: [] },
  { szTitle: () => T(142), ptr: num(() => S.VolMusic, (v) => { S.VolMusic = v; }), min: 0, max: 100, Val: [] },
  { szTitle: () => T(118), ptr: null, min: 0, max: 0, Val: [] },
];
const controlMenu: SGMenu[] = [
  { szTitle: () => T(100), ptr: num(() => S.Ctrl, (v) => { S.Ctrl = v; }), min: 0, max: 2, Val: [() => T(120), () => T(101), () => T(102)] },
  { szTitle: () => T(103), ptr: num(() => S.FlipYMouse, (v) => { S.FlipYMouse = v; }), min: 0, max: 1, Val: [() => T(67), () => T(66)] },
  { szTitle: 'Alt. mouse', ptr: num(() => S.AltMouse, (v) => { S.AltMouse = v; }), min: 0, max: 1, Val: [() => T(67), () => T(66)] },
  { szTitle: () => T(144), ptr: num(() => S.MouseSensitivity, (v) => { S.MouseSensitivity = v; }), min: 1, max: 32, Val: [] },
  { szTitle: 'Joy.Axis Throttle', ptr: num(() => S.AxisThrottle, (v) => { S.AxisThrottle = v; }), min: 0, max: 4, Val: ['None', 'Z-axis', 'X-axis rotation', 'Y-axis rotation', 'Z-axis rotation'] },
  { szTitle: 'Joy.Axis Roll', ptr: num(() => S.AxisRoll, (v) => { S.AxisRoll = v; }), min: 0, max: 4, Val: ['None', 'Z-axis', 'X-axis rotation', 'Y-axis rotation', 'Z-axis rotation'] },
  { szTitle: () => T(118), ptr: null, min: 0, max: 0, Val: [] },
];
const gameMenu: SGMenu[] = [
  { szTitle: () => T(157), ptr: num(() => S.Difficulty, (v) => { S.Difficulty = v; }), min: 0, max: 2, Val: [() => T(148), () => T(149), () => T(150)] },
  { szTitle: () => T(128), ptr: num(() => S.DemoDelay, (v) => { S.DemoDelay = v; }), min: 15, max: 60, Val: [] },
  { szTitle: () => T(118), ptr: null, min: 0, max: 0, Val: [] },
];
const keyNames = ['Up', 'Down', 'Right', 'Left', 'Throttle', 'Speed+', 'Speed-', 'Turbo', 'BackTurbo', 'Roll left', 'Roll right', 'Engine off',
  'Next weapon', 'Fire', 'Lock', 'Use item', 'Next item', 'Prev item', 'Next NAV', 'HUD', 'Radar', 'Com', 'Talk'];
const keyIndex = [18, 19, 20, 21, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 22];
const keyMenu: SGMenu[] = [
  ...keyNames.map((n, i): SGMenu => ({ szTitle: n, ptr: num(() => S.key[keyIndex[i]], (v) => { S.key[keyIndex[i]] = v; }), min: -1, max: -1, Val: [] })),
  { szTitle: () => T(118), ptr: null, min: 0, max: 0, Val: [] },
];
async function NG_OptionsMenu(): Promise<void> {
  let ok: number;
  do {
    const lang = `## ${g_szLanguageList[S.Language] ?? ''}`;
    menuSaves = {};
    ok = await NG_ExecMainMenu([T(62), lang, T(63), T(64), T(65), T(119), T(101), 'Joystick', T(118)], 0, 0xffffffff, 0);
    switch (ok) {
      case 0:
        S.Language++;
        if (S.Language >= g_szLanguageList.length) S.Language = 0;
        setLanguage(S.Language);
        readMissionList();
        break;
      case 1: P.Help = 4; await NG_ExecSubMenu(T(63), videoMenu, NG_RenderingSubMenu); P.Help = 1; break;
      case 2: P.Help = 3; await NG_ExecSubMenu(T(64), audioMenu, NG_RenderingSubMenu); P.Help = 1; break;
      case 3: await NG_ExecSubMenu(T(65), controlMenu, NG_RenderingSubMenu); break;
      case 4: await NG_ExecSubMenu(T(119), gameMenu, NG_RenderingSubMenu); break;
      case 5: await NG_ExecSubMenu(T(101), keyMenu, NG_RenderingKeybMenu); break;
      case 6: break; // NG_JoystickCalibration: no joystick in the browser port
    }
  } while (ok >= 0);
  void LK_MAX;
}

// ---------------------------------------------------------------- credits and help
export async function NG_MenuCredits(): Promise<void> {
  const Greets = loadTextList(fileText('voix/e_credit.txt'), 128);
  const sp = loadBackground('menu/realtech.png');
  NG_AudioPlayTrack(Ms_CREDITS);
  CSP_Color(COLOR_WHITE);
  let y = GX.View.ymax, quit = false;
  timer_Start(60, 1);
  do {
    sKEY.Update();
    csp.zoom_pset(sp, 0, 0, GX.View.lWidth, GX.View.lHeight);
    let f = 0, y0 = y;
    for (const tx of Greets) {
      let font: SpriteGroup;
      if (tx.includes('^')) { font = G.g_pFontMenuLrg; CSP_Color(COLOR_WHITE); } else { font = G.g_pFontMenuSml; CSP_Color(COLOR_GRAY3); }
      const LY = font.item[0].LY + 2;
      if (y0 >= GX.View.ymin - LY && y0 <= GX.View.ymax) { f = 1; WriteCenterText(tx, y0, font); }
      y0 += LY;
    }
    if (f === 0 || NG_WaitForKeyPress()) quit = true;
    y--;
    await Flip();
    NG_UpdateColor();
  } while (!quit);
  timer_Start(70, 1);
  NG_AudioBeep(2);
  NG_AudioStopMusic();
}
/** NG_DrawHelpFile: voix\<lang>_readme.txt, scrolled with the arrows or the wheel */
export async function NG_DrawHelpFile(Font: SpriteGroup, color2: number, xz: number, inGame = false): Promise<void> {
  const name = `voix/${String.fromCharCode(S.LangCode)}_readme.txt`;
  let text: string[];
  try { text = loadTextList(fileText(name), 450); } catch { return; }
  if (!text.length) return;
  let y = GX.View.ymin, quit = 0, quitted = 0, ddy = 0;
  CSP_Color(COLOR_WHITE);
  const render3d = inGame ? (await import('./play.ts')).NG_RenderView : null;
  do {
    if (STUB_TaskControl()) break;
    sKEY.Update(); sMOU.Update();
    S.bClearView = 1;
    CSP_Color(COLOR_WHITE);
    if (g_csBackground && !inGame) csp.zoom_pset(g_csBackground, 0, 0, GX.View.lWidth, GX.View.lHeight);
    else if (render3d) { render3d(); GX.csp_cfg.alpha = 128; gi.drawMeshedRect(0, 0, GX.View.xmax, GX.View.ymax, 0); }
    CSP_Color(COLOR_GRAY4);
    WriteText(T(49), P.Xtitle, P.Ytitle, G.g_pFontMenuLrg);
    let y0 = y, LY = Font.item[0].LY + 2;
    for (const line of text) {
      LY = Font.item[0].LY + 2;
      if (y0 >= GX.View.ymin - LY && y0 <= GX.View.ymax) DrawTextC(line, xz, y0, color2, NG_PixelFormat(255, 255, 255), Font, csp.put);
      y0 += LY;
    }
    const mX = (y0 - y) - GX.View.ymax;
    const dy = sMOU.lZ;
    if (sMOU_IsHeld(1)) quit = 1; else if (quit) quitted = 1;
    if (!dy) { if (sKEY_IsHeld(s.up)) ddy = 8; if (sKEY_IsHeld(s.down)) ddy = -8; } else ddy = dy;
    if (sKEY_IsClicked(s.return) || sKEY_IsClicked(s.f1) || sKEY_IsClicked(s.esc)) quitted = 1;
    y += ddy;
    if (ddy > 0) ddy--;
    if (ddy < 0) ddy++;
    if (y > GX.View.ymin) y = GX.View.ymin;
    if (y < -mX) y = -mX;
    await Flip();
    NG_UpdateColor();
  } while (!quitted);
  NG_AudioBeep(2);
}
async function NG_HelpMenu(): Promise<void> {
  const ymin = GX.View.ymin, ymax = GX.View.ymax;
  GX.View.ymin = P.YZoneMin + G.g_pFont.item[0].LY;
  GX.View.ymax = GX.View.ymin + P.YZoneSize - G.g_pFont.item[0].LY * 2;
  await NG_DrawHelpFile(P.Font, COLOR_GRAY, P.XZoneMin);
  GX.View.ymin = ymin; GX.View.ymax = ymax;
}

// ---------------------------------------------------------------- the main menu
/** NG_MainMenu: 1 = play, 2 = quit, 3 = credits, 4 = back to the menu */
export async function NG_MainMenu(): Promise<number> {
  let ok = 0, iItem = 0;
  g_csBackground = loadBackground('menu/lit_mn01.png');
  timer_Start(70, 1);
  P.Help = 1;
  RW.pFont = G.g_pFontMenuLrg;
  NG_LoadMenuInterface();
  CSP_Color(COLOR_WHITE);
  NG_AudioPlayTrack(Ms_MENU1);
  S.NextMenu = S.GoToBrief ? 2 : 0;
  S.DemoMode = 0;
  conSetLimits(0, 0, GX.View.lWidth, GX.View.lHeight >> 1);
  conPrint('Loading main menu ...');
  NG_ResetColor();
  if (S.GoToBrief === 2) { ok = (await NG_NewGameMenu()) ? 1 : 4; S.GoToBrief = 0; }
  if (S.GoToBrief === 1) {
    ok = await NG_SelectMap();
    if (ok) ok = (await NG_SelectBriefing()) ? 1 : 0;
    S.GoToBrief = 0;
    if (!ok) ok = 4;
  }
  while (ok === 0) {
    menuSaves = {};
    const but = await NG_ExecMainMenu([T(45), T(46), T(48), T(49), T(50), T(51), T(37), T(52)], 0, 0xffffffff, 0);
    switch (but) {
      case 0:
        if (!(await NG_NewGameMenu())) { if (S.NextMenu === 66) ok = 4; }
        else { ok = 1; iItem = 0; }
        break;
      case 1: await NG_OptionsMenu(); S.NextMenu = 3; break;
      case 2: await NG_HelpMenu(); S.NextMenu = 3; break;
      case 3: await NG_HallOfFame(); S.NextMenu = 3; break;
      case 4: NG_AudioStopMusic(); ok = 3; break;
      case 5: if (S.DemoMode !== 4) { S.DemoMode = 2; iItem = 1; } ok = 1; break;
      case -1: case 6:
        if ((await NG_ExecMainMenu([T(52), T(66), T(67)], 0, 0xffffffff, 0)) === 0) ok = 2;
        S.NextMenu = 2;
        break;
    }
  }
  void iItem;
  persist.saveConfig();
  NG_AudioStopMusic();
  return ok;
}

// ---------------------------------------------------------------- the end of a mission
function DrawValue(tx: string, val: number, val2: number, mode: number, l: number): void {
  const y = P.YZoneMin + l * (RW.pFont.item[0].LY + 5);
  const p2 = (n: number): string => String(Math.trunc(n)).padStart(2, '0');
  const tex = mode === 1 ? `${p2(val / 60)}:${p2(val % 60)}` : mode === 2 ? String(val2) : `${val}/${val2}`;
  CSP_Color(COLOR_GRAY);
  WriteText(tx, 40, y, G.g_pFontMenuLrg);
  CSP_Color(COLOR_WHITE);
  WriteText(tex, 460, y, G.g_pFontMenuLrg);
}
async function NG_RenderEndLevelBackground(I: RWInterface, mode: number): Promise<number> {
  const st = G.g_cGameStat;
  let l = 0;
  CSP_Color(COLOR_WHITE);
  csp.zoom_pset(G.g_csPicture!, 0, 0, GX.View.lWidth, GX.View.lHeight);
  CSP_Color(COLOR_GRAY4);
  WriteText(P.name, P.Xtitle, P.Ytitle, G.g_pFontMenuSml);
  DrawValue(T(112), st.time_end - st.time_start, 0, 1, l++);
  DrawValue(T(114), st.killed_nmy, st.total_nmy, 0, l++);
  DrawValue(T(116), st.killed_amy, st.total_amy, 0, l++);
  if (st.shooted) DrawValue(T(191), Math.trunc((st.hitted * 100) / st.shooted), 100, 0, l++);
  DrawValue(T(115), st.bonus, st.total_bonus, 0, l++);
  RW_Zone_CreateWithText(I, T(107), P.captionX, P.captionY, mode);
  RW_Zone_CreateWithText(I, T(146), 300, P.captionY, mode);
  RW_RenderSelection(I);
  return frame();
}
export async function NG_EndLevel(): Promise<number> {
  const cg = G.g_pCurrentGame, st = G.g_cGameStat;
  RW.pFont = G.g_pFontMenuLrg;
  NG_LoadMenuInterface();
  P.name = G.g_pGameItem[cg.episode].LI[cg.level[cg.episode]].name;
  if (st.bonus > st.total_bonus) st.bonus = st.total_bonus;
  if (st.killed_nmy > st.total_nmy) st.killed_nmy = st.total_nmy;
  if (st.hitted > st.shooted) st.hitted = st.shooted;
  cg.score = (cg.score + G.g_pGameItem[cg.episode].LI[cg.level[cg.episode]].Bonus) >>> 0;
  highScoresUpdate();
  const I = newInterface(RW_HORIZ);
  await NG_DrawBackgroundPic('menu/lit_mn01.png', Ms_SUCCESS);
  cursor.Mode = 1;
  let but = 0;
  const ok = { v: 0 };
  do {
    I.item = []; I.numItem = 0;
    but = await RW_Interface_Scan(I, but, ok, NG_RenderEndLevelBackground);
    if (STUB_TaskControl()) break;
    if (ok.v) {
      if (but === 0) { S.GoToBrief = 1; ok.v = 1; }
      else if (but === 1) ok.v = 2;
    }
  } while (ok.v === 0);
  G.g_csPicture = null;
  NG_AudioPlaySound(NG_AudioGetByName('explode2') - 1, 0);
  NG_AudioStopMusic();
  cg.rank++;
  cg.level[cg.episode]++;
  cg.last_time = Math.trunc(Date.now() / 1000);
  let bSuccess = false;
  if (cg.level[cg.episode] >= G.g_pGameItem[cg.episode].numLevel) {
    cg.level[cg.episode] = G.g_pGameItem[cg.episode].numLevel;
    if (cg.episode <= MAX_GAME_EPISODE) bSuccess = true;
    if (cg.episode < 5) { cg.episode++; if (cg.episode >= MAX_GAME_EPISODE) cg.episode = 0; }
  }
  if (bSuccess) {
    for (let i = 0; i < MAX_GAME_EPISODE; i++) if (cg.level[i] < G.g_pGameItem[0].numLevel) bSuccess = false;
    if (bSuccess) await NG_PlayTheEnd();
  }
  persist.saveRoster();
  persist.saveScores();
  void timer_sec; void fgetsLines; void DrawText; void DrawCenterText; void sKEY_IsHeld; void gi;
  return ok.v;
}
export { NG_RenderingBackground };
