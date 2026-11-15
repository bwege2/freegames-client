// C-Dogs SDL 2.5.0, translated: the data classes and their loaders (ammo.c, particle_class.c, bullet_class.c's
// loading, weapon_class.c, pickup_class.c, map_object.c, character_class.c, character.c, weapon_usage.c).
// GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
import {
  rand, RAND_INT, RAND_BOOL, RAND_DOUBLE, cmod, f32, MIN, MAX, idiv, svec2i, svec2_zero, svec2_scale, svec2_add,
  svec2_subtract, Vec2FromRadians, Vec2FromRadiansScaled, DirectionMirrorX, dir2radians,
  svec2, svec2i_zero, MPI_2, Z_FACTOR, MAX_BARRELS, TILE_HEIGHT, TILE_SIZE, colorWhite, colorRed, colorBlack,
  ColorTint, StrColor, StrSpecialDamage, SPECIAL_NONE, SPECIAL_FLAME, SPECIAL_POISON,
  SPECIAL_PETRIFY, SPECIAL_CONFUSE, RAND_FLOAT, MPI, type Color, type Vec2, type HSV,
} from './base.ts';
import {
  CPicNew, CPicLoadJSON, CPicLoadNormal, CPicIsLoaded, CPicGetSize, CPicGetPic, CPicCopyPic, CPicInitNormal,
  CPicInitNormalFromName, PicManagerGetPic, PicManagerGetSprites, gPicManager, StrCharSpriteClass,
  BODY_PART_GUN_R, BODY_PART_GUN_L, HEAD_PART_COUNT, HEAD_PART_HAIR, HEAD_PART_FACEHAIR, HEAD_PART_HAT,
  HEAD_PART_GLASSES, PICTYPE_ANIMATED, type CharSprites, type NamedSprites,
} from './pics.ts';
import {
  GetString, LoadBool, LoadColor, LoadDouble, LoadFloat, LoadFullInt, LoadInt, LoadStr, LoadVec2, LoadVec2i,
  arr, child, has, type Json,
} from './json.ts';
import { StrSound } from './sounds.ts';
import {
  GUNTYPE_GRENADE, GUNTYPE_MELEE, GUNTYPE_MULTI, GUNTYPE_NORMAL, GUNSTATE_FIRING, MELEE_SLOT, GRENADE_SLOT,
  PARTICLE_PIC, PARTICLE_TEXT, PARTICLE_CHAR_SPRITE, PICKUP_NONE, PICKUP_JEWEL, PICKUP_HEALTH, PICKUP_AMMO,
  PICKUP_KEYCARD, PICKUP_GUN, PICKUP_SHOW_MAP, PICKUP_LIVES, PICKUP_SOUND, PICKUP_MENU, THING_DRAW_ABOVE,
  THING_DRAW_BELOW, THING_IMPASSABLE, THING_CAN_BE_SHOT, MAP_OBJECT_TYPE_NORMAL, MAP_OBJECT_TYPE_PICKUP_SPAWNER,
  MAP_OBJECT_TYPE_ACTOR_SPAWNER,
  type Ammo, type ParticleClass, type BulletClass, type WeaponClass, type WeaponClassNormal, type PickupClass,
  type PickupEffect, type MapObject, type CharacterClass, type Character, type CharacterStore, type WeaponUsage,
} from './types.ts';

export const FPS_FRAMELIMIT = 70;

// ---------------------------------------------------------------------------------------------------------------
// ammo.c

export const gAmmo = { Ammo: [] as Ammo[], CustomAmmo: [] as Ammo[] };
export const AMMO_STARTING_MULTIPLE = 2;

export function StrAmmoId(s: string | null): number {
  if (s == null || s.length === 0) return 0;
  const ci = gAmmo.CustomAmmo.findIndex((a) => a.Name === s);
  if (ci >= 0) return ci + gAmmo.Ammo.length;
  const i = gAmmo.Ammo.findIndex((a) => a.Name === s);
  return i >= 0 ? i : 0;
}
export function AmmoGetById(id: number): Ammo | null {
  if (id < gAmmo.Ammo.length) return gAmmo.Ammo[id] ?? null;
  return gAmmo.CustomAmmo[id - gAmmo.Ammo.length] ?? null;
}
export function StrAmmo(s: string): Ammo | null {
  return AmmoGetById(StrAmmoId(s));
}
export function AmmoGetNumClasses(): number {
  return gAmmo.Ammo.length + gAmmo.CustomAmmo.length;
}
export function AmmoIsLow(a: Ammo, amount: number): boolean {
  return amount <= idiv(a.Amount, 2);
}
export function AmmoLoadJSON(ammo: Ammo[], node: Json): void {
  const version = LoadInt(node, 'Version', 0);
  if (version > 2 || version <= 0) return;
  for (const c of arr(node, 'Ammo')) {
    const a: Ammo = {
      Name: GetString(c, 'Name'), Pic: CPicNew(), Sound: null, Amount: 0, Max: 0, Price: 0, DefaultGun: null,
    };
    const picNode = child(c, 'Pic');
    if (version < 2) CPicLoadNormal(a.Pic, picNode);
    else CPicLoadJSON(a.Pic, picNode);
    a.Sound = GetString(c, 'Sound');
    a.Amount = LoadInt(c, 'Amount', 0);
    a.Max = LoadInt(c, 'Max', 0);
    a.Price = LoadInt(c, 'Price', 0);
    ammo.push(a);
  }
}

// ---------------------------------------------------------------------------------------------------------------
// particle_class.c

export const gParticleClasses = { Classes: [] as ParticleClass[], CustomClasses: [] as ParticleClass[] };

export function StrParticleClass(name: string | null | undefined): ParticleClass | null {
  if (name == null || name.length === 0) return null;
  return gParticleClasses.CustomClasses.find((c) => c.Name === name) ??
    gParticleClasses.Classes.find((c) => c.Name === name) ?? null;
}
function StrParticleType(s: string): number {
  if (s === 'Text') return PARTICLE_TEXT;
  if (s === 'CharSprite') return PARTICLE_CHAR_SPRITE;
  return PARTICLE_PIC;
}
export function ParticleClassesLoadJSON(classes: ParticleClass[], root: Json): void {
  const version = LoadInt(root, 'Version', 0);
  if (version > 3 || version <= 0) return;
  for (const node of arr(root, 'Particles')) {
    const c: ParticleClass = {
      Name: GetString(node, 'Name'), Type: PARTICLE_PIC, Pic: CPicNew(),
      Text: { Value: null, Mask: { ...colorWhite } }, CharSprite: null, RangeLow: 0, RangeHigh: 0,
      GravityFactor: 0, HitsWalls: false, Bounces: true, BounceFriction: 0, WallBounces: true, ZDarken: false,
      DrawBelow: false, DrawAbove: false,
    };
    if (version < 2) {
      c.Pic.Mask = { ...colorWhite };
      if (has(node, 'Sprites')) {
        c.Pic.Type = 1;
        c.Pic.Sprites = PicManagerGetSprites(gPicManager, GetString(node, 'Sprites'))?.pics ?? null;
      } else if (has(node, 'Pic')) {
        c.Pic.Pic = PicManagerGetPic(gPicManager, GetString(node, 'Pic'));
      }
      if (has(node, 'Mask')) c.Pic.Mask = StrColor(GetString(node, 'Mask'));
      const ticksPerFrame = LoadInt(node, 'TicksPerFrame', 0);
      if (ticksPerFrame > 0) {
        c.Pic.Type = PICTYPE_ANIMATED;
        c.Pic.TicksPerFrame = ticksPerFrame;
      }
    } else {
      const t = LoadStr(node, 'Type');
      if (t != null) c.Type = StrParticleType(t);
      switch (c.Type) {
        case PARTICLE_PIC:
          CPicLoadJSON(c.Pic, child(node, 'Pic'));
          break;
        case PARTICLE_TEXT:
          c.Text.Mask = { ...colorWhite };
          if (version <= 2) {
            const m = LoadStr(node, 'TextMask');
            if (m != null) c.Text.Mask = StrColor(m);
          } else if (has(node, 'Text')) {
            const text = child(node, 'Text');
            const m = LoadStr(text, 'Mask');
            if (m != null) c.Text.Mask = StrColor(m);
            c.Text.Value = LoadStr(text, 'Value');
          }
          break;
        case PARTICLE_CHAR_SPRITE:
          c.CharSprite = LoadStr(node, 'CharSprite');
          break;
        default:
          break;
      }
    }
    if (has(node, 'Range')) {
      c.RangeLow = LoadInt(node, 'Range', 0);
      c.RangeHigh = c.RangeLow;
    }
    if (has(node, 'RangeLow')) c.RangeLow = LoadInt(node, 'RangeLow', c.RangeLow);
    if (has(node, 'RangeHigh')) c.RangeHigh = LoadInt(node, 'RangeHigh', c.RangeHigh);
    c.RangeLow = MIN(c.RangeLow, c.RangeHigh);
    c.RangeHigh = MAX(c.RangeLow, c.RangeHigh);
    c.GravityFactor = LoadFloat(node, 'GravityFactor', 0);
    c.HitsWalls = LoadBool(node, 'HitsWalls', false);
    c.Bounces = LoadBool(node, 'Bounces', true);
    c.BounceFriction = LoadFloat(node, 'BounceFriction', 0);
    c.WallBounces = LoadBool(node, 'WallBounces', true);
    c.ZDarken = LoadBool(node, 'ZDarken', false);
    c.DrawBelow = LoadBool(node, 'DrawBelow', false);
    c.DrawAbove = LoadBool(node, 'DrawAbove', false);
    classes.push(c);
  }
}

// ---------------------------------------------------------------------------------------------------------------
// bullet_class.c (classes; the bullets themselves are in objs.ts)

