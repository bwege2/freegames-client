// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later), port of src/gfx/star_system.cpp,
// src/gfx/skybox.cpp and the managers of src/object3d/object3d_manager.cpp (DrawAllObject3D,
// UpdateAllObject3D, ReleaseAllObject3D). The drawing goes to render/gl.ts when there is a renderer;
// what drawing changes in the game (the frustum test of cObject3D::Draw, the dust tile offsets, the
// space dust particles) runs without one too. Changed for the browser by the freegames project, 2026.
import { Vec3 } from '../core/math.ts';
import { type ParticleSystem, ParticleCreationType, createParticleSystem, alive, particleSystems } from '../core/particles.ts';
import { boxInFrustum, getCameraLocation } from '../core/camera.ts';
import { type Object3D, ObjectType } from '../object3d/object3d.ts';
import { world, updateAll, releaseAll } from '../object3d/world.ts';
import { GetCameraCoveredDistance, GetCameraShake } from './camera.ts';
import { vw_GetTimeThread } from '../engine/core.ts';
import { R } from '../render/gl.ts';
import { config } from './globals.ts';

export const DrawType = { MENU: 0, GAME: 1 };

const S = {
  InitedAll: false,
  Inited: false,
  BaseRotation: new Vec3(),
  psSpace: null as ParticleSystem | null,
  StarsTile: 0,
  StarsTile2: 0,
  StarsTileUpdateTime: 0,
  StarsTileUpdateTime2: 0,
  StartTransparentLayer1: 0,
  EndTransparentLayer1: 0,
  StartTransparentLayer2: 0,
  EndTransparentLayer2: 0,
  SkyBox: [null, null, null, null, null, null] as (string | null)[],
};
export const starSystemState = S;
const InGameInitialLocation = new Vec3(0, 10, 250);

/** sides in eSide order: BACK, BOTTOM, FRONT, LEFT, RIGHT, TOP */
export function StarSystemInit(Num: number, SetBaseRotation: Vec3): void {
  if (Num === 1 || Num === 2) {
    const d = `skybox/${Num}/`;
    S.SkyBox = [`${d}skybox_back6.tga`, `${d}skybox_bottom4.tga`, `${d}skybox_front5.tga`, `${d}skybox_left2.tga`, `${d}skybox_right1.tga`, `${d}skybox_top3.tga`];
    S.Inited = true;
  }
  S.InitedAll = true;
  S.BaseRotation = SetBaseRotation.clone();
}

export function StarSystemInitByType(type: number): void {
  S.StartTransparentLayer1 = 0.2;
  S.EndTransparentLayer1 = 0.7;
  S.StartTransparentLayer2 = 0.9;
  S.EndTransparentLayer2 = 0.7;
  const t = type === DrawType.MENU ? 0 : 1;
  S.StarsTileUpdateTime = vw_GetTimeThread(t);
  S.StarsTileUpdateTime2 = vw_GetTimeThread(t);
  const s = createParticleSystem();
  S.psSpace = s;
  s.ColorStart = { r: 0.8, g: 0.8, b: 1 };
  s.ColorEnd = { r: 0.7, g: 0.7, b: 1 };
  if (type === DrawType.MENU) {
    s.AlphaStart = 1;
    s.AlphaEnd = 0;
    s.SizeStart = 0.1;
    s.SizeVar = 0.05;
    s.SizeEnd = 0.3;
    s.Speed = 4;
    s.SpeedVar = 8;
    s.Theta = 0;
    s.Life = 10;
    s.LifeVar = 0;
    s.CreationType = ParticleCreationType.Cube;
    s.CreationSize = new Vec3(2, 50, 30);
    s.ParticlesPerSec = 140;
    s.Texture = 'gfx/flare3.tga';
    s.Direction = new Vec3(1, 0, 0);
    s.CameraDistResize = 0.1;
    s.SetStartLocation(new Vec3(-50, 10, -20));
    const Time = s.TimeLastUpdate;
    for (let i = Time; i < Time + 20; i += 1) s.Update(i);
    s.TimeLastUpdate = Time;
  } else {
    s.AlphaStart = 0.5;
    s.AlphaEnd = 1;
    s.SizeStart = 0.4;
    s.SizeEnd = 0.05;
    s.Speed = 25;
    s.SpeedVar = 5;
    s.Theta = 0;
    s.Life = 14;
    s.LifeVar = 0;
    s.CreationType = ParticleCreationType.Cube;
    s.CreationSize = new Vec3(200, 30, 10);
    s.ParticlesPerSec = 100;
    s.Texture = 'gfx/flare3.tga';
    s.Direction = new Vec3(0, 0, -1);
    s.SetStartLocation(InGameInitialLocation);
    const Time = s.TimeLastUpdate;
    for (let i = Time; i < Time + 25; i += 1) s.Update(i);
    s.TimeLastUpdate = Time;
  }
}

