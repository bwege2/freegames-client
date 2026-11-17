// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later), port of src/object3d/
// space_object/: asteroids, planets, planetoids, space debris and the pirate base parts.
// Changed for the browser by the freegames project, 2026.
import { Vec3, fRand0, uRandNum, m33CalcPoint } from '../core/math.ts';
import { type ParticleSystem, ParticleCreationType, createParticleSystem, createPointLight, alive } from '../core/particles.ts';
import { Object3D, ObjectStatus, ObjectType, loadObjectData } from './object3d.ts';
import { world, releaseFrom } from './world.ts';
import { CreateSpaceExplosion } from './explosion.ts';
import { GetCameraCoveredDistance } from '../game/camera.ts';
import { G } from '../game/globals.ts';

export class SpaceObject extends Object3D {
  Speed = 0;
  RotationSpeed = new Vec3();
  Velocity = new Vec3();
  LastCameraPoint = new Vec3();
  BossPartCountDown = -1;

  constructor() {
    super();
    this.ObjectStatus = ObjectStatus.Enemy;
    this.LastCameraPoint = GetCameraCoveredDistance().clone();
  }

  Update(Time: number): boolean {
    if (!super.Update(Time)) return false;
    if (this.BossPartCountDown > -1) {
      this.BossPartCountDown -= this.TimeDelta;
      if (this.BossPartCountDown <= 0) {
        CreateSpaceExplosion(this, 34, this.Location, this.Speed, -1);
        return false;
      }
    }
    const t = this.ObjectType;
    if (t === ObjectType.SmallAsteroid || t === ObjectType.BigAsteroid || t === ObjectType.Planetoid) {
      if (t === ObjectType.BigAsteroid) {
        this.SetRotation(new Vec3(this.RotationSpeed.x * this.TimeDelta, this.RotationSpeed.y * this.TimeDelta, 0));
      } else {
        if (this.RotationSpeed.x !== 0) {
          this.Rotation.x -= this.RotationSpeed.x * this.TimeDelta;
          if (this.Rotation.x <= 360) this.Rotation.x += 360;
        }
        if (this.RotationSpeed.y !== 0) {
          this.Rotation.y -= this.RotationSpeed.y * this.TimeDelta;
          if (this.Rotation.y <= 360) this.Rotation.y += 360;
        }
      }
    }
    if (t === ObjectType.SpaceDebris) {
      if (this.Speed > 0) {
        this.Speed -= this.TimeDelta;
        if (this.Speed < 0) this.Speed = 0;
      }
      if (this.Speed < 0) {
        this.Speed += this.TimeDelta;
        if (this.Speed > 0) this.Speed = 0;
      }
      if (this.RotationSpeed.x !== 0) {
        this.SetRotation(new Vec3(-this.RotationSpeed.x * this.TimeDelta, 0, 0));
        this.RotationSpeed.x -= (this.RotationSpeed.x / 4) * this.TimeDelta;
      }
      if (this.RotationSpeed.y !== 0) {
        this.SetRotation(new Vec3(0, -this.RotationSpeed.y * this.TimeDelta, 0));
        this.RotationSpeed.y -= (this.RotationSpeed.y / 4) * this.TimeDelta;
      }
      if (this.RotationSpeed.z !== 0) {
        this.SetRotation(new Vec3(0, 0, -this.RotationSpeed.z * this.TimeDelta));
        this.RotationSpeed.z -= (this.RotationSpeed.z / 4) * this.TimeDelta;
      }
    }
    if (t === ObjectType.Planet || t === ObjectType.Planetoid || t === ObjectType.BigAsteroid) {
      const Temp = GetCameraCoveredDistance().sub(this.LastCameraPoint);
      const OrientTTT = Temp.mul(-1);
      OrientTTT.Normalize();
      this.SetLocation(this.Location.add(OrientTTT.mul(this.Speed * this.TimeDelta)).add(Temp));
      this.LastCameraPoint = GetCameraCoveredDistance().clone();
      if (t === ObjectType.Planet) {
        const c = this.Chunks;
        const dt = this.TimeDelta;
        switch (this.InternalType) {
          case 1:
            c[0].Rotation.y += 0.5 * dt;
            c[1].Rotation.y += 0.7 * dt;
            c[2].Rotation.y += 0.8 * dt;
            c[3].Rotation.y += 0.9 * dt;
            break;
          case 2:
            this.Rotation.y += 0.5 * dt;
            if (this.Rotation.y >= 360) this.Rotation.y -= 360;
            break;
          case 3:
            c[0].Rotation.y += 0.5 * dt;
            c[1].Rotation.y -= 0.7 * dt;
            break;
          case 4:
            c[0].Rotation.y += dt;
            break;
          case 5:
          case 6:
            c[0].Rotation.y += 0.5 * dt;
            break;
        }
        for (const ch of c) {
          if (ch.Rotation.x >= 360) ch.Rotation.x -= 360;
          if (ch.Rotation.x <= -360) ch.Rotation.x += 360;
          if (ch.Rotation.y >= 360) ch.Rotation.y -= 360;
          if (ch.Rotation.y <= -360) ch.Rotation.y += 360;
        }
      }
    } else {
      this.SetLocation(this.Location.add(this.Orientation.mul(this.Speed * this.TimeDelta)));
    }
    if (this.Velocity.x + this.Velocity.y + this.Velocity.z !== 0) {
      this.SetLocation(this.Location.add(this.Velocity.mul(this.TimeDelta)));
      this.Velocity.subFrom(this.Velocity.mul(0.5 * this.TimeDelta));
    }
    return true;
  }
}

