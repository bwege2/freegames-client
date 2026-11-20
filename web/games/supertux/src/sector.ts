// One level sector: tilemaps, objects, players, the fixed-step simulation and the camera.
// The simulation order follows SuperTux 0.6.3's Sector::update: every object sets its movement,
// then the collision system moves the bodies and calls their collision callbacks.
import type { LevelData, SectorData, TilemapData, ObjectData } from './level.ts';
import { TileSet, SOLID, UNISOLID, SLOPE, WATER, HURTS, slopeData } from './tileset.ts';
import { Rect, EPSILON, moveWithCollision, type CollisionWorld, type Vec } from './physics.ts';
import { Entity, Controller } from './entity.ts';
import { Player, PlayerStatus, Bonus } from './player.ts';
import { imageReady, loadImage, loadText, type Sound } from './resources.ts';
import { BadGuy, makeBadGuy, Yeti } from './badguys.ts';
import {
  BonusBlock, InfoBlock, WeakBlock, UnstableTile, Trampoline, Coin, PowerUp, Platform,
  PathWalker, Bullet, Explosion, Trigger, PushButton, Dispenser, Firefly, Decal, BouncyCoin, Climbable,
} from './objects.ts';
import { ScriptRunner } from './scripts.ts';
import { parseSexp, child } from './sexp.ts';
import { advanceClock, setClock } from './timer.ts';

export const VIEW_W = 1280;
export const VIEW_H = 800;

interface TileHit { x: number; y: number; bbox: Rect; solid: boolean; slope: number | null; unisolid: boolean; unisolidDir: number; attributes: number }

export class TileLayer {
  data: TilemapData;
  tileset: TileSet;
  ox: number; oy: number;
  walker: PathWalker | null = null;
  constructor(data: TilemapData, tileset: TileSet, path: PathWalker | null) {
    this.data = data; this.tileset = tileset;
    this.ox = data.offsetX; this.oy = data.offsetY;
    this.walker = path;
    if (path) { this.ox = path.nodes[data.startingNode]?.x ?? this.ox; this.oy = path.nodes[data.startingNode]?.y ?? this.oy; }
  }
  get name(): string { return this.data.name; }
  gotoNode(n: number): void { this.walker?.gotoNode(n); }
  startMoving(): void { this.walker?.startMoving(); }
  stopMoving(): void { this.walker?.stopMoving(); }
  update(dt: number): void {
    if (!this.walker) return;
    this.walker.update(dt);
    this.ox = this.walker.x; this.oy = this.walker.y;
  }
  get solid(): boolean { return this.data.solid; }
  tileId(x: number, y: number): number {
    if (x < 0 || y < 0 || x >= this.data.width || y >= this.data.height) return 0;
    return this.data.tiles[y * this.data.width + x] ?? 0;
  }
  tilesOverlapping(rect: Rect): TileHit[] {
    if (!this.solid) return [];
    const x1 = Math.max(0, Math.floor((rect.left - this.ox) / 32));
    const x2 = Math.min(this.data.width, Math.ceil((rect.right - this.ox) / 32));
    const y1 = Math.max(0, Math.floor((rect.top - this.oy) / 32));
    const y2 = Math.min(this.data.height, Math.ceil((rect.bottom - this.oy) / 32));
    const out: TileHit[] = [];
    for (let y = y1; y < y2; y++) {
      for (let x = x1; x < x2; x++) {
        const id = this.tileId(x, y);
        if (!id) continue;
        const t = this.tileset.get(id);
        if (!(t.attributes & SOLID)) continue;
        const bbox = new Rect(this.ox + x * 32, this.oy + y * 32, this.ox + x * 32 + 32, this.oy + y * 32 + 32);
        out.push({
          x, y, bbox,
          solid: true,
          slope: (t.attributes & SLOPE) ? slopeData(t) : null,
          unisolid: (t.attributes & UNISOLID) !== 0,
          unisolidDir: t.data & 3,
          attributes: t.attributes,
        });
      }
    }
    return out;
  }
  isFreeOfTiles(rect: Rect, ignoreUnisolid = false, kind?: 'water' | 'hurts'): boolean {
    const x1 = Math.max(0, Math.floor((rect.left - this.ox) / 32));
    const x2 = Math.min(this.data.width, Math.ceil((rect.right - this.ox) / 32));
    const y1 = Math.max(0, Math.floor((rect.top - this.oy) / 32));
    const y2 = Math.min(this.data.height, Math.ceil((rect.bottom - this.oy) / 32));
    for (let y = y1; y < y2; y++) {
      for (let x = x1; x < x2; x++) {
        const id = this.tileId(x, y);
        if (!id) continue;
        const t = this.tileset.get(id);
        if (kind === 'water') { if (!(t.attributes & WATER)) continue; return false; }
        if (kind === 'hurts') { if (!(t.attributes & HURTS)) continue; return false; }
        if (!(t.attributes & SOLID)) continue;
        if (ignoreUnisolid && (t.attributes & UNISOLID)) continue;
        return false;
      }
    }
    return true;
  }
  draw(ctx: CanvasRenderingContext2D, camX: number, camY: number, time: number): void {
    const x1 = Math.max(0, Math.floor((camX - this.ox) / 32));
    const x2 = Math.min(this.data.width, Math.ceil((camX + VIEW_W - this.ox) / 32));
    const y1 = Math.max(0, Math.floor((camY - this.oy) / 32));
    const y2 = Math.min(this.data.height, Math.ceil((camY + VIEW_H - this.oy) / 32));
    ctx.globalAlpha = this.data.alpha;
    for (let y = y1; y < y2; y++) {
      for (let x = x1; x < x2; x++) {
        const id = this.data.tiles[y * this.data.width + x];
        if (!id) continue;
        this.tileset.draw(ctx, id, this.ox + x * 32 - camX, this.oy + y * 32 - camY, time);
      }
    }
    ctx.globalAlpha = 1;
  }
  hitsObjectBottom(_object: Entity): void {}
}

