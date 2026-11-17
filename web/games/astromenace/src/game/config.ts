// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later), port of src/config/config.h and
// config.cpp: the settings (config.xml) and the five pilot profiles (PilotProfiles_1.4.data, the
// sPilotProfile array as the x86-64 build lays it out in memory, XOR-packed into small letters). Both
// files keep the original's formats, so files of the original game can be used.
// Changed for the browser by the freegames project, 2026.
import { uRandNum } from '../core/math.ts';
import { XMLDocument } from '../core/xml.ts';
import { config as objConfig } from './globals.ts';

export const CONFIG_VERSION = '1.4';
export const MAX_PROFILES = 5;
export const PROFILE_NAME_SIZE = 1024;
export const MAX_MISSIONS = 100;
export const MAX_WEAPONS = 6;
export const MAX_HINTS = 10;
export const ConfigFileName = 'config.xml';
export const ProfilesFileName = `PilotProfiles_${CONFIG_VERSION}.data`;

/** SDL 2 key codes the config uses, and their SDL_GetKeyName names */
export const SDLK = {
  UNKNOWN: 0, RETURN: 13, ESCAPE: 27, BACKSPACE: 8, TAB: 9, SPACE: 32,
  RIGHT: 1073741903, LEFT: 1073741904, DOWN: 1073741905, UP: 1073741906,
  LCTRL: 1073742048, LSHIFT: 1073742049, LALT: 1073742050, RCTRL: 1073742052, RSHIFT: 1073742053, RALT: 1073742054,
  F1: 1073741882, F2: 1073741883, F3: 1073741884, F4: 1073741885, F5: 1073741886, F6: 1073741887, F7: 1073741888,
  F8: 1073741889, F9: 1073741890, F10: 1073741891, F11: 1073741892, F12: 1073741893, PAUSE: 1073741896,
  INSERT: 1073741897, HOME: 1073741898, PAGEUP: 1073741899, DELETE: 127, END: 1073741901, PAGEDOWN: 1073741902,
  KP_DIVIDE: 1073741908, KP_MULTIPLY: 1073741909, KP_MINUS: 1073741910, KP_PLUS: 1073741911, KP_ENTER: 1073741912,
  KP_1: 1073741913, KP_2: 1073741914, KP_3: 1073741915, KP_4: 1073741916, KP_5: 1073741917, KP_6: 1073741918,
  KP_7: 1073741919, KP_8: 1073741920, KP_9: 1073741921, KP_0: 1073741922, KP_PERIOD: 1073741923,
};

const KEY_NAMES: [number, string][] = [
  [SDLK.RETURN, 'Return'], [SDLK.ESCAPE, 'Escape'], [SDLK.BACKSPACE, 'Backspace'], [SDLK.TAB, 'Tab'], [SDLK.SPACE, 'Space'],
  [SDLK.RIGHT, 'Right'], [SDLK.LEFT, 'Left'], [SDLK.DOWN, 'Down'], [SDLK.UP, 'Up'], [SDLK.LCTRL, 'Left Ctrl'],
  [SDLK.LSHIFT, 'Left Shift'], [SDLK.LALT, 'Left Alt'], [SDLK.RCTRL, 'Right Ctrl'], [SDLK.RSHIFT, 'Right Shift'],
  [SDLK.RALT, 'Right Alt'], [SDLK.PAUSE, 'Pause'], [SDLK.INSERT, 'Insert'], [SDLK.HOME, 'Home'], [SDLK.PAGEUP, 'PageUp'],
  [SDLK.DELETE, 'Delete'], [SDLK.END, 'End'], [SDLK.PAGEDOWN, 'PageDown'], [SDLK.KP_DIVIDE, 'Keypad /'],
  [SDLK.KP_MULTIPLY, 'Keypad *'], [SDLK.KP_MINUS, 'Keypad -'], [SDLK.KP_PLUS, 'Keypad +'], [SDLK.KP_ENTER, 'Keypad Enter'],
  [SDLK.KP_PERIOD, 'Keypad .'],
  ...Array.from({ length: 12 }, (_, i) => [SDLK.F1 + i, `F${i + 1}`] as [number, string]),
  ...Array.from({ length: 9 }, (_, i) => [SDLK.KP_1 + i, `Keypad ${i + 1}`] as [number, string]),
  [SDLK.KP_0, 'Keypad 0'],
];

/** SDL_GetKeyName */
export function SDL_GetKeyName(k: number): string {
  const n = KEY_NAMES.find((x) => x[0] === k);
  if (n) return n[1];
  if (k > 32 && k < 127) return String.fromCharCode(k).toUpperCase();
  return '';
}

