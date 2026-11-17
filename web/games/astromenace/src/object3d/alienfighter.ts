// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later), port of src/object3d/space_ship/
// alien_space_fighter.cpp: the 17 alien fighters. Changed for the browser by the freegames project, 2026.
import { Vec3 } from '../core/math.ts';
import { type ParticleSystem, ParticleCreationType, createParticleSystem, createPointLight, alive } from '../core/particles.ts';
import { ObjectStatus, ObjectType, loadObjectData } from './object3d.ts';
import { world } from './world.ts';
import { SpaceShip, ShipWeaponSlot } from './spaceship.ts';
import { CreateWeapon } from './weapon.ts';
import { G, GameSFX } from '../game/globals.ts';

/* eslint-disable no-var */
/** EngineQuantity, Armor, Shield */
const PresetAlienSpaceFighterData: [number, number, number][] = [
  [4, 5, 0], [5, 15, 0], [5, 60, 0], [8, 40, 0], [7, 30, 0], [6, 120, 0], [8, 250, 100], [7, 200, 50], [11, 500, 200],
  [7, 250, 50], [6, 150, 100], [5, 200, 100], [5, 300, 200], [8, 400, 300], [4, 50, 100], [4, 100, 150], [6, 150, 200],
];

const GFX = { BigEngine: 0, BigEngineBase: 1, SmallEngine1: 2, SmallEngine2: 3, Cockpit: 4, DualCockpit: 5, Illumination: 6 };
const Turquoise = { r: 0.0, g: 0.7, b: 1.0 };
const LightViolet = { r: 0.0, g: 0.4, b: 1.0 };
const LightSkyey = { r: 0.7, g: 1.0, b: 1.0 };

