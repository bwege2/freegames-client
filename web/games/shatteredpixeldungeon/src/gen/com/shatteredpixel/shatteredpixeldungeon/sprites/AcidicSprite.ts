// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/AcidicSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { ScorpioSprite } from './ScorpioSprite.ts';

let Assets$Sprites, MovieClip$Animation, TextureFilm;

export class AcidicSprite extends ScorpioSprite {
  _AcidicSprite(): this {
    this._ScorpioSprite();
    this.texture(Assets$Sprites.SCORPIO);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 17, 17);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(12, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [15, 15, 15, 15, 15, 15, 15, 15, 16, 17, 16, 17, 16, 17]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(4, true);
    this.run_.frames$TextureFilm$ObjectArr(frames, [20, 21]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(15, false);
    this.attack.frames$TextureFilm$ObjectArr(frames, [15, 18, 19]);
    this.zap_ = this.attack.clone();
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(12, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [15, 22, 23, 24, 25]);
    this.play$Animation(this.idle_);
    return this;
  }
  blood(): number {
    return -10027230;
  }
}

$J.define(AcidicSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.AcidicSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.ScorpioSprite', ctors: { '': '_AcidicSprite' } });
$J.module(() => {
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
});
