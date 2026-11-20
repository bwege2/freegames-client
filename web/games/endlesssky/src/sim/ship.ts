// A ship in flight, following the reference release's Ship::DoGeneration,
// Ship::DoMovement, Armament and Weapon code for the parts this port plays:
// generation, movement, firing, damage, disabling and destruction.
import type { GameData, ShipModel, Weapon, Stats } from '../data/gamedata.ts';
import { Angle, Point } from './math.ts';
import type { Random } from './rng.ts';

export interface Commands {
  turn: number;
  forward: boolean;
  reverse: boolean;
  afterburner: boolean;
  firePrimary: boolean;
  fireSecondary: boolean;
  stop: boolean;
}

export const noCommands = (): Commands => ({
  turn: 0, forward: false, reverse: false, afterburner: false,
  firePrimary: false, fireSecondary: false, stop: false,
});

export interface Hardpoint {
  point: Point;
  angle: number;
  turret: boolean;
  outfit: string;
  weapon: Weapon | null;
  reload: number;
  burst: number;
  burstReload: number;
}

interface ResourceLevels {
  hull: number;
  shields: number;
  energy: number;
  heat: number;
  fuel: number;
}

export class Ship {
  readonly data: GameData;
  readonly model: ShipModel;
  readonly name: string;
  readonly isPlayer: boolean;
  government: string;
  position = new Point();
  velocity = new Point();
  angle = new Angle();
  accelerationVector = new Point();
  stats: Stats;
  outfits: Map<string, number>;
  cargo = new Map<string, number>();
  crew: number;

  shields: number;
  hull: number;
  energy: number;
  heat: number;
  fuel: number;
  isDisabled = false;
  isDestroyed = false;
  radius = 30;
  target: Ship | null = null;
  targetAngle = 0;
  commands: Commands = noCommands();
  hardpoints: Hardpoint[] = [];
  shieldDelay = 0;
  hullDelay = 0;
  disabledRecoveryCounter = 0;
  damageOverlayTimer = 0;
  explosionTimer = 0;
  slowness = 0;

  private readonly capacities: ResourceLevels;
  private readonly minimumHull: number;

  constructor(data: GameData, model: ShipModel, outfits = model.defaultOutfits, name = '', isPlayer = false) {
    this.data = data;
    this.model = model;
    this.name = name || model.displayName;
    this.isPlayer = isPlayer;
    this.government = isPlayer ? 'Player' : '';
    this.outfits = new Map(outfits);
    this.stats = data.shipAttributes(model, this.outfits);
    this.stats.set('gun ports', model.guns.length);
    this.stats.set('turret mounts', model.turrets.length);
    this.crew = Math.max(1, Math.ceil(this.stats.get('required crew')));
    this.capacities = {
      hull: this.stats.get('hull') * (1 + this.stats.get('hull multiplier')),
      shields: this.stats.get('shields') * (1 + this.stats.get('shield multiplier')),
      energy: this.stats.get('energy capacity'),
      fuel: this.stats.get('fuel capacity'),
      heat: 100 * (this.stats.mass + this.stats.get('heat capacity')),
    };
    if (model.neverDisabled) this.minimumHull = 0;
    else {
      const absolute = this.stats.get('absolute threshold');
      if (absolute > 0) this.minimumHull = absolute;
      else {
        const percent = this.stats.get('threshold percentage');
        const transition = 1 / (1 + 0.0005 * this.capacities.hull);
        this.minimumHull = Math.max(0, Math.floor(this.capacities.hull * (percent > 0
          ? Math.min(percent, 1) : 0.1 * (1 - transition) + 0.5 * transition) + this.stats.get('hull threshold')));
      }
    }
    this.shields = this.capacities.shields;
    this.hull = this.capacities.hull;
    this.energy = this.capacities.energy;
    this.fuel = this.capacities.fuel;
    this.heat = 0;
    this.rebuildHardpoints();
  }

