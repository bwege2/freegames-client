// C-Dogs SDL 2.5.0, translated: the generated quick play campaign (quick_play.c), which is also the main menu's
// live background. GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
import { MAX, MIN, RAND_BOOL, RAND_FLOAT, RAND_INT, TILE_HEIGHT, TILE_WIDTH, colorWhite, f32, rand, type Color, type Vec2i } from './base.ts';
import { ConfigGetBool, ConfigGetEnum, QUICKPLAY_QUANTITY_ANY, QUICKPLAY_QUANTITY_LARGE, QUICKPLAY_QUANTITY_MEDIUM, QUICKPLAY_QUANTITY_SMALL } from './config.ts';
import {
  CharacterShuffleAppearance, FPS_FRAMELIMIT, IndexMapObject, MapObjectsCount, WeaponClassCanShoot, WeaponClassGetRange,
  WeaponClassIsHighDPS, gWeaponClasses, newCharacter, newCharacterStore,
} from './classes.ts';
import { gPicManager, type PicManager } from './pics.ts';
import { gTileDoor, gTileFloor, gTileRoom, gTileWall, TileClassBaseStyleType, TileClassInit } from './map.ts';
import { MAPTYPE_CAVE, MAPTYPE_CLASSIC, MAPTYPE_INTERIOR, MAPTYPE_STATIC, MissionInit, OBJECTIVE_KILL, OBJECTIVE_POSKNOWN, type Mission, type MissionTileClasses, type RoomParams } from './mission.ts';
import { MAP_OBJECT_TYPE_PICKUP_SPAWNER, TILE_CLASS_DOOR, TILE_CLASS_FLOOR, TILE_CLASS_WALL, type Character, type CharacterStore, type WeaponClass } from './types.ts';
import type { CampaignSetting } from './state.ts';
import { FLAGS_AWAKEALWAYS, FLAGS_GOOD_GUY } from './actors.ts';

const NUM_MISSIONS = 3;
const missionSizes = [QUICKPLAY_QUANTITY_SMALL, QUICKPLAY_QUANTITY_MEDIUM, QUICKPLAY_QUANTITY_LARGE];
const missionTitles = ['Rumble in the Cyberpen', 'Revenge of the Cyberzombies', 'Rise of the Cyberdog'];
const missionDescriptions = [
  'You are an elite Cyberdog. Your task is to kill your enemies!',
  'The dastardly cyberzombies have gathered! Kill them before they get you!',
  'End of the line! Kill the remaining enemies to defeat them once and for all!',
];
const missionNumEnemies = [2, 4, 6];
const missionKillCountMin = [3, 5, 7];
/** the resolution the background map fills (gGraphicsDevice.cachedConfig.Res) */
export const quickPlayRes = { x: 320, y: 200 };

