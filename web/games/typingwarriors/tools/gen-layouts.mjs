#!/usr/bin/env node
// Typing Warriors: writes src/layouts.data.ts from the keyboard layout definitions of xkeyboard-config
// (the reference definitions of these layouts on Linux, where the Neo project maintains its own) and,
// for Mine, from the Neo project's own xkb file (https://dl.neo-layout.org/mine_2.39).
//
//   node tools/gen-layouts.mjs [--xkb /usr/share/X11/xkb] [--mine <dir with symbols/mine>] [--print] [--check]
//
// --check writes nothing: it exits with 1 when the committed src/layouts.data.ts differs from what it generates.
//
// Needs `xkbcomp` (it resolves the includes) and X11's keysymdef.h (keysym name -> Unicode).
// Without --mine the Mine file is downloaded into a temporary folder. --print shows every layout's rows.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const XKB = opt('--xkb', '/usr/share/X11/xkb');
const KEYSYMDEF = opt('--keysymdef', '/usr/include/X11/keysymdef.h');
const here = dirname(fileURLToPath(import.meta.url));
const tmp = mkdtempSync(join(tmpdir(), 'tw-layouts-'));
let mineDir = opt('--mine', '');
if (!mineDir) {
  mineDir = join(tmp, 'mine');
  mkdirSync(join(mineDir, 'symbols'), { recursive: true });
  execFileSync('curl', ['-sSfL', '-o', join(mineDir, 'symbols', 'mine'), 'https://dl.neo-layout.org/mine_2.39']);
}

// [id, name, xkb symbols, family, physical form, a line about it]
const LAYOUTS = [
  ['qwertz', 'QWERTZ (Deutsch)', 'de', 'standard', 'iso', 'The German standard layout.'],
  ['qwertz-ch', 'QWERTZ (Schweiz)', 'ch', 'standard', 'iso', 'The Swiss German layout.'],
  ['qwerty', 'QWERTY (US)', 'us', 'standard', 'ansi', 'The US English layout.'],
  ['qwerty-uk', 'QWERTY (UK)', 'gb', 'standard', 'iso', 'The British layout.'],
  ['azerty', 'AZERTY (Français)', 'fr', 'standard', 'iso', 'The French layout.'],
  ['dvorak', 'Dvorak (US)', 'us(dvorak)', 'standard', 'ansi', 'August Dvorak\'s simplified keyboard.'],
  ['colemak', 'Colemak', 'us(colemak)', 'standard', 'ansi', 'Shai Coleman\'s layout, close to QWERTY.'],
  ['colemak-dh', 'Colemak-DH (ANSI)', 'us(colemak_dh)', 'standard', 'ansi', 'Colemak with D and H moved off the middle columns; ANSI keyboards (X C D V Z).'],
  ['colemak-dh-iso', 'Colemak-DH (ISO)', 'us(colemak_dh_iso)', 'standard', 'iso', 'Colemak-DH for ISO keyboards (Z on the key next to left Shift).'],
  ['workman', 'Workman', 'us(workman)', 'standard', 'ansi', 'OJ Bucao\'s layout.'],
  ['norman', 'Norman', 'us(norman)', 'standard', 'ansi', 'David Norman\'s layout.'],
  ['bepo', 'Bépo', 'fr(bepo)', 'standard', 'iso', 'The French ergonomic layout.'],
  ['neo2', 'Neo 2', 'de(neo)', 'neo', 'iso', 'The main layout of the Neo family.'],
  ['neoqwertz', 'NeoQwertz', 'de(neo_qwertz)', 'neo', 'iso', 'QWERTZ letters with Neo\'s levels 3 and 4.'],
  ['neoqwerty', 'NeoQwerty', 'de(neo_qwerty)', 'neo', 'iso', 'QWERTY letters with Neo\'s levels 3 and 4.'],
  ['bone', 'Bone', 'de(bone)', 'neo', 'iso', 'A computer-optimised successor of Neo 2.'],
  ['mine', 'Mine', 'mine(mine)', 'neo', 'iso', 'Optimised for German with 30 % English.'],
  ['noted', 'Noted', 'de(noted)', 'neo', 'iso', 'Optimised for German and English.'],
  ['adnw', 'AdNW', 'de(adnw)', 'neo', 'iso', 'Aus der Neo-Welt: German and English.'],
  ['koy', 'KOY', 'de(koy)', 'neo', 'iso', 'A successor of AdNW.'],
  ['3l', '3l', 'us(3l)', 'neo', 'ansi', 'Three-layer layout for English.'],
];

