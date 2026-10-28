// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/collision.cpp of Teeworlds 0.7.5 in TypeScript.
import { vec2, f, clamp, distance, length, mixv, round_to_int, toInt, idiv } from '../base/vmath.ts';
import type { CLayers } from './layers.ts';
import * as MI from './mapitems.ts';

export const COLFLAG_SOLID = 1, COLFLAG_DEATH = 2, COLFLAG_NOHOOK = 4;

export class CCollision {
  m_pTiles: Uint8Array = new Uint8Array(4);
  m_Width = 0;
  m_Height = 0;
  m_pLayers: CLayers | null = null;

  Init(layers: CLayers): void {
    this.m_pLayers = layers;
    const it = layers.Map().items;
    this.m_Width = it[layers.m_pGameLayer + MI.TILEMAP_WIDTH];
    this.m_Height = it[layers.m_pGameLayer + MI.TILEMAP_HEIGHT];
    this.m_pTiles = layers.Map().GetData(it[layers.m_pGameLayer + MI.TILEMAP_DATA])!;
    for (let i = 0; i < this.m_Width * this.m_Height; i++) {
      const Index = this.m_pTiles[i * 4];
      if (Index > 128) continue;
      switch (Index) {
        case MI.TILE_DEATH: this.m_pTiles[i * 4] = COLFLAG_DEATH; break;
        case MI.TILE_SOLID: this.m_pTiles[i * 4] = COLFLAG_SOLID; break;
        case MI.TILE_NOHOOK: this.m_pTiles[i * 4] = COLFLAG_SOLID | COLFLAG_NOHOOK; break;
        default: this.m_pTiles[i * 4] = 0;
      }
    }
  }

  GetTile(x: number, y: number): number {
    const nx = clamp(idiv(x, 32), 0, this.m_Width - 1);
    const ny = clamp(idiv(y, 32), 0, this.m_Height - 1);
    const i = this.m_pTiles[(ny * this.m_Width + nx) * 4];
    return i > 128 ? 0 : i;
  }
  IsTile(x: number, y: number, Flag = COLFLAG_SOLID): boolean { return (this.GetTile(x, y) & Flag) !== 0; }
  CheckPoint(x: number, y: number, Flag = COLFLAG_SOLID): boolean { return this.IsTile(round_to_int(x), round_to_int(y), Flag); }
  CheckPointV(p: vec2, Flag = COLFLAG_SOLID): boolean { return this.CheckPoint(p.x, p.y, Flag); }
  GetCollisionAt(x: number, y: number): number { return this.GetTile(round_to_int(x), round_to_int(y)); }
  GetWidth(): number { return this.m_Width; }
  GetHeight(): number { return this.m_Height; }

  /** the flags hit (0: none); out.col the collision point, out.before the point before it */
  IntersectLine(p0: vec2, p1: vec2, out?: { col?: vec2; before?: vec2 }): number {
    const d = distance(p0, p1);
    const End = toInt(f(d + 1));
    let Last = p0;
    for (let i = 0; i <= End; i++) {
      const a = f(i / f(End));
      const Pos = mixv(p0, p1, a);
      if (this.CheckPoint(Pos.x, Pos.y)) {
        if (out) {
          out.col = Pos;
          out.before = Last;
        }
        return this.GetCollisionAt(Pos.x, Pos.y);
      }
      Last = Pos;
    }
    if (out) {
      out.col = p1;
      out.before = p1;
    }
    return 0;
  }

  /** MovePoint: s.pos and s.vel in and out; the bounces */
  MovePoint(s: { pos: vec2; vel: vec2 }, Elasticity: number): number {
    let bounces = 0;
    const Pos = s.pos, Vel = s.vel;
    if (this.CheckPointV(Pos.add(Vel))) {
      let Affected = 0;
      if (this.CheckPoint(f(Pos.x + Vel.x), Pos.y)) {
        s.vel = s.vel.withX(s.vel.x * -Elasticity);
        bounces++;
        Affected++;
      }
      if (this.CheckPoint(Pos.x, f(Pos.y + Vel.y))) {
        s.vel = s.vel.withY(s.vel.y * -Elasticity);
        bounces++;
        Affected++;
      }
      if (Affected === 0) s.vel = new vec2(s.vel.x * -Elasticity, s.vel.y * -Elasticity);
    } else s.pos = Pos.add(Vel);
    return bounces;
  }

  TestBox(Pos: vec2, Size: vec2, Flag = COLFLAG_SOLID): boolean {
    Size = Size.mul(0.5);
    if (this.CheckPoint(f(Pos.x - Size.x), f(Pos.y - Size.y), Flag)) return true;
    if (this.CheckPoint(f(Pos.x + Size.x), f(Pos.y - Size.y), Flag)) return true;
    if (this.CheckPoint(f(Pos.x - Size.x), f(Pos.y + Size.y), Flag)) return true;
    if (this.CheckPoint(f(Pos.x + Size.x), f(Pos.y + Size.y), Flag)) return true;
    return false;
  }

  /** MoveBox: s.pos and s.vel in and out; returns whether a death tile was touched */
  MoveBox(s: { pos: vec2; vel: vec2 }, Size: vec2, Elasticity: number, wantDeath = false): boolean {
    let Pos = s.pos;
    let Vel = s.vel;
    const Distance = length(Vel);
    const Max = toInt(Distance);
    let death = false;
    if (Distance > f(0.00001)) {
      const Fraction = f(1 / f(Max + 1));
      const small = Size.mul(f(2 / 3));
      for (let i = 0; i <= Max; i++) {
        let NewPos = Pos.add(Vel.mul(Fraction));
        if (wantDeath && this.TestBox(NewPos, small, COLFLAG_DEATH)) death = true;
        if (this.TestBox(NewPos, Size)) {
          let Hits = 0;
          let nx = NewPos.x, ny = NewPos.y, vx = Vel.x, vy = Vel.y;
          if (this.TestBox(new vec2(Pos.x, ny), Size)) {
            ny = Pos.y;
            vy = f(vy * -Elasticity);
            Hits++;
          }
          if (this.TestBox(new vec2(nx, Pos.y), Size)) {
            nx = Pos.x;
            vx = f(vx * -Elasticity);
            Hits++;
          }
          if (Hits === 0) {
            ny = Pos.y;
            vy = f(vy * -Elasticity);
            nx = Pos.x;
            vx = f(vx * -Elasticity);
          }
          NewPos = new vec2(nx, ny);
          Vel = new vec2(vx, vy);
        }
        Pos = NewPos;
      }
    }
    s.pos = Pos;
    s.vel = Vel;
    return death;
  }
}