export interface SectorOptions {
  players: number;
  controllers: Controller[];
  statuses: PlayerStatus[];
  sound: Sound;
  spawnpoint?: string;
  onFinish?: () => void;
  onSwitchSector?: (sector: string, spawnpoint: string) => void;
  onDied?: (player: Player) => void;
  onCoins?: (total: number) => void;
}

export class Sector implements CollisionWorld {
  readonly level: LevelData;
  readonly data: SectorData;
  readonly tileset: TileSet;
  readonly layers: TileLayer[] = [];
  readonly objects: Entity[] = [];
  readonly players: Player[] = [];
  readonly explosions: Explosion[] = [];
  readonly statuses: PlayerStatus[];
  readonly sound: Sound;
  readonly runner: ScriptRunner;
  width: number; height: number;
  gravity: number;
  time = 0;
  camera = { x: 0, y: 0 };
  cameraCenter: Vec = { x: 0, y: 0 };
  message: { text: string; timer: number } | null = null;
  finished = false;
  private lastPlayerPos: Vec = { x: 0, y: 0 };
  private options: SectorOptions;
  private currentMover: Entity | null = null;
  private looks = { x: 0, y: 0 };
  private named = new Map<string, TileLayer | Platform>();
  private dyingTimer = 0;

  constructor(level: LevelData, sectorName: string, tileset: TileSet, options: SectorOptions) {
    this.level = level;
    const data = level.sectors.get(sectorName) ?? level.sectors.values().next().value as SectorData;
    this.data = data;
    this.tileset = tileset;
    this.width = data.width || VIEW_W;
    this.height = data.height || VIEW_H;
    this.gravity = data.gravity || 10;
    this.statuses = options.statuses;
    this.sound = options.sound;
    this.options = options;
    this.runner = new ScriptRunner(this);
    setClock(0);

    for (const tm of data.tilemaps) {
      const path = tm.pathRef ? level.paths.get(tm.pathRef) : undefined;
      const walker = path ? new PathWalker(path.nodes, path.mode) : null;
      const layer = new TileLayer(tm, tileset, walker);
      this.layers.push(layer);
      if (tm.name) this.named.set(tm.name, layer);
    }
    for (const o of data.objects) this.spawnObject(o);
    // players at the spawnpoint
    const spawnName = options.spawnpoint || 'main';
    let sp = data.spawnpoints.find((s) => s.name === spawnName) ?? data.spawnpoints.find((s) => s.name === 'main') ?? data.spawnpoints[0];
    if (!sp) sp = { name: 'main', x: 0, y: 0 };
    for (let i = 0; i < options.players; i++) {
      const status = options.statuses[i] ?? new PlayerStatus();
      const controller = options.controllers[i] ?? new Controller();
      const p = new Player(sp.x + i * 40, sp.y + (status.bonus === Bonus.NONE ? 32 : 0), i, controller, status);
      p.dir = 1;
      this.players.push(p);
      this.objects.push(p);
    }
    const p0 = this.players[0];
    if (p0) {
      this.camera.x = Math.max(0, Math.min(p0.bbox.left - VIEW_W * 0.4, Math.max(0, this.width - VIEW_W)));
      this.camera.y = Math.max(0, Math.min(p0.bbox.bottom - VIEW_H * 0.5, Math.max(0, this.height - VIEW_H)));
      this.lastPlayerPos = { x: p0.bbox.left, y: p0.bbox.bottom };
    }
    if (data.initScript) this.runner.run(data.initScript);
    if (data.music) this.playMusic(data.music);
  }

