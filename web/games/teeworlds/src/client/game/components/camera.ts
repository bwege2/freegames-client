// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/client/components/camera.h and camera.cpp of Teeworlds 0.7.5 in TypeScript.
import { vec2, length, normalize, distance, rotate, clamp, f } from './common.ts';
import { PLAYERFLAG_DEAD, SPEC_FREEVIEW } from '../../../generated/protocol.ts';
import { CFGFLAG_CLIENT } from '../../../generated/config.ts';
import { STATE_DEMOPLAYBACK, STATE_OFFLINE, STATE_ONLINE } from '../../engine/client.ts';
import { CComponent } from '../component.ts';

export const POS_START = 0, POS_INTERNET = 1, POS_LAN = 2, POS_DEMOS = 3, POS_SETTINGS_GENERAL = 4, POS_SETTINGS_PLAYER = 5, POS_SETTINGS_TEE = 6,
  POS_SETTINGS_CONTROLS = 7, POS_SETTINGS_GRAPHICS = 8, POS_SETTINGS_SOUND = 9, NUM_POS = 10;
const CAMTYPE_UNDEFINED = -1, CAMTYPE_SPEC = 0, CAMTYPE_PLAYER = 1;

export class CCamera extends CComponent {
  private m_Center = new vec2(0, 0);
  private m_MenuCenter = new vec2(0, 0);
  private m_RotationCenter = new vec2(0, 0);
  private m_Zoom = 1;
  private m_CamType = CAMTYPE_UNDEFINED;
  private m_PrevCenter = new vec2(0, 0);
  private m_Positions = [[500, 500], [1000, 1000], [1100, 1000], [1500, 500], [500, 1000], [600, 1000], [700, 1000], [800, 1000], [900, 1000], [1000, 1000]].map(([x, y]) => new vec2(x, y));
  private m_CurrentPosition = -1;
  private m_AnimationStartPos = new vec2(0, 0);
  private m_MoveTime = 0;
  private s_Dir = new vec2(1, 0);

  GetCenter(): vec2 { return this.m_Center; }
  GetZoom(): number { return this.m_Zoom; }

  override OnRender(): void {
    const gc = this.m_pClient, S = gc.m_Snap, ctl = gc.m_pControls;
    if (this.Client().State() === STATE_ONLINE || this.Client().State() === STATE_DEMOPLAYBACK) {
      this.m_Zoom = 1;
      if (S.m_SpecInfo.m_Active && !S.m_SpecInfo.m_UsePosition && (S.m_SpecInfo.m_SpecMode === SPEC_FREEVIEW || (S.m_pLocalInfo && !(S.m_pLocalInfo.m_PlayerFlags & PLAYERFLAG_DEAD)))) {
        if (this.m_CamType !== CAMTYPE_SPEC) {
          ctl.m_MousePos = this.m_PrevCenter;
          ctl.ClampMousePos();
          this.m_CamType = CAMTYPE_SPEC;
        }
        this.m_Center = ctl.m_MousePos;
      } else {
        if (this.m_CamType !== CAMTYPE_PLAYER) {
          ctl.ClampMousePos();
          this.m_CamType = CAMTYPE_PLAYER;
        }
        let CameraOffset = new vec2(0, 0);
        const l = length(ctl.m_MousePos);
        if (this.Config().m_ClDynamicCamera && l > 0.0001) {
          const DeadZone = this.Config().m_ClMouseDeadzone;
          const FollowFactor = f(this.Config().m_ClMouseFollowfactor / 100);
          const OffsetAmount = f(Math.max(f(l - DeadZone), 0) * FollowFactor);
          CameraOffset = normalize(ctl.m_MousePos).mul(OffsetAmount);
        }
        if (S.m_SpecInfo.m_Active) this.m_Center = S.m_SpecInfo.m_Position.add(CameraOffset);
        else this.m_Center = gc.m_LocalCharacterPos.add(CameraOffset);
      }
    } else {
      this.m_Zoom = 0.7;
      const cfg = this.Config();
      if (distance(this.m_Center, this.m_RotationCenter) <= cfg.m_ClRotationRadius + 0.5) {
        const RotPerTick = (360 / cfg.m_ClRotationSpeed) * this.Client().RenderFrameTime();
        this.s_Dir = rotate(this.s_Dir, RotPerTick);
        this.m_Center = this.m_RotationCenter.add(this.s_Dir.mul(cfg.m_ClRotationRadius));
      } else {
        this.s_Dir = normalize(this.m_AnimationStartPos.sub(this.m_RotationCenter));
        const TargetPos = this.m_RotationCenter.add(this.s_Dir.mul(cfg.m_ClRotationRadius));
        const Distance = distance(this.m_AnimationStartPos, TargetPos);
        this.m_MoveTime += (this.Client().RenderFrameTime() * cfg.m_ClCameraSpeed) / 10;
        const XVal = Math.pow(1 - this.m_MoveTime, 7);
        this.m_Center = TargetPos.add(this.s_Dir.mul(XVal * Distance));
      }
    }
    this.m_PrevCenter = this.m_Center;
  }

  ChangePosition(PositionNumber: number): void {
    if (PositionNumber < 0 || PositionNumber > NUM_POS - 1) return;
    this.m_AnimationStartPos = this.m_Center;
    this.m_RotationCenter = this.m_Positions[PositionNumber];
    this.m_CurrentPosition = PositionNumber;
    this.m_MoveTime = 0;
  }
  GetCurrentPosition(): number { return this.m_CurrentPosition; }

  override OnConsoleInit(): void {
    this.Console().Register('set_position', 'iii', CFGFLAG_CLIENT, (r) => {
      const PositionNumber = clamp(r.GetInteger(0), 0, NUM_POS - 1);
      this.m_Positions[PositionNumber] = new vec2(r.GetInteger(1) * 32 + 16, r.GetInteger(2) * 32 + 16);
      if (this.GetCurrentPosition() === PositionNumber) this.ChangePosition(PositionNumber);
    }, this, 'Sets the rotation position');
  }

  override OnStateChange(NewState: number, OldState: number): void {
    if (OldState === STATE_OFFLINE) this.m_MenuCenter = this.m_Center;
    else if (NewState !== STATE_ONLINE && this.Client().State() !== STATE_DEMOPLAYBACK) this.m_Center = this.m_MenuCenter;
  }
}
