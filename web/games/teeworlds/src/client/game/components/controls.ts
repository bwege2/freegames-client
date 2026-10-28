// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/client/components/controls.h and controls.cpp of Teeworlds 0.7.5 in TypeScript. While the
// pointer is not locked (Pointer Lock), the aim follows the system cursor: the mouse position is the cursor's
// offset from the middle of the screen in world units (the camera's centre is the tee's position).
import { vec2, f, length, normalize, clamp, toInt, sinf, cosf } from './common.ts';
import * as P from '../../../generated/protocol.ts';
import { CFGFLAG_CLIENT } from '../../../generated/config.ts';
import { TIME_FREQ } from '../../../engine/shared/network.ts';
import { emptyInput } from '../../../game/gamecore.ts';
import { CRenderTools } from '../render.ts';
import { CComponent } from '../component.ts';
import type { CNetMsg } from '../gameclient.ts';

export class CControls extends CComponent {
  m_MousePos = new vec2(0, 0);
  m_TargetPos = new vec2(0, 0);
  m_InputData: P.CNetObj_PlayerInput = emptyInput();
  m_LastData: P.CNetObj_PlayerInput = emptyInput();
  m_InputDirectionLeft = 0;
  m_InputDirectionRight = 0;
  private LastSendTime = 0;

  override OnReset(): void {
    this.m_LastData.m_Direction = 0;
    this.m_LastData.m_Hook = 0;
    if ((this.m_LastData.m_Fire & 1) !== 0) this.m_LastData.m_Fire++;
    this.m_LastData.m_Fire &= P.INPUT_STATE_MASK;
    this.m_LastData.m_Jump = 0;
    this.m_InputData = { ...this.m_LastData };
    this.m_InputDirectionLeft = 0;
    this.m_InputDirectionRight = 0;
  }
  override OnRelease(): void { this.OnReset(); }

  OnPlayerDeath(): void {
    const r = this.m_pClient.m_Snap.m_pGameDataRace;
    if (!r || !(r.m_RaceFlags & P.RACEFLAG_KEEP_WANTED_WEAPON)) this.m_LastData.m_WantedWeapon = this.m_InputData.m_WantedWeapon = 0;
  }

  override OnConsoleInit(): void {
    const C = this.Console();
    const counter = (v: number, s: number): number => {
      if ((v & 1) !== s) v++;
      return v & P.INPUT_STATE_MASK;
    };
    C.Register('+left', '', CFGFLAG_CLIENT, (r) => { this.m_InputDirectionLeft = r.GetInteger(0); }, this, 'Move left');
    C.Register('+right', '', CFGFLAG_CLIENT, (r) => { this.m_InputDirectionRight = r.GetInteger(0); }, this, 'Move right');
    C.Register('+jump', '', CFGFLAG_CLIENT, (r) => { this.m_InputData.m_Jump = r.GetInteger(0); }, this, 'Jump');
    C.Register('+hook', '', CFGFLAG_CLIENT, (r) => { this.m_InputData.m_Hook = r.GetInteger(0); }, this, 'Hook');
    C.Register('+fire', '', CFGFLAG_CLIENT, (r) => { this.m_InputData.m_Fire = counter(this.m_InputData.m_Fire, r.GetInteger(0)); }, this, 'Fire');
    const names = ['hammer', 'gun', 'shotgun', 'grenade', 'laser'];
    for (let w = 1; w <= 5; w++) C.Register(`+weapon${w}`, '', CFGFLAG_CLIENT, (r) => { if (r.GetInteger(0)) this.m_InputData.m_WantedWeapon = w; }, this, `Switch to ${names[w - 1]}`);
    C.Register('+nextweapon', '', CFGFLAG_CLIENT, (r) => {
      this.m_InputData.m_NextWeapon = counter(this.m_InputData.m_NextWeapon, r.GetInteger(0));
      this.m_InputData.m_WantedWeapon = 0;
    }, this, 'Switch to next weapon');
    C.Register('+prevweapon', '', CFGFLAG_CLIENT, (r) => {
      this.m_InputData.m_PrevWeapon = counter(this.m_InputData.m_PrevWeapon, r.GetInteger(0));
      this.m_InputData.m_WantedWeapon = 0;
    }, this, 'Switch to previous weapon');
  }

  override OnMessage(Msg: number, pRawMsg: CNetMsg): void {
    if (Msg === P.NETMSGTYPE_SV_WEAPONPICKUP) {
      const pMsg = pRawMsg as P.CNetMsg_Sv_WeaponPickup;
      if (this.Config().m_ClAutoswitchWeapons) this.m_InputData.m_WantedWeapon = pMsg.m_Weapon + 1;
    }
  }

