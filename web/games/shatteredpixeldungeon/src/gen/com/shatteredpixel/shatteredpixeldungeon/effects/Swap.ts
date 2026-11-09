// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/Swap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../jre/index.ts';
import { Actor } from '../actors/Actor.ts';
import { Visual } from '../../../watabou/noosa/Visual.ts';

let Assets$Sounds, Dungeon, GameScene, Game, Sample;

export class Swap extends Actor {
  ch1: Char = null;
  ch2: Char = null;
  eff1: Swap$Effect = null;
  eff2: Swap$Effect = null;
  delay_: number = 0;
  _Swap(ch1: Char, ch2: Char): this {
    this._Actor();
    this.ch1 = ch1;
    this.ch2 = ch2;
    this.delay_ = Math.fround(Dungeon.level.distance(ch1.pos, ch2.pos) * Math.fround(0.1));
    this.eff1 = new Swap$Effect().$o(this)._Swap$Effect(ch1.sprite_, ch1.pos, ch2.pos);
    this.eff2 = new Swap$Effect().$o(this)._Swap$Effect(ch2.sprite_, ch2.pos, ch1.pos);
    Sample.INSTANCE.play$Object(Assets$Sounds.TELEPORT);
    return this;
  }
  act(): boolean {
    return false;
  }
  finish(eff: Swap$Effect): void {
    if (eff === this.eff1) {
      this.eff1 = null;
    }
    if (eff === this.eff2) {
      this.eff2 = null;
    }
    if (this.eff1 == null && this.eff2 == null) {
      Actor.remove(this);
      this.next();
      let pos = this.ch1.pos;
      this.ch1.pos = this.ch2.pos;
      this.ch2.pos = pos;
      Dungeon.level.occupyCell(this.ch1);
      Dungeon.level.occupyCell(this.ch2);
      if (this.ch1 === Dungeon.hero || this.ch2 === Dungeon.hero) {
        Dungeon.observe$();
        GameScene.updateFog$();
      }
    }
  }
}

export class Swap$Effect extends Visual {
  sprite_: CharSprite = null;
  end_: PointF = null;
  passed: number = 0;
  _Swap$Effect(sprite: CharSprite, from: number, to: number): this {
    this._Visual(0, 0, 0, 0);
    this.sprite_ = sprite;
    this.point$PointF(sprite.worldToCamera(from));
    this.end_ = sprite.worldToCamera(to);
    this.speed_.set$float$float(Math.fround(Math.fround(2 * (Math.fround(this.end_.x - this.x))) / this.$outer.delay_), Math.fround(Math.fround(2 * (Math.fround(this.end_.y - this.y))) / this.$outer.delay_));
    this.acc.set$float$float(Math.fround(Math.fround(-this.speed_.x) / this.$outer.delay_), Math.fround(Math.fround(-this.speed_.y) / this.$outer.delay_));
    this.passed = 0;
    sprite.parent.add$Gizmo(this);
    return this;
  }
  update(): void {
    super.update();
    if ((this.passed = Math.fround(this.passed + Game.elapsed)) < this.$outer.delay_) {
      this.sprite_.x = this.x;
      this.sprite_.y = this.y;
    } else {
      this.sprite_.point$PointF(this.end_);
      this.killAndErase();
      this.$outer.finish(this);
    }
  }
}

$J.define(Swap, 'com.shatteredpixel.shatteredpixeldungeon.effects.Swap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.Actor', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.actors.Char,com.shatteredpixel.shatteredpixeldungeon.actors.Char': '_Swap' } });
$J.define(Swap$Effect, 'com.shatteredpixel.shatteredpixeldungeon.effects.Swap$Effect', { kind: 'class', sup: 'com.watabou.noosa.Visual', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite,int,int': '_Swap$Effect' }, inner: true });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  Game = $J.load('com.watabou.noosa.Game');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
