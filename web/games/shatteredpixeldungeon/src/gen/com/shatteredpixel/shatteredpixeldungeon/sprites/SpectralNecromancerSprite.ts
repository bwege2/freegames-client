// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/SpectralNecromancerSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Assets$Sprites, Dungeon, Necromancer, CellEmitter, ShadowParticle, MovieClip$Animation, TextureFilm, Sample;

export class SpectralNecromancerSprite extends MobSprite {
  charging: MovieClip$Animation = null;
  summoningParticles: Emitter = null;
  _SpectralNecromancerSprite(): this {
    this._MobSprite();
    this.texture(Assets$Sprites.NECRO);
    let film = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 16, 16);
    let c = 16;
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(1, true);
    this.idle_.frames$TextureFilm$ObjectArr(film, [(c + 0) | 0, (c + 0) | 0, (c + 0) | 0, (c + 1) | 0, (c + 0) | 0, (c + 0) | 0, (c + 0) | 0, (c + 0) | 0, (c + 1) | 0]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(8, true);
    this.run_.frames$TextureFilm$ObjectArr(film, [(c + 0) | 0, (c + 0) | 0, (c + 0) | 0, (c + 2) | 0, (c + 3) | 0, (c + 4) | 0]);
    this.zap_ = new MovieClip$Animation()._MovieClip$Animation(10, false);
    this.zap_.frames$TextureFilm$ObjectArr(film, [(c + 5) | 0, (c + 6) | 0, (c + 7) | 0, (c + 8) | 0]);
    this.charging = new MovieClip$Animation()._MovieClip$Animation(5, true);
    this.charging.frames$TextureFilm$ObjectArr(film, [(c + 7) | 0, (c + 8) | 0]);
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(10, false);
    this.die_.frames$TextureFilm$ObjectArr(film, [(c + 9) | 0, (c + 10) | 0, (c + 11) | 0, (c + 12) | 0]);
    this.attack = this.zap_.clone();
    this.idle();
    return this;
  }
  link(ch: Char): void {
    super.link(ch);
    if (ch instanceof Necromancer && (ch).summoning) {
      this.zap$int((ch).summoningPos);
    }
  }
  update(): void {
    super.update();
    if (this.summoningParticles != null && (this.ch).summoningPos !== -1) {
      this.summoningParticles.visible_ = Dungeon.level.heroFOV[(this.ch).summoningPos];
    }
  }
  die(): void {
    super.die();
    if (this.summoningParticles != null) {
      this.summoningParticles.on = false;
      this.summoningParticles = null;
    }
  }
  kill(): void {
    super.kill();
    if (this.summoningParticles != null) {
      this.summoningParticles.on = false;
      this.summoningParticles = null;
    }
  }
  cancelSummoning(): void {
    if (this.summoningParticles != null) {
      this.summoningParticles.on = false;
      this.summoningParticles = null;
    }
  }
  finishSummoning(): void {
    if (this.summoningParticles.visible_) {
      Sample.INSTANCE.play$Object(Assets$Sounds.CURSED);
      this.summoningParticles.burst(ShadowParticle.CURSE, 5);
    } else {
      this.summoningParticles.on = false;
    }
    this.summoningParticles = null;
    this.idle();
  }
  charge(): void {
    this.play$Animation(this.charging);
  }
  zap$int(cell: number): void {
    super.zap$int(cell);
    if (this.ch instanceof Necromancer && (this.ch).summoning) {
      if (this.summoningParticles != null) {
        this.summoningParticles.on = false;
      }
      this.summoningParticles = CellEmitter.get((this.ch).summoningPos);
      this.summoningParticles.pour(ShadowParticle.MISSILE, Math.fround(0.1));
      this.summoningParticles.visible_ = Dungeon.level.heroFOV[(this.ch).summoningPos];
      if (this.visible_ || this.summoningParticles.visible_) {
        Sample.INSTANCE.play$Object$float$float(Assets$Sounds.CHARGEUP, 1, Math.fround(0.8));
      }
    }
  }
  onComplete$Animation(anim: MovieClip$Animation): void {
    super.onComplete$Animation(anim);
    if (anim === this.zap_) {
      if (this.ch instanceof Necromancer) {
        if ((this.ch).summoning) {
          this.charge();
        } else {
          (this.ch).onZapComplete();
          this.idle();
        }
      } else {
        this.idle();
      }
    }
  }
}

$J.define(SpectralNecromancerSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.SpectralNecromancerSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_SpectralNecromancerSprite' }, meths: { 'onComplete(com.watabou.noosa.MovieClip$Animation)': 'onComplete$Animation', 'zap(int)': 'zap$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Necromancer = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Necromancer');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  ShadowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ShadowParticle');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