// xkb key name -> KeyboardEvent.code
const CODES = { TLDE: 'Backquote', BKSL: 'Backslash', LSGT: 'IntlBackslash', SPCE: 'Space', CAPS: 'CapsLock', RALT: 'AltRight', TAB: 'Tab' };
const row = (prefix, codes) => codes.forEach((c, i) => { CODES[`${prefix}${String(i + 1).padStart(2, '0')}`] = c; });
row('AE', ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal']);
row('AD', ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight']);
row('AC', ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote']);
row('AB', ['KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash']);
const isCharKey = (xkbName) => /^(TLDE|BKSL|LSGT|A[B-E]\d\d)$/.test(xkbName);

// keysym name -> character
const SYM = new Map();
for (const line of readFileSync(KEYSYMDEF, 'utf8').split('\n')) {
  const m = /^#define XK_(\w+)\s+0x([0-9a-f]+)\s*\/\*[ (]*U\+([0-9A-F]{4,6})/.exec(line);
  if (m && !SYM.has(m[1])) SYM.set(m[1], String.fromCodePoint(parseInt(m[3], 16)));
}
// dead keys: shown on the helper keyboard as a dotted circle with the accent, never typed as text
const DEAD = { grave: '`', acute: '´', circumflex: '^', tilde: '~', diaeresis: '¨', cedilla: '¸', caron: 'ˇ', breve: '˘', abovedot: '˙', abovering: '˚',
  doubleacute: '˝', ogonek: '˛', macron: '¯', stroke: '/', belowdot: '.', hook: '?', horn: '\'', greek: 'µ', currency: '¤', belowcomma: ',',
  doublegrave: '``', invertedbreve: '^', dasia: '῾', psili: '᾿', belowmacron: '_', belowcircumflex: '^', belowtilde: '~', belowbreve: '˘',
  belowdiaeresis: '¨', belowring: '˚', abovecomma: '᾿', abovereversedcomma: '῾', iota: 'ι', longsolidusoverlay: '/', perispomeni: '~' };
// names keysymdef.h lists only as deprecated aliases, and the keypad keys of Neo's level 4
const EXTRA = { guillemotleft: '«', guillemotright: '»', masculine: 'º', KP_Divide: '/', KP_Multiply: '*', KP_Subtract: '-', KP_Add: '+', KP_Decimal: '.' };
for (let d = 0; d <= 9; d++) EXTRA[`KP_${d}`] = String(d);
// not characters (or, KP_Separator, a different one per locale): the key shows nothing on that level
const NONE = /^(ISO_|Prior$|Next$|Up$|Down$|Left$|Right$|Home$|End$|Insert$|Delete$|Undo$|Redo$|BackSpace$|Tab$|Escape$|Return$|KP_Separator$|KP_Enter$|Multi_key$)/;
const unknown = new Set();
function char(sym) {
  if (!sym || sym === 'NoSymbol' || sym === 'VoidSymbol') return '';
  let m;
  if ((m = /^U([0-9A-Fa-f]{4,6})$/.exec(sym))) return String.fromCodePoint(parseInt(m[1], 16));
  if ((m = /^0x10([0-9a-fA-F]{5})$/.exec(sym))) return String.fromCodePoint(parseInt(m[1], 16));
  if ((m = /^dead_(\w+)$/.exec(sym))) return `◌${DEAD[m[1]] ?? '?'}`;
  if (/^[0-9]$/.test(sym)) return sym;
  if (EXTRA[sym]) return EXTRA[sym];
  if (NONE.test(sym)) return '';
  const c = SYM.get(sym);
  if (!c) { unknown.add(sym); return ''; }
  const cp = c.codePointAt(0);
  return cp < 0x20 || cp === 0x7f ? '' : c; // Tab, Escape, BackSpace...: not characters
}

function compile(symbols) {
  const src = join(tmp, 'in.xkb'), out = join(tmp, 'out.xkb');
  writeFileSync(src, `xkb_keymap {\n xkb_keycodes { include "evdev+aliases(qwerty)" };\n xkb_types { include "complete" };\n xkb_compat { include "complete" };\n xkb_symbols { include "pc+${symbols}+inet(evdev)" };\n};\n`);
  execFileSync('xkbcomp', ['-w', '0', `-I${mineDir}`, `-I${XKB}`, '-xkb', src, out], { stdio: ['ignore', 'ignore', 'inherit'] });
  const text = readFileSync(out, 'utf8');
  const keys = new Map();
  const re = /key\s+<(\w+)>\s*\{([^}]*)\}/g;
  let m;
  while ((m = re.exec(text))) {
    const body = m[2];
    const type = /type(?:\[\w+\])?\s*=\s*"([^"]+)"/.exec(body)?.[1] ?? '';
    const syms = /symbols\[Group1\]\s*=\s*\[([^\]]*)\]/.exec(body)?.[1] ?? /\[([^\]]*)\]/.exec(body)?.[1] ?? '';
    keys.set(m[1], { type, syms: syms.split(',').map((s) => s.trim()).filter(Boolean) });
  }
  return keys;
}