  SnapInput(pData: Int32Array): number {
    const gc = this.m_pClient;
    let Send = false;
    const now = this.Client().time_get();
    this.m_InputData.m_PlayerFlags = gc.m_pChat.IsActive() ? P.PLAYERFLAG_CHATTING : 0;
    if (gc.m_pScoreboard.IsActive()) this.m_InputData.m_PlayerFlags |= P.PLAYERFLAG_SCOREBOARD;
    if (this.m_LastData.m_PlayerFlags !== this.m_InputData.m_PlayerFlags) Send = true;
    this.m_LastData.m_PlayerFlags = this.m_InputData.m_PlayerFlags;
    if (gc.m_pChat.IsActive() || gc.m_pMenus.IsActive()) {
      this.OnReset();
      P.write_CNetObj_PlayerInput(this.m_InputData, pData);
      if (now > this.LastSendTime + TIME_FREQ) Send = true;
    } else {
      this.m_InputData.m_TargetX = toInt(this.m_MousePos.x);
      this.m_InputData.m_TargetY = toInt(this.m_MousePos.y);
      if (!this.m_InputData.m_TargetX && !this.m_InputData.m_TargetY) {
        this.m_InputData.m_TargetX = 1;
        this.m_MousePos = this.m_MousePos.withX(1);
      }
      this.m_InputData.m_Direction = 0;
      if (this.m_InputDirectionLeft && !this.m_InputDirectionRight) this.m_InputData.m_Direction = -1;
      if (!this.m_InputDirectionLeft && this.m_InputDirectionRight) this.m_InputData.m_Direction = 1;
      if (this.Config().m_DbgStress) {
        const t = this.Client().LocalTime();
        this.m_InputData = emptyInput();
        this.m_InputData.m_Direction = (Math.trunc(Math.trunc(t) / 2) % 3) - 1;
        this.m_InputData.m_Jump = Math.trunc(t) & 1;
        this.m_InputData.m_Fire = Math.trunc(t * 10);
        this.m_InputData.m_Hook = Math.trunc(t * 2) & 1;
        this.m_InputData.m_WantedWeapon = Math.trunc(t) % P.NUM_WEAPONS;
        this.m_InputData.m_TargetX = Math.trunc(sinf(f(t * 3)) * 100);
        this.m_InputData.m_TargetY = Math.trunc(cosf(f(t * 3)) * 100);
      }
      const i = this.m_InputData, l = this.m_LastData;
      if (i.m_Direction !== l.m_Direction) Send = true;
      else if (i.m_Jump !== l.m_Jump) Send = true;
      else if (i.m_Fire !== l.m_Fire) Send = true;
      else if (i.m_Hook !== l.m_Hook) Send = true;
      else if (i.m_WantedWeapon !== l.m_WantedWeapon) Send = true;
      else if (i.m_NextWeapon !== l.m_NextWeapon) Send = true;
      else if (i.m_PrevWeapon !== l.m_PrevWeapon) Send = true;
      if (now > this.LastSendTime + TIME_FREQ / 25) Send = true;
    }
    this.m_LastData = { ...this.m_InputData };
    if (!Send) return 0;
    this.LastSendTime = now;
    P.write_CNetObj_PlayerInput(this.m_InputData, pData);
    return P.CNetObj_PlayerInput_SIZE * 4;
  }

  /** the aim from the system cursor while the pointer is not locked (a deviation, see the file's notice) */
  private AbsoluteAim(): void {
    const In = this.Input(), gc = this.m_pClient;
    if (In.locked() || !In.Grabbed() || gc.m_pMenus.IsActive() || gc.m_pChat.IsActive() || gc.m_Snap.m_SpecInfo.m_Active) return;
    const G = this.Graphics();
    const p = In.AbsolutePos();
    if (p.x <= 0 && p.y <= 0) return;
    const { w, h } = CRenderTools.CalcScreenParams(1150 * 1000, 1500, 1050, G.ScreenAspect());
    this.m_MousePos = new vec2((p.x / G.ScreenWidth() - 0.5) * w, (p.y / G.ScreenHeight() - 0.5) * h);
  }

  override OnRender(): void {
    this.AbsoluteAim();
    this.ClampMousePos();
    const S = this.m_pClient.m_Snap;
    if (S.m_pGameData && !S.m_SpecInfo.m_Active) this.m_TargetPos = this.m_pClient.m_LocalCharacterPos.add(this.m_MousePos);
    else if (S.m_SpecInfo.m_Active && S.m_SpecInfo.m_UsePosition) this.m_TargetPos = S.m_SpecInfo.m_Position.add(this.m_MousePos);
    else this.m_TargetPos = this.m_MousePos;
  }

  override OnMouseMove(x: number, y: number): boolean {
    const S = this.m_pClient.m_Snap;
    if ((S.m_pGameData && S.m_pGameData.m_GameStateFlags & (P.GAMESTATEFLAG_PAUSED | P.GAMESTATEFLAG_ROUNDOVER | P.GAMESTATEFLAG_GAMEOVER)) ||
      (S.m_SpecInfo.m_Active && this.m_pClient.m_pChat.IsActive()))
      return false;
    this.m_MousePos = this.m_MousePos.add(new vec2(x, y));
    return true;
  }

  ClampMousePos(): void {
    const S = this.m_pClient.m_Snap;
    if (S.m_SpecInfo.m_Active && !S.m_SpecInfo.m_UsePosition) {
      this.m_MousePos = new vec2(clamp(this.m_MousePos.x, 200, f(this.Collision().GetWidth() * 32 - 200)), clamp(this.m_MousePos.y, 200, f(this.Collision().GetHeight() * 32 - 200)));
    } else {
      let MouseMax: number;
      if (this.Config().m_ClDynamicCamera) {
        const CameraMaxDistance = 200;
        const FollowFactor = f(this.Config().m_ClMouseFollowfactor / 100);
        MouseMax = Math.min(f(f(CameraMaxDistance / FollowFactor) + this.Config().m_ClMouseDeadzone), this.Config().m_ClMouseMaxDistanceDynamic);
      } else MouseMax = this.Config().m_ClMouseMaxDistanceStatic;
      if (length(this.m_MousePos) > MouseMax) this.m_MousePos = normalize(this.m_MousePos).mul(f(MouseMax));
    }
  }
}
