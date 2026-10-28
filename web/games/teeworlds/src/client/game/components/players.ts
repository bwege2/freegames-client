// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/client/components/players.h and players.cpp of Teeworlds 0.7.5 in TypeScript.
import { vec2, f, mix, clamp, length, angle, normalize, distance, direction, pi, sinf, ImageTex, v4 } from './common.ts';
import * as C from '../../../generated/content.ts';
import * as P from '../../../generated/protocol.ts';
import { MAX_CLIENTS, SERVER_TICK_SPEED } from '../../../engine/shared/protocol.ts';
import { TIME_FREQ } from '../../../engine/shared/network.ts';
import { CQuadItem } from '../../engine/graphics.ts';
import { SNAP_CURRENT, SNAP_PREV, STATE_ONLINE } from '../../engine/client.ts';
import { CAnimState, CTeeRenderInfo, SPRITE_FLAG_FLIP_Y } from '../render.ts';
import { CComponent } from '../component.ts';
import { CHN_WORLD } from './sounds.ts';

const vmix = (a: vec2, b: vec2, t: number): vec2 => new vec2(mix(a.x, b.x, t), mix(a.y, b.y, t));
const frem = (a: number, b: number): number => a % b;

export class CPlayers extends CComponent {
  private m_aRenderInfo: CTeeRenderInfo[] = Array.from({ length: MAX_CLIENTS }, () => new CTeeRenderInfo());
  private s_LastGameTickTime: number | null = null;
  private s_LastIntraTick: number | null = null;
  private s_LastIteXNinja: number | null = null;
  private s_LastIteXGun: number | null = null;
  private SkidSoundTime = 0;

  private paused(): boolean {
    const gd = this.m_pClient.m_Snap.m_pGameData;
    return !!gd && (gd.m_GameStateFlags & P.GAMESTATEFLAG_PAUSED) !== 0;
  }
  private usePredicted(ClientID: number): boolean {
    const gc = this.m_pClient, S = gc.m_Snap;
    if (gc.m_LocalClientID !== ClientID || !this.Config().m_ClPredict) return false;
    return !(!S.m_pLocalCharacter || (S.m_pGameData && S.m_pGameData.m_GameStateFlags & (P.GAMESTATEFLAG_PAUSED | P.GAMESTATEFLAG_ROUNDOVER | P.GAMESTATEFLAG_GAMEOVER)));
  }

  private RenderHook(pPrevChar: P.CNetObj_Character, pPlayerChar: P.CNetObj_Character, ClientID: number): void {
    const gc = this.m_pClient, Cl = this.Client(), G = this.Graphics();
    const Prev = { ...pPrevChar }, Player = { ...pPlayerChar };
    const RenderInfo = this.m_aRenderInfo[ClientID].copy();
    let IntraTick = Cl.IntraGameTick();
    RenderInfo.m_Size = 64;
    if (this.usePredicted(ClientID)) {
      gc.m_PredictedChar.Write(Player);
      gc.m_PredictedPrevChar.Write(Prev);
      IntraTick = Cl.PredIntraGameTick();
    }
    const Position = vmix(new vec2(Prev.m_X, Prev.m_Y), new vec2(Player.m_X, Player.m_Y), IntraTick);
    if (Prev.m_HookState > 0 && Player.m_HookState > 0) {
      G.TextureSet(ImageTex(C.IMAGE_GAME));
      G.QuadsBegin();
      const Pos = Position;
      let HookPos: vec2;
      if (pPlayerChar.m_HookedPlayer !== -1) {
        if (gc.m_LocalClientID !== -1 && pPlayerChar.m_HookedPlayer === gc.m_LocalClientID)
          HookPos = vmix(gc.m_PredictedPrevChar.m_Pos, gc.m_PredictedChar.m_Pos, Cl.PredIntraGameTick());
        else if (gc.m_LocalClientID === ClientID) {
          const h = gc.m_Snap.m_aCharacters[pPlayerChar.m_HookedPlayer];
          HookPos = vmix(new vec2(h.m_Prev.m_X, h.m_Prev.m_Y), new vec2(h.m_Cur.m_X, h.m_Cur.m_Y), Cl.IntraGameTick());
        } else HookPos = vmix(new vec2(pPrevChar.m_HookX, pPrevChar.m_HookY), new vec2(pPlayerChar.m_HookX, pPlayerChar.m_HookY), Cl.IntraGameTick());
      } else HookPos = vmix(new vec2(Prev.m_HookX, Prev.m_HookY), new vec2(Player.m_HookX, Player.m_HookY), IntraTick);
      const d = distance(Pos, HookPos);
      const Dir = normalize(Pos.sub(HookPos));
      G.QuadsSetRotation(angle(Dir) + pi);
      this.RenderTools().SelectSprite(C.SPRITE_HOOK_HEAD);
      G.QuadsDraw([new CQuadItem(HookPos.x, HookPos.y, 24, 16)], 1);
      this.RenderTools().SelectSprite(C.SPRITE_HOOK_CHAIN);
      const Array: CQuadItem[] = [];
      for (let fl = 16; fl < d && Array.length < 1024; fl += 16) {
        const p = HookPos.add(Dir.mul(fl));
        Array.push(new CQuadItem(p.x, p.y, 16, 16));
      }
      G.QuadsDraw(Array, Array.length);
      G.QuadsSetRotation(0);
      G.QuadsEnd();
      this.RenderTools().RenderTeeHand(RenderInfo, Position, normalize(HookPos.sub(Pos)), -pi / 2, new vec2(20, 0));
    }
  }

