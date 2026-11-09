// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/Fireball.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { MovieClip } from '../../../watabou/noosa/MovieClip.ts';

let PixelScene, MovieClip$Animation, TextureFilm;

export class Fireball extends MovieClip {
  static second: boolean = false;
  _Fireball$(): this {
    this._Fireball$boolean(Fireball.second);
    Fireball.second = !Fireball.second;
    return this;
  }
  _Fireball$boolean(second: boolean): this {
    this._MovieClip$();
    if (PixelScene.landscape()) {
      this.texture('effects/fireball-tall.png');
      let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 61, 61);
      let anim = new MovieClip$Animation()._MovieClip$Animation(24, true);
      anim.frames$TextureFilm$ObjectArr(frames, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]);
      this.play$Animation(anim);
    } else {
      this.texture('effects/fireball-short.png');
      let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 47, 47);
      let anim = new MovieClip$Animation()._MovieClip$Animation(24, true);
      anim.frames$TextureFilm$ObjectArr(frames, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]);
      this.play$Animation(anim);
    }
    if (second) {
      this.flipHorizontal_ = true;
      this.curFrame = 12;
      this.frame$RectF(this.curAnim.frames[this.curFrame]);
    }
    return this;
  }
  static $clinit() {
    Fireball.second = false;
  }
}

$J.define(Fireball, 'com.shatteredpixel.shatteredpixeldungeon.effects.Fireball', { kind: 'class', sup: 'com.watabou.noosa.MovieClip', ctors: { 'boolean': '_Fireball$boolean', '': '_Fireball$' }, clinit: true, lazy: ['second'] });
$J.module(() => {
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
});
