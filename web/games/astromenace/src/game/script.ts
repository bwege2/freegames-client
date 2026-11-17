// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later), port of src/script/script.cpp: the
// mission scripts (gamedata/script/*.xml) and the AI modes (aimode.xml). Changed for the browser by the
// freegames project, 2026.
import { Vec3, fRand, fRand0, clamp, hashDjb2a } from '../core/math.ts';
import { XMLDocument, type XMLEntry } from '../core/xml.ts';
import { LightType, createLight } from '../core/particles.ts';
import { type Object3D, TimeSheet, DeleteAfterLeaveScene, ObjectStatus, needCheckCollision, hooks } from '../object3d/object3d.ts';
import { world, playerFighter } from '../object3d/world.ts';
import type { SpaceShip } from '../object3d/spaceship.ts';
import { CreateEarthSpaceFighter, SetEarthSpaceFighterArmor, SetEarthSpaceFighterWeapon } from '../object3d/earthfighter.ts';
import { CreateAlienSpaceFighter } from '../object3d/alienfighter.ts';
import { CreateAlienSpaceMotherShip } from '../object3d/mothership.ts';
import { CreatePirateShip } from '../object3d/pirateship.ts';
import { CreateBasePart, CreateBigAsteroid, CreatePlanet, CreatePlanetoid, CreateSmallAsteroid, type SpaceObject } from '../object3d/spaceobject.ts';
import { CreateCivilianBuilding, CreateMilitaryBuilding, CreateTracked, CreateWheeled, type GroundObject } from '../object3d/ground.ts';
import { GetCameraCoveredDistance, GetCameraMovementDirection, GetCameraSpeed } from './camera.ts';
import { G, MusicTheme, audio } from './globals.ts';

const H = (s: string): number => hashDjb2a(s);
const MAX_WEAPONS = 6;

/** the files of gamedata/script/, by name (filled by the loader) */
export const scriptFiles = new Map<string, string>();

/** script.cpp's hooks into the rest of the game */
export const scriptHooks = {
  StarSystemInit: (_num: number, _rot: Vec3): void => {},
  StarSystemLayer1Transp: (_s: number, _e: number): void => {},
  StarSystemLayer3Transp: (_s: number, _e: number): void => {},
  StopwatchReset: (_on: boolean): void => {},
};

function SetAIMode(list: TimeSheet[], e: XMLEntry, xmlAI: XMLDocument | null): void {
  const m = XMLDocument.int(e, 'aimode');
  if (m !== undefined) {
    const t = new TimeSheet();
    t.Time = -1;
    t.AI_Mode = m;
    t.xmlAI = xmlAI;
    list.push(t);
  }
}

function SetLocation(o: Object3D, e: XMLEntry, lag: number): void {
  const p = new Vec3();
  const f = (n: string): number | undefined => XMLDocument.float(e, n);
  p.x = f('posax') ?? p.x;
  p.y = f('posay') ?? p.y;
  p.z = f('posaz') ?? p.z;
  const PosWithLag = GetCameraMovementDirection().mul(-GetCameraSpeed() * lag);
  const cov = GetCameraCoveredDistance();
  const x = f('posx');
  if (x !== undefined) p.x = x + cov.x + PosWithLag.x;
  const y = f('posy');
  if (y !== undefined) p.y = y + cov.y + PosWithLag.y;
  const z = f('posz');
  if (z !== undefined) p.z = z + cov.z + PosWithLag.z;
  o.SetLocation(p);
}

function SetRotation(o: Object3D, e: XMLEntry): void {
  const a = new Vec3();
  const f = (n: string): number | undefined => XMLDocument.float(e, n);
  a.x = f('anglax') ?? a.x;
  a.y = f('anglay') ?? a.y;
  a.z = f('anglaz') ?? a.z;
  a.x = f('anglx') ?? a.x;
  a.y = f('angly') ?? a.y;
  a.z = f('anglz') ?? a.z;
  o.SetRotation(a);
}