function GenerateRandomPairPartitionWithRestrictions(total: number, min: number, max: number): Vec2i {
  if (Math.trunc((total + 1) / 2) > max || total < min) return { x: Math.trunc(total / 2), y: total - Math.trunc(total / 2) };
  const xLow = MAX(min, total - max);
  const xHigh = MIN(max, total - min);
  const x = xLow + (rand() % (xHigh - xLow + 1));
  return { x, y: total - x };
}
function GenerateQuickPlayMapSize(size: number): Vec2i {
  switch (size) {
    case QUICKPLAY_QUANTITY_ANY: return GenerateRandomPairPartitionWithRestrictions(RAND_INT(32, 128 + 1), 16, 64);
    case QUICKPLAY_QUANTITY_SMALL: return GenerateRandomPairPartitionWithRestrictions(RAND_INT(32, 64 + 1), 16, 64);
    case QUICKPLAY_QUANTITY_MEDIUM: return GenerateRandomPairPartitionWithRestrictions(RAND_INT(64, 96 + 1), 16, 64);
    case QUICKPLAY_QUANTITY_LARGE: return GenerateRandomPairPartitionWithRestrictions(RAND_INT(96, 128 + 1), 16, 64);
    default: return { x: 0, y: 0 };
  }
}
function GenerateQuickPlayParam(qty: number, low: number, medium: number, high: number, max: number): number {
  switch (qty) {
    case QUICKPLAY_QUANTITY_ANY: return RAND_INT(low, max + 1);
    case QUICKPLAY_QUANTITY_SMALL: return RAND_INT(low, medium + 1);
    case QUICKPLAY_QUANTITY_MEDIUM: return RAND_INT(medium, high + 1);
    case QUICKPLAY_QUANTITY_LARGE: return RAND_INT(high, max + 1);
    default: return 0;
  }
}
function GenerateQuickPlayParamFloat(qty: number, low: number, medium: number, high: number, max: number): number {
  switch (qty) {
    case QUICKPLAY_QUANTITY_ANY: return RAND_FLOAT(low, max);
    case QUICKPLAY_QUANTITY_SMALL: return RAND_FLOAT(low, medium);
    case QUICKPLAY_QUANTITY_MEDIUM: return RAND_FLOAT(medium, high);
    case QUICKPLAY_QUANTITY_LARGE: return RAND_FLOAT(high, max);
    default: return 0;
  }
}
const isShortRange = (wc: WeaponClass): boolean => WeaponClassGetRange(wc) < 100;
const isLongRange = (wc: WeaponClass): boolean => WeaponClassGetRange(wc) > 130;
function SetupQuickPlayEnemy(enemy: Character, wc: WeaponClass, isBg: boolean): void {
  CharacterShuffleAppearance(enemy);
  enemy.Gun = wc;
  enemy.speed = GenerateQuickPlayParamFloat(ConfigGetEnum('QuickPlay.EnemySpeed'), f32(0.25), f32(0.4), f32(0.7), 1);
  if (isShortRange(enemy.Gun)) enemy.speed = f32(enemy.speed * f32(1.25));
  const bot = enemy.bot!;
  bot.probabilityToMove = isShortRange(enemy.Gun) ? 35 + (rand() % 35) : 30 + (rand() % 30);
  bot.probabilityToTrack = 10 + (rand() % 60);
  if (!WeaponClassCanShoot(enemy.Gun)) bot.probabilityToShoot = 0;
  else if (WeaponClassIsHighDPS(enemy.Gun)) bot.probabilityToShoot = 1 + (rand() % 3);
  else bot.probabilityToShoot = 1 + (rand() % 6);
  bot.actionDelay = rand() % (50 + 1);
  enemy.maxHealth = GenerateQuickPlayParam(ConfigGetEnum('QuickPlay.EnemyHealth'), 10, 20, 40, 60);
  enemy.excessHealth = enemy.maxHealth * 2;
  enemy.flags = 0;
  if (isBg) {
    enemy.flags |= FLAGS_AWAKEALWAYS;
    if (RAND_BOOL()) enemy.flags |= FLAGS_GOOD_GUY;
  }
}
function CharacterStoreAddOther(store: CharacterStore): Character {
  const c = newCharacter();
  const z = { r: 0, g: 0, b: 0, a: 0 };
  c.Colors = { Skin: z, Arms: z, Body: z, Legs: z, Hair: z, Feet: z, Facehair: z, Hat: z, Glasses: z };
  store.OtherChars.push(c);
  return c;
}
function SetupQuickPlayEnemies(numEnemies: number, store: CharacterStore, isBg: boolean): void {
  const explosives = ConfigGetBool('QuickPlay.EnemiesWithExplosives');
  for (let i = 0; i < numEnemies; i++) {
    let wc: WeaponClass;
    for (;;) {
      wc = gWeaponClasses.Guns[rand() % gWeaponClasses.Guns.length];
      if (!wc.IsRealGun) continue;
      if (i === 0 && !isShortRange(wc)) continue;
      if (i === 1 && !isLongRange(wc)) continue;
      if (i === 2 && explosives && !WeaponClassIsHighDPS(wc)) continue;
      if (!explosives && WeaponClassIsHighDPS(wc)) continue;
      break;
    }
    SetupQuickPlayEnemy(CharacterStoreAddOther(store), wc, isBg);
  }
}
function RandomStyle(names: string[]): string {
  return names[rand() % names.length];
}
function RandomBGColor(): Color {
  const r = rand() % 128;
  const g = rand() % 128;
  const b = rand() % 128;
  return { r, g, b, a: 255 };
}
function RandomMissionTileClasses(mtc: MissionTileClasses, pm: PicManager): void {
  let style = RandomStyle(pm.wallStyleNames);
  let c1 = RandomBGColor();
  let c2 = RandomBGColor();
  mtc.Wall = TileClassInit(gTileWall, pm, style, TileClassBaseStyleType(TILE_CLASS_WALL), c1, c2);
  style = RandomStyle(pm.tileStyleNames);
  c1 = RandomBGColor();
  c2 = RandomBGColor();
  mtc.Floor = TileClassInit(gTileFloor, pm, style, TileClassBaseStyleType(TILE_CLASS_FLOOR), c1, c2);
  style = RandomStyle(pm.tileStyleNames);
  c1 = RandomBGColor();
  c2 = RandomBGColor();
  mtc.Room = TileClassInit(gTileRoom, pm, style, TileClassBaseStyleType(TILE_CLASS_FLOOR), c1, c2);
  style = RandomStyle(pm.doorStyleNames);
  mtc.Door = TileClassInit(gTileDoor, pm, style, TileClassBaseStyleType(TILE_CLASS_DOOR), colorWhite, colorWhite);
}
function RandomRoomParams(): RoomParams {
  const Count = GenerateQuickPlayParam(ConfigGetEnum('QuickPlay.RoomCount'), 0, 2, 5, 12);
  const Min = (rand() % 10) + 5;
  const Max = (rand() % 10) + Min;
  const Walls = rand() % 5;
  const WallLength = (rand() % 6) + 1;
  const WallPad = (rand() % 4) + 1;
  return { Count, Min, Max, Edge: true, Overlap: true, Walls, WallLength, WallPad };
}
function AddMission(missions: Mission[], pm: PicManager, cs: CharacterStore, idx: number, isBg: boolean): void {
  const m = MissionInit();
  m.Title = missionTitles[idx];
  m.Description = missionDescriptions[idx];
  m.ExitStyle = RandomStyle(pm.exitStyleNames);
  m.KeyStyle = RandomStyle(pm.keyStyleNames);
  if (isBg) {
    m.Size = { x: Math.trunc(quickPlayRes.x / TILE_WIDTH) + 1, y: Math.trunc(quickPlayRes.y / TILE_HEIGHT) + 1 };
  } else {
    m.Size = GenerateQuickPlayMapSize(missionSizes[idx]);
  }
  do {
    m.Type = rand() % 4;
  } while (m.Type === MAPTYPE_STATIC);
  switch (m.Type) {
    case MAPTYPE_CLASSIC: {
      const c = m.Classic;
      RandomMissionTileClasses(c.TileClasses, pm);
      c.Walls = GenerateQuickPlayParam(ConfigGetEnum('QuickPlay.WallCount'), 0, 5, 15, 30);
      c.WallLength = GenerateQuickPlayParam(ConfigGetEnum('QuickPlay.WallLength'), 1, 3, 6, 12);
      c.CorridorWidth = (rand() % 3) + 1;
      c.Rooms = RandomRoomParams();
      c.Squares = GenerateQuickPlayParam(ConfigGetEnum('QuickPlay.SquareCount'), 0, 1, 3, 6);
      c.ExitEnabled = RAND_BOOL();
      c.Doors.Enabled = RAND_BOOL();
      c.Doors.Min = 1;
      c.Doors.Max = 6;
      c.Pillars.Count = rand() % 5;
      c.Pillars.Min = (rand() % 3) + 1;
      c.Pillars.Max = (rand() % 3) + c.Pillars.Min;
      break;
    }
    case MAPTYPE_CAVE: {
      const c = m.Cave;
      RandomMissionTileClasses(c.TileClasses, pm);
      c.FillPercent = (rand() % 40) + 10;
      c.Repeat = rand() % 6;
      c.R1 = (rand() % 2) + 4;
      c.R2 = (rand() % 5) - 1;
      c.CorridorWidth = (rand() % 3) + 1;
      c.Rooms = RandomRoomParams();
      c.Squares = GenerateQuickPlayParam(ConfigGetEnum('QuickPlay.SquareCount'), 0, 1, 3, 6);
      c.ExitEnabled = RAND_BOOL();
      c.DoorsEnabled = RAND_BOOL();
      break;
    }
    case MAPTYPE_INTERIOR: {
      const c = m.Interior;
      RandomMissionTileClasses(c.TileClasses, pm);
      c.CorridorWidth = (rand() % 3) + 1;
      c.Rooms = RandomRoomParams();
      c.ExitEnabled = RAND_BOOL();
      c.Doors.Enabled = RAND_BOOL();
      c.Doors.Min = 1;
      c.Doors.Max = 6;
      c.Pillars.Count = rand() % 5;
      c.Pillars.Min = (rand() % 3) + 1;
      c.Pillars.Max = (rand() % 3) + c.Pillars.Min;
      break;
    }
    default:
      break;
  }
  for (let i = 0; i < MIN(missionNumEnemies[idx], cs.OtherChars.length); i++) m.Enemies.push(i);
  if (!isBg) {
    m.SpecialChars.push(0);
    const count = RAND_INT(missionKillCountMin[idx], Math.trunc((missionKillCountMin[idx] * 3) / 2));
    const required = RAND_INT(MAX(1, Math.trunc(count / 2)), count);
    m.Objectives.push({
      Description: 'Kill the enemies', Type: OBJECTIVE_KILL, Index: 0, MapObjects: [], Pickups: [], Count: count, Required: required,
      Flags: OBJECTIVE_POSKNOWN, color: { ...colorWhite }, placed: 0, done: 0,
    });
  }
  const c = GenerateQuickPlayParam(ConfigGetEnum('QuickPlay.ItemCount'), 0, 10, 20, 40);
  for (let i = 0; i < c; i++) {
    const M = IndexMapObject(rand() % MapObjectsCount());
    const Density = M.Type === MAP_OBJECT_TYPE_PICKUP_SPAWNER ? 1 : GenerateQuickPlayParam(ConfigGetEnum('QuickPlay.ItemCount'), 0, 5, 10, 20);
    m.MapObjectDensities.push({ M, Density });
  }
  m.EnemyDensity = Math.trunc(10 / m.Enemies.length);
  for (const wc of gWeaponClasses.Guns) if (wc.IsRealGun) m.Weapons.push(wc);
  m.WeaponPersist = true;
  missions.push(m);
}
export function SetupQuickPlayCampaign(setting: CampaignSetting, isBg: boolean): void {
  setting.characters = newCharacterStore();
  const c = GenerateQuickPlayParam(ConfigGetEnum('QuickPlay.EnemyCount'), 3, 5, 8, 12);
  SetupQuickPlayEnemies(c, setting.characters, isBg);
  setting.Title = 'Quick play';
  setting.Author = '';
  setting.Description = '';
  setting.RandomPickups = true;
  setting.DoorOpenTicks = FPS_FRAMELIMIT;
  for (let i = 0; i < NUM_MISSIONS; i++) AddMission(setting.Missions, gPicManager, setting.characters, i, isBg);
}
