// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/client/components/particles.h and particles.cpp of Teeworlds 0.7.5 in TypeScript.
import { vec2, mix, f, ImageTex, type vec4 } from './common.ts';
import { IMAGE_PARTICLES } from '../../../generated/content.ts';
import { GAMESTATEFLAG_PAUSED } from '../../../generated/protocol.ts';
import { TIME_FREQ } from '../../../engine/shared/network.ts';
import { CQuadItem } from '../../engine/graphics.ts';
import { STATE_ONLINE } from '../../engine/client.ts';
import { CComponent } from '../component.ts';

export class CParticle {
  m_Pos = new vec2(0, 0);
  m_Vel = new vec2(0, 0);
  m_Spr = 0;
  m_FlowAffected = 1;
  m_LifeSpan = 0;
  m_StartSize = 32;
  m_EndSize = 32;
  m_Rot = 0;
  m_Rotspeed = 0;
  m_Gravity = 0;
  m_Friction = 0;
  m_Color: vec4 = { r: 1, g: 1, b: 1, a: 1 };
  m_Life = 0;
  m_PrevPart = 0;
  m_NextPart = 0;
  SetDefault(): void {
    this.m_Vel = new vec2(0, 0);
    this.m_LifeSpan = 0;
    this.m_StartSize = 32;
    this.m_EndSize = 32;
    this.m_Rot = 0;
    this.m_Rotspeed = 0;
    this.m_Gravity = 0;
    this.m_Friction = 0;
    this.m_FlowAffected = 1;
    this.m_Color = { r: 1, g: 1, b: 1, a: 1 };
  }
}

export const GROUP_PROJECTILE_TRAIL = 0, GROUP_EXPLOSIONS = 1, GROUP_GENERAL = 2, NUM_GROUPS = 3;
const MAX_PARTICLES = 1024 * 8;

class CRenderGroup extends CComponent {
  m_pParts: CParticles;
  private group: number;
  constructor(p: CParticles, g: number) {
    super();
    this.m_pParts = p;
    this.group = g;
  }
  override OnRender(): void { this.m_pParts.RenderGroup(this.group); }
}

export class CParticles extends CComponent {
  private m_aParticles: CParticle[] = Array.from({ length: MAX_PARTICLES }, () => new CParticle());
  private m_FirstFree = 0;
  private m_aFirstPart = [-1, -1, -1];
  private FrictionFraction = 0;
  private s_LastTime = 0;
  m_RenderTrail = new CRenderGroup(this, GROUP_PROJECTILE_TRAIL);
  m_RenderExplosions = new CRenderGroup(this, GROUP_EXPLOSIONS);
  m_RenderGeneral = new CRenderGroup(this, GROUP_GENERAL);

  constructor() {
    super();
    this.OnReset();
  }

  override OnReset(): void {
    for (let i = 0; i < MAX_PARTICLES; i++) {
      this.m_aParticles[i].m_PrevPart = i - 1;
      this.m_aParticles[i].m_NextPart = i + 1;
    }
    this.m_aParticles[0].m_PrevPart = 0;
    this.m_aParticles[MAX_PARTICLES - 1].m_NextPart = -1;
    this.m_FirstFree = 0;
    this.m_aFirstPart = [-1, -1, -1];
  }

  Add(Group: number, pPart: CParticle): void {
    const gd = this.m_pClient.m_Snap.m_pGameData;
    if (gd && gd.m_GameStateFlags & GAMESTATEFLAG_PAUSED) return;
    if (this.m_FirstFree === -1) return;
    const Id = this.m_FirstFree;
    this.m_FirstFree = this.m_aParticles[Id].m_NextPart;
    if (this.m_FirstFree !== -1) this.m_aParticles[this.m_FirstFree].m_PrevPart = -1;
    const p = Object.assign(new CParticle(), pPart);
    p.m_Color = { ...pPart.m_Color };
    this.m_aParticles[Id] = p;
    p.m_PrevPart = -1;
    p.m_NextPart = this.m_aFirstPart[Group];
    if (this.m_aFirstPart[Group] !== -1) this.m_aParticles[this.m_aFirstPart[Group]].m_PrevPart = Id;
    this.m_aFirstPart[Group] = Id;
    p.m_Life = 0;
  }

  private Update(TimePassed: number): void {
    this.FrictionFraction += TimePassed;
    if (this.FrictionFraction > 2) this.FrictionFraction = 0;
    let FrictionCount = 0;
    while (this.FrictionFraction > 0.05) {
      FrictionCount++;
      this.FrictionFraction -= 0.05;
    }
    const a = this.m_aParticles;
    for (let g = 0; g < NUM_GROUPS; g++) {
      let i = this.m_aFirstPart[g];
      while (i !== -1) {
        const p = a[i];
        const Next = p.m_NextPart;
        p.m_Vel = p.m_Vel.withY(p.m_Vel.y + p.m_Gravity * TimePassed);
        for (let k = 0; k < FrictionCount; k++) p.m_Vel = p.m_Vel.mul(p.m_Friction);
        const s = { pos: p.m_Pos, vel: p.m_Vel.mul(TimePassed) };
        this.Collision().MovePoint(s, f(0.1 + 0.9 * Math.random()));
        p.m_Pos = s.pos;
        p.m_Vel = s.vel.mul(1 / TimePassed);
        p.m_Life += TimePassed;
        p.m_Rot += TimePassed * p.m_Rotspeed;
        if (p.m_Life > p.m_LifeSpan) {
          if (p.m_PrevPart !== -1) a[p.m_PrevPart].m_NextPart = p.m_NextPart;
          else this.m_aFirstPart[g] = p.m_NextPart;
          if (p.m_NextPart !== -1) a[p.m_NextPart].m_PrevPart = p.m_PrevPart;
          if (this.m_FirstFree !== -1) a[this.m_FirstFree].m_PrevPart = i;
          p.m_PrevPart = -1;
          p.m_NextPart = this.m_FirstFree;
          this.m_FirstFree = i;
        }
        i = Next;
      }
    }
  }

  override OnRender(): void {
    if (this.Client().State() < STATE_ONLINE) return;
    const Now = this.Client().time_get();
    const gd = this.m_pClient.m_Snap.m_pGameData;
    if (gd && !(gd.m_GameStateFlags & GAMESTATEFLAG_PAUSED)) this.Update((Now - this.s_LastTime) / TIME_FREQ);
    this.s_LastTime = Now;
  }

  RenderGroup(Group: number): void {
    const G = this.Graphics();
    G.BlendNormal();
    G.TextureSet(ImageTex(IMAGE_PARTICLES));
    G.QuadsBegin();
    let i = this.m_aFirstPart[Group];
    while (i !== -1) {
      const p = this.m_aParticles[i];
      this.RenderTools().SelectSprite(p.m_Spr);
      const a = p.m_Life / p.m_LifeSpan;
      const Size = mix(p.m_StartSize, p.m_EndSize, a);
      G.QuadsSetRotation(p.m_Rot);
      G.SetColor(p.m_Color.r, p.m_Color.g, p.m_Color.b, p.m_Color.a);
      G.QuadsDraw([new CQuadItem(p.m_Pos.x, p.m_Pos.y, Size, Size)], 1);
      i = p.m_NextPart;
    }
    G.QuadsEnd();
    G.BlendNormal();
  }
}
