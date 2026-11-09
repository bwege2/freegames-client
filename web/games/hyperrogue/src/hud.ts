// hud.cpp of HyperRogue 13.1o: the heads-up display (the item and kill glyphs, score, kills, the version line).
// Stage 2, package U1. Not here: the radar (radar.cpp), the mobile compass (control.cpp), racing's stats, the
// glyphs drawn as shapes (drawMonsterType/drawItemType: package D4).
//
// Note: preparesort() (which fills glyphorder) is called only by initialize_all with a GUI; the oracle runs
// -nogui, so its glyphorder stays all 0 (itNone) and the glyph area draws nothing (NOTES.md, "Drawing oracle").
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
import { G, pconf } from './globals.ts';
import { isize, callhooks, callhandlers, VER } from './hyper.ts';
import { idiv, itrunc } from './cpp.ts';
import {
  type eMonster, type eItem, ittypes, motypes, iinf, minf, moTortoise, moLesser, moKrakenH, moKrakenT, moDragonTail,
  moSlime, moMutant, laClearing, IC_TREASURE, IC_OTHER, IC_ORB, IC_NAI, itInventory, itCrossbow, itTerra, itFatigue,
  itHolyGrail, itOrbSpace, itGreenStone, itStrongWind, itWarning, itBombEgg, itTrollEgg, itDodeca, itOrbYendor,
} from './content.ts';
import { isFriendly, isMonsterPart, isNonliving, isWorm, itemclass, isElementalShard, localshardof } from './flags.ts';
import { isNative } from './content-req.ts';
import { treasureType, land_structure_name } from './landlock.ts';
import { exp_parser, hr_parse_exception, bignum, short_form } from './util.ts';
import { its } from './hprint.ts';
import { XLAT, spI, spM, XLATT1, XLAT1_acc } from './language.ts';
import { bow_crossbow_mode, bow_bowName } from './crossbow.ts';
import { pureHardcore } from './checkmove.ts';
import { PURELOS_LEVEL } from './environment.ts';
import { default_land_structure } from './menus.ts';
import { full_geometry_name } from './geom-exp.ts';
import { gNormal, BITRUNCATED, mhybrid } from './classes.ts';
import { gold } from './items.ts';
import { tkills } from './attack.ts';
import { achievement_display } from './achievement.ts';
import { initquickqueue, sortquickqueue, quickqueue, queueline, OUTLINE_DEFAULT, glflush } from './drawing.ts';
import { atscreenpos, flat_model_enabler } from './hypgraph.ts';
import { tC0_sm } from './hyperpoint.ts';
import { cgi } from './geometry.ts';
import { color_diff, displaystr, displaychr, displayfr, drawCircle, textwidth, displayButtonS, calcfps } from './basegraph.ts';
import { darkenedby, darkena, gradient } from './colors.ts';
import { orb_auxiliary_color, calcparam, hide_player, sm } from './graph.ts';
import { drawMonsterType } from './graph-monster.ts';
import { drawItemType } from './graph-item.ts';
import { haveMobileCompass } from './control.ts';
import { draw_radar } from './radar.ts';
import { helptitle, generateHelpForItem, generateHelpForMonster, standard_help } from './help.ts';
import { SDLK_F1 } from './sdl.ts';
import { NotPorted } from './hyper.ts';
import { PPR } from './hyper.ts';

export function monsterclass(m: eMonster): number {
  if (isFriendly(m) || m === moTortoise) return 1;
  else if (isMonsterPart(m)) return 2;
  else return 0;
}

export function glyphclass(i: number): number {
  if (i < ittypes) {
    const it: eItem = i;
    return itemclass(it) === IC_TREASURE ? 0 : 1;
  }
  else {
    const m: eMonster = i - ittypes;
    return monsterclass(m) === 0 ? 2 : 3;
  }
}

export function subclass(i: number): number {
  if (i < ittypes)
    return itemclass(i);
  else
    return monsterclass(i - ittypes);
}

const GLYPH_MARKTODO = 1;
const GLYPH_MARKOVER = 2;
const GLYPH_LOCAL = 4;
const GLYPH_IMPORTANT = 8;
const GLYPH_NONUMBER = 16;
const GLYPH_DEMON = 32;
const GLYPH_RUNOUT = 64;
const GLYPH_INPORTRAIT = 128;
const GLYPH_LOCAL2 = 256;
const GLYPH_TARGET = 512;
const GLYPH_INSQUARE = 1024;
const GLYPH_INLANDSCAPE = 2048;
const GLYPH_ACTIVE = 4096;
const GLYPH_CIRCLE = 8192;

