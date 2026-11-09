// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/RotHeartSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sprites, Speck, MovieClip$Animation, TextureFilm;

export class RotHeartSprite extends MobSprite {
  cloud: Emitter = null;
  _RotHeartSprite(): this {
    this._MobSprite();
    this.perspectiveRaise = Math.fround(0.2);
    this.texture(Assets$Sprites.ROT_HEART);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 16, 16);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(1, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [0]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(1, true);
    this.run_.frames$TextureFilm$ObjectArr(frames, [0]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(1, false);
    this.attack.frames$TextureFilm$ObjectArr(frames, [0]);
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(8, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [1, 2, 3, 4, 5, 6, 7, 7, 7]);
    this.play$Animation(this.idle_);
    return this;
  }
  link(ch: Char): void {
    super.link(ch);
    this.renderShadow = false;
    if (this.cloud == null) {
      this.cloud = this.emitter();
      this.cloud.pour(Speck.factory$int(Speck.TOXIC), Math.fround(0.7));
    }
  }
  turnTo(from: number, to: number): void {
  }
  update(): void {
    super.update();
    if (this.cloud != null) {
      this.cloud.visible_ = this.visible_;
    }
  }
  die(): void {
    super.die();
    if (this.cloud != null) {
      this.cloud.on = false;
    }
  }
  blood(): number {
    return -7812028;
  }
}

$J.define(RotHeartSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.RotHeartSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_RotHeartSprite' } });
$J.module(() => {
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
});