export const FLAMED_COUNT = 10;
export const POISONED_COUNT = 8;
export const PETRIFIED_COUNT = 95;
export const CONFUSED_COUNT = 700;

function newBulletClass(): BulletClass {
  return {
    Name: '', CPic: CPicNew(), Trail: { P: null, Width: 0, TicksPerEmit: 0 }, ShadowSize: svec2i_zero(), Delay: 0,
    SpeedLow: 0, SpeedHigh: 0, SpeedScale: false, Friction: 0, RangeLow: 0, RangeHigh: 0, Power: 0, Mass: 0,
    Size: svec2i_zero(), Special: { Effect: SPECIAL_NONE, Ticks: 0 }, HurtAlways: false, Persists: false,
    Spark: null, OutOfRangeSpark: null, WallMark: null, WallBounceElasticity: 0,
    Hit: { Object: { Hit: false, Sound: null }, Flesh: { Hit: false, Sound: null }, Wall: { Hit: false, Sound: null } },
    Falling: { GravityFactor: 0, FallsDown: false, DestroyOnDrop: false, BounceElasticity: 0, BounceFriction: 0, DropGuns: [] },
    SeekFactor: 0, Erratic: false, OutOfRangeGuns: [], HitGuns: [], ProximityGuns: [], node: null,
  };
}
function copyBulletClass(d: BulletClass): BulletClass {
  return {
    ...d, CPic: { ...d.CPic }, Trail: { ...d.Trail }, ShadowSize: { ...d.ShadowSize }, Size: { ...d.Size },
    Special: { ...d.Special },
    Hit: { Object: { ...d.Hit.Object }, Flesh: { ...d.Hit.Flesh }, Wall: { ...d.Hit.Wall } },
    Falling: { ...d.Falling, DropGuns: [] }, OutOfRangeGuns: [], HitGuns: [], ProximityGuns: [],
  };
}
export const gBulletClasses = { Classes: [] as BulletClass[], Default: newBulletClass(), CustomClasses: [] as BulletClass[] };

export function StrBulletClass(s: string | null | undefined): BulletClass | null {
  if (s == null || s.length === 0) return null;
  return gBulletClasses.CustomClasses.find((b) => b.Name === s) ??
    gBulletClasses.Classes.find((b) => b.Name === s) ?? null;
}
function LoadParticleRef(node: Json, name: string): ParticleClass | null | undefined {
  const s = LoadStr(node, name);
  return s != null ? StrParticleClass(s) : undefined;
}
function LoadBullet(node: Json, defaultBullet: BulletClass | null, version: number): BulletClass {
  const b = defaultBullet ? copyBulletClass(defaultBullet) : newBulletClass();
  const name = LoadStr(node, 'Name');
  if (name != null) b.Name = name;
  if (has(node, 'Pic')) {
    b.CPic = CPicNew();
    CPicLoadJSON(b.CPic, child(node, 'Pic'));
  }
  if (has(node, 'Trail')) {
    const trail = child(node, 'Trail');
    const p = LoadStr(trail, 'Particle');
    if (p != null) b.Trail.P = StrParticleClass(p);
    b.Trail.Width = 1.0;
    b.Trail.Width = LoadFloat(trail, 'Width', b.Trail.Width);
    b.Trail.TicksPerEmit = LoadInt(trail, 'TicksPerEmit', b.Trail.TicksPerEmit);
  }
  b.ShadowSize = LoadVec2i(node, 'ShadowSize', b.ShadowSize);
  b.Delay = LoadInt(node, 'Delay', b.Delay);
  if (has(node, 'Speed')) {
    b.SpeedLow = LoadFullInt(node, 'Speed', b.SpeedLow);
    b.SpeedHigh = b.SpeedLow;
  }
  b.SpeedLow = LoadFullInt(node, 'SpeedLow', b.SpeedLow);
  b.SpeedHigh = LoadFullInt(node, 'SpeedHigh', b.SpeedHigh);
  b.SpeedLow = MIN(b.SpeedLow, b.SpeedHigh);
  b.SpeedHigh = MAX(b.SpeedLow, b.SpeedHigh);
  b.SpeedScale = LoadBool(node, 'SpeedScale', b.SpeedScale);
  b.Friction = LoadFullInt(node, 'Friction', b.Friction);
  if (has(node, 'Range')) {
    b.RangeLow = LoadInt(node, 'Range', b.RangeLow);
    b.RangeHigh = b.RangeLow;
  }
  b.RangeLow = LoadInt(node, 'RangeLow', b.RangeLow);
  b.RangeHigh = LoadInt(node, 'RangeHigh', b.RangeHigh);
  b.RangeLow = MIN(b.RangeLow, b.RangeHigh);
  b.RangeHigh = MAX(b.RangeLow, b.RangeHigh);
  b.Power = LoadInt(node, 'Power', b.Power);
  if (version < 2) b.Mass = f32(b.Power);
  else b.Mass = LoadFloat(node, 'Mass', b.Mass);
  b.Size = LoadVec2i(node, 'Size', b.Size);
  if (version < 4) {
    const s = LoadStr(node, 'Special');
    if (s != null) b.Special.Effect = StrSpecialDamage(s);
  } else if (has(node, 'Special')) {
    const special = child(node, 'Special');
    const s = LoadStr(special, 'Effect');
    if (s != null) b.Special.Effect = StrSpecialDamage(s);
    b.Special.Ticks = LoadInt(special, 'Ticks', b.Special.Ticks);
  }
  if (b.Special.Effect !== SPECIAL_NONE && b.Special.Ticks === 0) {
    switch (b.Special.Effect) {
      case SPECIAL_FLAME: b.Special.Ticks = FLAMED_COUNT; break;
      case SPECIAL_POISON: b.Special.Ticks = POISONED_COUNT; break;
      case SPECIAL_PETRIFY: b.Special.Ticks = PETRIFIED_COUNT; break;
      case SPECIAL_CONFUSE: b.Special.Ticks = CONFUSED_COUNT; break;
      default: break;
    }
  }
  b.HurtAlways = LoadBool(node, 'HurtAlways', b.HurtAlways);
  b.Persists = LoadBool(node, 'Persists', b.Persists);
  let p = LoadParticleRef(node, 'Spark');
  if (p !== undefined) b.Spark = p;
  p = LoadParticleRef(node, 'OutOfRangeSpark');
  if (p !== undefined) b.OutOfRangeSpark = p;
  p = LoadParticleRef(node, 'WallMark');
  if (p !== undefined) b.WallMark = p;
  if (version < 5) {
    if (has(node, 'HitSounds')) {
      const hs = child(node, 'HitSounds');
      const lh = (n: string): string | null => {
        let s = LoadStr(hs, n);
        if (version < 3 && s != null) {
          if (s.startsWith('hit_')) s = 'hits/' + s.slice(4);
          else if (s.startsWith('knife_')) s = 'hits/knife_' + s.slice(6);
        }
        return s;
      };
      b.Hit.Object.Sound = lh('Object');
      b.Hit.Flesh.Sound = lh('Flesh');
      b.Hit.Wall.Sound = lh('Wall');
    }
    const hitsObjectsAndFlesh = LoadBool(node, 'HitsObjects', true);
    b.Hit.Object.Hit = b.Hit.Flesh.Hit = hitsObjectsAndFlesh;
  } else if (has(node, 'Hit')) {
    const hits = child(node, 'Hit');
    const names = ['Object', 'Flesh', 'Wall'] as const;
    for (const n of names) {
      const hp = b.Hit[n];
      hp.Hit = false;
      if (has(hits, n)) {
        const hit = child(hits, n);
        hp.Hit = true;
        if (has(hit, 'Sound')) hp.Sound = GetString(hit, 'Sound');
      }
    }
  }
  const wallBounces = LoadBool(node, 'WallBounces', false);
  b.WallBounceElasticity = LoadFloat(node, 'WallBounceElasticity', b.WallBounceElasticity);
  if (wallBounces) b.WallBounceElasticity = 1.0;
  if (has(node, 'Falling')) {
    const falling = child(node, 'Falling');
    b.Falling.GravityFactor = LoadFloat(falling, 'GravityFactor', b.Falling.GravityFactor);
    b.Falling.FallsDown = true;
    b.Falling.FallsDown = LoadBool(falling, 'FallsDown', b.Falling.FallsDown);
    b.Falling.DestroyOnDrop = LoadBool(falling, 'DestroyOnDrop', b.Falling.DestroyOnDrop);
    const bounces = LoadBool(falling, 'Bounces', false);
    b.Falling.BounceElasticity = LoadFloat(falling, 'BounceElasticity', b.Falling.BounceElasticity);
    if (bounces) b.Falling.BounceElasticity = 0.5;
    b.Falling.BounceFriction = LoadFloat(falling, 'BounceFriction', b.Falling.BounceFriction);
  }
  b.SeekFactor = LoadInt(node, 'SeekFactor', b.SeekFactor);
  b.Erratic = LoadBool(node, 'Erratic', b.Erratic);
  b.node = node;
  return b;
}
export function BulletLoadJSON(classes: BulletClass[], root: Json): void {
  const version = LoadInt(root, 'Version', 0);
  if (version > 5 || version <= 0) return;
  if (has(root, 'DefaultBullet')) gBulletClasses.Default = LoadBullet(child(root, 'DefaultBullet')!, null, version);
  for (const c of arr(root, 'Bullets')) classes.push(LoadBullet(c, gBulletClasses.Default, version));
}
function LoadBulletGuns(node: Json | undefined, name: string): WeaponClass[] | null {
  if (!has(node, name)) return null;
  const out: WeaponClass[] = [];
  for (const g of arr(node, name)) {
    const wc = StrWeaponClass(String(g));
    if (wc) out.push(wc);
  }
  return out;
}
export function BulletLoadWeapons(): void {
  for (const classes of [gBulletClasses.Classes, gBulletClasses.CustomClasses]) {
    for (const b of classes) {
      const node = b.node as Json | null;
      if (node == null) continue;
      if (has(node, 'Falling')) b.Falling.DropGuns = LoadBulletGuns(child(node, 'Falling'), 'DropGuns') ?? b.Falling.DropGuns;
      b.OutOfRangeGuns = LoadBulletGuns(node, 'OutOfRangeGuns') ?? b.OutOfRangeGuns;
      b.HitGuns = LoadBulletGuns(node, 'HitGuns') ?? b.HitGuns;
      b.ProximityGuns = LoadBulletGuns(node, 'ProximityGuns') ?? b.ProximityGuns;
      b.node = null;
    }
  }
}

