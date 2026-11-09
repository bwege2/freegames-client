// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/AlbinoSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sprites, MovieClip$Animation, TextureFilm;

export class AlbinoSprite extends MobSprite {
  _AlbinoSprite(): this {
    this._MobSprite();
    this.texture(Assets$Sprites.RAT);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 16, 15);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(2, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [16, 16, 16, 17]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(10, true);
    this.run_.frames$TextureFilm$ObjectArr(frames, [22, 23, 24, 25, 26]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(15, false);
    this.attack.frames$TextureFilm$ObjectArr(frames, [18, 19, 20, 21]);
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(10, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [27, 28, 29, 30]);
    this.play$Animation(this.idle_);
    return this;
  }
}

$J.define(AlbinoSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.AlbinoSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_AlbinoSprite' } });
$J.module(() => {
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
});
