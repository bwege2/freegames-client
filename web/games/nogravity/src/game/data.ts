// No Gravity port (GPL-3.0-or-later; translated in 2026 by the freegames project from realtech VR's
// No Gravity 2.0, GPL-2.0-or-later; LICENSE.md): the game's data files: sprite groups and pictures
// (NG_LoadSpriteGroup, NG_LoadBackground, NG_LoadFonts, lt_start.c), the languages (NG_SetLanguage,
// NG_ReadLanguagePack), the mission list (NG_ReadMissionList, lt_save.c), the mission scripts
// (NG_StageReadFile, ccmx.c), the roster and the hall of fame (lt_save.c) and nogravity.ini (lt_info.c).
import { fileGet, fileText, fileExists, sysRand, s as SC } from '../sys/sys.ts';
import { readConfig, selectClass, getStr, getLong, getLong2, getBool, getBool2, loadTextList, fgetsLines, stricmp } from '../sys/ini.ts';
import { decodePng, type Picture } from '../gx/png.ts';
import { decodeFlc } from '../gx/flc.ts';
import { type SpriteGroup, type Sprite, type Sheet, makeSheet, sheetFromPicture, spriteGroupFromSheet, parseSpc, spriteOfSheet } from '../gx/gx.ts';
import {
  G, g_SGSettings, newScript, newSave, copyScript, MAX_EPISODE, MAX_SAVE_GAMES, MAX_PLAYER, type SGScript, type SGPlayerSave,
  type SGEpisodeItem, type SGLevelItem, type RWInterface, LK_MAX,
  t_SPECIAL, t_OBSTACLE, t_ENEMY, t_NEUTRAL, t_PIRAT, t_FRIEND, t_DECOR, t_PLAYER, t_ACCESSOIRE, t_TURN_AROUND_X, t_TURN_AROUND_Y,
  t_TURN_AROUND_Z, t_TURN_RANDOM, t_FIXE, t_GIANT, t_TAC_NONE, t_TAC_RANDOM_PATROL, t_TAC_PATROL_FIGHT1, t_TAC_ATTACK1,
  t_TAC_ATTACK0, t_TAC_TRACK, t_TAC_TRACKFREE, t_TAC_TRACKFULL, t_TAC_MINE, t_TAC_DROID, t_TAC_HIND, t_ET_WARP, t_AD_ADD_AIM,
  t_AD_FAILED, t_AD_SUCCESS, t_AD_EXPLODE, t_EC_ENABLE, t_EC_APPEAR, t_EC_SHIELDOFF, t_EC_SHIELDOFFDIE, t_EC_TRACK_TOGGLE,
  t_ET_SHOOT, t_ET_DESTROY, t_COL_NONE, t_COL_AUTOSPHERE, t_COL_AUTOSPHERE2, t_CS_ADD_SCORE_HIDE, t_CS_ADD_SCORE, t_CS_BUMP,
  t_CS_BUMP_LOSE_SHIELD, t_CS_LOSE_SHIELD, t_CS_WARP, t_CS_BONUS, t_CS_NAV, t_CS_NAVWARP,
} from './state.ts';

// ---------------------------------------------------------------- pictures and sprite groups
const pictures = new Map<string, Picture>();
export function picture(path: string): Picture {
  let p = pictures.get(path);
  if (!p) { p = decodePng(fileGet(path)); pictures.set(path, p); }
  return p;
}
const sheets = new Map<string, Sheet>();
/** a picture as a sheet (index 0 transparent) */
export function sheet(path: string, keyed = true): Sheet {
  const k = `${path}|${keyed}`;
  let s = sheets.get(k);
  if (!s) { s = sheetFromPicture(picture(path), keyed); sheets.set(k, s); }
  return s;
}
/** NG_LoadBackground: a full picture as one sprite */
export function loadBackground(path: string): Sprite { return spriteOfSheet(sheet(path, false)); }