  private spawnObject(o: ObjectData): void {
    const dir: -1 | 1 = o.direction === 'right' ? 1 : o.direction === 'left' ? -1 : -1;
    const x = o.x, y = o.y;
    const sprite = o.sprite;
    switch (o.type) {
      case 'bonusblock': this.add(new BonusBlock(sprite || 'images/objects/bonus_block/bonusblock.sprite', x, y, o.numbers.get('count') ?? 1)); break;
      case 'infoblock': this.add(new InfoBlock(x, y, o.text('message', ''))); break;
      case 'weak_block': this.add(new WeakBlock(sprite || 'images/objects/weak_block/meltbox.sprite', x, y)); break;
      case 'unstable_tile': this.add(new UnstableTile(x, y)); break;
      case 'coin': {
        const ref = o.strings.get('path-ref');
        const path = ref ? this.level.paths.get(ref) : undefined;
        const node = path?.nodes[0];
        this.add(new Coin(node ? node.x : x, node ? node.y : y, !!path));
        break;
      }
      case 'trampoline': this.add(new Trampoline(x, y, sprite || undefined)); break;
      case 'platform': {
        const ref = o.strings.get('path-ref');
        const path = ref ? this.level.paths.get(ref) : undefined;
        if (path) {
          const running = o.booleans.get('running') ?? true;
          const automatic = o.name === '' && !running;
          const platform = new Platform(sprite || 'images/objects/platforms/small.sprite', new PathWalker(path.nodes, path.mode), o.numbers.get('starting-node') ?? 0, automatic);
          platform.name = o.name;
          this.add(platform);
          if (o.name) this.named.set(o.name, platform);
        }
        break;
      }
      case 'pushbutton': this.add(new PushButton(x, y, o.text('script', ''), sprite || 'images/objects/pushbutton/pushbutton.sprite')); break;
      case 'switch': this.add(new PushButton(x, y, o.text('script', ''), sprite || 'images/objects/switch/switch.sprite')); break;
      case 'dispenser': this.add(new Dispenser(x, y, o.numbers.get('cycle') ?? 2, o.text('badguy', o.text('type', 'snowball')))); break;
      case 'firefly': this.add(new Firefly(x, y)); break;
      case 'decal': this.add(new Decal(x, y, o.numbers.get('z-pos') ?? -10, sprite)); break;
      case 'sequencetrigger': this.add(new Trigger(x, y, o.width || 32, o.height || 32, '', o.text('sequence', ''))); break;
      case 'scripttrigger': this.add(new Trigger(x, y, o.width || 32, o.height || 32, o.text('script', ''), '')); break;
      case 'secretarea': {
        const t = new Trigger(x, y, o.width || 32, o.height || 32, '', 'secret');
        t.script = '';
        this.add(t);
        break;
      }
      case 'powerup': {
        // Icy Island's powerup objects are scripted crystal switches; the scripts only play a sound.
        this.add(new Decal(x, y, 0, sprite));
        break;
      }
      case 'yeti_stalactite': {
        const s = makeBadGuy('stalactite', x, y, dir);
        if (s) this.add(s);
        break;
      }
      case 'climbable': this.add(new Climbable(x, y, o.width, o.height)); break;
      case 'torch': case 'candle': case 'wind':
      case 'particles-snow': case 'particles-clouds': case 'ambient-light': case 'camera':
      case 'resetpoint': case 'door': case 'castledoor': case 'scriptedobject': case 'background':
        break;
      default: {
        const bad = makeBadGuy(o.type, x, y, dir, {
          radius: o.numbers.get('radius'), speed: o.numbers.get('speed'), sprite: sprite || undefined,
        });
        if (bad) this.add(bad);
        break;
      }
    }
  }

  add(e: Entity): void {
    if (e instanceof BadGuy) e.bindSector(this);
    this.objects.push(e);
  }

