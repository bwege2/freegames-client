// C-Dogs SDL 2.5.0, translated: drawing the game (draw/draw_buffer.c, draw/draw.c, draw/draw_actor.c, door.c
// DoorDraw, objs.c/bullet_class.c/pickup.c/particle.c draw functions, draw/nine_slice.c, automap.c, camera.c
// CameraDraw, hud/*.c). GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
import {
  CLAMP, MAX, MIN, MPI_2, TILE_HEIGHT, TILE_WIDTH, Vec2ToTile, Z_FACTOR, ColorEquals, ColorTint, DirectionMirrorX,
  DirectionOpposite, DirectionRotate, RadiansToDirection, colorBlack, colorBlue, colorCyan, colorDarkGray, colorDarker, colorFog,
  colorGreen, colorMaroon, colorOrange, colorPoison, colorPurple, colorRed, colorSelectedBG, colorTransparent, colorWhite,
  dir2radians, f32, svec2_add, svec2_angle, svec2_is_zero, svec2i, svec2i_floor, type Color, type Vec2, type Vec2i,
  DIRECTION_DOWN, Vec2iToTile, svec2i_assign_vec2, MAX_BARRELS,
} from '../core/base.ts';
import {
  gMap, LOSCalcFrom, LOSReset, LOSTileIsVisible, MapGetDoorKeycardFlag, MapGetExitPos, MapGetTile, MapIsTileIn,
  ThingIdGetThing, TileIsShootable, DOORSTATE_COUNT, type GameMap,
} from '../core/map.ts';
import {
  CPICFUNC_BULLET, CPICFUNC_MAPOBJECT, CPICFUNC_PICKUP, DRAWFUNC_PARTICLE, GUNSTATE_FIRING, GUNSTATE_READY, GUNSTATE_RECOIL,
  KIND_CHARACTER, KIND_PICKUP, PARTICLE_CHAR_SPRITE, PARTICLE_PIC, PARTICLE_TEXT, THING_DRAW_ABOVE,
  THING_DRAW_BELOW, THING_OBJECTIVE, TILE_CLASS_DOOR, TILE_CLASS_FLOOR, TILE_CLASS_WALL, type Character, type DoorState,
  type TActor, type Thing, type Tile, type WeaponClass,
} from '../core/types.ts';
import {
  BODY_PART_COUNT, CPicGetPic, CPicGetSize, CharSpritesGetOffset, HEAD_PART_COUNT, HEAD_PART_HAT, PICTYPE_DIRECTIONAL,
  PicManagerGetCharSprites, PicManagerGetPic, PicManagerGetSprites, gPicManager, type CharColors, type CharSprites, type Pic,
} from '../core/pics.ts';
import { ConfigGetBool, ConfigGetEnum, ConfigGetInt, LASER_SIGHT_ALL, LASER_SIGHT_PLAYERS, SPLITSCREEN_NEVER } from '../core/config.ts';
import {
  gActors, gCampaign, gMission, gMobObjs, gObjs, gParticles, gPickups, gPlayerDatas, AreKeysAllowed as _ak,
  GAME_MODE_DEATHMATCH, HasObjectives, IsAutoMapEnabled, IsPVP, IsScoreNeeded, MISSION_STATE_PICKUP, MISSION_STATE_PLAY,
  MISSION_STATE_WAITING,
} from '../core/state.ts';
import {
  ACTOR_GET_GRENADE, ACTOR_GET_GUN, ACTOR_GET_WEAPON, ActorGetByUID, ActorGetCharacter, ActorGetMaxHeal, ActorGetMuzzleOffset,
  ActorIsGrimacing, ActorIsLocalPlayer, ActorIsLowHealth, ActorWeaponGetAmmo, FLAGS_SEETHROUGH,
} from '../core/actors.ts';
import {
  AmmoGetById, AmmoIsLow, CharacterClassGetDeathSprites, FPS_FRAMELIMIT, KeyPickupClass, PickupClassGetKeys,
  PickupClassHasKeyEffect, WC_BARREL, WeaponClassGetBarrel, WeaponClassGetRange, WeaponClassNumBarrels,
} from '../core/classes.ts';
import {
  KeyColor, OBJECTIVE_COLLECT, OBJECTIVE_DESTROY, OBJECTIVE_HIDDEN, OBJECTIVE_KILL, OBJECTIVE_POSKNOWN, OBJECTIVE_RESCUE,
  OBJECTIVE_UNKNOWNCOUNT, ObjectiveFromThing, ObjectiveIsComplete, ObjectiveIsRequired, ObjectiveTypeStr,
} from '../core/mission.ts';
import {
  ACTORANIMATION_IDLE, ACTORANIMATION_WALKING, ANIMATION_MAX_FRAMES, AnimationGetFrame, IDLEHEAD_LEFT, IDLEHEAD_RIGHT,
} from '../core/particles.ts';
import { PickupIsManual } from '../core/pickups.ts';
import {
  AreAllPlayersDeadAndNoLives, GetFirstPlayer, GetNumPlayers, IsPlayerAlive, IsPlayerAliveOrDying, IsPlayerHuman,
  PLAYER_ALIVE_OR_DYING, PLAYER_ANY, PlayerDataGetByUID, PlayersGetMidpoint,
} from '../core/player.ts';
import { MissionNeedsMoreRescuesInExit } from '../core/missionrun.ts';
import { PICKUP_LIMIT } from '../core/game.ts';
import { SPECTATE_FOLLOW, SPECTATE_FREE, SPECTATE_NONE, hudHooks, type Camera } from '../core/camera.ts';
import {
  ALIGN_CENTER, ALIGN_END, ALIGN_START, CPicDraw, CPicDrawContextNew, DrawLaserSightSingle, DrawLine, DrawPoint, DrawRectangle,
  DrawCross, Draw_Line, FLIP_HORIZONTAL, FLIP_NONE, FLIP_VERTICAL, FontCh, FontH, FontOptsNew, FontStr, FontStrCenter,
  FontStrMask, FontStrOpt, FontStrSize, FontStrW, PicRender, TextureRender, gGfx, type FontOpts,
} from './gfx.ts';
import { buttonHooks } from './buttons.ts';
void _ak;

export const WALL_OFFSET_Y = -12;
export const AUTOMAP_PADDING = 13;
export const AUTOMAP_SIZE = 45;
const AUTOMAP_FLAGS_SHOWALL = 1;
export const AUTOMAP_FLAGS_MASK = 2;

export const X_TILES = (): number => Math.trunc((gGfx.w + TILE_WIDTH - 1) / TILE_WIDTH) + 1;
export const X_TILES_HALF = (): number => Math.trunc((X_TILES() + 1) / 2);
export const Y_TILES = (): number => Math.trunc((gGfx.h + TILE_HEIGHT - 1) / TILE_HEIGHT) + 2;

export function Pulse256(t: number): number {
  const pulsePeriod = Math.trunc(ConfigGetInt('Game.FPS') / 2);
  let a = Math.trunc(((t % pulsePeriod) * 255) / Math.trunc(pulsePeriod / 2));
  if (a > 255) a = 255 * 2 - a;
  return a;
}

// --- nine_slice.c ------------------------------------------------------------------------------------------------

export function Draw9Slice(pic: Pic, target: { Pos: Vec2i; Size: Vec2i }, top: number, right: number, bottom: number, left: number,
  repeat: boolean, mask: Color, flip: number): void {
  const srcX = [0, left, pic.size.x - right];
  const srcY = [0, top, pic.size.y - bottom];
  const srcW = [left, pic.size.x - right - left, right];
  const srcH = [top, pic.size.y - bottom - top, bottom];
  const T = target;
  const dstX = [T.Pos.x, T.Pos.x + left, T.Pos.x + T.Size.x - right, T.Pos.x + T.Size.x];
  const dstY = [T.Pos.y, T.Pos.y + top, T.Pos.y + T.Size.y - bottom, T.Pos.y + T.Size.y];
  const dstW = [left, T.Size.x - right - left, right];
  const dstH = [top, T.Size.y - bottom - top, bottom];
  for (let i = 0; i < 3; i++) {
    let sw = srcW[i];
    let dw = repeat ? srcW[i] : dstW[i];
    if (dw <= 0) continue;
    for (let dx = dstX[i]; dx < dstX[i + 1]; dx += dw) {
      if (dx + dw > dstX[i + 1]) sw = dw = dstX[i + 1] - dx;
      for (let j = 0; j < 3; j++) {
        let sh = srcH[j];
        let dh = repeat ? srcH[j] : dstH[j];
        if (dh <= 0) continue;
        for (let dy = dstY[j]; dy < dstY[j + 1]; dy += dh) {
          if (dy + dh > dstY[j + 1]) sh = dh = dstY[j + 1] - dy;
          TextureRender(pic, { Pos: { x: srcX[i], y: srcY[j] }, Size: { x: sw, y: sh } },
            { Pos: { x: dx, y: dy }, Size: { x: dw, y: dh } }, mask, 0, flip);
        }
      }
    }
  }
}

// --- draw_buffer.c -------------------------------------------------------------------------------------------------

export interface DrawBuffer {
  OrigSize: Vec2i;
  Size: Vec2i;
  tiles: (Tile | null)[];
  xTop: number;
  yTop: number;
  xStart: number;
  yStart: number;
  dx: number;
  dy: number;
  displaylist: Thing[];
}
export function DrawBufferNew(): DrawBuffer {
  return { OrigSize: { x: 0, y: 0 }, Size: { x: 0, y: 0 }, tiles: [], xTop: 0, yTop: 0, xStart: 0, yStart: 0, dx: 0, dy: 0, displaylist: [] };
}
export function DrawBufferSetFromMap(b: DrawBuffer, map: GameMap, origin: Vec2, width: number): void {
  const view = { x: X_TILES(), y: Y_TILES() };
  if (view.x !== b.OrigSize.x || view.y !== b.OrigSize.y) {
    b.OrigSize = view;
    b.tiles = new Array(view.x * view.y).fill(null);
  }
  b.Size = { x: width, y: b.OrigSize.y };
  b.xTop = Math.trunc(origin.x) - Math.trunc((TILE_WIDTH * width) / 2);
  b.yTop = Math.trunc(origin.y) - Math.trunc((TILE_HEIGHT * b.OrigSize.y) / 2);
  b.xStart = Math.trunc(b.xTop / TILE_WIDTH);
  b.yStart = Math.trunc(b.yTop / TILE_HEIGHT);
  if (b.xTop < 0) b.xStart--;
  if (b.yTop < 0) b.yStart--;
  b.dx = b.xStart * TILE_WIDTH - b.xTop;
  b.dy = b.yStart * TILE_HEIGHT - b.yTop;
  let i = 0;
  for (let y = b.yStart; y < b.yStart + b.Size.y; y++) {
    for (let x = b.xStart; x < b.xStart + b.Size.x; x++, i++) {
      b.tiles[i] = MapIsTileIn(map, { x, y }) ? MapGetTile(map, { x, y }) : null;
    }
    i += b.OrigSize.x - b.Size.x;
  }
}
export function DrawBufferFix(b: DrawBuffer): void {
  let idx = 0;
  for (let y = 0; y < Y_TILES(); y++) {
    for (let x = 0; x < b.Size.x; x++, idx++) {
      const t = b.tiles[idx];
      if (t == null) continue;
      t.outOfSight = !LOSTileIsVisible(gMap, { x: x + b.xStart, y: y + b.yStart });
    }
    idx += X_TILES() - b.Size.x;
  }
}

// --- draw.c --------------------------------------------------------------------------------------------------------

function GetLOSMask(tile: Tile, useFog: boolean): Color {
  if (!tile.isVisited) return colorTransparent;
  if (tile.outOfSight) return useFog ? colorFog : colorTransparent;
  return colorWhite;
}
function DrawLOSPic(tile: Tile, pic: Pic | null, pos: Vec2i, useFog: boolean): void {
  const mask = GetLOSMask(tile, useFog);
  if (!ColorEquals(mask, colorTransparent)) PicRender(pic, pos, mask);
}
const ThingDrawBelow = (t: Thing): boolean => (t.flags & THING_DRAW_BELOW) !== 0;
const ThingDrawAbove = (t: Thing): boolean => (t.flags & THING_DRAW_ABOVE) !== 0;
export interface DrawBufferArgs { HUD: boolean; FocusActorUID: number }
type TileFunc = (b: DrawBuffer, offset: Vec2i, t: Tile, pos: Vec2i, useFog: boolean, args: DrawBufferArgs) => void;

