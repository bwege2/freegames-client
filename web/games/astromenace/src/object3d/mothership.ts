// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later), port of src/object3d/space_ship/
// alien_space_mothership.cpp: the 8 alien motherships (the bosses). Changed for the browser by the
// freegames project, 2026.
import { Vec3 } from '../core/math.ts';
import { type ParticleSystem, ParticleCreationType, createParticleSystem, createPointLight, alive } from '../core/particles.ts';
import { ObjectStatus, ObjectType, loadObjectData } from './object3d.ts';
import { world } from './world.ts';
import { SpaceShip, ShipWeaponSlot } from './spaceship.ts';
import { CreateWeapon } from './weapon.ts';
import { G } from '../game/globals.ts';

/* eslint-disable no-var */
/** EngineQuantity, Armor, Shield, texture, illumination texture */
const PresetAlienSpaceMotherShipData: [number, number, number, string, string][] = [
  [10, 3000, 1500, 'alm-text04', 'alm-illum04'], [10, 4000, 3000, 'alm-text04', 'alm-illum04'],
  [8, 5000, 3300, 'alm-text02', 'alm-illum02'], [12, 6000, 3500, 'alm-text02', 'alm-illum02'],
  [19, 7000, 3800, 'alm-text08', 'alm-illum08'], [15, 8000, 4000, 'alm-text08', 'alm-illum08'],
  [6, 9000, 4300, 'alm-text03', 'alm-illum03'], [10, 10000, 4500, 'alm-text03', 'alm-illum03'],
];

const GFX = { Orange_BigEngine: 0, Orange_MidEngine: 1, Orange_BigEnergyRingExt: 2, Orange_BigEnergyRingInt: 3, Orange_MidEnergyRingExt: 4, Orange_MidEnergyRingInt: 5, Blue_MicroEngine: 6, Blue_SmallEngine: 7, Blue_MidEngine: 8, Blue_BigEngine: 9, Blue_EnergyCollector: 10, Violet_BigEngine: 11, Violet_SmallEngine: 12, Violet_BigEnergyRingExt: 13, Violet_BigEnergyRingInt: 14, Violet_EnergyOrb: 15, Violet_MidEngine: 16 };
const LightYellow = { r: 1.0, g: 1.0, b: 0.3 };
const Orange = { r: 1.0, g: 0.3, b: 0.0 };
const Turquoise = { r: 0.0, g: 0.5, b: 1.0 };
const LightSkyey = { r: 0.7, g: 1.0, b: 1.0 };
const Violet = { r: 0.5, g: 0.5, b: 1.0 };