  remove(e: Entity): void {
    const i = this.objects.indexOf(e);
    if (i >= 0) this.objects.splice(i, 1);
    e.onRemoved();
  }

  namedObject(name: string): TileLayer | Platform | undefined { return this.named.get(name); }

  climbableAt(rect: Rect): boolean {
    for (const e of this.objects) {
      if (!(e instanceof Climbable) || e.removed) continue;
      if (rect.right > e.bbox.left && rect.left < e.bbox.right && rect.bottom > e.bbox.top && rect.top < e.bbox.bottom) return true;
    }
    return false;
  }

  get bullets(): number { return this.objects.filter((e) => e instanceof Bullet && !e.removed).length; }

  getNearestPlayer(bbox: Rect): Player | null {
    let best: Player | null = null;
    let bestD = Infinity;
    for (const p of this.players) {
      if (p.dying || p.dead) continue;
      const d = Math.hypot(p.bbox.middle.x - bbox.middle.x, p.bbox.middle.y - bbox.middle.y);
      if (d < bestD) { best = p; bestD = d; }
    }
    return best;
  }

  canSee(_p: Vec): boolean {
    // the original checks line of sight against solid tilemaps; near enemies are enough here
    return true;
  }

  playSound(path: string, volume = 1): void { this.sound.play(path.replace(/^\/+/, ''), volume); }
  playMusic(path: string): void {
    const clean = path.replace(/^\/+/, '');
    if (clean.endsWith('.music')) {
      void loadText(clean).then((text) => {
        const doc = parseSexp(text);
        const file = child(doc, 'file');
        if (file && typeof file[1] === 'string') {
          const dir = clean.slice(0, clean.lastIndexOf('/') + 1);
          this.sound.playMusic(dir + file[1]);
        }
      }).catch(() => { /* no music */ });
    } else this.sound.playMusic(clean);
  }

  showMessage(text: string): void { this.message = { text, timer: 4.5 }; }

  // ---- collision interface (CollisionWorld) ----
  tilesOverlapping(rect: Rect): Array<{ x: number; y: number; bbox: Rect; solid: boolean; slope: number | null; unisolid: boolean; unisolidDir: number }> {
    const out: Array<{ x: number; y: number; bbox: Rect; solid: boolean; slope: number | null; unisolid: boolean; unisolidDir: number }> = [];
    for (const layer of this.layers) for (const t of layer.tilesOverlapping(rect)) out.push(t);
    for (const e of this.objects) {
      if (e === this.currentMover || e.removed || e.group !== 'static') continue;
      if (e.bbox.right < rect.left || e.bbox.left > rect.right || e.bbox.bottom < rect.top || e.bbox.top > rect.bottom) continue;
      out.push({ x: -1, y: -1, bbox: e.bbox, solid: true, slope: null, unisolid: false, unisolidDir: 0 });
    }
    return out;
  }

  isFreeOfTiles(rect: Rect, ignoreUnisolid = false, kind?: 'water' | 'hurts'): boolean {
    for (const layer of this.layers) if (!layer.isFreeOfTiles(rect, ignoreUnisolid, kind)) return false;
    return true;
  }

  isFreeOfStatics(rect: Rect, ignore?: Entity, ignoreUnisolid = false): boolean {
    if (!this.isFreeOfTiles(rect, ignoreUnisolid)) return false;
    for (const e of this.objects) {
      if (e === ignore || e === this.currentMover || e.removed || e.group !== 'static') continue;
      if (rect.right < e.bbox.left || rect.left > e.bbox.right || rect.bottom < e.bbox.top || rect.top > e.bbox.bottom) continue;
      return false;
    }
    return true;
  }

  tileAttributesAt(rect: Rect): number {
    let attrs = 0;
    for (const layer of this.layers) {
      for (const t of layer.tilesOverlapping(rect)) attrs |= t.attributes;
    }
    return attrs;
  }

