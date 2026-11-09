// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/noosa/particles/Emitter.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Group } from '../Group.ts';

let Blending, Game, Random;

export class Emitter extends Group {
  lightMode_: boolean = false;
  x: number = 0;
  y: number = 0;
  width_: number = 0;
  height_: number = 0;
  target: Visual = null;
  fillTarget: boolean = false;
  interval: number = 0;
  quantity: number = 0;
  on: boolean = false;
  started: boolean = false;
  autoKill: boolean = false;
  count_: number = 0;
  time: number = 0;
  factory: Emitter$Factory = null;
  static freezeEmitters: boolean = false;
  _Emitter(): this {
    this._Group();
    this.lightMode_ = false;
    this.fillTarget = true;
    this.on = false;
    this.started = false;
    this.autoKill = true;
    return this;
  }
  pos$float$float(x: number, y: number): void {
    this.pos$float$float$float$float(x, y, 0, 0);
  }
  pos$PointF(p: PointF): void {
    this.pos$float$float$float$float(p.x, p.y, 0, 0);
  }
  pos$float$float$float$float(x: number, y: number, width: number, height: number): void {
    this.x = x;
    this.y = y;
    this.width_ = width;
    this.height_ = height;
    this.target = null;
  }
  pos$Visual(target: Visual): void {
    this.target = target;
  }
  pos$Visual$float$float$float$float(target: Visual, x: number, y: number, width: number, height: number): void {
    this.pos$float$float$float$float(x, y, width, height);
    this.pos$Visual(target);
  }
  burst(factory: Emitter$Factory, quantity: number): void {
    this.start(factory, 0, quantity);
  }
  pour(factory: Emitter$Factory, interval: number): void {
    this.start(factory, interval, 0);
  }
  start(factory: Emitter$Factory, interval: number, quantity: number): void {
    this.startDelayed(factory, interval, quantity, Random.Float$float(interval));
  }
  startDelayed(factory: Emitter$Factory, interval: number, quantity: number, delay: number): void {
    this.factory = factory;
    this.lightMode_ = factory.lightMode();
    this.interval = interval;
    this.quantity = quantity;
    this.count_ = 0;
    this.time = Math.fround(interval - delay);
    this.on = true;
    this.started = true;
  }
  isFrozen(): boolean {
    return Game.timeTotal > Math.fround(1) && Emitter.freezeEmitters;
  }
  update(): void {
    if (this.isFrozen()) {
      return;
    }
    if (this.on) {
      this.time = Math.fround(this.time + Game.elapsed);
      while (this.time > this.interval) {
        this.time = Math.fround(this.time - this.interval);
        this.emit(this.count_++);
        if (this.quantity > 0 && this.count_ >= this.quantity) {
          this.on = false;
          break;
        }
      }
    } else if (this.started && this.autoKill && this.countLiving() === 0) {
      this.kill();
    }
    super.update();
  }
  revive(): void {
    this.started = false;
    this.visible_ = true;
    this.fillTarget = true;
    this.autoKill = true;
    super.revive();
  }
  emit(index: number): void {
    if (this.target == null) {
      this.factory.emit(this, index, Math.fround(this.x + Random.Float$float(this.width_)), Math.fround(this.y + Random.Float$float(this.height_)));
    } else {
      if (this.fillTarget) {
        this.factory.emit(this, index, Math.fround(this.target.x + Random.Float$float(this.target.width())), Math.fround(this.target.y + Random.Float$float(this.target.height())));
      } else {
        this.factory.emit(this, index, Math.fround(Math.fround(this.target.x + this.x) + Random.Float$float(this.width_)), Math.fround(Math.fround(this.target.y + this.y) + Random.Float$float(this.height_)));
      }
    }
  }
  draw(): void {
    if (this.lightMode_) {
      Blending.setLightMode();
      super.draw();
      Blending.setNormalMode();
    } else {
      super.draw();
    }
  }
  static $clinit() {
    Emitter.freezeEmitters = false;
  }
}

export class Emitter$Factory extends JObject {
  _Emitter$Factory(): this {
    return this;
  }
  lightMode(): boolean {
    return false;
  }
}

$J.define(Emitter, 'com.watabou.noosa.particles.Emitter', { kind: 'class', sup: 'com.watabou.noosa.Group', ctors: { '': '_Emitter' }, meths: { 'pos(com.watabou.noosa.Visual,float,float,float,float)': 'pos$Visual$float$float$float$float', 'pos(com.watabou.noosa.Visual)': 'pos$Visual', 'pos(float,float,float,float)': 'pos$float$float$float$float', 'pos(com.watabou.utils.PointF)': 'pos$PointF', 'pos(float,float)': 'pos$float$float' }, clinit: true, lazy: ['freezeEmitters'] });
$J.define(Emitter$Factory, 'com.watabou.noosa.particles.Emitter$Factory', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Emitter$Factory' } });
$J.module(() => {
  Blending = $J.load('com.watabou.glwrap.Blending');
  Game = $J.load('com.watabou.noosa.Game');
  Random = $J.load('com.watabou.utils.Random');
});