/** NG_LoadSpriteGroup: <dir>\<name>.png + .spc; 128 = brief\, 64 = int\, else menu\ (the 640x480 screen needs no resize) */
export function loadSpriteGroup(name: string, resize: number): SpriteGroup {
  const dir = resize & 128 ? 'brief' : resize & 64 ? 'int' : 'menu';
  const sh = sheet(`${dir}/${name}.png`);
  return spriteGroupFromSheet(sh, parseSpc(fileGet(`${dir}/${name}.spc`)));
}
/** FLI_LoadToSpriteGroup: the frames of an FLC as a sprite group (each frame with its palette, index 0 transparent) */
const flcGroups = new Map<string, SpriteGroup>();
export function flcSpriteGroup(path: string): SpriteGroup {
  let g = flcGroups.get(path);
  if (g) return g;
  const f = decodeFlc(fileGet(path));
  const item: Sprite[] = f.frames.map((fr) => {
    const rgba = new Uint8Array(f.width * f.height * 4);
    for (let i = 0; i < fr.pixels.length; i++) {
      const k = fr.pixels[i] * 3;
      rgba[4 * i] = fr.palette[k]; rgba[4 * i + 1] = fr.palette[k + 1]; rgba[4 * i + 2] = fr.palette[k + 2];
      rgba[4 * i + 3] = fr.pixels[i] ? 255 : 0;
    }
    return spriteOfSheet(makeSheet(f.width, f.height, rgba));
  });
  g = { item, maxItem: item.length, speed: f.speed & 0xffff, HSpacing: 0, VSpacing: 0, Caps: 0 };
  flcGroups.set(path, g);
  return g;
}

/** NG_LoadFonts */
export function loadFonts(): void {
  G.g_pFontMenuLrg = loadSpriteGroup('lit_mn02', 1); G.g_pFontMenuLrg.HSpacing = 0;
  G.g_pFontMenuSml = loadSpriteGroup('lit_mn03', 1); G.g_pFontMenuSml.HSpacing = 0;
  G.g_pspMsg = loadSpriteGroup('mesg', 0);
  G.g_pFont = loadSpriteGroup('ffonte', 0); G.g_pFont.HSpacing = 1;
  G.g_pSmallFont = loadSpriteGroup('little', 0); G.g_pSmallFont.HSpacing = 1; G.g_pSmallFont.VSpacing = 1;
  G.g_pspHud2 = loadSpriteGroup('vx_sprit', 0); G.g_pspHud2.HSpacing = 1;
  G.g_pspCat = loadSpriteGroup('sheba', 0); G.g_pspCat.HSpacing = 1;
}

/** RW_Interface_GetFn: the zones of a .spc */
export function interfaceFromSpc(path: string): RWInterface {
  const rects = parseSpc(fileGet(path));
  return { numItem: rects.length, item: rects.map((r) => ({ X: r.a, Y: r.b, LX: r.c - r.a + 1, LY: r.d - r.b + 1, parent: null })), keymode: 0 };
}

// ---------------------------------------------------------------- languages
export let g_szLanguageList: string[] = [];
/** NG_SetLanguage: voix\<language>.msg, "n,text" lines up to the one holding '@' */
export function setLanguage(l: number): void {
  const lines = fgetsLines(fileText(`voix/${g_szLanguageList[l]}.msg`), 64);
  let i = 1;
  for (const tex of lines) {
    const c = tex.indexOf(',');
    if (c >= 0) {
      let t = tex.slice(c + 1).slice(0, 31);
      const cr = t.indexOf('\r');
      if (cr >= 0) t = t.slice(0, cr);
      G.g_szGmT[i] = t.replace(/\n$/, '');
    }
    i++;
    if (tex.includes('@')) break;
  }
  g_SGSettings.LangCode = g_szLanguageList[g_SGSettings.Language].charCodeAt(0);
}
export function readLanguagePack(): void {
  g_szLanguageList = loadTextList(fileText('voix/language.msg'), 16);
  if (g_SGSettings.Language >= g_szLanguageList.length) g_SGSettings.Language = 0;
  setLanguage(g_SGSettings.Language);
}
export const T = (i: number): string => G.g_szGmT[i] ?? '';