  // ---- the simulation ----
  update(dt: number): void {
    if (this.finished) return;
    this.time += dt;
    advanceClock(dt);
    this.runner.update(dt);
    for (const e of this.objects) if (!e.removed) e.update(dt, this);
    for (const layer of this.layers) layer.update(dt);

    // moving tilemaps and platforms carry Tux standing on them
    const carriers: Array<{ e: Entity; dx: number; dy: number }> = [];
    for (const e of this.objects) {
      if (e instanceof Platform) {
        const dx = e.movement.x, dy = e.movement.y;
        if (dx || dy) { e.bbox.move({ x: dx, y: dy }); carriers.push({ e, dx, dy }); }
      }
    }
    for (const c of carriers) {
      for (const p of this.players) {
        if (p.removed || p.dying) continue;
        if (Math.abs(p.bbox.bottom - c.e.bbox.top) < 5 && p.bbox.right > c.e.bbox.left && p.bbox.left < c.e.bbox.right) {
          const nx = p.bbox.left + c.dx, ny = p.bbox.top + c.dy;
          if (this.isFreeOfTiles(new Rect(nx, ny, nx + p.bbox.width, ny + p.bbox.height), true)) p.setPos(nx, ny);
        }
      }
    }
    // moving solids (blocks that fall, bullets, bombs, players, badguys)
    for (const e of this.objects) {
      if (e.removed || e.group !== 'moving' || e instanceof Platform) continue;
      if (e.movement.x === 0 && e.movement.y === 0) continue;
      this.currentMover = e;
      moveWithCollision(this, e.movement, e.bbox, (hit) => e.onSolid(hit, this));
      this.currentMover = null;
      const attrs = this.tileAttributesAt(e.bbox);
      if (attrs) e.onTile(attrs, this);
    }

    this.interactions(dt);
    this.updateCamera(dt);
    for (const e of this.objects) {
      if (e instanceof BadGuy) e.sprite?.update(dt);
      else if (e.sprite) e.sprite.update(dt);
    }
    for (const ex of this.explosions) ex.update(dt);
    for (let i = this.explosions.length - 1; i >= 0; i--) if (this.explosions[i].life <= 0) this.explosions.splice(i, 1);
    if (this.message) { this.message.timer -= dt; if (this.message.timer <= 0) this.message = null; }
    this.objects.splice(0, this.objects.length, ...this.objects.filter((e) => !e.removed));
    this.statuses[0] && this.options.onCoins?.(this.statuses[0].coins);

    // death/respawn
    const alive = this.players.filter((p) => !p.dead && !p.dying);
    if (alive.length === 0) {
      this.dyingTimer += dt;
      if (this.dyingTimer > 1.5) this.restartAfterDeath();
    } else this.dyingTimer = 0;
  }

  private restartAfterDeath(): void {
    this.dyingTimer = 0;
    this.options.statuses.forEach((s) => { s.bonus = Bonus.NONE; });
    this.options.onDied?.(this.players[0]);
  }

