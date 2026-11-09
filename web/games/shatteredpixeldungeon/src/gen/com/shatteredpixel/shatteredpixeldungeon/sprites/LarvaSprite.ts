// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/LarvaSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sprites, Splash, MovieClip$Animation, TextureFilm;

export class LarvaSprite extends MobSprite {
  _LarvaSprite(): this {
    this._MobSprite();
    this.texture(Assets$Sprites.LARVA);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 12, 8);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(5, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [4, 4, 4, 4, 4, 5, 5]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(12, true);
    this.run_.frames$TextureFilm$ObjectArr(frames, [0, 1, 2, 3]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(15, false);
    this.attack.frames$TextureFilm$ObjectArr(frames, [6, 5, 7]);
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(10, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [8]);
    this.play$Animation(this.idle_);
    return this;
  }
  blood(): number {
    return 12307558;
  }
  die(): void {
    Splash.at$PointF$int$int(this.center$(), this.blood(), 10);
    super.die();
  }
}

$J.define(LarvaSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.LarvaSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_LarvaSprite' } });
$J.module(() => {
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Splash = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Splash');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
});