const out = [];
for (const [id, name, symbols, family, form, about] of LAYOUTS) {
  const keys = compile(symbols);
  // Neo family (eight levels): xkb levels 1, 2, 3 and 5 are Neo's levels 1 to 4 (5 = Mod4, numbers and navigation).
  // Everything else: levels 1 to 4 = plain, Shift, AltGr, Shift+AltGr.
  const eight = [...keys.values()].some((k) => k.type.startsWith('EIGHT_LEVEL'));
  const pick = eight ? [0, 1, 2, 4] : [0, 1, 2, 3];
  const map = {};
  for (const [xkbName, code] of Object.entries(CODES)) {
    if (!isCharKey(xkbName)) continue;
    const k = keys.get(xkbName);
    if (!k) continue;
    const levels = pick.map((i) => char(k.syms[i]));
    while (levels.length && !levels[levels.length - 1]) levels.pop();
    // a key that types nothing here (a modifier on a letter key, as 3l's Sym): left out
    if (!levels.length) continue;
    map[code] = levels;
  }
  const holding = (sym) => Object.entries(CODES).filter(([x]) => keys.get(x)?.syms[0] === sym).map(([, c]) => c);
  out.push({
    id, name, about, family, form,
    source: symbols.startsWith('mine') ? 'dl.neo-layout.org/mine_2.39' : `xkeyboard-config symbols/${symbols}`,
    levels: eight ? ['', 'Shift', 'Mod3', 'Mod4'] : ['', 'Shift', 'AltGr', 'Shift+AltGr'],
    mod3: eight ? holding('ISO_Level3_Shift') : ['AltRight'],
    mod4: eight ? holding('ISO_Level5_Shift') : [],
    keys: map,
  });
}
if (unknown.size) throw new Error(`keysyms without a character: ${[...unknown].join(' ')}`);

if (args.includes('--print')) {
  const R = [['Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal'],
    ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight'],
    ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote', 'Backslash'],
    ['IntlBackslash', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash']];
  for (const l of out) {
    console.log(`== ${l.id}: levels ${l.levels.join('|')}; mod3 ${l.mod3}; mod4 ${l.mod4}`);
    for (let lv = 0; lv < 4; lv++) console.log(R.map((r) => r.map((c) => l.keys[c]?.[lv] || '∅').join(' ')).join('  /  '));
  }
}

const version = execFileSync('sh', ['-c', 'rpm -q xkeyboard-config 2>/dev/null || pkg-config --modversion xkeyboard-config 2>/dev/null || echo unknown']).toString().trim();
// one line per key
const json = `[\n${out.map((l) => {
  const { keys, ...head } = l;
  const lines = Object.entries(keys).map(([code, levels]) => `   ${JSON.stringify(code)}: ${JSON.stringify(levels)}`);
  return `  { ...${JSON.stringify(head)},\n   keys: {\n${lines.join(',\n')},\n   } }`;
}).join(',\n')},\n]`;
const file = join(here, '..', 'src', 'layouts.data.ts');
const data = `// Typing Warriors: GPL-3.0-or-later (LICENSE.md).
// GENERATED by tools/gen-layouts.mjs from ${version} and https://dl.neo-layout.org/mine_2.39. Do not edit.
// keys: KeyboardEvent.code -> the character of each level (levels[]: which modifier reaches it); "" = nothing,
// "\\u25cc" + accent = a dead key. mod3 / mod4: the keys (codes) that hold the third and fourth level.
import type { LayoutData } from './layouts.ts';

export const LAYOUT_DATA: LayoutData[] = ${json};
`;
if (args.includes('--check')) {
  const same = readFileSync(file, 'utf8') === data;
  console.log(same ? `${out.length} layouts: src/layouts.data.ts is up to date` : 'src/layouts.data.ts differs from what the definitions give');
  process.exit(same ? 0 : 1);
}
writeFileSync(file, data);
console.log(`wrote ${out.length} layouts`);