  private interactions(_dt: number): void {
    const players = this.players.filter((p) => !p.dying && !p.dead);
    for (const p of players) {
      // static objects
      for (const e of this.objects) {
        if (e.removed || e === p) continue;
        if (p.bbox.right <= e.bbox.left || p.bbox.left >= e.bbox.right || p.bbox.bottom <= e.bbox.top || p.bbox.top >= e.bbox.bottom + 2) continue;
        if (e instanceof Coin) e.collect(p, this);
        else if (e instanceof PowerUp) e.collect(p, this);
        else if (e instanceof BonusBlock || e instanceof WeakBlock || e instanceof InfoBlock) {
          // hit from below: Tux was moving up and his head is at the block's bottom edge
          if (p.velocity.y <= 0.3 && p.bbox.top > e.bbox.top && p.bbox.top < e.bbox.bottom + 2) e.hitFromBelow(p, this);
        } else if (e instanceof UnstableTile) {
          if (Math.abs(p.bbox.bottom - e.bbox.top) < 3) e.playerTouched();
        } else if (e instanceof Trampoline) {
          if (p.velocity.y >= 0 && Math.abs(p.bbox.bottom - e.bbox.top) < 6) {
            p.velocity.y = -500; p.onGroundFlag = false; this.playSound('sounds/trampoline.wav');
          }
        } else if (e instanceof PushButton) {
          if (e.pressed <= 0) { e.pressed = 0.5; this.runner.run(e.script); this.playSound('sounds/switch.ogg'); }
        } else if (e instanceof Trigger) {
          if (e.once && !e.fired && e.playerInside(p)) {
            e.fired = true;
            if (e.sequence === 'secret') this.showMessage('You found a secret area!');
            else if (e.sequence) { if (/endsequence|stoptux/.test(e.sequence)) this.finishLevel(); }
            else if (e.script) this.runner.run(e.script);
          }
        } else if (e instanceof BadGuy) {
          if (!e.isActive) continue;
          const stomp = p.velocity.y > 0 && p.bbox.bottom - e.bbox.top < 16 && p.bbox.bottom > e.bbox.top;
          if (stomp) { p.bbox.setBottom(e.bbox.top - EPSILON); if (e.stomp(p, this)) continue; }
          e.touchPlayer(p, this);
        } else if (e instanceof Bullet) {
          // handled below with badguys
        }
      }
      if (p.bbox.top > this.height) p.kill(true, this);
    }

    // bullets against badguys and weak blocks
    for (const b of this.objects) {
      if (!(b instanceof Bullet) || b.removed) continue;
      for (const e of this.objects) {
        if (e.removed || e === b) continue;
        if (b.bbox.right <= e.bbox.left || b.bbox.left >= e.bbox.right || b.bbox.bottom <= e.bbox.top || b.bbox.top >= e.bbox.bottom) continue;
        if (e instanceof BadGuy && e.isActive) {
          if (b.type === Bonus.FIRE && e['flammable']) e.ignite(this);
          else if (b.type === Bonus.ICE && e['freezable']) e.freeze();
          else if (e instanceof Yeti) { const p0 = this.players[0]; if (p0) e.stomp(p0, this); else e.killFall(this); }
          b.removed = true; b.active = false;
          this.playSound(b.type === Bonus.FIRE ? 'sounds/fizz.wav' : 'sounds/sizzle.ogg');
          break;
        }
        if (e instanceof WeakBlock && b.type === Bonus.FIRE) { e.ignite(this); b.removed = true; b.active = false; break; }
      }
    }

    // badguy/badguy collisions turn walkers around
    for (const a of this.objects) {
      if (!(a instanceof BadGuy) || !a.isActive) continue;
      for (const b of this.objects) {
        if (b === a || !(b instanceof BadGuy) || !b.isActive) continue;
        if (a.bbox.right <= b.bbox.left || a.bbox.left >= b.bbox.right || a.bbox.bottom <= b.bbox.top || a.bbox.top >= b.bbox.bottom) continue;
        if ('turnAround' in a) (a as unknown as { turnAround(s: Sector): void }).turnAround(this);
      }
    }
  }

  explode(pos: Vec, radius: number): void {
    this.explosions.push(new Explosion(pos.x, pos.y, radius));
    for (const e of this.objects) {
      if (e.removed) continue;
      if (Math.hypot(e.bbox.middle.x - pos.x, e.bbox.middle.y - pos.y) > radius) continue;
      if (e instanceof BadGuy && e.isActive) e.killFall(this);
      if (e instanceof WeakBlock) e.ignite(this);
    }
    for (const p of this.players) {
      if (p.dying || p.dead) continue;
      if (Math.hypot(p.bbox.middle.x - pos.x, p.bbox.middle.y - pos.y) < radius * 0.6) p.kill(false, this);
    }
  }

  spawnCoins(pos: Vec, n: number): void {
    for (let i = 0; i < n; i++) this.add(new BouncyCoin(pos.x + (i - n / 2) * 8, pos.y));
  }

  spawnBadGuy(type: string, x: number, y: number, dir: -1 | 1): void {
    const b = makeBadGuy(type, x, y, dir);
    if (b) this.add(b);
  }

  shake(_time: number, _depth: number): void {}

  onPlayerDied(_player: Player): void {}

  addBullet(pos: Vec, velocity: Vec, dir: -1 | 1, type: Bonus): void {
    this.add(new Bullet(pos, velocity, dir, type));
    this.spawnBulletSound(type);
  }
  private spawnBulletSound(_type: Bonus): void {}

  finishLevel(): void {
    if (this.finished) return;
    this.finished = true;
    this.options.onFinish?.();
  }

  switchSector(name: string, spawnpoint: string): void {
    this.options.onSwitchSector?.(name, spawnpoint);
  }