// ---------------------------------------------------------------- missions
function readLevelInfo(c: ReturnType<typeof readConfig>): SGLevelItem {
  const tex: string[] = [];
  for (let j = 0; j < 16; j++) {
    const s = j < 15 ? getStr(`Line${j + 1}`, c) : null;
    tex.push(s ? s.slice(0, 30) : '');
  }
  return { name: (getStr('Name', c) ?? '').slice(0, 30), tex, WeaponMax: 1, Bonus: getLong('Bonus', c) & 0xffff, Time: getLong('Time', c) & 0xffff, Level: getLong('Level', c) & 0xffff };
}
const emptyLevel = (): SGLevelItem => ({ name: '', tex: new Array(16).fill(''), WeaponMax: 0, Bonus: 0, Time: 0, Level: 0 });
/** NG_ReadMissionList: cmx\<lang>_level<n>.cmx for the 8 episodes */
export function readMissionList(): void {
  G.g_pGameItem = [];
  for (let k = 0; k < MAX_EPISODE; k++) {
    const EP: SGEpisodeItem = { numLevel: 0, LI: Array.from({ length: 10 }, emptyLevel) };
    const path = `cmx/${String.fromCharCode(g_SGSettings.LangCode)}_level${k + 1}.cmx`;
    if (fileExists(path)) {
      const c = readConfig(fileText(path));
      for (let i = 0; i < 10; i++) {
        if (selectClass(`level_${i + 1}`, c)) { EP.LI[i] = readLevelInfo(c); EP.numLevel = i + 1; }
      }
    }
    G.g_pGameItem.push(EP);
  }
}

