// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/SeniorSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { MobSprite } from './MobSprite.ts';

let Assets$Sprites, MovieClip$Animation, TextureFilm, Random;

export class SeniorSprite extends MobSprite {
  kick: MovieClip$Animation = null;
  _SeniorSprite(): this {
    this._MobSprite();
    this.texture(Assets$Sprites.MONK);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 15, 14);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(6, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [18, 17, 18, 19]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(15, true);
    this.run_.frames$TextureFilm$ObjectArr(frames, [28, 29, 30, 31, 32, 33]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(12, false);
    this.attack.frames$TextureFilm$ObjectArr(frames, [20, 21, 20, 21]);
    this.kick = new MovieClip$Animation()._MovieClip$Animation(10, false);
    this.kick.frames$TextureFilm$ObjectArr(frames, [22, 23, 22]);
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(15, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [18, 24, 25, 25, 26, 27]);
    this.play$Animation(this.idle_);
    return this;
  }
  attack$int(cell: number): void {
    super.attack$int(cell);
    if (Random.Float$() < Math.fround(0.3)) {
      this.play$Animation(this.kick);
    }
  }
  onComplete$Animation(anim: MovieClip$Animation): void {
    super.onComplete$Animation(anim === this.kick ? this.attack : anim);
  }
}

$J.define(SeniorSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.SeniorSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_SeniorSprite' }, meths: { 'onComplete(com.watabou.noosa.MovieClip$Animation)': 'onComplete$Animation', 'attack(int)': 'attack$int' } });
$J.module(() => {
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
  Random = $J.load('com.watabou.utils.Random');
});