  // ---- camera (Camera.cpp normal mode, xmode 4, ymode 3) ----
  private updateCamera(dt: number): void {
    const p = this.players[0];
    if (!p) return;
    const playerPos = { x: p.bbox.left, y: p.bbox.bottom };
    const delta = { x: playerPos.x - this.lastPlayerPos.x, y: playerPos.y - this.lastPlayerPos.y };
    this.lastPlayerPos = playerPos;
    if (dt > 0.00001) {
      const leftEnd = VIEW_W * 0.4, rightEnd = VIEW_W * 0.6;
      if (delta.x < -0.00001) {
        this.looks.x -= delta.x * 0.8;
        if (this.looks.x > rightEnd) this.looks.x = rightEnd;
      } else if (delta.x > 0.00001) {
        this.looks.x -= delta.x * 0.8;
        if (this.looks.x < leftEnd) this.looks.x = leftEnd;
      }
      if (this.looks.x > rightEnd) this.looks.x = rightEnd;
      if (this.looks.x < leftEnd) this.looks.x = leftEnd;
      if (playerPos.x < leftEnd) this.looks.x = leftEnd;
      if (playerPos.x > this.width - leftEnd) this.looks.x = rightEnd;
      this.camera.x = playerPos.x - this.looks.x;
      const halfY = VIEW_H * 0.17;
      const lower = playerPos.y - VIEW_H * (0.5 + halfY);
      const upper = playerPos.y - VIEW_H * (0.5 - halfY);
      this.camera.y = Math.max(lower, Math.min(upper, this.camera.y || upper));
    }
    this.camera.x = Math.max(0, Math.min(this.camera.x, Math.max(0, this.width - VIEW_W)));
    this.camera.y = Math.max(0, Math.min(this.camera.y, Math.max(0, this.height - VIEW_H)));
    if (this.height < VIEW_H) this.camera.y = this.height / 2 - VIEW_H / 2;
    if (this.width < VIEW_W) this.camera.x = this.width / 2 - VIEW_W / 2;
    this.cameraCenter = { x: this.camera.x + VIEW_W / 2, y: this.camera.y + VIEW_H / 2 };
  }

  // ---- drawing ----
  draw(ctx: CanvasRenderingContext2D): void {
    const camX = Math.round(this.camera.x), camY = Math.round(this.camera.y);
    this.drawBackgrounds(ctx, camX, camY);
    const drawables: Array<{ z: number; draw: () => void }> = [];
    for (const layer of this.layers) drawables.push({ z: layer.data.z, draw: () => layer.draw(ctx, camX, camY, this.time) });
    for (const e of this.objects) {
      if (e.removed || !e.active) continue;
      drawables.push({ z: e.z, draw: () => { ctx.save(); ctx.translate(-camX, -camY); e.draw(ctx); ctx.restore(); } });
    }
    for (const ex of this.explosions) drawables.push({ z: 5, draw: () => { ctx.save(); ctx.translate(-camX, -camY); ex.draw(ctx); ctx.restore(); } });
    drawables.sort((a, b) => a.z - b.z);
    for (const d of drawables) d.draw();
  }

  private drawBackgrounds(ctx: CanvasRenderingContext2D, camX: number, camY: number): void {
    const bgs = [...this.data.backgrounds].sort((a, b) => a.z - b.z);
    if (bgs.length === 0) {
      const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
      g.addColorStop(0, 'rgba(77,102,191,1)'); g.addColorStop(1, 'white');
      ctx.fillStyle = g; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      return;
    }
    for (const b of bgs) {
      if (b.gradientTop && b.gradientBottom) {
        const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
        g.addColorStop(0, `rgb(${b.gradientTop.map((v) => Math.round(v * 255)).join(',')})`);
        g.addColorStop(1, `rgb(${b.gradientBottom.map((v) => Math.round(v * 255)).join(',')})`);
        ctx.fillStyle = g; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      } else if (b.color) {
        ctx.fillStyle = `rgb(${b.color.map((v) => Math.round(v * 255)).join(',')})`;
        ctx.fillRect(0, 0, VIEW_W, VIEW_H);
      }
      for (const name of [b.imageTop, b.image, b.imageBottom]) {
        if (!name) continue;
        const path = this.backgroundPath(name);
        const img = imageReady(path);
        if (!img) { void loadImage(path); continue; }
        const sx = -camX * b.speed;
        let sy: number;
        if (name === b.imageBottom) sy = VIEW_H - img.height + camY * (1 - b.speed);
        else if (name === b.imageTop) sy = camY * (b.speed - 1);
        else sy = -camY * b.speed + (VIEW_H - img.height) / 2;
        // tile horizontally so a small image still fills the wide screen
        for (let x = ((sx % img.width) + img.width) % img.width - img.width; x < VIEW_W; x += img.width) {
          ctx.drawImage(img, x, sy);
        }
      }
    }
  }

