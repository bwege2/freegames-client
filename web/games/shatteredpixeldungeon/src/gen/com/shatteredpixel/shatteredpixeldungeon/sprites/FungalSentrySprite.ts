// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/FungalSentrySprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { MobSprite } from './MobSprite.ts';

let Assets$Sprites, Dungeon, MagicMissile, MovieClip$Animation, TextureFilm;

export class FungalSentrySprite extends MobSprite {
  cellToAttack: number = 0;
  _FungalSentrySprite(): this {
    this._MobSprite();
    this.texture(Assets$Sprites.FUNGAL_SENTRY);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 18, 18);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(0, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [0]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(0, true);
    this.run_.frames$TextureFilm$ObjectArr(frames, [0]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(24, false);
    this.attack.frames$TextureFilm$ObjectArr(frames, [0]);
    this.zap_ = this.attack.clone();
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(12, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [0]);
    this.play$Animation(this.idle_);
    return this;
  }
  attack$int(cell: number): void {
    if (!Dungeon.level.adjacent(cell, this.ch.pos)) {
      this.cellToAttack = cell;
      this.zap$int(cell);
    } else {
      super.attack$int(cell);
    }
  }
  onComplete$Animation(anim: MovieClip$Animation): void {
    if (anim === this.zap_) {
      this.idle();
      MagicMissile.boltFromChar(this.parent, MagicMissile.POISON, this, this.cellToAttack, new (FungalSentrySprite$1())().$o(this));
    } else {
      super.onComplete$Animation(anim);
    }
  }
  turnTo(from: number, to: number): void {
  }
  blood(): number {
    return -7812028;
  }
}

let $FungalSentrySprite$1: any = null;
/** An anonymous class (FungalSentrySprite.java:78). */
function FungalSentrySprite$1(): any {
  return $FungalSentrySprite$1 ??= $J.local(class extends JObject {
    call(): void {
      this.$outer.ch.onAttackComplete();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.sprites.FungalSentrySprite$1', ['com.watabou.utils.Callback']);
}

$J.define(FungalSentrySprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.FungalSentrySprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_FungalSentrySprite' }, meths: { 'onComplete(com.watabou.noosa.MovieClip$Animation)': 'onComplete$Animation', 'attack(int)': 'attack$int' } });
$J.module(() => {
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  MagicMissile = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
});