// ---------------------------------------------------------------- mission scripts (ccmx.c)
export interface StageLookups { fx: (s: string) => number; audio: (s: string) => number }
function getSifByName(s: string): SGScript {
  for (let i = 0; i < g_SGSettings.maxCase; i++) if (s === G.g_pPlayerInfo[i].Basename) return G.g_pPlayerInfo[i];
  throw new Error(`cmx: no case ${s}`);
}
const TYPES: Record<string, number> = {
  t_SPECIAL, t_OBSTACLE, t_ENEMY, t_NEUTRAL, t_PIRAT, t_FRIEND, t_DECOR, t_PLAYER, t_ACCESSOIRE,
};
const MOVES: Record<string, number> = { TURN_AROUND_X: t_TURN_AROUND_X, TURN_AROUND_Y: t_TURN_AROUND_Y, TURN_AROUND_Z: t_TURN_AROUND_Z, TURN_RANDOM: t_TURN_RANDOM, FIXE: t_FIXE, GIANT: t_GIANT };
const TACTICS: Record<string, number> = {
  NONE: t_TAC_NONE, RANDOM_PATROL: t_TAC_RANDOM_PATROL, FIGHT_PATROL1: t_TAC_PATROL_FIGHT1, ATTACK1: t_TAC_ATTACK1, ATTACK0: t_TAC_ATTACK0,
  TRACK: t_TAC_TRACK, TRACKFREE: t_TAC_TRACKFREE, TRACKFULL: t_TAC_TRACKFULL, MINE: t_TAC_MINE, DROID: t_TAC_DROID, HIND: t_TAC_HIND,
};
const COLL_STYLES: Record<string, number> = {
  ADD_SCORE_HIDE: t_CS_ADD_SCORE_HIDE, ADD_SCORE: t_CS_ADD_SCORE, BUMP: t_CS_BUMP, BUMP_LOSE_SHIELD: t_CS_BUMP_LOSE_SHIELD,
  LOSE_SHIELD: t_CS_LOSE_SHIELD, WARP: t_CS_WARP, BONUS: t_CS_BONUS, NAV: t_CS_NAV, NAVWARP: t_CS_NAVWARP,
};
/** NG_StageReadFile: cmx\<file> after its "include" lines */
export function stageReadFile(fin: string, look: StageLookups): void {
  const path = `cmx/${fin}`;
  const text = fileText(path);
  for (const tmp of fgetsLines(text, 1024)) {
    if (tmp.length < 4) continue;
    const m = /^\s*(\S+)\s+(\S+)/.exec(tmp) ?? /^\s*(\S+)/.exec(tmp);
    const tex = m ? m[1] : '';
    const tex2 = m && m[2] ? m[2] : '';
    if (tex === 'include' || tex === 'xinclude') stageReadFile(tex2, look);
    else break;
  }
  const ini = readConfig(text);
  const O = G.g_SGObjects;
  let iCase = 0;
  let base = 0;
  if (selectClass('LiTHiUM FOE Informations', ini)) { iCase = 1 + getLong('LastCase', ini); base = g_SGSettings.maxCase; }
  if (selectClass('World', ini)) { O.World.Focal = getLong('Focal', ini); O.World.ZClip = getLong('ZClip', ini); }
  for (let i = 0; i < 8; i++) {
    const n = O.World.Nav[i];
    if (selectClass(`NAV ${i}`, ini)) { n.SunFlare = getBool('SunFlare', ini) & 255; n.SpaceDebris = getBool('Debris', ini) & 255; n.Skybox = getBool('Sky', ini) & 255; n.Check = 1; }
    else n.Check = 0;
  }
  for (let i = 1; i < 8; i++) if (!O.World.Nav[i].Check) O.World.Nav[i] = { ...O.World.Nav[0] };
  if (selectClass('Scene', ini)) {
    O.World.Track = getLong('Music', ini);
    O.ParTime = getLong('ParTime', ini);
    O.World.scene_name = (getStr('Scene', ini) ?? '').slice(0, 31);
    O.World.path_name = (getStr('Path', ini) ?? '').slice(0, 31);
  }
  if (iCase > 1) {
    for (let i = 0; i < iCase; i++) {
      const slot = base + i;
      if (slot >= MAX_PLAYER) throw new Error('cmx: too many cases');
      g_SGSettings.maxCase++;
      if (!selectClass(`case ${i}`, ini)) throw new Error(`cmx: ${fin} has no case ${i}`);
      let p: SGScript;
      let s = getStr('SameAs', ini);
      if (s) p = copyScript(getSifByName(s));
      else { p = newScript(); p.Tactic = t_TAC_NONE; p.SpeedTurn = 4; p.Animation = t_FIXE; }
      G.g_pPlayerInfo[slot] = p;
      s = getStr('Basename', ini);
      if (!s) throw new Error('cmx: case without Basename');
      p.Basename = s.slice(0, 12);
      s = getStr('Type', ini);
      if (s) { if (!(s in TYPES)) throw new Error(`cmx: type ${s}`); p.Type = TYPES[s]; }
      s = getStr('Realname', ini);
      p.Realname = (s ?? p.Basename).slice(0, 12);
      s = getStr('Movement', ini); if (s && s in MOVES) p.Animation = MOVES[s];
      s = getStr('Tactic', ini); if (s && s in TACTICS) p.Tactic = TACTICS[s];
      s = getStr('EndTrack', ini); if (s === 'WARP') p.EndTrack = t_ET_WARP;
      s = getStr('AfterTrack', ini);
      if (s) {
        if (s === 'ADD_AIM') p.AfterTrack = t_AD_ADD_AIM;
        if (s === 'FAILED') p.AfterTrack = t_AD_FAILED;
        if (s === 'SUCCESS') p.AfterTrack = t_AD_SUCCESS;
        if (s === 'EXPLODE') p.AfterTrack = t_AD_EXPLODE;
      }
      s = getStr('EventCode', ini);
      if (s) {
        if (s === 'ENABLE') p.EventCode = t_EC_ENABLE;
        if (s === 'SHOOTAPPEAR') p.EventCode = t_EC_APPEAR;
        if (s === 'SHIELDOFF') p.EventCode = t_EC_SHIELDOFF;
        if (s === 'SHIELDOFFDIE') p.EventCode = t_EC_SHIELDOFFDIE;
        if (s === 'TRACK_TOGGLE') p.EventCode = t_EC_TRACK_TOGGLE;
      }
      s = getStr('EventType', ini);
      if (s) { if (s === 'BYSHOOT') p.EventType = t_ET_SHOOT; if (s === 'BYDESTROY') p.EventType = t_ET_DESTROY; }
      else p.EventType = t_ET_SHOOT;
      s = getStr('AfterDestroy', ini);
      if (s) {
        if (s === 'ADD_AIM') p.AfterDestroy = t_AD_ADD_AIM;
        if (s === 'FAILED') p.AfterDestroy = t_AD_FAILED;
        if (s === 'SUCCESS') p.AfterDestroy = t_AD_SUCCESS;
      }
      s = getStr('Collision', ini);
      if (s) { if (s === 'NONE') p.Collision = t_COL_NONE; else if (s === 'AUTOSPHERE') p.Collision = t_COL_AUTOSPHERE; else if (s === 'AUTOSPHERE2') p.Collision = t_COL_AUTOSPHERE2; }
      s = getStr('CollisionStyle', ini); if (s && s in COLL_STYLES) p.CollisionStyle = COLL_STYLES[s];
      s = getStr('AppearMode', ini); if (s) p.AppearMode = look.fx(s);
      s = getStr('Remplace', ini); if (s) p.Replace = G.g_pPlayerInfo.indexOf(getSifByName(s));
      s = getStr('DebrisMode', ini); if (s) p.DebrisMode = look.fx(s);
      s = getStr('DebrisMode2', ini); if (s) p.DebrisMode2 = look.fx(s);
      s = getStr('ExplodeMode', ini); if (s) p.ExplodeMode = look.fx(s);
      s = getStr('FinisHim', ini); if (s) p.FinisHim = look.fx(s);
      s = getStr('StartSound', ini); if (s) p.StartSound = look.audio(s);
      s = getStr('SoundFinish', ini); if (s) p.StartSound = look.audio(s);
      s = getStr('Doppler', ini); if (s) p.Doppler = look.audio(s);
      s = getStr('SoundExplode', ini); if (s) p.SoundExplode = look.audio(s);
      s = getStr('SoundAppear', ini); if (s) p.SoundAppear = look.audio(s);
      s = getStr('SoundAmbiant', ini); if (s) p.AmbiantSound = 0;
      let v: number | null;
      if ((v = getLong2('Event', ini)) !== null) p.Event = v & 255;
      if ((v = getLong2('AnimMode', ini)) !== null) p.AnimMode = v & 255;
      if ((v = getLong2('Appear', ini)) !== null) p.Appear = v;
      if ((v = getLong2('Avary', ini)) !== null) p.Avary = v & 255;
      if ((v = getLong2('SpeedTurn', ini)) !== null) p.SpeedTurn = v & 255;
      if ((v = getLong2('ShootAxe', ini)) !== null) p.ShootAxe = v & 255;
      if ((v = getLong2('Shield', ini)) !== null) p.Shield = v; else p.Shield = 1;
      if ((v = getLong2('ShieldMax', ini)) !== null) p.ShieldMax = v; else p.ShieldMax = p.Shield;
      if ((v = getLong2('Weight', ini)) !== null) p.Poids = v;
      if ((v = getLong2('Sight', ini)) !== null) p.Sight = v;
      if ((v = getLong2('Scoring', ini)) !== null) p.Scoring = v;
      if ((v = getLong2('Code', ini)) !== null) p.Code = v & 255;
      if ((v = getLong2('Wait', ini)) !== null) p.Wait = v;
      if ((v = getLong2('SpeedMax', ini)) !== null) p.fSpeedMax = v;
      if ((v = getLong2('Attack', ini)) !== null) p.Attack = v & 255;
      if ((v = getLong2('ColorRadar', ini)) !== null) p.ColorRadar = v & 255;
      if ((v = getLong2('NeverShock', ini)) !== null) p.NeverShock = v & 255;
      if ((v = getLong2('Stealth', ini)) !== null) {
        p.Stealth = 1;
        p.Appear = v + sysRand(256);
        if (!p.Wait) p.Wait = p.Appear;
      }
      if ((v = getBool2('Aim', ini)) !== null) p.Mission = v;
      if ((v = getBool2('Protect', ini)) !== null) p.Protect = v;
      if ((v = getBool2('NeverHide', ini)) !== null) p.NeverHide = v ? 1 : 2;
      if ((v = getBool2('BigExplode', ini)) !== null) p.BigExplode = v;
      if ((v = getBool2('NoFogging', ini)) !== null) p.NoFog = v;
    }
  }
}

