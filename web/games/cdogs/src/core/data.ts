// C-Dogs SDL 2.5.0, translated: loading the game's data in the order of cdogs.c main (pictures, sounds, character
// sprites, particles, ammo, bullets and guns, character classes, pickups, map objects) and loading a campaign
// (gamedata.c CampaignLoad, map_archive.c MapNewLoadArchive, campaigns.c CampaignSettingInit/TerminateAll).
// GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
import { decodePNG } from '../platform/png.ts';
import type { Json } from './json.ts';
import {
  gCharSpriteClasses, gPicManager, CharSpritesLoadJSON, PicManagerAdd, PicManagerAfterAdd, PicManagerClearCustom,
  type NamedPic, type NamedSprites,
} from './pics.ts';
import { gSoundDevice, SoundLoadDir } from './sounds.ts';
import { MusicPlayerInit } from './music.ts';
import {
  AmmoLoadJSON, BulletLoadJSON, BulletLoadWeapons, CharacterClassesLoadJSON, CharacterLoadJSON, MapObjectsLoadAmmoAndGunSpawners,
  MapObjectsLoadJSON, ParticleClassesLoadJSON, PickupClassesLoadAmmo, PickupClassesLoadGuns, PickupClassesLoadJSON,
  PickupClassesLoadKeys, WeaponClassesLoadJSON, gAmmo, gBulletClasses, gCharacterClasses, gMapObjects, gParticleClasses,
  gPickupClasses, gWeaponClasses, newCharacterStore, FPS_FRAMELIMIT,
} from './classes.ts';
import { LoadMissions, MapNewLoadCampaignJSON } from './mission.ts';
import { gPlayerTemplates } from './templates.ts';
import { GAME_MODE_QUICK_PLAY, newCampaignSetting, type Campaign, type CampaignEntry, type CampaignSetting } from './state.ts';

/** the game's data directory: paths are relative to it ("graphics/wall/steel/o.png"), "/" separated */
export interface DataFS {
  /** every file below dir (recursive), relative to the data directory, in the order the original's readdir gives */
  list(dir: string): string[];
  exists(path: string): boolean;
  read(path: string): Promise<Uint8Array>;
}

const MAP_VERSION = 16;

/** the data directory, once loaded; text files the menus read (name generator, credits) */
export const gData = { fs: null as DataFS | null, text: new Map<string, string>() };
const TEXT_FILES = ['data/prefixes.txt', 'data/suffixes.txt', 'data/suffixnames.txt', 'doc/CREDITS'];

async function readJSON(fs: DataFS, path: string): Promise<Json | null> {
  if (!fs.exists(path)) return null;
  try {
    return JSON.parse(new TextDecoder().decode(await fs.read(path))) as Json;
  } catch {
    return null;
  }
}

/** PicManagerLoadDir: every .png below dir; names are relative to dir without the extension */
async function PicManagerLoadDir(fs: DataFS, dir: string, pics: Map<string, NamedPic>, sprites: Map<string, NamedSprites>,
  isHD: boolean): Promise<void> {
  for (const path of fs.list(dir)) {
    if (!/\.png$/i.test(path)) continue;
    const rel = path.slice(dir.length + 1);
    if (rel.split('/').some((s, i, a) => i < a.length - 1 && s.startsWith('.'))) continue;
    const name = rel.replace(/\.[^./]*$/, '');
    let image;
    try {
      image = decodePNG(await fs.read(path));
    } catch {
      continue;
    }
    PicManagerAdd(pics, sprites, name, image, isHD);
  }
  PicManagerAfterAdd(gPicManager);
}

/** CharSpriteClassesLoadDir: graphics/chars/bodies/<name>/data.json below a data directory or an archive */
async function CharSpriteClassesLoadDir(fs: DataFS, root: string, classes: Map<string, ReturnType<typeof CharSpritesLoadJSON>>): Promise<void> {
  const base = `${root}${root ? '/' : ''}graphics/chars/bodies/`;
  const names = new Set<string>();
  for (const p of fs.list(base.slice(0, -1))) {
    const rest = p.slice(base.length);
    const slash = rest.indexOf('/');
    if (slash > 0 && !rest.startsWith('.')) names.add(rest.slice(0, slash));
  }
  for (const name of names) {
    const root2 = await readJSON(fs, `${base}${name}/data.json`);
    if (root2 == null) continue;
    classes.set(name, CharSpritesLoadJSON(name, root2));
  }
}