  private RenderPlayer(pPrevChar: P.CNetObj_Character, pPlayerChar: P.CNetObj_Character, pPlayerInfo: P.CNetObj_PlayerInfo, ClientID: number): void {
    const gc = this.m_pClient, Cl = this.Client(), G = this.Graphics(), RT = this.RenderTools();
    const Prev = { ...pPrevChar }, Player = { ...pPlayerChar };
    const RenderInfo = this.m_aRenderInfo[ClientID].copy();
    RenderInfo.m_Size = 64;
    let IntraTick = Cl.IntraGameTick();
    if (Prev.m_Angle < pi * -128 && Player.m_Angle > pi * 128) Prev.m_Angle = Math.trunc(Prev.m_Angle + 2 * pi * 256);
    else if (Prev.m_Angle > pi * 128 && Player.m_Angle < pi * -128) Player.m_Angle = Math.trunc(Player.m_Angle + 2 * pi * 256);
    let Angle = f(mix(Prev.m_Angle, Player.m_Angle, IntraTick) / 256);
    if (gc.m_LocalClientID === ClientID) Angle = angle(gc.m_pControls.m_MousePos);
    if (this.usePredicted(ClientID)) {
      gc.m_PredictedChar.Write(Player);
      gc.m_PredictedPrevChar.Write(Prev);
      IntraTick = Cl.PredIntraGameTick();
    }
    const Direction = direction(Angle);
    const Position = vmix(new vec2(Prev.m_X, Prev.m_Y), new vec2(Player.m_X, Player.m_Y), IntraTick);
    const Vel = vmix(new vec2(Prev.m_VelX / 256, Prev.m_VelY / 256), new vec2(Player.m_VelX / 256, Player.m_VelY / 256), IntraTick);
    gc.m_pFlow.Add(Position, Vel.mul(100), 10);
    RenderInfo.m_GotAirJump = Player.m_Jumped & 2 ? 0 : 1;
    const Stationary = Player.m_VelX <= 1 && Player.m_VelX >= -1;
    const InAir = !this.Collision().CheckPoint(Player.m_X, Player.m_Y + 16);
    const WantOtherDir = (Player.m_Direction === -1 && Vel.x > 0) || (Player.m_Direction === 1 && Vel.x < 0);
    const WalkTimeMagic = 100;
    const WalkTime = (Position.x >= 0 ? frem(Position.x, WalkTimeMagic) : WalkTimeMagic - frem(-Position.x, WalkTimeMagic)) / WalkTimeMagic;
    const State = new CAnimState();
    const A = C.g_pData.m_aAnimations;
    State.Set(A[C.ANIM_BASE], 0);
    if (InAir) State.Add(A[C.ANIM_INAIR], 0, 1);
    else if (Stationary) State.Add(A[C.ANIM_IDLE], 0, 1);
    else if (!WantOtherDir) State.Add(A[C.ANIM_WALK], WalkTime, 1);
    if (this.s_LastGameTickTime === null) this.s_LastGameTickTime = Cl.GameTickTime();
    if (gc.m_Snap.m_pGameData && !this.paused()) this.s_LastGameTickTime = Cl.GameTickTime();
    if (Player.m_Weapon === P.WEAPON_HAMMER) {
      const ct = (Cl.PrevGameTick() - Player.m_AttackTick) / SERVER_TICK_SPEED + this.s_LastGameTickTime;
      State.Add(A[C.ANIM_HAMMER_SWING], clamp(ct * 5, 0, 1), 1);
    }
    if (Player.m_Weapon === P.WEAPON_NINJA) {
      const ct = (Cl.PrevGameTick() - Player.m_AttackTick) / SERVER_TICK_SPEED + this.s_LastGameTickTime;
      State.Add(A[C.ANIM_NINJA_SWING], clamp(ct * 2, 0, 1), 1);
    }
    if (!InAir && WantOtherDir && length(Vel.mul(50)) > 500) {
      const now = Cl.time_get();
      if (now - this.SkidSoundTime > TIME_FREQ / 10) {
        gc.m_pSounds.PlayAt(CHN_WORLD, P.SOUND_PLAYER_SKID, 0.25, Position);
        this.SkidSoundTime = now;
      }
      gc.m_pEffects.SkidTrail(Position.add(new vec2(-Player.m_Direction * 6, 12)), new vec2(-Player.m_Direction * 100 * length(Vel), -50));
    }
    // draw gun
    {
      G.TextureSet(ImageTex(C.IMAGE_GAME));
      G.QuadsBegin();
      const att = State.GetAttach();
      G.QuadsSetRotation(att.m_Angle * pi * 2 + Angle);
      const iw = clamp(Player.m_Weapon, 0, P.NUM_WEAPONS - 1);
      const W = C.g_pData.m_Weapons.m_aId[iw];
      RT.SelectSprite(W.m_pSpriteBody, Direction.x < 0 ? SPRITE_FLAG_FLIP_Y : 0);
      const Dir = Direction;
      let Recoil = 0;
      let p: vec2;
      const rnd = (): number => Math.floor(Math.random() * 0x7fffffff);
      if (Player.m_Weapon === P.WEAPON_HAMMER) {
        p = Position.add(new vec2(att.m_X, att.m_Y));
        p = p.withY(p.y + W.m_Offsety);
        if (Direction.x < 0) {
          G.QuadsSetRotation(-pi / 2 - att.m_Angle * pi * 2);
          p = p.withX(p.x - W.m_Offsetx);
        } else G.QuadsSetRotation(-pi / 2 + att.m_Angle * pi * 2);
        RT.DrawSprite(p.x, p.y, W.m_VisualSize);
      } else if (Player.m_Weapon === P.WEAPON_NINJA) {
        p = Position.withY(Position.y + W.m_Offsety);
        if (Direction.x < 0) {
          G.QuadsSetRotation(-pi / 2 - att.m_Angle * pi * 2);
          p = p.withX(p.x - W.m_Offsetx);
          gc.m_pEffects.PowerupShine(p.add(new vec2(32, 0)), new vec2(32, 12));
        } else {
          G.QuadsSetRotation(-pi / 2 + att.m_Angle * pi * 2);
          gc.m_pEffects.PowerupShine(p.sub(new vec2(32, 0)), new vec2(32, 12));
        }
        RT.DrawSprite(p.x, p.y, W.m_VisualSize);
        if (Cl.GameTick() - Player.m_AttackTick <= SERVER_TICK_SPEED / 6 && W.m_NumSpriteMuzzles) {
          let IteX = rnd() % W.m_NumSpriteMuzzles;
          if (this.s_LastIteXNinja === null) this.s_LastIteXNinja = IteX;
          if (this.paused()) IteX = this.s_LastIteXNinja;
          else this.s_LastIteXNinja = IteX;
          if (W.m_aSpriteMuzzles[IteX]) {
            const HDir = normalize(new vec2(pPlayerChar.m_X, pPlayerChar.m_Y).sub(new vec2(pPrevChar.m_X, pPrevChar.m_Y)));
            G.QuadsSetRotation(angle(HDir));
            RT.SelectSprite(W.m_aSpriteMuzzles[IteX], 0);
            p = Position.sub(HDir.mul(W.m_Muzzleoffsetx));
            RT.DrawSprite(p.x, p.y, 160);
          }
        }
      } else {
        if (this.s_LastIntraTick === null) this.s_LastIntraTick = IntraTick;
        if (gc.m_Snap.m_pGameData && !this.paused()) this.s_LastIntraTick = IntraTick;
        const a = (Cl.GameTick() - Player.m_AttackTick + this.s_LastIntraTick) / 5;
        if (a < 1) Recoil = sinf(f(a * pi));
        p = Position.add(Dir.mul(W.m_Offsetx)).sub(Dir.mul(Recoil * 10));
        p = p.withY(p.y + W.m_Offsety);
        RT.DrawSprite(p.x, p.y, W.m_VisualSize);
      }
      if ((Player.m_Weapon === P.WEAPON_GUN || Player.m_Weapon === P.WEAPON_SHOTGUN) && W.m_NumSpriteMuzzles) {
        let Alpha = 0;
        const Phase1Tick = Cl.GameTick() - Player.m_AttackTick;
        if (Phase1Tick < W.m_Muzzleduration + 3) {
          const t = (Phase1Tick + IntraTick) / W.m_Muzzleduration;
          Alpha = mix(2, 0, Math.min(1, Math.max(0, t)));
        }
        let IteX = rnd() % W.m_NumSpriteMuzzles;
        if (this.s_LastIteXGun === null) this.s_LastIteXGun = IteX;
        if (this.paused()) IteX = this.s_LastIteXGun;
        else this.s_LastIteXGun = IteX;
        if (Alpha > 0 && W.m_aSpriteMuzzles[IteX]) {
          let OffsetY = -W.m_Muzzleoffsety;
          RT.SelectSprite(W.m_aSpriteMuzzles[IteX], Direction.x < 0 ? SPRITE_FLAG_FLIP_Y : 0);
          if (Direction.x < 0) OffsetY = -OffsetY;
          const DirY = new vec2(-Dir.y, Dir.x);
          const MuzzlePos = p.add(Dir.mul(W.m_Muzzleoffsetx)).add(DirY.mul(OffsetY));
          RT.DrawSprite(MuzzlePos.x, MuzzlePos.y, W.m_VisualSize);
        }
      }
      G.QuadsEnd();
      switch (Player.m_Weapon) {
        case P.WEAPON_GUN: RT.RenderTeeHand(RenderInfo, p, Direction, (-3 * pi) / 4, new vec2(-15, 4)); break;
        case P.WEAPON_SHOTGUN: RT.RenderTeeHand(RenderInfo, p, Direction, -pi / 2, new vec2(-5, 4)); break;
        case P.WEAPON_GRENADE: RT.RenderTeeHand(RenderInfo, p, Direction, -pi / 2, new vec2(-4, 7)); break;
      }
    }
    if (gc.m_LocalClientID === ClientID && this.Config().m_Debug) {
      const GhostPosition = vmix(new vec2(pPrevChar.m_X, pPrevChar.m_Y), new vec2(pPlayerChar.m_X, pPlayerChar.m_Y), Cl.IntraGameTick());
      const Ghost = RenderInfo.copy();
      for (const c of Ghost.m_aColors) c.a *= 0.5;
      RT.RenderTee(State, Ghost, Player.m_Emote, Direction, GhostPosition);
    }
    RT.RenderTee(State, RenderInfo, Player.m_Emote, Direction, Position);
    if (pPlayerInfo.m_PlayerFlags & P.PLAYERFLAG_CHATTING) {
      G.TextureSet(ImageTex(C.IMAGE_EMOTICONS));
      G.QuadsBegin();
      RT.SelectSprite(C.SPRITE_DOTDOT);
      G.QuadsDraw([new CQuadItem(Position.x + 24, Position.y - 40, 64, 64)], 1);
      G.QuadsEnd();
    }
    const cd = gc.m_aClients[ClientID];
    const TS = Cl.GameTickSpeed();
    if (cd.m_EmoticonStart !== -1 && cd.m_EmoticonStart + 2 * TS > Cl.GameTick()) {
      G.TextureSet(ImageTex(C.IMAGE_EMOTICONS));
      G.QuadsBegin();
      const SinceStart = Cl.GameTick() - cd.m_EmoticonStart;
      const FromEnd = cd.m_EmoticonStart + 2 * TS - Cl.GameTick();
      let a = 1, h = 1, Wiggle = 0;
      if (FromEnd < TS / 5) a = FromEnd / (TS / 5);
      if (SinceStart < TS / 10) h = SinceStart / (TS / 10);
      if (SinceStart < TS / 5) Wiggle = SinceStart / (TS / 5);
      G.QuadsSetRotation((pi / 6) * Math.sin(5 * Wiggle));
      G.SetColor(a, a, a, a);
      RT.SelectSprite(C.SPRITE_OOP + cd.m_Emoticon);
      G.QuadsDraw([new CQuadItem(Position.x, Position.y - 23 - 32 * h, 64, 64 * h)], 1);
      G.QuadsEnd();
    }
  }