function SetDeleteAfterLeaveScene(o: Object3D, e: XMLEntry): void {
  o.DeleteAfterLeaveScene = DeleteAfterLeaveScene.enabled;
  const s = XMLDocument.int(e, 'onhide');
  if (s !== undefined && s <= 0) o.DeleteAfterLeaveScene = DeleteAfterLeaveScene.disabled;
}

function LoadTimeSheetData(e: XMLEntry, t: TimeSheet, xmlAI: XMLDocument | null): void {
  const f = (n: string): number | undefined => XMLDocument.float(e, n);
  const m = XMLDocument.int(e, 'aimode');
  if (m !== undefined) {
    t.AI_Mode = m;
    t.Time = f('time') ?? t.Time;
    t.xmlAI = xmlAI;
    return;
  }
  t.Time = f('time') ?? t.Time;
  t.Speed = f('speed') ?? t.Speed;
  t.Acceler = clamp(f('acceler') ?? t.Acceler, 0, 1);
  t.SpeedLR = f('speedlr') ?? t.SpeedLR;
  t.AccelerLR = clamp(f('accelerlr') ?? t.AccelerLR, 0, 1);
  t.SpeedUD = f('speedud') ?? t.SpeedUD;
  t.AccelerUD = clamp(f('accelerud') ?? t.AccelerUD, 0, 1);
  t.SpeedByCamFB = f('speedbycamfb') ?? t.SpeedByCamFB;
  t.AccelerByCamFB = clamp(f('accelerbycamfb') ?? t.AccelerByCamFB, 0, 1);
  t.SpeedByCamLR = f('speedbycamlr') ?? t.SpeedByCamLR;
  t.AccelerByCamLR = clamp(f('accelerbycamlr') ?? t.AccelerByCamLR, 0, 1);
  t.SpeedByCamUD = f('speedbycamud') ?? t.SpeedByCamUD;
  t.AccelerByCamUD = clamp(f('accelerbycamud') ?? t.AccelerByCamUD, 0, 1);
  t.Rotation.x = f('rotx') ?? t.Rotation.x;
  t.Rotation.y = f('roty') ?? t.Rotation.y;
  t.Rotation.z = f('rotz') ?? t.Rotation.z;
  t.RotationAcceler.x = f('rotacx') ?? t.RotationAcceler.x;
  t.RotationAcceler.y = f('rotacy') ?? t.RotationAcceler.y;
  t.RotationAcceler.z = f('rotacz') ?? t.RotationAcceler.z;
  t.RotationAcceler.x = clamp(t.RotationAcceler.x, 0, 1);
  t.RotationAcceler.y = clamp(t.RotationAcceler.y, 0, 1);
  t.RotationAcceler.z = clamp(t.RotationAcceler.z, 0, 1);
  for (const k of ['x', 'y', 'z'] as const) {
    const v = f(`angl${k}`);
    if (v !== undefined) {
      t.SetAngle[k] = v;
      t.NeedSetAngle = true;
    }
  }
  const fire = XMLDocument.int(e, 'fire');
  if (fire !== undefined && fire > 0) t.Fire = true;
  const boss = XMLDocument.int(e, 'bossfire');
  if (boss !== undefined && boss > 0) t.BossFire = true;
  const tg = XMLDocument.int(e, 'targeting');
  if (tg !== undefined && tg !== 0) t.Targeting = true;
}

function loadTimeSheets(o: Object3D, e: XMLEntry, xmlAI: XMLDocument | null): void {
  for (const c of e.children) {
    if (c.name === 'TimeSheet') {
      const t = new TimeSheet();
      o.TimeSheetList.push(t);
      LoadTimeSheetData(c, t, xmlAI);
    }
  }
}

