// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/ItemSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
/*
 * Pixel Dungeon
 * Copyright (C) 2012-2015 Oleg Dolya
 *
 * Shattered Pixel Dungeon
 * Copyright (C) 2014-2026 Evan Debenham
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>
 */
import { $J, JObject } from '../../../../../jre/index.ts';
import { MovieClip } from '../../../watabou/noosa/MovieClip.ts';

let Assets$Sounds, Assets$Sprites, Dungeon, CellEmitter, Speck, Gold, Heap$Type, Terrain, GameScene, PixelScene, ItemSpriteSheet, DungeonTilemap, TextureCache, Matrix, Vertexbuffer, Camera, Game, Sample, PointF, Random;

export class ItemSprite extends MovieClip {
  static readonly SIZE: number = 16;
  static readonly DROP_INTERVAL: number = Math.fround(0.4);
  heap: Heap = null;
  glowing_: ItemSprite$Glowing = null;
  emitter_: Emitter = null;
  phase: number = 0;
  glowUp: boolean = false;
  dropInterval: number = 0;
  perspectiveRaise: number = 0;
  renderShadow: boolean = false;
  shadowWidth: number = 0;
  shadowHeight: number = 0;
  shadowOffset: number = 0;
  shadowMatrix: number[] = null;
  $init_ItemSprite() {
    this.perspectiveRaise = Math.fround(5 / 16);
    this.renderShadow = false;
    this.shadowWidth = 1;
    this.shadowHeight = 0.25;
    this.shadowOffset = 0.5;
    this.shadowMatrix = $J.newArray(16, 0);
  }
  _ItemSprite$(): this {
    this._ItemSprite$int$Glowing(ItemSpriteSheet.SOMETHING, null);
    return this;
  }
  _ItemSprite$Heap(heap: Heap): this {
    this._MovieClip$Object(Assets$Sprites.ITEMS);
    this.$init_ItemSprite();
    this.view$Heap(heap);
    return this;
  }
  _ItemSprite$Item(item: Item): this {
    this._MovieClip$Object(Assets$Sprites.ITEMS);
    this.$init_ItemSprite();
    this.view$Item(item);
    return this;
  }
  _ItemSprite$int(image: number): this {
    this._ItemSprite$int$Glowing(image, null);
    return this;
  }
  _ItemSprite$int$Glowing(image: number, glowing: ItemSprite$Glowing): this {
    this._MovieClip$Object(Assets$Sprites.ITEMS);
    this.$init_ItemSprite();
    this.view$int$Glowing(image, glowing);
    return this;
  }
  link$(): void {
    this.link$Heap(this.heap);
  }
  link$Heap(heap: Heap): void {
    this.heap = heap;
    this.view$Heap(heap);
    this.renderShadow = true;
    this.visible_ = heap.seen;
    this.place(heap.pos);
  }
  revive(): void {
    super.revive();
    this.speed_.set$float(0);
    this.acc.set$float(0);
    this.dropInterval = 0;
    this.heap = null;
    if (this.emitter_ != null) {
      this.emitter_.killAndErase();
      this.emitter_ = null;
    }
  }
  copy(other: Image): void {
    super.copy(other);
    if (other instanceof ItemSprite && (other).glowing_ != null) {
      this.glow((other).glowing_);
    }
  }
  visible(value: boolean): void {
    this.visible_ = value;
    if (this.emitter_ != null && !this.visible_) {
      this.emitter_.killAndErase();
      this.emitter_ = null;
    }
  }
  worldToCamera(cell: number): PointF {
    let csize = DungeonTilemap.SIZE;
    return new PointF()._PointF$float$float(PixelScene.align$Camera$float(Camera.main, Math.fround(Math.fround((Math.fround((cell % Dungeon.level.width()) + 0.5)) * csize) - Math.fround(this.width() * 0.5))), PixelScene.align$Camera$float(Camera.main, Math.fround(Math.fround(Math.fround((Math.fround(($J.idiv(cell, Dungeon.level.width())) + 1)) * csize) - this.height()) - Math.fround(csize * this.perspectiveRaise))));
  }
  place(p: number): void {
    if (Dungeon.level != null) {
      this.point$PointF(this.worldToCamera(p));
      this.shadowOffset = 0.5;
    }
  }
  drop$(): void {
    if (this.heap.isEmpty()) {
      return;
    } else if (this.heap.size() === 1) {
      this.place(this.heap.pos);
    }
    this.dropInterval = ItemSprite.DROP_INTERVAL;
    this.speed_.set$float$float(0, -100);
    this.acc.set$float$float(0, Math.fround(Math.fround(Math.fround(-this.speed_.y) / ItemSprite.DROP_INTERVAL) * 2));
    if (this.heap != null && this.heap.seen && this.heap.peek() instanceof Gold) {
      CellEmitter.center(this.heap.pos).burst(Speck.factory$int(Speck.COIN), 5);
      Sample.INSTANCE.play$Object$float$float$float(Assets$Sounds.GOLD, 1, 1, Random.Float$float$float(Math.fround(0.9), Math.fround(1.1)));
    }
  }
  drop$int(from: number): void {
    if (this.heap.pos === from) {
      this.drop$();
    } else {
      let px = this.x;
      let py = this.y;
      this.drop$();
      this.place(from);
      this.speed_.offset$float$float(Math.fround((Math.fround(px - this.x)) / ItemSprite.DROP_INTERVAL), Math.fround((Math.fround(py - this.y)) / ItemSprite.DROP_INTERVAL));
    }
  }
  view$Item(item: Item): ItemSprite {
    this.view$int$Glowing(item.image(), item.glowing());
    let emitter = item.emitter();
    if (emitter != null && this.parent != null) {
      emitter.pos$Visual(this);
      this.parent.add$Gizmo(emitter);
      this.emitter_ = emitter;
    }
    return this;
  }
  view$Heap(heap: Heap): ItemSprite {
    if (heap.size() <= 0 || heap.items_ == null) {
      return this.view$int$Glowing(0, null);
    }
    switch (heap.type_) {
      case Heap$Type.HEAP:
      case Heap$Type.FOR_SALE:
        this.view$Item(heap.peek());
        break;
      case Heap$Type.CHEST:
        this.view$int$Glowing(ItemSpriteSheet.CHEST, null);
        break;
      case Heap$Type.LOCKED_CHEST:
        this.view$int$Glowing(ItemSpriteSheet.LOCKED_CHEST, null);
        break;
      case Heap$Type.CRYSTAL_CHEST:
        this.view$int$Glowing(ItemSpriteSheet.CRYSTAL_CHEST, null);
        break;
      case Heap$Type.TOMB:
        this.view$int$Glowing(ItemSpriteSheet.TOMB, null);
        break;
      case Heap$Type.SKELETON:
        this.view$int$Glowing(ItemSpriteSheet.BONES, null);
        break;
      case Heap$Type.REMAINS:
        this.view$int$Glowing(ItemSpriteSheet.REMAINS, null);
        break;
      default:
        this.view$int$Glowing(0, null);
    }
    this.alpha$float(heap.hidden ? Math.fround(0.1) : 1);
    return this;
  }
  view$int$Glowing(image: number, glowing: ItemSprite$Glowing): ItemSprite {
    if (this.emitter_ != null) {
      this.emitter_.killAndErase();
    }
    this.emitter_ = null;
    this.frame$int(image);
    this.glow(glowing);
    return this;
  }
  frame$int(image: number): void {
    this.frame$RectF(ItemSpriteSheet.film.get$Object(image));
    let height = ItemSpriteSheet.film.height$Object(image);
    if (height < 8) {
      this.perspectiveRaise = Math.fround((Math.fround(((5 + 8) | 0) - height)) / 16);
    }
  }
  glow(glowing: ItemSprite$Glowing): void {
    this.glowing_ = glowing;
    if (glowing == null) {
      this.resetColor();
    }
  }
  kill(): void {
    super.kill();
    if (this.emitter_ != null) {
      this.emitter_.on = false;
      this.emitter_.autoKill = true;
    }
    this.emitter_ = null;
  }
  updateMatrix(): void {
    super.updateMatrix();
    Matrix.copy(this.matrix, this.shadowMatrix);
    Matrix.translate(this.shadowMatrix, Math.fround((Math.fround(this.width() * (Math.fround(1 - this.shadowWidth)))) / 2), Math.fround((Math.fround(this.height() * (Math.fround(1 - this.shadowHeight)))) + this.shadowOffset));
    Matrix.scale(this.shadowMatrix, this.shadowWidth, this.shadowHeight);
  }
  draw(): void {
    if (this.texture_ == null || (!this.dirty && this.buffer == null)) {
      return;
    }
    if (this.renderShadow) {
      if (this.dirty) {
        (this.verticesBuffer).position(0);
        this.verticesBuffer.put(this.vertices);
        if (this.buffer == null) {
          this.buffer = new Vertexbuffer()._Vertexbuffer(this.verticesBuffer);
        } else {
          this.buffer.updateVertices$FloatBuffer(this.verticesBuffer);
        }
        this.dirty = false;
      }
      let script = this.script();
      this.texture_.bind();
      script.camera(this.camera());
      this.updateMatrix();
      script.uModel.valueM4(this.shadowMatrix);
      script.lighting(0, 0, 0, Math.fround(this.am * Math.fround(0.6)), 0, 0, 0, Math.fround(this.aa * Math.fround(0.6)));
      script.drawQuad$Vertexbuffer(this.buffer);
    }
    super.draw();
  }
  update(): void {
    super.update();
    this.visible_ = (this.heap == null || this.heap.seen);
    if (this.emitter_ != null) {
      this.emitter_.visible_ = this.visible_;
    }
    if (this.dropInterval > Math.fround(0)) {
      this.shadowOffset = Math.fround(this.shadowOffset - Math.fround(Math.fround(this.speed_.y * Game.elapsed) * Math.fround(0.8)));
      if ((this.dropInterval = Math.fround(this.dropInterval - Game.elapsed)) <= Math.fround(0)) {
        this.speed_.set$float(0);
        this.acc.set$float(0);
        this.shadowOffset = 0.25;
        this.place(this.heap.pos);
        if (this.visible_) {
          if (Dungeon.level.water[this.heap.pos]) {
            GameScene.ripple(this.heap.pos);
          }
          if (Dungeon.level.water[this.heap.pos]) {
            Sample.INSTANCE.play$Object$float$float(Assets$Sounds.WATER, Math.fround(0.8), Random.Float$float$float(1, Math.fround(1.45)));
          } else if (Dungeon.level.map_[this.heap.pos] === Terrain.EMPTY_SP) {
            Sample.INSTANCE.play$Object$float$float(Assets$Sounds.STURDY, Math.fround(0.8), Random.Float$float$float(Math.fround(1.16), 1.25));
          } else if (Dungeon.level.map_[this.heap.pos] === Terrain.GRASS || Dungeon.level.map_[this.heap.pos] === Terrain.EMBERS || Dungeon.level.map_[this.heap.pos] === Terrain.FURROWED_GRASS) {
            Sample.INSTANCE.play$Object$float$float(Assets$Sounds.GRASS, Math.fround(0.8), Random.Float$float$float(Math.fround(1.16), 1.25));
          } else if (Dungeon.level.map_[this.heap.pos] === Terrain.HIGH_GRASS) {
            Sample.INSTANCE.play$Object$float$float(Assets$Sounds.STEP, Math.fround(0.8), Random.Float$float$float(Math.fround(1.16), 1.25));
          } else {
            Sample.INSTANCE.play$Object$float$float(Assets$Sounds.STEP, Math.fround(0.8), Random.Float$float$float(Math.fround(1.16), 1.25));
          }
        }
      }
    }
    if (this.visible_ && this.glowing_ != null) {
      if (this.glowUp && (this.phase = Math.fround(this.phase + Game.elapsed)) > this.glowing_.period) {
        this.glowUp = false;
        this.phase = this.glowing_.period;
      } else if (!this.glowUp && (this.phase = Math.fround(this.phase - Game.elapsed)) < Math.fround(0)) {
        this.glowUp = true;
        this.phase = 0;
      }
      let value = Math.fround(Math.fround(this.phase / this.glowing_.period) * Math.fround(0.6));
      this.rm = this.gm = this.bm = Math.fround(1 - value);
      this.ra = Math.fround(this.glowing_.red * value);
      this.ga = Math.fround(this.glowing_.green * value);
      this.ba = Math.fround(this.glowing_.blue * value);
    }
  }
  static pick(index: number, x: number, y: number): number {
    let tx = TextureCache.get(Assets$Sprites.ITEMS);
    let rows = $J.idiv(tx.width_, ItemSprite.SIZE);
    let row = $J.idiv(index, rows);
    let col = index % rows;
    return tx.getPixel((Math.imul(col, ItemSprite.SIZE) + x) | 0, (Math.imul(row, ItemSprite.SIZE) + y) | 0);
  }
}

