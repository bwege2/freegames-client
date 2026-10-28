// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/client/components/effects.h and effects.cpp of Teeworlds 0.7.5 in TypeScript.
import { vec2, normalize, length, mix, direction, pi, powf, f, type vec3 } from './common.ts';
import * as C from '../../../generated/content.ts';
import * as P from '../../../generated/protocol.ts';
import { TIME_FREQ } from '../../../engine/shared/network.ts';
import { CComponent } from '../component.ts';
import { CParticle, GROUP_EXPLOSIONS, GROUP_GENERAL, GROUP_PROJECTILE_TRAIL } from './particles.ts';
import { CHN_WORLD } from './sounds.ts';

const frandom = (): number => Math.random();
const RandomDir = (): vec2 => normalize(new vec2(frandom() - 0.5, frandom() - 0.5));

export class CEffects extends CComponent {
  private m_Add50hz = false;
  private m_Add100hz = false;
  private m_DamageTaken = 0;
  private m_DamageTakenTick = 0;
  private LastUpdate100hz = 0;
  private LastUpdate50hz = 0;

  private add(g: number, p: CParticle): void { this.m_pClient.m_pParticles.Add(g, p); }

  AirJump(Pos: vec2): void {
    const p = new CParticle();
    p.SetDefault();
    p.m_Spr = C.SPRITE_PART_AIRJUMP;
    p.m_Pos = Pos.add(new vec2(-6, 16));
    p.m_Vel = new vec2(0, -200);
    p.m_LifeSpan = 0.5;
    p.m_StartSize = 48;
    p.m_EndSize = 0;
    p.m_Rot = frandom() * pi * 2;
    p.m_Rotspeed = pi * 2;
    p.m_Gravity = 500;
    p.m_Friction = 0.7;
    p.m_FlowAffected = 0;
    this.add(GROUP_GENERAL, p);
    p.m_Pos = Pos.add(new vec2(6, 16));
    this.add(GROUP_GENERAL, p);
    this.m_pClient.m_pSounds.PlayAt(CHN_WORLD, P.SOUND_PLAYER_AIRJUMP, 1, Pos);
  }

  DamageIndicator(Pos: vec2, Amount: number): void {
    if (Amount === 0) return;
    this.m_DamageTaken++;
    let Angle: number;
    if (this.Client().LocalTime() < this.m_DamageTakenTick + 0.5) Angle = this.m_DamageTaken * 0.25;
    else {
      this.m_DamageTaken = 0;
      Angle = 0;
    }
    const a = (3 * pi) / 2 + Angle, s = a - pi / 3, e = a + pi / 3;
    for (let i = 0; i < Amount; i++) this.m_pClient.m_pDamageind.Create(new vec2(Pos.x, Pos.y), direction(f(mix(s, e, (i + 1) / (Amount + 2)))));
    this.m_DamageTakenTick = this.Client().LocalTime();
  }

  PowerupShine(Pos: vec2, size: vec2): void {
    if (!this.m_Add50hz) return;
    const p = new CParticle();
    p.SetDefault();
    p.m_Spr = C.SPRITE_PART_SLICE;
    p.m_Pos = Pos.add(new vec2((frandom() - 0.5) * size.x, (frandom() - 0.5) * size.y));
    p.m_Vel = new vec2(0, 0);
    p.m_LifeSpan = 0.5;
    p.m_StartSize = 16;
    p.m_EndSize = 0;
    p.m_Rot = frandom() * pi * 2;
    p.m_Rotspeed = pi * 2;
    p.m_Gravity = 500;
    p.m_Friction = 0.9;
    p.m_FlowAffected = 0;
    this.add(GROUP_GENERAL, p);
  }

  SmokeTrail(Pos: vec2, Vel: vec2): void {
    if (!this.m_Add50hz) return;
    const p = new CParticle();
    p.SetDefault();
    p.m_Spr = C.SPRITE_PART_SMOKE;
    p.m_Pos = Pos;
    p.m_Vel = Vel.add(RandomDir().mul(50));
    p.m_LifeSpan = 0.5 + frandom() * 0.5;
    p.m_StartSize = 12 + frandom() * 8;
    p.m_EndSize = 0;
    p.m_Friction = 0.7;
    p.m_Gravity = frandom() * -500;
    this.add(GROUP_PROJECTILE_TRAIL, p);
  }

  SkidTrail(Pos: vec2, Vel: vec2): void {
    if (!this.m_Add100hz) return;
    const p = new CParticle();
    p.SetDefault();
    p.m_Spr = C.SPRITE_PART_SMOKE;
    p.m_Pos = Pos;
    p.m_Vel = Vel.add(RandomDir().mul(50));
    p.m_LifeSpan = 0.5 + frandom() * 0.5;
    p.m_StartSize = 24 + frandom() * 12;
    p.m_EndSize = 0;
    p.m_Friction = 0.7;
    p.m_Gravity = frandom() * -500;
    p.m_Color = { r: 0.75, g: 0.75, b: 0.75, a: 1 };
    this.add(GROUP_GENERAL, p);
  }

  BulletTrail(Pos: vec2): void {
    if (!this.m_Add100hz) return;
    const p = new CParticle();
    p.SetDefault();
    p.m_Spr = C.SPRITE_PART_BALL;
    p.m_Pos = Pos;
    p.m_LifeSpan = 0.25 + frandom() * 0.25;
    p.m_StartSize = 8;
    p.m_EndSize = 0;
    p.m_Friction = 0.7;
    this.add(GROUP_PROJECTILE_TRAIL, p);
  }