// ---------------------------------------------------------------------------------------------------------------
// weapon_class.c

export const GUN_COUNT = 18;
export const gWeaponClasses = { Guns: [] as WeaponClass[], CustomGuns: [] as WeaponClass[] };

function newNormal(): WeaponClassNormal {
  return {
    Sprites: null, Grips: 0, Bullets: [], AmmoId: 0, Cost: 0, ReloadLead: 0, Sound: null, ReloadSound: null,
    SoundLockLength: 0, Recoil: 0, Spread: { Count: 0, Width: 0 }, AngleOffset: 0, MuzzleHeight: 0,
    ElevationLow: 0, ElevationHigh: 0, MuzzleFlash: null, Brass: null, Shake: { Amount: 0, CameraSubjectOnly: false },
    Auto: false,
  };
}
export function newWeaponClass(): WeaponClass {
  return {
    Icon: null, Type: GUNTYPE_NORMAL, Normal: newNormal(), Guns: [null, null], name: '', Description: null,
    Prerequisite: null, Lock: 0, SwitchSound: null, CanDrop: false, DropGun: null, IsRealGun: false, Price: 0,
    OverheatTicks: 0,
  };
}
export function GunTypeGetSlotStartEnd(gt: number): [number, number] {
  switch (gt) {
    case GUNTYPE_MELEE: return [MELEE_SLOT, MELEE_SLOT];
    case GUNTYPE_GRENADE: return [GRENADE_SLOT, GRENADE_SLOT];
    default: return [0, 1];
  }
}
function LoadWeaponClass(node: Json, version: number): WeaponClass {
  const wc = newWeaponClass();
  const gunsNode = has(node, 'Guns');
  if (gunsNode) {
    wc.Type = GUNTYPE_MULTI;
  } else {
    const canShoot = LoadBool(node, 'CanShoot', true);
    const isGrenade = LoadBool(node, 'IsGrenade', false);
    if (isGrenade) wc.Type = GUNTYPE_GRENADE;
    else if (!canShoot) wc.Type = GUNTYPE_MELEE;
  }
  if (wc.Type !== GUNTYPE_MULTI) {
    wc.Normal.Sprites = 'chars/guns/blaster';
    wc.Normal.Grips = 1;
    wc.Icon = PicManagerGetPic(gPicManager, 'peashooter');
    wc.Normal.Sound = StrSound('laserpew');
    wc.SwitchSound = StrSound('switch');
    wc.Normal.Spread.Count = 1;
    wc.Normal.MuzzleHeight = 10 * Z_FACTOR;
    wc.Normal.MuzzleFlash = StrParticleClass('muzzle_flash_default');
    wc.Normal.AmmoId = -1;
    wc.CanDrop = true;
  }
  if (has(node, 'Icon')) {
    const icon = PicManagerGetPic(gPicManager, GetString(node, 'Icon'));
    if (icon != null) wc.Icon = icon;
  }
  const n = LoadStr(node, 'Name');
  if (n != null) wc.name = n;
  const d = LoadStr(node, 'Description');
  if (d != null) wc.Description = d;
  const pr = LoadStr(node, 'Prerequisite');
  if (pr != null) wc.Prerequisite = pr;
  wc.Lock = LoadInt(node, 'Lock', wc.Lock);
  if (has(node, 'SwitchSound')) wc.SwitchSound = StrSound(LoadStr(node, 'SwitchSound'));
  wc.CanDrop = LoadBool(node, 'CanDrop', wc.CanDrop);
  const dg = LoadStr(node, 'DropGun');
  if (dg != null) wc.DropGun = dg;
  if (wc.Type === GUNTYPE_MULTI) {
    arr(node, 'Guns').forEach((g, i) => { if (i < MAX_BARRELS) wc.Guns[i] = String(g); });
  } else {
    const pic = LoadStr(node, 'Pic');
    if (pic != null) {
      wc.Normal.Sprites = pic.length > 0 ? `chars/guns/${pic}` : null;
    }
    wc.Normal.Grips = LoadInt(node, 'Grips', wc.Normal.Grips);
    wc.Normal.Bullets = [];
    const bullet = LoadStr(node, 'Bullet');
    if (bullet != null) wc.Normal.Bullets.push(StrBulletClass(bullet));
    if (has(node, 'Bullets')) for (const bn of arr(node, 'Bullets')) wc.Normal.Bullets.push(StrBulletClass(String(bn)));
    const ammo = LoadStr(node, 'Ammo');
    if (ammo != null) {
      wc.Normal.AmmoId = StrAmmoId(ammo);
      if (wc.Type === GUNTYPE_GRENADE) {
        const a = AmmoGetById(wc.Normal.AmmoId)!;
        a.DefaultGun = wc.name;
        wc.Icon = CPicGetPic(a.Pic, 0);
      }
    }
    wc.Normal.Cost = LoadInt(node, 'Cost', wc.Normal.Cost);
    wc.Normal.ReloadLead = LoadInt(node, 'ReloadLead', wc.Normal.ReloadLead);
    if (has(node, 'Sound')) wc.Normal.Sound = StrSound(LoadStr(node, 'Sound'));
    if (has(node, 'ReloadSound')) wc.Normal.ReloadSound = StrSound(LoadStr(node, 'ReloadSound'));
    wc.Normal.SoundLockLength = wc.Lock;
    wc.Normal.SoundLockLength = LoadInt(node, 'SoundLockLength', wc.Normal.SoundLockLength);
    wc.Normal.Recoil = LoadFloat(node, 'Recoil', wc.Normal.Recoil);
    wc.Normal.Spread.Count = LoadInt(node, 'SpreadCount', wc.Normal.Spread.Count);
    wc.Normal.Spread.Width = LoadFloat(node, 'SpreadWidth', wc.Normal.Spread.Width);
    wc.Normal.AngleOffset = LoadFloat(node, 'AngleOffset', wc.Normal.AngleOffset);
    if (has(node, 'MuzzleHeight')) {
      wc.Normal.MuzzleHeight = LoadInt(node, 'MuzzleHeight', wc.Normal.MuzzleHeight);
      wc.Normal.MuzzleHeight *= Z_FACTOR;
    }
    if (has(node, 'Elevation')) {
      wc.Normal.ElevationLow = LoadInt(node, 'Elevation', wc.Normal.ElevationLow);
      wc.Normal.ElevationHigh = wc.Normal.ElevationLow;
    }
    wc.Normal.ElevationLow = LoadInt(node, 'ElevationLow', wc.Normal.ElevationLow);
    wc.Normal.ElevationHigh = LoadInt(node, 'ElevationHigh', wc.Normal.ElevationHigh);
    wc.Normal.ElevationLow = MIN(wc.Normal.ElevationLow, wc.Normal.ElevationHigh);
    wc.Normal.ElevationHigh = MAX(wc.Normal.ElevationLow, wc.Normal.ElevationHigh);
    const mf = LoadStr(node, 'MuzzleFlashParticle');
    if (mf != null) wc.Normal.MuzzleFlash = StrParticleClass(mf);
    const brass = LoadStr(node, 'Brass');
    if (brass != null) wc.Normal.Brass = StrParticleClass(brass);
    if (version < 3) {
      wc.Normal.Shake.Amount = LoadInt(node, 'ShakeAmount', wc.Normal.Shake.Amount);
    } else if (has(node, 'Shake')) {
      const shake = child(node, 'Shake');
      wc.Normal.Shake.Amount = LoadInt(shake, 'Amount', wc.Normal.Shake.Amount);
      wc.Normal.Shake.CameraSubjectOnly = LoadBool(shake, 'CameraSubjectOnly', wc.Normal.Shake.CameraSubjectOnly);
    }
    wc.Normal.Auto = LoadBool(node, 'Auto', wc.Normal.Auto);
  }
  wc.IsRealGun = true;
  if (version < 2 && wc.Type === GUNTYPE_MELEE) wc.Lock = 0;
  wc.Price = LoadInt(node, 'Price', wc.Price);
  wc.OverheatTicks = FPS_FRAMELIMIT;
  wc.OverheatTicks = LoadInt(node, 'OverheatTicks', wc.OverheatTicks);
  return wc;
}
export function WeaponClassesLoadJSON(classes: WeaponClass[], root: Json): void {
  const version = LoadInt(root, 'Version', 0);
  if (version > 3 || version <= 0) return;
  const isMain = classes === gWeaponClasses.Guns;
  if (isMain) for (let i = 0; i < GUN_COUNT; i++) gWeaponClasses.Guns.push(newWeaponClass());
  for (const c of arr(root, 'Guns')) {
    const gd = LoadWeaponClass(c, version);
    let idx = -1;
    if (isMain) idx = LoadInt(c, 'Index', idx);
    if (idx >= 0 && idx < GUN_COUNT) gWeaponClasses.Guns[idx] = gd;
    else classes.push(gd);
  }
  if (has(root, 'PseudoGuns')) {
    for (const c of arr(root, 'PseudoGuns')) {
      const gd = LoadWeaponClass(c, version);
      gd.IsRealGun = false;
      classes.push(gd);
    }
  }
}
export function StrWeaponClass(s: string | null | undefined): WeaponClass | null {
  if (s == null) return null;
  return gWeaponClasses.CustomGuns.find((g) => g.name === s) ?? gWeaponClasses.Guns.find((g) => g.name === s) ?? null;
}
export function IdWeaponClass(i: number): WeaponClass {
  if (i < gWeaponClasses.Guns.length) return gWeaponClasses.Guns[i];
  return gWeaponClasses.CustomGuns[i - gWeaponClasses.Guns.length];
}
export function WeaponClassId(wc: WeaponClass): number {
  let i = gWeaponClasses.Guns.indexOf(wc);
  if (i >= 0) return i;
  i = gWeaponClasses.CustomGuns.indexOf(wc);
  return i >= 0 ? i + gWeaponClasses.Guns.length : -1;
}
export function WeaponClassGetBarrel(wc: WeaponClass, barrel: number): WeaponClass {
  if (wc.Type === GUNTYPE_MULTI) return StrWeaponClass(wc.Guns[barrel])!;
  return wc;
}
/** WC_BARREL_ATTR(_wc, _attr, _barrel) */
export function WC_BARREL<K extends keyof WeaponClassNormal>(wc: WeaponClass, attr: K, barrel: number): WeaponClassNormal[K] {
  return wc.Type === GUNTYPE_MULTI ? StrWeaponClass(wc.Guns[barrel])!.Normal[attr] : wc.Normal[attr];
}
export function WeaponClassNumBarrels(wc: WeaponClass | null): number {
  if (wc == null) return 0;
  return wc.Type === GUNTYPE_MULTI ? 2 : 1;
}
export function WeaponClassHasMuzzle(wc: WeaponClass | null): boolean {
  return wc != null && wc.Type === GUNTYPE_NORMAL && wc.Normal.Sprites != null;
}
const BARREL_LENGTH = 10;
const BARREL_LENGTH_READY = 7;
function GetMuzzleOffset(d: number, state: number): Vec2 {
  const barrelLength = state === GUNSTATE_FIRING ? BARREL_LENGTH : BARREL_LENGTH_READY;
  return svec2_scale(Vec2FromRadians(dir2radians[d]), f32(barrelLength));
}
export function WeaponClassGetBarrelMuzzleOffset(wcIn: WeaponClass, cs: CharSprites, barrel: number, dirIn: number,
  state: number): Vec2 {
  let wc = wcIn;
  let dir = dirIn;
  if (wc.Type === GUNTYPE_MULTI) wc = StrWeaponClass(wc.Guns[barrel])!;
  if (!WeaponClassHasMuzzle(wc)) return svec2_zero();
  if (barrel === 1) dir = DirectionMirrorX(dir);
  const gunOffset = cs.Offsets.Dir[barrel === 0 ? BODY_PART_GUN_R : BODY_PART_GUN_L][dir];
  const offset = svec2_add(gunOffset, GetMuzzleOffset(dir, state));
  if (barrel === 1) return svec2(-offset.x, offset.y);
  return offset;
}
export function WeaponClassGetMuzzleHeight(wc: WeaponClass, state: number, barrel: number): number {
  const muzzleHeight = WC_BARREL(wc, 'MuzzleHeight', barrel);
  return f32(muzzleHeight + (state === GUNSTATE_FIRING ? 0 : 4 * Z_FACTOR));
}
export function WeaponClassIsHighDPS(wc: WeaponClass): boolean {
  if (wc.Type === GUNTYPE_MULTI) {
    return WeaponClassIsHighDPS(StrWeaponClass(wc.Guns[0])!) || WeaponClassIsHighDPS(StrWeaponClass(wc.Guns[1])!);
  }
  for (const bc of wc.Normal.Bullets) {
    if (bc && (bc.Falling.DropGuns.length > 0 || bc.OutOfRangeGuns.length > 0 || bc.HitGuns.length > 0)) return true;
  }
  return false;
}
export function WeaponClassGetRange(wc: WeaponClass): number {
  if (wc.Type === GUNTYPE_MULTI) {
    return f32(f32(WeaponClassGetRange(StrWeaponClass(wc.Guns[0])!) + WeaponClassGetRange(StrWeaponClass(wc.Guns[1])!)) / 2);
  }
  let maxRange = 0;
  for (const bc of wc.Normal.Bullets) {
    if (!bc) continue;
    const speed = f32(f32(bc.SpeedLow + bc.SpeedHigh) / 2);
    const range = idiv(bc.RangeLow + bc.RangeHigh, 2);
    let effectiveRange = f32(speed * range);
    if (bc.Falling.GravityFactor !== 0 && bc.Falling.DestroyOnDrop) effectiveRange = f32(effectiveRange * 0.5);
    maxRange = MAX(maxRange, effectiveRange);
  }
  return maxRange;
}
export const WeaponClassIsLongRange = (wc: WeaponClass): boolean => WeaponClassGetRange(wc) > 130;
export const WeaponClassIsShortRange = (wc: WeaponClass): boolean => WeaponClassGetRange(wc) < 100;
export function WeaponClassCanShoot(wc: WeaponClass): boolean {
  if (wc.Type === GUNTYPE_MULTI) {
    return WeaponClassCanShoot(WeaponClassGetBarrel(wc, 0)) || WeaponClassCanShoot(WeaponClassGetBarrel(wc, 1));
  }
  return wc.Type !== GUNTYPE_MELEE;
}
export function WeaponClassGetBullet(wc: WeaponClass, barrel: number): BulletClass | null {
  if (barrel === -1) return null;
  const w = WeaponClassGetBarrel(wc, barrel);
  for (const bc of w.Normal.Bullets) if (bc) return bc;
  return null;
}
export function WeaponClassGetPrerequisite(wc: WeaponClass | null): WeaponClass | null {
  if (wc == null || wc.Prerequisite == null) return null;
  return StrWeaponClass(wc.Prerequisite);
}
function FindAncestor(wcIn: WeaponClass): WeaponClass {
  let wc = wcIn;
  for (;;) {
    const parent = WeaponClassGetPrerequisite(wc);
    if (parent == null) return wc;
    wc = parent;
  }
}
export function WeaponClassesAreRelated(wc1: WeaponClass | null, wc2: WeaponClass | null): boolean {
  return wc1 != null && wc2 != null && FindAncestor(wc1) === FindAncestor(wc2);
}
export function WeaponClassFullPrice(wc: WeaponClass | null): number {
  if (wc == null) return 0;
  return wc.Price + WeaponClassFullPrice(WeaponClassGetPrerequisite(wc));
}
export function GunTypeStr(t: number): string {
  return ['Normal', 'Melee', 'Grenade', 'Multi'][t] ?? '';
}