/** SDL_GetKeyFromName */
export function SDL_GetKeyFromName(name: string): number {
  const n = KEY_NAMES.find((x) => x[1].toLowerCase() === name.toLowerCase());
  if (n) return n[0];
  if (name.length === 1) return name.toLowerCase().charCodeAt(0);
  return SDLK.UNKNOWN;
}

export const SDL_BUTTON_LEFT = 1;
export const SDL_BUTTON_MIDDLE = 2;
export const SDL_BUTTON_RIGHT = 3;

export class PilotProfile {
  Used = false;
  Name = '';
  EnemyWeaponPenalty = 2;
  EnemyArmorPenalty = 2;
  EnemyTargetingSpeedPenalty = 2;
  UnlimitedAmmo = 1;
  UndestroyableWeapon = 1;
  WeaponTargetingMode = 0;
  SpaceShipControlMode = 1;
  reserved = 0;
  ShipHull = 1;
  ShipHullUpgrade = 1;
  ArmorStatus = 30;
  Weapon = [1, 1, 16, 0, 0, 0];
  WeaponAmmo = [3000, 3000, 200, 0, 0, 0];
  WeaponSlotYAngle = [0, 0, 0, 0, 0, 0];
  WeaponControl = [1, 1, 2, 0, 0, 0];
  WeaponAltControl = [0, 0, 0, 0, 0, 0];
  WeaponAltControlData = [0, 0, 0, 0, 0, 0];
  EngineSystem = 1;
  TargetingSystem = 1;
  AdvancedProtectionSystem = 1;
  PowerSystem = 1;
  TargetingMechanicSystem = 1;
  Money = 200;
  Experience = 0;
  PrimaryWeaponFireMode = 2;
  SecondaryWeaponFireMode = 2;
  OpenLevelNum = 0;
  LastMission = 0;
  ByMissionExperience = new Array<number>(MAX_MISSIONS).fill(0);
  MissionReplayCount = new Array<number>(MAX_MISSIONS).fill(0);
}

/** sizeof(sPilotProfile) on x86-64 and the offsets of its members (alignment padding included) */
export const PROFILE_SIZE = 1940;

function writeProfile(p: PilotProfile, dv: DataView, o: number): void {
  dv.setUint8(o, p.Used ? 1 : 0);
  const name = new TextEncoder().encode(p.Name).subarray(0, PROFILE_NAME_SIZE - 1);
  for (let i = 0; i < PROFILE_NAME_SIZE; i++) dv.setUint8(o + 1 + i, i < name.length ? name[i] : 0);
  const b = [p.EnemyWeaponPenalty, p.EnemyArmorPenalty, p.EnemyTargetingSpeedPenalty, p.UnlimitedAmmo, p.UndestroyableWeapon,
    p.WeaponTargetingMode, p.SpaceShipControlMode, p.reserved, p.ShipHull, p.ShipHullUpgrade];
  b.forEach((v, i) => dv.setUint8(o + 1025 + i, v));
  dv.setFloat32(o + 1036, p.ArmorStatus, true);
  for (let i = 0; i < MAX_WEAPONS; i++) {
    dv.setUint8(o + 1040 + i, p.Weapon[i]);
    dv.setInt32(o + 1048 + i * 4, p.WeaponAmmo[i], true);
    dv.setFloat32(o + 1072 + i * 4, p.WeaponSlotYAngle[i], true);
    dv.setUint8(o + 1096 + i, p.WeaponControl[i]);
    dv.setUint8(o + 1102 + i, p.WeaponAltControl[i]);
    dv.setUint8(o + 1108 + i, p.WeaponAltControlData[i]);
  }
  [p.EngineSystem, p.TargetingSystem, p.AdvancedProtectionSystem, p.PowerSystem, p.TargetingMechanicSystem]
    .forEach((v, i) => dv.setUint8(o + 1114 + i, v));
  dv.setInt32(o + 1120, p.Money, true);
  dv.setInt32(o + 1124, p.Experience, true);
  dv.setUint8(o + 1128, p.PrimaryWeaponFireMode);
  dv.setUint8(o + 1129, p.SecondaryWeaponFireMode);
  dv.setInt32(o + 1132, p.OpenLevelNum, true);
  dv.setInt32(o + 1136, p.LastMission, true);
  for (let i = 0; i < MAX_MISSIONS; i++) {
    dv.setInt32(o + 1140 + i * 4, p.ByMissionExperience[i], true);
    dv.setInt32(o + 1540 + i * 4, p.MissionReplayCount[i], true);
  }
}