/** enum eGlyphsortorder */
export const gsoFirstTop = 0, gsoFirstBottom = 1, gsoLastTop = 2, gsoLastBottom = 3, gsoLand = 4, gsoValue = 5, gsoMAX = 6;

/** int& ikmerge(int i): the count of glyph i (items, then a zero, then kills) */
function ikmerge(i: number): number {
  if (i < ittypes) return G.items[i];
  else if (i === ittypes) return 0;
  else return G.kills[i - ittypes];
}

function ikappear(i: number): boolean {
  if (i === itInventory && G.inv_on) return true;
  if (i === itCrossbow && bow_crossbow_mode()) return true;
  return ikmerge(i) !== 0;
}

const glyphs = ittypes + motypes;

const gfirsttime = new Array<number>(glyphs).fill(0), glasttime = new Array<number>(glyphs).fill(0);
const gcopy = new Array<number>(glyphs).fill(0), ikland = new Array<number>(glyphs).fill(0);
const glyphorder = new Array<number>(glyphs).fill(0);
const glyphphase = new Array<number>(glyphs).fill(0);
let glyph_lastticks = 0;

export function updateglyphpinned(): void {
  G.revglyphpinned.length = 0;
  for (let i = 0; i < glyphs; i++) G.glyphpinned[i] = 0;
  if (G.pinnedglyphs !== '') {
    let n = 0;
    const ep = new exp_parser();
    ep.s = G.pinnedglyphs;
    do {
      try {
        const i = ep.iparse();
        if (i >= 0 && i < glyphs) {
          G.revglyphpinned.push(i);
          G.glyphpinned[i] = ++n;
        }
      }
      catch (e) {
        if (e instanceof hr_parse_exception) continue;
        throw e;
      }
    } while (ep.eat(','));
  }
}

export function updatepinnedglyphs(): void {
  let ss = '';
  for (const i of G.revglyphpinned) ss += i + ',';
  G.pinnedglyphs = ss;
  if (G.pinnedglyphs !== '') G.pinnedglyphs = G.pinnedglyphs.slice(0, -1);
}

function updatesort(): void {
  for (let i = 0; i < glyphs; i++) {
    const ik = ikmerge(i);
    if (ikappear(i) && gfirsttime[i] === 0)
      gfirsttime[i] = G.ticks;
    if (ik !== gcopy[i])
      gcopy[i] = ik, glasttime[i] = G.ticks;
    if (G.ticks <= glasttime[i] + 500)
      glyphphase[i] += (G.ticks - glyph_lastticks);
    else if ((glyphphase[i] % 500) && ((i >= ittypes) || i === itTerra)) {
      const a = glyphphase[i];
      glyphphase[i] += (G.ticks - glyph_lastticks);
      if (idiv(a, 500) !== idiv(glyphphase[i], 500))
        glyphphase[i] = idiv(glyphphase[i], 500) * 500;
    }
  }
  glyph_lastticks = G.ticks;
}

export function preparesort(): void {
  for (let i = 0; i < glyphs; i++) glyphorder[i] = i;
  for (let i = 0; i < isize(G.land_over); i++) {
    const l = G.land_over[i];
    ikland[treasureType(l)] = i + 1;
    for (let mi = 0; mi < motypes; mi++)
      if (isNative(l, mi))
        ikland[mi + ittypes] = i + 1;
  }
  G.glyphsortorder = gsoLand; updatesort();
  G.glyphsortorder = gsoFirstTop;
}

function glyphcorner(i: number): number {
  if (i < ittypes)
    return itemclass(i) === IC_ORB ? 3 : 0;
  else
    return 1;
}

function glyphsort(i: number, j: number): boolean {
  if (G.glyphpinned[i] !== G.glyphpinned[j])
    return ((G.glyphpinned[i] - 1) >>> 0) < ((G.glyphpinned[j] - 1) >>> 0); // We subtract 1 from both sides to make 0 wrap around, so that it compares greater than any positive value
  if (subclass(i) !== subclass(j))
    return subclass(i) < subclass(j);
  if (G.glyphsortorder === gsoFirstTop)
    return gfirsttime[i] < gfirsttime[j];
  if (G.glyphsortorder === gsoFirstBottom)
    return gfirsttime[i] > gfirsttime[j];
  if (G.glyphsortorder === gsoLastTop)
    return glasttime[i] > glasttime[j];
  if (G.glyphsortorder === gsoLastBottom)
    return glasttime[i] < glasttime[j];
  if (G.glyphsortorder === gsoValue)
    return ikmerge(i) > ikmerge(j);
  if (G.glyphsortorder === gsoLand)
    return ikland[i] < ikland[j];
  return false;
}