function SetupGFX(ParticleSystem: ParticleSystem, Type: number): void {
    const tmpHash = "gfx/flare1.tga";
    ParticleSystem.Texture = tmpHash;
    ParticleSystem.Direction.set(0.0, 0.0, -1.0);
    switch (Type) {
    case GFX.BigEngine:
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
        ParticleSystem.Light = createPointLight(new Vec3(0.0, 0.0, 0.0), 0.35, 0.85, 1.0, 0.0, 0.1);
        ParticleSystem.LightNeedDeviation = true;
        break;
    case GFX.BigEngineBase:
        ParticleSystem.ColorStart = { ...LightViolet };
        ParticleSystem.ColorEnd = { ...Turquoise };
        ParticleSystem.AlphaStart = 1.00;
        ParticleSystem.AlphaEnd = 0.00;
        ParticleSystem.SizeStart = 0.50;
        ParticleSystem.SizeVar = 0.10;
        ParticleSystem.SizeEnd = 0.10;
        ParticleSystem.Speed = 7.00;
        ParticleSystem.SpeedOnCreation = -1.00;
        ParticleSystem.Theta = 360.00;
        ParticleSystem.Life = 1.50;
        ParticleSystem.ParticlesPerSec = 40;
        ParticleSystem.IsMagnet = true;
        ParticleSystem.Light = createPointLight(new Vec3(0.0, 0.0, 0.0), 0.0, 0.55, 1.0, 0.0, 0.1);
        ParticleSystem.LightNeedDeviation = true;
        break;
    case GFX.SmallEngine1:
        ParticleSystem.ColorStart = { ...Turquoise };
        ParticleSystem.ColorEnd = { ...LightSkyey };
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
        ParticleSystem.CreationSize.set(0.4, 0.7, 0.1);
        ParticleSystem.IsMagnet = true;
        ParticleSystem.Light = createPointLight(new Vec3(0.0, 0.0, 0.0), 0.35, 0.85, 1.0, 0.0, 0.3);
        ParticleSystem.LightNeedDeviation = true;
        break;
    case GFX.SmallEngine2:
        ParticleSystem.ColorStart = { ...Turquoise };
        ParticleSystem.ColorEnd = { ...LightSkyey };
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
        ParticleSystem.Light = createPointLight(new Vec3(0.0, 0.0, 0.0), 0.35, 0.85, 1.0, 0.0, 0.3);
        ParticleSystem.LightNeedDeviation = true;
        break;
    case GFX.Cockpit:
        ParticleSystem.ColorStart = { ...Turquoise };
        ParticleSystem.ColorEnd = { ...LightSkyey };
        ParticleSystem.AlphaStart = 0.50;
        ParticleSystem.AlphaEnd = 0.00;
        ParticleSystem.SizeStart = 0.30;
        ParticleSystem.SizeVar = 0.30;
        ParticleSystem.SizeEnd = 0.20;
        ParticleSystem.Speed = 3.0;
        ParticleSystem.SpeedOnCreation = -1.0;
        ParticleSystem.Theta = 360.00;
        ParticleSystem.Life = 1.0;
        ParticleSystem.ParticlesPerSec = 15;
        ParticleSystem.IsMagnet = true;
        break;
    case GFX.DualCockpit:
        ParticleSystem.ColorStart = { ...Turquoise };
        ParticleSystem.ColorEnd = { ...LightSkyey };
        ParticleSystem.AlphaStart = 0.50;
        ParticleSystem.AlphaEnd = 0.00;
        ParticleSystem.SizeStart = 0.50;
        ParticleSystem.SizeVar = 0.30;
        ParticleSystem.SizeEnd = 0.20;
        ParticleSystem.Speed = 3.0;
        ParticleSystem.SpeedOnCreation = -1.0;
        ParticleSystem.Theta = 360.00;
        ParticleSystem.Life = 1.0;
        ParticleSystem.ParticlesPerSec = 20;
        ParticleSystem.IsMagnet = true;
        ParticleSystem.CreationType = ParticleCreationType.Sphere;
        ParticleSystem.CreationSize.set(0.1, 0.9, 0.1);
        break;
    case GFX.Illumination:
        ParticleSystem.ColorStart = { ...Turquoise };
        ParticleSystem.ColorEnd = { ...LightSkyey };
        ParticleSystem.AlphaStart = 1.00;
        ParticleSystem.AlphaEnd = 0.20;
        ParticleSystem.SizeStart = 0.30;
        ParticleSystem.SizeVar = 0.10;
        ParticleSystem.SizeEnd = 0.10;
        ParticleSystem.Speed = 8.00;
        ParticleSystem.SpeedOnCreation = -1.00;
        ParticleSystem.Theta = 0.00;
        ParticleSystem.Life = 0.30;
        ParticleSystem.ParticlesPerSec = 20;
        ParticleSystem.CreationType = ParticleCreationType.Sphere;
        ParticleSystem.CreationSize.set(0.1, 0.2, 0.1);
        ParticleSystem.IsMagnet = true;
        break;
    }
}