  PlayerSpawn(Pos: vec2): void {
    for (let i = 0; i < 32; i++) {
      const p = new CParticle();
      p.SetDefault();
      p.m_Spr = C.SPRITE_PART_SHELL;
      p.m_Pos = Pos;
      p.m_Vel = RandomDir().mul(powf(f(frandom()), 3) * 600);
      p.m_LifeSpan = 0.3 + frandom() * 0.3;
      p.m_StartSize = 64 + frandom() * 32;
      p.m_EndSize = 0;
      p.m_Rot = frandom() * pi * 2;
      p.m_Rotspeed = frandom();
      p.m_Gravity = frandom() * -400;
      p.m_Friction = 0.7;
      p.m_Color = { r: 0xb5 / 255, g: 0x50 / 255, b: 0xcb / 255, a: 1 };
      this.add(GROUP_GENERAL, p);
    }
    this.m_pClient.m_pSounds.PlayAt(CHN_WORLD, P.SOUND_PLAYER_SPAWN, 1, Pos);
  }

  PlayerDeath(Pos: vec2, ClientID: number): void {
    let BloodColor: vec3 = { x: 1, y: 1, z: 1 };
    const gc = this.m_pClient;
    if (ClientID >= 0) {
      const c = gc.m_aClients[ClientID];
      if (gc.m_GameInfo.m_GameFlags & P.GAMEFLAG_TEAMS) {
        const ColorVal = gc.m_pSkins.GetTeamColor(c.m_aUseCustomColors[P.SKINPART_BODY], c.m_aSkinPartColors[P.SKINPART_BODY], c.m_Team, P.SKINPART_BODY);
        BloodColor = gc.m_pSkins.GetColorV3(ColorVal);
      } else if (c.m_aUseCustomColors[P.SKINPART_BODY]) BloodColor = gc.m_pSkins.GetColorV3(c.m_aSkinPartColors[P.SKINPART_BODY]);
      else BloodColor = gc.m_pSkins.GetSkinPart(P.SKINPART_BODY, c.m_SkinPartIDs[P.SKINPART_BODY]).m_BloodColor;
    }
    for (let i = 0; i < 64; i++) {
      const p = new CParticle();
      p.SetDefault();
      p.m_Spr = C.SPRITE_PART_SPLAT01 + (Math.floor(Math.random() * 0x7fffffff) % 3);
      p.m_Pos = Pos;
      p.m_Vel = RandomDir().mul((frandom() + 0.1) * 900);
      p.m_LifeSpan = 0.3 + frandom() * 0.3;
      p.m_StartSize = 24 + frandom() * 16;
      p.m_EndSize = 0;
      p.m_Rot = frandom() * pi * 2;
      p.m_Rotspeed = (frandom() - 0.5) * pi;
      p.m_Gravity = 800;
      p.m_Friction = 0.8;
      const k = 0.75 + frandom() * 0.25;
      p.m_Color = { r: BloodColor.x * k, g: BloodColor.y * k, b: BloodColor.z * k, a: 0.75 };
      this.add(GROUP_GENERAL, p);
    }
  }

  Explosion(Pos: vec2): void {
    for (let y = -8; y <= 8; y++)
      for (let x = -8; x <= 8; x++) {
        if (x === 0 && y === 0) continue;
        const a = 1 - length(new vec2(x, y)) / length(new vec2(8, 8));
        this.m_pClient.m_pFlow.Add(Pos.add(new vec2(x, y).mul(16)), normalize(new vec2(x, y)).mul(5000 * a), 10);
      }
    const p = new CParticle();
    p.SetDefault();
    p.m_Spr = C.SPRITE_PART_EXPL01;
    p.m_Pos = Pos;
    p.m_LifeSpan = 0.4;
    p.m_StartSize = 150;
    p.m_EndSize = 0;
    p.m_Rot = frandom() * pi * 2;
    this.add(GROUP_EXPLOSIONS, p);
    for (let i = 0; i < 24; i++) {
      const q = new CParticle();
      q.SetDefault();
      q.m_Spr = C.SPRITE_PART_SMOKE;
      q.m_Pos = Pos;
      q.m_Vel = RandomDir().mul((1 + frandom() * 0.2) * 1000);
      q.m_LifeSpan = 0.5 + frandom() * 0.4;
      q.m_StartSize = 32 + frandom() * 8;
      q.m_EndSize = 0;
      q.m_Gravity = frandom() * -800;
      q.m_Friction = 0.4;
      const t = frandom();
      const c = mix(0.75, 0.5, t);
      q.m_Color = { r: c, g: c, b: c, a: 1 };
      this.add(GROUP_GENERAL, q);
    }
  }

  HammerHit(Pos: vec2): void {
    const p = new CParticle();
    p.SetDefault();
    p.m_Spr = C.SPRITE_PART_HIT01;
    p.m_Pos = Pos;
    p.m_LifeSpan = 0.3;
    p.m_StartSize = 120;
    p.m_EndSize = 0;
    p.m_Rot = frandom() * pi * 2;
    this.add(GROUP_EXPLOSIONS, p);
    this.m_pClient.m_pSounds.PlayAt(CHN_WORLD, P.SOUND_HAMMER_HIT, 1, Pos);
  }

  override OnRender(): void {
    const now = this.Client().time_get();
    if (now - this.LastUpdate100hz > TIME_FREQ / 100) {
      this.m_Add100hz = true;
      this.LastUpdate100hz = now;
    } else this.m_Add100hz = false;
    if (now - this.LastUpdate50hz > TIME_FREQ / 100) {
      this.m_Add50hz = true;
      this.LastUpdate50hz = now;
    } else this.m_Add50hz = false;
    if (this.m_Add50hz) this.m_pClient.m_pFlow.Update();
  }
}
