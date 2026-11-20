// A star system in flight: its stellar objects on the current date, the
// player's ship, spawned fleets, projectiles, effects and the AI that flies
// the other ships.
import type { Effect, Fleet, GameData, StarSystem, SystemObject, Weapon } from '../data/gamedata.ts';
import { Angle, Point, randomAngle } from './math.ts';
import type { Random } from './rng.ts';
import { Projectile, Ship, noCommands, type Commands } from './ship.ts';
import type { GameDate } from './date.ts';

export interface SpriteSize {
  width: number;
  height: number;
}

export interface StellarState {
  object: SystemObject;
  planet: string;
  sprite: string;
  position: Point;
  radius: number;
  isStar: boolean;
}

export interface Visual {
  effect: Effect;
  position: Point;
  velocity: Point;
  angle: Angle;
  spin: number;
  age: number;
  lifetime: number;
}

export interface WorldOptions {
  data: GameData;
  player: Ship;
  system: StarSystem;
  date: GameDate;
  random: Random;
  spriteSize: (name: string) => SpriteSize | null;
  onSound?: (name: string, volume?: number) => void;
  /** Seed for the port's own spawns; the original seeds mt19937_64. */
  seed?: number;
}

const MAX_SHIPS = 16;

export class World {
  readonly data: GameData;
  player: Ship;
  readonly random: Random;
  system: StarSystem;
  date: GameDate;
  objects: StellarState[] = [];
  ships: Ship[] = [];
  projectiles: Projectile[] = [];
  visuals: Visual[] = [];
  landedOn = '';
  playerDestroyed = false;
  messages: { text: string; time: number }[] = [];
  /** A hostile ship that has been selected by the player, or the nearest one. */
  selected: Ship | null = null;
  frame = 0;

  private readonly spriteSize: (name: string) => SpriteSize | null;
  private readonly onSound?: (name: string, volume?: number) => void;
  private spawnCooldown = 0;

  constructor(options: WorldOptions) {
    this.data = options.data;
    this.player = options.player;
    this.system = options.system;
    this.date = options.date;
    this.random = options.random;
    this.spriteSize = options.spriteSize;
    this.onSound = options.onSound;
    this.arrangeSystem();
    this.player.government = 'Player';
    this.player.radius = this.radiusOf(this.player.model.sprite);
    this.ships.push(this.player);
  }

  /** System::SetDate: place the stellar objects for the current date. */
  arrangeSystem(): void {
    const now = this.date.daysSinceEpoch();
    this.objects = [];
    for (const object of this.system.objects) {
      const speed = object.period ? 360 / object.period : 0;
      const angle = Angle.fromSteps(Math.round(((now * speed + object.offset) * 0x10000) / 360));
      let position = angle.unit().mul(object.distance);
      if (object.parent >= 0 && this.objects[object.parent]) position = position.add(this.objects[object.parent].position);
      const size = this.spriteSize(object.sprite);
      let radius = size ? 0.5 * Math.min(size.width, size.height) : 20;
      if (object.isStar) radius = Math.min(radius, 80);
      this.objects.push({
        object,
        planet: object.planet,
        sprite: object.sprite,
        position,
        radius,
        isStar: object.isStar,
      });
    }
  }

  /** Put the player just above a planet (launch) and enter the system. */
  launchFrom(planetName: string): void {
    this.arrangeSystem();
    const state = this.objects.find((o) => o.planet === planetName);
    if (state) {
      this.player.position = state.position.add(new Point(0, -(state.radius + 400)));
      this.player.velocity = new Point(0, 0);
      this.player.angle = new Angle(0);
    } else {
      this.player.position = new Point(0, -2000);
      this.player.velocity = new Point(0, 0);
    }
    this.player.target = null;
    this.ships = [this.player];
    this.projectiles = [];
    this.visuals = [];
    this.landedOn = '';
    this.playerDestroyed = false;
    this.spawnInitialFleets();
  }

  /** Enter a new system after a hyperspace jump; returns when it is ready. */
  jumpTo(system: StarSystem): void {
    this.system = system;
    this.arrangeSystem();
    // Arrive at the edge of the system's outermost planet, as the original's
    // hyperspace arrival does (the exact arrival distance is in the data; this
    // port uses a visible point in the system).
    const outermost = this.objects.length
      ? this.objects.reduce((a, b) => (b.position.length() > a.position.length() ? b : a), this.objects[0])
      : null;
    const direction = randomAngle(() => this.random.real()).unit();
    this.player.position = direction.mul(outermost ? outermost.position.length() + 1200 : 2000);
    this.player.velocity = new Point(0, 0);
    this.player.angle = outermost ? Angle.fromPoint(outermost.position.sub(this.player.position)) : new Angle(0);
    this.player.target = null;
    this.ships = [this.player];
    this.projectiles = [];
    this.visuals = [];
    this.landedOn = '';
    this.playerDestroyed = false;
    this.spawnInitialFleets();
  }

