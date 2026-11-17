// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later), port of src/object3d/space_ship/
// earth_space_fighter.cpp: the 22 Earth fighters (the player's ship and the allies), their engines,
// armour and weapon slots. Changed for the browser by the freegames project, 2026.
import { Vec3 } from '../core/math.ts';
import { type ParticleSystem, ParticleCreationType, createParticleSystem, createPointLight, alive, releaseParticleSystem } from '../core/particles.ts';
import { ObjectStatus, ObjectType, loadObjectData } from './object3d.ts';
import { world } from './world.ts';
import { SpaceShip, ShipWeaponSlot } from './spaceship.ts';
import { CreateWeapon, ReleaseWeapon } from './weapon.ts';
import { PresetEarthSpaceFighterData, EarthFighterLayout } from './earthfighter_data.ts';

const LightYellow = { r: 1.0, g: 0.7, b: 0.3 };
const Red = { r: 1.0, g: 0.0, b: 0.0 };
const MuddyYellow = { r: 0.6, g: 0.6, b: 0.3 };
const LightGreen = { r: 0.3, g: 1.0, b: 0.3 };
const Violet = { r: 0.5, g: 0.5, b: 1.0 };
const LightViolet = { r: 0.0, g: 0.4, b: 1.0 };
const Turquoise = { r: 0.0, g: 0.7, b: 1.0 };
const LightSkyey = { r: 0.7, g: 1.0, b: 1.0 };

export function GetEnginePower(t: number): number {
  return [0, 20, 25, 30, 35][t] ?? 0;
}

export function GetEngineAcceleration(t: number): number {
  return [0, 15, 19, 24, 28][t] ?? 0;
}

export function GetEngineRotatePower(t: number): number {
  return [0, 15, 18, 20, 23][t] ?? 0;
}

export function GetShipArmor(n: number): number {
  return PresetEarthSpaceFighterData[n - 1][0];
}

export function SetEarthSpaceFighterWeapon(ship: SpaceShip | null, slot: number, num: number): boolean {
  const s = alive(ship);
  if (!s) return false;
  if (s.WeaponSlots.length < slot) return false;
  const ws = s.WeaponSlots[slot - 1];
  if (alive(ws.Weapon)) ReleaseWeapon(ws.Weapon);
  ws.Weapon = CreateWeapon(num);
  const w = ws.Weapon;
  if (ws.Type < w.WeaponLevel) {
    ReleaseWeapon(ws.Weapon);
    return false;
  }
  w.SetLocation(ws.Location);
  w.ObjectStatus = s.ObjectStatus;
  return true;
}

export function SetEarthSpaceFighterEngine(ship: SpaceShip | null, EngineType: number): void {
  const s = alive(ship);
  if (!s) return;
  if (EngineType === 0) {
    for (const e of s.Engines) releaseParticleSystem(e);
    for (const e of s.EnginesLeft) releaseParticleSystem(e);
    for (const e of s.EnginesRight) releaseParticleSystem(e);
    s.MaxSpeed = 0;
    s.MaxAcceler = 0;
    s.MaxSpeedRotate = 0;
    return;
  }
  for (let i = 0; i < s.Engines.length; i++) {
    releaseParticleSystem(s.Engines[i]);
    const g = createParticleSystem();
    s.Engines[i] = g;
    CreateSpaceShipEngine(g, EngineType);
    g.SetStartLocation(s.EnginesLocation[i]);
    g.Direction = new Vec3(0, 0, -1);
  }
  for (let i = 0; i < s.EnginesLeft.length; i++) {
    releaseParticleSystem(s.EnginesLeft[i]);
    const g = createParticleSystem();
    s.EnginesLeft[i] = g;
    CreateRotateSpaceShipEngine(g, EngineType);
    g.SetStartLocation(s.EnginesLeftLocation[i]);
    g.Direction = new Vec3(1, 0, 0.6);
    g.IsSuppressed = true;
  }
  for (let i = 0; i < s.EnginesRight.length; i++) {
    releaseParticleSystem(s.EnginesRight[i]);
    const g = createParticleSystem();
    s.EnginesRight[i] = g;
    CreateRotateSpaceShipEngine(g, EngineType);
    g.SetStartLocation(s.EnginesRightLocation[i]);
    g.Direction = new Vec3(-1, 0, 0.6);
    g.IsSuppressed = true;
  }
  s.MaxSpeed = GetEnginePower(EngineType) * s.Engines.length;
  s.MaxAcceler = GetEngineAcceleration(EngineType) * s.Engines.length;
  s.MaxSpeedRotate = GetEngineRotatePower(EngineType) * s.Engines.length;
}