/** the brass of weapon_class.c WeaponClassAddBrass, returns the AddParticle (the caller enqueues it) */
export function brassParticle(wc: WeaponClass, d: number, pos: Vec2): {
  Pos: Vec2; Z: number; Vel: Vec2; Angle: number; DZ: number; Spin: number;
} {
  const radians = dir2radians[d];
  const ejectionPortOffset = svec2_scale(Vec2FromRadiansScaled(radians), 7);
  const Pos = svec2_subtract(pos, ejectionPortOffset);
  const Z = f32(wc.Normal.MuzzleHeight);
  const Vel = svec2_scale(Vec2FromRadians(f32(radians + MPI_2)), f32(0.333333));
  Vel.x = f32(Vel.x + RAND_FLOAT(-0.25, 0.25));
  Vel.y = f32(Vel.y + RAND_FLOAT(-0.25, 0.25));
  const Angle = RAND_DOUBLE(0, f32(MPI * 2));
  const DZ = f32(cmod(rand(), 6) + 6);
  const Spin = RAND_DOUBLE(-0.1, 0.1);
  return { Pos, Z, Vel, Angle, DZ, Spin };
}

// ---------------------------------------------------------------------------------------------------------------
// pickup_class.c

export const KEY_COUNT = 4;
export const FLAGS_KEYCARD_YELLOW = 0x1;
export const FLAGS_KEYCARD_GREEN = 0x2;
export const FLAGS_KEYCARD_BLUE = 0x4;
export const FLAGS_KEYCARD_RED = 0x8;
export function StrKeycard(s: string): number {
  switch (s) {
    case 'yellow': return FLAGS_KEYCARD_YELLOW;
    case 'green': return FLAGS_KEYCARD_GREEN;
    case 'blue': return FLAGS_KEYCARD_BLUE;
    case 'red': return FLAGS_KEYCARD_RED;
    default: return 0;
  }
}
export const PICKUP_SCORE = 10;
export const HEALTH_PICKUP_HEAL_AMOUNT = 50;
export const gPickupClasses = { Classes: [] as PickupClass[], CustomClasses: [] as PickupClass[], KeyClasses: [] as PickupClass[] };

