// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/SkeletonSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sprites, Dungeon, Speck, MovieClip$Animation, TextureFilm;

export class SkeletonSprite extends MobSprite {
  _SkeletonSprite(): this {
    this._MobSprite();
    this.texture(Assets$Sprites.SKELETON);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 12, this.texHeight());
    let c = this.texOffset();
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(12, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [(0 + c) | 0, (0 + c) | 0, (0 + c) | 0, (0 + c) | 0, (0 + c) | 0, (0 + c) | 0, (0 + c) | 0, (0 + c) | 0, (0 + c) | 0, (0 + c) | 0, (0 + c) | 0, (0 + c) | 0, (0 + c) | 0, (1 + c) | 0, (2 + c) | 0, (3 + c) | 0]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(15, true);
    this.run_.frames$TextureFilm$ObjectArr(frames, [(4 + c) | 0, (5 + c) | 0, (6 + c) | 0, (7 + c) | 0, (8 + c) | 0, (9 + c) | 0]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(15, false);
    this.attack.frames$TextureFilm$ObjectArr(frames, [(14 + c) | 0, (15 + c) | 0, (16 + c) | 0]);
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(12, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [(10 + c) | 0, (11 + c) | 0, (12 + c) | 0, (13 + c) | 0]);
    this.play$Animation(this.idle_);
    return this;
  }
  texOffset(): number {
    return 0;
  }
  texHeight(): number {
    return 15;
  }
  die(): void {
    super.die();
    if (Dungeon.level.heroFOV[this.ch.pos]) {
      this.emitter().burst(Speck.factory$int(Speck.BONE), 6);
    }
  }
  blood(): number {
    return -3355444;
  }
}

export class SkeletonSprite$Vault extends SkeletonSprite {
  _SkeletonSprite$Vault(): this {
    this._SkeletonSprite();
    return this;
  }
  texOffset(): number {
    return 21;
  }
  texHeight(): number {
    return 16;
  }
}

$J.define(SkeletonSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.SkeletonSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_SkeletonSprite' } });
$J.define(SkeletonSprite$Vault, 'com.shatteredpixel.shatteredpixeldungeon.sprites.SkeletonSprite$Vault', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.SkeletonSprite', ctors: { '': '_SkeletonSprite$Vault' } });
$J.module(() => {
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
});