  /** Ship::AddOutfit: change the installed outfits and recompute everything. */
  addOutfit(name: string, count: number): void {
    const outfit = this.data.outfits.get(name);
    if (!outfit) return;
    const next = (this.outfits.get(name) ?? 0) + count;
    if (next > 0) this.outfits.set(name, next);
    else this.outfits.delete(name);
    const hullFraction = this.maxHull() ? this.hull / this.maxHull() : 1;
    const shieldFraction = this.maxShields() ? this.shields / this.maxShields() : 1;
    this.stats = this.data.shipAttributes(this.model, this.outfits);
    this.stats.set('gun ports', this.model.guns.length);
    this.stats.set('turret mounts', this.model.turrets.length);
    this.recomputeCapacities();
    this.hull = hullFraction * this.maxHull();
    this.shields = shieldFraction * this.maxShields();
    this.rebuildHardpoints();
  }

  outfitCount(name: string): number {
    return this.outfits.get(name) ?? 0;
  }

  private recomputeCapacities(): void {
    this.capacities.hull = this.stats.get('hull') * (1 + this.stats.get('hull multiplier'));
    this.capacities.shields = this.stats.get('shields') * (1 + this.stats.get('shield multiplier'));
    this.capacities.energy = this.stats.get('energy capacity');
    this.capacities.fuel = this.stats.get('fuel capacity');
    this.capacities.heat = 100 * (this.stats.mass + this.stats.get('heat capacity'));
  }

  /**
   * Armament::Add + Ship::FinishLoading: explicit hardpoints first (if their
   * outfit is installed), then the installed guns and turrets fill the rest.
   */
  private rebuildHardpoints(): void {
    const list: Hardpoint[] = [];
    const gunPorts = this.model.guns.map((h) => ({ ...h }));
    const turretPorts = this.model.turrets.map((h) => ({ ...h }));
    const used = new Map<string, number>();
    const take = (name: string): boolean => {
      const have = this.outfits.get(name) ?? 0;
      const usedCount = used.get(name) ?? 0;
      if (usedCount >= have) return false;
      used.set(name, usedCount + 1);
      return true;
    };
    const usedGuns = gunPorts.map(() => false);
    const usedTurrets = turretPorts.map(() => false);
    for (let i = 0; i < gunPorts.length; ++i) {
      const hardpoint = gunPorts[i];
      if (hardpoint.outfit && take(hardpoint.outfit)) {
        list.push(this.makeHardpoint(hardpoint, hardpoint.outfit));
        usedGuns[i] = true;
      }
    }
    for (let i = 0; i < turretPorts.length; ++i) {
      const hardpoint = turretPorts[i];
      if (hardpoint.outfit && take(hardpoint.outfit)) {
        list.push(this.makeHardpoint(hardpoint, hardpoint.outfit));
        usedTurrets[i] = true;
      }
    }
    // Fill the empty ports with other installed weapons, gun ports first.
    for (let i = 0; i < gunPorts.length; ++i) {
      if (usedGuns[i]) continue;
      const weapon = this.findInstalledWeapon(false, used);
      if (weapon) list.push(this.makeHardpoint(gunPorts[i], weapon));
    }
    for (let i = 0; i < turretPorts.length; ++i) {
      if (usedTurrets[i]) continue;
      const weapon = this.findInstalledWeapon(true, used);
      if (weapon) list.push(this.makeHardpoint(turretPorts[i], weapon));
    }
    this.hardpoints = list.sort((a, b) => (a.turret === b.turret ? 0 : a.turret ? 1 : -1));
  }

  private makeHardpoint(hardpoint: { point: { x: number; y: number }; angle: number; turret: boolean }, outfit: string): Hardpoint {
    return {
      point: new Point(hardpoint.point.x, hardpoint.point.y),
      angle: hardpoint.angle,
      turret: hardpoint.turret,
      outfit,
      weapon: this.data.weaponOf(outfit),
      reload: 0,
      burst: 0,
      burstReload: 0,
    };
  }

  private findInstalledWeapon(turret: boolean, used: Map<string, number>): string {
    for (const [name] of this.outfits) {
      const outfit = this.data.outfits.get(name);
      if (!outfit?.weapon) continue;
      const ports = outfit.stats.get(turret ? 'turret mounts' : 'gun ports');
      if (ports >= 0) continue;
      if (turret && outfit.weapon.turn === 0 && outfit.weapon.antiMissile === 0) continue;
      const usedCount = used.get(name) ?? 0;
      if (usedCount >= (this.outfits.get(name) ?? 0)) continue;
      used.set(name, usedCount + 1);
      return name;
    }
    // A turret may mount a gun-type weapon too.
    if (turret) return this.findInstalledWeapon(false, used);
    return '';
  }

