// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/NecromancerSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Assets$Sprites, Dungeon, Necromancer, CellEmitter, Speck, MovieClip$Animation, TextureFilm, Sample;

export class NecromancerSprite extends MobSprite {
  charging: MovieClip$Animation = null;
  summoningBones: Emitter = null;
  _NecromancerSprite(): this {
    this._MobSprite();
    this.texture(Assets$Sprites.NECRO);
    let film = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 16, 16);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(1, true);
    this.idle_.frames$TextureFilm$ObjectArr(film, [0, 0, 0, 1, 0, 0, 0, 0, 1]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(8, true);
    this.run_.frames$TextureFilm$ObjectArr(film, [0, 0, 0, 2, 3, 4]);
    this.zap_ = new MovieClip$Animation()._MovieClip$Animation(10, false);
    this.zap_.frames$TextureFilm$ObjectArr(film, [5, 6, 7, 8]);
    this.charging = new MovieClip$Animation()._MovieClip$Animation(5, true);
    this.charging.frames$TextureFilm$ObjectArr(film, [7, 8]);
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(10, false);
    this.die_.frames$TextureFilm$ObjectArr(film, [9, 10, 11, 12]);
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
    if (this.summoningBones != null && (this.ch).summoningPos !== -1) {
      this.summoningBones.visible_ = Dungeon.level.heroFOV[(this.ch).summoningPos];
    }
  }
  die(): void {
    super.die();
    if (this.summoningBones != null) {
      this.summoningBones.on = false;
      this.summoningBones = null;
    }
  }
  kill(): void {
    super.kill();
    if (this.summoningBones != null) {
      this.summoningBones.on = false;
      this.summoningBones = null;
    }
  }
  cancelSummoning(): void {
    if (this.summoningBones != null) {
      this.summoningBones.on = false;
      this.summoningBones = null;
    }
  }
  finishSummoning(): void {
    if (this.summoningBones != null) {
      if (this.summoningBones.visible_) {
        Sample.INSTANCE.play$Object(Assets$Sounds.BONES);
        this.summoningBones.burst(Speck.factory$int(Speck.RATTLE), 5);
      } else {
        this.summoningBones.on = false;
      }
      this.summoningBones = null;
    }
    this.idle();
  }
  charge(): void {
    this.play$Animation(this.charging);
  }
  zap$int(cell: number): void {
    super.zap$int(cell);
    if (this.ch instanceof Necromancer && (this.ch).summoning) {
      if (this.summoningBones != null) {
        this.summoningBones.on = false;
      }
      this.summoningBones = CellEmitter.get((this.ch).summoningPos);
      this.summoningBones.pour(Speck.factory$int(Speck.RATTLE), Math.fround(0.2));
      this.summoningBones.visible_ = Dungeon.level.heroFOV[(this.ch).summoningPos];
      if (this.visible_ || this.summoningBones.visible_) {
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

$J.define(NecromancerSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.NecromancerSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_NecromancerSprite' }, meths: { 'onComplete(com.watabou.noosa.MovieClip$Animation)': 'onComplete$Animation', 'zap(int)': 'zap$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Necromancer = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Necromancer');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
