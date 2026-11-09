// scores.cpp of HyperRogue 13.1o (stage 2, package U2): the local high score list read from the score file
// (namespace scores: load, the score screen, the column picker). (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// Names: scores::x -> scores_x; the file-local variables of the namespace are module-level `let`s. The score file is
// read through cfile.ts (the account storage in the browser). Strings: the score file's lines are byte strings
// (cfile.ts), the version and the YASC message are shown as read.
import { G } from './globals.ts';
import { idiv } from './cpp.ts';
import { fopen, fclose, fgets, fscanf_d, fscanf_s, feof, printf, strftime_c, cstr_to_bytes } from './cfile.ts';
import { its } from './hprint.ts';
import { isize } from './hyper.ts';
import { XLAT, XLATN, XLATT1, spL } from './language.ts';
import { ginf, gNormal, gSphere, gElliptic, GOLDBERG, eVariation } from './classes.ts';
import { landtypes, itOrbSafety, itOrbLightning } from './content.ts';
import {
  score, MAXBOX, POSSCORE, MODECODE_BOX, bpGUARD, scores_saveBox, scores_applyBoxes, verless,
} from './system.ts';
import { modecode, get_identify } from './yendor.ts';
import { PUREHARDCORE_LEVEL, pureHardcore } from './checkmove.ts';
import { PURELOS_LEVEL } from './environment.ts';
import { addMessage, clearMessages, displaystr, displayButton, textwidth } from './basegraph.ts';
import {
  dialog_init_t, dialog_addBreak, dialog_start_list, dialog_addItem, dialog_add_action, dialog_end_list,
  dialog_addBack, dialog_display, dialog_handleNavigation, dialog_editInfix, dialog_hasInfix, dialog_keyname, IFM,
} from './dialogs.ts';
import { gamescreen, popScreen } from './graph.ts';
import { pushScreen, doexiton, get_direction_key, is_joy_index, deck } from './control.ts';
import { SDLK_ESCAPE, SDLK_LEFT, SDLK_RIGHT, SDLK_UP, SDLK_DOWN, PSEUDOKEY_WHEELUP, PSEUDOKEY_WHEELDOWN } from './sdl.ts';

const ch = (c: string): number => c.charCodeAt(0);
/** #define DKEY (get_direction_key(sym, uni)) */
const DKEY = (sym: number, uni: number): number => get_direction_key(sym, uni);

/** vector<score> scores */
let scores: score[] = [];

let scorefrom = 0;
let scorerev = false;

let which_mode = 0;

/** string csub(const string& str, int q): the first q characters (getnext: UTF-8 characters) */
function csub(str: string, q: number): string {
  return Array.from(str).slice(0, q).join('');
}

/** vector<int> column_width(POSSCORE+1, 4) (made on first use: POSSCORE is system.ts's, not a leaf module's) */
let column_width: number[] = [];

function colwidth(scoredisplay: number): number {
  return column_width[scoredisplay];
}

function isHardcore(S: score): boolean {
  return !!S.box[117] && S.box[118] < PUREHARDCORE_LEVEL;
}

function modediff(S: score): number {
  let diff = 0;
  let g = S.box[116];
  if (S.box[306] !== (G.inv_on ? 1 : 0)) diff += 4;
  if (S.box[238]) g = gSphere;
  if (S.box[239]) g = gElliptic;
  if (Math.max(S.box[197], 1) !== G.multi_players) diff += 8;

  const savevar =
    S.box[341] ? eVariation.goldberg :
      S.box[344] ? eVariation.irregular :
        S.box[186];

  if (G.variation !== savevar) diff += 16;
  if (GOLDBERG() && savevar === eVariation.goldberg && (S.box[342] !== G.gp_param[0] || S.box[343] !== G.gp_param[1]))
    diff += 16;
  if (S.box[196] !== G.land_structure) diff += 32;
  if (S.box[119] !== (G.shmup_on ? 1 : 0)) diff += 64;
  if (pureHardcore() && !isHardcore(S)) diff += 128;
  if ((S.box[422] < PURELOS_LEVEL) !== (G.lineofsightAt < PURELOS_LEVEL)) diff += 8;
  else if (S.box[421] !== G.lineofsight) diff += 8;

  if (g !== gNormal && S.box[120] !== G.specialland)
    diff += 256;
  if (g !== G.geometry) {
    diff += 512;
  }
  return -diff;
}