export class ItemSprite$Glowing extends JObject {
  color_: number = 0;
  red: number = 0;
  green: number = 0;
  blue: number = 0;
  period: number = 0;
  _ItemSprite$Glowing$int(color: number): this {
    this._ItemSprite$Glowing$int$float(color, 1);
    return this;
  }
  _ItemSprite$Glowing$int$float(color: number, period: number): this {
    this.color_ = color;
    this.red = Math.fround((color >> 16) / 255);
    this.green = Math.fround(((color >> 8) & 255) / 255);
    this.blue = Math.fround((color & 255) / 255);
    this.period = period;
    return this;
  }
}

$J.define(ItemSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite', { kind: 'class', sup: 'com.watabou.noosa.MovieClip', ctors: { 'int,com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing': '_ItemSprite$int$Glowing', 'int': '_ItemSprite$int', 'com.shatteredpixel.shatteredpixeldungeon.items.Item': '_ItemSprite$Item', 'com.shatteredpixel.shatteredpixeldungeon.items.Heap': '_ItemSprite$Heap', '': '_ItemSprite$' }, meths: { 'frame(int)': 'frame$int', 'view(int,com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing)': 'view$int$Glowing', 'view(com.shatteredpixel.shatteredpixeldungeon.items.Heap)': 'view$Heap', 'view(com.shatteredpixel.shatteredpixeldungeon.items.Item)': 'view$Item', 'drop(int)': 'drop$int', 'drop()': 'drop$', 'link(com.shatteredpixel.shatteredpixeldungeon.items.Heap)': 'link$Heap', 'link()': 'link$' } });
$J.define(ItemSprite$Glowing, 'com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing', { kind: 'class', sup: 'java.lang.Object', ctors: { 'int,float': '_ItemSprite$Glowing$int$float', 'int': '_ItemSprite$Glowing$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Gold = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Gold');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  TextureCache = $J.load('com.watabou.gltextures.TextureCache');
  Matrix = $J.load('com.watabou.glwrap.Matrix');
  Vertexbuffer = $J.load('com.watabou.glwrap.Vertexbuffer');
  Camera = $J.load('com.watabou.noosa.Camera');
  Game = $J.load('com.watabou.noosa.Game');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
});