/** stable_sort(glyphorder, glyphorder+glyphs, glyphsort) (Array.prototype.sort is stable) */
function sort_glyphorder(): void {
  const sorted = glyphorder.slice().sort((a, b) => glyphsort(a, b) ? -1 : glyphsort(b, a) ? 1 : 0);
  for (let i = 0; i < glyphs; i++) glyphorder[i] = sorted[i];
}

function glyphflags(gid: number): number {
  let f = 0;
  if (gid < ittypes) {
    const i: eItem = gid;
    if (itemclass(i) === IC_NAI && i !== itFatigue && i !== itCrossbow) f |= GLYPH_NONUMBER;
    if (i === itCrossbow) {
      if (G.items[i] === 0) f |= GLYPH_NONUMBER;
      if (G.bow_fire_mode) f |= GLYPH_ACTIVE;
    }
    if (isElementalShard(i)) {
      f |= GLYPH_LOCAL | GLYPH_INSQUARE;
      if (i === localshardof(G.cwt.at.land)) f |= GLYPH_LOCAL2;
    }
    if (i === treasureType(G.cwt.at.land) || G.daily_on)
      f |= GLYPH_LOCAL | GLYPH_LOCAL2 | GLYPH_IMPORTANT | GLYPH_INSQUARE | GLYPH_INPORTRAIT | GLYPH_INLANDSCAPE;
    if (i === itHolyGrail) {
      if (G.items[i] >= 3 && !G.inv_on) f |= GLYPH_MARKOVER;
    }
    else if (itemclass(i) === IC_TREASURE) {
      if (G.items[i] >= 25 && G.items[i] < 100 && !G.inv_on) f |= GLYPH_MARKOVER;
      else if (G.items[i] < 10) f |= GLYPH_MARKTODO;
    }
    else {
      f |= GLYPH_IMPORTANT | GLYPH_INSQUARE | GLYPH_INPORTRAIT | GLYPH_INLANDSCAPE;
      if (itemclass(i) === IC_ORB && G.items[i] < 10) f |= GLYPH_RUNOUT;
    }
    if (i === G.orbToTarget) f |= GLYPH_TARGET;
    if (G.orbToTarget === itOrbSpace && G.mouseover && i === G.mouseover.item) f |= GLYPH_CIRCLE;
    if (!G.less_in_portrait) f |= GLYPH_INPORTRAIT;
    if (!G.less_in_landscape) f |= GLYPH_INLANDSCAPE;
  }
  else {
    const m: eMonster = gid - ittypes;
    if (m === moLesser) f |= GLYPH_IMPORTANT | GLYPH_DEMON | GLYPH_INPORTRAIT | GLYPH_INSQUARE | GLYPH_INLANDSCAPE;
    const isnat = isNative(G.cwt.at.land, m);
    if (isnat) f |= GLYPH_LOCAL | GLYPH_IMPORTANT | GLYPH_INPORTRAIT | GLYPH_INSQUARE | GLYPH_INLANDSCAPE;
    if (isnat === 2) f |= GLYPH_LOCAL2;
    if (m === G.monsterToSummon) f |= GLYPH_TARGET;
    if (!G.less_in_landscape) f |= GLYPH_INLANDSCAPE;
  }
  return f;
}

export function graphglyph(isMonster: boolean): boolean {
  // if(GDIM == 3) return false;
  // vrhr::active(): false (CAP_VR, not in stage 2)
  return G.vid.graphglyph === 2 || (G.vid.graphglyph === 1 && (isMonster ? G.mmmon : G.mmitem));
}

const ch = (c: string): number => c.charCodeAt(0);

function bignum_nonzero(b: bignum): boolean { return b.digits.some((d) => d !== 0); }
function bignum_approx_ld(b: bignum): number {
  let res = 0;
  for (let i = b.digits.length - 1; i >= 0; i--) res = res * bignum.BASE + b.digits[i];
  return res;
}

/** displayglyph's zh_ascii branch: XLAT1_acc(minf[m].name / iinf[it].name, 8) */
function zh_name(isMonster: boolean, id: number): string | null {
  if (isMonster) {
    const m: eMonster = id - ittypes;
    return XLAT1_acc(minf[m].name, 8);
  }
  else {
    const it: eItem = id;
    return XLAT1_acc(iinf[it].name, 8);
  }
}