function modedesc(S: score): string {
  const mc = S.box[MODECODE_BOX];
  if (mc && G.mode_description_of.has(mc)) return G.mode_description_of.get(mc)!;
  let g = S.box[116];
  if (S.box[238]) g = gSphere;
  if (S.box[239]) g = gElliptic;
  let s = ginf[g].shortname;
  if (g !== gNormal) s += ' ' + csub(XLATT1(spL(S.box[120])), 3);
  if (S.box[341]) s += '/GP(' + its(S.box[342]) + ',' + its(S.box[343]) + ')';
  else if (S.box[186]) s += '/7';
  if (S.box[196]) s += '/C';
  if (S.box[119]) s += '/s';
  if (S.box[197] > 1) s += '/P' + its(S.box[197]);
  if (S.box[306]) s += '/i';
  if (isHardcore(S)) s += '/h';
  if (S.box[421] === 1 && S.box[422] < PURELOS_LEVEL) s += '/l1';
  if (S.box[421] === 2 && S.box[422] < PURELOS_LEVEL) s += '/l2';
  if (S.box[422] >= PURELOS_LEVEL) s += '/l?';
  return s;
}

function displayfor(scoredisplay: number, S: score | null, shorten = false): string {
  if (S === null) {
    if (scoredisplay === POSSCORE) return 'mode';
    const str = XLATN(G.scores_boxname[scoredisplay]);
    if (!shorten) return str;
    if (scoredisplay === 65) return XLAT('time');
    if (scoredisplay === 2) return '$$$';
    if (scoredisplay === 3) return XLAT('kills');
    if (scoredisplay === 4) return XLAT('turns');
    if (scoredisplay === 5) return XLAT('cells');
    if (scoredisplay === 67) return XLAT('cheats');
    if (scoredisplay === 66) return XLAT('saves');
    if (scoredisplay === 197) return XLAT('players');
    if (scoredisplay === 68) return XLAT('where');
    return csub(str, 5);
  }
  if (scoredisplay === 65) {
    const t = S.box[0];
    const p2 = (n: number): string => String(n).padStart(2, '0');
    if (t >= 3600)
      return `${idiv(t, 3600)}:${p2(idiv(t, 60) % 60)}:${p2(t % 60)}`;
    else
      return `${idiv(t, 60)}:${p2(t % 60)}`;
  }
  if (scoredisplay === POSSCORE) return modedesc(S);
  if (scoredisplay === 68) {
    const which = S.box[68];
    if (which >= landtypes || which < 0) return 'fail';
    return S.yasc_message + XLAT(' in %the1', spL(which));
  }
  if (scoredisplay === 1) {
    return strftime_c(S.box[1]); // strftime(buf, 128, "%c", localtime(&tim))
  }
  return its(S.box[scoredisplay]);
}

let curcol = 0;

/** vector<int> columns */
let columns: number[] = [];

/** void showPickScores() */
function showPickScores(): void {

  G.dialog_v.length = 0;

  scorerev = false;

  for (let i = 1; i <= POSSCORE; i++) {
    const scoredisplay = i;
    if (!G.scores_fakebox[scoredisplay]) {
      const s = displayfor(scoredisplay, null);
      if (dialog_hasInfix(s))
        G.dialog_v.push([s, i]);
    }
  }
  // sort(dialog::v.begin(), dialog::v.end()): pairs, by the string (bytes), then the number
  G.dialog_v.sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : a[1] - b[1]);

  G.cmode = 0n;
  gamescreen();
  dialog_init_t(XLAT('pick scores'));
  if (G.dialog_infix !== '') G.mouseovers = G.dialog_infix;

  dialog_addBreak(50);
  dialog_start_list(900, 900, ch('1'));

  for (const vi of G.dialog_v) {
    dialog_addItem(vi[0], G.dialog_list_fake_key++);
    dialog_add_action(() => {
      const scoredisplay = vi[1];
      for (let i = 1; i <= POSSCORE; i++)
        if (columns[i] === scoredisplay) { const t = columns[i]; columns[i] = columns[curcol]; columns[curcol] = t; }
      popScreen();
    });
  }
  dialog_end_list();
  dialog_addBack();
  dialog_display();

  G.mouseovers = G.dialog_infix;
  G.keyhandler = (sym: number, uni: number) => {
    const k = { sym, uni };
    dialog_handleNavigation(k);
    sym = k.sym; uni = k.uni;
    if (dialog_editInfix(sym, uni)) G.dialog_list_skip = 0;
    else if (doexiton(sym, uni)) popScreen();
  };
}

let first_col = 0;

// static int scoredragy; static bool lclicked;
let scoredragy = 0;
let lclicked = false;