const ArmorTexture = ['sf-text00', 'sf-text04', 'sf-text05', 'sf-text07', 'sf-text08', 'sf-text09', 'sf-text10', 'sf-text06'];
const ArmorIllumTexture = ['sf-illum01', 'sf-illum02', 'sf-illum03', 'sf-illum03', 'sf-illum03', 'sf-illum02', 'sf-illum04', 'sf-illum03'];

export function SetEarthSpaceFighterArmor(ship: SpaceShip | null, ArmorType: number): void {
  const s = alive(ship);
  if (!s) return;
  const ok = ArmorType >= 0 && ArmorType <= 7;
  for (let i = 0; i < s.Chunks.length; i++) {
    s.Texture[i] = ok ? `models/earthfighter/${ArmorTexture[ArmorType]}.vw2d` : null;
    s.TextureIllum[i] = ok ? `models/earthfighter/${ArmorIllumTexture[ArmorType]}.vw2d` : null;
  }
}

class EarthSpaceFighter extends SpaceShip {
  constructor(n: number) {
    super();
    if (n <= 0 || n > PresetEarthSpaceFighterData.length) return;
    this.ObjectStatus = ObjectStatus.Ally;
    this.ObjectType = ObjectType.EarthFighter;
    this.InternalType = n;
    this.PromptDrawDist2 = 100;
    this.ArmorCurrentStatus = this.ArmorInitialStatus = PresetEarthSpaceFighterData[n - 1][0];
    loadObjectData(`models/earthfighter/sf-${String(n).padStart(2, '0')}.vw3d`, this);
    const L = EarthFighterLayout[n];
    const q = PresetEarthSpaceFighterData[n - 1][1];
    this.Engines = Array.from({ length: q }, () => null);
    this.EnginesLocation = Array.from({ length: q }, (_, i) => (L.engines[i] ? new Vec3(L.engines[i][0], L.engines[i][1], L.engines[i][2]) : new Vec3()));
    this.EnginesLeftLocation = [new Vec3(L.left[0], L.left[1], L.left[2])];
    this.EnginesLeft = [null];
    this.EnginesRightLocation = [new Vec3(L.right[0], L.right[1], L.right[2])];
    this.EnginesRight = [null];
    for (const [t, x, y, z] of L.slots) this.WeaponSlots.push(new ShipWeaponSlot(t, new Vec3(x, y, z)));
    // std::sort with the original's comparison (front slots first, then the inner ones, right before left)
    this.WeaponSlots.sort((A, B) => {
      const less = (a: ShipWeaponSlot, b: ShipWeaponSlot): boolean => {
        if (a.Location.z === b.Location.z) {
          if (Math.abs(a.Location.x) === Math.abs(b.Location.x)) return a.Location.x > b.Location.x;
          return Math.abs(a.Location.x) < Math.abs(b.Location.x);
        }
        return a.Location.z > b.Location.z;
      };
      return less(A, B) ? -1 : less(B, A) ? 1 : 0;
    });
  }
}

export function CreateEarthSpaceFighter(n: number): SpaceShip {
  const s = new EarthSpaceFighter(n);
  world.ShipList.unshift(s);
  SetEarthSpaceFighterEngine(s, 1);
  for (const e of s.Engines) {
    const g = alive(e);
    if (g && alive(g.Light)) s.InternalLights++;
  }
  SetEarthSpaceFighterArmor(s, 0);
  return s;
}