// ---------------------------------------------------------------- roster and hall of fame (lt_save.c)
/** sizeof(SGPlayerSave) on the 32-bit build: name[32], level[16], episode, score, life, rank, time_t, active, ship */
export const SAVE_SIZE = 72;
function readSave(dv: DataView, o: number): SGPlayerSave {
  const s = newSave();
  let name = '';
  for (let i = 0; i < 32; i++) { const c = dv.getUint8(o + i); if (!c) break; name += String.fromCharCode(c); }
  s.name = name;
  for (let i = 0; i < 16; i++) s.level[i] = dv.getUint8(o + 32 + i);
  s.episode = dv.getInt32(o + 48, true); s.score = dv.getUint32(o + 52, true); s.life = dv.getUint32(o + 56, true);
  s.rank = dv.getUint32(o + 60, true); s.last_time = dv.getInt32(o + 64, true); s.active = dv.getUint16(o + 68, true); s.ship = dv.getUint16(o + 70, true);
  return s;
}
function writeSave(dv: DataView, o: number, s: SGPlayerSave): void {
  for (let i = 0; i < 32; i++) dv.setUint8(o + i, i < s.name.length ? s.name.charCodeAt(i) & 255 : 0);
  for (let i = 0; i < 16; i++) dv.setUint8(o + 32 + i, s.level[i] & 255);
  dv.setInt32(o + 48, s.episode, true); dv.setUint32(o + 52, s.score >>> 0, true); dv.setUint32(o + 56, s.life >>> 0, true);
  dv.setUint32(o + 60, s.rank >>> 0, true); dv.setInt32(o + 64, s.last_time | 0, true); dv.setUint16(o + 68, s.active, true); dv.setUint16(o + 70, s.ship, true);
}
/** the file of nogravity.pts / nogravity.hsc: int version (= 72), then 10 records */
export function packSaves(list: SGPlayerSave[]): Uint8Array {
  const b = new Uint8Array(4 + SAVE_SIZE * MAX_SAVE_GAMES);
  const dv = new DataView(b.buffer);
  dv.setInt32(0, SAVE_SIZE, true);
  for (let i = 0; i < MAX_SAVE_GAMES; i++) writeSave(dv, 4 + SAVE_SIZE * i, list[i]);
  return b;
}
/** null: a wrong version or size (the original then resets the file) */
export function unpackSaves(b: Uint8Array): SGPlayerSave[] | null {
  if (b.length < 4) return null;
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  if (dv.getInt32(0, true) !== SAVE_SIZE) return null;
  const out: SGPlayerSave[] = [];
  for (let i = 0; i < MAX_SAVE_GAMES; i++) {
    const o = 4 + SAVE_SIZE * i;
    out.push(o + SAVE_SIZE <= b.length ? readSave(dv, o) : newSave());
  }
  return out;
}
/** NG_HighScoresReset */
export function highScoresReset(now: number): void {
  for (let i = 0; i < 10; i++) {
    const b = G.g_pBestGames[i];
    b.name = 'No Gravity';
    b.score = 10000 * 11 - i * 10000;
    for (let j = 0; j < MAX_SAVE_GAMES; j++) b.level[j] = 0;
    b.episode = 0;
    b.last_time = now;
  }
}
/** NG_HighScoresUpdate */
export function highScoresUpdate(): void {
  for (let i = 0; i < MAX_SAVE_GAMES; i++) {
    if (G.g_pCurrentGame.score > G.g_pBestGames[i].score) {
      for (let j = MAX_SAVE_GAMES - 1; j > i; j--) G.g_pBestGames[j] = G.g_pBestGames[j - 1];
      G.g_pBestGames[i] = cloneSave(G.g_pSaveGames[g_SGSettings.player]);
      return;
    }
  }
}
export const cloneSave = (s: SGPlayerSave): SGPlayerSave => ({ ...s, level: s.level.slice() });
/** NG_RosterSaveSlot */
export function rosterSaveSlot(i: number): void {
  const s = newSave();
  s.name = 'No Gravity';
  s.ship = 1;
  G.g_pSaveGames[i] = s;
}
export function rosterReset(): void { for (let i = 0; i < MAX_SAVE_GAMES; i++) rosterSaveSlot(i); }

