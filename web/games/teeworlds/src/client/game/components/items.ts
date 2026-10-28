// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/client/components/items.h and items.cpp of Teeworlds 0.7.5 in TypeScript.
import { vec2, f, clamp, length, angle, normalize, pi, cosf, sinf, mix, ImageTex } from './common.ts';
import * as C from '../../../generated/content.ts';
import * as P from '../../../generated/protocol.ts';
import { SERVER_TICK_SPEED } from '../../../engine/shared/protocol.ts';
import { CalcPos } from '../../../game/gamecore.ts';
import { CQuadItem, CFreeformItem } from '../../engine/graphics.ts';
import { SNAP_CURRENT, SNAP_PREV, STATE_ONLINE, type CSnapItem } from '../../engine/client.ts';
import { CComponent } from '../component.ts';

const vmix = (a: vec2, b: vec2, t: number): vec2 => new vec2(mix(a.x, b.x, t), mix(a.y, b.y, t));

export class CItems extends CComponent {
  private s_LastGameTickTime: number | null = null;
  private s_ProjTime = 0;
  private s_ProjLastLocalTime: number | null = null;
  private s_PickupTime = 0;
  private s_PickupLastLocalTime: number | null = null;

  private paused(): boolean {
    const gd = this.m_pClient.m_Snap.m_pGameData;
    return !gd || (gd.m_GameStateFlags & P.GAMESTATEFLAG_PAUSED) !== 0;
  }

  private RenderProjectile(pCurrent: P.CNetObj_Projectile, ItemID: number): void {
    const T = this.m_pClient.m_Tuning;
    let Curvature = 0, Speed = 0;
    if (pCurrent.m_Type === P.WEAPON_GRENADE) {
      Curvature = T.m_GrenadeCurvature;
      Speed = T.m_GrenadeSpeed;
    } else if (pCurrent.m_Type === P.WEAPON_SHOTGUN) {
      Curvature = T.m_ShotgunCurvature;
      Speed = T.m_ShotgunSpeed;
    } else if (pCurrent.m_Type === P.WEAPON_GUN) {
      Curvature = T.m_GunCurvature;
      Speed = T.m_GunSpeed;
    }
    const Cl = this.Client();
    if (this.s_LastGameTickTime === null) this.s_LastGameTickTime = Cl.GameTickTime();
    if (!this.paused()) this.s_LastGameTickTime = Cl.GameTickTime();
    const Ct = f(f((Cl.PrevGameTick() - pCurrent.m_StartTick) / SERVER_TICK_SPEED) + this.s_LastGameTickTime);
    if (Ct < 0) return;
    const StartPos = new vec2(pCurrent.m_X, pCurrent.m_Y);
    const StartVel = new vec2(pCurrent.m_VelX / 100, pCurrent.m_VelY / 100);
    const Pos = CalcPos(StartPos, StartVel, Curvature, Speed, Ct);
    const PrevPos = CalcPos(StartPos, StartVel, Curvature, Speed, f(Ct - 0.001));
    const G = this.Graphics();
    G.TextureSet(ImageTex(C.IMAGE_GAME));
    G.QuadsBegin();
    this.RenderTools().SelectSprite(C.g_pData.m_Weapons.m_aId[clamp(pCurrent.m_Type, 0, P.NUM_WEAPONS - 1)].m_pSpriteProj);
    const Vel = Pos.sub(PrevPos);
    if (pCurrent.m_Type === P.WEAPON_GRENADE) {
      this.m_pClient.m_pEffects.SmokeTrail(Pos, Vel.mul(-1));
      const now = Cl.LocalTime();
      if (this.s_ProjLastLocalTime === null) this.s_ProjLastLocalTime = now;
      if (!this.paused()) this.s_ProjTime += now - this.s_ProjLastLocalTime;
      G.QuadsSetRotation(this.s_ProjTime * pi * 2 * 2 + ItemID);
      this.s_ProjLastLocalTime = now;
    } else {
      this.m_pClient.m_pEffects.BulletTrail(Pos);
      G.QuadsSetRotation(length(Vel) > 0.00001 ? angle(Vel) : 0);
    }
    G.QuadsDraw([new CQuadItem(Pos.x, Pos.y, 32, 32)], 1);
    G.QuadsSetRotation(0);
    G.QuadsEnd();
  }

