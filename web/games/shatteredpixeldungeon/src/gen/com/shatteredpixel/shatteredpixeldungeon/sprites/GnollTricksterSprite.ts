// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/GnollTricksterSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sprites, Dungeon, ParalyticDart, MissileSprite, MovieClip$Animation, TextureFilm;

export class GnollTricksterSprite extends MobSprite {
  cast_: MovieClip$Animation = null;
  _GnollTricksterSprite(): this {
    this._MobSprite();
    this.texture(Assets$Sprites.GNOLL);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 12, 15);
    let c = 42;
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(2, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [(0 + c) | 0, (0 + c) | 0, (0 + c) | 0, (1 + c) | 0, (0 + c) | 0, (0 + c) | 0, (1 + c) | 0, (1 + c) | 0]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(12, true);
    this.run_.frames$TextureFilm$ObjectArr(frames, [(4 + c) | 0, (5 + c) | 0, (6 + c) | 0, (7 + c) | 0]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(12, false);
    this.attack.frames$TextureFilm$ObjectArr(frames, [(2 + c) | 0, (3 + c) | 0, (0 + c) | 0]);
    this.cast_ = this.attack.clone();
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(12, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [(8 + c) | 0, (9 + c) | 0, (10 + c) | 0]);
    this.play$Animation(this.idle_);
    return this;
  }
  attack$int(cell: number): void {
    if (!Dungeon.level.adjacent(cell, this.ch.pos)) {
      (this.parent.recycle($J.cls(MissileSprite))).reset$Visual$int$Item$Callback(this, cell, new ParalyticDart()._ParalyticDart(), new (GnollTricksterSprite$1())().$o(this));
      this.play$Animation(this.cast_);
      this.turnTo(this.ch.pos, cell);
    } else {
      super.attack$int(cell);
    }
  }
}

let $GnollTricksterSprite$1: any = null;
/** An anonymous class (GnollTricksterSprite.java:66). */
function GnollTricksterSprite$1(): any {
  return $GnollTricksterSprite$1 ??= $J.local(class extends JObject {
    call(): void {
      this.$outer.ch.onAttackComplete();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.sprites.GnollTricksterSprite$1', ['com.watabou.utils.Callback']);
}

$J.define(GnollTricksterSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.GnollTricksterSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_GnollTricksterSprite' }, meths: { 'attack(int)': 'attack$int' } });
$J.module(() => {
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  ParalyticDart = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.ParalyticDart');
  MissileSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.MissileSprite');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
});