class AlienSpaceFighter extends SpaceShip {
  constructor(SpaceShipNum: number) {
    super();
    if (SpaceShipNum <= 0 || SpaceShipNum > PresetAlienSpaceFighterData.length) return;
    const d = PresetAlienSpaceFighterData[SpaceShipNum - 1];
    this.ObjectStatus = ObjectStatus.Enemy;
    this.ObjectType = ObjectType.AlienFighter;
    this.InternalType = SpaceShipNum;
    this.PromptDrawDist2 = 100.0;
    this.MaxSpeed = 40.0;
    this.MaxAcceler = 20.0;
    this.MaxSpeedRotate = 40.0;
    this.ArmorCurrentStatus = this.ArmorInitialStatus = d[1] / G.GameEnemyArmorPenalty;
    this.ShieldCurrentStatus = this.ShieldInitialStatus = d[2] / G.GameEnemyArmorPenalty;
    this.ShieldRechargeRate = this.ShieldInitialStatus / 10.0;
    loadObjectData(`models/alienfighter/al-${String(SpaceShipNum).padStart(2, '0')}.vw3d`, this);
    for (let i = 0; i < this.Chunks.length; i++) {
      this.Texture[i] = 'models/alienfighter/al-text04.vw2d';
      this.TextureIllum[i] = 'models/alienfighter/al-illum04.vw2d';
    }
    this.Engines = Array.from({ length: d[0] }, () => null);
    this.EnginesLocation = Array.from({ length: d[0] }, () => new Vec3());
    switch (SpaceShipNum) {
        case 1:
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(101), new Vec3(0.0, 0.25, 1.85)));
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(0.0, 0.65, -2.3);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.BigEngine);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(-1.9, 0.45, -3.8);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine1);
            }
            this.Engines[2] = createParticleSystem();
            this.EnginesLocation[2] = new Vec3(1.9, 0.45, -3.8);
            var sharedEngine = alive(this.Engines[2]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine1);
            }
            this.Engines[3] = createParticleSystem();
            this.EnginesLocation[3] = new Vec3(0.0, 0.25, 1.85);
            var sharedEngine = alive(this.Engines[3]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Cockpit);
            }
            break;
        case 2:
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(101), new Vec3(0.0, -0.30, 3.95)));
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(0.0, 0.8, -3.1);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.BigEngine);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(0.0, -1.0, -4.3);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.BigEngine);
            }
            this.Engines[2] = createParticleSystem();
            this.EnginesLocation[2] = new Vec3(2.85, 1.1, -5.8);
            var sharedEngine = alive(this.Engines[2]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine1);
            }
            this.Engines[3] = createParticleSystem();
            this.EnginesLocation[3] = new Vec3(-2.85, 1.1, -5.8);
            var sharedEngine = alive(this.Engines[3]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine1);
            }
            this.Engines[4] = createParticleSystem();
            this.EnginesLocation[4] = new Vec3(0.0, -0.30, 3.95);
            var sharedEngine = alive(this.Engines[4]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Illumination);
                sharedEngine.Direction = new Vec3(0.0, 0.3, -1.0);
            }
            break;
        case 3:
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(102), new Vec3(0.0, -0.35, 3.9)));
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(0.0, 0.8, -5.5);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.BigEngine);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(0.0, -1.1, -6.5);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.BigEngine);
            }
            this.Engines[2] = createParticleSystem();
            this.EnginesLocation[2] = new Vec3(5.6, 1.1, -3.3);
            var sharedEngine = alive(this.Engines[2]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine1);
            }
            this.Engines[3] = createParticleSystem();
            this.EnginesLocation[3] = new Vec3(-5.6, 1.1, -3.3);
            var sharedEngine = alive(this.Engines[3]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine1);
            }
            this.Engines[4] = createParticleSystem();
            this.EnginesLocation[4] = new Vec3(0.0, -0.35, 3.9);
            var sharedEngine = alive(this.Engines[4]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Illumination);
                sharedEngine.SizeStart = 0.40;
                sharedEngine.SizeVar = 0.20;
                sharedEngine.Speed = 9.0;
                sharedEngine.Direction = new Vec3(0.0, -0.3, 1.0);
            }
            break;
        case 4:
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(101), new Vec3(0.75, -0.15, 5.1)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(101), new Vec3(-0.75, -0.15, 5.1)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.SFX = GameSFX.none;
            }
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(101), new Vec3(0.85, -1.4, 6.5)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.SFX = GameSFX.none;
            }
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(101), new Vec3(-0.85, -1.4, 6.5)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.SFX = GameSFX.none;
            }
            this.WeaponFireType = 1;
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(0.0, 1.4, -3.7);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.BigEngine);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(0.0, -0.6, -5.0);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.BigEngine);
            }
            this.Engines[2] = createParticleSystem();
            this.EnginesLocation[2] = new Vec3(1.5, 1.9, -7.1);
            var sharedEngine = alive(this.Engines[2]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine1);
            }
            this.Engines[3] = createParticleSystem();
            this.EnginesLocation[3] = new Vec3(-1.5, 1.9, -7.1);
            var sharedEngine = alive(this.Engines[3]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine1);
            }
            this.Engines[4] = createParticleSystem();
            this.EnginesLocation[4] = new Vec3(0.75, -0.15, 5.1);
            var sharedEngine = alive(this.Engines[4]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Cockpit);
            }
            this.Engines[5] = createParticleSystem();
            this.EnginesLocation[5] = new Vec3(-0.75, -0.15, 5.1);
            var sharedEngine = alive(this.Engines[5]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Cockpit);
            }
            this.Engines[6] = createParticleSystem();
            this.EnginesLocation[6] = new Vec3(0.85, -1.4, 6.5);
            var sharedEngine = alive(this.Engines[6]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Cockpit);
            }
            this.Engines[7] = createParticleSystem();
            this.EnginesLocation[7] = new Vec3(-0.85, -1.4, 6.5);
            var sharedEngine = alive(this.Engines[7]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Cockpit);
            }
            break;
        case 5:
            this.MaxSpeedRotate = 720.0;
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(103), new Vec3(0.0, 0.0, 0.0)));
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(1.0, 0.0, -4.0);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine1);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(-1.0, 0.0, -4.0);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine1);
            }
            this.Engines[2] = createParticleSystem();
            this.EnginesLocation[2] = new Vec3(0.0, 0.0, -2.2);
            var sharedEngine = alive(this.Engines[2]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.DualCockpit);
            }
            this.Engines[3] = createParticleSystem();
            this.EnginesLocation[3] = new Vec3(1.0, 0.0, -2.0);
            var sharedEngine = alive(this.Engines[3]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.DualCockpit);
            }
            this.Engines[4] = createParticleSystem();
            this.EnginesLocation[4] = new Vec3(-1.0, 0.0, -2.0);
            var sharedEngine = alive(this.Engines[4]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.DualCockpit);
            }
            this.Engines[5] = createParticleSystem();
            this.EnginesLocation[5] = new Vec3(1.7, 0.0, -1.3);
            var sharedEngine = alive(this.Engines[5]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.DualCockpit);
            }
            this.Engines[6] = createParticleSystem();
            this.EnginesLocation[6] = new Vec3(-1.7, 0.0, -1.3);
            var sharedEngine = alive(this.Engines[6]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.DualCockpit);
            }
            break;
        case 6:
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(104), new Vec3(0.0, 0.35, 2.65)));
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(0.0, 2.4, -7.4);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.BigEngine);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(0.0, 2.4, -7.4);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.BigEngineBase);
            }
            this.Engines[2] = createParticleSystem();
            this.EnginesLocation[2] = new Vec3(0.0, -1.3, -5.0);
            var sharedEngine = alive(this.Engines[2]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.BigEngine);
            }
            this.Engines[3] = createParticleSystem();
            this.EnginesLocation[3] = new Vec3(4.05, 1.4, -6.8);
            var sharedEngine = alive(this.Engines[3]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine1);
            }
            this.Engines[4] = createParticleSystem();
            this.EnginesLocation[4] = new Vec3(-4.05, 1.4, -6.8);
            var sharedEngine = alive(this.Engines[4]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine1);
            }
            this.Engines[5] = createParticleSystem();
            this.EnginesLocation[5] = new Vec3(0.0, 0.35, 2.65);
            var sharedEngine = alive(this.Engines[5]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Cockpit);
                sharedEngine.SizeStart = 0.50;
            }
            break;
        case 7:
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(105), new Vec3(0.0, -0.70, 7.0)));
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(0.0, 1.8, -10.2);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.BigEngine);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(0.0, -1.8, -3.1);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.BigEngine);
            }
            this.Engines[2] = createParticleSystem();
            this.EnginesLocation[2] = new Vec3(3.4, 1.0, -5.6);
            var sharedEngine = alive(this.Engines[2]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine2);
            }
            this.Engines[3] = createParticleSystem();
            this.EnginesLocation[3] = new Vec3(-3.4, 1.0, -5.6);
            var sharedEngine = alive(this.Engines[3]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine2);
            }
            this.Engines[4] = createParticleSystem();
            this.EnginesLocation[4] = new Vec3(0.0, -0.70, 7.0);
            var sharedEngine = alive(this.Engines[4]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Illumination);
                sharedEngine.SizeStart = 0.40;
                sharedEngine.SizeVar = 0.20;
                sharedEngine.Direction = new Vec3(0.0, 0.3, -1.0);
            }
            this.Engines[5] = createParticleSystem();
            this.EnginesLocation[5] = new Vec3(1.6, -2.2, 6.5);
            var sharedEngine = alive(this.Engines[5]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Illumination);
                sharedEngine.Direction = new Vec3(-0.3, 0.0, 1.0);
            }
            this.Engines[6] = createParticleSystem();
            this.EnginesLocation[6] = new Vec3(-1.6, -2.2, 6.5);
            var sharedEngine = alive(this.Engines[6]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Illumination);
                sharedEngine.Direction = new Vec3(0.3, 0.0, 1.0);
            }
            this.Engines[7] = createParticleSystem();
            this.EnginesLocation[7] = new Vec3(0.0, 1.8, -10.2);
            var sharedEngine = alive(this.Engines[7]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.BigEngineBase);
            }
            break;
        case 8:
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(103), new Vec3(0.0, 1.10, -0.5)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 4.0;
            }
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(0.0, 1.4, -8.6);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.BigEngine);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(0.0, -0.2, -9.7);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.BigEngine);
            }
            this.Engines[2] = createParticleSystem();
            this.EnginesLocation[2] = new Vec3(5.0, 2.25, -7.3);
            var sharedEngine = alive(this.Engines[2]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine2);
            }
            this.Engines[3] = createParticleSystem();
            this.EnginesLocation[3] = new Vec3(-5.0, 2.25, -7.3);
            var sharedEngine = alive(this.Engines[3]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine2);
            }
            this.Engines[4] = createParticleSystem();
            this.EnginesLocation[4] = new Vec3(0.0, 1.10, -0.5);
            var sharedEngine = alive(this.Engines[4]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Illumination);
                sharedEngine.SizeStart = 0.60;
                sharedEngine.SizeVar = 0.10;
                sharedEngine.Direction = new Vec3(0.0, -0.3, 1.0);
            }
            this.Engines[5] = createParticleSystem();
            this.EnginesLocation[5] = new Vec3(1.25, -0.95, 5.4);
            var sharedEngine = alive(this.Engines[5]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Illumination);
                sharedEngine.Direction = new Vec3(-0.22, 0.25, 1.0);
            }
            this.Engines[6] = createParticleSystem();
            this.EnginesLocation[6] = new Vec3(-1.25, -0.95, 5.4);
            var sharedEngine = alive(this.Engines[6]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Illumination);
                sharedEngine.Direction = new Vec3(0.22, 0.25, 1.0);
            }
            break;
        case 9:
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(103), new Vec3(0.0, 0.10, 4.9)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.NextFireTime /= 3.0;
            }
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(107), new Vec3(0.0, 0.0, 0.0)));
            this.WeaponFireType = 1;
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(0.0, 0.2, -5.8);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.BigEngine);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(0.0, -1.4, -6.6);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.BigEngine);
            }
            this.Engines[2] = createParticleSystem();
            this.EnginesLocation[2] = new Vec3(3.0, 1.5, -8.0);
            var sharedEngine = alive(this.Engines[2]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.BigEngine);
            }
            this.Engines[3] = createParticleSystem();
            this.EnginesLocation[3] = new Vec3(-3.0, 1.5, -8.0);
            var sharedEngine = alive(this.Engines[3]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.BigEngine);
            }
            this.Engines[4] = createParticleSystem();
            this.EnginesLocation[4] = new Vec3(3.0, 1.5, -8.0);
            var sharedEngine = alive(this.Engines[4]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.BigEngineBase);
            }
            this.Engines[5] = createParticleSystem();
            this.EnginesLocation[5] = new Vec3(-3.0, 1.5, -8.0);
            var sharedEngine = alive(this.Engines[5]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.BigEngineBase);
            }
            this.Engines[6] = createParticleSystem();
            this.EnginesLocation[6] = new Vec3(7.1, 0.6, -4.9);
            var sharedEngine = alive(this.Engines[6]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine2);
            }
            this.Engines[7] = createParticleSystem();
            this.EnginesLocation[7] = new Vec3(-7.1, 0.6, -4.9);
            var sharedEngine = alive(this.Engines[7]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine2);
            }
            this.Engines[8] = createParticleSystem();
            this.EnginesLocation[8] = new Vec3(0.0, 0.10, 4.9);
            var sharedEngine = alive(this.Engines[8]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Illumination);
                sharedEngine.SizeStart = 0.50;
                sharedEngine.Direction = new Vec3(0.0, 0.3, -1.0);
            }
            this.Engines[9] = createParticleSystem();
            this.EnginesLocation[9] = new Vec3(2.05, -1.15, 4.15);
            var sharedEngine = alive(this.Engines[9]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Illumination);
                sharedEngine.Direction = new Vec3(-0.6, 0.0, 0.5);
                sharedEngine.SizeVar = sharedEngine.SizeEnd = 0.20;
            }
            this.Engines[10] = createParticleSystem();
            this.EnginesLocation[10] = new Vec3(-2.05, -1.15, 4.15);
            var sharedEngine = alive(this.Engines[10]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Illumination);
                sharedEngine.Direction = new Vec3(0.6, 0.0, 0.5);
                sharedEngine.SizeVar = sharedEngine.SizeEnd = 0.20;
            }
            break;
        case 10:
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(106), new Vec3(0.0, 0.0, 0.0)));
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(0.0, 0.8, -4.0);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.BigEngine);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(0.0, -1.2, -4.8);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.BigEngine);
            }
            this.Engines[2] = createParticleSystem();
            this.EnginesLocation[2] = new Vec3(3.8, 0.7, -5.7);
            var sharedEngine = alive(this.Engines[2]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.BigEngine);
            }
            this.Engines[3] = createParticleSystem();
            this.EnginesLocation[3] = new Vec3(-3.8, 0.7, -5.7);
            var sharedEngine = alive(this.Engines[3]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.BigEngine);
            }
            this.Engines[4] = createParticleSystem();
            this.EnginesLocation[4] = new Vec3(3.8, 0.7, -5.7);
            var sharedEngine = alive(this.Engines[4]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.BigEngineBase);
            }
            this.Engines[5] = createParticleSystem();
            this.EnginesLocation[5] = new Vec3(-3.8, 0.7, -5.7);
            var sharedEngine = alive(this.Engines[5]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.BigEngineBase);
            }
            this.Engines[6] = createParticleSystem();
            this.EnginesLocation[6] = new Vec3(0.0, 0.65, 4.65);
            var sharedEngine = alive(this.Engines[6]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.DualCockpit);
                sharedEngine.CreationSize = new Vec3(2.4, 0.6, 0.1);
                sharedEngine.ParticlesPerSec = 50;
            }
            break;
        case 11:
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(104), new Vec3(3.9, 1.3, 1.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(104), new Vec3(-3.9, 1.3, 1.0)));
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(0.0, 1.0, -5.4);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.BigEngine);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(0.0, -0.3, -6.2);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.BigEngine);
            }
            this.Engines[2] = createParticleSystem();
            this.EnginesLocation[2] = new Vec3(2.25, -1.1, -4.1);
            var sharedEngine = alive(this.Engines[2]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine1);
            }
            this.Engines[3] = createParticleSystem();
            this.EnginesLocation[3] = new Vec3(-2.25, -1.1, -4.1);
            var sharedEngine = alive(this.Engines[3]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine1);
            }
            this.Engines[4] = createParticleSystem();
            this.EnginesLocation[4] = new Vec3(0.0, 0.50, 0.15);
            var sharedEngine = alive(this.Engines[4]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Cockpit);
                sharedEngine.SizeStart = 0.2;
                sharedEngine.SizeVar = 0.1;
                sharedEngine.Speed = 2.0;
            }
            this.Engines[5] = createParticleSystem();
            this.EnginesLocation[5] = new Vec3(0.0, 1.15, -1.1);
            var sharedEngine = alive(this.Engines[5]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Illumination);
                sharedEngine.Direction = new Vec3(0.0, -0.3, 1.0);
                sharedEngine.Speed = 5.0;
            }
            break;
        case 12:
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(108), new Vec3(0.0, 0.50, 0.8)));
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(1.1, 1.0, -4.4);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine1);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(-1.1, 1.0, -4.4);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine1);
            }
            this.Engines[2] = createParticleSystem();
            this.EnginesLocation[2] = new Vec3(1.1, -1.0, -4.4);
            var sharedEngine = alive(this.Engines[2]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine1);
            }
            this.Engines[3] = createParticleSystem();
            this.EnginesLocation[3] = new Vec3(-1.1, -1.0, -4.4);
            var sharedEngine = alive(this.Engines[3]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine1);
            }
            this.Engines[4] = createParticleSystem();
            this.EnginesLocation[4] = new Vec3(0.0, 0.50, 1.1);
            var sharedEngine = alive(this.Engines[4]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.DualCockpit);
                sharedEngine.CreationSize = new Vec3(1.0, 0.1, 0.1);
            }
            break;
        case 13:
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(109), new Vec3(3.0, 0.0, 0.5)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(109), new Vec3(-3.0, 0.0, 0.5)));
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(1.1, 1.0, -4.4);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine1);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(-1.1, 1.0, -4.4);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine1);
            }
            this.Engines[2] = createParticleSystem();
            this.EnginesLocation[2] = new Vec3(1.1, -1.0, -4.4);
            var sharedEngine = alive(this.Engines[2]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine1);
            }
            this.Engines[3] = createParticleSystem();
            this.EnginesLocation[3] = new Vec3(-1.1, -1.0, -4.4);
            var sharedEngine = alive(this.Engines[3]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine1);
            }
            this.Engines[4] = createParticleSystem();
            this.EnginesLocation[4] = new Vec3(0.0, 0.00, 1.1);
            var sharedEngine = alive(this.Engines[4]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.DualCockpit);
                sharedEngine.CreationSize = new Vec3(0.1, 1.2, 0.1);
            }
            break;
        case 14:
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(108), new Vec3(3.0, 0.0, 0.5)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(108), new Vec3(-3.0, 0.0, 0.5)));
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(1.1, 1.1, -4.9);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine1);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(-1.1, 1.1, -4.9);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine1);
            }
            this.Engines[2] = createParticleSystem();
            this.EnginesLocation[2] = new Vec3(1.1, -1.1, -4.9);
            var sharedEngine = alive(this.Engines[2]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine1);
            }
            this.Engines[3] = createParticleSystem();
            this.EnginesLocation[3] = new Vec3(-1.1, -1.1, -4.9);
            var sharedEngine = alive(this.Engines[3]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine1);
            }
            this.Engines[4] = createParticleSystem();
            this.EnginesLocation[4] = new Vec3(0.75, -0.25, 3.8);
            var sharedEngine = alive(this.Engines[4]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Cockpit);
            }
            this.Engines[5] = createParticleSystem();
            this.EnginesLocation[5] = new Vec3(-0.75, -0.25, 3.8);
            var sharedEngine = alive(this.Engines[5]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Cockpit);
            }
            this.Engines[6] = createParticleSystem();
            this.EnginesLocation[6] = new Vec3(0.8, -1.7, 4.4);
            var sharedEngine = alive(this.Engines[6]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Cockpit);
            }
            this.Engines[7] = createParticleSystem();
            this.EnginesLocation[7] = new Vec3(-0.8, -1.7, 4.4);
            var sharedEngine = alive(this.Engines[7]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.Cockpit);
            }
            break;
        case 15:
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(102), new Vec3(3.8, -1.8, 0.5)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(102), new Vec3(-3.8, -1.8, 0.5)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(101), new Vec3(0.2, 1.9, -3.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(101), new Vec3(-0.2, 1.6, -3.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(101), new Vec3(0.2, 1.4, -3.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(101), new Vec3(-0.2, 1.1, -3.0)));
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(0.0, 2.4, -4.0);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine1);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(0.0, -0.1, -4.0);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine1);
            }
            this.Engines[2] = createParticleSystem();
            this.EnginesLocation[2] = new Vec3(0.0, 1.2, -4.0);
            var sharedEngine = alive(this.Engines[2]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine1);
            }
            this.Engines[3] = createParticleSystem();
            this.EnginesLocation[3] = new Vec3(0.0, 1.0, -2.1);
            var sharedEngine = alive(this.Engines[3]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.DualCockpit);
                sharedEngine.CreationSize = new Vec3(1.0, 2.4, 0.1);
                sharedEngine.ParticlesPerSec = 40;
            }
            break;
        case 16:
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(102), new Vec3(3.7, -1.9, 1.5)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(102), new Vec3(-3.7, -1.9, 1.5)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(108), new Vec3(0.0, 0.2, -0.8)));
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(2.8, 0.2, -7.2);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine1);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(-2.8, 0.2, -7.2);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine1);
            }
            this.Engines[2] = createParticleSystem();
            this.EnginesLocation[2] = new Vec3(0.0, 1.2, -0.8);
            var sharedEngine = alive(this.Engines[2]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.DualCockpit);
                sharedEngine.CreationSize = new Vec3(0.6, 1.7, 0.4);
                sharedEngine.ParticlesPerSec = 40;
            }
            this.Engines[3] = createParticleSystem();
            this.EnginesLocation[3] = new Vec3(0.0, 0.2, -0.8);
            var sharedEngine = alive(this.Engines[3]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.DualCockpit);
                sharedEngine.CreationSize = new Vec3(3.0, 0.4, 0.8);
                sharedEngine.ParticlesPerSec = 40;
            }
            break;
        case 17:
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(108), new Vec3(0.0, -0.85, 1.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(105), new Vec3(1.7, -0.85, 1.9)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(105), new Vec3(-1.7, -0.85, 1.9)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(105), new Vec3(1.0, -0.85, 1.1)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(105), new Vec3(-1.0, -0.85, 1.1)));
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(1.8, 1.0, -7.2);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine1);
                sharedEngine.CreationSize = new Vec3(0.4, 0.4, 0.1);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(-1.8, 1.0, -7.2);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.SmallEngine1);
                sharedEngine.CreationSize = new Vec3(0.4, 0.4, 0.1);
            }
            this.Engines[2] = createParticleSystem();
            this.EnginesLocation[2] = new Vec3(1.0, -0.85, 1.1);
            var sharedEngine = alive(this.Engines[2]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.DualCockpit);
            }
            this.Engines[3] = createParticleSystem();
            this.EnginesLocation[3] = new Vec3(-1.0, -0.85, 1.1);
            var sharedEngine = alive(this.Engines[3]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.DualCockpit);
            }
            this.Engines[4] = createParticleSystem();
            this.EnginesLocation[4] = new Vec3(1.7, -0.85, 1.9);
            var sharedEngine = alive(this.Engines[4]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.DualCockpit);
            }
            this.Engines[5] = createParticleSystem();
            this.EnginesLocation[5] = new Vec3(-1.7, -0.85, 1.9);
            var sharedEngine = alive(this.Engines[5]); if (sharedEngine) {
                SetupGFX(sharedEngine, GFX.DualCockpit);
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

export function CreateAlienSpaceFighter(n: number): SpaceShip {
  const s = new AlienSpaceFighter(n);
  world.ShipList.unshift(s);
  return s;
}