// ---------------------------------------------------------------- nogravity.ini (lt_info.c)
const YesNo = ['no', 'yes'];
function saveKey(t: Uint8Array): string {
  let s = '';
  for (let i = 0; i < LK_MAX; i++) s += t[i].toString(16).padStart(2, ' ') + ' ';
  return s;
}
function readKey(str: string, t: Uint8Array): void {
  for (let i = 0, p = 0; i < LK_MAX; i++, p += 3) {
    const te = str.slice(p, p + 2);
    if (te.length >= 2) {
      const j = parseInt(te.trim() || '0', 16) || 0;
      t[i] = j ? j : 0;
    }
  }
}
/** ResetKey: the default keys, joystick and mouse buttons */
export function resetKey(): void {
  const k = g_SGSettings.key;
  const v = [SC.rightshift, SC.numplus, SC.numminus, SC.tab, SC.backspace, SC.delete, SC.insert, SC.slash, SC.n0, SC.alt, SC.return,
    SC.space, SC.equals, SC.minus, SC.a, SC.i, SC.r, SC.c, SC.up, SC.down, SC.right, SC.left, SC.t];
  v.forEach((x, i) => { k[i] = x; });
  const j = g_SGSettings.joy;
  j[9] = 1; j[0] = 2; j[10] = 3; j[8] = 4; j[4] = 5; j[11] = 6; j[14] = 7; j[16] = 8;
  g_SGSettings.mou[9] = 1; g_SGSettings.mou[0] = 2;
}
/** NG_SaveGameInfo: the text of nogravity.ini */
export function saveGameInfo(gamma: number): string {
  const S = g_SGSettings;
  const Ctr = ['Mouse', 'Keyboard', 'Joystick'];
  return '[Game]\n' + `Language=${S.Language}\nDifficulty=${S.Difficulty}\nOS=${S.OS}\n` +
    '\n[Video]\n' + `Dithering=${YesNo[S.Dithering]}\nTexFiltering=${YesNo[S.TexFiltering]}\nTexPOT=${YesNo[S.TexPOT]}\n` +
    `TexCompression=${YesNo[S.TexCompression]}\nSky=${S.Sky}\nShading=2\nGamma=${gamma}\nLensFX=${S.LensFX}\nVisualsFx=${S.VisualsFx}\n` +
    `Zbuffer=${YesNo[S.ZBuffer]}\nResolutionX=${S.ResolutionX}\nResolutionY=${S.ResolutionY}\nColorDepth=${S.ColorDepth}\n` +
    `FrameSkip=${S.FrameSkip}\nMultisampling=${S.Multisampling}\nVSync=${S.VerticalSync}\n` +
    '\n[Sound]\n' + `VolFX=${S.VolFX.toFixed(6)}\nVolDIG=${S.VolDIG.toFixed(6)}\nVolMusic=${S.VolMusic.toFixed(6)}\n` +
    '\n[Control]\n' + `Controller=${Ctr[S.Ctrl]}\nSpeed=${S.MouseSensitivity}\nFlipY=${YesNo[S.FlipYMouse]}\n` +
    `Key=${saveKey(S.key)}\nJoy=${saveKey(S.joy)}\nMou=${saveKey(S.mou)}\nAltMouse=${S.AltMouse}\n` +
    `JoyThrottleAxis=${S.AxisThrottle}\nJoyRollAxis=${S.AxisRoll}\n`;
}
/** NG_ReadGameConfig; returns the gamma. RLX.System.Id of the Linux build is RLXOS_LINUX (OS = its id) */
export const RLXOS_LINUX = 0x21;
export function readGameConfig(text: string | null): { gamma: number; write: boolean } {
  const S = g_SGSettings;
  resetKey();
  S.ResolutionX = 640; S.ResolutionY = 480;
  let gamma = 0;
  if (text !== null) {
    const ini = readConfig(text);
    if (selectClass('Game', ini)) {
      S.Intro = getBool('Intro', ini) & 255; S.Language = getLong('Language', ini) & 255; S.Difficulty = getLong('Difficulty', ini) & 255;
      S.OS = getLong('OS', ini) & 255;
      if (!S.OS) S.OS = 66;
    }
    if (selectClass('Video', ini)) {
      S.ResolutionX = getLong('ResolutionX', ini) & 0xffff; S.ResolutionY = getLong('ResolutionY', ini) & 0xffff;
      S.ColorDepth = getLong('ColorDepth', ini) & 255; S.Dithering = getBool('Dithering', ini); S.TexFiltering = getBool('TexFiltering', ini);
      S.TexPOT = getBool('TexPOT', ini); S.VisualsFx = getLong('VisualsFx', ini) & 255; S.LensFX = getBool('LensFX', ini);
      S.Sky = getLong('Sky', ini) & 255; gamma = getLong('Gamma', ini) & 255; S.ZBuffer = getBool('ZBuffer', ini);
      S.FrameSkip = getLong('FrameSkip', ini) & 255;
      if (S.ResolutionX <= 511) { S.ResolutionX = 640; S.ResolutionY = 480; }
      S.Multisampling = getLong('Multisampling', ini) & 255; S.VerticalSync = getLong('VSync', ini) & 255;
    }
    if (selectClass('Sound', ini)) {
      S.VolDIG = getLong('VolDIG', ini) & 255; S.VolFX = getLong('VolFX', ini) & 255; S.VolMusic = getLong('VolMusic', ini) & 255;
    }
    if (selectClass('Control', ini)) {
      S.MouseSensitivity = getLong('Speed', ini) & 255; S.FlipYMouse = getBool('FlipY', ini);
      let s = getStr('Controller', ini);
      if (s) S.Ctrl = s === 'Keyboard' ? 1 : s === 'Joystick' ? 2 : 0;
      s = getStr('Key', ini); if (s) readKey(s, S.key);
      s = getStr('Joy', ini); if (s) readKey(s, S.joy);
      s = getStr('Mou', ini); if (s) readKey(s, S.mou);
      S.AltMouse = getStr('AltMouse', ini) ? getLong('AltMouse', ini) & 255 : 0;
      S.AxisThrottle = getStr('JoyThrottleAxis', ini) ? getLong('JoyThrottleAxis', ini) & 255 : 0;
      S.AxisRoll = getStr('JoyRollAxis', ini) ? getLong('JoyRollAxis', ini) & 255 : 0;
    }
  } else {
    S.Difficulty = 1; S.DemoMode = 0; S.Intro = 0; S.MouseSensitivity = 4 + 8; S.VisualsFx = 4; S.VolDIG = 100; S.VolMusic = 100;
    S.VolFX = 100; S.VisualsFx = 3; S.Language = 0; S.Ctrl = 0; S.OS = 0;
  }
  let write = false;
  if (S.OS !== RLXOS_LINUX) {
    // first run on this system; the OpenGL renderer of the Linux build counts as RLX3D_OPENGL
    gamma = 1; S.Sky = 1; S.Dithering = 1; S.LensFX = 1; S.ResolutionX = 640; S.ResolutionY = 480; S.ColorDepth = 32;
    S.TexFiltering = 1; S.VisualsFx = 4;
    S.OS = RLXOS_LINUX;
    write = true;
  }
  return { gamma, write };
}
export { stricmp };