const SMALL_ASTEROIDS = Array.from({ length: 20 }, (_, i) => `models/space/asteroid-01${i}.vw3d`);

class SmallAsteroid extends SpaceObject {
  constructor() {
    super();
    this.ObjectType = ObjectType.SmallAsteroid;
    loadObjectData(SMALL_ASTEROIDS[uRandNum(19)], this);
    for (let i = 0; i < this.Chunks.length; i++) this.Texture[i] = 'models/space/asteroid-01.tga';
    this.RotationSpeed.x = 100 + 50 * fRand0();
    this.RotationSpeed.y = 20 + 20 * fRand0();
    this.ArmorCurrentStatus = this.ArmorInitialStatus = this.Radius * 10 / G.GameEnemyArmorPenalty;
    this.Radius = this.Width / 2;
  }
}

/** cBigAsteroid and cPlanetoid share the models and the textures */
class BigAsteroid extends SpaceObject {
  constructor(num: number, type: number) {
    super();
    this.ObjectStatus = type === ObjectType.BigAsteroid ? ObjectStatus.Enemy : ObjectStatus.none;
    this.ObjectType = type;
    this.InternalType = num < 1 || num > 5 ? 1 + uRandNum(4) : num;
    loadObjectData(`models/space/bigasteroid-0${this.InternalType}.vw3d`, this);
    this.RotationSpeed.x = 10 + 10 * fRand0();
    this.RotationSpeed.y = 2 + 20 * fRand0();
    this.Texture[0] = 'models/planet/d_class3.tga';
    this.TextureIllum[0] = null;
    this.NormalMap[0] = 'models/normalmap/d_class3_nm.tga';
  }
}