function LoadSpaceShipScript(s: SpaceShip, e: XMLEntry, lag: number, xmlAI: XMLDocument | null): void {
  const f = (n: string): number | undefined => XMLDocument.float(e, n);
  let v = f('speed');
  if (v !== undefined) s.Speed = s.NeedSpeed = v;
  v = f('speedlr');
  if (v !== undefined) s.SpeedLR = s.NeedSpeedLR = v;
  v = f('speedud');
  if (v !== undefined) s.SpeedUD = s.NeedSpeedUD = v;
  v = f('speedbycamfb');
  if (v !== undefined) s.SpeedByCamFB = s.NeedSpeedByCamFB = v;
  v = f('speedbycamlr');
  if (v !== undefined) s.SpeedByCamLR = s.NeedSpeedByCamLR = v;
  v = f('speedbycamud');
  if (v !== undefined) s.SpeedByCamUD = s.NeedSpeedByCamUD = v;
  SetDeleteAfterLeaveScene(s, e);
  SetAIMode(s.TimeSheetList, e, xmlAI);
  SetRotation(s, e);
  SetLocation(s, e, lag);
  loadTimeSheets(s, e, xmlAI);
}

function LoadGroundObjectScript(g: GroundObject, e: XMLEntry, lag: number, xmlAI: XMLDocument | null): void {
  const v = XMLDocument.float(e, 'speed');
  if (v !== undefined) g.Speed = g.NeedSpeed = v;
  SetDeleteAfterLeaveScene(g, e);
  SetAIMode(g.TimeSheetList, e, xmlAI);
  SetRotation(g, e);
  SetLocation(g, e, lag);
  loadTimeSheets(g, e, xmlAI);
}

function LoadSpaceObjectScript(o: SpaceObject, e: XMLEntry, lag: number): void {
  o.Speed = XMLDocument.float(e, 'speed') ?? o.Speed;
  SetDeleteAfterLeaveScene(o, e);
  SetRotation(o, e);
  SetLocation(o, e, lag);
  o.RotationSpeed.x = XMLDocument.float(e, 'rotx') ?? o.RotationSpeed.x;
  o.RotationSpeed.y = XMLDocument.float(e, 'roty') ?? o.RotationSpeed.y;
  o.RotationSpeed.z = XMLDocument.float(e, 'rotz') ?? o.RotationSpeed.z;
}

/** UnpackAIMode: the front TimeSheet's AI mode is replaced by the mode's TimeSheets */
export function UnpackAIMode(list: TimeSheet[]): void {
  const front = list[0];
  const ai = front.xmlAI;
  if (!ai || !ai.root) return;
  for (const e of ai.root.children) {
    const n = XMLDocument.int(e, 'num');
    if (n !== undefined && n === front.AI_Mode) {
      let at = 0;
      for (const c of e.children) {
        if (c.name === 'TimeSheet') {
          const t = new TimeSheet();
          at++;
          list.splice(at, 0, t);
          LoadTimeSheetData(c, t, ai);
        }
      }
      if (front.Time === -1) list.splice(at + 1, 0, front.clone());
      list.shift();
      return;
    }
  }
  // not found: the original loops forever here (UpdateWithTimeSheetList keeps calling); stop it
  front.AI_Mode = 0;
}
hooks.unpackAIMode = UnpackAIMode;

export class MissionScript {
  TimeLastOp = 0;
  StartTime = 0;
  TimeOpLag = 0;
  xmlDoc: XMLDocument | null = null;
  iter = 0;
  ShowLineNumber = false;
  NeedCheckSpaceShip = false;
  NeedCheckGroundObject = false;
  EndDelayMissionComplete = 0;
  LastTimeMissionComplete = -1;
  AsterQuant = 2;
  AsterW = 280;
  AsterH = 7.5;
  AsterXPos = 0;
  AsterYPos = -10;
  AsterZPos = 340;
  AsterRealNeed = 0;
  AsterMaxSpeed = 5;
  AsterMinFastSpeed = 35;
  AsterLastTime = -1;
  AsterFastCount = 0;
  AsterOn = false;
  private xmlAI: XMLDocument | null = null;