  private spawnInitialFleets(): void {
    this.spawnCooldown = 120;
    // The original spawns fleets slowly; a new system gets one local fleet at
    // once so that there is something to meet in flight.
    const candidates = this.system.fleets.filter((f) => this.data.fleets.get(f.name)?.variants.length);
    if (!candidates.length) return;
    const total = candidates.reduce((sum, f) => sum + f.weight, 0);
    let roll = this.random.real() * total;
    for (const candidate of candidates) {
      roll -= candidate.weight;
      if (roll <= 0) {
        this.spawnFleet(this.data.fleets.get(candidate.name)!);
        break;
      }
    }
  }

  /** Fleet::Enter, one variant of a fleet near the system's edge. */
  spawnFleet(fleet: Fleet): void {
    const variant = this.data.fleetVariant(fleet, () => this.random.real());
    if (!variant || this.ships.length + variant.ships.length > MAX_SHIPS) return;
    const center = this.player.position.length() > 1500 ? new Point(0, 0) : this.player.position;
    for (const entry of variant.ships) {
      const model = this.data.ships.get(entry.model);
      if (!model) continue;
      for (let i = 0; i < entry.count; ++i) {
        if (this.ships.length >= MAX_SHIPS) return;
        const ship = new Ship(this.data, model, model.defaultOutfits, model.displayName);
        ship.government = fleet.government || this.system.government;
        const direction = randomAngle(() => this.random.real()).unit();
        ship.position = center.add(direction.mul(1200 + this.random.real() * 2500));
        ship.angle = Angle.fromPoint(center.sub(ship.position));
        ship.velocity = ship.angle.unit().mul(1 + this.random.real() * 2);
        ship.radius = this.radiusOf(model.sprite);
        this.ships.push(ship);
      }
    }
  }

  radiusOf(sprite: string): number {
    const size = this.spriteSize(sprite);
    return size ? 0.5 * Math.min(size.width, size.height) : 30;
  }

  /** Whether `a` treats `b` as an enemy (Government::IsEnemy). */
  isEnemy(a: string, b: string): boolean {
    if (!a || !b || a === b) return false;
    if (a === 'Player') return this.data.governments.get(b)?.playerReputation !== undefined
      && (this.data.governments.get(b)?.playerReputation ?? 0) < 0;
    if (b === 'Player') return (this.data.governments.get(a)?.playerReputation ?? 0) < 0;
    const gov = this.data.governments.get(a);
    const attitude = gov?.attitudes.get(b);
    if (attitude !== undefined) return attitude < 0;
    const other = this.data.governments.get(b);
    return (other?.attitudes.get(a) ?? 0) < 0;
  }