function displayglyph(cx: number, cy: number, buttonsize: number, glyph: number, color: number, qty: number, flags: number, id: number): boolean {

  const b =
    G.mousex >= cx && G.mousex < cx + buttonsize && G.mousey >= cy - idiv(buttonsize, 2) && G.mousey <= cy - idiv(buttonsize, 2) + buttonsize;

  let glsize = buttonsize;
  if (glyph === ch('%') || glyph === ch('M') || glyph === ch('W')) glsize = idiv(glsize * 4, 5);

  const d = G.ticks - glasttime[id];
  const zoom = (d <= 250 && d >= 0) ? 1.25 - .001 * d : 1;
  glsize = itrunc(glsize * zoom);
  const isMonster = (id >= ittypes);

  if (graphglyph(isMonster)) {
    initquickqueue();
    G.poly_outline = OUTLINE_DEFAULT();
    if (isMonster) {
      const m: eMonster = id - ittypes;
      let bsize = idiv(buttonsize * 2, 3);
      if (m === moKrakenH) bsize /= 3;
      if (m === moKrakenT || m === moDragonTail) bsize /= 2;
      if (m === moSlime) bsize = (2 * bsize + 1) / 3;
      const V = atscreenpos(cx + idiv(buttonsize, 2), cy, bsize * zoom);
      if (isWorm(m) && cgi().wormscale !== 1)
        for (let i = 0; i < 2; i++) // GDIM
          V.T[i][i] /= cgi().wormscale;
      let mcol = color;
      mcol -= (color & 0xFCFCFC) >> 2;
      drawMonsterType(m, null!, V, mcol, glyphphase[id] / 500.0, 0 /* NOCOLOR */);
    }
    else {
      const it: eItem = id;
      let bsize = idiv(buttonsize, 2);
      if (glyph === ch('*')) bsize *= 2;
      if (glyph === ch('%')) bsize *= 2;
      if (glyph === ch('!')) bsize *= 2;
      if (glyph === ch('?')) bsize *= 2;
      if (glyph === ch(';')) bsize *= 2;
      if (glyph === ch('$')) bsize = (bsize * 5 + 2) / 3;
      if (glyph === ch('o')) bsize = (bsize * 3 + 1) / 2;
      if (glyph === ch('c')) bsize = (bsize * 3 + 1) / 2;
      if (glyph === ch('t')) bsize = bsize * 5 / 2;
      if (glyph === ch('(')) bsize = bsize * 2.5;
      if (glyph === ch('/')) bsize = bsize * 2;
      if (glyph === ch(']')) bsize = bsize * 1.5;
      if (glyph === ch('x')) bsize = bsize * 1.5;
      if (it === itWarning) bsize *= 2;
      if (it === itCrossbow) bsize *= 2;
      if (it === itBombEgg || it === itTrollEgg || it === itDodeca) bsize = bsize * 3 / 2;
      let icol = color;
      icol -= (color & 0xFCFCFC) >> 2;
      const ic = itemclass(it);
      bsize = bsize * zoom;
      const V = atscreenpos(cx + idiv(buttonsize, 2), cy, bsize);
      const t =
        (ic === IC_ORB || ic === IC_NAI) ? G.ticks * 2 :
        ((glyph === ch('t') && qty % 5) || it === itOrbYendor) ? G.ticks / 2 :
        it === itTerra ? glyphphase[id] * 3 * Math.PI + 900 * Math.PI :
        glyphphase[id] * 2;

      drawItemType(it, null!, V, icol, t, false);

      const c1 = Math.max(color_diff(color, G.backcolor), color_diff(color, G.bordcolor));
      if (c1 < 0x80) {
        color = orb_auxiliary_color(it);
      }
    }
    const c1 = Math.max(color_diff(color, G.backcolor), color_diff(color, G.bordcolor));
    if (c1 < 0x80)
      color = gradient(color, G.forecolor, 0, .4, 1);
    sortquickqueue();
    quickqueue();
  }
  else if (G.zh_ascii && zh_name(isMonster, id) !== null) {
    const zh = zh_name(isMonster, id)!;
    const df = G.cfont;
    G.cfont = G.cfont_chinese;
    try { displaystr(cx + idiv(buttonsize, 2), cy, 0, glsize, zh, darkenedby(color, b ? 0 : 1), 0); }
    finally { G.cfont = df; }
  }
  // (non_zh: the goto of C++ when there is no Chinese name)
  else if (glyph === ch('*'))
    displaychr(cx + idiv(buttonsize, 2), cy + idiv(buttonsize, 4), 0, idiv(glsize * 3, 2), String.fromCharCode(glyph), darkenedby(color, b ? 0 : 1));
  else
    displaychr(cx + idiv(buttonsize, 2), cy, 0, glsize, String.fromCharCode(glyph), darkenedby(color, b ? 0 : 1));

  if (flags & GLYPH_CIRCLE) drawCircle(cx + idiv(buttonsize, 2), cy, idiv(buttonsize, 2), darkena(color, 0, 0xFF));

  let fl = '';
  let str = its(qty);

  if (flags & GLYPH_TARGET) fl += '!';
  if (flags & GLYPH_LOCAL2) fl += '+';
  else if (flags & GLYPH_LOCAL) fl += '-';
  if (flags & GLYPH_DEMON) fl += 'X';
  if (flags & GLYPH_ACTIVE) fl += 'A';
  if (flags & GLYPH_MARKOVER) str += '!';

  if (fl !== '')
    displaystr(cx + buttonsize, cy - idiv(buttonsize, 2) + idiv(buttonsize, 4), 0, idiv(buttonsize, 2), fl, darkenedby(color, 0), 16);

  if (flags & GLYPH_NONUMBER) str = '';

  let bsize =
    (qty < 10 && (flags & (GLYPH_MARKTODO | GLYPH_RUNOUT))) ? idiv(buttonsize * 3, 4) :
    qty < 100 ? idiv(buttonsize, 2) :
    idiv(buttonsize, 3);

  if (id === moMutant + ittypes && bignum_nonzero(G.clearing_imputed)) {
    const bn = G.clearing_imputed.clone().add(new bignum(qty));
    str = short_form(bn);
    bsize = idiv(buttonsize, 4);
  }

  if (str !== '') {
    if (textwidth(bsize, str) < buttonsize)
      displayfr(cx + buttonsize, cy + idiv(buttonsize, 2) - idiv(bsize, 2), 1, bsize, str, color, 16);
    else
      displayfr(cx, cy + idiv(buttonsize, 2) - idiv(bsize, 2), 1, bsize, str, color, 0);
  }

  return b;
}