  maxShields(): number { return this.capacities.shields; }
  maxHull(): number { return this.capacities.hull; }
  maxEnergy(): number { return this.capacities.energy; }
  maxFuel(): number { return this.capacities.fuel; }
  maxHeat(): number { return this.capacities.heat; }
  minHull(): number { return this.minimumHull; }

  mass(): number {
    let cargo = 0;
    for (const tons of this.cargo.values()) cargo += tons;
    return this.stats.mass + cargo;
  }

  inertialMass(): number {
    return this.mass() / (1 + this.stats.get('inertia reduction'));
  }

  drag(): number {
    const drag = this.stats.get('drag') / (1 + this.stats.get('drag reduction'));
    const mass = this.inertialMass();
    return drag >= mass ? mass : drag;
  }

  dragForce(): number {
    const drag = this.stats.get('drag') / (1 + this.stats.get('drag reduction'));
    const mass = this.inertialMass();
    return drag >= mass ? 1 : drag / mass;
  }

  turnRate(): number {
    return this.stats.get('turn') / this.inertialMass() * (1 + this.stats.get('turn multiplier'));
  }

  accelerationRate(): number {
    const thrust = this.stats.get('thrust');
    return (thrust || this.stats.get('afterburner thrust')) / this.inertialMass()
      * (1 + this.stats.get('acceleration multiplier'));
  }

  reverseAccelerationRate(): number {
    return this.stats.get('reverse thrust') / this.inertialMass() * (1 + this.stats.get('acceleration multiplier'));
  }

  maxVelocity(withAfterburner = false): number {
    const thrust = this.stats.get('thrust');
    const afterburner = this.stats.get('afterburner thrust');
    return (thrust ? thrust + afterburner * (withAfterburner ? 1 : 0) : afterburner) / this.drag();
  }

  coolingEfficiency(): number {
    const x = this.stats.get('cooling inefficiency');
    return x ? 2 + 2 / (1 + Math.exp(x / -2)) - 4 / (1 + Math.exp(x / -4)) : 1;
  }

  heatDissipation(): number {
    return 0.001 * this.stats.get('heat dissipation');
  }

  heatFraction(): number {
    return this.maxHeat() ? this.heat / this.maxHeat() : 0;
  }

  requiredCrew(): number {
    return Math.max(1, Math.ceil(this.stats.get('required crew')));
  }

  isOverheated(): boolean {
    return this.heat > this.maxHeat();
  }

  /** The resources available for movement/firing (Entity::AvailableResources). */
  /** ResourceLevels::FractionalUsage. */
  private fractionalUsage(cost: ResourceLevels): number {
    let scale = 1;
    const scaleOutput = (input: number, levelCost: number): void => {
      if (input < levelCost * scale) scale = levelCost ? input / levelCost : 1;
    };
    scaleOutput(this.hull - this.minimumHull, cost.hull);
    scaleOutput(this.shields, cost.shields);
    scaleOutput(this.energy, cost.energy);
    scaleOutput(this.heat, -cost.heat);
    scaleOutput(this.fuel, cost.fuel);
    return scale;
  }

  /** ResourceLevels::Damage; hull is allowed to go negative. */
  private damage(cost: ResourceLevels, scale = 1): void {
    this.hull -= scale * cost.hull;
    this.shields = Math.max(0, this.shields - scale * cost.shields);
    this.energy = Math.max(0, this.energy - scale * cost.energy);
    this.heat = Math.max(0, this.heat + scale * cost.heat);
    this.fuel = Math.max(0, this.fuel - scale * cost.fuel);
  }

