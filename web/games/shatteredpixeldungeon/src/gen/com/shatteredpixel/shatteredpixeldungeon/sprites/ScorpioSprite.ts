// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/ScorpioSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Item } from '../items/Item.ts';

let Assets$Sprites, Dungeon, ItemSpriteSheet, MissileSprite, MovieClip$Animation, TextureFilm;

export class ScorpioSprite extends MobSprite {
  cellToAttack: number = 0;
  _ScorpioSprite(): this {
    this._MobSprite();
    this.texture(Assets$Sprites.SCORPIO);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 17, 17);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(12, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 1, 2, 1, 2]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(8, true);
    this.run_.frames$TextureFilm$ObjectArr(frames, [5, 5, 6, 6]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(15, false);
    this.attack.frames$TextureFilm$ObjectArr(frames, [0, 3, 4]);
    this.zap_ = this.attack.clone();
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(12, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [0, 7, 8, 9, 10]);
    this.play$Animation(this.idle_);
    return this;
  }
  blood(): number {
    return -12255454;
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
      (this.parent.recycle($J.cls(MissileSprite))).reset$Visual$int$Item$Callback(this, this.cellToAttack, new ScorpioSprite$ScorpioShot().$o(this)._ScorpioSprite$ScorpioShot(), new (ScorpioSprite$1())().$o(this));
    } else {
      super.onComplete$Animation(anim);
    }
  }
}

export class ScorpioSprite$ScorpioShot extends Item {
  _ScorpioSprite$ScorpioShot(): this {
    this._Item();
    this.image_ = ItemSpriteSheet.FISHING_SPEAR;
    return this;
  }
}

let $ScorpioSprite$1: any = null;
/** An anonymous class (ScorpioSprite.java:83). */
function ScorpioSprite$1(): any {
  return $ScorpioSprite$1 ??= $J.local(class extends JObject {
    call(): void {
      this.$outer.ch.onAttackComplete();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.sprites.ScorpioSprite$1', ['com.watabou.utils.Callback']);
}

$J.define(ScorpioSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.ScorpioSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_ScorpioSprite' }, meths: { 'onComplete(com.watabou.noosa.MovieClip$Animation)': 'onComplete$Animation', 'attack(int)': 'attack$int' } });
$J.define(ScorpioSprite$ScorpioShot, 'com.shatteredpixel.shatteredpixeldungeon.sprites.ScorpioSprite$ScorpioShot', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_ScorpioSprite$ScorpioShot' }, inner: true });
$J.module(() => {
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  MissileSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.MissileSprite');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
});