function readProfile(dv: DataView, o: number): PilotProfile {
  const p = new PilotProfile();
  p.Used = dv.getUint8(o) !== 0;
  const bytes: number[] = [];
  for (let i = 0; i < PROFILE_NAME_SIZE; i++) {
    const c = dv.getUint8(o + 1 + i);
    if (!c) break;
    bytes.push(c);
  }
  p.Name = new TextDecoder().decode(new Uint8Array(bytes));
  const k = (i: number): number => dv.getUint8(o + 1025 + i);
  p.EnemyWeaponPenalty = k(0);
  p.EnemyArmorPenalty = k(1);
  p.EnemyTargetingSpeedPenalty = k(2);
  p.UnlimitedAmmo = k(3);
  p.UndestroyableWeapon = k(4);
  p.WeaponTargetingMode = k(5);
  p.SpaceShipControlMode = k(6);
  p.reserved = k(7);
  p.ShipHull = k(8);
  p.ShipHullUpgrade = k(9);
  p.ArmorStatus = dv.getFloat32(o + 1036, true);
  for (let i = 0; i < MAX_WEAPONS; i++) {
    p.Weapon[i] = dv.getUint8(o + 1040 + i);
    p.WeaponAmmo[i] = dv.getInt32(o + 1048 + i * 4, true);
    p.WeaponSlotYAngle[i] = dv.getFloat32(o + 1072 + i * 4, true);
    p.WeaponControl[i] = dv.getUint8(o + 1096 + i);
    p.WeaponAltControl[i] = dv.getUint8(o + 1102 + i);
    p.WeaponAltControlData[i] = dv.getUint8(o + 1108 + i);
  }
  p.EngineSystem = dv.getUint8(o + 1114);
  p.TargetingSystem = dv.getUint8(o + 1115);
  p.AdvancedProtectionSystem = dv.getUint8(o + 1116);
  p.PowerSystem = dv.getUint8(o + 1117);
  p.TargetingMechanicSystem = dv.getUint8(o + 1118);
  p.Money = dv.getInt32(o + 1120, true);
  p.Experience = dv.getInt32(o + 1124, true);
  p.PrimaryWeaponFireMode = dv.getUint8(o + 1128);
  p.SecondaryWeaponFireMode = dv.getUint8(o + 1129);
  p.OpenLevelNum = dv.getInt32(o + 1132, true);
  p.LastMission = dv.getInt32(o + 1136, true);
  for (let i = 0; i < MAX_MISSIONS; i++) {
    p.ByMissionExperience[i] = dv.getInt32(o + 1140 + i * 4, true);
    p.MissionReplayCount[i] = dv.getInt32(o + 1540 + i * 4, true);
  }
  return p;
}

export const WeaponPanelView = { hide: 0, slim: 1, flat: 2, full: 3 };

export class GameConfigData {
  MenuLanguage = 0;
  VoiceLanguage = 0;
  FontNumber = 0;
  MusicVolume = 8;
  SoundVolume = 10;
  VoiceVolume = 10;
  DisplayIndex = 0;
  Width = 1280;
  Height = 768;
  Fullscreen = true;
  InternalWidth = 1228;
  InternalHeight = 768;
  VSync = 0;
  Brightness = 5;
  MSAA = 0;
  CSAA = 0;
  VisualEffectsQuality = 2;
  AnisotropyLevel = 1;
  UseGLSL120 = false;
  ShadowMap = 0;
  MaxPointLights = 3;
  KeyBoardLeft = SDLK.LEFT;
  KeyBoardRight = SDLK.RIGHT;
  KeyBoardUp = SDLK.UP;
  KeyBoardDown = SDLK.DOWN;
  KeyBoardPrimary = SDLK.LCTRL;
  KeyBoardSecondary = SDLK.SPACE;
  MousePrimary = SDL_BUTTON_LEFT;
  MouseSecondary = SDL_BUTTON_RIGHT;
  MouseControl = true;
  ControlSensivity = 5;
  JoystickPrimary = 0;
  JoystickSecondary = 1;
  JoystickNum = 0;
  JoystickDeadZone = 2;
  GameSpeed = 1.5;
  ShowFPS = false;
  WeaponPanelView = WeaponPanelView.full;
  Profile: PilotProfile[] = Array.from({ length: MAX_PROFILES }, () => new PilotProfile());
  LastProfile = -1;
  NeedShowHint = new Array<boolean>(MAX_HINTS).fill(true);
  MenuScript = 0;
}