function SetupGFX(ParticleSystem: ParticleSystem, Type: number): void {
    const tmpHash = "gfx/flare1.tga";
    ParticleSystem.Texture = tmpHash;
    ParticleSystem.Direction.set(0.0, 0.0, -1.0);
    switch (Type) {
    case GFX.Orange_BigEngine:
        ParticleSystem.ColorStart = { ...LightYellow };
        ParticleSystem.ColorEnd = { ...Orange };
        ParticleSystem.AlphaStart = 1.00;
        ParticleSystem.AlphaEnd = 0.80;
        ParticleSystem.SizeStart = 0.50;
        ParticleSystem.SizeVar = 0.50;
        ParticleSystem.SizeEnd = 1.00;
        ParticleSystem.Speed = 15.00;
        ParticleSystem.SpeedOnCreation = -1.00;
        ParticleSystem.Theta = 0.00;
        ParticleSystem.Life = 1.00;
        ParticleSystem.ParticlesPerSec = 50;
        ParticleSystem.CreationType = ParticleCreationType.Sphere;
        ParticleSystem.CreationSize.set(2.4, 2.4, 0.1);
        ParticleSystem.IsMagnet = true;
        ParticleSystem.Light = createPointLight(new Vec3(0.0, 0.0, 0.0), 1.0, 0.65, 0.15, 0.0, 0.05);
        ParticleSystem.LightNeedDeviation = true;
        break;
    case GFX.Orange_MidEngine:
        ParticleSystem.ColorStart = { ...LightYellow };
        ParticleSystem.ColorEnd = { ...Orange };
        ParticleSystem.AlphaStart = 1.00;
        ParticleSystem.AlphaEnd = 0.80;
        ParticleSystem.SizeStart = 0.30;
        ParticleSystem.SizeVar = 0.30;
        ParticleSystem.SizeEnd = 0.80;
        ParticleSystem.Speed = 10.00;
        ParticleSystem.SpeedOnCreation = -1.00;
        ParticleSystem.Theta = 0.00;
        ParticleSystem.Life = 1.00;
        ParticleSystem.ParticlesPerSec = 50;
        ParticleSystem.CreationType = ParticleCreationType.Sphere;
        ParticleSystem.CreationSize.set(1.2, 1.2, 0.1);
        ParticleSystem.IsMagnet = true;
        break;
    case GFX.Orange_BigEnergyRingExt:
        ParticleSystem.ColorStart = { ...LightYellow };
        ParticleSystem.ColorEnd = { ...Orange };
        ParticleSystem.AlphaStart = 1.00;
        ParticleSystem.AlphaEnd = 0.00;
        ParticleSystem.SizeStart = 0.50;
        ParticleSystem.SizeVar = 0.10;
        ParticleSystem.SizeEnd = 0.20;
        ParticleSystem.Speed = 0.00;
        ParticleSystem.SpeedOnCreation = -1.00;
        ParticleSystem.Theta = 360.00;
        ParticleSystem.Life = 1.00;
        ParticleSystem.ParticlesPerSec = 400;
        ParticleSystem.CreationType = ParticleCreationType.Sphere;
        ParticleSystem.CreationSize.set(15.0, 15.0, 3.0);
        ParticleSystem.DeadZone = 14.9;
        ParticleSystem.AlphaShowHide = true;
        ParticleSystem.IsMagnet = true;
        ParticleSystem.MagnetFactor = -2.5;
        break;
    case GFX.Orange_BigEnergyRingInt:
        ParticleSystem.ColorStart = { ...LightYellow };
        ParticleSystem.ColorEnd = { ...Orange };
        ParticleSystem.AlphaStart = 1.00;
        ParticleSystem.AlphaEnd = 0.00;
        ParticleSystem.SizeStart = 0.40;
        ParticleSystem.SizeVar = 0.10;
        ParticleSystem.SizeEnd = 0.10;
        ParticleSystem.Speed = 0.00;
        ParticleSystem.SpeedOnCreation = -1.00;
        ParticleSystem.Theta = 360.00;
        ParticleSystem.Life = 1.00;
        ParticleSystem.ParticlesPerSec = 80;
        ParticleSystem.CreationType = ParticleCreationType.Sphere;
        ParticleSystem.CreationSize.set(15.0, 15.0, 3.0);
        ParticleSystem.DeadZone = 14.9;
        ParticleSystem.AlphaShowHide = true;
        ParticleSystem.IsMagnet = true;
        ParticleSystem.MagnetFactor = 15.0;
        break;
    case GFX.Orange_MidEnergyRingExt:
        ParticleSystem.ColorStart = { ...LightYellow };
        ParticleSystem.ColorEnd = { ...Orange };
        ParticleSystem.AlphaStart = 1.00;
        ParticleSystem.AlphaEnd = 0.00;
        ParticleSystem.SizeStart = 0.50;
        ParticleSystem.SizeVar = 0.10;
        ParticleSystem.SizeEnd = 0.20;
        ParticleSystem.Speed = 0.00;
        ParticleSystem.SpeedOnCreation = -1.00;
        ParticleSystem.Theta = 360.00;
        ParticleSystem.Life = 1.00;
        ParticleSystem.ParticlesPerSec = 200;
        ParticleSystem.CreationType = ParticleCreationType.Sphere;
        ParticleSystem.CreationSize.set(9.0, 9.0, 2.0);
        ParticleSystem.DeadZone = 8.9;
        ParticleSystem.AlphaShowHide = true;
        ParticleSystem.IsMagnet = true;
        ParticleSystem.MagnetFactor = -2.5;
        break;
    case GFX.Orange_MidEnergyRingInt:
        ParticleSystem.ColorStart = { ...LightYellow };
        ParticleSystem.ColorEnd = { ...Orange };
        ParticleSystem.AlphaStart = 1.00;
        ParticleSystem.AlphaEnd = 0.00;
        ParticleSystem.SizeStart = 0.40;
        ParticleSystem.SizeVar = 0.10;
        ParticleSystem.SizeEnd = 0.10;
        ParticleSystem.Speed = 0.00;
        ParticleSystem.SpeedOnCreation = -1.00;
        ParticleSystem.Theta = 360.00;
        ParticleSystem.Life = 1.00;
        ParticleSystem.ParticlesPerSec = 50;
        ParticleSystem.CreationType = ParticleCreationType.Sphere;
        ParticleSystem.CreationSize.set(9.0, 9.0, 2.0);
        ParticleSystem.DeadZone = 8.9;
        ParticleSystem.AlphaShowHide = true;
        ParticleSystem.IsMagnet = true;
        ParticleSystem.MagnetFactor = 15.0;
        break;
    case GFX.Blue_MicroEngine:
        ParticleSystem.ColorStart = { ...Turquoise };
        ParticleSystem.ColorEnd =LightSkyey;
        ParticleSystem.AlphaStart = 1.00;
        ParticleSystem.AlphaEnd = 0.20;
        ParticleSystem.SizeStart = 0.30;
        ParticleSystem.SizeVar = 0.00;
        ParticleSystem.SizeEnd = 0.10;
        ParticleSystem.Speed = 6.00;
        ParticleSystem.SpeedOnCreation = 6.00;
        ParticleSystem.Theta = 20.00;
        ParticleSystem.Life = 0.30;
        ParticleSystem.ParticlesPerSec = 50;
        ParticleSystem.CreationType = ParticleCreationType.Sphere;
        ParticleSystem.CreationSize.set(0.5, 0.5, 0.1);
        ParticleSystem.IsMagnet = true;
        break;
    case GFX.Blue_SmallEngine:
        ParticleSystem.ColorStart = { ...Turquoise };
        ParticleSystem.ColorEnd = { ...LightSkyey };
        ParticleSystem.AlphaStart = 1.00;
        ParticleSystem.AlphaEnd = 0.00;
        ParticleSystem.SizeStart = 0.30;
        ParticleSystem.SizeVar = 0.10;
        ParticleSystem.SizeEnd = 0.50;
        ParticleSystem.Speed = 10.00;
        ParticleSystem.SpeedOnCreation = 10.00;
        ParticleSystem.Theta = 0.00;
        ParticleSystem.Life = 1.00;
        ParticleSystem.ParticlesPerSec = 50;
        ParticleSystem.CreationType = ParticleCreationType.Sphere;
        ParticleSystem.CreationSize.set(0.8, 0.8, 0.8);
        ParticleSystem.IsMagnet = true;
        break;
    case GFX.Blue_MidEngine:
        ParticleSystem.ColorStart = { ...Turquoise };
        ParticleSystem.ColorEnd = { ...LightSkyey };
        ParticleSystem.AlphaStart = 1.00;
        ParticleSystem.AlphaEnd = 0.80;
        ParticleSystem.SizeStart = 0.30;
        ParticleSystem.SizeVar = 0.30;
        ParticleSystem.SizeEnd = 0.50;
        ParticleSystem.Speed = 10.00;
        ParticleSystem.SpeedOnCreation = -1.00;
        ParticleSystem.Theta = 0.00;
        ParticleSystem.Life = 1.00;
        ParticleSystem.ParticlesPerSec = 50;
        ParticleSystem.CreationType = ParticleCreationType.Sphere;
        ParticleSystem.CreationSize.set(1.4, 1.4, 0.1);
        ParticleSystem.IsMagnet = true;
        ParticleSystem.MagnetFactor = 13.0;
        break;
    case GFX.Blue_BigEngine:
        ParticleSystem.ColorStart = { ...Turquoise };
        ParticleSystem.ColorEnd = { ...LightSkyey };
        ParticleSystem.AlphaStart = 1.00;
        ParticleSystem.AlphaEnd = 0.80;
        ParticleSystem.SizeStart = 0.30;
        ParticleSystem.SizeVar = 0.30;
        ParticleSystem.SizeEnd = 0.50;
        ParticleSystem.Speed = 15.00;
        ParticleSystem.SpeedOnCreation = -1.00;
        ParticleSystem.Theta = 0.00;
        ParticleSystem.Life = 1.00;
        ParticleSystem.ParticlesPerSec = 50;
        ParticleSystem.CreationType = ParticleCreationType.Sphere;
        ParticleSystem.CreationSize.set(2.4, 2.4, 0.1);
        ParticleSystem.IsMagnet = true;
        ParticleSystem.Light = createPointLight(new Vec3(0.0, 0.0, 0.0), 0.35, 0.75, 1.0, 0.0, 0.03);
        ParticleSystem.LightNeedDeviation = true;
        break;
    case GFX.Blue_EnergyCollector:
        ParticleSystem.ColorStart = { ...Turquoise };
        ParticleSystem.ColorEnd = { ...LightSkyey };
        ParticleSystem.AlphaStart = 1.00;
        ParticleSystem.AlphaEnd = 0.00;
        ParticleSystem.SizeStart = 0.40;
        ParticleSystem.SizeVar = 0.20;
        ParticleSystem.SizeEnd = 0.50;
        ParticleSystem.Speed = 0.00;
        ParticleSystem.SpeedOnCreation = -1.00;
        ParticleSystem.Theta = 360.00;
        ParticleSystem.Life = 0.70;
        ParticleSystem.ParticlesPerSec = 200;
        ParticleSystem.CreationType = ParticleCreationType.Sphere;
        ParticleSystem.CreationSize.set(14.0, 5.0, 10.0);
        ParticleSystem.DeadZone = 4.9;
        ParticleSystem.AlphaShowHide = true;
        ParticleSystem.IsMagnet = true;
        ParticleSystem.MagnetFactor = 15.0;
        ParticleSystem.Light = createPointLight(new Vec3(0.0, 0.0, 0.0), 0.35, 0.75, 1.0, 0.0, 0.01);
        ParticleSystem.LightNeedDeviation = true;
        break;
    case GFX.Violet_BigEngine:
        ParticleSystem.ColorStart = { ...Violet };
        ParticleSystem.ColorEnd = { ...Violet };
        ParticleSystem.AlphaStart = 1.00;
        ParticleSystem.AlphaEnd = 0.80;
        ParticleSystem.SizeStart = 0.80;
        ParticleSystem.SizeVar = 0.30;
        ParticleSystem.SizeEnd = 0.60;
        ParticleSystem.Speed = 20.00;
        ParticleSystem.SpeedOnCreation = -1.00;
        ParticleSystem.Theta = 0.00;
        ParticleSystem.Life = 1.50;
        ParticleSystem.ParticlesPerSec = 150;
        ParticleSystem.CreationType = ParticleCreationType.Sphere;
        ParticleSystem.CreationSize.set(5.0, 3.0, 3.0);
        ParticleSystem.IsMagnet = true;
        ParticleSystem.MagnetFactor = 30.0;
        ParticleSystem.Light = createPointLight(new Vec3(0.0, 0.0, 0.0), 0.5, 0.5, 1.0, 0.0, 0.01);
        ParticleSystem.LightNeedDeviation = true;
        break;
    case GFX.Violet_SmallEngine:
        ParticleSystem.ColorStart = { ...Violet };
        ParticleSystem.ColorEnd = { ...Violet };
        ParticleSystem.AlphaStart = 1.00;
        ParticleSystem.AlphaEnd = 0.80;
        ParticleSystem.SizeStart = 0.30;
        ParticleSystem.SizeVar = 0.30;
        ParticleSystem.SizeEnd = 0.80;
        ParticleSystem.Speed = 10.00;
        ParticleSystem.SpeedOnCreation = -1.00;
        ParticleSystem.Theta = 0.00;
        ParticleSystem.Life = 1.00;
        ParticleSystem.ParticlesPerSec = 50;
        ParticleSystem.CreationType = ParticleCreationType.Sphere;
        ParticleSystem.CreationSize.set(1.2, 1.2, 0.1);
        ParticleSystem.IsMagnet = true;
        ParticleSystem.Light = createPointLight(new Vec3(0.0, 0.0, 0.0), 0.5, 0.5, 1.0, 0.0, 0.05);
        ParticleSystem.LightNeedDeviation = true;
        break;
    case GFX.Violet_BigEnergyRingExt:
        ParticleSystem.ColorStart = { ...Violet };
        ParticleSystem.ColorEnd = { ...Violet };
        ParticleSystem.AlphaStart = 1.00;
        ParticleSystem.AlphaEnd = 0.00;
        ParticleSystem.SizeStart = 0.50;
        ParticleSystem.SizeVar = 0.10;
        ParticleSystem.SizeEnd = 0.20;
        ParticleSystem.Speed = 0.00;
        ParticleSystem.SpeedOnCreation = -1.00;
        ParticleSystem.Theta = 360.00;
        ParticleSystem.Life = 1.00;
        ParticleSystem.ParticlesPerSec = 400;
        ParticleSystem.CreationType = ParticleCreationType.Sphere;
        ParticleSystem.CreationSize.set(14.0, 1.0, 14.0);
        ParticleSystem.DeadZone = 13.9;
        ParticleSystem.AlphaShowHide = true;
        ParticleSystem.IsMagnet = true;
        ParticleSystem.MagnetFactor = -2.5;
        break;
    case GFX.Violet_BigEnergyRingInt:
        ParticleSystem.ColorStart = { ...Violet };
        ParticleSystem.ColorEnd = { ...Violet };
        ParticleSystem.AlphaStart = 1.00;
        ParticleSystem.AlphaEnd = 0.00;
        ParticleSystem.SizeStart = 0.50;
        ParticleSystem.SizeVar = 0.10;
        ParticleSystem.SizeEnd = 0.20;
        ParticleSystem.Speed = 0.00;
        ParticleSystem.SpeedOnCreation = -1.00;
        ParticleSystem.Theta = 360.00;
        ParticleSystem.Life = 1.00;
        ParticleSystem.ParticlesPerSec = 80;
        ParticleSystem.CreationType = ParticleCreationType.Sphere;
        ParticleSystem.CreationSize.set(14.0, 1.0, 14.0);
        ParticleSystem.DeadZone = 13.9;
        ParticleSystem.AlphaShowHide = true;
        ParticleSystem.IsMagnet = true;
        ParticleSystem.MagnetFactor = 20.0;
        break;
    case GFX.Violet_EnergyOrb:
        ParticleSystem.ColorStart = { ...Violet };
        ParticleSystem.ColorEnd = { ...Violet };
        ParticleSystem.AlphaStart = 1.00;
        ParticleSystem.AlphaEnd = 0.00;
        ParticleSystem.SizeStart = 0.90;
        ParticleSystem.SizeVar = 0.10;
        ParticleSystem.SizeEnd = 0.20;
        ParticleSystem.Speed = 10.00;
        ParticleSystem.SpeedOnCreation = -1.00;
        ParticleSystem.Theta = 360.00;
        ParticleSystem.Life = 1.00;
        ParticleSystem.ParticlesPerSec = 50;
        ParticleSystem.IsMagnet = true;
        ParticleSystem.Light = createPointLight(new Vec3(0.0, 0.0, 0.0), 0.5, 0.5, 1.0, 0.0, 0.01);
        ParticleSystem.LightNeedDeviation = true;
        break;
    case GFX.Violet_MidEngine:
        ParticleSystem.ColorStart = { ...Violet };
        ParticleSystem.ColorEnd = { ...Violet };
        ParticleSystem.AlphaStart = 1.00;
        ParticleSystem.AlphaEnd = 0.80;
        ParticleSystem.SizeStart = 0.40;
        ParticleSystem.SizeVar = 0.40;
        ParticleSystem.SizeEnd = 0.50;
        ParticleSystem.Speed = 11.00;
        ParticleSystem.SpeedOnCreation = -1.00;
        ParticleSystem.Theta = 0.00;
        ParticleSystem.Life = 1.00;
        ParticleSystem.ParticlesPerSec = 50;
        ParticleSystem.CreationType = ParticleCreationType.Sphere;
        ParticleSystem.CreationSize.set(2.0, 2.0, 0.1);
        ParticleSystem.IsMagnet = true;
        ParticleSystem.Light = createPointLight(new Vec3(0.0, 0.0, 0.0), 0.5, 0.5, 1.0, 0.0, 0.01);
        ParticleSystem.LightNeedDeviation = true;
        break;
    }
}

