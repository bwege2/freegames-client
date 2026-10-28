// World.cpp: what the world looks like at a point (tiles, chests, sprites and their animations),
// the player and the spouse. Samples that do not change are cached in a 30000-entry hash table,
// as in the original.
import { HashTable } from './HashTable.ts';
import { CHEST_CLOSED, CHEST_OPEN, GameMap, TILE_H, TILE_W } from './map.ts';
import type { Image } from './assets.ts';

/** An image's channels as the original holds them: 255 * (1/255 * byte), in doubles. */
export class GraphicContainer {
  readonly w: number;
  readonly h: number;
  readonly red: Float64Array;
  readonly green: Float64Array;
  readonly blue: Float64Array;

  constructor(img: Image) {
    this.w = img.w;
    this.h = img.h;
    const n = img.w * img.h;
    this.red = new Float64Array(n);
    this.green = new Float64Array(n);
    this.blue = new Float64Array(n);
    const inv255 = 1.0 / 255.0;
    for (let i = 0; i < n; i++) {
      this.red[i] = 255 * (inv255 * img.rgb[i * 3]);
      this.green[i] = 255 * (inv255 * img.rgb[i * 3 + 1]);
      this.blue[i] = 255 * (inv255 * img.rgb[i * 3 + 2]);
    }
  }
}

class Animation {
  x: number;
  y: number;
  readonly frameW: number;
  readonly frameH: number;
  imageW: number;
  /** can blend between pages */
  pageNumber = 0;
  numPages: number;
  frameNumber = 0;
  numFrames: number;
  readonly autoStep: boolean;
  readonly removeAtEnd: boolean;
  graphics: GraphicContainer;

  constructor(x: number, y: number, frameW: number, frameH: number, autoStep: boolean, removeAtEnd: boolean, g: GraphicContainer) {
    this.x = x;
    this.y = y;
    this.frameW = frameW;
    this.frameH = frameH;
    this.autoStep = autoStep;
    this.removeAtEnd = removeAtEnd;
    this.graphics = g;
    this.imageW = g.w;
    this.numFrames = Math.trunc((g.h - frameH) / frameH) + 1;
    this.numPages = Math.trunc((g.w - frameW) / frameW) + 1;
  }

  swapGraphics(g: GraphicContainer): void {
    this.graphics = g;
    this.imageW = g.w;
    this.numFrames = Math.trunc((g.h - this.frameH) / this.frameH) + 1;
    this.numPages = Math.trunc((g.w - this.frameW) / this.frameW) + 1;
    if (this.pageNumber >= this.numPages) this.pageNumber = this.numPages - 1;
    if (this.frameNumber >= this.numFrames) this.frameNumber = this.numFrames - 1;
  }
}

interface Rgb { r: number; g: number; b: number }

export interface WorldGraphics {
  tileSet: GraphicContainer;
  chest: GraphicContainer;
  characterSprite: GraphicContainer;
  characterSpriteSad: GraphicContainer;
  spouseSprite: GraphicContainer;
  chestPrize: GraphicContainer;
  chestDust: GraphicContainer;
  heart: GraphicContainer;
}

const idiv = (a: number, b: number) => Math.trunc(a / b);

// tile sets: how wide a swath of the world uses one set, and the overlap while blending to the next
const TILE_SET_WORLD_SPAN = 200, TILE_SET_WORLD_OVERLAP = 50, TILE_SET_SKIP = 0;
const TILE_SET_ORDER = [0, 2, 10, 1, 8, 3, 5, 6, 4, 7, 13, 9, 15, 14, 16, 12, 11, 17];
const CHEST_W = 8, CHEST_H = 8;
const GEM_LOCATIONS = [41, 42, 43, 44, 45, 46];
const GEM_COLORS = [[255, 0, 0], [0, 255, 0], [255, 160, 0], [0, 0, 255], [255, 255, 0], [255, 0, 255]];