export let Config = new GameConfigData();
export const GameConfig = (): GameConfigData => Config;
export const ChangeGameConfig = (): GameConfigData => Config;

/** the current profile and mission (menu_profile.cpp, menu_mission.cpp globals) */
export const Cur = { CurrentProfile: -1, CurrentMission: -1 };

/** where the files go (the account's storage on the server) */
export const configStore = {
  save: (_name: string, _data: string): void => {},
};

/** PackWithXOR */
export function PackWithXOR(data: Uint8Array): string {
  const n = data.length;
  const out = new Array<string>(n * 3);
  for (let i = 0; i < n; i++) {
    const k = 97 + uRandNum(25);
    out[i] = String.fromCharCode(k);
    const x = data[i] ^ k;
    const t = Math.trunc(97 + x / 10);
    out[n + i * 2] = String.fromCharCode(t);
    out[n + i * 2 + 1] = String.fromCharCode(97 + (x - (t - 97) * 10));
  }
  return out.join('');
}

/** UnpackWithXOR */
export function UnpackWithXOR(size: number, s: string): Uint8Array | null {
  if (Math.trunc(s.length / 3) < size) return null;
  const d = new Uint8Array(size);
  for (let i = 0; i < size; i++) {
    const o = size + i * 2;
    d[i] = (s.charCodeAt(i) ^ ((s.charCodeAt(o) - 97) * 10 + (s.charCodeAt(o + 1) - 97))) & 0xff;
  }
  return d;
}

export function profilesBytes(c: GameConfigData): Uint8Array {
  const buf = new Uint8Array(PROFILE_SIZE * MAX_PROFILES);
  const dv = new DataView(buf.buffer);
  c.Profile.forEach((p, i) => writeProfile(p, dv, i * PROFILE_SIZE));
  return buf;
}

export function SavePilotProfiles(): string {
  const s = PackWithXOR(profilesBytes(Config));
  configStore.save(ProfilesFileName, s);
  return s;
}

/** the language names of text.csv's first line, by index (set by the text loader) */
export const languages = { en: ['en'] as string[] };

export function SaveXMLConfigFile(): string {
  SavePilotProfiles();
  const doc = new XMLDocument(null);
  const root = doc.createRoot('AstroMenaceSettings');
  const C = Config;
  const i = (name: string, v: number): void => { doc.addEntry(root, name).attributes.set('value', String(Math.trunc(v))); };
  const b = (name: string, v: boolean): void => { doc.addEntry(root, name).attributes.set('value', v ? 'on' : 'off'); };
  const s = (name: string, v: string): void => { doc.addEntry(root, name).attributes.set('value', v); };
  doc.addComment(root, ' AstroMenace game Settings ');
  s('MenuLanguage', languages.en[C.MenuLanguage] ?? 'en');
  s('VoiceLanguage', languages.en[C.VoiceLanguage] ?? 'en');
  i('FontNumber', C.FontNumber);
  i('DisplayIndex', C.DisplayIndex);
  i('Width', C.Width);
  i('Height', C.Height);
  b('Fullscreen', C.Fullscreen);
  doc.addComment(root, ' Common settings ');
  i('MSAA', C.MSAA);
  i('CSAA', C.CSAA);
  i('VisualEffectsQuality', C.VisualEffectsQuality);
  i('AnisotropyLevel', C.AnisotropyLevel);
  b('UseGLSL120', C.UseGLSL120);
  i('ShadowMap', C.ShadowMap);
  i('MaxPointLights', C.MaxPointLights);
  i('MusicVolume', C.MusicVolume);
  i('SoundVolume', C.SoundVolume);
  i('VoiceVolume', C.VoiceVolume);
  i('VSync', C.VSync);
  i('Brightness', C.Brightness);
  b('ShowFPS', C.ShowFPS);
  i('WeaponPanelView', C.WeaponPanelView);
  s('GameSpeed', C.GameSpeed.toFixed(6));
  doc.addComment(root, ' Control settings ');
  s('KeyBoardLeft', SDL_GetKeyName(C.KeyBoardLeft));
  s('KeyBoardRight', SDL_GetKeyName(C.KeyBoardRight));
  s('KeyBoardUp', SDL_GetKeyName(C.KeyBoardUp));
  s('KeyBoardDown', SDL_GetKeyName(C.KeyBoardDown));
  s('KeyBoardPrimary', SDL_GetKeyName(C.KeyBoardPrimary));
  s('KeyBoardSecondary', SDL_GetKeyName(C.KeyBoardSecondary));
  i('MousePrimary', C.MousePrimary);
  i('MouseSecondary', C.MouseSecondary);
  i('JoystickPrimary', C.JoystickPrimary);
  i('JoystickSecondary', C.JoystickSecondary);
  i('JoystickNum', C.JoystickNum);
  i('JoystickDeadZone', C.JoystickDeadZone);
  i('ControlSensivity', C.ControlSensivity);
  b('MouseControl', C.MouseControl);
  i('LastProfile', C.LastProfile);
  i('MenuScript', C.MenuScript);
  doc.addComment(root, ' Tips and Hints settings ');
  for (let k = 0; k < MAX_HINTS; k++) b(`HintStatus${k + 1}`, C.NeedShowHint[k]);
  const text = doc.save();
  configStore.save(ConfigFileName, text);
  return text;
}