function displayglyph2(cx: number, cy: number, buttonsize: number, i: number): void {

  const glyph = i < ittypes ? iinf[i].glyph : minf[i - ittypes].glyph;
  const color = i < ittypes ? iinf[i].color : minf[i - ittypes].color;
  const imp = glyphflags(i);

  if (displayglyph(cx, cy, buttonsize, glyph, color, ikmerge(i), imp, i)) {
    G.instat = true;
    G.getcstat = SDLK_F1;
    if (i < ittypes) {
      const it: eItem = i;
      const t = itemclass(it);
      if (t === IC_TREASURE)
        G.mouseovers = XLAT('treasure collected: %1', spI(it));
      if (t === IC_OTHER)
        G.mouseovers = XLAT('objects found: %1', spI(it));
      if (t === IC_NAI)
        G.mouseovers = XLATT1(spI(it));
      if (t === IC_ORB)
        G.mouseovers = XLAT('orb power: %1', spI(i));
      if (it === itGreenStone) {
        G.mouseovers += XLAT(' (click to drop)');
        G.getcstat = ch('g');
      }
      if (it === itStrongWind) {
        G.mouseovers += XLAT(' (click to use)');
        G.getcstat = ch('t');
      }
      if (it === itInventory) {
        G.mouseovers += XLAT(' (click to use)');
        G.getcstat = ch('i');
      }
      if (it === itCrossbow) {
        if (G.items[it])
          G.mouseovers += XLAT(' (turns to reload: %1)', its(G.items[it]));
        else if (G.items[it] && G.bow_fire_mode)
          G.mouseovers += XLAT(' (fire mode on / turns to reload: %1)', its(G.items[it]));
        else if (G.bow_fire_mode)
          G.mouseovers += XLAT(' (fire mode on)');
        else
          G.mouseovers += XLAT(' (click to fire)');
        G.getcstat = ch('f');
      }
      if (imp & GLYPH_LOCAL) G.mouseovers += XLAT(' (local treasure)');
      G.help = generateHelpForItem(it);
    }
    else {
      const m: eMonster = i - ittypes;
      if (isMonsterPart(m))
        G.mouseovers = XLAT('parts destroyed: %1', spM(m));
      else if (isFriendly(m) && isNonliving(m))
        G.mouseovers = XLAT('friends destroyed: %1', spM(m));
      else if (isFriendly(m))
        G.mouseovers = XLAT('friends killed: %1', spM(m));
      else if (isNonliving(m))
        G.mouseovers = XLAT('monsters destroyed: %1', spM(m));
      else if (m === moTortoise)
        G.mouseovers = XLAT('animals killed: %1', spM(m));
      else
        G.mouseovers = XLAT('monsters killed: %1', spM(m));
      if (imp & GLYPH_LOCAL2) G.mouseovers += XLAT(' (killing increases treasure spawn)');
      else if (imp & GLYPH_LOCAL) G.mouseovers += XLAT(' (appears here)');
      G.help = generateHelpForMonster(m);
    }
  }
}

// CAP_SHAPES: drawMobileArrow (the mobile compass: haveMobileCompass is off on the desktop)

/** HUD margin in pixels. In mobile devices we need this margin because the corners are hidden. side==0: top,
 *  side==1: bottom */