class Planet extends SpaceObject {
  constructor(num: number) {
    super();
    this.ObjectStatus = ObjectStatus.none;
    this.ObjectType = ObjectType.Planet;
    this.InternalType = num;
    switch (num) {
      case 1:
        this.NeedCullFaces = false;
        this.NeedAlphaTest = true;
        loadObjectData('models/planet/aplanet.vw3d', this);
        this.Texture[0] = 'models/planet/d_class3.tga';
        this.NormalMap[0] = 'models/normalmap/d_class3_nm.tga';
        for (const i of [1, 2, 3]) {
          this.Texture[i] = 'models/planet/asteroid.tga';
          this.NormalMap[i] = 'models/normalmap/planet_asteroids_nm.tga';
        }
        break;
      case 2:
        this.PromptDrawDist2 = 100;
        loadObjectData('models/planet/dplanet.vw3d', this);
        for (let i = 0; i < this.Chunks.length; i++) {
          this.Texture[i] = 'models/planet/d_class3.tga';
          this.NormalMap[i] = 'models/normalmap/d_class3_nm.tga';
        }
        break;
      case 3:
        this.NeedCullFaces = false;
        loadObjectData('models/planet/gplanet.vw3d', this);
        this.Texture[0] = 'models/planet/m_class7.tga';
        this.NormalMap[0] = 'models/normalmap/m_class7_nm.tga';
        this.Texture[1] = 'models/planet/clouds.tga';
        this.Chunks[1].DrawType = 'blend';
        break;
      case 4:
        loadObjectData('models/planet/moon.vw3d', this);
        this.Texture[0] = 'models/planet/q_class2.tga';
        this.NormalMap[0] = 'models/normalmap/q_class2_nm.tga';
        break;
      case 5:
        loadObjectData('models/planet/planet5.vw3d', this);
        this.Texture[0] = 'models/planet/a_class4.tga';
        this.NormalMap[0] = 'models/normalmap/a_class4_nm.tga';
        break;
      case 6:
        loadObjectData('models/planet/planet6.vw3d', this);
        this.Texture[0] = 'models/planet/d_class3.tga';
        this.NormalMap[0] = 'models/normalmap/d_class3_nm.tga';
        break;
    }
  }
}

class SpaceDebris extends SpaceObject {
  constructor() {
    super();
    this.ObjectType = ObjectType.SpaceDebris;
  }
}

/** base_part.cpp SetupEngineGFX */
function SetupEngineGFX(ps: ParticleSystem, primary: boolean): void {
  ps.Texture = 'gfx/flare1.tga';
  ps.ColorStart = { r: 0.6, g: 0.6, b: 0.3 };
  ps.ColorEnd = { r: 0.3, g: 1.0, b: 0.3 };
  ps.AlphaStart = 1.0;
  ps.AlphaEnd = 0.0;
  ps.SizeStart = 0.3;
  ps.SpeedOnCreation = -1.0;
  ps.SpeedVar = 2.0;
  ps.Life = 0.5;
  ps.ParticlesPerSec = 100;
  ps.AlphaShowHide = true;
  if (primary) {
    ps.SizeVar = 0.3;
    ps.SizeEnd = 0.6;
    ps.Speed = 10.0;
    ps.Theta = 5.0;
    ps.CreationType = ParticleCreationType.Sphere;
    ps.CreationSize.set(0.8, 0.1, 0.8);
    ps.Direction.set(0.0, -1.0, 0.0);
    ps.Light = createPointLight(new Vec3(), 0.45, 0.8, 0.3, 0.0, 0.025);
  } else {
    ps.SizeVar = 0.2;
    ps.SizeEnd = 0.1;
    ps.Speed = 3.0;
    ps.Theta = 180.0;
    ps.Direction.set(0.0, 1.0, 0.0);
    ps.Light = createPointLight(new Vec3(), 0.45, 0.8, 0.3, 0.0, 0.3);
  }
}

class BasePart extends SpaceObject {
  GraphicFXLocation: Vec3[] = [];
  GraphicFX: (ParticleSystem | null)[] = [];