/** LoadXMLConfigFile: true when the config file did not exist (first start) */
export function LoadXMLConfigFile(configXml: string | null, profiles: string | null): boolean {
  Config = new GameConfigData();
  if (profiles) {
    const d = UnpackWithXOR(PROFILE_SIZE * MAX_PROFILES, profiles.split(/\s/)[0]);
    if (d) {
      const dv = new DataView(d.buffer);
      Config.Profile = Array.from({ length: MAX_PROFILES }, (_, i) => readProfile(dv, i * PROFILE_SIZE));
    }
  }
  const doc = new XMLDocument(configXml);
  const root = doc.root;
  if (!root || root.name !== 'AstroMenaceSettings') {
    SaveXMLConfigFile();
    return true;
  }
  const C = Config;
  const get = (n: string): ReturnType<typeof doc.findEntryByName> => doc.findEntryByName(root, n);
  const gi = (n: string, d: number): number => { const e = get(n); return e ? XMLDocument.int(e, 'value') ?? d : d; };
  const gb = (n: string, d: boolean): boolean => { const e = get(n); return e ? XMLDocument.bool(e, 'value') ?? d : d; };
  const gs = (n: string): string | undefined => { const e = get(n); return e ? XMLDocument.attr(e, 'value') : undefined; };
  const lang = (n: string, d: number): number => {
    const v = gs(n);
    const idx = v === undefined ? -1 : languages.en.indexOf(v);
    return idx >= 0 ? idx : d;
  };
  C.MenuLanguage = lang('MenuLanguage', C.MenuLanguage);
  C.VoiceLanguage = lang('VoiceLanguage', C.VoiceLanguage);
  C.FontNumber = gi('FontNumber', C.FontNumber);
  C.DisplayIndex = gi('DisplayIndex', C.DisplayIndex);
  C.Width = gi('Width', C.Width);
  C.Height = gi('Height', C.Height);
  C.Fullscreen = gb('Fullscreen', C.Fullscreen);
  C.MSAA = gi('MSAA', C.MSAA);
  C.CSAA = gi('CSAA', C.CSAA);
  C.VisualEffectsQuality = gi('VisualEffectsQuality', C.VisualEffectsQuality);
  C.AnisotropyLevel = gi('AnisotropyLevel', C.AnisotropyLevel);
  C.UseGLSL120 = gb('UseGLSL120', C.UseGLSL120);
  C.ShadowMap = gi('ShadowMap', C.ShadowMap);
  C.MaxPointLights = gi('MaxPointLights', C.MaxPointLights);
  C.MusicVolume = gi('MusicVolume', C.MusicVolume);
  C.SoundVolume = gi('SoundVolume', C.SoundVolume);
  C.VoiceVolume = gi('VoiceVolume', C.VoiceVolume);
  C.VSync = gi('VSync', C.VSync);
  C.Brightness = gi('Brightness', C.Brightness);
  C.ShowFPS = gb('ShowFPS', C.ShowFPS);
  let wpv = gi('WeaponPanelView', WeaponPanelView.full);
  if (wpv < WeaponPanelView.hide || wpv > WeaponPanelView.full) wpv = WeaponPanelView.full;
  C.WeaponPanelView = wpv;
  const gsp = gs('GameSpeed');
  if (gsp !== undefined) C.GameSpeed = Math.fround(parseFloat(gsp) || 0);
  for (const k of ['KeyBoardLeft', 'KeyBoardRight', 'KeyBoardUp', 'KeyBoardDown', 'KeyBoardPrimary', 'KeyBoardSecondary'] as const) {
    const v = gs(k);
    if (v !== undefined) C[k] = SDL_GetKeyFromName(v);
  }
  C.MousePrimary = gi('MousePrimary', C.MousePrimary);
  C.MouseSecondary = gi('MouseSecondary', C.MouseSecondary);
  C.JoystickPrimary = gi('JoystickPrimary', C.JoystickPrimary);
  C.JoystickSecondary = gi('JoystickSecondary', C.JoystickSecondary);
  C.JoystickNum = gi('JoystickNum', C.JoystickNum);
  C.JoystickDeadZone = gi('JoystickDeadZone', C.JoystickDeadZone);
  C.ControlSensivity = gi('ControlSensivity', C.ControlSensivity);
  C.MouseControl = gb('MouseControl', C.MouseControl);
  C.LastProfile = gi('LastProfile', C.LastProfile);
  C.MenuScript = gi('MenuScript', C.MenuScript);
  for (let k = 0; k < MAX_HINTS; k++) C.NeedShowHint[k] = gb(`HintStatus${k + 1}`, C.NeedShowHint[k]);
  // CheckConfig
  if (C.KeyBoardUp === SDLK.UNKNOWN) C.KeyBoardUp = SDLK.UP;
  if (C.KeyBoardDown === SDLK.UNKNOWN) C.KeyBoardDown = SDLK.DOWN;
  if (C.KeyBoardLeft === SDLK.UNKNOWN) C.KeyBoardLeft = SDLK.LEFT;
  if (C.KeyBoardRight === SDLK.UNKNOWN) C.KeyBoardRight = SDLK.RIGHT;
  if (C.KeyBoardPrimary === SDLK.UNKNOWN) C.KeyBoardPrimary = SDLK.LCTRL;
  if (C.KeyBoardSecondary === SDLK.UNKNOWN) C.KeyBoardSecondary = SDLK.SPACE;
  if (C.FontNumber < 0 || C.FontNumber >= 8) C.FontNumber = 0;
  if (C.ControlSensivity > 10) C.ControlSensivity = 10;
  if (C.Brightness > 10) C.Brightness = 10;
  if (C.JoystickDeadZone > 10) C.JoystickDeadZone = 10;
  // SetupCurrentProfileAndMission
  if (C.LastProfile >= 0 && C.LastProfile < MAX_PROFILES) {
    if (C.Profile[C.LastProfile].Used) Cur.CurrentProfile = C.LastProfile;
    if (Cur.CurrentProfile !== -1) Cur.CurrentMission = C.Profile[C.LastProfile].LastMission;
  }
  return false;
}