function DrawTiles(b: DrawBuffer, offset: Vec2i, f: TileFunc, args: DrawBufferArgs): void {
  const useFog = ConfigGetBool('Game.Fog');
  let ti = 0;
  const yt = Y_TILES();
  const xt = X_TILES();
  for (let y = 0, py = b.dy + offset.y; y < yt; y++, py += TILE_HEIGHT) {
    b.displaylist.length = 0;
    for (let x = 0, px = b.dx + offset.x; x < b.Size.x; x++, ti++, px += TILE_WIDTH) {
      const t = b.tiles[ti];
      if (t == null) continue;
      f(b, offset, t, { x: px, y: py }, useFog, args);
    }
    b.displaylist.sort((t1, t2) => (t1.Pos.y < t2.Pos.y ? -1 : t1.Pos.y > t2.Pos.y ? 1 : 0));
    for (const t of b.displaylist) DrawThing(b, t, offset);
    ti += xt - b.Size.x;
  }
}
const DrawFloor: TileFunc = (_b, _o, t, pos, useFog) => {
  if (t.Class != null && t.Class.Pic != null && t.Class.Type !== TILE_CLASS_WALL) DrawLOSPic(t, t.Class.Pic, pos, useFog);
};
const DrawThingsBelow: TileFunc = (b, _o, t) => {
  if (t.outOfSight) return;
  for (const tid of t.things) {
    const ti = ThingIdGetThing(tid);
    if (ThingDrawBelow(ti)) b.displaylist.push(ti);
  }
};
const DrawWallsAndThings: TileFunc = (b, _o, t, pos, useFog) => {
  if (t.Class.Type === TILE_CLASS_WALL) {
    DrawLOSPic(t, t.Class.Pic, { x: pos.x, y: pos.y + WALL_OFFSET_Y }, useFog);
  } else if (t.Class.Type === TILE_CLASS_DOOR) {
    const mask = GetLOSMask(t, useFog);
    if (!ColorEquals(mask, colorTransparent)) DoorDraw(t.Door, pos, mask);
  }
  if (t.outOfSight) return;
  for (const tid of t.things) {
    const ti = ThingIdGetThing(tid);
    if (ThingDrawBelow(ti) || ThingDrawAbove(ti)) continue;
    b.displaylist.push(ti);
  }
};
const DrawThingsAbove: TileFunc = (b, _o, t) => {
  if (t.outOfSight) return;
  for (const tid of t.things) {
    const ti = ThingIdGetThing(tid);
    if (ThingDrawAbove(ti)) b.displaylist.push(ti);
  }
};
const DrawObjectiveHighlights: TileFunc = (b, offset, t) => {
  for (const tid of t.things) {
    const ti = ThingIdGetThing(tid);
    let pic: Pic | null = null;
    let color: Color = { ...colorWhite };
    const extra = { x: 0, y: 0 };
    if (ti.flags & THING_OBJECTIVE) {
      const o = gMission.missionData!.Objectives[ObjectiveFromThing(ti.flags)];
      if (o.Flags & OBJECTIVE_HIDDEN) continue;
      if (!(o.Flags & OBJECTIVE_POSKNOWN) && t.outOfSight) continue;
      switch (o.Type) {
        case OBJECTIVE_KILL:
        case OBJECTIVE_DESTROY:
          pic = PicManagerGetPic(gPicManager, 'hud/objective_kill');
          break;
        case OBJECTIVE_RESCUE:
        case OBJECTIVE_COLLECT:
          pic = PicManagerGetPic(gPicManager, 'hud/objective_collect');
          break;
        default:
          continue;
      }
      color = { ...o.color };
      if (ti.kind === KIND_CHARACTER) extra.y -= 10;
    } else if (ti.kind === KIND_PICKUP) {
      if (!IsPVP(gCampaign.Entry.Mode) && t.outOfSight) continue;
      const p = gPickups[ti.id];
      if (!PickupClassHasKeyEffect(p.class) && !PickupIsManual(null as unknown as TActor, p)) continue;
      pic = CPicGetPic(p.thing.CPic, 0);
      color = { ...colorDarker };
    }
    if (pic != null) {
      const fp = svec2i_floor(ti.Pos);
      const picPos = { x: fp.x - b.xTop + offset.x, y: fp.y - b.yTop + offset.y };
      color.a = Pulse256(gMission.time) & 255;
      PicRender(pic, { x: picPos.x + Math.trunc(pic.size.x / -2) + extra.x, y: picPos.y + Math.trunc(pic.size.y / -2) + extra.y }, color);
    }
  }
};
const ACTOR_HEIGHT = 25;
const DrawChatters: TileFunc = (b, offset, t, _pos, useFog, args) => {
  const drawNameTags = GetNumPlayers(PLAYER_ANY, false, false) > 2;
  for (const tid of t.things) {
    if (t.outOfSight) continue;
    const ti = ThingIdGetThing(tid);
    if (ti.kind !== KIND_CHARACTER) continue;
    let mask = GetLOSMask(t, useFog);
    if (ColorEquals(mask, colorTransparent)) continue;
    const a = gActors[ti.id];
    let text: string | null = null;
    const pd = PlayerDataGetByUID(a.PlayerUID);
    if (pd && drawNameTags && a.uid !== args.FocusActorUID) {
      text = pd.name;
      mask = ActorGetCharacter(a).Colors.Body;
    }
    if (a.Chatter.length > 0) text = a.Chatter;
    if (text) {
      FontStrMask(text, {
        x: Math.trunc(a.thing.Pos.x) - b.xTop + offset.x - Math.trunc(FontStrW(text) / 2),
        y: Math.trunc(a.thing.Pos.y) - b.yTop + offset.y - ACTOR_HEIGHT,
      }, mask);
    }
  }
};
const DrawPickupMenus: TileFunc = (b, offset, t, _pos, useFog) => {
  for (const tid of t.things) {
    if (t.outOfSight || ColorEquals(GetLOSMask(t, useFog), colorTransparent)) continue;
    const ti = ThingIdGetThing(tid);
    if (ti.kind !== KIND_CHARACTER) continue;
    const a = gActors[ti.id];
    if (!a.pickupMenu.pickup || !ActorIsLocalPlayer(a.uid)) continue;
    const pd = PlayerDataGetByUID(a.PlayerUID);
    if (pd && !pd.isOwn) continue;
    DrawPickupMenu(b, a, offset);
  }
};
function DrawPickupMenu(b: DrawBuffer, a: TActor, offset: Vec2i): void {
  const menu = a.pickupMenu.effect!.Menu;
  const size = { x: 0, y: 0 };
  let ss = FontStrSize(menu.Text ?? '');
  size.x = MAX(size.x, ss.x);
  size.y += ss.y + FontH();
  for (const m of menu.Items) {
    ss = FontStrSize(m.Text ?? '');
    size.x = MAX(size.x, ss.x);
    size.y += ss.y;
  }
  let pos = {
    x: Math.trunc(a.thing.Pos.x) - b.xTop + offset.x - Math.trunc(size.x / 2),
    y: Math.trunc(a.thing.Pos.y) - b.yTop + offset.y - Math.trunc(size.y / 2),
  };
  const startX = pos.x;
  DrawRectangle({ x: pos.x - 2, y: pos.y - 2 }, { x: size.x + 4, y: size.y + 4 }, { r: 64, g: 64, b: 64, a: 128 }, true);
  pos = FontStr(menu.Text, pos);
  pos.x = startX;
  pos.y += FontH() * 2;
  menu.Items.forEach((m, i) => {
    const selected = i === a.pickupMenu.index;
    if (selected) DrawRectangle({ x: pos.x - 1, y: pos.y - 1 }, { x: size.x + 2, y: FontH() + 2 }, colorSelectedBG, true);
    pos = FontStrMask(m.Text, pos, selected ? colorRed : colorWhite);
    pos.x = startX;
    pos.y += FontH();
  });
}
function DrawThing(b: DrawBuffer, t: Thing, offset: Vec2i): void {
  const fp = svec2i_floor(svec2_add(t.Pos, t.drawShake));
  const picPos = { x: fp.x - b.xTop + offset.x, y: fp.y - b.yTop + offset.y };
  if (t.ShadowSize.x !== 0 || t.ShadowSize.y !== 0) DrawShadow(picPos, { x: t.ShadowSize.x, y: t.ShadowSize.y }, colorBlack);
  switch (t.CPicFunc) {
    case CPICFUNC_MAPOBJECT: {
      const obj = gObjs[t.id];
      const c = CPicDrawContextNew();
      c.Offset = obj.Class.Offset;
      CPicDraw(obj.thing.CPic, picPos, c);
      return;
    }
    case CPICFUNC_BULLET: {
      const obj = gMobObjs[t.id];
      const drawPos = { x: picPos.x, y: picPos.y - Math.trunc(obj.z / Z_FACTOR) };
      const c = CPicDrawContextNew();
      c.Dir = RadiansToDirection(f32(svec2_angle(obj.thing.Vel) + MPI_2));
      const pic = CPicGetPic(obj.thing.CPic, c.Dir);
      if (pic != null) c.Offset = { x: Math.trunc(pic.size.x / -2), y: Math.trunc(pic.size.y / -2) };
      CPicDraw(obj.thing.CPic, drawPos, c);
      return;
    }
    case CPICFUNC_PICKUP: {
      const p = gPickups[t.id];
      const c = CPicDrawContextNew();
      const pic = CPicGetPic(p.thing.CPic, c.Dir);
      if (pic != null) {
        const s = CPicGetSize(p.class.Pic);
        c.Offset = { x: Math.trunc(s.x / -2), y: Math.trunc(s.y / -2) };
      }
      CPicDraw(p.thing.CPic, picPos, c);
      return;
    }
    default:
      break;
  }
  if (t.kind === KIND_CHARACTER) {
    const a = gActors[t.id];
    const pics = GetCharacterPicsFromActor(a);
    DrawActorPics(pics, picPos, null);
    DrawLaserSight(pics, a, picPos);
  } else if (t.drawFunc === DRAWFUNC_PARTICLE) {
    DrawParticle(picPos, t.drawData.MobObjId, t.drawData.Scale);
  }
}
function DrawParticle(pos: Vec2i, id: number, scale: Vec2): void {
  const p = gParticles[id];
  if (p.Class.GravityFactor === 0 && p.Z > 0 && svec2_is_zero(p.thing.Vel) && !p.isAttached) {
    const t = Vec2iToTile(svec2i_assign_vec2(p.Pos));
    const tAbove = MapGetTile(gMap, { x: t.x, y: t.y - 1 });
    if (tAbove != null && tAbove.Class.Type === TILE_CLASS_DOOR && !TileIsShootable(tAbove)) return;
  }
  switch (p.Class.Type) {
    case PARTICLE_PIC: {
      const c = CPicDrawContextNew();
      c.Dir = RadiansToDirection(p.Angle);
      const pic = CPicGetPic(p.Pic!, c.Dir);
      if (pic == null) return;
      if (p.Pic!.Type !== PICTYPE_DIRECTIONAL) c.Radians = p.Angle;
      c.Offset = { x: Math.trunc(pic.size.x / -2), y: Math.trunc(pic.size.y / -2) - Math.trunc(p.Z / Z_FACTOR) };
      c.Scale = scale;
      if (p.Class.ZDarken) {
        const m = CLAMP(Math.trunc(f32(f32(p.Z * 10 * Z_FACTOR) / 256 + 128)), 128, 255);
        c.Mask = { r: m, g: m, b: m, a: 255 };
      }
      CPicDraw(p.Pic!, pos, c);
      break;
    }
    case PARTICLE_TEXT: {
      const o = FontOptsNew();
      o.HAlign = ALIGN_CENTER;
      o.Mask = p.Class.Text.Mask;
      FontStrOpt(p.Text, { x: pos.x, y: pos.y - Math.trunc(p.Z / Z_FACTOR) }, o);
      break;
    }
    case PARTICLE_CHAR_SPRITE: {
      if (p.Char == null) break;
      const idx = RadiansToDirection(p.Angle);
      const ns = PicManagerGetCharSprites(gPicManager, p.Class.CharSprite ?? '', p.Char.Colors);
      if (ns == null) break;
      const pic = ns.pics[idx];
      PicRender(pic, { x: pos.x + Math.trunc(pic.size.x / -2), y: pos.y + Math.trunc(pic.size.y / -2) - Math.trunc(p.Z / Z_FACTOR) }, colorWhite);
      break;
    }
    default:
      break;
  }
}
export function DrawBufferDraw(b: DrawBuffer, offset: Vec2i, args: DrawBufferArgs): void {
  DrawTiles(b, offset, DrawFloor, args);
  DrawTiles(b, offset, DrawThingsBelow, args);
  DrawTiles(b, offset, DrawWallsAndThings, args);
  DrawTiles(b, offset, DrawThingsAbove, args);
  if (args.HUD) {
    DrawTiles(b, offset, DrawObjectiveHighlights, args);
    DrawTiles(b, offset, DrawChatters, args);
    DrawTiles(b, offset, DrawPickupMenus, args);
  }
}