  /** Pick a target: the nearest hostile, or null. */
  private chooseTarget(ship: Ship): Ship | null {
    let best: Ship | null = null;
    let bestDistance = Infinity;
    for (const other of this.ships) {
      if (other === ship || other.isDestroyed) continue;
      if (!this.isEnemy(ship.government, other.government)) continue;
      const distance = ship.position.distanceSquared(other.position);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = other;
      }
    }
    return best;
  }

  private ai(ship: Ship): Commands {
    const commands = noCommands();
    if (ship.isDestroyed || ship.isDisabled) return commands;
    if (!ship.target || ship.target.isDestroyed) ship.target = this.chooseTarget(ship);
    const target = ship.target;
    if (!target) {
      // Wander gently, as an idle merchant would.
      commands.forward = this.frame % 180 < 90;
      commands.turn = Math.sin(this.frame / 300 + ship.position.x) > 0 ? 0.3 : -0.3;
      return commands;
    }
    const delta = Angle.fromPoint(target.position.sub(ship.position));
    let difference = delta.sub(ship.angle).degrees();
    const turn = Math.max(-1, Math.min(1, difference / Math.max(0.001, ship.turnRate())));
    commands.turn = turn;
    const distance = ship.position.distance(target.position);
    const range = this.weaponRange(ship);
    if (distance > range * 0.8) commands.forward = true;
    else if (distance < 150) commands.reverse = true;
    if (Math.abs(difference) < 8 && distance < range) commands.firePrimary = true;
    if (Math.abs(difference) < 12 && distance < range * 0.9) commands.fireSecondary = true;
    return commands;
  }

  weaponRange(ship: Ship): number {
    let range = 0;
    for (const hardpoint of ship.hardpoints) {
      const weapon = hardpoint.weapon;
      if (!weapon) continue;
      const speed = weapon.velocityOverride || weapon.velocity;
      range = Math.max(range, weapon.rangeOverride || speed * weapon.lifetime);
    }
    return range || 600;
  }

  private stepShip(ship: Ship, commands: Commands): void {
    ship.commands = commands;
    ship.generate(this.random);
    if (ship.isDestroyed) return;
    ship.move();
    const before = this.projectiles.length;
    ship.fire({ primary: commands.firePrimary, secondary: commands.fireSecondary }, this.projectiles, this.random);
    if (this.projectiles.length > before && this.onSound) {
      for (let i = before; i < this.projectiles.length; ++i) {
        const sound = this.projectiles[i].weapon.sound;
        if (sound) this.onSound(sound, 0.35);
      }
    }
    if (ship.damageOverlayTimer > 0) --ship.damageOverlayTimer;
    // Keep ships inside a sane area around the system.
    const limit = 30000;
    if (Math.abs(ship.position.x) > limit || Math.abs(ship.position.y) > limit) {
      ship.position = new Point(Math.max(-limit, Math.min(limit, ship.position.x)), Math.max(-limit, Math.min(limit, ship.position.y)));
      ship.velocity = new Point(0, 0);
    }
  }

  /** One frame at the original's 60 fps. */
  update(commands: Commands = noCommands()): void {
    if (this.landedOn || this.playerDestroyed) return;
    ++this.frame;
    this.selected = this.chooseTarget(this.player);
    this.player.target = this.selected;
    this.stepShip(this.player, this.player.isDisabled ? noCommands() : commands);
    for (const ship of this.ships) {
      if (ship === this.player || ship.isDestroyed) continue;
      this.stepShip(ship, this.ai(ship));
    }
    this.stepProjectiles();
    this.stepVisuals();
    this.removeDestroyed();
    this.spawnFleets();
  }

  private stepProjectiles(): void {
    const remaining: Projectile[] = [];
    for (const projectile of this.projectiles) {
      projectile.move(this.random);
      if (!projectile.dead) this.collide(projectile);
      if (projectile.dead) {
        if (projectile.deathType === 2) {
          this.spawnEffects(projectile.weapon.hitEffects, projectile.position, projectile.velocity, projectile.angle);
        } else if (projectile.deathType === 1 || projectile.deathType === 8) {
          this.spawnEffects(projectile.weapon.dieEffects, projectile.position, projectile.velocity, projectile.angle);
        }
      } else remaining.push(projectile);
    }
    this.projectiles = remaining;
  }

  private collide(projectile: Projectile): void {
    for (const ship of this.ships) {
      if (ship.isDestroyed || ship === projectile.owner) continue;
      if (ship.government === projectile.government) continue;
      const hitRadius = ship.radius + 2;
      if (projectile.position.distanceSquared(ship.position) > hitRadius * hitRadius) continue;
      this.spawnEffects(projectile.weapon.hitEffects, projectile.position, projectile.velocity, projectile.angle);
      ship.takeDamage(projectile.weapon, projectile.position, 1, projectile.government);
      if (projectile.weapon.blastRadius > 0) {
        for (const other of this.ships) {
          if (other === ship || other.isDestroyed || other.government === projectile.government) continue;
          const distance = other.position.distance(projectile.position);
          if (distance > projectile.weapon.blastRadius) continue;
          const r = distance / Math.max(1, projectile.weapon.blastRadius);
          const scale = 1 / Math.pow(1 + r * r * r * r, 2);
          other.takeDamage(projectile.weapon, projectile.position, scale, projectile.government);
        }
      }
      projectile.hitsRemaining -= 1;
      if (projectile.hitsRemaining <= 0) {
        projectile.dead = true;
        projectile.deathType = 2;
      }
      return;
    }
  }

  private spawnEffects(effects: { name: string; count: number }[], position: Point, velocity: Point, angle: Angle): void {
    for (const entry of effects) {
      const effect = this.data.effects.get(entry.name);
      if (!effect) continue;
      for (let i = 0; i < entry.count; ++i) {
        const random = this.random;
        const direction = effect.randomAngle ? randomAngle(() => random.real()) : angle;
        const speed = effect.randomVelocity ? random.real() * effect.randomVelocity : 0;
        this.visuals.push({
          effect,
          position: new Point(position.x, position.y),
          velocity: velocity.mul(effect.velocityScale).add(direction.unit().mul(speed)),
          angle: effect.randomAngle ? direction : angle,
          spin: effect.randomSpin ? (random.real() * 2 - 1) * effect.randomSpin : 0,
          age: 0,
          lifetime: effect.lifetime,
        });
      }
    }
  }

  private stepVisuals(): void {
    for (const visual of this.visuals) {
      visual.age += 1;
      visual.position = visual.position.add(visual.velocity);
      if (visual.spin) visual.angle = visual.angle.add(new Angle(visual.spin));
    }
    this.visuals = this.visuals.filter((v) => v.age < v.lifetime);
  }

  private removeDestroyed(): void {
    for (const ship of this.ships) {
      if (!ship.isDestroyed || ship === this.player) continue;
      if (ship.explosionTimer === 0) {
        for (let i = 0; i < 12; ++i) {
          const effect = this.data.effects.get('smoke');
          if (effect) this.visuals.push({
            effect, position: new Point(ship.position.x, ship.position.y),
            velocity: this.random.real() * 2 > 1 ? new Point(this.random.real() * 2 - 1, this.random.real() * 2 - 1) : new Point(),
            angle: randomAngle(() => this.random.real()), spin: 0, age: 0, lifetime: effect.lifetime,
          });
        }
        ship.explosionTimer = 1;
      }
    }
    this.ships = this.ships.filter((s) => s === this.player || !s.isDestroyed || s.explosionTimer === 0);
  }

  private spawnFleets(): void {
    if (--this.spawnCooldown > 0) return;
    this.spawnCooldown = 60;
    if (this.ships.length >= MAX_SHIPS) return;
    for (const entry of this.system.fleets) {
      const fleet = this.data.fleets.get(entry.name);
      if (!fleet?.variants.length) continue;
      if (this.random.real() < 1 / Math.max(1, entry.weight / 60)) this.spawnFleet(fleet);
    }
  }

  /** The nearest stellar object with a landable planet, if in range. */
  landingTarget(): StellarState | null {
    let best: StellarState | null = null;
    let bestDistance = Infinity;
    for (const state of this.objects) {
      if (!state.planet) continue;
      const distance = this.player.position.distance(state.position) - state.radius;
      if (distance < bestDistance) {
        bestDistance = distance;
        best = state;
      }
    }
    if (!best) return null;
    return this.player.canLand(best) ? best : null;
  }

  /** The nearest stellar object, for the HUD's distance display. */
  nearestObject(): StellarState | null {
    let best: StellarState | null = null;
    let bestDistance = Infinity;
    for (const state of this.objects) {
      const distance = this.player.position.distance(state.position) - state.radius;
      if (distance < bestDistance) {
        bestDistance = distance;
        best = state;
      }
    }
    return best;
  }

  addMessage(text: string): void {
    this.messages.push({ text, time: this.frame });
    if (this.messages.length > 6) this.messages.shift();
  }

  /** The effect frames a visual should show at its age. */
  static effectFrame(visual: Visual): number {
    const rate = visual.effect.frameRate || 1 / 60;
    const frame = Math.floor(visual.age * rate);
    return visual.effect.noRepeat ? frame : frame;
  }

  /** max range of the player's weapons, for the fire button's range ring */
  playerWeaponRange(): number {
    return this.weaponRange(this.player);
  }

  /** The direction and distance of the nearest hostile, for the HUD. */
  nearestHostile(): { ship: Ship; distance: number } | null {
    let best: Ship | null = null;
    let bestDistance = Infinity;
    for (const ship of this.ships) {
      if (ship === this.player || ship.isDestroyed || !this.isEnemy(this.player.government, ship.government)) continue;
      const distance = ship.position.distance(this.player.position);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = ship;
      }
    }
    return best ? { ship: best, distance: bestDistance } : null;
  }

  /** Whether the player's ship can jump at all (has a hyperdrive and fuel). */
  canJump(): boolean {
    return this.player.stats.get('hyperdrive') > 0 || this.player.stats.get('jump drive') > 0;
  }

  jumpFuel(): number {
    return this.player.stats.get('jump fuel') || 100;
  }

  /** Change the current system without a jump (for loading a save). */
  setSystem(system: StarSystem): void {
    this.system = system;
    this.arrangeSystem();
  }

  /** Compute a travel route of hyperspace links from `from` to `to`, or null. */
  route(from: StarSystem, to: StarSystem): StarSystem[] | null {
    if (from === to) return [];
    const queue: StarSystem[] = [from];
    const previous = new Map<StarSystem, StarSystem | null>([[from, null]]);
    while (queue.length) {
      const system = queue.shift()!;
      for (const name of system.links) {
        const next = this.data.systems.get(name);
        if (!next || previous.has(next)) continue;
        previous.set(next, system);
        if (next === to) {
          const path: StarSystem[] = [];
          let current: StarSystem | null = to;
          while (current && current !== from) {
            path.unshift(current);
            current = previous.get(current) ?? null;
          }
          return path;
        }
        queue.push(next);
      }
    }
    return null;
  }
}

export type { Weapon };