export function StarSystemLayer1Transp(Start: number, End: number): void {
  S.StartTransparentLayer1 = Start;
  S.EndTransparentLayer1 = End;
}
export function StarSystemLayer3Transp(Start: number, End: number): void {
  S.StartTransparentLayer2 = Start;
  S.EndTransparentLayer2 = End;
}
export function StarSystemRelease(): void {
  S.SkyBox = [null, null, null, null, null, null];
  S.Inited = false;
}

function strip(x: number, y: number, z: number, w2: number, h2: number, l2: number, a0: number, a1: number,
  u0: number, u1: number, v0: number, v1: number): Float32Array {
  const d = new Float32Array(36);
  const put = (k: number, px: number, py: number, pz: number, a: number, u: number, v: number): void => {
    d.set([px, py, pz, 1, 1, 1, a, u, v], k * 9);
  };
  put(0, x + w2, y + h2, z + l2 + l2 / 2, a0, u1, v0);
  put(1, x + w2, y + h2, z - l2 / 2, a1, u1, v1);
  put(2, x - w2, y - h2, z + l2 + l2 / 2, a0, u0, v0);
  put(3, x - w2, y - h2, z - l2 / 2, a1, u0, v1);
  return d;
}

/** draws an object as cObject3D::Draw does: the frustum part always, the picture when there is a renderer */
export function drawObject(o: Object3D): void {
  if (!o.Chunks.length) return;
  const inFrustum = boxInFrustum(o.Location.add(o.AABB[6]), o.Location.add(o.AABB[0]));
  if (o.DrawLogic(inFrustum) && R.gl) R.gl.drawObject(o);
}

export function StarSystemDraw(type: number): void {
  if (!S.InitedAll) return;
  const cl = getCameraLocation();
  const r = R.gl;
  if (S.Inited && r) r.drawSkyBox(S.SkyBox, 50, 50, 50, S.BaseRotation);
  const game = type === DrawType.GAME;
  for (const o of world.SpaceObjectList) {
    if (o.ObjectType !== ObjectType.Planet) continue;
    if (game && r) {
      r.push();
      r.translate(cl.x * 0.9 - GetCameraShake() * 4, GetCameraShake() * 2, 0);
    }
    drawObject(o);
    if (game && r) r.pop();
  }
  r?.clearDepth();
  for (const o of world.SpaceObjectList) {
    if (o.ObjectType !== ObjectType.Planetoid) continue;
    if (game && r) {
      r.push();
      r.translate(cl.x * 0.7 - GetCameraShake() * 4, GetCameraShake() * 2, 0);
    }
    drawObject(o);
    if (game && r) r.pop();
  }
  r?.clearDepth();
  let w2 = 0, h2 = 110, l2 = 110;
  const cov = GetCameraCoveredDistance();
  let x = cov.x, y = cov.y, z = cov.z;
  let a0 = 0.7, a1 = 0.7;
  if (game) {
    w2 = l2 = 175;
    h2 = 0;
    x = cov.x + GetCameraShake() + cl.x * 0.8;
    y = cov.y - GetCameraShake() * 0.5;
    z = cov.z + 25;
    a0 = S.StartTransparentLayer1;
    a1 = S.EndTransparentLayer1;
  }
  const layer1 = strip(x, y, z, w2, h2, l2, a0, a1, 0, 1, S.StarsTile / 3, 1 + S.StarsTile / 3);
  if (!game) {
    S.StarsTile -= 0.015 * (vw_GetTimeThread(0) - S.StarsTileUpdateTime);
    S.StarsTileUpdateTime = vw_GetTimeThread(0);
  } else {
    S.StarsTile -= 0.035 * (vw_GetTimeThread(1) - S.StarsTileUpdateTime);
    S.StarsTileUpdateTime = vw_GetTimeThread(1);
  }
  if (S.StarsTile < -3) S.StarsTile += 3;
  if (r) {
    r.drawDust(layer1, 'skybox/tile_back.tga', !game);
    r.drawDust(strip(x, y, z, w2, h2, l2, a0, a1, 0, 3, S.StarsTile, 3 + S.StarsTile), 'skybox/tile_stars.tga', !game);
  }
  if (game) {
    const s = alive(S.psSpace);
    if (s) {
      s.SetStartLocation(s.Location);
      s.MoveSystemLocation(InGameInitialLocation.add(GetCameraCoveredDistance()));
    }
  }
}

