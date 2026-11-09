// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/BlacksmithSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Assets$Sprites, Dungeon, Speck, MovieClip$Animation, TextureFilm, Music, Sample, Emitter;

export class BlacksmithSprite extends MobSprite {
  emitter_: Emitter = null;
  _BlacksmithSprite(): this {
    this._MobSprite();
    this.texture(Assets$Sprites.TROLL);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 13, 16);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(15, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [0, 0, 0, 0, 0, 0, 0, 1, 2, 2, 2, 3]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(20, true);
    this.run_.frames$TextureFilm$ObjectArr(frames, [0]);
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(20, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [0]);
    this.play$Animation(this.idle_);
    return this;
  }
  link(ch: Char): void {
    super.link(ch);
    this.emitter_ = new Emitter()._Emitter();
    this.emitter_.autoKill = false;
    this.emitter_.pos$float$float(Math.fround(this.x + 7), Math.fround(this.y + 12));
    this.parent.add$Gizmo(this.emitter_);
  }
  update(): void {
    super.update();
    if (this.emitter_ != null) {
      this.emitter_.visible_ = this.visible_;
    }
  }
  onComplete$Animation(anim: MovieClip$Animation): void {
    super.onComplete$Animation(anim);
    if (this.visible_ && this.emitter_ != null && anim === this.idle_) {
      this.emitter_.burst(Speck.factory$int(Speck.FORGE), 3);
      if (!Music.INSTANCE.paused()) {
        let volume = Math.fround(Math.fround(0.2) / (Dungeon.level.distance(this.ch.pos, Dungeon.hero.pos)));
        Sample.INSTANCE.play$Object$float$float$float(Assets$Sounds.EVOKE, volume, volume, Math.fround(0.8));
      }
    }
  }
}

$J.define(BlacksmithSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.BlacksmithSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_BlacksmithSprite' }, meths: { 'onComplete(com.watabou.noosa.MovieClip$Animation)': 'onComplete$Animation' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
  Music = $J.load('com.watabou.noosa.audio.Music');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Emitter = $J.load('com.watabou.noosa.particles.Emitter');
});
