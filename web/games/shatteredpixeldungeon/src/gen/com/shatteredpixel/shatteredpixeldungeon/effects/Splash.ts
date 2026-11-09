// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/Splash.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, HashMap, JObject } from '../../../../../jre/index.ts';
import { Emitter$Factory } from '../../../watabou/noosa/particles/Emitter.ts';

let GameScene, DungeonTilemap, PixelParticle$Shrinking, Random;

export class Splash extends JObject {
  static FACTORIES: HashMap<number, Splash$SplashFactory> = null;
  _Splash(): this {
    return this;
  }
  static at$int$int$int(cell: number, color: number, n: number): void {
    Splash.at$PointF$int$int(DungeonTilemap.tileCenterToWorld(cell), color, n);
  }
  static at$PointF$int$int(p: PointF, color: number, n: number): void {
    if (n <= 0) {
      return;
    }
    let emitter = GameScene.emitter();
    if (emitter == null) {
      return;
    }
    emitter.pos$PointF(p);
    if (!Splash.FACTORIES.containsKey(color)) {
      Splash.FACTORIES.put(color, new Splash$SplashFactory()._Splash$SplashFactory());
    }
    let fact = Splash.FACTORIES.get(color);
    fact.color_ = color;
    fact.dir = Math.fround(Math.fround(-Math.fround(3.1415925)) / 2);
    fact.cone = Math.fround(3.1415925);
    emitter.burst(fact, n);
  }
  static at$PointF$float$float$int$int(p: PointF, dir: number, cone: number, color: number, n: number): void {
    if (n <= 0) {
      return;
    }
    let emitter = GameScene.emitter();
    if (emitter == null) {
      return;
    }
    emitter.pos$PointF(p);
    if (!Splash.FACTORIES.containsKey(color)) {
      Splash.FACTORIES.put(color, new Splash$SplashFactory()._Splash$SplashFactory());
    }
    let fact = Splash.FACTORIES.get(color);
    fact.color_ = color;
    fact.dir = dir;
    fact.cone = cone;
    emitter.burst(fact, n);
  }
  static around(v: Visual, color: number, n: number): void {
    if (n <= 0) {
      return;
    }
    let emitter = GameScene.emitter();
    if (emitter == null) {
      return;
    }
    emitter.pos$Visual(v);
    if (!Splash.FACTORIES.containsKey(color)) {
      Splash.FACTORIES.put(color, new Splash$SplashFactory()._Splash$SplashFactory());
    }
    let fact = Splash.FACTORIES.get(color);
    fact.color_ = color;
    fact.dir = Math.fround(Math.fround(-Math.fround(3.1415925)) / 2);
    fact.cone = Math.fround(3.1415925);
    emitter.burst(fact, n);
  }
  static at$PointF$float$float$int$int$float(p: PointF, dir: number, cone: number, color: number, n: number, interval: number): void {
    if (n <= 0) {
      return;
    }
    let emitter = GameScene.emitter();
    if (emitter == null) {
      return;
    }
    emitter.pos$PointF(p);
    if (!Splash.FACTORIES.containsKey(color)) {
      Splash.FACTORIES.put(color, new Splash$SplashFactory()._Splash$SplashFactory());
    }
    let fact = Splash.FACTORIES.get(color);
    fact.color_ = color;
    fact.dir = dir;
    fact.cone = cone;
    emitter.start(fact, interval, n);
  }
  static $clinit() {
    Splash.FACTORIES = new HashMap();
  }
}

export class Splash$SplashFactory extends Emitter$Factory {
  color_: number = 0;
  dir: number = 0;
  cone: number = 0;
  _Splash$SplashFactory(): this {
    this._Emitter$Factory();
    return this;
  }
  emit(emitter: Emitter, index: number, x: number, y: number): void {
    let p = emitter.recycle($J.cls(PixelParticle$Shrinking));
    p.reset$float$float$int$float$float(x, y, this.color_, 4, Random.Float$float$float(0.5, 1));
    p.speed_.polar(Random.Float$float$float(Math.fround(this.dir - Math.fround(this.cone / 2)), Math.fround(this.dir + Math.fround(this.cone / 2))), Random.Float$float$float(40, 80));
    p.acc.set$float$float(0, Math.fround(+100));
  }
}

$J.define(Splash, 'com.shatteredpixel.shatteredpixeldungeon.effects.Splash', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Splash' }, meths: { 'at(com.watabou.utils.PointF,float,float,int,int,float)': 'at$PointF$float$float$int$int$float', 'at(com.watabou.utils.PointF,float,float,int,int)': 'at$PointF$float$float$int$int', 'at(com.watabou.utils.PointF,int,int)': 'at$PointF$int$int', 'at(int,int,int)': 'at$int$int$int' }, clinit: true, lazy: ['FACTORIES'] });
$J.define(Splash$SplashFactory, 'com.shatteredpixel.shatteredpixeldungeon.effects.Splash$SplashFactory', { kind: 'class', sup: 'com.watabou.noosa.particles.Emitter$Factory', ctors: { '': '_Splash$SplashFactory' } });
$J.module(() => {
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  PixelParticle$Shrinking = $J.load('com.watabou.noosa.particles.PixelParticle$Shrinking');
  Random = $J.load('com.watabou.utils.Random');
});