export function StrPickupType(s: string): number {
  switch (s) {
    case 'Score': return PICKUP_JEWEL;
    case 'Health': return PICKUP_HEALTH;
    case 'Ammo': return PICKUP_AMMO;
    case 'Key': return PICKUP_KEYCARD;
    case 'Gun': return PICKUP_GUN;
    case 'ShowMap': return PICKUP_SHOW_MAP;
    case 'Lives': return PICKUP_LIVES;
    case 'Sound': return PICKUP_SOUND;
    case 'Menu': return PICKUP_MENU;
    default: return PICKUP_NONE;
  }
}
export function StrPickupClass(s: string | null | undefined): PickupClass | null {
  if (s == null || s.length === 0) return null;
  return gPickupClasses.CustomClasses.find((c) => c.Name === s) ?? gPickupClasses.Classes.find((c) => c.Name === s) ??
    gPickupClasses.KeyClasses.find((c) => c.Name === s) ?? null;
}
export function IntPickupClass(i: number): PickupClass | null {
  const items = ['folder', 'disk1', 'disk2', 'disk3', 'blueprint', 'cd', 'sack', 'holo', 'bottle', 'radio', 'pci_card', 'paper'];
  if (i < 0 || i >= items.length) return null;
  return StrPickupClass(items[i]);
}
export function IntExitStyle(i: number): string {
  return ['hazard', 'plate'][Math.abs(i) % 2];
}
export function IntKeyStyle(style: number): string {
  return ['office', 'dungeon', 'plain', 'cube'][Math.abs(style) % 4];
}
const keyColors = ['yellow', 'green', 'blue', 'red'];
export function KeyPickupClass(style: string, i: number): PickupClass | null {
  const buf = `keys/${style}/${keyColors[Math.abs(i) % KEY_COUNT]}`;
  return gPickupClasses.KeyClasses.find((c) => c.Name === buf) ?? null;
}
export function IntKeyPickupClass(style: number, i: number): PickupClass | null {
  return KeyPickupClass(IntKeyStyle(style), i);
}
export function PickupClassGetById(id: number): PickupClass {
  if (id < gPickupClasses.Classes.length) return gPickupClasses.Classes[id];
  return gPickupClasses.CustomClasses[id - gPickupClasses.Classes.length];
}
export function StrPickupClassId(s: string | null): number {
  if (s == null || s.length === 0) return 0;
  const ci = gPickupClasses.CustomClasses.findIndex((c) => c.Name === s);
  if (ci >= 0) return ci + gPickupClasses.Classes.length;
  const i = gPickupClasses.Classes.findIndex((c) => c.Name === s);
  return i >= 0 ? i : 0;
}
export function newPickupEffect(type = PICKUP_NONE): PickupEffect {
  return {
    Type: type, Score: 0, Heal: { Amount: 0, ExceedMax: false }, Ammo: { Id: 0, Amount: 0 }, Keys: 0, GunId: 0,
    Lives: 0, Sound: null, Menu: { Text: null, Items: [] },
  };
}
function LoadPickupEffect(node: Json, version: number): PickupEffect {
  const p = newPickupEffect();
  const t = LoadStr(node, 'Type');
  if (t != null) p.Type = StrPickupType(t);
  switch (p.Type) {
    case PICKUP_JEWEL:
      p.Score = PICKUP_SCORE;
      p.Score = LoadInt(node, 'Score', p.Score);
      break;
    case PICKUP_HEALTH:
      p.Heal.Amount = HEALTH_PICKUP_HEAL_AMOUNT;
      p.Heal.Amount = LoadInt(node, 'Health', p.Heal.Amount);
      p.Heal.ExceedMax = LoadBool(node, 'ExceedMax', false);
      break;
    case PICKUP_AMMO: {
      p.Ammo.Id = StrAmmoId(GetString(node, 'Ammo'));
      const ammo = AmmoGetById(p.Ammo.Id)!;
      p.Ammo.Amount = LoadInt(node, 'Amount', ammo.Amount);
      break;
    }
    case PICKUP_LIVES:
      p.Lives = LoadInt(node, 'Lives', 0);
      break;
    case PICKUP_SOUND:
      p.Sound = LoadStr(node, 'Sound');
      break;
    case PICKUP_MENU: {
      const menuNode = child(node, 'Menu');
      p.Menu.Text = LoadStr(menuNode, 'Text');
      for (const item of arr(menuNode, 'Items')) {
        p.Menu.Items.push({ Text: LoadStr(item, 'Text'), Effects: arr(item, 'Effects').map((c) => LoadPickupEffect(c, version)) });
      }
      break;
    }
    default:
      break;
  }
  return p;
}
export function PickupClassesLoadJSON(classes: PickupClass[], root: Json): void {
  const version = LoadInt(root, 'Version', -1);
  if (version > 3 || version <= 0) return;
  for (const node of arr(root, 'Pickups')) {
    const c: PickupClass = { Name: '', Effects: [], Pic: CPicNew(), Sound: null };
    if (version < 3) c.Effects.push(LoadPickupEffect(node, version));
    else for (const e of arr(node, 'Effects')) c.Effects.push(LoadPickupEffect(e, version));
    c.Sound = LoadStr(node, 'Sound');
    if (c.Sound == null) {
      if (c.Effects.length === 0) c.Sound = 'pickup';
      else {
        const effect = c.Effects[0];
        switch (effect.Type) {
          case PICKUP_HEALTH: c.Sound = 'health'; break;
          case PICKUP_AMMO: {
            const ammo = AmmoGetById(effect.Ammo.Id)!;
            if (ammo.Sound) c.Sound = ammo.Sound;
            break;
          }
          case PICKUP_GUN: break;
          case PICKUP_SHOW_MAP: c.Sound = 'show_map'; break;
          default: c.Sound = 'pickup'; break;
        }
      }
    }
    c.Name = GetString(node, 'Name');
    const picNode = child(node, 'Pic');
    if (version < 2) CPicLoadNormal(c.Pic, picNode);
    else CPicLoadJSON(c.Pic, picNode);
    classes.push(c);
  }
}
export function PickupClassesLoadAmmo(classes: PickupClass[], ammoClasses: Ammo[]): void {
  for (const a of ammoClasses) {
    const e = newPickupEffect(PICKUP_AMMO);
    e.Ammo.Id = StrAmmoId(a.Name);
    e.Ammo.Amount = a.Amount;
    classes.push({ Name: `ammo_${a.Name}`, Effects: [e], Pic: CPicCopyPic(a.Pic), Sound: a.Sound ?? null });
  }
}
export function PickupClassesLoadGuns(classes: PickupClass[], gunClasses: WeaponClass[]): void {
  for (const wc of gunClasses) {
    const pic = CPicNew();
    CPicInitNormal(pic, wc.Icon);
    const e = newPickupEffect(PICKUP_GUN);
    e.GunId = WeaponClassId(wc);
    classes.push({ Name: `gun_${wc.name}`, Effects: [e], Pic: pic, Sound: null });
  }
}
export function PickupClassesLoadKeys(classes: PickupClass[]): void {
  for (const style of gPicManager.keyStyleNames) {
    for (let i = 0; i < KEY_COUNT; i++) {
      const buf = `keys/${style}/${keyColors[i]}`;
      if (StrPickupClass(buf) != null) continue;
      const pic = CPicNew();
      CPicInitNormalFromName(pic, buf);
      const e = newPickupEffect(PICKUP_KEYCARD);
      e.Keys = StrKeycard(keyColors[i]);
      classes.push({ Name: buf, Effects: [e], Pic: pic, Sound: null });
    }
  }
}
function PickupClassHasScoreEffect(c: PickupClass): boolean {
  return c.Effects.some((p) => p.Type === PICKUP_JEWEL);
}
export function IntScorePickupClass(i: number): PickupClass | null {
  let idx = -1;
  for (const c of [...gPickupClasses.Classes, ...gPickupClasses.CustomClasses]) {
    if (PickupClassHasScoreEffect(c)) {
      idx++;
      if (idx === i) return c;
    }
  }
  return null;
}
export const PickupClassHasAmmoEffect = (p: PickupClass): boolean => p.Effects.some((e) => e.Type === PICKUP_AMMO);
export const PickupClassHasKeyEffect = (p: PickupClass): boolean => p.Effects.some((e) => e.Type === PICKUP_KEYCARD);
export function PickupClassGetKeys(p: PickupClass): number {
  for (const e of p.Effects) if (e.Type === PICKUP_KEYCARD) return e.Keys;
  return 0;
}
export function PickupClassGetName(p: PickupClass): string {
  let pickupName: string | null = null;
  let hasMultipleEffects = false;
  for (const pe of p.Effects) {
    if (pe.Type === PICKUP_AMMO) {
      hasMultipleEffects = pickupName != null;
      pickupName = AmmoGetById(pe.Ammo.Id)!.Name;
    } else if (pe.Type === PICKUP_GUN) {
      hasMultipleEffects = pickupName != null;
      pickupName = IdWeaponClass(pe.GunId).name;
    }
  }
  if (pickupName == null || hasMultipleEffects) pickupName = p.Name;
  return pickupName;
}

// ---------------------------------------------------------------------------------------------------------------
// map_object.c

export const PLACEMENT_NONE = 0;
export const PLACEMENT_OUTSIDE = 1;
export const PLACEMENT_INSIDE = 2;
export const PLACEMENT_NO_WALLS = 3;
export const PLACEMENT_ONE_WALL = 4;
export const PLACEMENT_ONE_OR_MORE_WALLS = 5;
export const PLACEMENT_FREE_IN_FRONT = 6;
export const PLACEMENT_ON_WALL = 7;
function StrPlacementFlag(s: string): number {
  return ['', 'Outside', 'Inside', 'NoWalls', 'OneWall', 'OneOrMoreWalls', 'FreeInFront', 'OnWall'].indexOf(s) > 0
    ? ['', 'Outside', 'Inside', 'NoWalls', 'OneWall', 'OneOrMoreWalls', 'FreeInFront', 'OnWall'].indexOf(s) : PLACEMENT_NONE;
}
function StrMapObjectType(s: string): number {
  if (s === 'PickupSpawner') return MAP_OBJECT_TYPE_PICKUP_SPAWNER;
  if (s === 'ActorSpawner') return MAP_OBJECT_TYPE_ACTOR_SPAWNER;
  return MAP_OBJECT_TYPE_NORMAL;
}
export const gMapObjects = {
  Classes: [] as MapObject[], CustomClasses: [] as MapObject[], Destructibles: [] as string[], Bloods: [] as string[],
};
export function StrMapObject(s: string | null | undefined): MapObject | null {
  if (s == null || s.length === 0) return null;
  return gMapObjects.CustomClasses.find((c) => c.Name === s) ?? gMapObjects.Classes.find((c) => c.Name === s) ?? null;
}
const oldMapObjects = [
  'barrel_blue', 'box', 'box2', 'cabinet', 'plant', 'bench', 'chair', 'column', 'barrel_skull', 'barrel_wood',
  'box_gray', 'box_green', 'statue_ogre', 'table_wood_candle', 'table_wood', 'tree_dead', 'bookshelf', 'box_wood',
  'table_clothed', 'table_steel', 'tree_autumn', 'tree', 'box_metal_green', 'safe', 'box_red', 'table_lab',
  'terminal', 'barrel', 'rocket', 'egg', 'bloodstain', 'wall_skull', 'bone_blood', 'bulletmarks', 'skull', 'blood0',
  'scratch', 'wall_stuff', 'wall_goo', 'goo'];