// --- door.c --------------------------------------------------------------------------------------------------------

function DoorDraw(d: DoorState, pos: Vec2i, mask: Color): void {
  if (d.Class2) DoorDrawPic(d.Class2.Pic, pos, false, 0, 0, mask);
  if (d.Class && d.Class.Pic && (!d.IsOpen || d.Count > 0)) {
    const pic = d.Class.Pic;
    const bottom = d.IsHorizontal ? TILE_HEIGHT * 2 - pic.size.y : 0;
    const doorHCropped = pic.size.y - bottom;
    const fdy = d.IsOpen
      ? Math.sqrt((2 - (DOORSTATE_COUNT - d.Count) / DOORSTATE_COUNT) * ((DOORSTATE_COUNT - d.Count) / DOORSTATE_COUNT))
      : 1 - Math.sqrt(1 - (d.Count / DOORSTATE_COUNT) * (d.Count / DOORSTATE_COUNT));
    const dy = Math.trunc(fdy * doorHCropped);
    DoorDrawPic(pic, pos, d.IsHorizontal, dy, bottom, mask);
  }
}
function DoorDrawPic(pic: Pic | null, pos: Vec2i, crop: boolean, dy: number, bottom: number, mask: Color): void {
  if (!pic) return;
  const offset = { x: Math.trunc((TILE_WIDTH - pic.size.x) / 2), y: WALL_OFFSET_Y + dy };
  if (pic.size.y > 16) offset.y += TILE_HEIGHT - (pic.size.y % TILE_HEIGHT);
  const src = { Pos: { x: 0, y: 0 }, Size: { x: pic.size.x, y: pic.size.y - (crop ? dy + bottom : 0) } };
  if (src.Size.y <= 0) return;
  TextureRender(pic, src, { Pos: { x: pos.x + offset.x, y: pos.y + offset.y }, Size: src.Size }, mask);
}

// --- drawtools.c: DrawShadow ----------------------------------------------------------------------------------------

export function DrawShadow(pos: Vec2i, scale: Vec2, mask: Color): void {
  if (!ConfigGetBool('Graphics.Shadows') || ColorEquals(mask, colorTransparent)) return;
  const shadow = PicManagerGetPic(gPicManager, 'particles/shadow');
  if (!shadow) return;
  const drawScale = { x: f32((scale.x * 2) / shadow.size.x), y: f32((scale.y * 2) / shadow.size.y) };
  PicRender(shadow, { x: pos.x - Math.trunc(scale.x), y: pos.y - Math.trunc(scale.y) }, mask, 0, drawScale);
}

// --- draw_actor.c --------------------------------------------------------------------------------------------------

export const BODY_PART_HEAD = 0;
export const BODY_PART_HAIR = 1;
export const BODY_PART_FACEHAIR = 2;
export const BODY_PART_HAT = 3;
export const BODY_PART_GLASSES = 4;
export const BODY_PART_BODY = 5;
export const BODY_PART_LEGS = 6;
export const BODY_PART_GUN_R = 7;
export const BODY_PART_GUN_L = 8;

