// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later), port of src/object3d/space_ship/
// pirate_ship.cpp: the 15 pirate gunships and bombers. Changed for the browser by the freegames
// project, 2026.
import { Vec3 } from '../core/math.ts';
import { type ParticleSystem, ParticleCreationType, createParticleSystem, createPointLight, alive } from '../core/particles.ts';
import { ObjectStatus, ObjectType, loadObjectData } from './object3d.ts';
import { world } from './world.ts';
import { SpaceShip, ShipWeaponSlot } from './spaceship.ts';
import { CreateWeapon } from './weapon.ts';
import { G, GameSFX, config } from '../game/globals.ts';

/* eslint-disable no-var */
/** EngineQuantity, Armor, model, texture, normal map */
const PresetPirateShipData: [number, number, string, string, string][] = [
  [2, 20, 'gunship-01', 'gr-04', ''], [2, 30, 'bomber-07', 'gr-04', ''], [2, 100, 'gunship-03', 'gr-03', ''],
  [2, 200, 'gunship-04', 'gr-03', ''], [6, 400, 'gunship-02', 'gr-03', ''], [2, 600, 'bomber-03', 'gr-05', ''],
  [4, 1200, 'bomber-02', 'gr-05', ''], [4, 1000, 'bomber-04', 'gr-03', ''], [6, 2000, 'bomber-05', 'gr-04', 'bomber_nm'],
  [8, 2500, 'bomber-06', 'gr-04', 'bomber_nm'], [2, 300, 'bomber-03', 'gr-05', ''], [4, 600, 'bomber-02', 'gr-05', ''],
  [4, 500, 'bomber-04', 'gr-03', ''], [6, 1000, 'bomber-05', 'gr-04', 'bomber_nm'], [8, 1500, 'bomber-06', 'gr-04', 'bomber_nm'],
];

const GFX = { SmallEngine: 0, MidEngine: 1, BigEngine: 2, VerticalPrimaryEngine: 3, VerticalAuxiliaryEngine: 4 };
const MuddyYellow = { r: 0.6, g: 0.6, b: 0.3 };
const LightGreen = { r: 0.3, g: 1.0, b: 0.3 };

