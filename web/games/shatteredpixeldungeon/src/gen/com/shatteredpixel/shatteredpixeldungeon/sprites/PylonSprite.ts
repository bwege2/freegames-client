// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/PylonSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Assets$Sprites, Char$Alignment, Pylon, BlastParticle, MovieClip$Animation, TextureFilm, Sample;

export class PylonSprite extends MobSprite {
  activeIdle: MovieClip$Animation = null;
  _PylonSprite(): this {
    this._MobSprite();
    this.perspectiveRaise = Math.fround(5 / 16);
    this.renderShadow = false;
    this.texture(Assets$Sprites.PYLON);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 10, 20);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(1, false);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [0]);
    this.activeIdle = new MovieClip$Animation()._MovieClip$Animation(1, false);
    this.activeIdle.frames$TextureFilm$ObjectArr(frames, [1]);
    this.run_ = this.idle_.clone();
    this.attack = this.idle_.clone();
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(1, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [2]);
    this.play$Animation(this.idle_);
    return this;
  }
  link(ch: Char): void {
    super.link(ch);
    if (ch instanceof Pylon && ch.alignment === Char$Alignment.ENEMY) {
      this.activate();
    }
    this.renderShadow = false;
  }
  place(cell: number): void {
    if (this.parent != null) {
      this.parent.bringToFront(this);
    }
    super.place(cell);
  }
  activate(): void {
    this.idle_ = this.activeIdle.clone();
    this.idle();
  }
  play$Animation(anim: MovieClip$Animation): void {
    if (anim === this.die_) {
      this.turnTo(this.ch.pos, (this.ch.pos + 1) | 0);
      this.emitter().burst(BlastParticle.FACTORY, 20);
      Sample.INSTANCE.play$Object(Assets$Sounds.BLAST);
    }
    super.play$Animation(anim);
  }
  onComplete$Animation(anim: MovieClip$Animation): void {
    if (anim === this.attack) {
      this.flash();
    }
    super.onComplete$Animation(anim);
  }
  blood(): number {
    return -120;
  }
}

$J.define(PylonSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.PylonSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_PylonSprite' }, meths: { 'onComplete(com.watabou.noosa.MovieClip$Animation)': 'onComplete$Animation', 'play(com.watabou.noosa.MovieClip$Animation)': 'play$Animation' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Pylon = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Pylon');
  BlastParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.BlastParticle');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