export interface ActorPics {
  IsDead: boolean;
  IsDying: boolean;
  Sprites: CharSprites | null;
  Head: Pic | null;
  HeadOffset: Vec2i;
  HeadParts: (Pic | null)[];
  HeadPartOffsets: Vec2i[];
  Body: Pic | null;
  BodyOffset: Vec2i;
  Legs: Pic | null;
  LegsOffset: Vec2i;
  Guns: (Pic | null)[];
  GunOffsets: Vec2i[];
  OrderedPics: (Pic | null)[];
  OrderedOffsets: Vec2i[];
  ShadowMask: Color;
  Mask: Color;
}
function newActorPics(): ActorPics {
  const z = (): Vec2i => ({ x: 0, y: 0 });
  return {
    IsDead: false, IsDying: false, Sprites: null, Head: null, HeadOffset: z(), HeadParts: [null, null, null, null],
    HeadPartOffsets: [z(), z(), z(), z()], Body: null, BodyOffset: z(), Legs: null, LegsOffset: z(), Guns: [null, null],
    GunOffsets: [z(), z()], OrderedPics: new Array(BODY_PART_COUNT).fill(null), OrderedOffsets: Array.from({ length: BODY_PART_COUNT }, z),
    ShadowMask: { ...colorTransparent }, Mask: { ...colorWhite },
  };
}
function GetActorDrawOffset(pic: Pic | null, part: number, cs: CharSprites, anim: number, frame: number, d: number, state: number): Vec2i {
  if (pic == null) return { x: 0, y: 0 };
  let o = { x: Math.trunc(pic.size.x / -2), y: Math.trunc(pic.size.y / -2) };
  const fo = CharSpritesGetOffset(cs.Offsets.Frame[part], anim === ACTORANIMATION_WALKING ? 'run' : 'idle', frame);
  o = { x: o.x - fo.x, y: o.y - fo.y };
  const dv = cs.Offsets.Dir[part][d];
  o = { x: o.x + Math.trunc(dv.x), y: o.y + Math.trunc(dv.y) };
  if ((part === BODY_PART_GUN_R || part === BODY_PART_GUN_L) && state === GUNSTATE_RECOIL) {
    const r = [[0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1]][d];
    o = { x: o.x + r[0], y: o.y + r[1] };
  }
  return o;
}
/** GetFestiveHat: the hats of the holidays, by the browser's local date */
function GetFestiveHat(): string | null {
  if (ConfigGetBool('Game.NoFestiveHats')) return null;
  const t = new Date();
  const m = t.getMonth() + 1;
  const d = t.getDate();
  if (m === 1 && d === 1) return 'party';
  if (m === 3 && d === 17) return 'leprechaun';
  if (m === 5 && d === 5) return 'sombrero';
  if (m === 10 && d === 31) return 'witch';
  if (m === 12 && d === 25) return 'santa';
  const Y = t.getFullYear();
  const a = Y % 19;
  const b = Math.trunc(Y / 100);
  const c = Y % 100;
  const dd = Math.trunc(b / 4);
  const e = b % 4;
  const f = Math.trunc((b + 8) / 25);
  const g = Math.trunc((b - f + 1) / 3);
  const h = (19 * a + b - dd - g + 15) % 30;
  const i = Math.trunc(c / 4);
  const k = c % 4;
  const L = (32 + 2 * e + 2 * i - h - k) % 7;
  const mm = Math.trunc((a + 11 * h + 22 * L) / 451);
  const month = Math.trunc((h + L - 7 * mm + 114) / 31) - 1;
  const day = ((h + L - 7 * mm + 114) % 31) + 1;
  const fri = new Date(Y, month, day - 2);
  const mon = new Date(Y, month, day + 1);
  const today = new Date(Y, m - 1, d);
  if (today >= fri && today <= mon) return 'bunny';
  if (m === 11) {
    const first = new Date(Y, 10, 1).getDay();
    const fourthThursday = 1 + ((4 - first + 7) % 7) + 21;
    if (d === fourthThursday) return 'capotain';
  }
  return null;
}
export function GetHeadPic(c: { HeadSprites: string }, dir: number, grimace: boolean, colors: CharColors): Pic | null {
  if (c.HeadSprites.length === 0) return null;
  const ns = PicManagerGetCharSprites(gPicManager, c.HeadSprites, colors);
  return ns ? ns.pics[dir + (grimace ? 8 : 0)] ?? null : null;
}
export function GetHeadPartPic(name: string | null, hp: number, dir: number, grimace: boolean, isHatDetached: boolean, colors: CharColors): Pic | null {
  if (name == null) return null;
  if (isHatDetached && hp === HEAD_PART_HAT) return null;
  const sub = ['hairs', 'facehairs', 'hats', 'glasses'][hp];
  const ns = PicManagerGetCharSprites(gPicManager, `chars/${sub}/${name}`, colors);
  return ns ? ns.pics[dir + (grimace ? 8 : 0)] ?? null : null;
}
function GetBodyPic(cs: CharSprites, dir: number, anim: number, frame: number, numBarrels: number, grips: number,
  barrelState: number, colors: CharColors): Pic | null {
  const stride = anim === ACTORANIMATION_WALKING ? 8 : 1;
  const idx = (frame % stride) + dir * stride;
  let upperPose = '';
  if (numBarrels === 1) upperPose = '_handgun';
  if (numBarrels === 2) upperPose = '_dualgun';
  if (grips === 2) upperPose = barrelState === GUNSTATE_FIRING || barrelState === GUNSTATE_RECOIL ? '_riflefire' : '_rifle';
  for (;;) {
    const ns = PicManagerGetCharSprites(gPicManager, `chars/bodies/${cs.Name}/upper_${anim === ACTORANIMATION_WALKING ? 'run' : 'idle'}${upperPose}`, colors);
    if (ns == null && upperPose !== '_handgun') {
      upperPose = '_handgun';
      continue;
    }
    return ns ? ns.pics[idx] ?? null : null;
  }
}
function GetLegsPic(cs: CharSprites, dir: number, anim: number, frame: number, colors: CharColors): Pic | null {
  const stride = anim === ACTORANIMATION_WALKING ? 8 : 1;
  const ns = PicManagerGetCharSprites(gPicManager, `chars/bodies/${cs.Name}/legs_${anim === ACTORANIMATION_WALKING ? 'run' : 'idle'}`, colors);
  return ns ? ns.pics[(frame % stride) + dir * stride] ?? null : null;
}
function GetGunPic(sprites: string | null, dir: number, gunState: number, colors: CharColors): Pic | null {
  if (!sprites) return null;
  const ns = PicManagerGetCharSprites(gPicManager, sprites, colors);
  return ns ? ns.pics[(gunState === GUNSTATE_READY ? 8 : 0) + dir] ?? null : null;
}
function GetUnorderedPics(c: Character, dir: number, legDir: number, anim: number, frame: number, gun: WeaponClass | null,
  barrelStates: number[], isGrimacing: boolean, isHatDetached: boolean, shadowMask: Color, mask: Color | null,
  colorsIn: CharColors | null, deadPic: number): ActorPics {
  const pics = newActorPics();
  if (c.Class == null) {
    pics.IsDead = true;
    pics.IsDying = true;
    return pics;
  }
  pics.Sprites = c.Class.Sprites;
  pics.ShadowMask = shadowMask;
  pics.Mask = mask ? { ...mask } : { ...colorWhite };
  pics.IsDead = deadPic > 0;
  if (pics.IsDead) {
    const ds = CharacterClassGetDeathSprites(c.Class);
    if (ds && deadPic - 1 < ds.pics.length) {
      pics.IsDying = true;
      pics.Body = ds.pics[deadPic - 1];
      pics.OrderedPics[0] = pics.Body;
    }
    return pics;
  }
  const colors = colorsIn ?? c.Colors;
  let headDir = dir;
  if (anim === ACTORANIMATION_IDLE) {
    if (frame === IDLEHEAD_LEFT) headDir = (dir + 7) % 8;
    else if (frame === IDLEHEAD_RIGHT) headDir = (dir + 1) % 8;
  }
  let grimace = isGrimacing;
  const numBarrels = gun == null || WC_BARREL(gun, 'Sprites', 0) == null ? 0 : WeaponClassNumBarrels(gun);
  for (let i = 0; i < MAX_BARRELS; i++) {
    if (barrelStates[i] === GUNSTATE_FIRING || barrelStates[i] === GUNSTATE_RECOIL) {
      grimace = true;
      break;
    }
  }
  const grips = gun == null ? 0 : WC_BARREL(gun, 'Grips', 0);
  const cs = c.Class.Sprites!;
  pics.Head = GetHeadPic(c.Class, headDir, grimace, colors);
  pics.HeadOffset = GetActorDrawOffset(pics.Head, BODY_PART_HEAD, cs, anim, frame, dir, GUNSTATE_READY);
  const festiveHat = GetFestiveHat();
  for (let hp = 0; hp < HEAD_PART_COUNT; hp++) {
    if (c.Class.HasHeadParts[hp] || (hp === HEAD_PART_HAT && festiveHat != null)) {
      const name = hp === HEAD_PART_HAT && festiveHat ? festiveHat : c.HeadParts[hp];
      pics.HeadParts[hp] = GetHeadPartPic(name, hp, headDir, grimace, isHatDetached, colors);
      pics.HeadPartOffsets[hp] = GetActorDrawOffset(pics.HeadParts[hp], BODY_PART_HEAD, cs, anim, frame, dir, GUNSTATE_READY);
    }
  }
  for (let i = 0; i < numBarrels; i++) {
    pics.Guns[i] = GetGunPic(WC_BARREL(gun!, 'Sprites', i), dir, barrelStates[i], colors);
    if (pics.Guns[i] != null) {
      pics.GunOffsets[i] = GetActorDrawOffset(pics.Guns[i], i === 0 ? BODY_PART_GUN_R : BODY_PART_GUN_L, cs, anim, frame,
        i === 0 ? dir : DirectionMirrorX(dir), barrelStates[i]);
      if (i === 1) {
        const xHalf = Math.trunc(pics.Guns[i]!.size.x / 2);
        const xOffsetOrig = pics.GunOffsets[i].x + xHalf;
        pics.GunOffsets[i].x = -xOffsetOrig - xHalf;
      }
    }
  }
  pics.Body = GetBodyPic(cs, dir, anim, frame, numBarrels, grips, barrelStates[0], colors);
  pics.BodyOffset = GetActorDrawOffset(pics.Body, BODY_PART_BODY, cs, anim, frame, dir, GUNSTATE_READY);
  pics.Legs = GetLegsPic(cs, legDir, anim, frame, colors);
  pics.LegsOffset = GetActorDrawOffset(pics.Legs, BODY_PART_LEGS, cs, anim, frame, legDir, GUNSTATE_READY);
  return pics;
}
function ReorderPics(pics: ActorPics, c: Character, dir: number, gun: WeaponClass | null, barrelStates: number[]): void {
  const grips = gun == null ? 0 : WC_BARREL(gun, 'Grips', 0);
  const drawOrderDir = grips === 2 && barrelStates[0] === GUNSTATE_READY ? DirectionRotate(dir, -1) : dir;
  for (let bp = 0; bp < BODY_PART_COUNT; bp++) {
    const part = c.Class!.Sprites!.Order[drawOrderDir][bp];
    switch (part) {
      case BODY_PART_HEAD: pics.OrderedPics[bp] = pics.Head; pics.OrderedOffsets[bp] = pics.HeadOffset; break;
      case BODY_PART_HAIR: case BODY_PART_FACEHAIR: case BODY_PART_HAT: case BODY_PART_GLASSES: {
        const hp = part - BODY_PART_HAIR;
        pics.OrderedPics[bp] = pics.HeadParts[hp];
        pics.OrderedOffsets[bp] = pics.HeadPartOffsets[hp];
        break;
      }
      case BODY_PART_BODY: pics.OrderedPics[bp] = pics.Body; pics.OrderedOffsets[bp] = pics.BodyOffset; break;
      case BODY_PART_LEGS: pics.OrderedPics[bp] = pics.Legs; pics.OrderedOffsets[bp] = pics.LegsOffset; break;
      case BODY_PART_GUN_R: pics.OrderedPics[bp] = pics.Guns[0]; pics.OrderedOffsets[bp] = pics.GunOffsets[0]; break;
      case BODY_PART_GUN_L: pics.OrderedPics[bp] = pics.Guns[1]; pics.OrderedOffsets[bp] = pics.GunOffsets[1]; break;
      default: break;
    }
  }
}
function GetLegDirAndFrame(a: TActor, bodyDir: number): { dir: number; frame: number } {
  let frame = AnimationGetFrame(a.anim);
  const vel = svec2_add(a.MoveVel, a.thing.Vel);
  if (svec2_is_zero(vel)) return { dir: bodyDir, frame };
  const legDir = RadiansToDirection(f32(svec2_angle(vel) + MPI_2));
  const dirDiff = Math.abs(bodyDir - legDir);
  if (dirDiff > 2 && dirDiff < 6) {
    frame = ANIMATION_MAX_FRAMES - frame;
    return { dir: DirectionOpposite(legDir), frame };
  }
  return { dir: legDir, frame };
}
export function GetCharacterPicsFromActor(a: TActor): ActorPics {
  if (a.vehicleUID !== -1) {
    const p = newActorPics();
    p.ShadowMask = { ...colorTransparent };
    return p;
  }
  const c = ActorGetCharacter(a);
  const gun = ACTOR_GET_WEAPON(a);
  let mask: Color = { ...colorWhite };
  let hasStatus = false;
  if (a.flamed) { mask = { ...colorRed }; hasStatus = true; }
  else if (a.poisoned) { mask = { ...colorPoison }; hasStatus = true; }
  else if (a.petrified) { mask = { r: 128, g: 255, b: 255, a: 255 }; hasStatus = true; }
  else if (a.confused) { mask = { ...colorPurple }; hasStatus = true; }
  const black = { ...colorBlack };
  const white = { ...colorWhite };
  const allBlack: CharColors = { Skin: black, Arms: black, Body: black, Legs: black, Hair: black, Feet: black, Facehair: black, Hat: black, Glasses: black };
  const allWhite: CharColors = { Skin: white, Arms: white, Body: white, Legs: white, Hair: white, Feet: white, Facehair: white, Hat: white, Glasses: white };
  let colors: CharColors | null = null;
  let maskP: Color | null = null;
  let shadowMask: Color = { ...colorTransparent };
  if (a.flags & FLAGS_SEETHROUGH) {
    colors = allBlack;
    mask.a = 64;
    maskP = mask;
  } else {
    shadowMask = a.PlayerUID >= 0 ? c.Colors.Body : colorBlack;
    if (hasStatus) {
      maskP = mask;
      colors = allWhite;
    }
  }
  const dir = RadiansToDirection(a.DrawRadians);
  const { dir: legDir, frame } = GetLegDirAndFrame(a, dir);
  const gunStates = [0, 0];
  for (let i = 0; gun.Gun != null && i < WeaponClassNumBarrels(gun.Gun); i++) gunStates[i] = gun.barrels[i].state;
  const pics = GetUnorderedPics(c, dir, legDir, a.anim.Type, frame, gun.Gun, gunStates, ActorIsGrimacing(a), a.isHatDetached,
    shadowMask, maskP, colors, a.dead);
  if (a.pilotUID !== a.uid) {
    pics.HeadParts = [null, null, null, null];
    pics.Head = null;
    const pilot = ActorGetByUID(a.pilotUID);
    if (pilot != null) {
      const pc = ActorGetCharacter(pilot);
      const grimace = ActorIsGrimacing(a);
      let headDir = dir;
      if (a.anim.Type === ACTORANIMATION_IDLE) {
        if (frame === IDLEHEAD_LEFT) headDir = (dir + 7) % 8;
        else if (frame === IDLEHEAD_RIGHT) headDir = (dir + 1) % 8;
      }
      pics.Head = GetHeadPic(pc.Class!, headDir, grimace, pc.Colors);
      pics.HeadOffset = GetActorDrawOffset(pics.Head, BODY_PART_HEAD, pc.Class!.Sprites!, a.anim.Type, frame, dir, GUNSTATE_READY);
      for (let hp = 0; hp < HEAD_PART_COUNT; hp++) {
        if (pc.Class!.HasHeadParts[hp]) {
          pics.HeadParts[hp] = GetHeadPartPic(pc.HeadParts[hp], hp, headDir, grimace, a.isHatDetached, pc.Colors);
          pics.HeadPartOffsets[hp] = GetActorDrawOffset(pics.HeadParts[hp], BODY_PART_HEAD, pc.Class!.Sprites!, a.anim.Type, frame, dir, GUNSTATE_READY);
        }
      }
    }
  }
  if (!pics.IsDead) ReorderPics(pics, c, dir, gun.Gun, gunStates);
  return pics;
}
export function GetCharacterPics(c: Character, dir: number, legDir: number, anim: number, frame: number, gun: WeaponClass | null,
  barrelStates: number[], isGrimacing: boolean, isHatDetached: boolean, shadowMask: Color, mask: Color | null,
  colors: CharColors | null, deadPic: number): ActorPics {
  const pics = GetUnorderedPics(c, dir, legDir, anim, frame, gun, barrelStates, isGrimacing, isHatDetached, shadowMask, mask, colors, deadPic);
  if (!pics.IsDead && c.Class) ReorderPics(pics, c, dir, gun, barrelStates);
  return pics;
}
type Bounds = { Pos: Vec2i; Size: Vec2i } | null;
export function DrawActorPics(pics: ActorPics, pos: Vec2i, bounds: Bounds): void {
  if (pics.IsDead) {
    if (pics.IsDying && pics.Body) {
      const body = pics.Body;
      const drawPos = { x: pos.x - Math.trunc(body.size.x / 2), y: pos.y - (Math.trunc(body.size.y / 2) + 3) };
      const src = bounds ? { Pos: { x: bounds.Pos.x - drawPos.x, y: bounds.Pos.y - drawPos.y }, Size: { x: bounds.Size.x - bounds.Pos.x, y: bounds.Size.y - bounds.Pos.y } } : null;
      PicRender(body, drawPos, pics.Mask, 0, { x: 1, y: 1 }, FLIP_NONE, src);
    }
    return;
  }
  DrawShadow(pos, { x: 8, y: 6 }, pics.ShadowMask);
  for (let i = 0; i < BODY_PART_COUNT; i++) {
    const pic = pics.OrderedPics[i];
    if (pic == null) continue;
    const drawPos = { x: pos.x + pics.OrderedOffsets[i].x, y: pos.y + pics.OrderedOffsets[i].y };
    const src = bounds ? { Pos: { x: bounds.Pos.x - drawPos.x, y: bounds.Pos.y - drawPos.y }, Size: { x: bounds.Size.x - bounds.Pos.x, y: bounds.Size.y - bounds.Pos.y } } : null;
    PicRender(pic, drawPos, pics.Mask, 0, { x: 1, y: 1 }, FLIP_NONE, src);
  }
}
function DrawLaserSight(pics: ActorPics, a: TActor, picPos: Vec2i): void {
  if (pics.IsDead || ColorEquals(pics.ShadowMask, colorTransparent)) return;
  const ls = ConfigGetEnum('Game.LaserSight');
  if (ls !== LASER_SIGHT_ALL && !(ls === LASER_SIGHT_PLAYERS && a.PlayerUID >= 0)) return;
  const w = ACTOR_GET_WEAPON(a);
  const wc = w.Gun;
  if (wc == null) return;
  for (let i = 0; i < WeaponClassNumBarrels(wc); i++) {
    const mo = ActorGetMuzzleOffset(a, w, i);
    const wcb = WeaponClassGetBarrel(wc, i);
    const muzzlePos = { x: picPos.x + Math.trunc(mo.x), y: picPos.y + Math.trunc(mo.y) - Math.trunc(wcb.Normal.MuzzleHeight / Z_FACTOR) };
    const radians = f32(dir2radians[a.direction] + wcb.Normal.AngleOffset);
    const range = Math.trunc(WeaponClassGetRange(wcb));
    const color = { ...colorCyan, a: 64 };
    const spreadHalf = f32(f32(f32((wcb.Normal.Spread.Count - 1) * wcb.Normal.Spread.Width) / 2) + f32(wcb.Normal.Recoil / 2));
    if (spreadHalf > 0) {
      DrawLaserSightSingle(muzzlePos, f32(radians - spreadHalf), range, color);
      DrawLaserSightSingle(muzzlePos, f32(radians + spreadHalf), range, color);
    } else {
      DrawLaserSightSingle(muzzlePos, radians, range, color);
    }
  }
}
export function DrawCharacterSimple(c: Character, pos: Vec2i, d: number, hilite: boolean, showGun: boolean, gun: WeaponClass | null): void {
  const pics = GetCharacterPics(c, d, d, ACTORANIMATION_IDLE, 0, gun, [GUNSTATE_READY, GUNSTATE_READY], false, false, colorBlack, null, null, 0);
  DrawActorPics(pics, pos, null);
  if (hilite) {
    FontCh('>', { x: pos.x - 8, y: pos.y - 16 });
    if (showGun && c.Gun) FontStr(c.Gun.name, { x: pos.x - 8, y: pos.y + 8 });
  }
}
export function DrawHead(c: Character, dir: number, pos: Vec2i): void {
  if (!c.Class || !c.Class.Sprites) return;
  const head = GetHeadPic(c.Class, dir, false, c.Colors);
  const ho = GetActorDrawOffset(head, BODY_PART_HEAD, c.Class.Sprites, ACTORANIMATION_IDLE, 0, DIRECTION_DOWN, GUNSTATE_READY);
  PicRender(head, { x: pos.x + ho.x, y: pos.y + ho.y + 12 }, colorWhite);
  for (let hp = 0; hp < HEAD_PART_COUNT; hp++) {
    if (!c.Class.HasHeadParts[hp]) continue;
    const pic = GetHeadPartPic(c.HeadParts[hp], hp, dir, false, false, c.Colors);
    if (pic) {
      const o = GetActorDrawOffset(pic, BODY_PART_HEAD, c.Class.Sprites, ACTORANIMATION_IDLE, 0, DIRECTION_DOWN, GUNSTATE_READY);
      PicRender(pic, { x: pos.x + o.x, y: pos.y + o.y + 12 }, colorWhite);
    }
  }
}