export function CreateSpaceShipEngine(ParticleSystem: ParticleSystem, EngineType: number): void
{
    const tmpHash = "gfx/flare1.tga";
    ParticleSystem.Texture = tmpHash;
    switch (EngineType) {
    case 1:
        ParticleSystem.ColorStart = { ...LightYellow };
        ParticleSystem.ColorEnd = { ...Red };
        ParticleSystem.AlphaStart = 1.00;
        ParticleSystem.AlphaEnd = 0.10;
        ParticleSystem.SizeStart = 0.50;
        ParticleSystem.SizeVar = 0.50;
        ParticleSystem.SizeEnd = 0.20;
        ParticleSystem.Speed = 7.00;
        ParticleSystem.SpeedOnCreation = 7.00;
        ParticleSystem.SpeedVar = 2.00;
        ParticleSystem.Theta = 30.00;
        ParticleSystem.Life = 0.50;
        ParticleSystem.ParticlesPerSec = 100;
        ParticleSystem.Light = createPointLight(new Vec3(0.0, 0.0, 0.0), 1.0, 0.35, 0.15, 0.0, 0.07);
        ParticleSystem.LightNeedDeviation = true;
        break;
    case 2:
        ParticleSystem.ColorStart = { ...MuddyYellow };
        ParticleSystem.ColorEnd = { ...LightGreen };
        ParticleSystem.AlphaStart = 1.00;
        ParticleSystem.AlphaEnd = 0.00;
        ParticleSystem.SizeStart = 0.50;
        ParticleSystem.SizeVar = 0.70;
        ParticleSystem.SizeEnd = 0.10;
        ParticleSystem.Speed = 7.00;
        ParticleSystem.SpeedOnCreation = 7.00;
        ParticleSystem.SpeedVar = 2.00;
        ParticleSystem.Theta = 12.00;
        ParticleSystem.Life = 0.50;
        ParticleSystem.ParticlesPerSec = 100;
        ParticleSystem.Light = createPointLight(new Vec3(0.0, 0.0, 0.0), 0.4, 0.75, 0.15, 0.0, 0.07);
        ParticleSystem.LightNeedDeviation = true;
        break;
    case 3:
        ParticleSystem.ColorStart = { ...Violet };
        ParticleSystem.ColorEnd = { ...LightViolet };
        ParticleSystem.AlphaStart = 1.00;
        ParticleSystem.AlphaEnd = 0.00;
        ParticleSystem.SizeStart = 0.50;
        ParticleSystem.SizeVar = 0.50;
        ParticleSystem.SizeEnd = 0.10;
        ParticleSystem.Speed = 7.00;
        ParticleSystem.SpeedOnCreation = 7.00;
        ParticleSystem.SpeedVar = 2.00;
        ParticleSystem.Theta = 3.00;
        ParticleSystem.Life = 0.50;
        ParticleSystem.ParticlesPerSec = 80;
        ParticleSystem.Light = createPointLight(new Vec3(0.0, 0.0, 0.0), 0.25, 0.25, 1.0, 0.0, 0.07);
        ParticleSystem.LightNeedDeviation = true;
        break;
    case 4:
        ParticleSystem.ColorStart = { ...Turquoise };
        ParticleSystem.ColorEnd = { ...LightSkyey };
        ParticleSystem.AlphaStart = 1.00;
        ParticleSystem.AlphaEnd = 0.00;
        ParticleSystem.SizeStart = 0.30;
        ParticleSystem.SizeVar = 0.00;
        ParticleSystem.SizeEnd = 0.10;
        ParticleSystem.Speed = 12.00;
        ParticleSystem.SpeedOnCreation = 12.00;
        ParticleSystem.Theta = 30.00;
        ParticleSystem.Life = 0.30;
        ParticleSystem.ParticlesPerSec = 100;
        ParticleSystem.CreationType = ParticleCreationType.Sphere;
        ParticleSystem.CreationSize.set(0.6, 0.6, 0.1);
        ParticleSystem.IsMagnet = true;
        ParticleSystem.MagnetFactor = 50.0;
        ParticleSystem.Light = createPointLight(new Vec3(0.0, 0.0, 0.0), 0.0, 0.7, 1.0, 0.0, 0.07);
        ParticleSystem.LightNeedDeviation = true;
        break;
    default:
        break;
    }
}
export function CreateRotateSpaceShipEngine(ParticleSystem: ParticleSystem, EngineType: number): void
{
    const tmpHash = "gfx/flare1.tga";
    ParticleSystem.Texture = tmpHash;
    switch (EngineType) {
    case 1:
        ParticleSystem.ColorStart = { ...LightYellow };
        ParticleSystem.ColorEnd = { ...Red };
        ParticleSystem.AlphaStart = 0.60;
        ParticleSystem.AlphaEnd = 0.10;
        ParticleSystem.SizeStart = 0.50;
        ParticleSystem.SizeVar = 0.05;
        ParticleSystem.SizeEnd = 0.10;
        ParticleSystem.Speed = 5.00;
        ParticleSystem.SpeedVar = 5.00;
        ParticleSystem.Theta = 40.00;
        ParticleSystem.Life = 0.50;
        ParticleSystem.IsSuppressed = true;
        ParticleSystem.ParticlesPerSec = 50;
        ParticleSystem.Light = createPointLight(new Vec3(0.0, 0.0, 0.0), 1.0, 0.35, 0.15, 0.0, 0.2);
        ParticleSystem.LightNeedDeviation = true;
        break;
    case 2:
        ParticleSystem.ColorStart = { ...MuddyYellow };
        ParticleSystem.ColorEnd = { ...LightGreen };
        ParticleSystem.AlphaStart = 0.60;
        ParticleSystem.AlphaEnd = 0.10;
        ParticleSystem.SizeStart = 0.5;
        ParticleSystem.SizeVar = 0.05;
        ParticleSystem.SizeEnd = 0.10;
        ParticleSystem.Speed = 5.00;
        ParticleSystem.SpeedVar = 5.00;
        ParticleSystem.Theta = 30.00;
        ParticleSystem.Life = 0.50;
        ParticleSystem.IsSuppressed = true;
        ParticleSystem.ParticlesPerSec = 50;
        ParticleSystem.Light = createPointLight(new Vec3(0.0, 0.0, 0.0), 0.4, 0.75, 0.15, 0.0, 0.2);
        ParticleSystem.LightNeedDeviation = true;
        break;
    case 3:
        ParticleSystem.ColorStart = { ...Violet };
        ParticleSystem.ColorEnd = { ...LightViolet };
        ParticleSystem.AlphaStart = 0.60;
        ParticleSystem.AlphaEnd = 0.10;
        ParticleSystem.SizeStart = 0.5;
        ParticleSystem.SizeVar = 0.05;
        ParticleSystem.SizeEnd = 0.10;
        ParticleSystem.Speed = 5.00;
        ParticleSystem.SpeedVar = 5.00;
        ParticleSystem.Theta = 30.00;
        ParticleSystem.Life = 0.50;
        ParticleSystem.IsSuppressed = true;
        ParticleSystem.ParticlesPerSec = 50;
        ParticleSystem.Light = createPointLight(new Vec3(0.0, 0.0, 0.0), 0.25, 0.25, 1.0, 0.0, 0.2);
        ParticleSystem.LightNeedDeviation = true;
        break;
    case 4:
        ParticleSystem.ColorStart = { ...Turquoise };
        ParticleSystem.ColorEnd = { ...LightSkyey };
        ParticleSystem.AlphaStart = 0.60;
        ParticleSystem.AlphaEnd = 0.10;
        ParticleSystem.SizeStart = 0.5;
        ParticleSystem.SizeVar = 0.05;
        ParticleSystem.SizeEnd = 0.10;
        ParticleSystem.Speed = 5.00;
        ParticleSystem.SpeedVar = 5.00;
        ParticleSystem.Theta = 30.00;
        ParticleSystem.Life = 0.50;
        ParticleSystem.IsSuppressed = true;
        ParticleSystem.ParticlesPerSec = 50;
        ParticleSystem.Light = createPointLight(new Vec3(0.0, 0.0, 0.0), 0.35, 0.85, 1.0, 0.0, 0.2);
        ParticleSystem.LightNeedDeviation = true;
        break;
    default:
        break;
    }
}