/** the data loading of cdogs.c main, from PicManagerLoad to MapObjectsInit */
export async function GameDataLoad(fs: DataFS, onProgress: (text: string, p: number) => void | Promise<void> = () => {}): Promise<void> {
  gData.fs = fs;
  for (const t of TEXT_FILES) if (fs.exists(t)) gData.text.set(t, new TextDecoder().decode(await fs.read(t)));
  await onProgress('Loading graphics...', 0.0);
  await PicManagerLoadDir(fs, 'graphics', gPicManager.pics, gPicManager.sprites, false);
  await PicManagerLoadDir(fs, 'graphics_hd', gPicManager.pics, gPicManager.sprites, true);
  await onProgress('Initializing sound device...', 0.25);
  gSoundDevice.sounds.clear();
  gSoundDevice.customSounds.clear();
  SoundLoadDir(gSoundDevice.sounds, fs.list('sounds').map((p) => p.slice('sounds/'.length)), 'sounds/',
    (rel) => fs.exists(`sounds/${rel}`));
  MusicPlayerInit((dir) => fs.list(dir));
  await onProgress('Loading character sprites...', 0.34);
  gCharSpriteClasses.classes.clear();
  await CharSpriteClassesLoadDir(fs, '', gCharSpriteClasses.classes);
  await onProgress('Loading particles...', 0.42);
  gParticleClasses.Classes = [];
  gParticleClasses.CustomClasses = [];
  const particles = await readJSON(fs, 'data/particles.json');
  if (particles) ParticleClassesLoadJSON(gParticleClasses.Classes, particles);
  await onProgress('Loading ammo...', 0.5);
  gAmmo.Ammo = [];
  gAmmo.CustomAmmo = [];
  const ammo = await readJSON(fs, 'data/ammo.json');
  if (ammo) AmmoLoadJSON(gAmmo.Ammo, ammo);
  await onProgress('Loading bullets and weapons...', 0.58);
  gBulletClasses.Classes = [];
  gBulletClasses.CustomClasses = [];
  const bullets = await readJSON(fs, 'data/bullets.json');
  if (bullets) BulletLoadJSON(gBulletClasses.Classes, bullets);
  gWeaponClasses.Guns = [];
  gWeaponClasses.CustomGuns = [];
  const guns = await readJSON(fs, 'data/guns.json');
  if (guns) {
    WeaponClassesLoadJSON(gWeaponClasses.Guns, guns);
    BulletLoadWeapons();
  }
  await onProgress('Loading character classes...', 0.66);
  gCharacterClasses.Classes = [];
  gCharacterClasses.CustomClasses = [];
  const cc = await readJSON(fs, 'data/character_classes.json');
  if (cc) CharacterClassesLoadJSON(gCharacterClasses.Classes, cc);
  await onProgress('Loading pickups...', 0.86);
  gPickupClasses.Classes = [];
  gPickupClasses.CustomClasses = [];
  gPickupClasses.KeyClasses = [];
  const pickups = await readJSON(fs, 'data/pickups.json');
  if (pickups) {
    PickupClassesLoadJSON(gPickupClasses.Classes, pickups);
    PickupClassesLoadAmmo(gPickupClasses.Classes, gAmmo.Ammo);
    PickupClassesLoadGuns(gPickupClasses.Classes, gWeaponClasses.Guns);
    PickupClassesLoadKeys(gPickupClasses.KeyClasses);
  }
  await onProgress('Loading map objects...', 0.92);
  gMapObjects.Classes = [];
  gMapObjects.CustomClasses = [];
  const mos = await readJSON(fs, 'data/map_objects.json');
  if (mos) {
    MapObjectsLoadJSON(gMapObjects.Classes, mos);
    MapObjectsLoadAmmoAndGunSpawners(false);
  }
  await onProgress('Loading main menu...', 1.0);
}

// --- campaigns ---------------------------------------------------------------------------------------------------

/** CampaignSettingInit */
export function CampaignSettingInit(c: Campaign): void {
  c.Setting = newCampaignSetting();
  c.Setting.DoorOpenTicks = FPS_FRAMELIMIT;
  c.Setting.characters = newCharacterStore();
  PickupClassesLoadKeys(gPickupClasses.KeyClasses);
}
/** CampaignSettingTerminateAll: the campaign's own data goes */
export function CampaignSettingTerminateAll(c: Campaign): void {
  c.Setting = newCampaignSetting();
  gSoundDevice.customSounds.clear();
  PicManagerClearCustom(gPicManager);
  PicManagerAfterAdd(gPicManager);
  gCharSpriteClasses.customClasses.clear();
  gParticleClasses.CustomClasses = [];
  gAmmo.CustomAmmo = [];
  gPlayerTemplates.CustomClasses = [];
  gCharacterClasses.CustomClasses = [];
  gBulletClasses.CustomClasses = [];
  gWeaponClasses.CustomGuns = [];
  gPickupClasses.CustomClasses = [];
  gPickupClasses.KeyClasses = [];
  gMapObjects.CustomClasses = [];
}

/** MapNewScanArchive: the title and number of missions of a campaign, or null */
export async function MapNewScanArchive(fs: DataFS, path: string): Promise<{ title: string; numMissions: number } | null> {
  const root = await readJSON(fs, `${path}/campaign.json`);
  if (root == null) return null;
  const r = root as Record<string, unknown>;
  const version = typeof r.Version === 'number' ? r.Version : 0;
  if (version > MAP_VERSION || version <= 0) return null;
  const title = typeof r.Title === 'string' ? r.Title : '';
  const numMissions = version < 3 ? (Array.isArray(r.Missions) ? r.Missions.length : 0)
    : typeof r.Missions === 'number' ? r.Missions : 0;
  return { title, numMissions };
}