  private repair(stat: 'hull' | 'shields', available: number, maximum: number, cost: ResourceLevels): number {
    if (available <= 0 || (stat === 'hull' ? this.hull : this.shields) >= maximum) return available;
    if (cost.energy > 0) available = Math.min(available, this.energy / cost.energy);
    if (cost.heat < 0) available = Math.min(available, this.heat / -cost.heat);
    if (cost.fuel > 0) available = Math.min(available, this.fuel / cost.fuel);
    const transfer = Math.min(available, maximum - this[stat]);
    if (transfer > 0) {
      this[stat] += transfer;
      available -= transfer;
      this.energy -= transfer * cost.energy;
      this.heat += transfer * cost.heat;
      this.fuel -= transfer * cost.fuel;
    }
    return available;
  }

  /** Ship::DoGeneration (0.11.4's cached formulas, without carried ships). */
  generate(random: Random): void {
    if (!this.isDisabled) {
      const repairDelay = this.stats.get('repair delay');
      const hullRate = (this.stats.get('hull repair rate') + this.stats.get('delayed hull repair rate'))
        * (1 + this.stats.get('hull repair multiplier'));
      let hullRemaining = hullRate;
      const hullCost = {
        hull: 0,
        shields: 0,
        energy: (this.stats.get('hull energy') + this.stats.get('delayed hull energy'))
          * (1 + this.stats.get('hull energy multiplier')) / (hullRate || 1),
        heat: (this.stats.get('hull heat') + this.stats.get('delayed hull heat'))
          * (1 + this.stats.get('hull heat multiplier')) / (hullRate || 1),
        fuel: (this.stats.get('hull fuel') + this.stats.get('delayed hull fuel'))
          * (1 + this.stats.get('hull fuel multiplier')) / (hullRate || 1),
      };
      if (!this.hullDelay && hullRemaining) hullRemaining = this.repair('hull', hullRemaining, this.maxHull(), hullCost);

      const shieldRate = (this.stats.get('shield generation') + this.stats.get('delayed shield generation'))
        * (1 + this.stats.get('shield generation multiplier'));
      let shieldRemaining = shieldRate;
      const shieldCost = {
        hull: 0,
        shields: 0,
        energy: (this.stats.get('shield energy') + this.stats.get('delayed shield energy'))
          * (1 + this.stats.get('shield energy multiplier')) / (shieldRate || 1),
        heat: (this.stats.get('shield heat') + this.stats.get('delayed shield heat'))
          * (1 + this.stats.get('shield heat multiplier')) / (shieldRate || 1),
        fuel: (this.stats.get('shield fuel') + this.stats.get('delayed shield fuel'))
          * (1 + this.stats.get('shield fuel multiplier')) / (shieldRate || 1),
      };
      if (!this.shieldDelay && shieldRemaining) shieldRemaining = this.repair('shields', shieldRemaining, this.maxShields(), shieldCost);

      this.shieldDelay = Math.max(0, this.shieldDelay - 1);
      this.hullDelay = Math.max(0, this.hullDelay - 1);
      void repairDelay;
    }

    // A disabled ship may recover by itself.
    const recovery = this.stats.get('disabled recovery time');
    if (this.isDisabled && recovery) {
      this.disabledRecoveryCounter += 1;
      if (this.disabledRecoveryCounter >= recovery) {
        this.disabledRecoveryCounter = 0;
        this.hull = Math.min(Math.max(this.hull, this.minimumHull * 1.5), this.maxHull());
        this.isDisabled = false;
      }
    }

    this.energy = Math.min(this.energy, this.maxEnergy());
    this.fuel = Math.min(this.fuel, this.maxFuel());

    this.heat -= this.heat * this.heatDissipation();
    if (this.heat > this.maxHeat()) {
      const heatRatio = this.heatFraction() / (1 + this.stats.get('overheat damage threshold'));
      if (heatRatio > 1) this.hull -= this.stats.get('overheat damage rate') * heatRatio;
    }

    if (!this.isOverheated() && this.hull >= this.minimumHull) this.isDisabled = false;

    this.shields = Math.min(this.shields, this.maxShields());
    this.hull = Math.min(this.hull, this.maxHull());
    this.isDisabled = this.isOverheated() || this.hull < this.minimumHull || (!this.crew && this.requiredCrew() > 0);

    if (!this.isDisabled) {
      this.energy += this.stats.get('energy generation') - this.stats.get('energy consumption');
      this.fuel += this.stats.get('fuel generation');
      this.heat += this.stats.get('heat generation');
      this.heat -= this.coolingEfficiency() * this.stats.get('cooling');
      if (this.stats.get('fuel consumption') <= this.fuel) {
        this.fuel -= this.stats.get('fuel consumption');
        this.energy += this.stats.get('fuel energy');
        this.heat += this.stats.get('fuel heat');
      }
      const activeCooling = this.coolingEfficiency() * this.stats.get('active cooling');
      if (activeCooling > 0 && this.heat > 0 && this.energy >= 0) {
        const coolingEnergy = this.stats.get('cooling energy');
        if (coolingEnergy) {
          const spent = Math.min(this.energy, coolingEnergy * Math.min(1, this.heatFraction()));
          this.heat -= activeCooling * spent / coolingEnergy;
          this.energy -= spent;
        } else {
          this.heat -= activeCooling * Math.min(1, this.heatFraction());
        }
      }
    }

    this.shields = Math.max(0, this.shields);
    this.energy = Math.max(0, this.energy);
    this.fuel = Math.max(0, this.fuel);
    this.heat = Math.max(0, this.heat);
    if (this.hull < this.minimumHull) this.isDisabled = true;
    if (this.hull <= 0) this.isDestroyed = true;
    void random;
  }