export class World {
  readonly map = new GameMap();
  private readonly g: WorldGraphics;
  private animations: Animation[] = [];
  private spriteIndex = 0;
  private spouseIndex = 1;
  private playerDead = false;
  private spouseDead = false;
  private metSpouse = false;
  private tileImageW = 0;
  private numTileSets = 1;
  private readonly sampleCache = new HashTable<Rgb>(30000, { r: 0, g: 0, b: 0 });

  constructor(g: WorldGraphics) {
    this.g = g;
  }

  /** initWorld() */
  init(seed: number): void {
    this.map.reset(seed);
    this.sampleCache.clear();
    this.playerDead = this.spouseDead = this.metSpouse = false;
    this.animations = [];
    this.tileImageW = this.g.tileSet.w;
    this.numTileSets = idiv(this.tileImageW + 1, TILE_W + 1);
    this.animations.push(new Animation(0, 0, 8, 8, false, false, this.g.characterSprite));
    this.spriteIndex = this.animations.length - 1;
    const spouse = new Animation(100, 7, 8, 8, false, false, this.g.spouseSprite);
    spouse.frameNumber = 7;
    this.animations.push(spouse);
    this.spouseIndex = this.animations.length - 1;
  }

  private mapTileSet(n: number): number {
    return TILE_SET_ORDER[n % 18] % this.numTileSets;
  }

  private static transparent(c: GraphicContainer, i: number): boolean {
    // the transparent colour is the corner's
    return c.red[i] === c.red[0] && c.green[i] === c.green[0] && c.blue[i] === c.blue[0];
  }

  /** sampleFromWorld(): a pixel as 0xRRGGBB, weighted (for blending two samples) */
  sample(x: number, y: number, weight = 1.0): number {
    const c = this.sampleHashed(x, y);
    const r = Math.trunc(weight * c.r) & 0xff, g = Math.trunc(weight * c.g) & 0xff, b = Math.trunc(weight * c.b) & 0xff;
    return ((r << 16) | (g << 8) | b) >>> 0;
  }

  private spritePresent(x: number, y: number): boolean {
    for (const a of this.animations) {
      const ax = Math.trunc(x - a.x + idiv(a.frameW, 2)), ay = Math.trunc(y - a.y + idiv(a.frameH, 2));
      if (ax >= 0 && ax < a.frameW && ay >= 0 && ay < a.frameH) return true;
    }
    return false;
  }

  private sampleHashed(x: number, y: number): Rgb {
    let found = this.sampleCache.lookup(x, y);
    // a sprite here: the cached sample may be under it
    if (this.spritePresent(x, y)) found = undefined;
    if (found) return found;
    const out = { transient: false };
    const s = this.sampleNoWeight(x, y, out);
    if (!out.transient) this.sampleCache.insert(x, y, s);
    return s;
  }