// --- camera.c: CameraDraw ----------------------------------------------------------------------------------------

export const cameraBuffers = new WeakMap<Camera, DrawBuffer>();
function DoBuffer(camera: Camera, w: number, noise: Vec2, offset: Vec2i): void {
  let b = cameraBuffers.get(camera);
  if (!b) {
    b = DrawBufferNew();
    cameraBuffers.set(camera, b);
  }
  DrawBufferSetFromMap(b, gMap, svec2_add(camera.lastPosition, noise), w);
  if (gPlayerDatas.length > 0) DrawBufferFix(b);
  DrawBufferDraw(b, offset, { HUD: ConfigGetBool('Graphics.ShowHUD'), FocusActorUID: camera.FocusActorUID });
}
export function CameraDraw(camera: Camera): void {
  const centerOffset = { x: -4, y: -8 };
  const w = gGfx.w;
  const h = gGfx.h;
  const noise = camera.shake.Delta;
  gGfx.setClip(null);
  const dd = camera.HUD.DrawData;
  if (dd.NumScreens === 0) {
    DoBuffer(camera, X_TILES(), noise, centerOffset);
  } else {
    if (IsPVP(gCampaign.Entry.Mode) && dd.NumScreens > 0) LOSReset(gMap);
    if (camera.NumViews === 1) {
      if (IsPVP(gCampaign.Entry.Mode)) {
        for (const p of gPlayerDatas) {
          if (!p.IsLocal || !p.isOwn || !IsPlayerAliveOrDying(p) || !IsPlayerHuman(p)) continue;
          LOSCalcFrom(gMap, Vec2ToTile(ActorGetByUID(p.ActorUID)!.thing.Pos), false);
        }
      }
      DoBuffer(camera, X_TILES(), noise, centerOffset);
    } else if (dd.NumScreens === 2) {
      for (let i = 0; i < dd.NumScreens; i++) {
        const p = dd.Players[i]!;
        if (!IsPlayerAliveOrDying(p)) continue;
        const a = ActorGetByUID(p.ActorUID);
        if (a == null) continue;
        camera.lastPosition = a.thing.Pos;
        camera.FocusActorUID = a.uid;
        const cop = { ...centerOffset };
        gGfx.setClip({ Pos: { x: i & 1 ? Math.trunc(w / 2) : 0, y: 0 }, Size: { x: Math.trunc(w / 2), y: h } });
        if (i === 1) cop.x += Math.trunc(w / 2) - centerOffset.x;
        LOSCalcFrom(gMap, Vec2ToTile(camera.lastPosition), false);
        DoBuffer(camera, X_TILES_HALF(), noise, cop);
      }
      gGfx.setClip(null);
      Draw_Line(Math.trunc(w / 2) - 1, 0, Math.trunc(w / 2) - 1, h - 1, colorBlack);
      Draw_Line(Math.trunc(w / 2), 0, Math.trunc(w / 2), h - 1, colorBlack);
    } else if (dd.NumScreens >= 3 && dd.NumScreens <= 4) {
      for (let i = 0; i < dd.NumScreens; i++) {
        const p = dd.Players[i]!;
        if (!IsPlayerAliveOrDying(p)) continue;
        const a = ActorGetByUID(p.ActorUID);
        if (a == null) continue;
        camera.lastPosition = a.thing.Pos;
        camera.FocusActorUID = a.uid;
        const cop = { ...centerOffset };
        gGfx.setClip({ Pos: { x: i & 1 ? Math.trunc(w / 2) : 0, y: i < 2 ? 0 : Math.trunc(h / 2) - 1 }, Size: { x: Math.trunc(w / 2), y: Math.trunc(h / 2) } });
        if (i & 1) cop.x += Math.trunc(w / 2) - centerOffset.x;
        if (i < 2) cop.y -= Math.trunc(h / 4) + centerOffset.y;
        else cop.y += Math.trunc(h / 4) - centerOffset.y;
        LOSCalcFrom(gMap, Vec2ToTile(camera.lastPosition), false);
        DoBuffer(camera, X_TILES_HALF(), noise, cop);
      }
      gGfx.setClip(null);
      Draw_Line(Math.trunc(w / 2) - 1, 0, Math.trunc(w / 2) - 1, h - 1, colorBlack);
      Draw_Line(Math.trunc(w / 2), 0, Math.trunc(w / 2), h - 1, colorBlack);
      Draw_Line(0, Math.trunc(h / 2) - 1, w - 1, Math.trunc(h / 2) - 1, colorBlack);
      Draw_Line(0, Math.trunc(h / 2), w - 1, Math.trunc(h / 2), colorBlack);
    }
  }
  gGfx.setClip(null);
}
export function CameraDrawMode(camera: Camera): void {
  let name = '';
  switch (camera.spectateMode) {
    case SPECTATE_NONE: return;
    case SPECTATE_FOLLOW: {
      const a = ActorGetByUID(camera.FollowActorUID);
      if (a == null || !a.isInUse) return;
      const p = PlayerDataGetByUID(a.PlayerUID);
      if (p == null) return;
      name = `Following ${p.name}`;
      break;
    }
    case SPECTATE_FREE: name = 'Free-look Mode'; break;
    default: return;
  }
  const w = gGfx.w;
  const h = gGfx.h;
  FontStrMask(name, { x: Math.trunc((w - FontStrW(name)) / 2), y: h - FontH() * 2 }, { r: 255, g: 255, b: 128, a: 255 });
  const p = GetFirstPlayer(false, true, true);
  const dev = p ? p.inputDevice : 1;
  const idx = p ? p.deviceIndex : 0;
  let pos = { x: Math.trunc((w - FontStrW('foo/bar to follow player, baz to free-look')) / 2), y: h - FontH() };
  const yellow = { r: 255, g: 255, b: 128, a: 255 };
  pos = buttonHooks.drawButton(dev, idx, 16, pos);
  pos = FontStrMask('/', pos, yellow);
  pos = buttonHooks.drawButton(dev, idx, 32, pos);
  pos = FontStrMask(' to follow player, ', pos, yellow);
  pos = buttonHooks.drawDirectionButtons(dev, idx, pos);
  FontStrMask(' to free-look', pos, yellow);
}

// --- automap.c -----------------------------------------------------------------------------------------------------

const colorWall = { r: 72, g: 152, b: 72, a: 255 };
const colorFloor = { r: 12, g: 92, b: 12, a: 255 };
const colorRoom = { r: 24, g: 112, b: 24, a: 255 };
const colorExit = { r: 255, g: 255, b: 255, a: 255 };
const MASK_ALPHA = 128;
function DisplayPlayer(player: TActor, pos: Vec2i, scale: number): void {
  const t = Vec2ToTile(player.thing.Pos);
  const p = { x: pos.x + t.x * scale, y: pos.y + t.y * scale };
  if (scale >= 2) DrawHead(ActorGetCharacter(player), DIRECTION_DOWN, p);
  else DrawPoint(p, colorWhite);
}
function DrawAutomapMap(map: GameMap, center: Vec2i, centerOn: Vec2i, size: Vec2i, scale: number, flags: number): void {
  const mapPos = { x: center.x - centerOn.x * scale, y: center.y - centerOn.y * scale };
  for (let y = 0; y < map.Size.y; y++) {
    for (let i = 0; i < scale; i++) {
      for (let x = 0; x < map.Size.x; x++) {
        const tile = MapGetTile(map, { x, y })!;
        if (tile.Class.Pic == null || !(tile.isVisited || (flags & AUTOMAP_FLAGS_SHOWALL))) continue;
        let color: Color = colorTransparent;
        switch (tile.Class.Type) {
          case TILE_CLASS_WALL: color = colorWall; break;
          case TILE_CLASS_DOOR: color = KeyColor(MapGetDoorKeycardFlag(map, { x, y })); break;
          case TILE_CLASS_FLOOR: color = tile.Class.IsRoom ? colorRoom : colorFloor; break;
          default: break;
        }
        if (ColorEquals(color, colorTransparent)) continue;
        const c = flags & AUTOMAP_FLAGS_MASK ? { ...color, a: MASK_ALPHA } : color;
        for (let j = 0; j < scale; j++) DrawPoint({ x: mapPos.x + x * scale + j, y: mapPos.y + y * scale + i }, c);
      }
    }
  }
  if (flags & AUTOMAP_FLAGS_MASK) {
    DrawRectangle({ x: center.x - Math.trunc(size.x / 2), y: center.y - Math.trunc(size.y / 2) }, size, { r: 255, g: 255, b: 255, a: 128 }, false);
  }
}
function DrawObjectivesAndKeys(map: GameMap, pos: Vec2i, scale: number, flags: number): void {
  for (let y = 0; y < map.Size.y; y++) {
    for (let x = 0; x < map.Size.x; x++) {
      const tile = MapGetTile(map, { x, y })!;
      for (const tid of tile.things) {
        const t = ThingIdGetThing(tid);
        if (t.flags & THING_OBJECTIVE) {
          const obj = ObjectiveFromThing(t.flags);
          const o = gMission.missionData!.Objectives[obj];
          if (!(o.Flags & OBJECTIVE_HIDDEN) || (flags & AUTOMAP_FLAGS_SHOWALL)) {
            if ((o.Flags & OBJECTIVE_POSKNOWN) || tile.isVisited || (flags & AUTOMAP_FLAGS_SHOWALL)) {
              const tp = Vec2ToTile(t.Pos);
              const p = { x: pos.x + tp.x * scale, y: pos.y + tp.y * scale };
              const color = flags & AUTOMAP_FLAGS_MASK ? { ...o.color, a: MASK_ALPHA } : o.color;
              if (scale >= 2) DrawCross(p, color);
              else DrawPoint(p, color);
            }
          }
        } else if (t.kind === KIND_PICKUP && tile.isVisited) {
          const keyFlags = PickupClassGetKeys(gPickups[t.id].class);
          if (keyFlags !== 0) {
            const tp = Vec2ToTile(t.Pos);
            DrawRectangle({ x: pos.x + tp.x * scale, y: pos.y + tp.y * scale }, { x: scale, y: scale }, KeyColor(keyFlags), false);
          }
        }
      }
    }
  }
}
function DisplayExits(map: GameMap, pos: Vec2i, scale: number, flags: number): void {
  for (const e of map.exits) {
    if (e.Hidden) continue;
    const c = flags & AUTOMAP_FLAGS_MASK ? { ...colorExit, a: MASK_ALPHA } : colorExit;
    DrawRectangle({ x: e.R.Pos.x * scale + pos.x, y: e.R.Pos.y * scale + pos.y }, { x: e.R.Size.x * scale, y: e.R.Size.y * scale }, c, false);
  }
}
export function AutomapDraw(flags: number, showExit: boolean): void {
  const mapCenter = { x: Math.trunc(gGfx.w / 2), y: Math.trunc(gGfx.h / 2) };
  const centerOn = { x: Math.trunc(gMap.Size.x / 2), y: Math.trunc(gMap.Size.y / 2) };
  let mapScale = 2;
  if (gMap.Size.x * mapScale > gGfx.w || gMap.Size.y * mapScale > gGfx.h) mapScale--;
  const pos = { x: mapCenter.x - centerOn.x * mapScale, y: mapCenter.y - centerOn.y * mapScale };
  DrawRectangle({ x: 0, y: 0 }, { x: gGfx.w, y: gGfx.h }, { r: 0, g: 128, b: 0, a: 128 }, true);
  DrawAutomapMap(gMap, mapCenter, centerOn, gMap.Size, mapScale, flags);
  DrawObjectivesAndKeys(gMap, pos, mapScale, flags);
  for (const p of gPlayerDatas) if (IsPlayerAlive(p)) DisplayPlayer(ActorGetByUID(p.ActorUID)!, pos, mapScale);
  if (showExit) DisplayExits(gMap, pos, mapScale, flags);
  let y = gGfx.h - 5 - FontH();
  for (const o of gMission.missionData!.Objectives) {
    if (!(ObjectiveIsRequired(o) || o.done > 0)) continue;
    let textColor = colorWhite;
    let p = { x: 5, y };
    DrawRectangle({ x: p.x, y: p.y + 3 }, { x: 2, y: 2 }, o.color, false);
    p.x += 5;
    if (!ObjectiveIsRequired(o)) textColor = colorPurple;
    else if (ObjectiveIsComplete(o)) textColor = colorRed;
    p = FontStrMask(o.Description, p, textColor);
    p.x += 5;
    FontStrMask(`(${o.done})`, p, textColor);
    y -= FontH() + 1;
  }
}
export function AutomapDrawRegion(map: GameMap, posIn: Vec2i, size: Vec2i, mapCenter: Vec2i, flags: number, showExit: boolean): void {
  const scale = 1;
  const old = gGfx.clip;
  gGfx.setClip({ Pos: posIn, Size: size });
  const pos = { x: posIn.x + Math.trunc(size.x / 2), y: posIn.y + Math.trunc(size.y / 2) };
  DrawAutomapMap(map, pos, mapCenter, size, scale, flags);
  const centerOn = { x: pos.x - mapCenter.x * scale, y: pos.y - mapCenter.y * scale };
  for (const p of gPlayerDatas) if (IsPlayerAlive(p)) DisplayPlayer(ActorGetByUID(p.ActorUID)!, centerOn, scale);
  DrawObjectivesAndKeys(gMap, centerOn, scale, flags);
  if (showExit) DisplayExits(map, centerOn, scale, flags);
  gGfx.clip = old;
}