export function hud_margin(_side: number): number {
  // ISIOS 24, ISANDROID 8, ISFAKEMOBILE 8
  return 0;
}

export function draw_crosshair(): void {
  const cd = G.current_display;
  const xc = cd.xcenter;
  const yc = cd.ycenter;

  const fme = flat_model_enabler();
  try {
    if (G.crosshair_color && G.crosshair_size > 0) {
      initquickqueue();
      G.vid.linewidth = 1;
      queueline(tC0_sm(atscreenpos(xc - G.crosshair_size, yc)), tC0_sm(atscreenpos(xc + G.crosshair_size, yc)), G.crosshair_color).prio = PPR.SUPERLINE;
      queueline(tC0_sm(atscreenpos(xc, yc - G.crosshair_size)), tC0_sm(atscreenpos(xc, yc + G.crosshair_size)), G.crosshair_color).prio = PPR.SUPERLINE;
      quickqueue();
    }
  }
  finally { fme.restore(); }
}

export function mode_description(): string {
  let md = '';
  if (G.autocheat) md += ' god';
  if (G.casual) md += ' casual';
  else if (G.cheater) md += ' cheat';
  if (G.inv_on) md += ' inv';
  if (G.tour_on) md += ' tour';
  if (G.shmup_on) md += ' shmup';
  if (G.multi_players > 1) md += ' P' + its(G.multi_players);
  if (pureHardcore()) md += ' hardcore';
  else if (G.hardcore) md += ' partial hardcore';
  if (G.lineofsightAt >= PURELOS_LEVEL) md += 'partial lineofsight';
  else if (G.lineofsight !== 0 /* los::none */) md += ' lineofsight';
  if (G.daily_on) md += ' strange';
  if (bow_crossbow_mode()) md += ' b/' + bow_bowName[G.bow_style];
  if (G.land_structure !== default_land_structure())
    md += ' ' + land_structure_name(true);
  if (G.randomPatternsMode) md += ' RPM';
  if (G.use_custom_land_list) md += ' custom';
  if (G.geometry !== gNormal || !BITRUNCATED())
    md = md + ' ' + full_geometry_name();
  return md;
}

export function mode_description1(): string {
  const md = mode_description();
  if (md === '') return 'standard';
  return md.substring(1);
}