export function IntMapObject(m: number): MapObject | null {
  if (m < 0 || m > oldMapObjects.length) return null;
  return StrMapObject(oldMapObjects[m]);
}
export function IndexMapObject(i: number): MapObject {
  if (i < gMapObjects.Classes.length) return gMapObjects.Classes[i];
  return gMapObjects.CustomClasses[i - gMapObjects.Classes.length];
}
export function DestructibleMapObjectIndex(mo: MapObject | null): number {
  if (mo == null) return 0;
  return gMapObjects.Destructibles.findIndex((n) => StrMapObject(n) === mo);
}
export function GetRandomBloodPool(): MapObject {
  const idx = cmod(rand(), gMapObjects.Bloods.length);
  return StrMapObject(gMapObjects.Bloods[idx])!;
}
export function MapObjectGetFlags(mo: MapObject): number {
  let flags = 0;
  if (mo.DrawBelow) flags |= THING_DRAW_BELOW;
  if (mo.DrawAbove) flags |= THING_DRAW_ABOVE;
  if (mo.Health > 0) {
    flags |= THING_IMPASSABLE;
    flags |= THING_CAN_BE_SHOT;
  }
  return flags;
}
function newMapObject(name: string): MapObject {
  return {
    Name: name, Pic: CPicNew(), Offset: svec2i_zero(), Wreck: { MO: null, Sound: null, Bullet: '' }, Size: svec2i_zero(),
    PosOffset: svec2_zero(), Health: 0, DestroyGuns: [], Flags: 0, DrawBelow: false, DrawAbove: false,
    FootstepSound: null, FootprintMask: { r: 0, g: 0, b: 0, a: 0 }, Type: MAP_OBJECT_TYPE_NORMAL, PickupClass: null,
    Character: { CharId: 0, Counter: 0 }, DestroySpawn: [],
    DamageSmoke: { ParticleClass: null, HealthThreshold: 0, Z: 0, Ticks: 0 },
  };
}
function TryLoadMapObject(node: Json, version: number): MapObject | null {
  const m = newMapObject(GetString(node, 'Name'));
  const normalNode = child(node, 'Pic');
  if (normalNode != null) {
    if (version < 2) CPicLoadNormal(m.Pic, normalNode);
    else CPicLoadJSON(m.Pic, normalNode);
    if (!CPicIsLoaded(m.Pic)) return null;
  }
  if (CPicIsLoaded(m.Pic)) {
    const size = CPicGetSize(m.Pic);
    m.Offset = svec2i(idiv(-size.x, 2), TILE_HEIGHT / 2 - size.y);
    m.Offset = LoadVec2i(node, 'Offset', m.Offset);
  }
  m.Wreck.Sound = StrSound('bang');
  let wreckBullet: string | null = null;
  if (version < 4) {
    if (version < 3) {
      const wreckNode = child(node, 'WreckPic');
      if (wreckNode != null) {
        if (version < 2) m.Wreck.MO = LoadStr(node, 'WreckPic');
        else m.Wreck.MO = LoadStr(wreckNode, 'Pic');
      }
    } else {
      m.Wreck.MO = LoadStr(node, 'Wreck');
    }
  } else {
    const wreckNode = child(node, 'Wreck');
    if (wreckNode != null) {
      m.Wreck.MO = LoadStr(wreckNode, 'MapObject');
      const s = LoadStr(wreckNode, 'Sound');
      if (s != null) m.Wreck.Sound = StrSound(s);
      wreckBullet = LoadStr(wreckNode, 'Bullet');
    }
  }
  m.Wreck.Bullet = wreckBullet ?? 'fireball_wreck';
  m.Size = TILE_SIZE();
  m.Size = LoadVec2i(node, 'Size', m.Size);
  m.PosOffset = LoadVec2(node, 'PosOffset', m.PosOffset);
  m.Health = LoadInt(node, 'Health', 0);
  m.DestroyGuns = LoadBulletGuns(node, 'DestroyGuns') ?? [];
  if (has(node, 'Flags')) for (const f of arr(node, 'Flags')) m.Flags |= 1 << StrPlacementFlag(String(f));
  m.DrawBelow = LoadBool(node, 'DrawBelow', false);
  m.DrawAbove = LoadBool(node, 'DrawAbove', false);
  m.FootstepSound = LoadStr(node, 'FootstepSound');
  m.FootprintMask = LoadColor(node, 'FootprintMask', m.FootprintMask);
  const t = LoadStr(node, 'Type');
  if (t != null) m.Type = StrMapObjectType(t);
  switch (m.Type) {
    case MAP_OBJECT_TYPE_PICKUP_SPAWNER:
      m.PickupClass = StrPickupClass(GetString(node, 'Pickup'));
      break;
    case MAP_OBJECT_TYPE_ACTOR_SPAWNER:
      m.Character.CharId = LoadInt(node, 'CharId', 0);
      m.Character.Counter = LoadInt(node, 'Counter', 0);
      break;
    default:
      break;
  }
  if (has(node, 'DestroySpawn')) {
    for (const ds of arr(node, 'DestroySpawn')) {
      const tt = LoadStr(ds, 'Type');
      m.DestroySpawn.push({ Type: tt != null ? StrPickupType(tt) : 0, SpawnChance: LoadDouble(ds, 'SpawnChance', 0) });
    }
  }
  m.DamageSmoke.HealthThreshold = -1;
  if (has(node, 'DamageSmoke')) {
    const ds = child(node, 'DamageSmoke');
    m.DamageSmoke.ParticleClass = LoadStr(ds, 'Particle') ?? 'smoke_big';
    m.DamageSmoke.HealthThreshold = LoadFloat(ds, 'HealthThreshold', m.DamageSmoke.HealthThreshold);
    m.DamageSmoke.Z = LoadFloat(ds, 'Z', 0);
    m.DamageSmoke.Ticks = 20;
    m.DamageSmoke.Ticks = LoadInt(ds, 'Ticks', m.DamageSmoke.Ticks);
  }
  return m;
}
export function MapObjectsLoadJSON(classes: MapObject[], root: Json): void {
  const version = LoadInt(root, 'Version', 0);
  if (version > 4 || version <= 0) return;
  for (const c of arr(root, 'MapObjects')) {
    const m = TryLoadMapObject(c, version);
    if (m) classes.push(m);
  }
  ReloadDestructibles();
  gMapObjects.Bloods = [];
  for (let i = 0; ; i++) {
    const buf = `blood${i}`;
    if (StrMapObject(buf) == null) break;
    gMapObjects.Bloods.push(buf);
  }
}
function ReloadDestructibles(): void {
  gMapObjects.Destructibles = [];
  for (const mo of [...gMapObjects.Classes, ...gMapObjects.CustomClasses]) if (mo.Health > 0) gMapObjects.Destructibles.push(mo.Name);
}
function SetupSpawner(spawnerName: string, pickupClassName: string): MapObject {
  const m = newMapObject(spawnerName);
  m.Pic.Type = PICTYPE_ANIMATED;
  m.Pic.Sprites = PicManagerGetSprites(gPicManager, 'spawn_pad')?.pics ?? null;
  m.Pic.TicksPerFrame = 8;
  m.Pic.Mask = { ...colorWhite };
  const size = CPicGetSize(m.Pic);
  m.Offset = svec2i(idiv(-size.x, 2), TILE_HEIGHT / 2 - size.y);
  m.Size = TILE_SIZE();
  m.Health = 0;
  m.DrawBelow = true;
  m.Type = MAP_OBJECT_TYPE_PICKUP_SPAWNER;
  m.PickupClass = StrPickupClass(pickupClassName);
  m.Wreck.Bullet = '';
  return m;
}
export function MapObjectsLoadAmmoAndGunSpawners(isCustom: boolean): void {
  const classes = isCustom ? gMapObjects.CustomClasses : gMapObjects.Classes;
  for (const a of isCustom ? gAmmo.CustomAmmo : gAmmo.Ammo) classes.push(SetupSpawner(`${a.Name} ammo spawner`, `ammo_${a.Name}`));
  for (const wc of isCustom ? gWeaponClasses.CustomGuns : gWeaponClasses.Guns) {
    if (!wc.IsRealGun) continue;
    classes.push(SetupSpawner(`${wc.name} spawner`, `gun_${wc.name}`));
  }
}
export function MapObjectsCount(): number {
  return gMapObjects.Classes.length + gMapObjects.CustomClasses.length;
}
export function MapObjectIsOnWall(mo: MapObject): boolean {
  return (mo.Flags & (1 << PLACEMENT_ON_WALL)) !== 0;
}

// ---------------------------------------------------------------------------------------------------------------
// character_class.c

export const CHARACTER_DEFAULT_MASS = 100;
const FOOTSTEP_DISTANCE_PLUS = 250;
export const gCharacterClasses = { Classes: [] as CharacterClass[], CustomClasses: [] as CharacterClass[] };