  RunScript(FileName: string, InitTime: number): boolean {
    this.StartTime = this.TimeLastOp = InitTime;
    this.TimeOpLag = 0;
    this.NeedCheckSpaceShip = false;
    this.NeedCheckGroundObject = false;
    this.EndDelayMissionComplete = 0;
    this.LastTimeMissionComplete = -1;
    this.AsterQuant = 2;
    this.AsterW = 280;
    this.AsterH = 7.5;
    this.AsterXPos = 0;
    this.AsterYPos = -10;
    this.AsterZPos = 340;
    this.AsterRealNeed = 0;
    this.AsterMaxSpeed = 5;
    this.AsterMinFastSpeed = 35;
    this.AsterFastCount = 0;
    this.AsterOn = false;
    this.AsterLastTime = -1;
    this.ShowLineNumber = false;
    this.xmlDoc = new XMLDocument(scriptFiles.get(FileName) ?? null, true);
    if (!this.xmlDoc.root || this.xmlDoc.root.name !== 'AstroMenaceScript' || !this.xmlDoc.root.children.length) {
      this.xmlDoc = null;
      return false;
    }
    this.iter = 0;
    this.Update(this.StartTime);
    return true;
  }

  Update(Time: number): boolean {
    if (!this.xmlDoc || !this.xmlDoc.root) return false;
    let TimeDelta = Time - this.TimeLastOp;
    if (this.AsterOn) {
      if (this.AsterLastTime === -1) this.AsterLastTime = Time;
      const dt = Time - this.AsterLastTime;
      this.AsterLastTime = Time;
      const NeedGener = this.AsterQuant * dt + this.AsterRealNeed;
      let n = Math.trunc(NeedGener);
      this.AsterRealNeed = NeedGener - n;
      while (n > 0) {
        const a = CreateSmallAsteroid();
        if (this.AsterFastCount !== 20) a.Speed = this.AsterMaxSpeed * fRand();
        else a.Speed = this.AsterMinFastSpeed + this.AsterMaxSpeed * fRand();
        a.DeleteAfterLeaveScene = DeleteAfterLeaveScene.enabled;
        a.SetRotation(new Vec3(0, 180, 0));
        const x = this.AsterXPos + this.AsterW * fRand0();
        const y = this.AsterYPos * 2 + this.AsterH * fRand();
        const z = this.AsterFastCount !== 20 ? this.AsterZPos + 20 : this.AsterZPos;
        a.SetLocation(new Vec3(x, y, z).add(GetCameraCoveredDistance()));
        n--;
      }
      this.AsterFastCount++;
      if (this.AsterFastCount > 30) this.AsterFastCount = 0;
    }
    if (this.EndDelayMissionComplete > 0 || this.NeedCheckSpaceShip || this.NeedCheckGroundObject) {
      if (this.LastTimeMissionComplete === -1) this.LastTimeMissionComplete = Time;
      const dt = Time - this.LastTimeMissionComplete;
      this.LastTimeMissionComplete = Time;
      let NeedDecreaseTime = true;
      if (this.NeedCheckSpaceShip) {
        for (const s of world.ShipList) {
          if (s.ObjectStatus === ObjectStatus.Enemy && s.DeleteAfterLeaveScene !== DeleteAfterLeaveScene.enabled
            && s.DeleteAfterLeaveScene !== DeleteAfterLeaveScene.disabled) {
            NeedDecreaseTime = false;
            break;
          }
        }
      }
      if (NeedDecreaseTime && this.NeedCheckGroundObject) {
        for (const g of world.GroundObjectList) {
          if (needCheckCollision(g) && g.DeleteAfterLeaveScene !== DeleteAfterLeaveScene.enabled
            && g.DeleteAfterLeaveScene !== DeleteAfterLeaveScene.disabled) {
            NeedDecreaseTime = false;
            break;
          }
        }
      }
      if (NeedDecreaseTime) this.EndDelayMissionComplete -= dt;
      if (this.EndDelayMissionComplete <= 0) {
        this.EndDelayMissionComplete = 0;
        this.NeedCheckSpaceShip = false;
        this.NeedCheckGroundObject = false;
        G.onMissionComplete();
        return false;
      }
      return true;
    }
    const list = this.xmlDoc.root.children;
    for (; this.iter < list.length; this.iter++) {
      const e = list[this.iter];
      const f = (n: string): number | undefined => XMLDocument.float(e, n);
      switch (e.nameHash) {
        case H('TimeLine'): {
          const onTime = f('value') ?? 0;
          if (onTime > TimeDelta) return true;
          this.TimeOpLag = TimeDelta - onTime;
          this.UpdateTimeLine(e);
          this.TimeLastOp = Time - this.TimeOpLag;
          TimeDelta = this.TimeOpLag;
          break;
        }
        case H('AIFile'):
          if (e.content) {
            this.xmlAI = new XMLDocument(scriptFiles.get(e.content) ?? null);
            if (!this.xmlAI.root) this.xmlAI = null;
          }
          break;
        case H('Debug'):
          this.ShowLineNumber = XMLDocument.bool(e, 'showline') ?? false;
          scriptHooks.StopwatchReset(XMLDocument.bool(e, 'time') ?? false);
          break;
        case H('StarSystem'): {
          const n = XMLDocument.int(e, 'system');
          if (n !== undefined) scriptHooks.StarSystemInit(n, new Vec3(f('anglex') ?? 0, f('angley') ?? 0, f('anglez') ?? 0));
          break;
        }
        case H('LayersTransp'):
          scriptHooks.StarSystemLayer1Transp(f('FirstStart') ?? 0.2, f('FirstEnd') ?? 0.7);
          scriptHooks.StarSystemLayer3Transp(f('SecondStart') ?? 0.9, f('SecondEnd') ?? 0.7);
          break;
        case H('Music'): {
          const p = playerFighter();
          if (p && p.ArmorCurrentStatus > 0) {
            const t = XMLDocument.int(e, 'theme');
            if (t === 1) audio.playMusicTheme(MusicTheme.GAME, 2000, 2000);
            if (t === 2) audio.playMusicTheme(MusicTheme.BOSS, 1500, 2000);
          }
          break;
        }
        case H('CreatePlanet'): {
          const t = XMLDocument.int(e, 'type');
          if (t !== undefined) {
            const p = CreatePlanet(t);
            SetRotation(p, e);
            SetLocation(p, e, 0);
            p.DeleteAfterLeaveScene = DeleteAfterLeaveScene.enabled;
            p.Speed = f('speed') ?? p.Speed;
          }
          break;
        }
        case H('CreatePlanetoid'): {
          const p = CreatePlanetoid(XMLDocument.int(e, 'type') ?? 0);
          SetRotation(p, e);
          SetLocation(p, e, 0);
          p.DeleteAfterLeaveScene = DeleteAfterLeaveScene.enabled;
          p.Speed = f('speed') ?? p.Speed;
          break;
        }
        case H('AsteroidField'):
          this.AsterOn = XMLDocument.bool(e, 'status') ?? this.AsterOn;
          this.AsterQuant = f('persec') ?? this.AsterQuant;
          this.AsterW = f('w') ?? this.AsterW;
          this.AsterH = f('h') ?? this.AsterH;
          this.AsterXPos = f('posx') ?? this.AsterXPos;
          this.AsterYPos = f('posy') ?? this.AsterYPos;
          this.AsterZPos = f('posz') ?? this.AsterZPos;
          this.AsterMaxSpeed = f('slow') ?? this.AsterMaxSpeed;
          this.AsterMinFastSpeed = f('fast') ?? this.AsterMinFastSpeed;
          break;
        case H('Light'): {
          const l = createLight(XMLDocument.int(e, 'type') === 1 ? LightType.Point : LightType.Directional);
          const keys: [string, number[], number][] = [
            ['diff', l.Diffuse, 0], ['spec', l.Specular, 0], ['ambi', l.Ambient, 0],
          ];
          for (const [k, arr] of keys) {
            arr[0] = f(`${k}r`) ?? arr[0];
            arr[1] = f(`${k}g`) ?? arr[1];
            arr[2] = f(`${k}b`) ?? arr[2];
            arr[3] = f(`${k}a`) ?? arr[3];
          }
          l.Direction.x = f('dirx') ?? l.Direction.x;
          l.Direction.y = f('diry') ?? l.Direction.y;
          l.Direction.z = f('dirz') ?? l.Direction.z;
          l.Direction.Normalize();
          l.Location.x = f('posx') ?? l.Location.x;
          l.Location.y = f('posy') ?? l.Location.y;
          l.Location.z = f('posz') ?? l.Location.z;
          l.On = XMLDocument.bool(e, 'status') ?? l.On;
          break;
        }
        case H('Label'):
          break;
        case H('Goto'): {
          const label = XMLDocument.attr(e, 'label');
          if (label !== undefined) {
            const idx = list.findIndex((c) => c.name === 'Label' && XMLDocument.attr(c, 'name') === label);
            if (idx >= 0) {
              this.iter = idx;
              return true;
            }
          }
          break;
        }
        case H('MissionComplete'):
          G.onMissionComplete();
          break;
        case H('MissionCompleteAtNoEnemy'): {
          let flag = false;
          this.NeedCheckSpaceShip = false;
          const s = XMLDocument.bool(e, 'ships');
          if (s !== undefined) {
            this.NeedCheckSpaceShip = s;
            flag = true;
          }
          this.NeedCheckGroundObject = false;
          const g = XMLDocument.bool(e, 'grounds');
          if (g !== undefined) {
            this.NeedCheckGroundObject = g;
            flag = true;
          }
          this.EndDelayMissionComplete = 0;
          const dl = f('delay');
          if (dl !== undefined) {
            this.EndDelayMissionComplete = dl;
            flag = true;
          }
          if (!flag) {
            G.onMissionComplete();
          } else {
            this.LastTimeMissionComplete = Time;
            // the original returns here without advancing past this entry
            return true;
          }
          break;
        }
      }
    }
    return false;
  }