function SetupEngineGFX(ParticleSystem: ParticleSystem, Type: number): void {
    const tmpHash = "gfx/flare1.tga";
    ParticleSystem.Texture = tmpHash;
    ParticleSystem.Direction.set(0.0, 0.0, -1.0);
    switch (Type) {
    case GFX.SmallEngine:
        ParticleSystem.ColorStart = { ...MuddyYellow };
        ParticleSystem.ColorEnd = { ...LightGreen };
        ParticleSystem.AlphaStart = 1.00;
        ParticleSystem.AlphaEnd = 0.00;
        ParticleSystem.SizeStart = 0.10;
        ParticleSystem.SizeVar = 0.20;
        ParticleSystem.SizeEnd = 0.40;
        ParticleSystem.Speed = 6.00;
        ParticleSystem.SpeedOnCreation = -1.00;
        ParticleSystem.SpeedVar = 2.00;
        ParticleSystem.Theta = 5.00;
        ParticleSystem.Life = 0.40;
        ParticleSystem.ParticlesPerSec = 100;
        ParticleSystem.CreationType = ParticleCreationType.Sphere;
        ParticleSystem.CreationSize.set(0.4, 0.4, 0.4);
        ParticleSystem.AlphaShowHide = true;
        ParticleSystem.Light = createPointLight(new Vec3(0.0, 0.0, 0.0), 0.45, 0.8, 0.3, 0.0, 0.1);
        ParticleSystem.LightNeedDeviation = true;
        break;
    case GFX.MidEngine:
        ParticleSystem.ColorStart = { ...MuddyYellow };
        ParticleSystem.ColorEnd = { ...LightGreen };
        ParticleSystem.AlphaStart = 1.00;
        ParticleSystem.AlphaEnd = 0.00;
        ParticleSystem.SizeStart = 0.30;
        ParticleSystem.SizeVar = 0.30;
        ParticleSystem.SizeEnd = 0.60;
        ParticleSystem.Speed = 8.00;
        ParticleSystem.SpeedOnCreation = -1.00;
        ParticleSystem.SpeedVar = 2.00;
        ParticleSystem.Theta = 5.00;
        ParticleSystem.Life = 0.40;
        ParticleSystem.ParticlesPerSec = 100;
        ParticleSystem.CreationType = ParticleCreationType.Sphere;
        ParticleSystem.CreationSize.set(0.6, 0.6, 0.1);
        ParticleSystem.AlphaShowHide = true;
        ParticleSystem.Light = createPointLight(new Vec3(0.0, 0.0, 0.0), 0.45, 0.8, 0.3, 0.0, 0.1);
        ParticleSystem.LightNeedDeviation = true;
        break;
    case GFX.BigEngine:
        ParticleSystem.ColorStart = { ...MuddyYellow };
        ParticleSystem.ColorEnd = { ...LightGreen };
        ParticleSystem.AlphaStart = 1.00;
        ParticleSystem.AlphaEnd = 0.00;
        ParticleSystem.SizeStart = 0.30;
        ParticleSystem.SizeVar = 0.30;
        ParticleSystem.SizeEnd = 0.60;
        ParticleSystem.Speed = 8.00;
        ParticleSystem.SpeedOnCreation = -1.00;
        ParticleSystem.SpeedVar = 2.00;
        ParticleSystem.Theta = 5.00;
        ParticleSystem.Life = 0.40;
        ParticleSystem.ParticlesPerSec = 100;
        ParticleSystem.CreationType = ParticleCreationType.Sphere;
        ParticleSystem.CreationSize.set(1.0, 1.0, 1.0);
        ParticleSystem.AlphaShowHide = true;
        ParticleSystem.Light = createPointLight(new Vec3(0.0, 0.0, 0.0), 0.45, 0.8, 0.3, 0.0, 0.05);
        ParticleSystem.LightNeedDeviation = true;
        break;
    case GFX.VerticalPrimaryEngine:
        ParticleSystem.ColorStart = { ...MuddyYellow };
        ParticleSystem.ColorEnd = { ...LightGreen };
        ParticleSystem.AlphaStart = 1.00;
        ParticleSystem.AlphaEnd = 0.00;
        ParticleSystem.SizeStart = 0.30;
        ParticleSystem.SizeVar = 0.30;
        ParticleSystem.SizeEnd = 0.60;
        ParticleSystem.Speed = 10.00;
        ParticleSystem.SpeedOnCreation = -1.00;
        ParticleSystem.SpeedVar = 2.00;
        ParticleSystem.Theta = 5.00;
        ParticleSystem.Life = 0.50;
        ParticleSystem.ParticlesPerSec = 100;
        ParticleSystem.CreationType = ParticleCreationType.Sphere;
        ParticleSystem.CreationSize.set(1.0, 0.1, 1.0);
        ParticleSystem.AlphaShowHide = true;
        ParticleSystem.Direction.set(0.0, -1.0, 0.0);
        ParticleSystem.Light = createPointLight(new Vec3(0.0, 0.0, 0.0), 0.45, 0.8, 0.3, 0.0, 0.05);
        ParticleSystem.LightNeedDeviation = true;
        break;
    case GFX.VerticalAuxiliaryEngine:
        ParticleSystem.ColorStart = { ...MuddyYellow };
        ParticleSystem.ColorEnd = { ...LightGreen };
        ParticleSystem.AlphaStart = 1.00;
        ParticleSystem.AlphaEnd = 0.00;
        ParticleSystem.SizeStart = 0.30;
        ParticleSystem.SizeVar = 0.20;
        ParticleSystem.SizeEnd = 0.10;
        ParticleSystem.Speed = 3.00;
        ParticleSystem.SpeedOnCreation = -1.00;
        ParticleSystem.SpeedVar = 2.00;
        ParticleSystem.Theta = 180.00;
        ParticleSystem.Life = 0.50;
        ParticleSystem.ParticlesPerSec = 100;
        ParticleSystem.AlphaShowHide = true;
        ParticleSystem.Direction.set(0.0, 1.0, 0.0);
        ParticleSystem.Light = createPointLight(new Vec3(0.0, 0.0, 0.0), 0.45, 0.8, 0.3, 0.0, 0.1);
        ParticleSystem.LightNeedDeviation = true;
        break;
    }
}

