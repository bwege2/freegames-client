// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/VaultTokenDoorSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class VaultTokenDoorSprite extends MobSprite {
  _VaultTokenDoorSprite(): this {
    this._MobSprite();
    this.perspectiveRaise = Math.fround(4 / 16);
    this.renderShadow = false;
    this.visibleOutOfFFOV = true;
    this.texture(Assets$Sprites.VAULT_TOKENS_DOOR);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 16, 16);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(1, false);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [0]);
    this.run_ = this.idle_.clone();
    this.attack = this.idle_.clone();
    this.die_ = this.idle_.clone();
    this.play$Animation(this.idle_);
    return this;
  }
  link(ch: Char): void {
    super.link(ch);
    this.renderShadow = false;
  }
}

$J.define(VaultTokenDoorSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.VaultTokenDoorSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_VaultTokenDoorSprite' } });
$J.module(() => {
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
});