/** void show() */
function show(): void {

  if (column_width.length === 0) column_width = new Array<number>(POSSCORE + 1).fill(4);
  if (columns.length === 0) {
    columns.push(POSSCORE);

    for (let j = 0; j < bpGUARD; j++)
      for (let i = 1; i < POSSCORE; i++) if (!G.scores_fakebox[i] && G.scores_boxprio[i] === j) {
        columns.push(i);
      }
  }
  const score_size = idiv(G.vid.fsize, G.scores_scale);
  let y = idiv(score_size * 5, 2);
  const bx = score_size;
  G.getcstat = 0;

  displaystr(bx * 4, score_size, 0, score_size, '#', G.forecolor, 16);
  displaystr(bx * 8, score_size, 0, score_size, XLAT('ver'), G.forecolor, 16);

  let not_shown = false;
  if (curcol < first_col) first_col = curcol;
  const numcol = isize(columns);

  let at = 9;
  for (let i = first_col; i < numcol; i++) {
    const c = columns[i];
    if (bx * at > G.vid.xres) {
      not_shown = i <= curcol;
      break;
    }
    const s = displayfor(c, null, true);
    column_width[c] = Math.max(column_width[c], idiv(textwidth(score_size, s), bx) + 1);
    if (displaystr(bx * at, score_size, 0, score_size, s, i === curcol ? 0xFFD500 : G.forecolor, 0))
      G.getcstat = 1000 + i;
    at += colwidth(c);
  }

  const next_column_width = new Array<number>(POSSCORE + 1).fill(0);

  if (scorefrom < 0) scorefrom = 0;
  let id = 0;
  let omit = scorefrom;
  let rank = 0;
  while (y < G.vid.yres - 2 * G.vid.fsize) { // ISMOBILE ? vid.yres - 5*vid.fsize : vid.yres - 2 * vid.fsize
    if (id >= isize(scores)) break;

    const S = scores[id];

    if (S.box[MODECODE_BOX] !== which_mode && which_mode !== -1) { id++; continue; }

    if (omit) { omit--; rank++; id++; continue; }

    const cur = !!S.box[MAXBOX - 1];
    if (cur) {
      scores_saveBox();
      for (let i = 0; i < POSSCORE; i++) S.box[i] = G.scores_save.box[i];
      S.box[0] = S.box[65];
    }
    const col = cur ? 0xFFD500 : 0xC0C0C0;


    rank++;
    displaystr(bx * 4, y, 0, score_size, its(rank), col, 16);

    displaystr(bx * 8, y, 0, score_size, S.ver, col, 16);

    let at = 9;
    for (let i = first_col; i < numcol; i++) {
      const c = columns[i];
      if (bx * at > G.vid.xres) break;
      const s = displayfor(c, S);
      next_column_width[c] = Math.max(next_column_width[c], idiv(textwidth(score_size, s), bx) + 1);
      if (c === 68) {
        if (displaystr(bx * at, y, 0, score_size, s, col, 0))
          G.getcstat = 1000 + i;
        at += colwidth(c);
      }
      else {
        at += colwidth(c);
        if (displaystr(bx * (at - 1), y, 0, score_size, s, col, 16))
          G.getcstat = 1000 + i;
      }
    }

    y += idiv(score_size * 5, 4); id++;
  }

  if (not_shown) first_col++;

  column_width = next_column_width;
  const i0 = G.vid.yres - G.vid.fsize;
  const xr = idiv(G.vid.xres, 80);

  displayButton(xr * 1, i0, IFM('s - ') + XLAT('sort'), ch('s'), 0);
  displayButton(xr * 15, i0, IFM('t - ') + XLAT('choose') + ': ' + displayfor(columns[curcol], null, false), ch('t'), 0);
  displayButton(xr * 60, i0, IFM('z - ') + XLAT('zoom'), ch('z'), 16);
  displayButton(xr * 79, i0, IFM(dialog_keyname(SDLK_ESCAPE) + ' - ') + XLAT('go back'), ch('0'), 16);

  G.keyhandler = (sym: number, uni: number) => {
    if (DKEY(sym, uni) === SDLK_LEFT || uni === ch('h') || uni === ch('a')) {
      scorerev = false;
      if (curcol > 0) curcol--;
    }
    else if (DKEY(sym, uni) === SDLK_RIGHT || uni === ch('l') || uni === ch('d')) {
      scorerev = false;
      if (curcol < numcol - 1) curcol++;
    }
    else if (sym >= 1000 && sym <= 1000 + POSSCORE) {
      scorerev = false;
      curcol = sym - 1000;
    }
    else if (uni === ch('t') || is_joy_index(sym, deck.enter)) { G.dialog_infix = ''; pushScreen(showPickScores); }
    else if (DKEY(sym, uni) === SDLK_UP || uni === ch('k') || uni === ch('w'))
      scorefrom -= 5;
    else if (DKEY(sym, uni) === SDLK_DOWN || uni === ch('j') || uni === ch('x'))
      scorefrom += 5;
    else if (uni === ch('z') || is_joy_index(sym, deck.alt_enter)) G.scores_scale = 3 - G.scores_scale;
    else if (sym === PSEUDOKEY_WHEELUP)
      scorefrom--;
    else if (sym === PSEUDOKEY_WHEELDOWN)
      scorefrom++;
    else if (uni === ch('s') || is_joy_index(sym, deck.space)) {
      if (scorerev) scores.reverse();
      else {
        scorerev = true;
        const c = columns[curcol];
        // stable_sort with s1.box[c] > s2.box[c] (Array.prototype.sort is stable)
        scores.sort((s1, s2) => s2.box[c] - s1.box[c]);
      }
    }
    else if (doexiton(sym, uni)) popScreen();
  };

  if (G.mousepressed) {
    if (!lclicked) {
      // scoredragx = mousex;
      scoredragy = G.mousey;
    }

    else {
      while (G.mousey > scoredragy + G.vid.fsize) scoredragy += G.vid.fsize, scorefrom--;
      while (G.mousey < scoredragy - G.vid.fsize) scoredragy -= G.vid.fsize, scorefrom++;
    }

    lclicked = G.mousepressed;
  }
  else lclicked = false;
}