  private backgroundPath(name: string): string {
    const clean = name.replace(/^\/+/, '');
    if (!clean.startsWith('images/background/') && clean.startsWith('images/')) return clean;
    const base = clean.replace(/^images\/background\//, '');
    const fallback: Record<string, string> = {
      'arctis2.png': 'antarctic/arctis2.png', 'misty_snowhills_small.png': 'antarctic/misty_snowhills_small.png',
      'semi_arctic.jpg': 'antarctic/semi_arctic.jpg', 'bridgecloud-dark.png': 'arctic_bridge/bridgecloud-dark.png',
      'bridgecloud-light.png': 'arctic_bridge/bridgecloud-light.png', 'bridgeocean-fade.png': 'arctic_bridge/bridgeocean-fade.png',
      'bridgeocean-nofade.png': 'arctic_bridge/bridgeocean-nofade.png', 'bridgeocean-original.png': 'arctic_bridge/bridgeocean-original.png',
      'arcticskies1.png': 'arcticskies/arcticskies1.png', 'arcticskies2.png': 'arcticskies/arcticskies2.png',
      'arcticskies3.png': 'arcticskies/arcticskies3.png', 'arcticskies35.png': 'arcticskies/arcticskies35.png',
      'arcticskies4.png': 'arcticskies/arcticskies4.png', 'block-snow-background.png': 'block_snow/block-snow-background.png',
      'block-snow-midground.png': 'block_snow/block-snow-midground.png', 'block-snow-top.png': 'block_snow/block-snow-top.png',
      'bluemountain-bottom.png': 'bluemountain/bluemountain-bottom.png', 'bluemountain-middle.png': 'bluemountain/bluemountain-middle.png',
      'bluemountain-top.png': 'bluemountain/bluemountain-top.png', 'bluemountain2.png': 'bluemountain/bluemountain2.png',
      'castle_foreground.png': 'castle/castle_foreground.png', 'snowcastle.png': 'castle/snowcastle.png',
      'cloud-mountains-background.png': 'cloud_mountains/cloud-mountains-background.png',
      'cloud-mountains-bottom.png': 'cloud_mountains/cloud-mountains-bottom.png',
      'cloud-mountains-forground.png': 'cloud_mountains/cloud-mountains-forground.png',
      'cloud-mountains-midground.png': 'cloud_mountains/cloud-mountains-midground.png',
      'dawn_hill_para_blur.png': 'forest/dawn_hill_para_blur.png', 'forest2_para.png': 'forest/forest2_para.png',
      'forest_para2.png': 'forest/forest_para2.png', 'forest_para3.png': 'forest/forest_para3.png',
      'forest_para3_bottom.png': 'forest/forest_para3_bottom.png', 'nighthills.png': 'forest/nighthills.png',
      'ghostforest.jpg': 'ghostforest/ghostforest.jpg', 'ghostforest_grave.png': 'ghostforest/ghostforest_grave.png',
      'ghostforest_para.png': 'ghostforest/ghostforest_para.png', 'cave2.jpg': 'ice_cave/cave2.jpg',
      'darkcave-background.png': 'ice_cave/darkcave-background.png', 'darkcave-middle.png': 'ice_cave/darkcave-middle.png',
      'darkcave-preview.png': 'ice_cave/darkcave-preview.png', 'darkcave-top_and_bottom.png': 'ice_cave/darkcave-top_and_bottom.png',
      'darkcavemidground-middle.png': 'ice_cave/darkcavemidground-middle.png',
      'darkcavemidground-top_and_bottom.png': 'ice_cave/darkcavemidground-top_and_bottom.png',
      'black_800px.png': 'misc/black_800px.png', 'fog.png': 'misc/fog.png', 'grid.png': 'misc/grid.png',
      'grid.surface': 'misc/grid.surface', 'heatshimmer-displacement.png': 'misc/heatshimmer-displacement.png',
      'heatshimmer.png': 'misc/heatshimmer.png', 'heatshimmer.surface': 'misc/heatshimmer.surface',
      'leaves.png': 'misc/leaves.png', 'oiltux.jpg': 'misc/oiltux.jpg', 'transparent_up.png': 'misc/transparent_up.png',
      'nightsky.png': 'nightsky/nightsky.png', 'nightsky_bottom.png': 'nightsky/nightsky_bottom.png',
      'nightsky_middle.png': 'nightsky/nightsky_middle.png', 'nightsky_para.png': 'nightsky/nightsky_para.png',
      'nightsky_top.png': 'nightsky/nightsky_top.png',
    };
    return `images/background/${fallback[base] ?? base}`;
  }
}