  /** Ship::DoMovement. */
  move(): void {
    this.accelerationVector = new Point();
    const mass = this.inertialMass();
    const dragForce = this.dragForce();
    const slowMultiplier = 1 / (1 + this.slowness * 0.05);

    if (this.isDisabled) {
      this.velocity.imul(1 - dragForce);
    } else {
      if (this.commands.turn) {
        const cost = {
          hull: this.stats.get('turning hull'), shields: this.stats.get('turning shields'),
          energy: this.stats.get('turning energy'), heat: this.stats.get('turning heat'),
          fuel: this.stats.get('turning fuel'),
        };
        const scale = this.fractionalUsage(cost);
        let turn = Math.sign(this.commands.turn) * Math.min(Math.abs(this.commands.turn), scale);
        if (turn) {
          this.damage(cost, Math.abs(turn));
          this.angle = Angle.fromSteps(this.angle.steps + Math.round(turn * this.turnRate() * slowMultiplier * (0x10000 / 360)));
        }
      }
      if (this.commands.forward || this.commands.reverse) {
        const forward = this.commands.forward;
        const cost = {
          hull: this.stats.get(forward ? 'thrusting hull' : 'reverse thrusting hull'),
          shields: this.stats.get(forward ? 'thrusting shields' : 'reverse thrusting shields'),
          energy: this.stats.get(forward ? 'thrusting energy' : 'reverse thrusting energy'),
          heat: this.stats.get(forward ? 'thrusting heat' : 'reverse thrusting heat'),
          fuel: this.stats.get(forward ? 'thrusting fuel' : 'reverse thrusting fuel'),
        };
        let command = forward ? 1 : -1;
        command *= this.fractionalUsage(cost);
        const reverseThrust = this.stats.get('reverse thrust');
        if (command) {
          const thrust = forward ? this.stats.get('thrust') : reverseThrust;
          if (thrust) {
            this.damage(cost, Math.abs(command));
            this.accelerationVector.iadd(this.angle.unit().mul(command * (forward ? this.accelerationRate() : this.reverseAccelerationRate())));
          }
        }
      }
      const canAfterburn = this.commands.afterburner || (this.commands.forward && !this.stats.get('thrust'));
      if (canAfterburn) {
        const thrust = this.stats.get('afterburner thrust');
        const shieldCost = this.stats.get('afterburner shields');
        const hullCost = this.stats.get('afterburner hull');
        const energyCost = this.stats.get('afterburner energy');
        const fuelCost = this.stats.get('afterburner fuel');
        const heatCost = -this.stats.get('afterburner heat');
        if (thrust && this.shields >= shieldCost && this.hull >= hullCost && this.energy >= energyCost
          && this.fuel >= fuelCost && this.heat >= heatCost) {
          this.shields -= shieldCost;
          this.hull -= hullCost;
          this.energy -= energyCost;
          this.fuel -= fuelCost;
          this.heat -= heatCost;
          this.accelerationVector.iadd(this.angle.unit().mul((1 + this.stats.get('acceleration multiplier')) * thrust / mass));
        }
      }
    }

    if (this.accelerationVector.x || this.accelerationVector.y) {
      this.accelerationVector.imul(slowMultiplier);
      let dragAcceleration = this.accelerationVector.sub(this.velocity.mul(dragForce * (1 + this.stats.get('acceleration multiplier'))));
      if (dragAcceleration.x || dragAcceleration.y) {
        dragAcceleration = dragAcceleration.mul(0.5 * (this.accelerationVector.unit().dot(dragAcceleration.unit()) + 1));
        if (this.commands.stop) {
          const vNormal = this.velocity.dot(this.angle.unit());
          const aNormal = dragAcceleration.dot(this.angle.unit());
          if ((aNormal > 0) !== (vNormal > 0) && Math.abs(aNormal) > Math.abs(vNormal))
            dragAcceleration = this.angle.unit().mul(-vNormal);
        }
        this.velocity = this.velocity.add(dragAcceleration);
      }
      this.accelerationVector = new Point();
    }
    this.position = this.position.add(this.velocity);
  }