  private RenderPickup(pPrev: P.CNetObj_Pickup, pCurrent: P.CNetObj_Pickup): void {
    const G = this.Graphics();
    G.TextureSet(ImageTex(C.IMAGE_GAME));
    G.QuadsBegin();
    let Pos = vmix(new vec2(pPrev.m_X, pPrev.m_Y), new vec2(pCurrent.m_X, pCurrent.m_Y), this.Client().IntraGameTick());
    let Size = 64;
    const c = [C.SPRITE_PICKUP_HEALTH, C.SPRITE_PICKUP_ARMOR, C.SPRITE_PICKUP_GRENADE, C.SPRITE_PICKUP_SHOTGUN, C.SPRITE_PICKUP_LASER,
      C.SPRITE_PICKUP_NINJA, C.SPRITE_PICKUP_GUN, C.SPRITE_PICKUP_HAMMER];
    this.RenderTools().SelectSprite(c[pCurrent.m_Type]);
    const W = C.g_pData.m_Weapons.m_aId;
    switch (pCurrent.m_Type) {
      case P.PICKUP_GRENADE: Size = W[P.WEAPON_GRENADE].m_VisualSize; break;
      case P.PICKUP_SHOTGUN: Size = W[P.WEAPON_SHOTGUN].m_VisualSize; break;
      case P.PICKUP_LASER: Size = W[P.WEAPON_LASER].m_VisualSize; break;
      case P.PICKUP_NINJA:
        this.m_pClient.m_pEffects.PowerupShine(Pos, new vec2(96, 18));
        Size *= 2;
        Pos = Pos.withX(Pos.x - 10);
        break;
      case P.PICKUP_GUN: Size = W[P.WEAPON_GUN].m_VisualSize; break;
      case P.PICKUP_HAMMER: Size = W[P.WEAPON_HAMMER].m_VisualSize; break;
    }
    G.QuadsSetRotation(0);
    const now = this.Client().LocalTime();
    if (this.s_PickupLastLocalTime === null) this.s_PickupLastLocalTime = now;
    const Offset = Pos.y / 32 + Pos.x / 32;
    if (!this.paused()) this.s_PickupTime += now - this.s_PickupLastLocalTime;
    const x = Pos.x + cosf(f(this.s_PickupTime * 2 + Offset)) * 2.5, y = Pos.y + sinf(f(this.s_PickupTime * 2 + Offset)) * 2.5;
    this.s_PickupLastLocalTime = now;
    this.RenderTools().DrawSprite(x, y, Size);
    G.QuadsEnd();
  }

  private RenderFlag(pPrev: P.CNetObj_Flag, pCurrent: P.CNetObj_Flag, pPrevGameDataFlag: P.CNetObj_GameDataFlag | null, pCurGameDataFlag: P.CNetObj_GameDataFlag | null): void {
    const Size = 42;
    const G = this.Graphics();
    G.BlendNormal();
    G.TextureSet(ImageTex(C.IMAGE_GAME));
    G.QuadsBegin();
    this.RenderTools().SelectSprite(pCurrent.m_Team === P.TEAM_RED ? C.SPRITE_FLAG_RED : C.SPRITE_FLAG_BLUE);
    G.QuadsSetRotation(0);
    let Pos = vmix(new vec2(pPrev.m_X, pPrev.m_Y), new vec2(pCurrent.m_X, pCurrent.m_Y), this.Client().IntraGameTick());
    if (pCurGameDataFlag) {
      if (pPrevGameDataFlag && ((pCurrent.m_Team === P.TEAM_RED && pPrevGameDataFlag.m_FlagCarrierRed !== pCurGameDataFlag.m_FlagCarrierRed) ||
        (pCurrent.m_Team === P.TEAM_BLUE && pPrevGameDataFlag.m_FlagCarrierBlue !== pCurGameDataFlag.m_FlagCarrierBlue)))
        Pos = new vec2(pCurrent.m_X, pCurrent.m_Y);
      const L = this.m_pClient.m_LocalClientID;
      if (L !== -1 && ((pCurrent.m_Team === P.TEAM_RED && pCurGameDataFlag.m_FlagCarrierRed === L) || (pCurrent.m_Team === P.TEAM_BLUE && pCurGameDataFlag.m_FlagCarrierBlue === L)))
        Pos = this.m_pClient.m_LocalCharacterPos;
    }
    G.QuadsDraw([new CQuadItem(Pos.x, Pos.y - Size * 0.75, Size, Size * 2)], 1);
    G.QuadsEnd();
  }