  private sampleNoWeight(x: number, y: number, out: { transient: boolean }): Rgb {
    out.transient = false;
    const c: Rgb = { r: 0, g: 0, b: 0 };
    let isAnim = false;
    // animations in reverse order, so that the oldest are drawn on top
    for (let i = this.animations.length - 1; i >= 0; i--) {
      const a = this.animations[i];
      const ax = Math.trunc(x - a.x + idiv(a.frameW, 2)), ay = Math.trunc(y - a.y + idiv(a.frameH, 2));
      if (!(ax >= 0 && ax < a.frameW && ay >= 0 && ay < a.frameH)) continue;
      let index = ay * a.imageW + ax;
      index += Math.trunc(a.pageNumber) * (a.frameW + 1);
      index += a.frameNumber * a.imageW * (a.frameH + 1);
      const blendIndex = index + a.frameW + 1;
      const blend = a.pageNumber - Math.trunc(a.pageNumber);
      const gfx = a.graphics;
      if (World.transparent(gfx, index)) continue;
      if (blend !== 0) {
        c.r = (1 - blend) * gfx.red[index] + blend * gfx.red[blendIndex];
        c.g = (1 - blend) * gfx.green[index] + blend * gfx.green[blendIndex];
        c.b = (1 - blend) * gfx.blue[index] + blend * gfx.blue[blendIndex];
      } else {
        c.r = gfx.red[index];
        c.g = gfx.green[index];
        c.b = gfx.blue[index];
      }
      out.transient = true;
      isAnim = true; // later (older) animations may still draw on top
    }
    if (isAnim) return c;

    const map = this.map;
    let tileIndex: number;
    const blocked = map.isBlocked(x, y);
    if (!blocked) tileIndex = 0;
    else {
      let n = 0;
      if (map.isBlocked(x, y - TILE_H)) n |= 1; // top
      if (map.isBlocked(x + TILE_W, y)) n |= 1 << 1; // right
      if (map.isBlocked(x, y + TILE_H)) n |= 1 << 2; // bottom
      if (map.isBlocked(x - TILE_W, y)) n |= 1 << 3; // left
      tileIndex = n + 1; // skip the empty tile
    }
    // pick a tile set, blending into the next one over the overlap
    const span = TILE_SET_WORLD_SPAN + TILE_SET_WORLD_OVERLAP;
    let tileSet = idiv(x, span) + TILE_SET_SKIP;
    let overhang = x % span;
    if (x < 0) { overhang = 0; tileSet = 0; }
    let blendTileSet = tileSet + 1;
    let blendWeight = 0;
    if (overhang > TILE_SET_WORLD_SPAN) blendWeight = (overhang - TILE_SET_WORLD_SPAN) / TILE_SET_WORLD_OVERLAP;
    tileSet %= this.numTileSets;
    blendTileSet %= this.numTileSets;
    if (tileSet < 0) tileSet += this.numTileSets;
    if (blendTileSet < 0) blendTileSet += this.numTileSets;
    tileSet = this.mapTileSet(tileSet);
    blendTileSet = this.mapTileSet(blendTileSet);
    let imageY = y % TILE_H, imageX = x % TILE_W;
    if (imageX < 0) imageX += TILE_W;
    if (imageY < 0) imageY += TILE_H;
    const tiles = this.g.tileSet, tw = this.tileImageW;
    const offset = tileIndex * (TILE_H + 1) * tw + tileSet * (TILE_W + 1);
    const blendOffset = tileIndex * (TILE_H + 1) * tw + blendTileSet * (TILE_W + 1);
    const ii = offset + imageY * tw + imageX, bi = blendOffset + imageY * tw + imageX;
    c.r = (1 - blendWeight) * tiles.red[ii] + blendWeight * tiles.red[bi];
    c.g = (1 - blendWeight) * tiles.green[ii] + blendWeight * tiles.green[bi];
    c.b = (1 - blendWeight) * tiles.blue[ii] + blendWeight * tiles.blue[bi];

    // chests only in empty places
    if (!blocked && map.isChest(x, y)) {
      const type = map.isChest(x, y);
      let cy = y % CHEST_H, cx = x % CHEST_W;
      if (cx < 0) cx += CHEST_W;
      if (cy < 0) cy += CHEST_H;
      const spriteOffset = (type === CHEST_OPEN ? 1 : 0) * CHEST_W * (CHEST_H + 1);
      const sub = cy * CHEST_W + cx;
      const index = spriteOffset + sub;
      const chest = this.g.chest;
      if (!World.transparent(chest, index)) {
        if (type === CHEST_CLOSED) out.transient = true;
        const gem = GEM_LOCATIONS.indexOf(sub);
        let gemUsed = false;
        if (gem >= 0 && map.getChestCode(x, y) & (0x01 << gem)) {
          gemUsed = true;
          [c.r, c.g, c.b] = GEM_COLORS[gem];
        }
        if (!gemUsed) {
          c.r = chest.red[index];
          c.g = chest.green[index];
          c.b = chest.blue[index];
        }
      }
    }
    return c;
  }