  constructor(num: number) {
    super();
    this.ObjectStatus = ObjectStatus.Enemy;
    this.ObjectType = ObjectType.BasePart;
    this.NeedAlphaTest = true;
    if (num === 1 || num === 2 || num === 6 || num === 8) this.InternalType = num * 10 + 1 + uRandNum(4);
    else this.InternalType = num;
    const t = this.InternalType;
    const group = t >= 10 ? Math.floor(t / 10) : t;
    const part = t >= 10 ? t % 10 : 1;
    loadObjectData(`models/spacebase/${group}/${part}.vw3d`, this);
    const tex = (list: (string | null)[]): void => list.forEach((x, i) => { this.Texture[i] = x; this.TextureIllum[i] = null; });
    const engines = (list: [number, number, number, boolean][]): void => {
      for (const [x, y, z, primary] of list) {
        const ps = createParticleSystem();
        this.GraphicFX.push(ps);
        this.GraphicFXLocation.push(new Vec3(x, y, z));
        SetupEngineGFX(ps, primary);
      }
      for (let i = 0; i < this.GraphicFX.length; i++) {
        const g = alive(this.GraphicFX[i]);
        if (g) {
          g.MoveSystem(this.GraphicFXLocation[i]);
          g.SetStartLocation(this.GraphicFXLocation[i]);
        }
      }
    };
    const a = 'models/spacebase/allalpha.tga', m = 'models/spacebase/metal.tga', d = 'models/planet/d_class3.tga';
    const nm = 'models/normalmap/d_class3_nm.tga';
    switch (group) {
      case 1:
        tex([d, a, m]);
        this.NormalMap[0] = nm;
        engines([[14.3, -4, -14.3, true], [14.3, -4, 14.3, true], [-14.3, -4, -14.3, true], [-14.3, -4, 14.3, true],
          [14.3, 3.2, -14.3, false], [14.3, 3.2, 14.3, false], [-14.3, 3.2, -14.3, false], [-14.3, 3.2, 14.3, false]]);
        break;
      case 2:
        tex([a, d, m]);
        this.NormalMap[1] = nm;
        break;
      case 3:
        tex([m, a]);
        engines([[0, -5, 13.7, true], [0, 5, 13.7, false]]);
        break;
      case 4:
      case 5:
      case 7:
        tex([a]);
        break;
      case 6:
        tex([a, d]);
        this.NormalMap[1] = nm;
        break;
      case 8:
        tex([a, m, d]);
        this.NormalMap[2] = nm;
        break;
    }
  }

  Destroy(): void {
    for (const t of this.GraphicFX) {
      const g = alive(t);
      if (g) {
        g.IsSuppressed = true;
        g.DestroyIfNoParticles = true;
      }
    }
  }

  SetLocation(l: Vec3): void {
    super.SetLocation(l);
    for (let i = 0; i < this.GraphicFX.length; i++) {
      const g = alive(this.GraphicFX[i]);
      if (g) {
        g.MoveSystem(this.GraphicFXLocation[i].add(l));
        g.SetStartLocation(this.GraphicFXLocation[i].add(l));
      }
    }
  }

  SetRotation(r: Vec3): void {
    super.SetRotation(r);
    for (let i = 0; i < this.GraphicFX.length; i++) {
      const g = alive(this.GraphicFX[i]);
      if (g) {
        m33CalcPoint(this.GraphicFXLocation[i], this.OldInvRotationMat);
        m33CalcPoint(this.GraphicFXLocation[i], this.CurrentRotationMat);
        if (g.SpeedOnCreation === -1) {
          g.MoveSystem(this.GraphicFXLocation[i].add(this.Location));
          g.SetStartLocation(this.GraphicFXLocation[i].add(this.Location));
          g.RotateSystemAndParticlesByAngle(this.Rotation);
        } else {
          g.MoveSystemLocation(this.GraphicFXLocation[i].add(this.Location));
          g.RotateSystemByAngle(this.Rotation);
        }
      }
    }
  }
}

function add<T extends SpaceObject>(o: T): T {
  world.SpaceObjectList.unshift(o);
  return o;
}

export const CreateSmallAsteroid = (): SpaceObject => add(new SmallAsteroid());
export const CreateBigAsteroid = (n: number): SpaceObject => add(new BigAsteroid(n, ObjectType.BigAsteroid));
export const CreatePlanet = (n: number): SpaceObject => add(new Planet(n));
export const CreatePlanetoid = (n: number): SpaceObject => add(new BigAsteroid(n, ObjectType.Planetoid));
export const CreateSpaceDebris = (): SpaceObject => add(new SpaceDebris());
export const CreateBasePart = (n: number): SpaceObject => add(new BasePart(n));

export function ReleaseSpaceObject(o: SpaceObject | null): void {
  releaseFrom(world.SpaceObjectList, o);
}