export function StarSystemDrawThirdLayer(type: number): void {
  if (config.VisualEffectsQuality > 1) return;
  let w2 = 0, h2 = 110, l2 = 110;
  const cov = GetCameraCoveredDistance();
  let x = cov.x, y = cov.y, z = cov.z;
  let a0 = 0.9, a1 = 0.7;
  const game = type === DrawType.GAME;
  if (game) {
    w2 = l2 = 175;
    h2 = 0;
    const cl = getCameraLocation();
    x = cov.x + GetCameraShake() * 2 + cl.x * 0.5;
    y = cov.y - GetCameraShake();
    z = cov.z + 25;
    a0 = S.StartTransparentLayer2;
    a1 = S.EndTransparentLayer2;
  }
  const d = strip(x, y, z, w2, h2, l2, a0, a1, 0.2, 3.2, S.StarsTile2, 3 + S.StarsTile2);
  if (!game) {
    S.StarsTile2 -= 0.04 * (vw_GetTimeThread(0) - S.StarsTileUpdateTime2);
    S.StarsTileUpdateTime2 = vw_GetTimeThread(0);
  } else {
    S.StarsTile2 -= 0.12 * (vw_GetTimeThread(1) - S.StarsTileUpdateTime2);
    S.StarsTileUpdateTime2 = vw_GetTimeThread(1);
  }
  if (S.StarsTile2 < -3) S.StarsTile2 += 3;
  R.gl?.drawDust(d, 'skybox/tile_stars.tga', !game);
}

/** DrawAllObject3D (without the shadow map pass) */
export function DrawAllObject3D(type: number): void {
  for (const o of [...world.SpaceObjectList]) {
    if (o.ObjectType !== ObjectType.Planet && o.ObjectType !== ObjectType.Planetoid) drawObject(o);
  }
  for (const o of [...world.ShipList]) drawObject(o);
  for (const o of [...world.WeaponList]) drawObject(o);
  for (const o of [...world.GroundObjectList]) drawObject(o);
  for (const o of [...world.ProjectileList]) drawObject(o);
  for (const o of [...world.ExplosionList]) drawObject(o);
  R.gl?.drawParticleSystems(particleSystems);
  StarSystemDrawThirdLayer(type);
}

export function UpdateAllObject3D(Time: number): void {
  updateAll(world.ShipList, Time);
  updateAll(world.GroundObjectList, Time);
  updateAll(world.WeaponList, Time);
  updateAll(world.ProjectileList, Time);
  updateAll(world.SpaceObjectList, Time);
  updateAll(world.ExplosionList, Time);
}

export function ReleaseAllObject3D(): void {
  releaseAll(world.ShipList);
  releaseAll(world.GroundObjectList);
  releaseAll(world.WeaponList);
  releaseAll(world.ProjectileList);
  releaseAll(world.SpaceObjectList);
  releaseAll(world.ExplosionList);
}