export function StrCharacterClass(s: string | null): CharacterClass | null {
  if (s == null) return null;
  return gCharacterClasses.CustomClasses.find((c) => c.Name === s) ?? gCharacterClasses.Classes.find((c) => c.Name === s) ?? null;
}
export function CharacterClassesLoadJSON(classes: CharacterClass[], root: Json): void {
  const version = LoadInt(root, 'Version', 0);
  if (version > 2 || version <= 0) return;
  for (const node of arr(root, 'Characters')) {
    const body = LoadStr(node, 'Body') ?? 'base';
    const c: CharacterClass = {
      Name: GetString(node, 'Name'), Vehicle: LoadBool(node, 'Vehicle', false),
      HeadSprites: GetString(child(node, 'HeadPics'), 'Sprites'), Body: body,
      DeathSprites: LoadStr(node, 'DeathSprites') ?? 'death', Mass: CHARACTER_DEFAULT_MASS, Sprites: null,
      Sounds: null, Footsteps: null, FootstepsDistancePlus: FOOTSTEP_DISTANCE_PLUS, BloodColor: { ...colorRed },
      Corpse: null, HasHeadParts: [true, true, true, true],
    };
    c.Mass = LoadInt(node, 'Mass', c.Mass);
    c.Sprites = StrCharSpriteClass(c.Body);
    c.Sounds = LoadStr(node, 'Sounds');
    c.Footsteps = LoadStr(node, 'Footsteps');
    c.FootstepsDistancePlus = LoadInt(node, 'FootstepsDistancePlus', c.FootstepsDistancePlus);
    c.BloodColor = LoadColor(node, 'BloodColor', c.BloodColor);
    c.HasHeadParts[HEAD_PART_HAIR] = LoadBool(node, 'HasHair', true);
    c.HasHeadParts[HEAD_PART_FACEHAIR] = LoadBool(node, 'HasFacehair', true);
    c.HasHeadParts[HEAD_PART_HAT] = LoadBool(node, 'HasHat', true);
    c.HasHeadParts[HEAD_PART_GLASSES] = LoadBool(node, 'HasGlasses', true);
    c.Corpse = LoadStr(node, 'Corpse');
    classes.push(c);
  }
}
export function CharacterClassGetDeathSprites(c: CharacterClass): NamedSprites | null {
  return PicManagerGetSprites(gPicManager, `chars/${c.DeathSprites}`);
}
export function IndexCharacterClass(i: number): CharacterClass {
  if (i < gCharacterClasses.Classes.length) return gCharacterClasses.Classes[i];
  return gCharacterClasses.CustomClasses[i - gCharacterClasses.Classes.length];
}
export function CharacterClassIndex(c: CharacterClass | null): number {
  if (c == null) return 0;
  let i = gCharacterClasses.Classes.indexOf(c);
  if (i >= 0) return i;
  i = gCharacterClasses.CustomClasses.indexOf(c);
  return i >= 0 ? i + gCharacterClasses.Classes.length : -1;
}
export function CharacterClassGetSound(c: CharacterClass, sound: string): string {
  return `chars/${sound}/${c.Sounds}`;
}
const characterNames = ['Jones', 'Ice', 'Ogre', 'Dragon', 'WarBaby', 'Bug-eye', 'Smith', 'Ogre Boss', 'Grunt',
  'Professor', 'Snake', 'Wolf', 'Bob', 'Mad bug-eye', 'Cyborg', 'Robot', 'Lady'];
export function IntCharacterFace(face: number): string {
  return characterNames[face];
}
/** CharacterOldFaceToHeadParts */
export function CharacterOldFaceToHeadParts(face: string, hp: (string | null)[]): string {
  const set = (i: number, v: string): void => { hp[i] = v; };
  switch (face) {
    case 'Bob': set(HEAD_PART_HAIR, 'flattop'); set(HEAD_PART_FACEHAIR, 'beard'); return 'Jones';
    case 'Cyber Jones': set(HEAD_PART_GLASSES, 'cyber_shades'); return 'Cyborg';
    case 'Cyber Smith': set(HEAD_PART_HAIR, 'flattop'); return 'Cyborg';
    case 'Cyber WarBaby': set(HEAD_PART_HAT, 'beret'); return 'Cyborg';
    case 'Cyborg': set(HEAD_PART_GLASSES, 'cyborg'); return 'Cyborg';
    case 'Dragon': set(HEAD_PART_HAIR, 'rattail'); set(HEAD_PART_FACEHAIR, 'handlebar'); return 'Jones';
    case 'Evil Ogre': set(HEAD_PART_HAT, 'horns'); return 'Ogre';
    case 'Freeze': set(HEAD_PART_GLASSES, 'ski_goggles'); return 'Jones';
    case 'Goggles': set(HEAD_PART_GLASSES, 'goggles'); return 'Jones';
    case 'Grunt': set(HEAD_PART_HAT, 'riot_helmet'); return 'Jones';
    case 'Ice': set(HEAD_PART_GLASSES, 'shades'); return 'Jones';
    case 'Lady': set(HEAD_PART_HAIR, 'ponytail'); return 'Lady';
    case 'Ogre Boss': set(HEAD_PART_HAIR, 'mohawk'); return 'Ogre';
    case 'Professor': set(HEAD_PART_HAIR, 'donut'); set(HEAD_PART_GLASSES, 'goggles'); return 'Jones';
    case 'Smith': set(HEAD_PART_HAIR, 'flattop'); return 'Jones';
    case 'Snake': set(HEAD_PART_GLASSES, 'eye_patch'); return 'Jones';
    case 'Sweeper': set(HEAD_PART_HAT, 'helmet'); return 'Jones';
    case 'WarBaby': set(HEAD_PART_HAT, 'beret'); return 'Jones';
    case 'Wolf': set(HEAD_PART_HAIR, 'widows'); set(HEAD_PART_FACEHAIR, 'dutch'); return 'Jones';
    default: return face;
  }
}
export function CharacterOldHairToHeadParts(hp: (string | null)[]): void {
  const hair = hp[HEAD_PART_HAIR];
  if (hair == null) return;
  const move = (part: number, v: string): void => { hp[HEAD_PART_HAIR] = null; hp[part] = v; };
  switch (hair) {
    case 'beard': hp[HEAD_PART_HAIR] = 'flattop'; hp[HEAD_PART_FACEHAIR] = 'beard'; break;
    case 'beret': move(HEAD_PART_HAT, 'beret'); break;
    case 'combat_helmet': move(HEAD_PART_HAT, 'combat_helmet'); break;
    case 'cyber_shades': move(HEAD_PART_GLASSES, 'cyber_shades'); break;
    case 'cyborg': move(HEAD_PART_GLASSES, 'cyborg'); break;
    case 'dutch': hp[HEAD_PART_HAIR] = 'widows'; hp[HEAD_PART_FACEHAIR] = 'dutch'; break;
    case 'eye_patch': move(HEAD_PART_GLASSES, 'eye_patch'); break;
    case 'goggles': move(HEAD_PART_GLASSES, 'goggles'); break;
    case 'hazmat': move(HEAD_PART_HAT, 'hazmat'); break;
    case 'helmet': move(HEAD_PART_HAT, 'helmet'); break;
    case 'hogan': hp[HEAD_PART_HAIR] = 'rattail'; hp[HEAD_PART_FACEHAIR] = 'handlebar'; break;
    case 'horns': move(HEAD_PART_HAT, 'horns'); break;
    case 'mad_doc': hp[HEAD_PART_HAIR] = 'donut'; hp[HEAD_PART_FACEHAIR] = 'beard'; break;
    case 'peak_cap': move(HEAD_PART_HAT, 'peak_cap'); break;
    case 'professor': hp[HEAD_PART_HAIR] = 'donut'; hp[HEAD_PART_GLASSES] = 'goggles'; break;
    case 'riot_helmet': move(HEAD_PART_HAT, 'riot_helmet'); break;
    case 'ski_goggles': move(HEAD_PART_GLASSES, 'ski_goggles'); break;
    case 'shades': move(HEAD_PART_GLASSES, 'shades'); break;
    default: break;
  }
}

// ---------------------------------------------------------------------------------------------------------------
// character.c