  /** Apply a force (Ship::ApplyForce), used by weapon hit force. */
  applyForce(force: Point, gravitational = false): void {
    if (gravitational) {
      this.accelerationVector.iadd(force.div(400));
      return;
    }
    const mass = this.inertialMass();
    if (mass) this.accelerationVector.iadd(force.div(mass));
  }

  /**
   * Ready the hardpoints and fire them. `primary` fires direct-fire weapons,
   * `secondary` the weapons with an icon (missiles), as the original's player
   * command does.
   */
  fire(command: { primary: boolean; secondary: boolean }, projectiles: Projectile[], random: Random): void {
    for (const hardpoint of this.hardpoints) {
      const weapon = hardpoint.weapon;
      if (!weapon || weapon.antiMissile > 0) continue;
      if (hardpoint.reload > 0) { hardpoint.reload -= 1; continue; }
      const isSecondary = weapon.hasIcon;
      const wants = isSecondary ? command.secondary : command.primary;
      // A turret aims at its target within its arc; a gun fires forward.
      let aim = this.angle.add(new Angle(hardpoint.angle));
      if (hardpoint.turret && this.target) {
        const desired = Angle.fromPoint(this.target.position.sub(this.position));
        const delta = desired.sub(this.angle.add(new Angle(hardpoint.angle))).degrees();
        if (Math.abs(delta) < 180) aim = desired;
      }
      if (!wants || this.isDisabled) continue;
      const cost = {
        hull: weapon.firingHull, shields: 0, energy: weapon.firingEnergy,
        heat: weapon.firingHeat, fuel: weapon.firingFuel,
      };
      if (this.energy < cost.energy || this.fuel < cost.fuel || this.hull - this.minimumHull < cost.hull
        || this.heat < -cost.heat) continue;
      if (weapon.ammo && this.outfitCount(weapon.ammo) < weapon.ammoUsage) continue;
      this.damage(cost);
      if (weapon.ammo) this.addOutfit(weapon.ammo, -weapon.ammoUsage);
      if (weapon.firingForce) this.applyForce(aim.unit().mul(-weapon.firingForce));

      const start = this.position.add(this.angle.rotate(hardpoint.point));
      const spread = weapon.inaccuracy / 180 * Math.PI;
      const jitter = (random.real() * 2 - 1) * spread;
      const shotAngle = aim.add(new Angle((jitter * 180) / Math.PI));
      const speed = weapon.velocityOverride || weapon.velocity;
      const velocity = this.velocity.add(shotAngle.unit().mul(speed));
      projectiles.push(new Projectile(weapon, start.sub(velocity.mul(0.5)), velocity, shotAngle, this));
      hardpoint.reload += weapon.reload;
      hardpoint.burst = weapon.burstCount;
      hardpoint.burstReload = weapon.burstReload;
    }
  }