class PirateShip extends SpaceShip {
  constructor(SpaceShipNum: number) {
    super();
    if (SpaceShipNum <= 0 || SpaceShipNum > PresetPirateShipData.length) return;
    const d = PresetPirateShipData[SpaceShipNum - 1];
    this.ObjectStatus = ObjectStatus.Enemy;
    this.ObjectType = ObjectType.PirateShip;
    this.InternalType = SpaceShipNum;
    this.PromptDrawDist2 = 100.0;
    if (SpaceShipNum > 5) this.PromptDrawDist2 = 20000.0;
    this.MaxSpeed = 20.0;
    this.MaxAcceler = 20.0;
    this.MaxSpeedRotate = 40.0;
    this.ArmorCurrentStatus = this.ArmorInitialStatus = d[1] / G.GameEnemyArmorPenalty;
    loadObjectData(`models/pirateship/${d[2]}.vw3d`, this);
    for (let i = 0; i < this.Chunks.length; i++) {
      this.Texture[i] = `models/${d[3]}.vw2d`;
      if (d[4] && config.UseGLSL120) this.NormalMap[i] = `models/normalmap/${d[4]}.tga`;
    }
    this.EnginesLocation = Array.from({ length: d[0] }, () => new Vec3());
    this.Engines = Array.from({ length: d[0] }, () => null);
    switch (SpaceShipNum) {
        case 1:
            this.MaxSpeed = 30.0;
            this.MaxAcceler = 30.0;
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(204), new Vec3(1.8, -1.2, 6.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(204), new Vec3(-1.8, -1.2, 6.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.SFX = GameSFX.none;
            }
            this.WeaponFireType = 1;
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(0.9, 1.6, -5.4);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.SmallEngine);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(-0.9, 1.6, -5.4);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.SmallEngine);
            }
            break;
        case 2:
            this.MaxSpeed = 50.0;
            this.MaxAcceler = 50.0;
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(205), new Vec3(0.0, -2.0, 2.0)));
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(1.1, 0.5, -5.7);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(-1.1, 0.5, -5.7);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            break;
        case 3:
            this.MaxSpeed = 30.0;
            this.MaxAcceler = 30.0;
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(204), new Vec3(3.0, -0.2, -0.5)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(204), new Vec3(-3.0, -0.2, -0.5)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(206), new Vec3(2.0, -0.2, 0.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(206), new Vec3(-2.0, -0.2, 0.0)));
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(1.0, 1.8, -1.2);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.SmallEngine);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(-1.0, 1.8, -1.2);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.SmallEngine);
            }
            break;
        case 4:
            this.MaxSpeed = 30.0;
            this.MaxAcceler = 30.0;
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(211), new Vec3(4.3, -0.4, -0.5)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(211), new Vec3(-4.3, -0.4, -0.5)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(205), new Vec3(3.0, -0.4, 0.5)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(205), new Vec3(-3.0, -0.4, 0.5)));
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(1.3, 1.9, -1.7);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(-1.3, 1.9, -1.7);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            break;
        case 5:
            this.MaxSpeed = 30.0;
            this.MaxAcceler = 30.0;
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(211), new Vec3(1.0, 4.2, -5.5)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(211), new Vec3(-1.0, 4.2, -5.5)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(211), new Vec3(0.5, -1.8, 5.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(211), new Vec3(-0.5, -1.8, 5.0)));
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(5.8, 6.5 - 4.6, 0.0);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.VerticalPrimaryEngine);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(-5.8, 6.5 - 4.6, 0.0);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.VerticalPrimaryEngine);
            }
            this.Engines[2] = createParticleSystem();
            this.EnginesLocation[2] = new Vec3(5.8, 7.3 - 4.6, 0.0);
            var sharedEngine = alive(this.Engines[2]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.VerticalAuxiliaryEngine);
            }
            this.Engines[3] = createParticleSystem();
            this.EnginesLocation[3] = new Vec3(-5.8, 7.3 - 4.6, 0.0);
            var sharedEngine = alive(this.Engines[3]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.VerticalAuxiliaryEngine);
            }
            this.Engines[4] = createParticleSystem();
            this.EnginesLocation[4] = new Vec3(5.8, 6.1 - 4.6, -2.3);
            var sharedEngine = alive(this.Engines[4]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.SmallEngine);
                sharedEngine.Direction = new Vec3(0.0, -0.2, -0.8);
            }
            this.Engines[5] = createParticleSystem();
            this.EnginesLocation[5] = new Vec3(-5.8, 6.1 - 4.6, -2.3);
            var sharedEngine = alive(this.Engines[5]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.SmallEngine);
                sharedEngine.Direction = new Vec3(0.0, -0.2, -0.8);
            }
            break;
        case 6:
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(202), new Vec3(0.0, 2.2, -0.2)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(209), new Vec3(5.4, 1.0, 2.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(209), new Vec3(-5.4, 1.0, 2.0)));
            this.FlareWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(203), new Vec3(0.0, 5.0, 0.0)));
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(1.7, 6.6 - 3.83, -14.2);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(-1.7, 6.6 - 3.83, -14.2);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            break;
        case 7:
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(202), new Vec3(0.0, 2.4, -0.2)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(210), new Vec3(9.5, 1.3, 2.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(210), new Vec3(-9.5, 1.3, 2.0)));
            this.FlareWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(203), new Vec3(0.0, 5.0, 0.0)));
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(2.2, 7.6 - 5.25, -14.8);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(-2.2, 7.6 - 5.25, -14.8);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            this.Engines[2] = createParticleSystem();
            this.EnginesLocation[2] = new Vec3(17.2, 6.8 - 5.25, -9.0);
            var sharedEngine = alive(this.Engines[2]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.BigEngine);
            }
            this.Engines[3] = createParticleSystem();
            this.EnginesLocation[3] = new Vec3(-17.2, 6.8 - 5.25, -9.0);
            var sharedEngine = alive(this.Engines[3]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.BigEngine);
            }
            break;
        case 8:
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(202), new Vec3(0.0, 2.4, -0.2)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(206), new Vec3(9.1, 1.3, 2.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(206), new Vec3(9.4, 1.0, 2.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(206), new Vec3(9.1, 0.7, 2.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(206), new Vec3(-9.1, 1.3, 2.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(206), new Vec3(-9.4, 1.0, 2.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(206), new Vec3(-9.1, 0.7, 2.0)));
            this.FlareWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(203), new Vec3(0.0, 6.0, 0.0)));
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(4.5, 6.3 - 3.62, -12.5);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(-4.5, 6.3 - 3.62, -12.5);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            this.Engines[2] = createParticleSystem();
            this.EnginesLocation[2] = new Vec3(9.2, 4.4 - 3.62, -5.6);
            var sharedEngine = alive(this.Engines[2]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.BigEngine);
            }
            this.Engines[3] = createParticleSystem();
            this.EnginesLocation[3] = new Vec3(-9.2, 4.4 - 3.62, -5.6);
            var sharedEngine = alive(this.Engines[3]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.BigEngine);
            }
            break;
        case 9:
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(201), new Vec3(0.0, 4.2, 7.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(201), new Vec3(0.0, 4.2, 3.5)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.SetRotation(new Vec3(0.0, 180.0, 0.0));
            }
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(202), new Vec3(0.0, 3.4, -5.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(205), new Vec3(11.1, 2.7, 9.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(205), new Vec3(-11.1, 2.7, 9.0)));
            this.FlareWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(203), new Vec3(0.0, 7.0, 0.0)));
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(1.4, 8.7 - 4.9, -20.4);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(-1.4, 8.7 - 4.9, -20.4);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            this.Engines[2] = createParticleSystem();
            this.EnginesLocation[2] = new Vec3(4.7, 7.0 - 4.9, 0.0);
            var sharedEngine = alive(this.Engines[2]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            this.Engines[3] = createParticleSystem();
            this.EnginesLocation[3] = new Vec3(-4.7, 7.0 - 4.9, 0.0);
            var sharedEngine = alive(this.Engines[3]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            this.Engines[4] = createParticleSystem();
            this.EnginesLocation[4] = new Vec3(7.5, 6.8 - 4.9, 0.0);
            var sharedEngine = alive(this.Engines[4]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            this.Engines[5] = createParticleSystem();
            this.EnginesLocation[5] = new Vec3(-7.5, 6.8 - 4.9, 0.0);
            var sharedEngine = alive(this.Engines[5]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            break;
        case 10:
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(201), new Vec3(0.0, 4.4, 6.8)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(201), new Vec3(0.0, 4.4, 2.6)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.SetRotation(new Vec3(0.0, 180.0, 0.0));
            }
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(202), new Vec3(0.0, 2.6, -7.0)));
            this.WeaponSlots.push(new ShipWeaponSlot(CreateWeapon(201), new Vec3(0.0, 2.6, -16.0)));
            var sharedWeapon = alive(this.WeaponSlots[this.WeaponSlots.length - 1].Weapon); if (sharedWeapon) {
                sharedWeapon.SetRotation(new Vec3(0.0, 180.0, 0.0));
            }
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(205), new Vec3(11.1, 2.7, 8.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(205), new Vec3(-11.1, 2.7, 8.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(205), new Vec3(16.5, 2.7, 7.5)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(205), new Vec3(-16.5, 2.7, 7.5)));
            this.FlareWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(203), new Vec3(0.0, 7.0, 0.0)));
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(3.8, 5.4 - 4.29, -19.5);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(-3.8, 5.4 - 4.29, -19.5);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            this.Engines[2] = createParticleSystem();
            this.EnginesLocation[2] = new Vec3(5.8, 6.0 - 4.29, -0.9);
            var sharedEngine = alive(this.Engines[2]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            this.Engines[3] = createParticleSystem();
            this.EnginesLocation[3] = new Vec3(-5.8, 6.0 - 4.29, -0.9);
            var sharedEngine = alive(this.Engines[3]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            this.Engines[4] = createParticleSystem();
            this.EnginesLocation[4] = new Vec3(8.0, 6.0 - 4.29, -0.9);
            var sharedEngine = alive(this.Engines[4]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            this.Engines[5] = createParticleSystem();
            this.EnginesLocation[5] = new Vec3(-8.0, 6.0 - 4.29, -0.9);
            var sharedEngine = alive(this.Engines[5]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            this.Engines[6] = createParticleSystem();
            this.EnginesLocation[6] = new Vec3(20.0, 5.0 - 4.29, -3.6);
            var sharedEngine = alive(this.Engines[6]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            this.Engines[7] = createParticleSystem();
            this.EnginesLocation[7] = new Vec3(-20.0, 5.0 - 4.29, -3.6);
            var sharedEngine = alive(this.Engines[7]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            break;
        case 11:
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(209), new Vec3(5.4, 1.0, 2.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(209), new Vec3(-5.4, 1.0, 2.0)));
            this.FlareWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(203), new Vec3(0.0, 5.0, 0.0)));
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(1.7, 6.6 - 3.83, -14.2);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(-1.7, 6.6 - 3.83, -14.2);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            break;
        case 12:
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(210), new Vec3(9.5, 1.3, 2.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(210), new Vec3(-9.5, 1.3, 2.0)));
            this.FlareWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(203), new Vec3(0.0, 5.0, 0.0)));
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(2.2, 7.6 - 5.25, -14.8);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(-2.2, 7.6 - 5.25, -14.8);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            this.Engines[2] = createParticleSystem();
            this.EnginesLocation[2] = new Vec3(17.2, 6.8 - 5.25, -9.0);
            var sharedEngine = alive(this.Engines[2]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.BigEngine);
            }
            this.Engines[3] = createParticleSystem();
            this.EnginesLocation[3] = new Vec3(-17.2, 6.8 - 5.25, -9.0);
            var sharedEngine = alive(this.Engines[3]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.BigEngine);
            }
            break;
        case 13:
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(206), new Vec3(9.1, 1.3, 2.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(206), new Vec3(9.4, 1.0, 2.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(206), new Vec3(9.1, 0.7, 2.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(206), new Vec3(-9.1, 1.3, 2.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(206), new Vec3(-9.4, 1.0, 2.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(206), new Vec3(-9.1, 0.7, 2.0)));
            this.FlareWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(203), new Vec3(0.0, 6.0, 0.0)));
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(4.5, 6.3 - 3.62, -12.5);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(-4.5, 6.3 - 3.62, -12.5);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            this.Engines[2] = createParticleSystem();
            this.EnginesLocation[2] = new Vec3(9.2, 4.4 - 3.62, -5.6);
            var sharedEngine = alive(this.Engines[2]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.BigEngine);
            }
            this.Engines[3] = createParticleSystem();
            this.EnginesLocation[3] = new Vec3(-9.2, 4.4 - 3.62, -5.6);
            var sharedEngine = alive(this.Engines[3]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.BigEngine);
            }
            break;
        case 14:
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(205), new Vec3(11.1, 2.7, 9.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(205), new Vec3(-11.1, 2.7, 9.0)));
            this.FlareWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(203), new Vec3(0.0, 7.0, 0.0)));
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(1.4, 8.7 - 4.9, -20.4);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(-1.4, 8.7 - 4.9, -20.4);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            this.Engines[2] = createParticleSystem();
            this.EnginesLocation[2] = new Vec3(4.7, 7.0 - 4.9, 0.0);
            var sharedEngine = alive(this.Engines[2]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            this.Engines[3] = createParticleSystem();
            this.EnginesLocation[3] = new Vec3(-4.7, 7.0 - 4.9, 0.0);
            var sharedEngine = alive(this.Engines[3]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            this.Engines[4] = createParticleSystem();
            this.EnginesLocation[4] = new Vec3(7.5, 6.8 - 4.9, 0.0);
            var sharedEngine = alive(this.Engines[4]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            this.Engines[5] = createParticleSystem();
            this.EnginesLocation[5] = new Vec3(-7.5, 6.8 - 4.9, 0.0);
            var sharedEngine = alive(this.Engines[5]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            break;
        case 15:
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(205), new Vec3(11.1, 2.7, 8.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(205), new Vec3(-11.1, 2.7, 8.0)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(205), new Vec3(16.5, 2.7, 7.5)));
            this.BossWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(205), new Vec3(-16.5, 2.7, 7.5)));
            this.FlareWeaponSlots.push(new ShipWeaponSlot(CreateWeapon(203), new Vec3(0.0, 7.0, 0.0)));
            this.Engines[0] = createParticleSystem();
            this.EnginesLocation[0] = new Vec3(3.8, 5.4 - 4.29, -19.5);
            var sharedEngine = alive(this.Engines[0]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            this.Engines[1] = createParticleSystem();
            this.EnginesLocation[1] = new Vec3(-3.8, 5.4 - 4.29, -19.5);
            var sharedEngine = alive(this.Engines[1]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            this.Engines[2] = createParticleSystem();
            this.EnginesLocation[2] = new Vec3(5.8, 6.0 - 4.29, -0.9);
            var sharedEngine = alive(this.Engines[2]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            this.Engines[3] = createParticleSystem();
            this.EnginesLocation[3] = new Vec3(-5.8, 6.0 - 4.29, -0.9);
            var sharedEngine = alive(this.Engines[3]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            this.Engines[4] = createParticleSystem();
            this.EnginesLocation[4] = new Vec3(8.0, 6.0 - 4.29, -0.9);
            var sharedEngine = alive(this.Engines[4]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            this.Engines[5] = createParticleSystem();
            this.EnginesLocation[5] = new Vec3(-8.0, 6.0 - 4.29, -0.9);
            var sharedEngine = alive(this.Engines[5]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            this.Engines[6] = createParticleSystem();
            this.EnginesLocation[6] = new Vec3(20.0, 5.0 - 4.29, -3.6);
            var sharedEngine = alive(this.Engines[6]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            this.Engines[7] = createParticleSystem();
            this.EnginesLocation[7] = new Vec3(-20.0, 5.0 - 4.29, -3.6);
            var sharedEngine = alive(this.Engines[7]); if (sharedEngine) {
                SetupEngineGFX(sharedEngine, GFX.MidEngine);
            }
            break;
        }
        for (let i = 0; i < d[0]; i++) {
            var sharedEngine = alive(this.Engines[i]); if (sharedEngine) {
                sharedEngine.SetStartLocation(this.EnginesLocation[i]);
                if (alive(sharedEngine.Light)) {
                    this.InternalLights++;
                }
            }
        }
  }
}

export function CreatePirateShip(n: number): SpaceShip {
  const s = new PirateShip(n);
  world.ShipList.unshift(s);
  return s;
}