  override OnRender(): void {
    const gc = this.m_pClient, Cl = this.Client();
    if (Cl.State() < STATE_ONLINE) return;
    const IsTeamplay = (gc.m_GameInfo.m_GameFlags & P.GAMEFLAG_TEAMS) !== 0;
    for (let i = 0; i < MAX_CLIENTS; ++i) {
      this.m_aRenderInfo[i] = gc.m_aClients[i].m_RenderInfo.copy();
      if (gc.m_Snap.m_aCharacters[i].m_Cur.m_Weapon === P.WEAPON_NINJA) {
        const Skin = gc.m_pSkins.Find('x_ninja', true);
        if (Skin !== -1) {
          const pNinja = gc.m_pSkins.Get(Skin);
          for (let p = 0; p < P.NUM_SKINPARTS; p++) {
            const ri = this.m_aRenderInfo[i];
            if (IsTeamplay) {
              ri.m_aTextures[p] = pNinja.m_apParts[p].m_ColorTexture;
              ri.m_aColors[p] = gc.m_pSkins.GetColorV4(gc.m_pSkins.GetTeamColor(1, pNinja.m_aPartColors[p], gc.m_aClients[i].m_Team, p), p === P.SKINPART_MARKING);
            } else if (pNinja.m_aUseCustomColors[p]) {
              ri.m_aTextures[p] = pNinja.m_apParts[p].m_ColorTexture;
              ri.m_aColors[p] = gc.m_pSkins.GetColorV4(pNinja.m_aPartColors[p], p === P.SKINPART_MARKING);
            } else {
              ri.m_aTextures[p] = pNinja.m_apParts[p].m_OrgTexture;
              ri.m_aColors[p] = v4(1, 1, 1, 1);
            }
          }
        }
      }
    }
    for (let p = 0; p < 4; p++) {
      for (let i = 0; i < MAX_CLIENTS; i++) {
        const ch = gc.m_Snap.m_aCharacters[i];
        if (!ch.m_Active) continue;
        const pPrevInfo = Cl.SnapFindItem(SNAP_PREV, P.NETOBJTYPE_PLAYERINFO, i);
        const pInfo = Cl.SnapFindItem(SNAP_CURRENT, P.NETOBJTYPE_PLAYERINFO, i);
        if (!pPrevInfo || !pInfo) continue;
        const Local = gc.m_LocalClientID === i;
        if (p % 2 === 0 && Local) continue;
        if (p % 2 === 1 && !Local) continue;
        if (p < 2) this.RenderHook(ch.m_Prev, ch.m_Cur, i);
        else this.RenderPlayer(ch.m_Prev, ch.m_Cur, P.read_CNetObj_PlayerInfo(pInfo), i);
      }
    }
  }
}