export function newCharacter(): Character {
  const c = colorBlack;
  return {
    Class: null, PlayerTemplateName: null, HeadParts: [null, null, null, null], speed: 0, Gun: null, Melee: null,
    maxHealth: 0, excessHealth: 0, flags: 0,
    Colors: { Skin: c, Arms: c, Body: c, Legs: c, Hair: c, Feet: c, Facehair: c, Hat: c, Glasses: c },
    Drop: null, bot: { probabilityToMove: 0, probabilityToTrack: 0, probabilityToShoot: 0, actionDelay: 0 },
  };
}
export function newCharacterStore(): CharacterStore {
  return { OtherChars: [], prisonerIds: [], baddieIds: [], specialIds: [] };
}
export function CharacterCopy(src: Character): Character {
  return {
    ...src, HeadParts: [...src.HeadParts], Colors: { ...src.Colors }, bot: src.bot ? { ...src.bot } : null,
  };
}
export function CharacterStoreCopy(src: CharacterStore): CharacterStore {
  return {
    OtherChars: src.OtherChars.map(CharacterCopy), prisonerIds: [...src.prisonerIds], baddieIds: [...src.baddieIds],
    specialIds: [...src.specialIds],
  };
}
/** ConvertCharacterColors / ConvertHairColors of mission_convert.c (character files before version 7/13) */
export const legacyHooks = {
  convertCharacterColors: (_skin: number, _arm: number, _body: number, _leg: number, _hair: number, _ch: Character): void => {},
  convertHairColors: (_ch: Character, _face: string): void => {},
};
export function CharacterLoadJSON(store: CharacterStore, root: Json, versionIn: number): void {
  const version = LoadInt(root, 'Version', versionIn);
  store.OtherChars = [];
  store.prisonerIds = [];
  store.baddieIds = [];
  store.specialIds = [];
  for (const node of arr(root, 'Characters')) {
    const ch = newCharacter();
    store.OtherChars.push(ch);
    if (version < 13) {
      const tmp = version < 7 ? IntCharacterFace(LoadInt(node, 'face', 0)) : GetString(node, 'Class');
      const face = CharacterOldFaceToHeadParts(tmp, ch.HeadParts);
      ch.Class = StrCharacterClass(face);
    } else {
      ch.Class = StrCharacterClass(GetString(node, 'Class'));
      ch.HeadParts[HEAD_PART_HAIR] = LoadStr(node, 'HairType');
      if (version < 14) {
        CharacterOldHairToHeadParts(ch.HeadParts);
      } else {
        ch.HeadParts[HEAD_PART_FACEHAIR] = LoadStr(node, 'FacehairType');
        ch.HeadParts[HEAD_PART_HAT] = LoadStr(node, 'HatType');
        ch.HeadParts[HEAD_PART_GLASSES] = LoadStr(node, 'GlassesType');
      }
    }
    if (version < 7) {
      legacyHooks.convertCharacterColors(LoadInt(node, 'skin', 0), LoadInt(node, 'arm', 0), LoadInt(node, 'body', 0),
        LoadInt(node, 'leg', 0), LoadInt(node, 'hair', 0), ch);
    } else {
      ch.Colors.Skin = LoadColor(node, 'Skin', ch.Colors.Skin);
      ch.Colors.Arms = LoadColor(node, 'Arms', ch.Colors.Arms);
      ch.Colors.Body = LoadColor(node, 'Body', ch.Colors.Body);
      ch.Colors.Legs = LoadColor(node, 'Legs', ch.Colors.Legs);
      ch.Colors.Hair = LoadColor(node, 'Hair', ch.Colors.Hair);
    }
    ch.Colors.Feet = ch.Colors.Legs;
    if (version < 13) legacyHooks.convertHairColors(ch, ch.Class?.Name ?? '');
    else ch.Colors.Feet = LoadColor(node, 'Feet', ch.Colors.Feet);
    if (version < 14) {
      ch.Colors.Facehair = ch.Colors.Hair;
      ch.Colors.Hat = ch.Colors.Hair;
      ch.Colors.Glasses = ch.Colors.Hair;
    } else {
      ch.Colors.Facehair = LoadColor(node, 'Facehair', ch.Colors.Facehair);
      ch.Colors.Hat = LoadColor(node, 'Hat', ch.Colors.Hat);
      ch.Colors.Glasses = LoadColor(node, 'Glasses', ch.Colors.Glasses);
    }
    ch.PlayerTemplateName = LoadStr(node, 'PlayerTemplateName');
    ch.speed = LoadFullInt(node, 'speed', ch.speed);
    ch.Gun = StrWeaponClass(GetString(node, 'Gun'));
    const melee = LoadStr(node, 'Melee');
    if (melee != null) ch.Melee = StrWeaponClass(melee);
    ch.maxHealth = LoadInt(node, 'maxHealth', ch.maxHealth);
    ch.excessHealth = ch.maxHealth * 2;
    ch.excessHealth = LoadInt(node, 'excessHealth', ch.excessHealth);
    ch.flags = LoadInt(node, 'flags', 0) >>> 0;
    const drop = LoadStr(node, 'Drop');
    if (drop != null) ch.Drop = StrPickupClass(drop);
    ch.bot!.probabilityToMove = LoadInt(node, 'probabilityToMove', 0);
    ch.bot!.probabilityToTrack = LoadInt(node, 'probabilityToTrack', 0);
    ch.bot!.probabilityToShoot = LoadInt(node, 'probabilityToShoot', 0);
    ch.bot!.actionDelay = LoadInt(node, 'actionDelay', 0);
  }
}
export function CharacterStoreGetRandomBaddieId(store: CharacterStore): number {
  const idx = RAND_INT(0, store.baddieIds.length);
  return store.baddieIds[idx];
}
export function CharacterStoreGetRandomSpecialId(store: CharacterStore): number {
  const idx = RAND_INT(0, store.specialIds.length);
  return store.specialIds[idx];
}
export function CharacterIsPrisoner(store: CharacterStore, c: Character): boolean {
  return store.prisonerIds.some((id) => store.OtherChars[id] === c);
}
const HAT_BLACKLIST = ['bunny', 'capotain', 'horns', 'leprechaun', 'party', 'santa', 'sombrero', 'witch'];
function RandomColor(): Color {
  const r = rand() & 255;
  const g = rand() & 255;
  const b = rand() & 255;
  return { r, g, b, a: 255 };
}
function RandomDogHairColor(): Color {
  const hsv: HSV = { h: 0, s: 0, v: 0 };
  hsv.h = RAND_DOUBLE(0, 40);
  if (hsv.h < 0) hsv.h += 360;
  hsv.s = RAND_DOUBLE(0.3, 1);
  hsv.v = RAND_DOUBLE(0, 1);
  return ColorTint(colorWhite, hsv);
}
function RandomSkinColor(c: CharacterClass): Color {
  if (c.Sounds === 'man' || c.Sounds === 'woman') {
    const h = RAND_DOUBLE(18, 38);
    const s = RAND_DOUBLE(0.3, 0.7);
    const v = RAND_DOUBLE(0.3, 1);
    return ColorTint(colorWhite, { h, s, v });
  } else if (c.Name === 'Cyborg') {
    const h = RAND_DOUBLE(18, 38);
    const s = RAND_DOUBLE(0, 0.4);
    const v = RAND_DOUBLE(0.7, 1);
    return ColorTint(colorWhite, { h, s, v });
  } else if (c.Name === 'Bones' || c.Name === 'Big Bones') {
    const h = RAND_DOUBLE(20, 60);
    const s = RAND_DOUBLE(0, 0.5);
    const v = RAND_DOUBLE(0.8, 1);
    return ColorTint(colorWhite, { h, s, v });
  } else if (c.Sounds === 'dog') {
    return RandomDogHairColor();
  }
  return RandomColor();
}
function RandomHairColor(c: CharacterClass): Color {
  if (c.Sounds === 'man' || c.Sounds === 'woman') {
    const hsv: HSV = { h: 0, s: 0, v: 0 };
    if (RAND_INT(0, 3) < 2) {
      hsv.h = RAND_DOUBLE(-20, 30);
      if (hsv.h < 0) hsv.h += 360;
      hsv.s = RAND_DOUBLE(0, 0.8);
      hsv.v = RAND_DOUBLE(0, 1);
    } else {
      hsv.h = RAND_DOUBLE(40, 310);
      hsv.s = RAND_DOUBLE(0.8, 1.0);
      hsv.v = RAND_DOUBLE(0.5, 1);
    }
    return ColorTint(colorWhite, hsv);
  } else if (c.Sounds === 'dog') {
    return RandomDogHairColor();
  }
  return RandomColor();
}
export function CharacterShuffleAppearance(c: Character): void {
  if (RAND_BOOL()) c.Class = StrCharacterClass('Jones');
  else if (RAND_BOOL()) c.Class = StrCharacterClass('Lady');
  else {
    const n = gCharacterClasses.Classes.length + gCharacterClasses.CustomClasses.length;
    c.Class = IndexCharacterClass(cmod(rand(), n));
  }
  for (let hp = 0; hp < HEAD_PART_COUNT; hp++) {
    let name: string | null = null;
    if (RAND_INT(0, 3) === 0) {
      const names = gPicManager.headPartNames[hp];
      name = names[cmod(rand(), names.length)];
      if (hp === HEAD_PART_HAT && HAT_BLACKLIST.includes(name)) name = null;
    }
    c.HeadParts[hp] = name;
  }
  const cls = c.Class!;
  c.Colors.Skin = RandomSkinColor(cls);
  c.Colors.Body = RandomColor();
  if (RAND_INT(0, 2) === 0) c.Colors.Arms = c.Colors.Body;
  else if (RAND_INT(0, 3) === 0) c.Colors.Arms = c.Colors.Skin;
  else c.Colors.Arms = RandomColor();
  if (RAND_INT(0, 2) === 0) c.Colors.Legs = c.Colors.Body;
  else if (RAND_INT(0, 3) === 0) c.Colors.Legs = c.Colors.Skin;
  else c.Colors.Legs = RandomColor();
  c.Colors.Hair = RandomHairColor(cls);
  if (RAND_INT(0, 2) === 0) c.Colors.Feet = c.Colors.Legs;
  c.Colors.Feet = RandomColor();
  c.Colors.Facehair = c.Colors.Hair;
  c.Colors.Hat = RandomColor();
  c.Colors.Glasses = RandomColor();
}

// ---------------------------------------------------------------------------------------------------------------
// weapon_usage.c

export function WeaponUsagesUpdate(wu: Map<string, WeaponUsage>, wc: WeaponClass | null, dShot: number, dHit: number): void {
  if (!wc || !wc.IsRealGun) return;
  let w = wu.get(wc.name);
  if (!w) {
    w = { Shots: 0, Hits: 0 };
    wu.set(wc.name, w);
  }
  w.Shots += dShot;
  w.Hits += dHit;
}
export function WeaponUsagesGetAccuracy(wu: Map<string, WeaponUsage>): number {
  let cumSum = 0;
  let totalWeight = 0;
  for (const [name, w] of wu) {
    if (w.Shots <= 0) continue;
    const wc = StrWeaponClass(name)!;
    if (WeaponClassIsHighDPS(wc)) continue;
    const accuracy = f32(w.Hits / w.Shots);
    const weight = MAX(wc.Lock, 1);
    cumSum = f32(cumSum + f32(accuracy * weight));
    totalWeight += weight;
  }
  return totalWeight > 0 ? f32(cumSum / totalWeight) : 0;
}
export function WeaponUsagesGetFavorite(wu: Map<string, WeaponUsage>): WeaponClass | null {
  let best: WeaponClass | null = null;
  let bestTicks = 0;
  for (const [name, w] of wu) {
    const wc = StrWeaponClass(name)!;
    const ticks = w.Shots * MAX(wc.Lock, 1);
    if (ticks > bestTicks) {
      best = wc;
      bestTicks = ticks;
    }
  }
  return best;
}