/** the first start on an OpenGL 3.0 card (main.cpp CheckOpenGLCapabilities, FirstStart) */
export function FirstStartSettings(): void {
  Config.UseGLSL120 = true;
  Config.ShadowMap = 1;
  Config.MSAA = 2;
  Config.CSAA = 2;
  Config.MaxPointLights = 4;
  Config.VisualEffectsQuality = 0;
}

/** keep the object code's copy of the settings in step */
export function syncObjectConfig(): void {
  objConfig.UseGLSL120 = Config.UseGLSL120;
  objConfig.VisualEffectsQuality = Config.VisualEffectsQuality;
  objConfig.MaxPointLights = Config.MaxPointLights;
}

const difficulties = new Array<number>(MAX_PROFILES).fill(0);
let difficultiesInit = false;

export const DifficultyAction = { Get: 0, Update: 1, UpdateAll: 2 };

/** ProfileDifficulty (the cache is built on the first call, as the original's static) */
export function ProfileDifficulty(n: number, action = DifficultyAction.Get): number {
  const calc = (i: number): number => {
    const p = Config.Profile[i];
    return 150 - ((p.EnemyWeaponPenalty - 1) * 12 + (p.EnemyArmorPenalty - 1) * 7 + (p.EnemyTargetingSpeedPenalty - 1) * 7
      + p.UnlimitedAmmo * 10 + p.UndestroyableWeapon * 7 + p.WeaponTargetingMode * 10 + p.SpaceShipControlMode * 7);
  };
  const all = (): void => {
    for (let i = 0; i < MAX_PROFILES; i++) difficulties[i] = Config.Profile[i].Used ? calc(i) : 0;
  };
  if (!difficultiesInit) {
    all();
    difficultiesInit = true;
  }
  if (action === DifficultyAction.Get) return difficulties[n];
  if (action === DifficultyAction.Update) difficulties[n] = calc(n);
  else all();
  return 0;
}
