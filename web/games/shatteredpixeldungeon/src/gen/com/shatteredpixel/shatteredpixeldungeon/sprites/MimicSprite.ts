// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/MimicSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sprites, Char$Alignment, Mimic, MovieClip$Animation, TextureFilm;

export class MimicSprite extends MobSprite {
  advancedHiding: MovieClip$Animation = null;
  hiding: MovieClip$Animation = null;
  _MimicSprite(): this {
    this._MobSprite();
    this.perspectiveRaise = Math.fround(5 / 16);
    this.shadowWidth = 1;
    this.shadowOffset = Math.fround(-Math.fround(0.4));
    let c = this.texOffset();
    this.texture(Assets$Sprites.MIMIC);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 16, 16);
    this.advancedHiding = new MovieClip$Animation()._MovieClip$Animation(1, true);
    this.advancedHiding.frames$TextureFilm$ObjectArr(frames, [(0 + c) | 0]);
    this.hiding = new MovieClip$Animation()._MovieClip$Animation(1, true);
    this.hiding.frames$TextureFilm$ObjectArr(frames, [(1 + c) | 0, (1 + c) | 0, (1 + c) | 0, (1 + c) | 0, (1 + c) | 0, (2 + c) | 0]);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(5, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [(3 + c) | 0, (3 + c) | 0, (3 + c) | 0, (4 + c) | 0, (4 + c) | 0]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(10, true);
    this.run_.frames$TextureFilm$ObjectArr(frames, [(3 + c) | 0, (4 + c) | 0, (5 + c) | 0, (6 + c) | 0, (6 + c) | 0, (5 + c) | 0, (4 + c) | 0]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(10, false);
    this.attack.frames$TextureFilm$ObjectArr(frames, [(3 + c) | 0, (7 + c) | 0, (8 + c) | 0, (9 + c) | 0]);
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(5, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [(10 + c) | 0, (11 + c) | 0, (12 + c) | 0]);
    this.play$Animation(this.idle_);
    return this;
  }
  texOffset(): number {
    return 0;
  }
  linkVisuals(ch: Char): void {
    super.linkVisuals(ch);
    if (ch.alignment === Char$Alignment.NEUTRAL) {
      this.hideMimic(ch);
    }
  }
  hideMimic(ch: Char): void {
    if (ch instanceof Mimic && (ch).stealthy()) {
      this.play$Animation(this.advancedHiding);
    } else {
      this.play$Animation(this.hiding);
    }
    this.hideSleep();
  }
  showSleep(): void {
    if (this.curAnim === this.hiding || this.curAnim === this.advancedHiding) {
      return;
    }
    super.showSleep();
  }
}

export class MimicSprite$Golden extends MimicSprite {
  _MimicSprite$Golden(): this {
    this._MimicSprite();
    return this;
  }
  texOffset(): number {
    return 16;
  }
}

export class MimicSprite$Crystal extends MimicSprite {
  _MimicSprite$Crystal(): this {
    this._MimicSprite();
    return this;
  }
  texOffset(): number {
    return 32;
  }
}

export class MimicSprite$Ebony extends MimicSprite {
  _MimicSprite$Ebony(): this {
    this._MimicSprite();
    return this;
  }
  texOffset(): number {
    return 48;
  }
  hideMimic(ch: Char): void {
    super.hideMimic(ch);
    this.alpha$float(Math.fround(0.2));
  }
  resetColor(): void {
    super.resetColor();
    if (this.advancedHiding != null && this.curAnim === this.advancedHiding) {
      this.alpha$float(Math.fround(0.2));
    }
  }
  play$Animation(anim: MovieClip$Animation): void {
    if (this.curAnim === this.advancedHiding && anim !== this.advancedHiding) {
      this.alpha$float(1);
    }
    super.play$Animation(anim);
  }
}

$J.define(MimicSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.MimicSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_MimicSprite' } });
$J.define(MimicSprite$Golden, 'com.shatteredpixel.shatteredpixeldungeon.sprites.MimicSprite$Golden', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MimicSprite', ctors: { '': '_MimicSprite$Golden' } });
$J.define(MimicSprite$Crystal, 'com.shatteredpixel.shatteredpixeldungeon.sprites.MimicSprite$Crystal', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MimicSprite', ctors: { '': '_MimicSprite$Crystal' } });
$J.define(MimicSprite$Ebony, 'com.shatteredpixel.shatteredpixeldungeon.sprites.MimicSprite$Ebony', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MimicSprite', ctors: { '': '_MimicSprite$Ebony' }, meths: { 'play(com.watabou.noosa.MovieClip$Animation)': 'play$Animation' } });
$J.module(() => {
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Mimic = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mimic');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
});
