// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/StatueSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sprites, MovieClip$Animation, TextureFilm, GameMath;

export class StatueSprite extends MobSprite {
  static tierFrames: number[] = null;
  _StatueSprite(): this {
    this._MobSprite();
    this.texture(Assets$Sprites.STATUE);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 12, 15);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(2, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [0, 0, 0, 0, 0, 1, 1]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(15, true);
    this.run_.frames$TextureFilm$ObjectArr(frames, [2, 3, 4, 5, 6, 7]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(12, false);
    this.attack.frames$TextureFilm$ObjectArr(frames, [8, 9, 10]);
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(5, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [11, 12, 13, 14, 15, 15]);
    this.play$Animation(this.idle_);
    return this;
  }
  setArmor(tier: number): void {
    let c = StatueSprite.tierFrames[$J.d2i(GameMath.gate(0, Math.fround(tier), 5))];
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 12, 15);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [(0 + c) | 0, (0 + c) | 0, (0 + c) | 0, (0 + c) | 0, (0 + c) | 0, (1 + c) | 0, (1 + c) | 0]);
    this.run_.frames$TextureFilm$ObjectArr(frames, [(2 + c) | 0, (3 + c) | 0, (4 + c) | 0, (5 + c) | 0, (6 + c) | 0, (7 + c) | 0]);
    this.attack.frames$TextureFilm$ObjectArr(frames, [(8 + c) | 0, (9 + c) | 0, (10 + c) | 0]);
    this.play$Animation$boolean(this.idle_, true);
  }
  blood(): number {
    return -3289673;
  }
  static $clinit() {
    StatueSprite.tierFrames = [0, 21, 32, 43, 54, 65];
  }
}

$J.define(StatueSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.StatueSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_StatueSprite' }, clinit: true, lazy: ['tierFrames'] });
$J.module(() => {
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
  GameMath = $J.load('com.watabou.utils.GameMath');
});
