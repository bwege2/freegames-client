// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/MobSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { CharSprite } from './CharSprite.ts';

let DungeonTilemap, Game, AlphaTweener, ScaleTweener, PointF, Random;

export class MobSprite extends CharSprite {
  static readonly FADE_TIME: number = 3;
  static readonly FALL_TIME: number = 1;
  _MobSprite(): this {
    this._CharSprite();
    return this;
  }
  update(): void {
    this.sleeping = this.ch != null && this.ch.isAlive() && (this.ch).state_ === (this.ch).SLEEPING;
    super.update();
  }
  onComplete$Animation(anim: MovieClip$Animation): void {
    super.onComplete$Animation(anim);
    if (anim === this.die_ && this.parent != null) {
      this.parent.add$Gizmo(new (MobSprite$1())().$o(this)._AlphaTweener(this, 0, MobSprite.FADE_TIME));
    }
  }
  fall(): void {
    this.origin.set$float$float(Math.fround(this.width_ / 2), Math.fround(this.height_ - $J.idiv(DungeonTilemap.SIZE, 2)));
    this.angularSpeed = Math.fround(Random.Int$int(2) === 0 ? -720 : 720);
    this.am = 1;
    this.hideEmo();
    if (this.health_ != null) {
      this.health_.killAndErase();
    }
    if (this.parent != null) {
      this.parent.add$Gizmo(new (MobSprite$2())().$o(this)._ScaleTweener(this, new PointF()._PointF$float$float(0, 0), MobSprite.FALL_TIME));
    }
  }
}

let $MobSprite$1: any = null;
/** An anonymous class (MobSprite.java:49). */
function MobSprite$1(): any {
  return $MobSprite$1 ??= $J.local(class extends AlphaTweener {
    onComplete(): void {
      this.$outer.killAndErase();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite$1', []);
}

let $MobSprite$2: any = null;
/** An anonymous class (MobSprite.java:70). */
function MobSprite$2(): any {
  return $MobSprite$2 ??= $J.local(class extends ScaleTweener {
    onComplete(): void {
      this.$outer.killAndErase();
      this.parent.erase(this);
    }
    updateValues(progress: number): void {
      super.updateValues(progress);
      this.$outer.y = Math.fround(this.$outer.y + Math.fround(12 * Game.elapsed));
      this.$outer.am = Math.fround(1 - progress);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite$2', []);
}

$J.define(MobSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite', ctors: { '': '_MobSprite' }, meths: { 'onComplete(com.watabou.noosa.MovieClip$Animation)': 'onComplete$Animation' } });
$J.module(() => {
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  Game = $J.load('com.watabou.noosa.Game');
  AlphaTweener = $J.load('com.watabou.noosa.tweeners.AlphaTweener');
  ScaleTweener = $J.load('com.watabou.noosa.tweeners.ScaleTweener');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
});
