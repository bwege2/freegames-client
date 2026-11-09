// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/WandmakerSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Assets$Sprites, ElmoParticle, CharSprite$State, MovieClip$Animation, TextureFilm, Sample;

export class WandmakerSprite extends MobSprite {
  shield$WandmakerSprite: ShieldHalo = null;
  _WandmakerSprite(): this {
    this._MobSprite();
    this.texture(Assets$Sprites.MAKER);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 12, 14);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(10, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 3, 3, 2, 1]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(20, true);
    this.run_.frames$TextureFilm$ObjectArr(frames, [0]);
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(20, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [0]);
    this.play$Animation(this.idle_);
    return this;
  }
  link(ch: Char): void {
    super.link(ch);
    this.add(CharSprite$State.SHIELDED);
  }
  die(): void {
    super.die();
    this.processStateRemoval(CharSprite$State.SHIELDED);
    this.emitter().start(ElmoParticle.FACTORY, Math.fround(0.03), 60);
    if (this.visible_) {
      Sample.INSTANCE.play$Object(Assets$Sounds.BURNING);
    }
  }
}

$J.define(WandmakerSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.WandmakerSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_WandmakerSprite' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  ElmoParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ElmoParticle');
  CharSprite$State = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite$State');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