  private RenderLaser(pCurrent: P.CNetObj_Laser): void {
    const Pos = new vec2(pCurrent.m_X, pCurrent.m_Y), From = new vec2(pCurrent.m_FromX, pCurrent.m_FromY);
    const Dir = normalize(Pos.sub(From));
    const Ticks = this.Client().GameTick() - pCurrent.m_StartTick + this.Client().IntraGameTick();
    const Ms = (Ticks / 50) * 1000;
    const a = clamp(Ms / this.m_pClient.m_Tuning.m_LaserBounceDelay, 0, 1);
    const Ia = 1 - a;
    const G = this.Graphics();
    G.BlendNormal();
    G.TextureClear();
    G.QuadsBegin();
    const Outer = { r: 0.075, g: 0.075, b: 0.25 }, Inner = { r: 0.5, g: 0.5, b: 1 };
    const quad = (w: number): CFreeformItem => {
      const ox = Dir.y * w, oy = -Dir.x * w;
      return new CFreeformItem(From.x - ox, From.y - oy, From.x + ox, From.y + oy, Pos.x - ox, Pos.y - oy, Pos.x + ox, Pos.y + oy);
    };
    G.SetColor(Outer.r, Outer.g, Outer.b, 1);
    G.QuadsDrawFreeform([quad(7 * Ia)], 1);
    G.SetColor(Inner.r, Inner.g, Inner.b, 1);
    G.QuadsDrawFreeform([quad(5 * Ia)], 1);
    G.QuadsEnd();
    G.BlendNormal();
    G.TextureSet(ImageTex(C.IMAGE_PARTICLES));
    G.QuadsBegin();
    const Sprites = [C.SPRITE_PART_SPLAT01, C.SPRITE_PART_SPLAT02, C.SPRITE_PART_SPLAT03];
    this.RenderTools().SelectSprite(Sprites[this.Client().GameTick() % 3]);
    G.QuadsSetRotation(this.Client().GameTick());
    G.SetColor(Outer.r, Outer.g, Outer.b, 1);
    G.QuadsDraw([new CQuadItem(Pos.x, Pos.y, 24, 24)], 1);
    G.SetColor(Inner.r, Inner.g, Inner.b, 1);
    G.QuadsDraw([new CQuadItem(Pos.x, Pos.y, 20, 20)], 1);
    G.QuadsEnd();
    G.BlendNormal();
  }

  override OnRender(): void {
    const Cl = this.Client();
    if (Cl.State() < STATE_ONLINE) return;
    const Num = Cl.SnapNumItems(SNAP_CURRENT);
    const Item: CSnapItem = { m_Type: 0, m_ID: 0, m_DataSize: 0 };
    for (let i = 0; i < Num; i++) {
      const d = Cl.SnapGetItem(SNAP_CURRENT, i, Item);
      if (Item.m_Type === P.NETOBJTYPE_PROJECTILE) this.RenderProjectile(P.read_CNetObj_Projectile(d), Item.m_ID);
      else if (Item.m_Type === P.NETOBJTYPE_PICKUP) {
        const pPrev = Cl.SnapFindItem(SNAP_PREV, Item.m_Type, Item.m_ID);
        if (pPrev) this.RenderPickup(P.read_CNetObj_Pickup(pPrev), P.read_CNetObj_Pickup(d));
      } else if (Item.m_Type === P.NETOBJTYPE_LASER) this.RenderLaser(P.read_CNetObj_Laser(d));
    }
    for (let i = 0; i < Num; i++) {
      const d = Cl.SnapGetItem(SNAP_CURRENT, i, Item);
      if (Item.m_Type !== P.NETOBJTYPE_FLAG) continue;
      const pPrev = Cl.SnapFindItem(SNAP_PREV, Item.m_Type, Item.m_ID);
      if (!pPrev) continue;
      const pg = Cl.SnapFindItem(SNAP_PREV, P.NETOBJTYPE_GAMEDATAFLAG, this.m_pClient.m_Snap.m_GameDataFlagSnapID);
      this.RenderFlag(P.read_CNetObj_Flag(pPrev), P.read_CNetObj_Flag(d), pg ? P.read_CNetObj_GameDataFlag(pg) : null, this.m_pClient.m_Snap.m_pGameDataFlag);
    }
  }
}