class AlienSpaceMotherShip extends SpaceShip {
  constructor(SpaceShipNum: number) {
    super();
    if (SpaceShipNum <= 0 || SpaceShipNum > PresetAlienSpaceMotherShipData.length) return;
    const d = PresetAlienSpaceMotherShipData[SpaceShipNum - 1];
    this.ObjectStatus = ObjectStatus.Enemy;
    this.ObjectType = ObjectType.AlienMotherShip;
    this.InternalType = SpaceShipNum;
    this.PromptDrawDist2 = 20000.0;
    this.MaxSpeed = 20.0;
    this.MaxAcceler = 20.0;
    this.MaxSpeedRotate = 80.0;
    this.ArmorCurrentStatus = this.ArmorInitialStatus = d[1] / G.GameEnemyArmorPenalty;
    this.ShieldCurrentStatus = this.ShieldInitialStatus = d[2] / G.GameEnemyArmorPenalty;
    this.ShieldRechargeRate = this.ShieldInitialStatus / 15.0;
    loadObjectData(`models/alienmothership/alm-0${SpaceShipNum}.vw3d`, this);
    for (let i = 0; i < this.Chunks.length; i++) {
      this.Texture[i] = `models/alienmothership/${d[3]}.vw2d`;
      this.TextureIllum[i] = `models/alienmothership/${d[4]}.vw2d`;
      this.NormalMap[i] = 'models/normalmap/alien_mothership_nm.tga';
    }
    this.Engines = Array.from({ length: d[0] }, () => null);
    this.EnginesLocation = Array.from({ length: d[0] }, () => new Vec3());
    switch (SpaceShipNum) {
        case 1:
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(102), new Vec3(-1.6, 1.0, 19.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(102), new Vec3(1.6, 1.0, 19.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(102), new Vec3(-1.6, -1.0, 19.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(102), new Vec3(1.6, -1.0, 19.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(103), new Vec3(-1.6, 1.5, 18.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(103), new Vec3(1.6, 1.5, 18.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(103), new Vec3(-1.6, -1.5, 18.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(103), new Vec3(1.6, -1.5, 18.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(104), new Vec3(-1.6, 1.0, 19.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(104), new Vec3(1.6, 1.0, 19.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(104), new Vec3(-1.6, -1.0, 19.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(104), new Vec3(1.6, -1.0, 19.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(104), new Vec3(0.0, -8.0, 0.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(104), new Vec3(0.0, -8.0, 0.0)));
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(8.4, 5.2, -24.0);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_BigEngine);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(-8.4, 5.2, -24.0);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_BigEngine);
            }
            this.Engines[2] = createParticleSystem();
            this.EnginesLocation[2] = new Vec3(8.4, -5.6, -24.0);
            var sharedEngine = alive(this.Engines[2]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_BigEngine);
            }
            this.Engines[3] = createParticleSystem();
            this.EnginesLocation[3] = new Vec3(-8.4, -5.6, -24.0);
            var sharedEngine = alive(this.Engines[3]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_BigEngine);
            }
            this.Engines[4] = createParticleSystem();
            this.EnginesLocation[4] = new Vec3(0.0, 8.2, -15.0);
            var sharedEngine = alive(this.Engines[4]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_MidEngine);
            }
            this.Engines[5] = createParticleSystem();
            this.EnginesLocation[5] = new Vec3(0.0, -8.2, -15.0);
            var sharedEngine = alive(this.Engines[5]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_MidEngine);
            }
            this.Engines[6] = createParticleSystem();
            this.EnginesLocation[6] = new Vec3(0.0, 0.0, -8.0);
            var sharedEngine = alive(this.Engines[6]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_BigEnergyRingExt);
            }
            this.Engines[7] = createParticleSystem();
            this.EnginesLocation[7] = new Vec3(0.0, 0.0, -8.0);
            var sharedEngine = alive(this.Engines[7]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_BigEnergyRingInt);
            }
            this.Engines[8] = createParticleSystem();
            this.EnginesLocation[8] = new Vec3(0.0, 0.0, 15.0);
            var sharedEngine = alive(this.Engines[8]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_MidEnergyRingExt);
            }
            this.Engines[9] = createParticleSystem();
            this.EnginesLocation[9] = new Vec3(0.0, 0.0, 15.0);
            var sharedEngine = alive(this.Engines[9]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_MidEnergyRingInt);
            }
            break;
        case 2:
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(103), new Vec3(-10.7, 0.0, -18.5)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(103), new Vec3(10.7, 0.0, -18.5)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(103), new Vec3(-10.7, 0.0, -18.5)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(103), new Vec3(10.7, 0.0, -18.5)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(106), new Vec3(-10.7, 0.0, -18.5)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(106), new Vec3(10.7, 0.0, -18.5)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(106), new Vec3(-4.0, 0.0, 24.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(106), new Vec3(4.0, 0.0, 24.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(102), new Vec3(-1.5, 1.5, 25.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(102), new Vec3(1.5, 1.5, 25.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(102), new Vec3(-1.5, -1.5, 25.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(102), new Vec3(1.5, -1.5, 25.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(102), new Vec3(-4.0, 2.0, 24.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(102), new Vec3(4.0, 2.0, 24.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(102), new Vec3(-4.0, -2.0, 24.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(102), new Vec3(4.0, -2.0, 24.0)));
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(5.6, 7.0, -27.6);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_BigEngine);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(-5.6, 7.0, -27.6);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_BigEngine);
            }
            this.Engines[2] = createParticleSystem();
            this.EnginesLocation[2] = new Vec3(5.6, -7.0, -27.6);
            var sharedEngine = alive(this.Engines[2]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_BigEngine);
            }
            this.Engines[3] = createParticleSystem();
            this.EnginesLocation[3] = new Vec3(-5.6, -7.0, -27.6);
            var sharedEngine = alive(this.Engines[3]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_BigEngine);
            }
            this.Engines[4] = createParticleSystem();
            this.EnginesLocation[4] = new Vec3(10.7, 0.0, -21.5);
            var sharedEngine = alive(this.Engines[4]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_MidEngine);
            }
            this.Engines[5] = createParticleSystem();
            this.EnginesLocation[5] = new Vec3(-10.7, 0.0, -21.5);
            var sharedEngine = alive(this.Engines[5]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_MidEngine);
            }
            this.Engines[6] = createParticleSystem();
            this.EnginesLocation[6] = new Vec3(0.0, 0.0, -14.0);
            var sharedEngine = alive(this.Engines[6]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_BigEnergyRingExt);
            }
            this.Engines[7] = createParticleSystem();
            this.EnginesLocation[7] = new Vec3(0.0, 0.0, -14.0);
            var sharedEngine = alive(this.Engines[7]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_BigEnergyRingInt);
            }
            this.Engines[8] = createParticleSystem();
            this.EnginesLocation[8] = new Vec3(0.0, 0.0, 15.0);
            var sharedEngine = alive(this.Engines[8]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_MidEnergyRingExt);
            }
            this.Engines[9] = createParticleSystem();
            this.EnginesLocation[9] = new Vec3(0.0, 0.0, 15.0);
            var sharedEngine = alive(this.Engines[9]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_MidEnergyRingInt);
            }
            break;
        case 3:
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(104), new Vec3(3.0, -2.0, 13.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(104), new Vec3(-3.0, -2.0, 13.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(104), new Vec3(2.0, -1.0, 13.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(104), new Vec3(-2.0, -1.0, 13.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(104), new Vec3(2.0, -3.0, 13.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(104), new Vec3(-2.0, -3.0, 13.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(109), new Vec3(7.0, -2.0, 13.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(109), new Vec3(-7.0, -2.0, 13.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(110), new Vec3(0.0, -2.0, 27.0)));
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(5.5, 8.1, -26.1);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_BigEngine);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(-5.5, 8.1, -26.1);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_BigEngine);
            }
            this.Engines[2] = createParticleSystem();
            this.EnginesLocation[2] = new Vec3(5.6, -7.2, -28.6);
            var sharedEngine = alive(this.Engines[2]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_BigEngine);
            }
            this.Engines[3] = createParticleSystem();
            this.EnginesLocation[3] = new Vec3(-5.6, -7.2, -28.6);
            var sharedEngine = alive(this.Engines[3]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_BigEngine);
            }
            this.Engines[4] = createParticleSystem();
            this.EnginesLocation[4] = new Vec3(11.9, -1.0, -14.8);
            var sharedEngine = alive(this.Engines[4]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_BigEngine);
            }
            this.Engines[5] = createParticleSystem();
            this.EnginesLocation[5] = new Vec3(-11.9, -1.0, -14.8);
            var sharedEngine = alive(this.Engines[5]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_BigEngine);
            }
            this.Engines[6] = createParticleSystem();
            this.EnginesLocation[6] = new Vec3(0.0, -1.0, -10.0);
            var sharedEngine = alive(this.Engines[6]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_BigEnergyRingExt);
            }
            this.Engines[7] = createParticleSystem();
            this.EnginesLocation[7] = new Vec3(0.0, -1.0, -10.0);
            var sharedEngine = alive(this.Engines[7]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_BigEnergyRingInt);
            }
            break;
        case 4:
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(104), new Vec3(1.0, -1.0, 23.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(104), new Vec3(-1.0, -1.0, 23.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(104), new Vec3(1.0, 0.0, 23.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(104), new Vec3(-1.0, 0.0, 23.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(104), new Vec3(1.0, -2.0, 23.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(104), new Vec3(-1.0, -2.0, 23.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(109), new Vec3(0.0, -1.0, 23.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(109), new Vec3(0.0, -1.0, 23.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(108), new Vec3(8.9, -0.6, 18.0)));
            var sharedWeapon = alive(this.BossWeaponSlots[this.BossWeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.SetRotation(new Vec3(0.0, -15.0, 0.0));
            }
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(108), new Vec3(-8.9, -0.6, 18.0)));
            var sharedWeapon = alive(this.BossWeaponSlots[this.BossWeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.SetRotation(new Vec3(0.0, 15.0, 0.0));
            }
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(108), new Vec3(10.0, -5.6, 18.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(108), new Vec3(-10.0, -5.6, 18.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(108), new Vec3(8.9, -0.6, 18.0)));
            var sharedWeapon = alive(this.BossWeaponSlots[this.BossWeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.SetRotation(new Vec3(0.0, -5.0, 0.0));
            }
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(108), new Vec3(-8.9, -0.6, 18.0)));
            var sharedWeapon = alive(this.BossWeaponSlots[this.BossWeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.SetRotation(new Vec3(0.0, 5.0, 0.0));
            }
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(108), new Vec3(10.0, -5.6, 18.0)));
            var sharedWeapon = alive(this.BossWeaponSlots[this.BossWeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.SetRotation(new Vec3(0.0, -10.0, 0.0));
            }
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(108), new Vec3(-10.0, -5.6, 18.0)));
            var sharedWeapon = alive(this.BossWeaponSlots[this.BossWeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.SetRotation(new Vec3(0.0, 10.0, 0.0));
            }
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(1.9, 5.9, -24.6);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_MidEngine);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(-1.9, 5.9, -24.6);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_MidEngine);
            }
            this.Engines[2] = createParticleSystem();
            this.EnginesLocation[2] = new Vec3(1.9, -2.9, -24.6);
            var sharedEngine = alive(this.Engines[2]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_MidEngine);
            }
            this.Engines[3] = createParticleSystem();
            this.EnginesLocation[3] = new Vec3(-1.9, -2.9, -24.6);
            var sharedEngine = alive(this.Engines[3]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_MidEngine);
            }
            this.Engines[4] = createParticleSystem();
            this.EnginesLocation[4] = new Vec3(2.9, 1.6, -24.6);
            var sharedEngine = alive(this.Engines[4]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_BigEngine);
            }
            this.Engines[5] = createParticleSystem();
            this.EnginesLocation[5] = new Vec3(-2.9, 1.6, -24.6);
            var sharedEngine = alive(this.Engines[5]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_BigEngine);
            }
            this.Engines[6] = createParticleSystem();
            this.EnginesLocation[6] = new Vec3(8.9, -0.6, -12.6);
            var sharedEngine = alive(this.Engines[6]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_BigEngine);
            }
            this.Engines[7] = createParticleSystem();
            this.EnginesLocation[7] = new Vec3(-8.9, -0.6, -12.6);
            var sharedEngine = alive(this.Engines[7]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_BigEngine);
            }
            this.Engines[8] = createParticleSystem();
            this.EnginesLocation[8] = new Vec3(10.0, -5.6, -5.2);
            var sharedEngine = alive(this.Engines[8]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_BigEngine);
            }
            this.Engines[9] = createParticleSystem();
            this.EnginesLocation[9] = new Vec3(-10.0, -5.6, -5.2);
            var sharedEngine = alive(this.Engines[9]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_BigEngine);
            }
            this.Engines[10] = createParticleSystem();
            this.EnginesLocation[10] = new Vec3(0.0, -6.0, 10.0);
            var sharedEngine = alive(this.Engines[10]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_MidEnergyRingExt);
                sharedEngine.CreationSize = new Vec3(6.0, 6.0, 2.0);
                sharedEngine.DeadZone = 5.9;
            }
            this.Engines[11] = createParticleSystem();
            this.EnginesLocation[11] = new Vec3(0.0, -6.0, 10.0);
            var sharedEngine = alive(this.Engines[11]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Orange_MidEnergyRingInt);
                sharedEngine.CreationSize = new Vec3(6.0, 6.0, 2.0);
                sharedEngine.DeadZone = 5.9;
            }
            break;
        case 5:
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(109), new Vec3(0.0, -2.4, 20.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(109), new Vec3(0.0, -2.4, 20.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.SetRotation(new Vec3(0.0, 3.0, 0.0));
            }
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(109), new Vec3(0.0, -2.4, 20.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.SetRotation(new Vec3(0.0, -3.0, 0.0));
            }
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(109), new Vec3(0.0, -2.4, 20.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.SetRotation(new Vec3(0.0, 6.0, 0.0));
            }
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(109), new Vec3(0.0, -2.4, 20.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(109), new Vec3(0.0, -2.4, 20.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.SetRotation(new Vec3(0.0, -6.0, 0.0));
            }
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(109), new Vec3(0.0, -2.4, 20.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.SetRotation(new Vec3(0.0, 9.0, 0.0));
            }
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(109), new Vec3(0.0, -2.4, 20.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.SetRotation(new Vec3(0.0, -9.0, 0.0));
            }
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(106), new Vec3(35.7, -3.0, -13.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(106), new Vec3(-35.7, -3.0, -13.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(106), new Vec3(0.0, -2.4, 20.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(106), new Vec3(0.0, -2.4, 20.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(104), new Vec3(8.85, 5.65, -10.2)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(104), new Vec3(-8.85, 5.65, -10.2)));
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(25.1, 0.65, -18.8);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Blue_MicroEngine);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(-25.1, 0.65, -18.8);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Blue_MicroEngine);
            }
            this.Engines[2] = createParticleSystem();
            this.EnginesLocation[2] = new Vec3(20.6, 0.65, -18.8);
            var sharedEngine = alive(this.Engines[2]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Blue_MicroEngine);
            }
            this.Engines[3] = createParticleSystem();
            this.EnginesLocation[3] = new Vec3(-20.6, 0.65, -18.8);
            var sharedEngine = alive(this.Engines[3]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Blue_MicroEngine);
            }
            this.Engines[4] = createParticleSystem();
            this.EnginesLocation[4] = new Vec3(22.9, 0.65, -20.0);
            var sharedEngine = alive(this.Engines[4]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Blue_SmallEngine);
            }
            this.Engines[5] = createParticleSystem();
            this.EnginesLocation[5] = new Vec3(-22.9, 0.65, -20.0);
            var sharedEngine = alive(this.Engines[5]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Blue_SmallEngine);
            }
            this.Engines[6] = createParticleSystem();
            this.EnginesLocation[6] = new Vec3(22.9, -5.1, -20.0);
            var sharedEngine = alive(this.Engines[6]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Blue_SmallEngine);
            }
            this.Engines[7] = createParticleSystem();
            this.EnginesLocation[7] = new Vec3(-22.9, -5.1, -20.0);
            var sharedEngine = alive(this.Engines[7]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Blue_SmallEngine);
            }
            this.Engines[8] = createParticleSystem();
            this.EnginesLocation[8] = new Vec3(8.85, 5.65, -15.2);
            var sharedEngine = alive(this.Engines[8]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Blue_SmallEngine);
            }
            this.Engines[9] = createParticleSystem();
            this.EnginesLocation[9] = new Vec3(-8.85, 5.65, -15.2);
            var sharedEngine = alive(this.Engines[9]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Blue_SmallEngine);
            }
            this.Engines[10] = createParticleSystem();
            this.EnginesLocation[10] = new Vec3(4.0, 7.0, -21.2);
            var sharedEngine = alive(this.Engines[10]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Blue_MidEngine);
            }
            this.Engines[11] = createParticleSystem();
            this.EnginesLocation[11] = new Vec3(-4.0, 7.0, -21.2);
            var sharedEngine = alive(this.Engines[11]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Blue_MidEngine);
            }
            this.Engines[12] = createParticleSystem();
            this.EnginesLocation[12] = new Vec3(20.4, -2.4, -20.0);
            var sharedEngine = alive(this.Engines[12]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Blue_MidEngine);
            }
            this.Engines[13] = createParticleSystem();
            this.EnginesLocation[13] = new Vec3(-20.4, -2.4, -20.0);
            var sharedEngine = alive(this.Engines[13]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Blue_MidEngine);
            }
            this.Engines[14] = createParticleSystem();
            this.EnginesLocation[14] = new Vec3(25.2, -2.4, -20.0);
            var sharedEngine = alive(this.Engines[14]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Blue_MidEngine);
            }
            this.Engines[15] = createParticleSystem();
            this.EnginesLocation[15] = new Vec3(-25.2, -2.4, -20.0);
            var sharedEngine = alive(this.Engines[15]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Blue_MidEngine);
            }
            this.Engines[16] = createParticleSystem();
            this.EnginesLocation[16] = new Vec3(35.7, -3.0, -13.0);
            var sharedEngine = alive(this.Engines[16]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Blue_BigEngine);
                sharedEngine.Direction = new Vec3(0.4, 0.0, -0.8);
            }
            this.Engines[17] = createParticleSystem();
            this.EnginesLocation[17] = new Vec3(-35.7, -3.0, -13.0);
            var sharedEngine = alive(this.Engines[17]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Blue_BigEngine);
                sharedEngine.Direction = new Vec3(-0.4, 0.0, -0.8);
            }
            this.Engines[18] = createParticleSystem();
            this.EnginesLocation[18] = new Vec3(0.0, -2.4, -23.0);
            var sharedEngine = alive(this.Engines[18]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Blue_EnergyCollector);
            }
            break;
        case 6:
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(103), new Vec3(0.0, -4.4, 18.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(103), new Vec3(0.0, -4.4, 18.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.SetRotation(new Vec3(0.0, 3.0, 0.0));
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(103), new Vec3(0.0, -4.4, 18.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.SetRotation(new Vec3(0.0, -3.0, 0.0));
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(103), new Vec3(0.0, -4.4, 18.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.SetRotation(new Vec3(0.0, 6.0, 0.0));
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(103), new Vec3(0.0, -4.4, 18.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(103), new Vec3(0.0, -4.4, 18.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.SetRotation(new Vec3(0.0, -6.0, 0.0));
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(104), new Vec3(7.0, -4.4, 13.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(104), new Vec3(-7.0, -4.4, 13.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(104), new Vec3(12.0, -4.4, 10.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(104), new Vec3(-12.0, -4.4, 10.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(104), new Vec3(17.0, -4.4, 8.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(104), new Vec3(-17.0, -4.4, 8.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(106), new Vec3(10.0, -6.4, 10.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(106), new Vec3(-10.0, -6.4, 10.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(106), new Vec3(15.0, -6.4, 8.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(106), new Vec3(-15.0, -6.4, 8.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(106), new Vec3(20.0, -6.4, 5.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(106), new Vec3(-20.0, -6.4, 5.0)));
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(0.0, -7.0, -23.0);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Blue_EnergyCollector);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(-25.4, -4.0, -20.0);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Blue_MidEngine);
            }
            this.Engines[2] = createParticleSystem();
            this.EnginesLocation[2] = new Vec3(20.6, -4.0, -20.0);
            var sharedEngine = alive(this.Engines[2]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Blue_MidEngine);
            }
            this.Engines[3] = createParticleSystem();
            this.EnginesLocation[3] = new Vec3(-20.6, -4.0, -20.0);
            var sharedEngine = alive(this.Engines[3]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Blue_MidEngine);
            }
            this.Engines[4] = createParticleSystem();
            this.EnginesLocation[4] = new Vec3(23.4, -1.0, -20.0);
            var sharedEngine = alive(this.Engines[4]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Blue_SmallEngine);
            }
            this.Engines[5] = createParticleSystem();
            this.EnginesLocation[5] = new Vec3(-23.4, -1.0, -20.0);
            var sharedEngine = alive(this.Engines[5]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Blue_SmallEngine);
            }
            this.Engines[6] = createParticleSystem();
            this.EnginesLocation[6] = new Vec3(23.4, -7.0, -20.0);
            var sharedEngine = alive(this.Engines[6]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Blue_SmallEngine);
            }
            this.Engines[7] = createParticleSystem();
            this.EnginesLocation[7] = new Vec3(-23.4, -7.0, -20.0);
            var sharedEngine = alive(this.Engines[7]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Blue_SmallEngine);
            }
            this.Engines[8] = createParticleSystem();
            this.EnginesLocation[8] = new Vec3(5.3, 4.7, -22.9);
            var sharedEngine = alive(this.Engines[8]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Blue_SmallEngine);
            }
            this.Engines[9] = createParticleSystem();
            this.EnginesLocation[9] = new Vec3(-5.3, 4.7, -22.9);
            var sharedEngine = alive(this.Engines[9]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Blue_SmallEngine);
            }
            this.Engines[10] = createParticleSystem();
            this.EnginesLocation[10] = new Vec3(2.6, 6.6, -21.5);
            var sharedEngine = alive(this.Engines[10]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Blue_MidEngine);
            }
            this.Engines[11] = createParticleSystem();
            this.EnginesLocation[11] = new Vec3(-2.6, 6.6, -21.5);
            var sharedEngine = alive(this.Engines[11]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Blue_MidEngine);
            }
            this.Engines[12] = createParticleSystem();
            this.EnginesLocation[12] = new Vec3(2.6, 2.0, -21.5);
            var sharedEngine = alive(this.Engines[12]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Blue_MidEngine);
            }
            this.Engines[13] = createParticleSystem();
            this.EnginesLocation[13] = new Vec3(-2.6, 2.0, -21.5);
            var sharedEngine = alive(this.Engines[13]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Blue_MidEngine);
            }
            this.Engines[14] = createParticleSystem();
            this.EnginesLocation[14] = new Vec3(25.4, -4.0, -20.0);
            var sharedEngine = alive(this.Engines[14]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Blue_MidEngine);
            }
            break;
        case 7:
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(108), new Vec3(0.0, -1.4, 15.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(108), new Vec3(2.0, -1.4, 15.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.SetRotation(new Vec3(0.0, 3.0, 0.0));
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(108), new Vec3(-2.0, -1.4, 15.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.SetRotation(new Vec3(0.0, -3.0, 0.0));
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(108), new Vec3(4.0, -1.4, 15.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.SetRotation(new Vec3(0.0, 6.0, 0.0));
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(108), new Vec3(-4.0, -1.4, 15.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.SetRotation(new Vec3(0.0, -6.0, 0.0));
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(110), new Vec3(12.5, 1.6, -15.3)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(110), new Vec3(-12.5, 1.6, -15.3)));
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(0.0, 2.3, -25.0);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Violet_BigEngine);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(12.5, 1.6, -20.3);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Violet_SmallEngine);
            }
            this.Engines[2] = createParticleSystem();
            this.EnginesLocation[2] = new Vec3(-12.5, 1.6, -20.3);
            var sharedEngine = alive(this.Engines[2]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Violet_SmallEngine);
            }
            this.Engines[3] = createParticleSystem();
            this.EnginesLocation[3] = new Vec3(0.0, -8.0, 0.0);
            var sharedEngine = alive(this.Engines[3]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Violet_BigEnergyRingExt);
            }
            this.Engines[4] = createParticleSystem();
            this.EnginesLocation[4] = new Vec3(0.0, -8.0, 0.0);
            var sharedEngine = alive(this.Engines[4]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Violet_BigEnergyRingInt);
            }
            this.Engines[5] = createParticleSystem();
            this.EnginesLocation[5] = new Vec3(0.0, -8.0, 0.0);
            var sharedEngine = alive(this.Engines[5]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Violet_EnergyOrb);
            }
            break;
        case 8:
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(104), new Vec3(2.0, -2.4, 15.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(104), new Vec3(-2.0, -2.4, 15.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(104), new Vec3(2.0, -4.4, 15.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(104), new Vec3(-2.0, -4.4, 15.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 2.0;
            }
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(110), new Vec3(8.0, -1.0, 15.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(110), new Vec3(-8.0, -1.0, 15.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(107), new Vec3(10.0, -6.4, 8.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(107), new Vec3(-10.0, -6.4, 8.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(107), new Vec3(15.0, -6.4, 5.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(107), new Vec3(-15.0, -6.4, 5.0)));
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(15.0, 4.4, -29.0);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Violet_BigEngine);
                sharedEngine.CreationSize = new Vec3(4.0, 6.0, 3.0);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(-15.0, 4.4, -29.0);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Violet_BigEngine);
                sharedEngine.CreationSize = new Vec3(4.0, 6.0, 3.0);
            }
            this.Engines[2] = createParticleSystem();
            this.EnginesLocation[2] = new Vec3(5.2, 5.4, -20.6);
            var sharedEngine = alive(this.Engines[2]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Violet_MidEngine);
            }
            this.Engines[3] = createParticleSystem();
            this.EnginesLocation[3] = new Vec3(-5.2, 5.4, -20.6);
            var sharedEngine = alive(this.Engines[3]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Violet_MidEngine);
            }
            this.Engines[4] = createParticleSystem();
            this.EnginesLocation[4] = new Vec3(5.2, -8.8, -22.6);
            var sharedEngine = alive(this.Engines[4]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Violet_MidEngine);
            }
            this.Engines[5] = createParticleSystem();
            this.EnginesLocation[5] = new Vec3(-5.2, -8.8, -22.6);
            var sharedEngine = alive(this.Engines[5]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Violet_MidEngine);
            }
            this.Engines[6] = createParticleSystem();
            this.EnginesLocation[6] = new Vec3(11.2, -2.8, -10.0);
            var sharedEngine = alive(this.Engines[6]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Violet_MidEngine);
            }
            this.Engines[7] = createParticleSystem();
            this.EnginesLocation[7] = new Vec3(-11.2, -2.8, -10.0);
            var sharedEngine = alive(this.Engines[7]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Violet_MidEngine);
            }
            this.Engines[8] = createParticleSystem();
            this.EnginesLocation[8] = new Vec3(0.0, -10.0, -3.0);
            var sharedEngine = alive(this.Engines[8]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Violet_BigEnergyRingExt);
                sharedEngine.CreationSize = new Vec3(17.0, 1.0, 17.0);
                sharedEngine.DeadZone = 16.9;
            }
            this.Engines[9] = createParticleSystem();
            this.EnginesLocation[9] = new Vec3(0.0, -10.0, -3.0);
            var sharedEngine = alive(this.Engines[9]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Violet_BigEnergyRingInt);
                sharedEngine.CreationSize = new Vec3(17.0, 1.0, 17.0);
                sharedEngine.DeadZone = 16.9;
            }
            break;
        }
        for (let i = 0; i < this.Engines.length; i++) {
            var sharedEngine = alive(this.Engines[i]); if (sharedEngine) {
                sharedEngine.SetStartLocation(this.EnginesLocation[i]);
                if (alive(sharedEngine.Light)) {
                    this.InternalLights++;
                }
            }
        }
  }
}

export function CreateAlienSpaceMotherShip(n: number): SpaceShip {
  const s = new AlienSpaceMotherShip(n);
  world.ShipList.unshift(s);
  return s;
}