/** void load_only() */
function load_only(): void {
  if (G.scorefile === '') return;
  scores = [];
  const f = fopen(G.scorefile, 'rt');
  if (!f) {
    printf(`Could not open the score file '${G.scorefile}'!\n`);
    addMessage('Could not open the score file: ' + G.scorefile);
    return;
  }
  let yasc: score | null = null;
  while (!feof(f)) {
    const buflen = 1200;
    const buf = fgets(buflen, f);
    if (buf === null) break;
    if (buf[0] === 'H' && buf[1] === 'y') {
      const sc = new score(); let ok = true;
      sc.box[MAXBOX - 1] = 0;
      { const w = fscanf_s(f, 1 << 30); if (w === null) break; sc.ver = w; }


      for (let i = 0; i < MAXBOX; i++) {
        const v = fscanf_d(f);
        if (v === null) { G.scores_boxid = i; break; }
        sc.box[i] = v;
      }

      for (let i = G.scores_boxid; i < MAXBOX; i++) sc.box[i] = 0;

      if (!verless(sc.ver, '4.4')) {
        sc.box[0] = sc.box[65];
        // the first executable on Steam included a corruption
        if (sc.box[65] > 1420000000 && sc.box[65] < 1430000000) {
          sc.box[0] = sc.box[65] - sc.box[1];
          sc.box[65] = sc.box[0];
        }
        // do not include saves
        if (sc.box[65 + 4 + itOrbSafety - itOrbLightning]) ok = false;
      }
      else
        sc.box[0] = sc.box[1] - sc.box[0]; // could not save then

      if (sc.box[2] === 0) continue; // do not list zero scores
      sc.box[POSSCORE] = modediff(sc);

      if (ok && G.scores_boxid > 20) {
        scores.push(sc);
        yasc = sc; // yasc = &scores.back().yasc_message
      }
    }
    if (buf[0] === 'Y' && buf[1] === 'A' && buf[2] === 'S' && buf[3] === 'C' && buf[4] === ' ') {
      let e = 5;
      while (e < buf.length && buf[e] !== '\n' && buf[e] !== '\r') e++;
      // *yasc = buf+5 (a YASC line before any score: a null pointer); the bytes are UTF-8 (shown as text)
      if (yasc) yasc.yasc_message = new TextDecoder().decode(cstr_to_bytes(buf.slice(5, e)));
    }
  }

  fclose(f);

  G.qty_scores_for.clear();
  for (const s of scores) {
    const modeid = s.box[MODECODE_BOX];
    const k = get_identify(modeid);
    G.qty_scores_for.set(k, (G.qty_scores_for.get(k) ?? 0) + 1);
  }
}

/** void scores::load() */
export function scores_load(): void {
  load_only();
  which_mode = -1;

  G.scores_saved_modecode = modecode();
  scores_saveBox();
  const sc = new score();
  for (let i = 0; i < POSSCORE; i++) sc.box[i] = G.scores_save.box[i];
  sc.box[POSSCORE] = 0;
  sc.box[MAXBOX - 1] = 1; sc.ver = 'NOW';
  sc.yasc_message = G.canmove ? 'on the run' : G.yasc_message;
  scores.push(sc);

  clearMessages();
  // addMessage(its(isize(scores))+" games have been recorded in "+scorefile);
  pushScreen(show);
  G.scores_boxid = 0; scores_applyBoxes();
  scores.reverse();
  scorefrom = 0;
  // stable_sort by tie(box[POSSCORE], box[2]) descending
  scores.sort((s1, s2) => (s2.box[POSSCORE] - s1.box[POSSCORE]) || (s2.box[2] - s1.box[2]));
}

/** for tests: the scores read by the last load (scores::scores) */
export function scores_list(): readonly score[] { return scores; }
