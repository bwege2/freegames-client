// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/GhostSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sprites, Speck, ShaftParticle, Blending, MovieClip$Animation, TextureFilm;

export class GhostSprite extends MobSprite {
  _GhostSprite(): this {
    this._MobSprite();
    this.texture(Assets$Sprites.GHOST);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 14, 15);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(5, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [0, 1]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(10, true);
    this.run_.frames$TextureFilm$ObjectArr(frames, [0, 1]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(10, false);
    this.attack.frames$TextureFilm$ObjectArr(frames, [0, 2, 3]);
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(8, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [0, 4, 5, 6, 7]);
    this.play$Animation(this.idle_);
    return this;
  }
  draw(): void {
    Blending.setLightMode();
    super.draw();
    Blending.setNormalMode();
  }
  die(): void {
    super.die();
    this.emitter().start(ShaftParticle.FACTORY, Math.fround(0.3), 4);
    this.emitter().start(Speck.factory$int(Speck.LIGHT), Math.fround(0.2), 3);
  }
  blood(): number {
    return 16777215;
  }
}

$J.define(GhostSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.GhostSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_GhostSprite' } });
$J.module(() => {
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  ShaftParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShaftParticle');
  Blending = $J.load('com.watabou.glwrap.Blending');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
});