// --- hud ---------------------------------------------------------------------------------------------------------

const HUDFLAGS_PLACE_RIGHT = 1;
const HUDFLAGS_PLACE_BOTTOM = 2;
const HUDFLAGS_HALF_SCREEN = 4;
const HUDFLAGS_QUARTER_SCREEN = 8;
const HUDFLAGS_SHARE_SCREEN = 16;
const SCORE_WIDTH = 26;
const GRENADES_WIDTH = 30;
const AMMO_WIDTH = 27;
const GUN_ICON_WIDTH = 14;
const PLAYER_ICON_WIDTH = 20;
const BAR_HEIGHT = 13;
const GUN_CHANGE_FLASH_MS = 500;
const FLASH_PERIOD_MS = 100;
const MAX_GRENADE_ICONS = 5;

export interface HUDPlayer {
  health: number; waitHealth: number; waitMs: number;
  gunWc: WeaponClass | null; gunChangeMs: number;
  grenadeWc: WeaponClass | null; grenadeAmount: number; grenadeChangeMs: number;
}
function newHUDPlayer(): HUDPlayer {
  return { health: 0, waitHealth: 0, waitMs: 0, gunWc: null, gunChangeMs: 0, grenadeWc: null, grenadeAmount: 0, grenadeChangeMs: 0 };
}
function hudPlayers(c: Camera): HUDPlayer[] {
  if (c.HUD.playersState.length === 0) c.HUD.playersState = [newHUDPlayer(), newHUDPlayer(), newHUDPlayer(), newHUDPlayer()];
  return c.HUD.playersState as HUDPlayer[];
}
function GetHUDActor(p: { ActorUID: number } | null): TActor | null {
  if (!IsPlayerAlive(p as never)) return null;
  let a = ActorGetByUID(p!.ActorUID);
  if (a != null && a.vehicleUID !== -1) a = ActorGetByUID(a.vehicleUID);
  return a;
}
/** HUDUpdate's per-player part (player_hud.c HUDPlayerUpdate, health_gauge.c HealthGaugeUpdate) */
export function HUDPlayersUpdate(c: Camera, ms: number): void {
  const hp = hudPlayers(c);
  for (let i = 0; i < c.HUD.DrawData.NumScreens; i++) {
    const a = GetHUDActor(c.HUD.DrawData.Players[i]);
    if (a == null) continue;
    const h = hp[i];
    if (h.health === 0) {
      h.health = a.health;
      h.waitHealth = a.health;
    }
    h.waitMs = MAX(0, h.waitMs - ms);
    if (h.waitHealth !== a.health) {
      h.waitHealth = a.health;
      h.waitMs = 1000;
    } else if (h.waitMs === 0 && h.health !== a.health) {
      h.health += Math.sign(a.health - h.health);
    }
    const gunWc = ACTOR_GET_GUN(a).Gun;
    if (h.gunWc == null) h.gunWc = gunWc;
    h.gunChangeMs = MAX(0, h.gunChangeMs - ms);
    if (h.gunWc !== gunWc) {
      h.gunWc = gunWc;
      h.gunChangeMs = GUN_CHANGE_FLASH_MS;
    }
    const grenadeWc = ACTOR_GET_GRENADE(a).Gun;
    const grenadeAmount = ActorWeaponGetAmmo(a, grenadeWc, 0);
    if (h.grenadeWc == null) {
      h.grenadeWc = grenadeWc;
      h.grenadeAmount = grenadeAmount;
    }
    h.grenadeChangeMs = MAX(0, h.grenadeChangeMs - ms);
    if (h.grenadeWc !== grenadeWc || h.grenadeAmount !== grenadeAmount) {
      h.grenadeWc = grenadeWc;
      h.grenadeAmount = grenadeAmount;
      h.grenadeChangeMs = GUN_CHANGE_FLASH_MS;
    }
  }
}
function pic(name: string): Pic {
  return PicManagerGetPic(gPicManager, name)!;
}
function HUDDrawGauge(pos: Vec2i, width: number, backColor: Color): void {
  Draw9Slice(pic('hud/gauge_back'), { Pos: pos, Size: { x: width, y: 10 } }, 0, 3, 0, 4, false, backColor, FLIP_NONE);
}
function HUDDrawGaugeInner(pos: Vec2i, width: number, barColor: Color): void {
  Draw9Slice(pic('hud/gauge_inner'), { Pos: pos, Size: { x: width, y: 10 } }, 0, 3, 0, 4, false, barColor, FLIP_NONE);
}
function PlayerHUDGetScorePos(flags: number, r: { Pos: Vec2i; Size: Vec2i }): FontOpts {
  const o = FontOptsNew();
  o.Area = { ...r.Size };
  o.Pad = { x: 2, y: 2 };
  o.HAlign = ALIGN_END;
  if (flags & HUDFLAGS_PLACE_RIGHT) o.HAlign = ALIGN_START;
  if (flags & HUDFLAGS_PLACE_BOTTOM) {
    o.VAlign = ALIGN_END;
    o.Pad.y += 1;
  }
  return o;
}
function DrawNumUpdate(p: { Timer: number; TimerMax: number; Amount: number }, opts: FontOpts): void {
  if (p.Timer <= 0 || p.Amount === 0) return;
  const color = p.Amount > 0 ? { ...colorGreen } : { ...colorRed };
  let timer = p.TimerMax - p.Timer;
  if (timer < 100) {
    opts.Pad.y -= Math.trunc((timer * 5) / 100);
  } else if (timer < 200) {
    timer = 100 - (timer - 100);
    opts.Pad.y -= Math.trunc((timer * 5) / 100);
  } else {
    color.a = CLAMP(Math.trunc((p.Timer * 255 * 2) / p.TimerMax), 0, 255);
  }
  opts.Mask = color;
  FontStrOpt(`${p.Amount > 0 ? '+' : ''}${p.Amount}`, { x: 0, y: 0 }, opts);
}
function DrawPlayerStatus(c: Camera, data: import('../core/types.ts').PlayerData, a: TActor | null, flags: number, h: HUDPlayer, r: { Pos: Vec2i; Size: Vec2i }): void {
  const W = gGfx.w;
  const H = gGfx.h;
  const mask = data.Char.Colors.Body;
  let flip = FLIP_NONE;
  if (flags & HUDFLAGS_PLACE_RIGHT) flip |= FLIP_HORIZONTAL;
  if (flags & HUDFLAGS_PLACE_BOTTOM) flip |= FLIP_VERTICAL;
  // DrawPlayerIcon
  const framePic = pic('hud/player_frame');
  const underlay = pic('hud/player_frame_underlay');
  const picPos = { x: flags & HUDFLAGS_PLACE_RIGHT ? W - framePic.size.x : 0, y: flags & HUDFLAGS_PLACE_BOTTOM ? H - framePic.size.y : 0 };
  PicRender(underlay, picPos, colorWhite, 0, { x: 1, y: 1 }, flip);
  if (a) {
    const pics = GetCharacterPicsFromActor(a);
    pics.ShadowMask = { ...colorTransparent };
    const pos = { x: Math.trunc(framePic.size.x / 2), y: Math.trunc(framePic.size.y / 2) };
    if (flags & HUDFLAGS_PLACE_RIGHT) pos.x = W - pos.x + 4;
    if (flags & HUDFLAGS_PLACE_BOTTOM) pos.y = H - pos.y + 2;
    DrawActorPics(pics, { x: pos.x - 2, y: pos.y + 10 }, { Pos: { x: -12, y: -12 }, Size: { x: 12, y: 5 } });
  }
  PicRender(framePic, picPos, mask, 0, { x: 1, y: 1 }, flip);
  const backBar = pic('hud/back_bar');
  const barPos = { x: 22, y: 0 };
  if (flags & HUDFLAGS_PLACE_RIGHT) barPos.x = r.Pos.x;
  if (flags & HUDFLAGS_PLACE_BOTTOM) barPos.y = H - backBar.size.y;
  Draw9Slice(backBar, { Pos: barPos, Size: { x: r.Size.x - 22, y: BAR_HEIGHT } }, 0, 0, 0, 0, true, mask, flip);
  const opts = FontOptsNew();
  if (flags & HUDFLAGS_PLACE_RIGHT) opts.HAlign = ALIGN_END;
  if (flags & HUDFLAGS_PLACE_BOTTOM) opts.VAlign = ALIGN_END;
  opts.Area = { x: W, y: H };
  // DrawScore
  const backPos = { x: r.Size.x - SCORE_WIDTH, y: 1 };
  if (flags & HUDFLAGS_PLACE_RIGHT) backPos.x = r.Pos.x;
  if (flags & HUDFLAGS_PLACE_BOTTOM) backPos.y = H - BAR_HEIGHT + backPos.y;
  HUDDrawGauge(backPos, SCORE_WIDTH, mask);
  if (a) {
    const s = IsScoreNeeded(gCampaign.Entry.Mode) ? (gCampaign.Setting.Ammo ? `$${data.Stats.Score}` : `${data.Stats.Score}`) : '';
    FontStrOpt(s, r.Pos, PlayerHUDGetScorePos(flags, r));
  }
  // DrawGrenadeStatus
  if (a) {
    const wc = ACTOR_GET_GRENADE(a).Gun;
    if (wc) {
      const pos = { x: r.Size.x - (GRENADES_WIDTH + SCORE_WIDTH), y: 1 };
      if (flags & HUDFLAGS_PLACE_RIGHT) pos.x = r.Pos.x + SCORE_WIDTH;
      if (flags & HUDFLAGS_PLACE_BOTTOM) pos.y = H - BAR_HEIGHT + pos.y;
      const useAmmo = gCampaign.Setting.Ammo && wc.Normal.AmmoId >= 0;
      const amount = useAmmo ? ActorWeaponGetAmmo(a, wc, 0) : -1;
      const gm = h.grenadeChangeMs > 0 && h.grenadeChangeMs % FLASH_PERIOD_MS < FLASH_PERIOD_MS / 2 ? colorDarkGray : colorWhite;
      const dx = Math.trunc(GRENADES_WIDTH / MAX_GRENADE_ICONS);
      const n = useAmmo && amount > 0 && amount <= MAX_GRENADE_ICONS ? amount : 1;
      for (let i = 0; i < n; i++) PicRender(wc.Icon, { x: pos.x + i * dx, y: pos.y }, gm);
      if (!(useAmmo && amount > 0 && amount <= MAX_GRENADE_ICONS)) {
        const o = FontOptsNew();
        o.HAlign = ALIGN_END;
        FontStrOpt(amount >= 0 ? ` x ${amount}` : ' x 99', { x: pos.x + GRENADES_WIDTH - 5, y: pos.y + 1 }, o);
      }
    }
  }
  // DrawWeaponStatus
  {
    const backPic = pic('hud/gauge_small_back');
    const pos = { x: r.Size.x - (AMMO_WIDTH + SCORE_WIDTH + GRENADES_WIDTH), y: 2 };
    if (flags & HUDFLAGS_PLACE_RIGHT) pos.x = r.Pos.x + SCORE_WIDTH + GRENADES_WIDTH;
    if (flags & HUDFLAGS_PLACE_BOTTOM) pos.y = H - BAR_HEIGHT + pos.y;
    Draw9Slice(backPic, { Pos: pos, Size: { x: AMMO_WIDTH - 1, y: backPic.size.y } }, 0, 2, 0, 4, false, mask, FLIP_NONE);
    const weapon = a ? ACTOR_GET_WEAPON(a) : null;
    if (a && weapon && weapon.Gun) {
      const wc = WeaponClassGetBarrel(weapon.Gun, 0);
      if (gCampaign.Setting.Ammo && wc.Normal.AmmoId >= 0) {
        const ammo = AmmoGetById(wc.Normal.AmmoId)!;
        const amount = ActorWeaponGetAmmo(a, wc, 0);
        const o = FontOptsNew();
        o.Area = { x: W, y: H };
        o.Pad = { x: pos.x + Math.trunc(AMMO_WIDTH / 2), y: pos.y };
        if (amount > 0) {
          const fillPic = pic('hud/gauge_small_inner');
          const ammoMax = ammo.Max ? ammo.Max : amount;
          Draw9Slice(fillPic, { Pos: pos, Size: { x: MAX(1, Math.trunc(((AMMO_WIDTH - 1) * amount) / ammoMax)), y: fillPic.size.y } }, 1, 1, 1, 1, false, colorBlue, FLIP_NONE);
        }
        const fps = ConfigGetInt('Game.FPS');
        if (amount === 0) {
          const pp = Math.trunc(fps / 4);
          if (gMission.time % pp < Math.trunc(pp / 2)) o.Mask = { ...colorRed };
        } else if (AmmoIsLow(ammo, amount)) {
          const pp = Math.trunc(fps / 2);
          if (gMission.time % pp < Math.trunc(pp / 2)) o.Mask = { ...colorOrange };
        }
        FontStrOpt(`${amount}`, { x: 0, y: 0 }, o);
      }
      for (let i = 0; i < WeaponClassNumBarrels(weapon.Gun); i++) {
        if (weapon.barrels[i].lock > 0) {
          const maxLock = weapon.Gun.Lock;
          PicRender(pic('hud/gauge_small_ball'), { x: pos.x + MAX(0, Math.trunc(((AMMO_WIDTH - 6) * (maxLock - weapon.barrels[i].lock)) / maxLock)), y: pos.y + 1 }, colorWhite);
        }
      }
    }
  }
  // DrawGunIcons
  if (a) {
    const wc = ACTOR_GET_WEAPON(a).Gun;
    if (wc) {
      const pos = { x: r.Size.x - (GUN_ICON_WIDTH + AMMO_WIDTH + SCORE_WIDTH + GRENADES_WIDTH), y: 0 };
      if (flags & HUDFLAGS_PLACE_RIGHT) pos.x = r.Pos.x + AMMO_WIDTH + SCORE_WIDTH + GRENADES_WIDTH;
      if (flags & HUDFLAGS_PLACE_BOTTOM) pos.y = H - BAR_HEIGHT + pos.y;
      const ammoId = WC_BARREL(wc, 'AmmoId', 0);
      if (gCampaign.Setting.Ammo && ammoId >= 0) CPicDraw(AmmoGetById(ammoId)!.Pic, { x: pos.x + 6, y: pos.y + 5 }, null);
      PicRender(wc.Icon, pos, h.gunChangeMs > 0 && h.gunChangeMs % FLASH_PERIOD_MS < FLASH_PERIOD_MS / 2 ? colorDarkGray : colorWhite);
    }
  }
  // DrawLives
  {
    const offset = { x: 2, y: 5 };
    const dp = { x: PLAYER_ICON_WIDTH + 4 + offset.x, y: 11 + offset.y };
    const xStep = (opts.HAlign === ALIGN_START ? 1 : -1) * 8;
    if (opts.HAlign === ALIGN_END) dp.x = W - dp.x - offset.x;
    if (opts.VAlign === ALIGN_END) dp.y = H - dp.y - 1;
    for (let i = 0; i < data.Lives; i++) {
      DrawHead(data.Char, DIRECTION_DOWN, dp);
      dp.x += xStep;
    }
  }
  // DrawHealth
  {
    const right = SCORE_WIDTH + GRENADES_WIDTH + AMMO_WIDTH + GUN_ICON_WIDTH;
    const width = r.Size.x - right - PLAYER_ICON_WIDTH;
    const backPos2 = { x: PLAYER_ICON_WIDTH + 1, y: 1 };
    const o = FontOptsNew();
    o.HAlign = ALIGN_END;
    if (flags & HUDFLAGS_PLACE_RIGHT) {
      backPos2.x = r.Pos.x + right;
      o.HAlign = ALIGN_START;
    }
    if (flags & HUDFLAGS_PLACE_BOTTOM) backPos2.y = H - 10 - 1;
    HealthGaugeDraw(h, a, backPos2, width, o, mask);
  }
  opts.Pad = { x: 23, y: 2 };
  if (flags & HUDFLAGS_PLACE_BOTTOM) opts.Pad.y += 1;
  const name = a != null && a.pilotUID !== a.uid ? `${data.name} (${ActorGetCharacter(a).Class!.Name})` : data.name;
  FontStrOpt(name, { x: 0, y: 0 }, opts);
  if (ConfigGetBool('Interface.ShowHUDMap') && !(flags & HUDFLAGS_SHARE_SCREEN) && IsAutoMapEnabled(gCampaign.Entry.Mode) && a) {
    const pos = { x: 0, y: 0 };
    if (flags & HUDFLAGS_HALF_SCREEN) {
      pos.y = AUTOMAP_PADDING;
      pos.x = flags & HUDFLAGS_PLACE_RIGHT ? Math.trunc(W / 2) + AUTOMAP_PADDING : Math.trunc(W / 2) - AUTOMAP_SIZE - AUTOMAP_PADDING;
    } else if (flags & HUDFLAGS_QUARTER_SCREEN) {
      pos.x = flags & HUDFLAGS_PLACE_RIGHT ? Math.trunc(W / 2) + AUTOMAP_PADDING : Math.trunc(W / 2) - AUTOMAP_SIZE - AUTOMAP_PADDING;
      pos.y = flags & HUDFLAGS_PLACE_BOTTOM ? H - AUTOMAP_SIZE - AUTOMAP_PADDING : AUTOMAP_PADDING;
    } else {
      pos.x = flags & HUDFLAGS_PLACE_RIGHT ? AUTOMAP_PADDING : W - AUTOMAP_SIZE - AUTOMAP_PADDING;
      pos.y = flags & HUDFLAGS_PLACE_BOTTOM ? H - AUTOMAP_SIZE - AUTOMAP_PADDING : AUTOMAP_PADDING;
    }
    if (pos.x !== 0 || pos.y !== 0) {
      AutomapDrawRegion(gMap, pos, { x: AUTOMAP_SIZE, y: AUTOMAP_SIZE }, Vec2ToTile(a.thing.Pos), AUTOMAP_FLAGS_MASK, c.HUD.showExit);
    }
  }
}
function HealthGaugeDraw(h: HUDPlayer, actor: TActor | null, pos: Vec2i, width: number, opts: FontOpts, mask: Color): void {
  HUDDrawGauge(pos, width, mask);
  if (actor == null) return;
  const hsv = { h: 0.0, s: 1.0, v: 1.0 };
  const maxHealth = ActorGetMaxHeal(actor, false);
  const health = MIN(actor.health, maxHealth);
  if (actor.poisoned) {
    hsv.h = 120.0;
    hsv.v = 0.5;
  } else {
    hsv.h = (50.0 * health) / maxHealth;
  }
  if (h.waitMs > 0 && h.waitMs % FLASH_PERIOD_MS < FLASH_PERIOD_MS / 2) {
    hsv.s = 0.0;
    hsv.v = 1.0;
  }
  if (h.health !== health) {
    const higher = MIN(MAX(h.health, health), maxHealth);
    const c = h.health > health ? { ...colorMaroon } : { ...colorGreen };
    c.a = opts.Mask.a;
    HUDDrawGaugeInner(pos, MAX(1, Math.trunc((width * higher) / maxHealth)), c);
  }
  const lower = MIN(h.health, health);
  const bar = ColorTint(colorWhite, hsv);
  bar.a = opts.Mask.a;
  HUDDrawGaugeInner(pos, MAX(1, Math.trunc((width * lower) / maxHealth)), bar);
  if (actor.health > maxHealth) {
    const over = actor.health - maxHealth;
    const range = MAX(ActorGetMaxHeal(actor, true) - maxHealth, over);
    hsv.h = 120.0;
    hsv.v = 1.0;
    const c = ColorTint(colorWhite, hsv);
    c.a = opts.Mask.a;
    HUDDrawGaugeInner(pos, MAX(1, Math.trunc((width * over) / range)), c);
  }
  const f = { ...opts, Area: { x: width, y: 11 }, Pad: { x: 2, y: 1 }, Mask: { ...opts.Mask } };
  if (ActorIsLowHealth(actor)) {
    const pp = Math.trunc(ConfigGetInt('Game.FPS') / 4);
    if (gMission.time % pp < Math.trunc(pp / 2)) f.Mask = { ...colorRed };
  }
  FontStrOpt(`${actor.health}`, pos, f);
}
function DrawCompassArrow(r: { Pos: Vec2i; Size: Vec2i }, pos: Vec2, playerPos: Vec2, mask: Color, label: string | null): void {
  const cv = { x: f32(pos.x - f32(playerPos.x - TILE_WIDTH / 2)), y: f32(pos.y - playerPos.y) };
  if (Math.abs(cv.x) < r.Size.x && Math.abs(cv.y) < r.Size.y) return;
  const xDist = Math.trunc(Math.abs(cv.x)) - Math.trunc(r.Size.x / 2);
  const yDist = Math.trunc(Math.abs(cv.y)) - Math.trunc(r.Size.y / 2);
  const lDist = xDist > yDist ? xDist : yDist;
  const tinted = ColorTint(mask, { h: -1.0, s: 1.0, v: 2.0 - (1.5 * MIN(lDist, 350)) / 350 });
  let textPos = { x: 0, y: 0 };
  let drawPos = { x: 0, y: 0 };
  const p = pic('hud/arrow');
  let draw = false;
  if (cv.x !== 0) {
    const sx = r.Size.x / 2.0 / cv.x;
    const yInt = Math.floor(Math.abs(sx) * cv.y + 0.5);
    if (yInt >= -Math.trunc(r.Size.y / 2) && yInt <= Math.trunc(r.Size.y / 2)) {
      draw = true;
      if (cv.x > 0) {
        textPos = { x: r.Pos.x + r.Size.x, y: r.Pos.y + Math.trunc(r.Size.y / 2) + yInt };
        drawPos = { x: textPos.x - p.size.x, y: textPos.y - Math.trunc(p.size.y / 2) };
      } else {
        textPos = { x: r.Pos.x, y: r.Pos.y + Math.trunc(r.Size.y / 2) + yInt };
        drawPos = { x: textPos.x, y: textPos.y - Math.trunc(p.size.y / 2) };
      }
    }
  }
  if (!draw && cv.y !== 0) {
    const sy = r.Size.y / 2.0 / cv.y;
    const xInt = Math.floor(Math.abs(sy) * cv.x + 0.5);
    if (xInt >= -Math.trunc(r.Size.x / 2) && xInt <= Math.trunc(r.Size.x / 2)) {
      draw = true;
      if (cv.y > 0) {
        textPos = { x: r.Pos.x + Math.trunc(r.Size.x / 2) + xInt, y: r.Pos.y + r.Size.y };
        drawPos = { x: textPos.x - Math.trunc(p.size.x / 2), y: textPos.y - p.size.y };
      } else {
        textPos = { x: r.Pos.x + Math.trunc(r.Size.x / 2) + xInt, y: r.Pos.y };
        drawPos = { x: textPos.x - Math.trunc(p.size.x / 2), y: textPos.y };
      }
    }
  }
  if (!draw) return;
  PicRender(p, drawPos, tinted, f32(svec2_angle(cv) + MPI_2));
  if (label && label.length > 0) {
    const ts = FontStrSize(label);
    textPos.x -= Math.trunc(ts.x / 2);
    textPos.y -= Math.trunc(ts.y / 2);
    textPos.x = MIN(MAX(textPos.x, r.Pos.x + 8), r.Pos.x + r.Size.x - ts.x - 8);
    textPos.y = MIN(MAX(textPos.y, r.Pos.y + 8), r.Pos.y + r.Size.y - ts.y - 8);
    FontStrMask(label, textPos, tinted);
  }
}
function DrawPlayerObjectiveCompass(c: Camera, a: TActor | null, idx: number, numViews: number): void {
  if (a == null) return;
  const r = { Pos: { x: Math.trunc(gGfx.w / 4), y: Math.trunc(gGfx.h / 4) }, Size: { x: Math.trunc(gGfx.w / 2), y: Math.trunc(gGfx.h / 2) } };
  if (idx & 1) r.Pos.x = r.Size.x;
  if (idx >= 2) r.Pos.y = r.Size.y;
  if (numViews === 2) r.Size.x = Math.trunc(r.Size.x / 2);
  else if (numViews === 3 || numViews === 4) {
    r.Size.x = Math.trunc(r.Size.x / 2);
    r.Size.y = Math.trunc(r.Size.y / 2);
  }
  if (c.HUD.showExit) {
    gMap.exits.forEach((e, i) => {
      if (!e.Hidden) DrawCompassArrow(r, MapGetExitPos(gMap, i), a.Pos, colorGreen, 'Exit');
    });
  }
  for (let y = 0; y < gMap.Size.y; y++) {
    for (let x = 0; x < gMap.Size.x; x++) {
      const tile = MapGetTile(gMap, { x, y })!;
      for (const tid of tile.things) {
        const ti = ThingIdGetThing(tid);
        if (!(ti.flags & THING_OBJECTIVE)) continue;
        const o = gMission.missionData!.Objectives[ObjectiveFromThing(ti.flags)];
        if (o.Flags & OBJECTIVE_HIDDEN) continue;
        if (!(o.Flags & OBJECTIVE_POSKNOWN) && !tile.isVisited) continue;
        DrawCompassArrow(r, ti.Pos, a.Pos, o.color, null);
      }
    }
  }
}
export function HUDDraw(c: Camera, numViews: number, paused: boolean): void {
  const hud = c.HUD;
  const W = gGfx.w;
  const H = gGfx.h;
  if (ConfigGetBool('Graphics.ShowHUD')) {
    // DrawPlayerAreas
    let flags = 0;
    const r = { Pos: { x: 0, y: 0 }, Size: { x: W, y: H } };
    const n = hud.DrawData.NumScreens;
    if (n === 2) r.Size.x = Math.trunc(r.Size.x / 2);
    else if (n === 3 || n === 4) {
      r.Size.x = Math.trunc(r.Size.x / 2);
      r.Size.y = Math.trunc(r.Size.y / 2);
    }
    if (n > 1 && ConfigGetEnum('Interface.Splitscreen') === SPLITSCREEN_NEVER) flags |= HUDFLAGS_SHARE_SCREEN;
    else if (n === 2) flags |= HUDFLAGS_HALF_SCREEN;
    else if (n === 3 || n === 4) flags |= HUDFLAGS_QUARTER_SCREEN;
    const hp = hudPlayers(c);
    for (let i = 0; i < n; i++) {
      const p = hud.DrawData.Players[i]!;
      let df = flags;
      r.Pos = { x: 0, y: 0 };
      if (i & 1) {
        r.Pos.x = r.Size.x;
        df |= HUDFLAGS_PLACE_RIGHT;
      }
      if (i >= 2) {
        r.Pos.y = r.Size.y;
        df |= HUDFLAGS_PLACE_BOTTOM;
      }
      const a = GetHUDActor(p);
      DrawPlayerStatus(c, p, a, df, hp[i], r);
      const sp = hud.score[i];
      if (IsScoreNeeded(gCampaign.Entry.Mode) && sp && sp.Amount !== 0 && IsPlayerAlive(PlayerDataGetByUID(sp.PlayerUID))) {
        DrawNumUpdate(sp, PlayerHUDGetScorePos(df, r));
      }
      DrawPlayerObjectiveCompass(c, a, i, numViews);
    }
    if (ConfigGetBool('Interface.ShowHUDMap') && (flags & HUDFLAGS_SHARE_SCREEN) && IsAutoMapEnabled(gCampaign.Entry.Mode)) {
      AutomapDrawRegion(gMap, { x: Math.trunc(W / 2) - Math.trunc(AUTOMAP_SIZE / 2), y: AUTOMAP_PADDING },
        { x: AUTOMAP_SIZE, y: AUTOMAP_SIZE }, Vec2ToTile(PlayersGetMidpoint()), AUTOMAP_FLAGS_MASK, hud.showExit);
    }
    // DrawDeathmatchScores
    if (gCampaign.Entry.Mode === GAME_MODE_DEATHMATCH && hud.DrawData.NumScreens === 1 && GetNumPlayers(PLAYER_ANY, false, false) > 1) {
      const o = FontOptsNew();
      o.Area = { x: W, y: H };
      o.HAlign = ALIGN_END;
      o.Mask = { ...colorPurple };
      let y = 5;
      o.Pad.x = 45;
      FontStrOpt('Player', { x: 0, y }, o);
      o.Pad.x = 25;
      FontStrOpt('Lives', { x: 0, y }, o);
      o.Pad.x = 5;
      FontStrOpt('Kills', { x: 0, y }, o);
      y += FontH();
      let maxLives = 0;
      let maxKills = 0;
      for (const p of gPlayerDatas) {
        maxLives = MAX(maxLives, p.Lives);
        maxKills = MAX(maxKills, p.Stats.Kills);
      }
      for (const p of gPlayerDatas) {
        o.Mask = p.Lives > 0 ? { ...colorWhite } : { ...colorRed };
        o.Pad.x = 45;
        FontStrOpt(p.name, { x: 0, y }, o);
        o.Mask = p.Lives === maxLives ? { ...colorCyan } : { ...colorWhite };
        o.Pad.x = 25;
        FontStrOpt(`${p.Lives}`, { x: 0, y }, o);
        o.Mask = p.Stats.Kills === maxKills ? { ...colorCyan } : { ...colorWhite };
        o.Pad.x = 5;
        FontStrOpt(`${p.Stats.Kills}`, { x: 0, y }, o);
        y += FontH();
      }
    }
    // DrawHUDMessage
    if (hud.messageTicks > 0 || hud.messageTicks === -1) {
      const tint = ColorTint(colorCyan, { h: -1.0, s: 1.0, v: Pulse256(gMission.time) / 256.0 });
      FontStrMask(hud.message, { x: Math.trunc((W - FontStrW(hud.message)) / 2), y: AUTOMAP_SIZE + AUTOMAP_PADDING + AUTOMAP_PADDING }, tint);
    }
    if (ConfigGetBool('Interface.ShowFPS')) FontStr(`FPS: ${hud.fps}`, { x: 10, y: H - 10 - FontH() });
    if (ConfigGetBool('Interface.ShowTime')) {
      const d = new Date();
      FontStr(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`, { x: 10, y: H - 10 - 2 * FontH() });
    }
    // DrawKeycards
    let xOffset = -30;
    for (let i = 0; i < 4; i++) {
      if (gMission.KeyFlags & (1 << i)) {
        const kc = KeyPickupClass(gMission.missionData!.KeyStyle, i);
        if (kc) CPicDraw(kc.Pic, { x: Math.trunc((W - 8) / 2) - xOffset, y: 20 }, null);
      }
      xOffset += 20;
    }
    // DrawMissionTime
    const secs = Math.trunc(gMission.time / FPS_FRAMELIMIT);
    const to = FontOptsNew();
    to.HAlign = ALIGN_CENTER;
    to.Area = { x: W, y: H };
    to.Pad.y = AUTOMAP_PADDING;
    FontStrOpt(`${Math.trunc(secs / 60)}:${String(secs % 60).padStart(2, '0')}`, { x: 0, y: 0 }, to);
    if (HasObjectives(gCampaign.Entry.Mode)) {
      let x = 45;
      const y = H - 22;
      gMission.missionData!.Objectives.forEach((o, i) => {
        if (!ObjectiveIsRequired(o)) return;
        DrawRectangle({ x, y: y + 3 }, { x: 2, y: 2 }, o.color, false);
        x += 5;
        const left = o.Required - o.done;
        const s = left > 0 ? (!(o.Flags & OBJECTIVE_UNKNOWNCOUNT) ? `${ObjectiveTypeStr(o.Type)}: ${left}` : `${ObjectiveTypeStr(o.Type)}: ?`) : 'Done';
        FontStr(s, { x, y });
        const op = hud.objective[i];
        if (op) {
          const oo = FontOptsNew();
          oo.Area = { x: W, y: H };
          oo.Pad = { x: x + FontStrW(s) - 8, y };
          DrawNumUpdate(op, oo);
        }
        x += 40;
      });
    }
  }
  if (!paused) {
    const alive = GetNumPlayers(PLAYER_ALIVE_OR_DYING, false, false);
    switch (gMission.state) {
      case MISSION_STATE_WAITING:
        FontStrCenter('Waiting for players...');
        break;
      case MISSION_STATE_PLAY:
        if (alive === 0 && AreAllPlayersDeadAndNoLives()) {
          if (gPlayerDatas.length === 0) FontStrCenter('Waiting for players...');
          else if (!IsPVP(gCampaign.Entry.Mode)) FontStrCenter('Game Over!');
          else FontStrCenter('All Kill!');
        } else if (MissionNeedsMoreRescuesInExit(gMission)) {
          FontStrCenter('More rescues needed');
        }
        break;
      case MISSION_STATE_PICKUP: {
        const timeLeft = gMission.pickupTime + PICKUP_LIMIT - gMission.time;
        FontStrCenter(`Pickup in ${Math.trunc((timeLeft + (FPS_FRAMELIMIT - 1)) / FPS_FRAMELIMIT)} seconds\n`);
        break;
      }
      default:
        break;
    }
  }
}
export { DrawLine, svec2i, PicManagerGetSprites, Vec2iToTile as _v2t, colorDarkGray as _cdg, DirectionOpposite as _do };

hudHooks.update = HUDPlayersUpdate;
