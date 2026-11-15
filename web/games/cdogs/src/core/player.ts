// C-Dogs SDL 2.5.0, translated: players (player.c), the player data message (net_util.c NMakePlayerData) and
// the campaign's lives and HP (campaigns.c). GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
import {
  CLAMP, MAX, MIN, colorAsianSkin, colorBlack, colorDarkSkin, colorGreen, colorLightBlue, colorRed, colorSkin,
  colorYellow, svec2_add, svec2_scale, svec2_zero, f32, type Color, type Vec2,
} from './base.ts';
import {
  AmmoGetById, AmmoGetNumClasses, CharacterClassGetDeathSprites, StrCharacterClass, StrWeaponClass, WC_BARREL,
  WeaponClassFullPrice, WeaponClassGetPrerequisite, WeaponClassNumBarrels, newCharacter,
} from './classes.ts';
import { HEAD_PART_FACEHAIR, HEAD_PART_GLASSES, HEAD_PART_HAIR, HEAD_PART_HAT, gPicManager, type CharColors } from './pics.ts';
import { ConfigGetBool, ConfigGetInt } from './config.ts';
import {
  GUNTYPE_GRENADE, GUNTYPE_MELEE, INPUT_DEVICE_AI, INPUT_DEVICE_UNSET, MAX_GRENADES, MAX_GUNS, MAX_WEAPONS, MELEE_SLOT,
  type PlayerData, type PlayerStats, type WeaponClass, type WeaponUsage,
} from './types.ts';
import { GAME_MODE_DEATHMATCH, GAME_MODE_DOGFIGHT, gCampaign, gPlayerDatas, IsPVP, type Campaign } from './state.ts';
import { ActorDestroy, ActorGetByUID, ActorGetCharacter, AMMO_STARTING_MULTIPLE } from './actors.ts';
import type { Character } from './types.ts';
import { platformHooks } from './hooks.ts';
import { PlayerTemplateGetById } from './templates.ts';

export const MAX_LOCAL_PLAYERS = 4;
const STARTING_CASH = 10000;
export const PLAYER_ANY = 0;
export const PLAYER_ALIVE = 1;
export const PLAYER_ALIVE_OR_DYING = 2;

export function newStats(): PlayerStats {
  return { Score: 0, Kills: 0, Suicides: 0, Friendlies: 0, TimeTicks: 0 };
}
const clr = (c: Color): Color => ({ ...c });
const zeroColor = (): Color => ({ r: 0, g: 0, b: 0, a: 0 });
export function zeroCharColors(): CharColors {
  return {
    Skin: zeroColor(), Arms: zeroColor(), Body: zeroColor(), Legs: zeroColor(), Hair: zeroColor(), Feet: zeroColor(),
    Facehair: zeroColor(), Hat: zeroColor(), Glasses: zeroColor(),
  };
}

/** NPlayerData (msg.proto) */
export interface NPlayerData {
  Name: string;
  CharacterClass: string;
  Hair: string;
  Facehair: string;
  Hat: string;
  Glasses: string;
  Colors: CharColors;
  Weapons: string[];
  WeaponUsages: { Weapon: string; Shots: number; Hits: number }[];
  Lives: number;
  Stats: PlayerStats;
  Totals: PlayerStats;
  MaxHealth: number;
  ExcessHealth: number;
  HP: number;
  LastMission: number;
  UID: number;
  Ammo: { Id: number; Amount: number }[];
}
export function NPlayerDataDefault(): NPlayerData {
  return {
    Name: '', CharacterClass: '', Hair: '', Facehair: '', Hat: '', Glasses: '', Colors: zeroCharColors(), Weapons: [],
    WeaponUsages: [], Lives: 0, Stats: newStats(), Totals: newStats(), MaxHealth: 0, ExcessHealth: 0, HP: 0,
    LastMission: 0, UID: 0, Ammo: [],
  };
}

// --- campaigns.c ---------------------------------------------------------------------------------------------------

