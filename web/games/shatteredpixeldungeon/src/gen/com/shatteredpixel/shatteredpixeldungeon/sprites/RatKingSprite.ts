// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/RatKingSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sprites, Dungeon, Ratmogrify, Holiday, MovieClip$Animation, TextureFilm;

export class RatKingSprite extends MobSprite {
  festive: boolean = false;
  _RatKingSprite(): this {
    this._MobSprite();
    this.resetAnims();
    return this;
  }
  resetAnims(): void {
    let height = 16;
    let c: number;
    switch (Holiday.getCurrentHoliday()) {
      default:
        c = 0;
        break;
      case Holiday.APRIL_FOOLS:
        height = 17;
        c = 16;
        break;
      case Holiday.WINTER_HOLIDAYS:
        height = 17;
        c = 24;
        break;
    }
    if (Dungeon.hero != null && Dungeon.hero.armorAbility instanceof Ratmogrify) {
      c = 8;
      if (this.parent != null) {
        this.aura(16776960, 5);
      }
    }
    this.texture(Assets$Sprites.RATKING);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 16, height);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(2, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [(c + 0) | 0, (c + 0) | 0, (c + 0) | 0, (c + 1) | 0]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(10, true);
    this.run_.frames$TextureFilm$ObjectArr(frames, [(c + 2) | 0, (c + 3) | 0, (c + 4) | 0, (c + 5) | 0, (c + 6) | 0]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(15, false);
    this.attack.frames$TextureFilm$ObjectArr(frames, [(c + 0) | 0]);
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(10, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [(c + 0) | 0]);
    this.play$Animation(this.idle_);
  }
  link(ch: Char): void {
    super.link(ch);
    if (Dungeon.hero != null && Dungeon.hero.armorAbility instanceof Ratmogrify) {
      this.aura(16776960, 5);
    }
  }
}

$J.define(RatKingSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.RatKingSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_RatKingSprite' } });
$J.module(() => {
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Ratmogrify = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.Ratmogrify');
  Holiday = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.Holiday');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
});
