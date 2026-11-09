// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/CrystalGuardianSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sprites, CrystalGuardian, MovieClip$Animation, TextureFilm;

export class CrystalGuardianSprite extends MobSprite {
  crumple_: MovieClip$Animation = null;
  _CrystalGuardianSprite(): this {
    this._MobSprite();
    this.texture(Assets$Sprites.CRYSTAL_GUARDIAN);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 12, 15);
    let c = this.texOffset();
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(2, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [(0 + c) | 0, (0 + c) | 0, (0 + c) | 0, (0 + c) | 0, (0 + c) | 0, (1 + c) | 0, (1 + c) | 0]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(15, true);
    this.run_.frames$TextureFilm$ObjectArr(frames, [(2 + c) | 0, (3 + c) | 0, (4 + c) | 0, (5 + c) | 0, (6 + c) | 0, (7 + c) | 0]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(12, false);
    this.attack.frames$TextureFilm$ObjectArr(frames, [(8 + c) | 0, (9 + c) | 0, (10 + c) | 0]);
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(5, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [(11 + c) | 0, (12 + c) | 0, (13 + c) | 0, (14 + c) | 0, (15 + c) | 0, (15 + c) | 0]);
    this.crumple_ = this.die_.clone();
    this.scale_.set$float(1.25);
    this.play$Animation(this.idle_);
    return this;
  }
  crumple(): void {
    this.play$Animation(this.crumple_);
  }
  endCrumple(): void {
    if (this.curAnim === this.crumple_) {
      this.idle();
    }
  }
  link(ch: Char): void {
    super.link(ch);
    if (ch instanceof CrystalGuardian && (ch).recovering()) {
      this.crumple();
    }
  }
}

export class CrystalGuardianSprite$Blue extends CrystalGuardianSprite {
  _CrystalGuardianSprite$Blue(): this {
    this._CrystalGuardianSprite();
    return this;
  }
  texOffset(): number {
    return 0;
  }
  blood(): number {
    return -7412737;
  }
}

export class CrystalGuardianSprite$Green extends CrystalGuardianSprite {
  _CrystalGuardianSprite$Green(): this {
    this._CrystalGuardianSprite();
    return this;
  }
  texOffset(): number {
    return 21;
  }
  blood(): number {
    return -7995448;
  }
}

export class CrystalGuardianSprite$Red extends CrystalGuardianSprite {
  _CrystalGuardianSprite$Red(): this {
    this._CrystalGuardianSprite();
    return this;
  }
  texOffset(): number {
    return 42;
  }
  blood(): number {
    return -17613;
  }
}

$J.define(CrystalGuardianSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.CrystalGuardianSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_CrystalGuardianSprite' } });
$J.define(CrystalGuardianSprite$Blue, 'com.shatteredpixel.shatteredpixeldungeon.sprites.CrystalGuardianSprite$Blue', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.CrystalGuardianSprite', ctors: { '': '_CrystalGuardianSprite$Blue' } });
$J.define(CrystalGuardianSprite$Green, 'com.shatteredpixel.shatteredpixeldungeon.sprites.CrystalGuardianSprite$Green', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.CrystalGuardianSprite', ctors: { '': '_CrystalGuardianSprite$Green' } });
$J.define(CrystalGuardianSprite$Red, 'com.shatteredpixel.shatteredpixeldungeon.sprites.CrystalGuardianSprite$Red', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.CrystalGuardianSprite', ctors: { '': '_CrystalGuardianSprite$Red' } });
$J.module(() => {
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  CrystalGuardian = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.CrystalGuardian');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
});