export function drawStats(): void {
  const vid = G.vid;
  if (vid.stereo_mode === 2 /* sLR */) return;
  draw_crosshair();
  if (G.nohud) return;
  if (callhandlers(false, G.hooks_prestats)) return;
  if (G.viewdists && G.show_distance_lists)
    throw new NotPorted('drawStats: expansion view_distances_dialog'); // STAGE2-STUB (get_expansion().view_distances_dialog())
  if (G.current_display.sidescreen) return;

  G.first_cell_to_draw = true;
  const h = hide_player();
  G.instat = false;

  const cornermode = (vid.xres > idiv(vid.yres * 85, 100) && vid.yres > idiv(vid.xres * 85, 100));

  const hyb = mhybrid();

  // MAXMDIM >= 4
  if (mhybrid()) throw new NotPorted('drawStats: hybrid::draw_underlying'); // STAGE2-STUB (product geometries)

  {

    G.radar_drawn = false;
    if (vid.radarsize > 0 && h)
      // CAP_RACING
      if (!G.racing_on)
        if (!G.peace_on)
          if (!(G.cmode & sm.MISSION))
            G.radar_drawn = true;

    if (G.radar_drawn)
      draw_radar(cornermode);

    const fme = flat_model_enabler();
    try {

      if (haveMobileCompass()) {
        throw new NotPorted('drawStats: the mobile compass'); // STAGE2-STUB (shmupballs, drawMobileArrow)
      }

      if (G.racing_on)
        // CAP_RACING
        throw new NotPorted('drawStats: racing::drawStats'); // STAGE2-STUB (racing)
      else if (!G.hr_hud_enabled) { }
      else if (cornermode) {
        const bycorner = [0, 0, 0, 0];
        for (let i = 0; i < glyphs; i++) if ((ikappear(i) || G.glyphpinned[i]) && (glyphflags(i) & GLYPH_INSQUARE))
          bycorner[glyphcorner(i)]++;
        updatesort();
        sort_glyphorder();
        const rad = idiv(Math.min(vid.xres, vid.yres), 2);
        for (let cor = 0; cor < 4; cor++) {
          for (let a = 5; a < 41; a++) {
            const s = idiv(Math.min(vid.xres, vid.yres), a);
            let spots = 0;
            for (let u = vid.fsize; u < idiv(vid.xres, 2) - s; u += s)
              for (let v = vid.fsize; v < idiv(vid.yres, 2) - s; v += s)
                if (Math.hypot(idiv(vid.xres, 2) - u - s, (idiv(vid.yres, 2) - v - s) / pconf().stretch) > rad) {
                  spots++;
                }
            if (spots >= bycorner[cor] && spots >= 3) {
              let next = 0;
              const glyphstoshow: number[] = [];
              for (let i = 0; i < glyphs; i++) {
                const g = glyphorder[i];
                if ((ikappear(g) || G.glyphpinned[g]) && (glyphflags(g) & GLYPH_INSQUARE) && glyphcorner(g) === cor)
                  glyphstoshow.push(g);
              }
              for (let u = vid.fsize; u < idiv(vid.xres, 2) - s; u += s)
                for (let v = vid.fsize; v < idiv(vid.yres, 2) - s; v += s)
                  if (Math.hypot(idiv(vid.xres, 2) - u - s, (idiv(vid.yres, 2) - v - s) / pconf().stretch) > rad) {
                    if (next >= isize(glyphstoshow)) break; // (breaks the inner loop only, as in C++)

                    let cx = u;
                    let cy = v + idiv(s, 2);
                    if (cor & 1) cx = vid.xres - 1 - s - cx;
                    if (cor & 2) cy = vid.yres - 1 - cy;

                    const g = glyphstoshow[next++];
                    if (ikappear(g)) displayglyph2(cx, cy, s, g);
                  }
              break;
            }
          }
        }
      }

      else {
        const cd = G.current_display;

        const portrait = vid.xres < vid.yres;
        const colspace = portrait ? (cd.ycenter - cd.scrsize - 3 * vid.fsize) : idiv(vid.xres - vid.yres - 16, 2);
        let radar_size = 0;
        if (G.radar_drawn) radar_size = itrunc(2 * vid.radarsize + 10 + 3.5 * vid.fsize);
        if (hyb) throw new NotPorted('drawStats: hybrid::underlying_scale'); // STAGE2-STUB (product geometries)

        const rowspace = portrait ? vid.xres - 16 : vid.yres - Math.max(radar_size, vid.fsize * (vid.msgleft ? 9 : 4));
        const colid = [0, 0, 0, 0], rowid = [0, 0, 0, 0];
        const maxbyclass = [0, 0, 0, 0];

        const flag = portrait ? GLYPH_INPORTRAIT : GLYPH_INLANDSCAPE;

        for (let i = 0; i < glyphs; i++) if (ikappear(i) || G.glyphpinned[i])
          if (glyphflags(i) & flag)
            maxbyclass[glyphclass(i)]++;
        let buttonsize: number;
        let columns: number, rows: number;
        let imponly = false;
        const minsize = vid.fsize * (portrait ? 3 : 2);
        rows = 0;
        while ((buttonsize = minsize - vid.killreduction)) {
          columns = idiv(colspace, buttonsize);
          rows = idiv(rowspace, buttonsize); if (!rows) return;
          let coltaken = 0;
          for (let z = 0; z < 4; z++) {
            if (z === 1 && G.orb_treasure_gap) coltaken++;
            if (z === 2 && !portrait) {
              if (coltaken > columns) { vid.killreduction++; continue; } // (the next z, as in C++)
              coltaken = 0;
            }
            colid[z] = coltaken, rowid[z] = 0,
            coltaken += idiv(maxbyclass[z] + rows - 1, rows);
          }
          if (coltaken > columns) { vid.killreduction++; continue; }
          break;
        }

        if (buttonsize <= idiv(vid.fsize * 3, 4)) {
          imponly = true; buttonsize = minsize;
          rows = idiv(rowspace, buttonsize); if (!rows) return;
          colid[0] = 0; colid[2] = portrait ? 1 : 0;
        }

        updatesort();
        sort_glyphorder();

        for (let i0 = 0; i0 < glyphs; i0++) {
          const i = glyphorder[i0];
          if (!ikappear(i) && !G.glyphpinned[i]) continue;
          let z = glyphclass(i);
          const imp = glyphflags(i);
          if (!(imp & flag)) continue;
          if (imponly) { z &= ~1; if (!(imp & GLYPH_IMPORTANT)) continue; }

          let cx: number, cy: number;
          if (portrait)
            cx = 8 + buttonsize * rowid[z], cy = vid.fsize * 2 + buttonsize * (colid[z]) + idiv(buttonsize, 2) + hud_margin(0);
          else
            cx = 8 + buttonsize * (colid[z]), cy = vid.fsize * 3 + buttonsize * rowid[z] + hud_margin(0);

          if (!portrait && z < 2) cx = vid.xres - cx - buttonsize;

          rowid[z]++; if (rowid[z] >= rows) rowid[z] = 0, colid[z]++;

          if (ikappear(i)) displayglyph2(cx, cy, buttonsize, i);
        }
      }
    }
    finally { fme.restore(); }
  }
  glflush();
  calcparam();

  const top_y = vid.fsize + hud_margin(0);

  if (G.racing_on) {
    // CAP_RACING
    throw new NotPorted('drawStats: the race times'); // STAGE2-STUB (racing)
  }
  else if (!G.peace_on) {
    const scoreline = XLAT('score: %1', its(gold()));
    if (displayButtonS(vid.xres - 8, top_y, scoreline, G.forecolor, 16, vid.fsize)) {
      G.mouseovers = XLAT('Your total wealth'),
      G.instat = true,
      G.getcstat = SDLK_F1,
      G.help = helptitle(XLAT('Your total wealth'), 0xFFD500) +
      XLAT(
        'The total value of the treasure you have collected.\n\n' +
        'Every world type contains a specific type of treasure, worth 1 $$$; ' +
        'your goal is to collect as much treasure as possible, but every treasure you find ' +
        'causes more enemies to hunt you in its native land.\n\n' +
        'Orbs of Yendor are worth 50 $$$ each.\n\n',
      );
    }
    let s = XLAT('kills: %1', its(tkills()));
    G.long_kills = false;
    let siz = vid.fsize;
    if (G.cwt.at.land === laClearing && bignum_approx_ld(G.clearing_imputed) >= 100000) {
      G.long_kills = true;
      s = XLAT('leaves cut: %1', new bignum(G.kills[moMutant]).add(G.clearing_imputed).get_str(200));
      if (G.mouseovers === standard_help()) G.mouseovers = ' ';
      while (siz > 4 && textwidth(siz, s) > vid.xres - textwidth(vid.fsize, scoreline)) siz--;
    }

    if (!G.hide_kills && displayButtonS(8, top_y, s, G.forecolor, 0, siz)) {
      G.instat = true;
      G.getcstat = SDLK_F1;
      if (G.long_kills) { G.mouseovers = ' '; G.help = generateHelpForMonster(moMutant); }
      else {
        G.mouseovers = XLAT('Your total kills') + ': ' + its(tkills()),
        G.help = helptitle(XLAT('Your total kills') + ': ' + its(tkills()), 0x404040) +
          XLAT(
          'In most lands, more treasures are generated with each enemy native to this land you kill. ' +
          'Moreover, 100 kills is a requirement to enter the Graveyard and the Hive.\n\n' +
          'Friendly creatures and parts of monsters (such as the Ivy) do appear in the list, ' +
          'but are not counted in the total kill count.');
      }
    }
  }
  let vers = VER;
  if (true) {
    if (G.modename.has(G.current_modecode)) vers += " '" + G.modename.get(G.current_modecode) + "' ";
    vers += mode_description();
    if (G.peace_on) vers += ' peace';
    if (G.racing_on) vers += ' racing';
    if (G.princess_challenge) vers += ' Princess';
    if (G.yendor_on) vers += ' Yendor';
    if (G.tactic_on) vers += ' PTM';
  }
  if (!G.nofps) vers += XLAT(' fps: ') + its(calcfps());

  // CAP_MEMORY_RESERVE
  if (G.reserve_limit && G.reserve_count < G.reserve_limit) {
    vers += ' ' + its(G.reserve_count) + '/' + its(G.reserve_limit) + ' MB';
    if (displayButtonS(4, vid.yres - 4 - idiv(vid.fsize, 2) - hud_margin(1), vers, 0xFF2020, 0, idiv(vid.fsize, 2)))
      G.getcstat = PSEUDOKEY_MEMORY, G.instat = true;
  }
  else
  if (!G.hide_watermark && displayButtonS(4, vid.yres - 4 - idiv(vid.fsize, 2) - hud_margin(1), vers, 0x202020, 0, idiv(vid.fsize, 2))) {
    G.mouseovers = XLAT('frames per second'),
    G.getcstat = SDLK_F1,
    G.instat = true,
    G.help =
      helptitle(XLAT('frames per second'), 0xFF4040) +
      XLAT(
      'The higher the number, the smoother the animations in the game. ' +
      'If you find that animations are not smooth enough, you can try ' +
      'to change the options ',
      ) +
      XLAT(
      '(press v) and change the wall/monster mode to ASCII, or change ' +
      'the resolution.');
  }

  glflush();
  achievement_display();

  callhooks(G.hooks_stats);
}

/** static constexpr int PSEUDOKEY_MEMORY = 16397 (savemem.cpp) */
const PSEUDOKEY_MEMORY = 16397;