/** CampaignEntryTryLoad for a .cdogscpn archive below the data directory */
export async function CampaignEntryTryLoad(fs: DataFS, path: string, mode: number): Promise<CampaignEntry | null> {
  const scan = await MapNewScanArchive(fs, path);
  if (scan == null) return null;
  const title = scan.title.length > 70 ? scan.title.slice(0, 70) : scan.title;
  return {
    Filename: path.slice(path.lastIndexOf('/') + 1), Path: path, Info: `${title} (${scan.numMissions})`, Mode: mode,
    BuiltinIndex: 0, NumMissions: scan.numMissions, IsBuiltin: false,
  };
}

/** MapNewLoadArchive */
export async function MapNewLoadArchive(fs: DataFS, path: string, c: CampaignSetting): Promise<boolean> {
  const croot = await readJSON(fs, `${path}/campaign.json`);
  if (croot == null) return false;
  const version = typeof (croot as Record<string, unknown>).Version === 'number' ? (croot as Record<string, number>).Version : 0;
  if (version > MAP_VERSION || version <= 2) return false;
  MapNewLoadCampaignJSON(croot, c);
  const soundDir = `${path}/sounds`;
  SoundLoadDir(gSoundDevice.customSounds, fs.list(soundDir).map((p) => p.slice(soundDir.length + 1)), `${soundDir}/`,
    (rel) => fs.exists(`${soundDir}/${rel}`));
  await PicManagerLoadDir(fs, `${path}/graphics`, gPicManager.customPics, gPicManager.customSprites, false);
  await PicManagerLoadDir(fs, `${path}/graphics_hd`, gPicManager.customPics, gPicManager.customSprites, true);
  await CharSpriteClassesLoadDir(fs, path, gCharSpriteClasses.customClasses);
  let root = await readJSON(fs, `${path}/particles.json`);
  if (root) ParticleClassesLoadJSON(gParticleClasses.CustomClasses, root);
  root = await readJSON(fs, `${path}/character_classes.json`);
  if (root) CharacterClassesLoadJSON(gCharacterClasses.CustomClasses, root);
  root = await readJSON(fs, `${path}/bullets.json`);
  if (root) BulletLoadJSON(gBulletClasses.CustomClasses, root);
  let hasCustomAmmo = false;
  root = await readJSON(fs, `${path}/ammo.json`);
  if (root) {
    AmmoLoadJSON(gAmmo.CustomAmmo, root);
    hasCustomAmmo = true;
  }
  let hasCustomGuns = false;
  root = await readJSON(fs, `${path}/guns.json`);
  if (root) {
    WeaponClassesLoadJSON(gWeaponClasses.CustomGuns, root);
    hasCustomGuns = true;
  }
  BulletLoadWeapons();
  root = await readJSON(fs, `${path}/pickups.json`);
  if (root) PickupClassesLoadJSON(gPickupClasses.CustomClasses, root);
  if (hasCustomAmmo) PickupClassesLoadAmmo(gPickupClasses.CustomClasses, gAmmo.CustomAmmo);
  if (hasCustomGuns) PickupClassesLoadGuns(gPickupClasses.CustomClasses, gWeaponClasses.CustomGuns);
  PickupClassesLoadKeys(gPickupClasses.KeyClasses);
  root = await readJSON(fs, `${path}/map_objects.json`);
  if (root) MapObjectsLoadJSON(gMapObjects.CustomClasses, root);
  MapObjectsLoadAmmoAndGunSpawners(true);
  root = await readJSON(fs, `${path}/missions.json`);
  if (root == null) return false;
  LoadMissions(c.Missions, ((root as Record<string, Json[]>).Missions) ?? [], version);
  root = await readJSON(fs, `${path}/characters.json`);
  if (root) CharacterLoadJSON(c.characters, root, version);
  return true;
}

/** CampaignLoad (gamedata.c); quick play is set up by quickplay.ts */
export async function CampaignLoad(fs: DataFS, co: Campaign, entry: CampaignEntry,
  quickPlay: (c: CampaignSetting) => void = () => {}): Promise<boolean> {
  const mode = co.Entry.Mode;
  co.Entry = { ...entry, Mode: mode };
  CampaignSettingInit(co);
  if (entry.Mode === GAME_MODE_QUICK_PLAY) {
    quickPlay(co.Setting);
    co.IsLoaded = true;
  } else {
    co.IsLoaded = await MapNewLoadArchive(fs, entry.Path, co.Setting);
  }
  return co.IsLoaded;
}
export function CampaignUnload(co: Campaign): void {
  co.MissionIndex = 0;
  co.IsLoaded = false;
  co.IsClient = false;
  co.OptionsSet = false;
  co.IsComplete = false;
  co.IsQuit = false;
}