  UpdateTimeLine(tl: XMLEntry): void {
    const lag = this.TimeOpLag;
    for (const e of tl.children) {
      const type = XMLDocument.int(e, 'type');
      switch (e.nameHash) {
        case H('EarthFighter'):
          if (type !== undefined) {
            const s = CreateEarthSpaceFighter(type);
            LoadSpaceShipScript(s, e, lag, this.xmlAI);
            const armor = XMLDocument.int(e, 'armor');
            if (armor !== undefined) SetEarthSpaceFighterArmor(s, armor);
            for (let i = 1; i <= MAX_WEAPONS; i++) {
              const w = XMLDocument.int(e, `weapon${i}`);
              if (w !== undefined) SetEarthSpaceFighterWeapon(s, i, w);
            }
          }
          break;
        case H('AlienFighter'):
          if (type !== undefined) LoadSpaceShipScript(CreateAlienSpaceFighter(type), e, lag, this.xmlAI);
          break;
        case H('AlienMotherShip'):
          if (type !== undefined) LoadSpaceShipScript(CreateAlienSpaceMotherShip(type), e, lag, this.xmlAI);
          break;
        case H('PirateShip'):
          if (type !== undefined) LoadSpaceShipScript(CreatePirateShip(type), e, lag, this.xmlAI);
          break;
        case H('CreateAsteroid'):
          LoadSpaceObjectScript(CreateSmallAsteroid(), e, lag);
          break;
        case H('CreateBasePart'):
          if (type !== undefined) LoadSpaceObjectScript(CreateBasePart(type), e, lag);
          break;
        case H('CreateBigAsteroid'):
          LoadSpaceObjectScript(CreateBigAsteroid(type ?? 0), e, lag);
          break;
        case H('CreateMBuilding'):
          if (type !== undefined) LoadGroundObjectScript(CreateMilitaryBuilding(type), e, lag, this.xmlAI);
          break;
        case H('CreateBuilding'):
          if (type !== undefined) LoadGroundObjectScript(CreateCivilianBuilding(type), e, lag, this.xmlAI);
          break;
        case H('CreateTracked'):
          if (type !== undefined) LoadGroundObjectScript(CreateTracked(type), e, lag, this.xmlAI);
          break;
        case H('CreateWheeled'):
          if (type !== undefined) LoadGroundObjectScript(CreateWheeled(type), e, lag, this.xmlAI);
          break;
      }
    }
  }
}