export function CampaignGetMaxLives(c: Campaign): number {
  switch (c.Entry.Mode) {
    case GAME_MODE_DOGFIGHT: return 1;
    case GAME_MODE_DEATHMATCH: return ConfigGetInt('Deathmatch.Lives');
    default:
      if (c.Setting.MaxLives > 0) return c.Setting.MaxLives;
      return MIN(4, CampaignGetLives(c));
  }
}
export function CampaignGetLives(c: Campaign): number {
  switch (c.Entry.Mode) {
    case GAME_MODE_DOGFIGHT:
    case GAME_MODE_DEATHMATCH:
      return CampaignGetMaxLives(c);
    default:
      if (c.Setting.Lives > 0) return c.Setting.Lives;
      return 1;
  }
}
export function CampaignGetMaxHP(c: Campaign): number {
  if (c.Entry.Mode === GAME_MODE_DOGFIGHT) return Math.trunc((500 * ConfigGetInt('Dogfight.PlayerHP')) / 100);
  if (c.Setting.PlayerMaxHP > 0) return c.Setting.PlayerMaxHP;
  return Math.trunc((200 * ConfigGetInt('Game.PlayerHP')) / 100);
}
export function CampaignGetExcessHP(c: Campaign): number {
  if (c.Entry.Mode === GAME_MODE_DOGFIGHT) return CampaignGetHP(c) * 2;
  if (c.Setting.PlayerExcessHP > 0) return c.Setting.PlayerExcessHP;
  return CampaignGetHP(c) * 2;
}
export function CampaignGetHP(c: Campaign): number {
  if (c.Entry.Mode === GAME_MODE_DOGFIGHT) return CampaignGetMaxHP(c);
  if (c.Setting.PlayerHP > 0) return c.Setting.PlayerHP;
  return CampaignGetMaxHP(c);
}

// --- player.c --------------------------------------------------------------------------------------------------

/** the port's IsLocal: every human player runs in every client's simulation (lockstep); the client's own players */
export const localPlayers = { firstUID: 0, ownUIDs: null as Set<number> | null };