  /** Ship::CanLand: within the planet's landing radius. */
  canLand(object: { position: Point; radius: number }): boolean {
    return this.position.distanceSquared(object.position) < Math.pow(object.radius + this.radius + 1, 2);
  }

  /** Ship::TakeDamage and DamageProfile for a simple projectile hit. */
  takeDamage(weapon: Weapon, position: Point, scale: number, hitBy: string): number {
    let shieldFraction = 0;
    let shieldDamage = 0;
    let hullDamage = 0;
    const hitForce = weapon.hitForce * scale;
    if (this.shields > 0) {
      shieldFraction = 1 - Math.min(1, Math.max(0, weapon.piercing));
      shieldDamage = (weapon.shieldDamage + 0) * scale * shieldFraction;
      if (shieldDamage > this.shields) shieldFraction = Math.min(shieldFraction, this.shields / (weapon.shieldDamage * scale || 1));
    }
    const hullBlocked = 1 - shieldFraction;
    hullDamage = weapon.hullDamage * scale * hullBlocked;
    this.shields -= shieldDamage;
    this.hull -= hullDamage;
    if (weapon.hitForce) {
      const d = this.position.sub(position);
      const distance = d.length();
      if (distance) this.applyForce(d.mul(hitForce / distance));
    }
    if (weapon.shieldDamage > 0 && !this.isDisabled) {
      this.shieldDelay = Math.max(this.shieldDelay, this.stats.get('shield delay'));
    }
    if (weapon.hullDamage > 0 && !this.isDisabled) this.hullDelay = Math.max(this.hullDelay, this.stats.get('repair delay'));
    this.damageOverlayTimer = 15;
    this.hull = Math.min(this.hull, this.maxHull());
    this.shields = Math.min(this.shields, this.maxShields());
    if (this.hull < this.minimumHull || this.hull <= 0) this.isDisabled = true;
    if (this.hull <= 0) this.isDestroyed = true;
    void hitBy;
    return 0;
  }
}

export class Projectile {
  readonly weapon: Weapon;
  position: Point;
  velocity: Point;
  angle: Angle;
  readonly owner: Ship;
  readonly government: string;
  lifetime: number;
  distanceTraveled = 0;
  hitsRemaining = 1;
  dead = false;
  target: Ship | null;
  deathType = 1; // 1 natural, 2 collision, 4 explosion, 8 anti-missile

  constructor(weapon: Weapon, position: Point, velocity: Point, angle: Angle, owner: Ship, target: Ship | null = owner.target) {
    this.weapon = weapon;
    this.position = position;
    this.velocity = velocity;
    this.angle = angle;
    this.owner = owner;
    this.government = owner.government;
    this.lifetime = weapon.lifetime;
    this.hitsRemaining = 1;
    this.target = weapon.homing ? target : null;
    this.dead = false;
  }

  /** Projectile::Move. */
  move(random: Random): void {
    if (--this.lifetime <= 0) {
      this.dead = true;
      return;
    }
    if (this.target && (this.target.isDestroyed || !this.target)) this.target = null;
    let turn = this.weapon.turn;
    const accel = this.weapon.acceleration;
    if (turn && this.weapon.homing && this.target) {
      const d = this.target.position.sub(this.position);
      const isAway = d.dot(this.angle.unit()) < 0;
      if (isAway && this.weapon.blindspot) this.target = null;
      else {
        const desired = Angle.fromPoint(d);
        let delta = desired.sub(this.angle).degrees();
        if (Math.abs(delta) > turn) delta = Math.sign(delta) * turn;
        this.angle = this.angle.add(new Angle(delta));
      }
    } else if (turn && this.weapon.homing) turn = 0;
    if (accel) {
      const d = 1 - this.weapon.drag;
      const a = this.angle.unit().mul(accel);
      this.velocity = this.velocity.mul(d).add(a);
    }
    this.position = this.position.add(this.velocity);
    this.distanceTraveled += this.velocity.length();
    if (this.target && this.position.distance(this.target.position) < this.weapon.splitRange) this.lifetime = 0;
    void random;
    void turn;
  }
}