  /** stepAnimations(): advances the self-running animations (prize, dust, heart) */
  stepAnimations(): void {
    for (let i = 0; i < this.animations.length; i++) {
      const a = this.animations[i];
      if (!a.autoStep) continue;
      if (a.frameNumber < a.numFrames - 1) a.frameNumber++;
      else if (a.removeAtEnd) {
        this.animations.splice(i, 1);
        i--;
        // the player and spouse stay at their indices: they were added first and never removed
      }
    }
  }

  startPrizeAnimation(x: number, y: number): void { this.animations.push(new Animation(x, y, 16, 16, true, true, this.g.chestPrize)); }
  startDustAnimation(x: number, y: number): void { this.animations.push(new Animation(x, y, 16, 16, true, true, this.g.chestDust)); }
  startHeartAnimation(x: number, y: number): void { this.animations.push(new Animation(x, y, 16, 16, true, true, this.g.heart)); }

  setPlayerPosition(x: number, y: number): void {
    const sprite = this.animations[this.spriteIndex];
    let moving = x !== sprite.x;
    sprite.x = x;
    // the player's position is at the sprite's feet
    const newY = y - idiv(sprite.frameH, 2) + 1;
    if (newY !== sprite.y) moving = true;
    sprite.y = newY;
    if (this.metSpouse && !this.spouseDead) {
      const spouse = this.animations[this.spouseIndex];
      // the spouse walks just ahead of the player, closing in one pixel at a time in x and y
      let dX = x + spouse.frameH - spouse.x;
      let dY = sprite.y - spouse.y;
      if (dX !== 0) dX = Math.trunc(dX / Math.abs(dX));
      if (dY !== 0) dY = Math.trunc(dY / Math.abs(dY));
      if (moving) {
        spouse.x += dX;
        spouse.y += dY;
      }
      // the heart follows the couple, halfway between them
      for (const a of this.animations) {
        if (a.graphics !== this.g.heart) continue;
        a.x = idiv(spouse.x - sprite.x, 2) + sprite.x;
        a.y = idiv(spouse.y - sprite.y, 2) + sprite.y + 1;
      }
    }
  }

  setPlayerSpriteFrame(frame: number): void {
    this.animations[this.spriteIndex].frameNumber = frame;
    if (this.metSpouse && !this.spouseDead) this.animations[this.spouseIndex].frameNumber = frame;
  }

  /** age in 0..1: the sprites' pages blend from young to old between 0.25 and 0.75 */
  setCharacterAges(age: number): void {
    const sprite = this.animations[this.spriteIndex], spouse = this.animations[this.spouseIndex];
    if (age <= 0.25) {
      sprite.pageNumber = 0;
      spouse.pageNumber = 0;
    } else if (age >= 0.75) {
      sprite.pageNumber = sprite.numPages - 1;
      spouse.pageNumber = spouse.numPages - 1;
    } else {
      const blending = (age - 0.25) / 0.5;
      sprite.pageNumber = blending * (sprite.numPages - 1);
      spouse.pageNumber = blending * (spouse.numPages - 1);
    }
  }

  spousePosition(): { x: number; y: number } {
    const s = this.animations[this.spouseIndex];
    return { x: s.x, y: s.y + idiv(s.frameH, 2) - 1 };
  }

  haveMetSpouse(): boolean { return this.metSpouse && !this.spouseDead; }
  meetSpouse(): void { this.metSpouse = true; }
  isPlayerDead(): boolean { return this.playerDead; }
  isSpouseDead(): boolean { return this.spouseDead; }

  diePlayer(): void {
    this.playerDead = true;
    this.animations[this.spriteIndex].frameNumber = 8; // tombstone
  }

  dieSpouse(): void {
    this.spouseDead = true;
    this.animations[this.spouseIndex].frameNumber = 8; // tombstone
    if (this.metSpouse) this.animations[this.spriteIndex].swapGraphics(this.g.characterSpriteSad);
  }
}