export function PlayerDataAddOrUpdate(pd: NPlayerData): void {
  let p = PlayerDataGetByUID(pd.UID);
  if (p == null) {
    const ch: Character = newCharacter();
    ch.speed = 1;
    ch.bot = null;
    p = {
      ActorUID: -1, IsLocal: true, Ready: false, Char: ch, name: '', guns: [null, null, null, null], ammo: new Array(pd.Ammo.length).fill(0),
      Lives: 0, HP: 0, Stats: newStats(), Totals: newStats(), WeaponUsages: new Map<string, WeaponUsage>(), hp: 0, survived: 0,
      missions: 0, lastMission: 0, inputDevice: INPUT_DEVICE_UNSET, deviceIndex: 0, UID: pd.UID,
      isOwn: localPlayers.ownUIDs == null || localPlayers.ownUIDs.has(pd.UID),
    };
    gPlayerDatas.push(p);
  }
  p.UID = pd.UID;
  p.name = pd.Name;
  p.Char.Class = StrCharacterClass(pd.CharacterClass) ?? StrCharacterClass('Jones');
  p.Char.HeadParts[HEAD_PART_HAIR] = pd.Hair.length > 0 ? pd.Hair : null;
  p.Char.HeadParts[HEAD_PART_FACEHAIR] = pd.Facehair.length > 0 ? pd.Facehair : null;
  p.Char.HeadParts[HEAD_PART_HAT] = pd.Hat.length > 0 ? pd.Hat : null;
  p.Char.HeadParts[HEAD_PART_GLASSES] = pd.Glasses.length > 0 ? pd.Glasses : null;
  p.Char.Colors = cloneCharColors(pd.Colors);
  for (let i = 0; i < pd.Weapons.length; i++) {
    p.guns[i] = null;
    if (pd.Weapons[i].length > 0) p.guns[i] = StrWeaponClass(pd.Weapons[i]);
  }
  p.ammo.fill(0);
  for (const a of pd.Ammo) p.ammo[a.Id] = a.Amount;
  p.Lives = pd.Lives;
  p.Stats = { ...pd.Stats };
  p.Totals = { ...pd.Totals };
  p.Char.maxHealth = pd.MaxHealth;
  p.Char.excessHealth = pd.ExcessHealth;
  p.HP = pd.HP;
  p.lastMission = pd.LastMission;
  p.Ready = true;
}
export function cloneCharColors(c: CharColors): CharColors {
  return {
    Skin: clr(c.Skin), Arms: clr(c.Arms), Body: clr(c.Body), Legs: clr(c.Legs), Hair: clr(c.Hair), Feet: clr(c.Feet),
    Facehair: clr(c.Facehair), Hat: clr(c.Hat), Glasses: clr(c.Glasses),
  };
}
export function PlayerRemove(uid: number): void {
  const i = gPlayerDatas.findIndex((p) => p.UID === uid);
  if (i < 0) return;
  const p = gPlayerDatas[i];
  if (p.ActorUID >= 0) ActorDestroy(ActorGetByUID(p.ActorUID)!);
  gPlayerDatas.splice(i, 1);
}
export function PlayerDataDefault(idx: number): NPlayerData {
  const pd = NPlayerDataDefault();
  const t = PlayerTemplateGetById(idx);
  if (t != null) {
    pd.Name = t.name;
    pd.CharacterClass = t.CharClassName ?? '';
    pd.Hair = t.HeadParts[HEAD_PART_HAIR] ?? '';
    pd.Facehair = t.HeadParts[HEAD_PART_FACEHAIR] ?? '';
    pd.Hat = t.HeadParts[HEAD_PART_HAT] ?? '';
    pd.Glasses = t.HeadParts[HEAD_PART_GLASSES] ?? '';
    pd.Colors = cloneCharColors(t.Colors);
  } else {
    const c = pd.Colors;
    switch (idx) {
      case 0:
        pd.Name = 'Jones';
        pd.CharacterClass = 'Jones';
        c.Skin = clr(colorSkin);
        c.Arms = clr(colorLightBlue); c.Body = clr(colorLightBlue); c.Legs = clr(colorLightBlue); c.Feet = clr(colorLightBlue);
        break;
      case 1:
        pd.Name = 'Ice';
        pd.CharacterClass = 'Jones';
        pd.Glasses = 'shades';
        c.Skin = clr(colorDarkSkin);
        c.Arms = clr(colorRed); c.Body = clr(colorRed); c.Legs = clr(colorRed); c.Feet = clr(colorRed);
        c.Glasses = clr(colorBlack);
        break;
      case 2:
        pd.Name = 'Warbaby';
        pd.CharacterClass = 'Jones';
        pd.Hat = 'beret';
        c.Skin = clr(colorSkin);
        c.Arms = clr(colorGreen); c.Body = clr(colorGreen); c.Legs = clr(colorGreen); c.Feet = clr(colorGreen);
        c.Hat = clr(colorRed);
        break;
      case 3:
        pd.Name = 'Han';
        pd.CharacterClass = 'Jones';
        pd.Hair = 'rattail';
        pd.Facehair = 'handlebar';
        c.Skin = clr(colorAsianSkin);
        c.Arms = clr(colorYellow); c.Body = clr(colorYellow); c.Legs = clr(colorYellow); c.Hair = clr(colorYellow);
        c.Feet = clr(colorYellow); c.Facehair = clr(colorYellow);
        break;
      default:
        pd.Name = `Player ${idx}`;
        pd.CharacterClass = 'Jones';
        c.Skin = clr(colorSkin);
        c.Arms = clr(colorLightBlue); c.Body = clr(colorLightBlue); c.Legs = clr(colorLightBlue); c.Hair = clr(colorLightBlue);
        c.Feet = clr(colorLightBlue);
        break;
    }
  }
  pd.HP = CampaignGetHP(gCampaign);
  pd.MaxHealth = CampaignGetMaxHP(gCampaign);
  pd.ExcessHealth = CampaignGetExcessHP(gCampaign);
  pd.Lives = CampaignGetLives(gCampaign);
  if (gCampaign.Setting.BuyAndSell) pd.Totals.Score = STARTING_CASH;
  pd.Ammo = new Array(AmmoGetNumClasses()).fill(null).map(() => ({ Id: 0, Amount: 0 }));
  return pd;
}
export function NMakePlayerData(p: PlayerData): NPlayerData {
  const d = NPlayerDataDefault();
  d.Name = p.name;
  d.CharacterClass = p.Char.Class!.Name;
  d.Hair = p.Char.HeadParts[HEAD_PART_HAIR] ?? '';
  d.Facehair = p.Char.HeadParts[HEAD_PART_FACEHAIR] ?? '';
  d.Hat = p.Char.HeadParts[HEAD_PART_HAT] ?? '';
  d.Glasses = p.Char.HeadParts[HEAD_PART_GLASSES] ?? '';
  d.Colors = cloneCharColors(p.Char.Colors);
  for (let i = 0; i < MAX_WEAPONS; i++) d.Weapons.push(p.guns[i] != null ? p.guns[i]!.name : '');
  for (const [k, v] of p.WeaponUsages) d.WeaponUsages.push({ Weapon: k, Shots: v.Shots, Hits: v.Hits });
  d.Lives = p.Lives;
  d.Stats = { ...p.Stats };
  d.Totals = { ...p.Totals };
  d.MaxHealth = p.Char.maxHealth;
  d.ExcessHealth = p.Char.excessHealth;
  d.HP = p.HP;
  d.LastMission = p.lastMission;
  d.UID = p.UID;
  for (let i = 0; i < p.ammo.length; i++) if (p.ammo[i] > 0) d.Ammo.push({ Id: i, Amount: p.ammo[i] });
  return d;
}
export function PlayerDataMissionReset(p: PlayerData): NPlayerData {
  const pd = NMakePlayerData(p);
  if (gCampaign.Setting.PlayerHP === 0) pd.HP = CampaignGetHP(gCampaign);
  pd.Stats = newStats();
  pd.LastMission = gCampaign.MissionIndex;
  pd.MaxHealth = CampaignGetMaxHP(gCampaign);
  pd.ExcessHealth = CampaignGetExcessHP(gCampaign);
  return pd;
}
export function PlayerDataGetByUID(uid: number): PlayerData | null {
  if (uid === -1) return null;
  for (const p of gPlayerDatas) if (p.UID === uid) return p;
  return null;
}
export function FindLocalPlayerIndex(uid: number): number {
  const p = PlayerDataGetByUID(uid);
  if (p == null || !p.IsLocal) return -1;
  return uid % MAX_LOCAL_PLAYERS;
}
export function GetNumPlayers(alive: number, human: boolean, local: boolean): number {
  let n = 0;
  for (const p of gPlayerDatas) {
    let life = false;
    switch (alive) {
      case PLAYER_ANY: life = true; break;
      case PLAYER_ALIVE: life = IsPlayerAlive(p); break;
      case PLAYER_ALIVE_OR_DYING: life = IsPlayerAliveOrDying(p); break;
    }
    if (life && (!human || p.inputDevice !== INPUT_DEVICE_AI) && (!local || p.IsLocal)) n++;
  }
  return n;
}
export function AreAllPlayersDeadAndNoLives(): boolean {
  for (const p of gPlayerDatas) if (IsPlayerAlive(p) || p.Lives > 0) return false;
  return true;
}
export function GetFirstPlayer(alive: boolean, human: boolean, local: boolean): PlayerData | null {
  for (const p of gPlayerDatas) {
    if ((!alive || IsPlayerAliveOrDying(p)) && (!human || p.inputDevice !== INPUT_DEVICE_AI) && (!local || p.IsLocal)) return p;
  }
  return null;
}
export function IsPlayerAlive(player: PlayerData | null): boolean {
  if (player == null || player.ActorUID === -1) return false;
  return !ActorGetByUID(player.ActorUID)!.dead;
}
export function IsPlayerHuman(player: PlayerData): boolean {
  return player.inputDevice !== INPUT_DEVICE_AI;
}
export function IsPlayerHumanAndAlive(player: PlayerData): boolean {
  return IsPlayerAlive(player) && IsPlayerHuman(player);
}
export function IsPlayerAliveOrDying(player: PlayerData): boolean {
  if (player.ActorUID === -1) return false;
  const p = ActorGetByUID(player.ActorUID)!;
  const deathSprites = CharacterClassGetDeathSprites(ActorGetCharacter(p).Class!)!;
  return p.dead <= deathSprites.pics.length;
}
/** IsPlayerScreen: in the port only the client's own players get screens */
export function IsPlayerScreen(p: PlayerData): boolean {
  const humanOnly = IsPVP(gCampaign.Entry.Mode) || !ConfigGetBool('Interface.SplitscreenAI');
  const humanOrScreen = !humanOnly || p.inputDevice !== INPUT_DEVICE_AI;
  return p.IsLocal && p.isOwn && humanOrScreen && IsPlayerAliveOrDying(p);
}
export function PlayersGetMidpoint(): Vec2 {
  const r = PlayersGetBoundingRectangle();
  return svec2_scale(svec2_add(r.min, r.max), f32(0.5));
}
/** the bounding rectangle of the client's own players (the camera follows them) */
export function PlayersGetBoundingRectangle(): { min: Vec2; max: Vec2 } {
  let isFirst = true;
  let min = svec2_zero();
  let max = svec2_zero();
  const humansOnly = GetNumPlayers(PLAYER_ALIVE_OR_DYING, true, false) > 0;
  for (const p of gPlayerDatas) {
    if (!p.IsLocal || !p.isOwn) continue;
    if (humansOnly ? IsPlayerHumanAndAlive(p) : IsPlayerAlive(p)) {
      const ti = ActorGetByUID(p.ActorUID)!.thing;
      if (isFirst) {
        min = { ...ti.Pos };
        max = { ...ti.Pos };
      } else {
        min = { x: MIN(ti.Pos.x, min.x), y: MIN(ti.Pos.y, min.y) };
        max = { x: MAX(ti.Pos.x, max.x), y: MAX(ti.Pos.y, max.y) };
      }
      isFirst = false;
    }
  }
  return { min, max };
}
export function PlayersNumUseAmmo(ammoId: number): number {
  let n = 0;
  for (const p of gPlayerDatas) {
    if (!IsPlayerAlive(p)) continue;
    const player = ActorGetByUID(p.ActorUID)!;
    for (let j = 0; j < MAX_WEAPONS; j++) {
      const w = player.guns[j];
      if (w.Gun == null) continue;
      for (let i = 0; i < WeaponClassNumBarrels(w.Gun); i++) if (WC_BARREL(w.Gun, 'AmmoId', i) === ammoId) n++;
    }
  }
  return n;
}
export function PlayerIsLocal(uid: number): boolean {
  const p = PlayerDataGetByUID(uid);
  return p != null && p.IsLocal;
}
export function PlayerScore(p: PlayerData | null, points: number): void {
  if (p == null) return;
  p.Stats.Score += points;
  p.Totals.Score += points;
}
export function PlayerTrySetInputDevice(p: PlayerData, d: number, idx: number): boolean {
  if (p.inputDevice === d && p.deviceIndex === idx) return false;
  p.inputDevice = d;
  p.deviceIndex = idx;
  return true;
}
export function PlayerTrySetUnusedInputDevice(p: PlayerData, d: number, idx: number): boolean {
  if (p.inputDevice !== INPUT_DEVICE_UNSET) return false;
  for (const o of gPlayerDatas) if (o.inputDevice === d && o.deviceIndex === idx) return false;
  return PlayerTrySetInputDevice(p, d, idx);
}
export function PlayerGetNumWeapons(p: PlayerData): number {
  return p.guns.filter((g) => g != null).length;
}
export function PlayerHasGrenadeButton(p: PlayerData | null): boolean {
  return p != null && platformHooks.hasGrenadeButton(p);
}
export function PlayerHasWeapon(p: PlayerData, wc: WeaponClass | null): boolean {
  if (wc == null) return false;
  for (let i = 0; i < MAX_WEAPONS; i++) if (p.guns[i] === wc) return true;
  return false;
}
export function PlayerHasWeaponUpgrade(p: PlayerData, wc: WeaponClass | null): boolean {
  if (wc == null) return false;
  for (let i = 0; i < MAX_WEAPONS; i++) if (WeaponClassGetPrerequisite(p.guns[i]) === wc) return true;
  return false;
}
function AddWeaponToSlot(p: PlayerData, wc: WeaponClass | null, slot: number): void {
  p.guns[slot] = wc;
  const n = WeaponClassNumBarrels(wc);
  for (let i = 0; i < n; i++) {
    const ammoId = WC_BARREL(wc!, 'AmmoId', i);
    if (ammoId < 0) continue;
    const startingAmount = AmmoGetById(ammoId)!.Amount * AMMO_STARTING_MULTIPLE;
    if (startingAmount > PlayerGetAmmoAmount(p, ammoId)) p.ammo[ammoId] = startingAmount;
  }
}
export function PlayerAddWeaponToSlot(p: PlayerData, wc: WeaponClass | null, slot: number): void {
  if (wc) {
    for (let i = 0; i < MAX_WEAPONS; i++) {
      if (i === slot) continue;
      const g = p.guns[i];
      if (g && (g === wc || WeaponClassGetPrerequisite(g) === wc || g === WeaponClassGetPrerequisite(wc))) {
        p.guns[i] = p.guns[slot];
        PlayerAddWeaponToSlot(p, wc, i);
        return;
      }
    }
  }
  if (p.guns[slot]) PlayerRemoveWeapon(p, slot);
  if (gCampaign.Setting.BuyAndSell) PlayerScore(p, -WeaponClassFullPrice(wc));
  AddWeaponToSlot(p, wc, slot);
}
export function PlayerAddWeapon(p: PlayerData, wc: WeaponClass | null): void {
  if (wc == null || PlayerHasWeapon(p, wc)) return;
  let first = 0;
  let max = MELEE_SLOT;
  if (wc.Type === GUNTYPE_MELEE) {
    first = MELEE_SLOT;
    max = MELEE_SLOT + 1;
  } else if (wc.Type === GUNTYPE_GRENADE) {
    first = MAX_GUNS;
    max = first + MAX_GRENADES;
  }
  for (let i = first; i < max; i++) {
    if (p.guns[i] == null) {
      AddWeaponToSlot(p, wc, i);
      break;
    }
  }
}
export function PlayerRemoveWeapon(p: PlayerData, slot: number): void {
  if (gCampaign.Setting.BuyAndSell) PlayerScore(p, WeaponClassFullPrice(p.guns[slot]));
  const ammoIds = [-1, -1];
  const n = WeaponClassNumBarrels(p.guns[slot]);
  for (let i = 0; i < n; i++) ammoIds[i] = WC_BARREL(p.guns[slot]!, 'AmmoId', i);
  p.guns[slot] = null;
  PlayerAddMinimalWeapons(p);
  for (let i = 0; i < 2; i++) {
    if (ammoIds[i] >= 0 && !PlayerUsesAmmo(p, ammoIds[i])) PlayerAddAmmo(p, ammoIds[i], -PlayerGetAmmoAmount(p, ammoIds[i]), false);
  }
}
export function PlayerAddMinimalWeapons(p: PlayerData): void {
  PlayerAddWeapon(p, StrWeaponClass('Fists'));
}
export function PlayerUsesAmmo(p: PlayerData, ammoId: number): boolean {
  for (let i = 0; i < MAX_WEAPONS; i++) {
    const g = p.guns[i];
    if (g == null) continue;
    for (let j = 0; j < WeaponClassNumBarrels(g); j++) if (WC_BARREL(g, 'AmmoId', j) === ammoId) return true;
  }
  return false;
}
export function PlayerUsesAnyAmmo(p: PlayerData): boolean {
  for (let i = 0; i < MAX_WEAPONS; i++) {
    const g = p.guns[i];
    if (g == null) continue;
    for (let j = 0; j < WeaponClassNumBarrels(g); j++) if (WC_BARREL(g, 'AmmoId', j) >= 0) return true;
  }
  return false;
}
export function PlayerGetAmmoAmount(p: PlayerData, ammoId: number): number {
  return ammoId >= 0 && p.ammo.length >= ammoId ? p.ammo[ammoId] ?? 0 : 0;
}
export function PlayerAddAmmo(p: PlayerData, ammoId: number, amount: number, isFree: boolean): void {
  const oldAmount = p.ammo[ammoId];
  const a = AmmoGetById(ammoId)!;
  p.ammo[ammoId] = CLAMP(p.ammo[ammoId] + amount, 0, a.Max);
  if (!isFree && a.Price && gCampaign.Setting.BuyAndSell) {
    const dLots = Math.trunc((oldAmount - p.ammo[ammoId]) / a.Amount);
    PlayerScore(p, dLots * a.Price);
  }
}
export function PlayerSetHP(p: PlayerData, hp: number): void {
  p.HP = CLAMP(hp, 1, CampaignGetMaxHP(gCampaign));
}
export function PlayerSetLives(p: PlayerData, lives: number): void {
  p.Lives = CLAMP(lives, 1, CampaignGetMaxLives(gCampaign));
}
export function CharacterGetStartingHealth(c: Character, p: PlayerData | null): number {
  if (p == null) return MAX(Math.trunc((c.maxHealth * ConfigGetInt('Game.NonPlayerHP')) / 100), 1);
  return p.HP > 0 ? p.HP : c.maxHealth;
}
export { gPicManager };
