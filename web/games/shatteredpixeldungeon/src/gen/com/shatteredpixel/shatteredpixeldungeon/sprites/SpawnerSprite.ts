// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/SpawnerSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sprites, Splash, Game, MovieClip$Animation, TextureFilm;

export class SpawnerSprite extends MobSprite {
  baseY: number = 0;
  _SpawnerSprite(): this {
    this._MobSprite();
    this.baseY = NaN;
    this.texture(Assets$Sprites.SPAWNER);
    this.perspectiveRaise = Math.fround(8 / 16);
    this.shadowOffset = 1.25;
    this.shadowHeight = Math.fround(0.4);
    this.shadowWidth = 1;
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 16, 16);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(8, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    this.run_ = this.idle_.clone();
    this.attack = this.idle_.clone();
    this.die_ = this.idle_.clone();
    this.play$Animation(this.idle_);
    return this;
  }
  place(cell: number): void {
    super.place(cell);
    this.baseY = this.y;
  }
  update(): void {
    super.update();
    if (!this.paused_) {
      if ($J.Float_isNaN(this.baseY)) {
        this.baseY = this.y;
      }
      this.y = Math.fround(this.baseY + Math.fround((Math.sin(Game.timeTotal) / 3)));
      this.shadowOffset = Math.fround(1.25 - Math.fround(Math.fround(0.6) * Math.fround((Math.sin(Game.timeTotal) / 3))));
    }
  }
  die(): void {
    Splash.around(this, this.blood(), 100);
    this.killAndErase();
  }
  bloodBurstA(from: PointF, damage: number): void {
    if (this.alive) {
      super.bloodBurstA(from, damage);
    }
  }
}

$J.define(SpawnerSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.SpawnerSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_SpawnerSprite' } });
$J.module(() => {
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Splash = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Splash');
  Game = $J.load('com.watabou.noosa.Game');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
});
