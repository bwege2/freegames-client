// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/Pushing.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, GameScene, Camera, Game;

export class Pushing extends Actor {
  sprite_: CharSprite = null;
  from: number = 0;
  to: number = 0;
  effect_: Pushing$Effect = null;
  ch: Char = null;
  callback: Callback = null;
  $init_Pushing() {
    this.actPriority = (Actor.VFX_PRIO + 10) | 0;
  }
  _Pushing$Char$int$int(ch: Char, from: number, to: number): this {
    this._Actor();
    this.$init_Pushing();
    this.ch = ch;
    this.sprite_ = ch.sprite_;
    this.from = from;
    this.to = to;
    this.callback = null;
    if (ch === Dungeon.hero) {
      Camera.main.panFollow(ch.sprite_, 20);
    }
    return this;
  }
  _Pushing$Char$int$int$Callback(ch: Char, from: number, to: number, callback: Callback): this {
    this._Pushing$Char$int$int(ch, from, to);
    this.callback = callback;
    return this;
  }
  act(): boolean {
    Actor.remove(this);
    if (this.sprite_ != null && this.sprite_.parent != null) {
      if (Dungeon.level.heroFOV[this.from] || Dungeon.level.heroFOV[this.to]) {
        this.sprite_.visible_ = true;
      }
      if (this.effect_ == null) {
        new Pushing$Effect().$o(this)._Pushing$Effect();
      }
    } else {
      return true;
    }
    for (const $it0 = Actor.all().iterator(); $it0.hasNext(); ) {
      let actor = $it0.next();
      if (actor instanceof Pushing && actor.cooldown() === Math.fround(0)) {
        return true;
      }
    }
    return false;
  }
  static pushingExistsForChar(ch: Char): boolean {
    for (const $it1 = Actor.all().iterator(); $it1.hasNext(); ) {
      let a = $it1.next();
      if (a instanceof Pushing && (a).ch === ch) {
        return true;
      }
    }
    return false;
  }
}

export class Pushing$Effect extends Visual {
  static readonly DELAY: number = Math.fround(0.15);
  end_: PointF = null;
  delay_: number = 0;
  _Pushing$Effect(): this {
    this._Visual(0, 0, 0, 0);
    this.point$PointF(this.$outer.sprite_.worldToCamera(this.$outer.from));
    this.end_ = this.$outer.sprite_.worldToCamera(this.$outer.to);
    this.speed_.set$float$float(Math.fround(Math.fround(2 * (Math.fround(this.end_.x - this.x))) / Pushing$Effect.DELAY), Math.fround(Math.fround(2 * (Math.fround(this.end_.y - this.y))) / Pushing$Effect.DELAY));
    this.acc.set$float$float(Math.fround(Math.fround(-this.speed_.x) / Pushing$Effect.DELAY), Math.fround(Math.fround(-this.speed_.y) / Pushing$Effect.DELAY));
    this.delay_ = 0;
    if (this.$outer.sprite_.parent != null) {
      this.$outer.sprite_.parent.add$Gizmo(this);
    }
    return this;
  }
  update(): void {
    super.update();
    if ((this.delay_ = Math.fround(this.delay_ + Game.elapsed)) < Pushing$Effect.DELAY) {
      this.$outer.sprite_.x = this.x;
      this.$outer.sprite_.y = this.y;
    } else {
      this.$outer.sprite_.point$PointF(this.end_);
      this.killAndErase();
      Actor.remove(this.$outer);
      if (this.$outer.callback != null) {
        this.$outer.callback.call();
      }
      GameScene.sortMobSprites();
      this.$outer.next();
    }
  }
}

$J.define(Pushing, 'com.shatteredpixel.shatteredpixeldungeon.effects.Pushing', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.Actor', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.actors.Char,int,int,com.watabou.utils.Callback': '_Pushing$Char$int$int$Callback', 'com.shatteredpixel.shatteredpixeldungeon.actors.Char,int,int': '_Pushing$Char$int$int' } });
$J.define(Pushing$Effect, 'com.shatteredpixel.shatteredpixeldungeon.effects.Pushing$Effect', { kind: 'class', sup: 'com.watabou.noosa.Visual', ctors: { '': '_Pushing$Effect' }, inner: true });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  Camera = $J.load('com.watabou.noosa.Camera');
  Game = $J.load('com.watabou.noosa.Game');
});
