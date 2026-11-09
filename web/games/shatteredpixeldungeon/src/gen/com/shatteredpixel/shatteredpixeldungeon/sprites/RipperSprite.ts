// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/RipperSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class RipperSprite extends MobSprite {
  stab: MovieClip$Animation = null;
  prep: MovieClip$Animation = null;
  leap: MovieClip$Animation = null;
  alt: boolean = false;
  _RipperSprite(): this {
    this._MobSprite();
    this.alt = Random.Int$int(2) === 0;
    this.texture(Assets$Sprites.RIPPER);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 15, 14);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(4, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [1, 0, 1, 2]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(15, true);
    this.run_.frames$TextureFilm$ObjectArr(frames, [3, 4, 5, 6, 7, 8]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(12, false);
    this.attack.frames$TextureFilm$ObjectArr(frames, [0, 9, 10, 9]);
    this.stab = new MovieClip$Animation()._MovieClip$Animation(12, false);
    this.stab.frames$TextureFilm$ObjectArr(frames, [0, 9, 11, 9]);
    this.prep = new MovieClip$Animation()._MovieClip$Animation(1, true);
    this.prep.frames$TextureFilm$ObjectArr(frames, [9]);
    this.leap = new MovieClip$Animation()._MovieClip$Animation(1, true);
    this.leap.frames$TextureFilm$ObjectArr(frames, [12]);
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(15, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [1, 13, 14, 15, 16]);
    this.play$Animation(this.idle_);
    return this;
  }
  leapPrep(cell: number): void {
    this.turnTo(this.ch.pos, cell);
    this.play$Animation(this.prep);
  }
  jump$int$int$float$float$Callback(from: number, to: number, height: number, duration: number, callback: Callback): void {
    super.jump$int$int$float$float$Callback(from, to, height, duration, callback);
    this.play$Animation(this.leap);
  }
  attack$int(cell: number): void {
    super.attack$int(cell);
    if (this.alt) {
      this.play$Animation(this.stab);
    }
    this.alt = !this.alt;
  }
  onComplete$Animation(anim: MovieClip$Animation): void {
    super.onComplete$Animation(anim === this.stab ? this.attack : anim);
  }
}

$J.define(RipperSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.RipperSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_RipperSprite' }, meths: { 'onComplete(com.watabou.noosa.MovieClip$Animation)': 'onComplete$Animation', 'attack(int)': 'attack$int', 'jump(int,int,float,float,com.watabou.utils.Callback)': 'jump$int$int$float$float$Callback' } });
$J.module(() => {
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
  Random = $J.load('com.watabou.utils.Random');
});
