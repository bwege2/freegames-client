// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/DM300Sprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../jre/index.ts';
import { MobSprite } from './MobSprite.ts';

let Assets$Sounds, Assets$Sprites, DM300, MagicMissile, Speck, BlastParticle, SparkParticle, PixelScene, MovieClip$Animation, TextureFilm, Sample;

export class DM300Sprite extends MobSprite {
  charge_: MovieClip$Animation = null;
  slam_: MovieClip$Animation = null;
  superchargeSparks: Emitter = null;
  _DM300Sprite(): this {
    this._MobSprite();
    this.texture(Assets$Sprites.DM300);
    this.updateChargeState(false);
    return this;
  }
  updateChargeState(enraged: boolean): void {
    if (this.superchargeSparks != null) {
      this.superchargeSparks.on = enraged;
    }
    let c = enraged ? 10 : 0;
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 25, 22);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(enraged ? 15 : 10, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [(c + 0) | 0, (c + 1) | 0]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(enraged ? 15 : 10, true);
    this.run_.frames$TextureFilm$ObjectArr(frames, [(c + 0) | 0, (c + 2) | 0]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(15, false);
    this.attack.frames$TextureFilm$ObjectArr(frames, [(c + 3) | 0, (c + 4) | 0, (c + 5) | 0]);
    if (this.charge_ == null) {
      this.charge_ = new MovieClip$Animation()._MovieClip$Animation(4, true);
      this.charge_.frames$TextureFilm$ObjectArr(frames, [0, 10]);
      this.slam_ = this.attack.clone();
      this.zap_ = new MovieClip$Animation()._MovieClip$Animation(15, false);
      this.zap_.frames$TextureFilm$ObjectArr(frames, [6, 7, 7, 6]);
      this.die_ = new MovieClip$Animation()._MovieClip$Animation(20, false);
      this.die_.frames$TextureFilm$ObjectArr(frames, [0, 10, 0, 10, 0, 10, 0, 10, 0, 10, 0, 10, 0, 10, 0, 10, 0, 10, 0, 10]);
    }
    if (this.curAnim !== this.charge_) {
      this.play$Animation(this.idle_);
    }
  }
  zap$int(cell: number): void {
    super.zap$int(cell);
    MagicMissile.boltFromChar(this.parent, (MagicMissile.SPECK + Speck.TOXIC) | 0, this, cell, new (DM300Sprite$1())().$o(this));
    Sample.INSTANCE.play$Object(Assets$Sounds.GAS);
  }
  charge(): void {
    this.play$Animation(this.charge_);
  }
  slam(cell: number): void {
    this.turnTo(this.ch.pos, cell);
    this.play$Animation(this.slam_);
    Sample.INSTANCE.play$Object(Assets$Sounds.ROCKS);
    PixelScene.shake(3, Math.fround(0.7));
  }
  onComplete$Animation(anim: MovieClip$Animation): void {
    if (anim === this.zap_ || anim === this.slam_) {
      this.idle();
    }
    if (anim === this.slam_) {
      (this.ch).onSlamComplete();
    }
    super.onComplete$Animation(anim);
    if (anim === this.die_) {
      Sample.INSTANCE.play$Object(Assets$Sounds.BLAST);
      this.emitter().burst(BlastParticle.FACTORY, 100);
      this.killAndErase();
    }
  }
  place(cell: number): void {
    if (this.parent != null) {
      this.parent.bringToFront(this);
    }
    super.place(cell);
  }
  link(ch: Char): void {
    super.link(ch);
    this.superchargeSparks = this.emitter();
    this.superchargeSparks.autoKill = false;
    this.superchargeSparks.pour(SparkParticle.STATIC, Math.fround(0.05));
    this.superchargeSparks.on = false;
    if (ch instanceof DM300 && (ch).isSupercharged()) {
      this.updateChargeState(true);
    }
  }
  update(): void {
    super.update();
    if (this.superchargeSparks != null) {
      this.superchargeSparks.visible_ = this.visible_;
    }
  }
  die(): void {
    super.die();
    if (this.superchargeSparks != null) {
      this.superchargeSparks.on = false;
    }
  }
  kill(): void {
    super.kill();
    if (this.superchargeSparks != null) {
      this.superchargeSparks.killAndErase();
    }
  }
  blood(): number {
    return -120;
  }
}

let $DM300Sprite$1: any = null;
/** An anonymous class (DM300Sprite.java:94). */
function DM300Sprite$1(): any {
  return $DM300Sprite$1 ??= $J.local(class extends JObject {
    call(): void {
      (this.$outer.ch).onZapComplete();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.sprites.DM300Sprite$1', ['com.watabou.utils.Callback']);
}

$J.define(DM300Sprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.DM300Sprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_DM300Sprite' }, meths: { 'onComplete(com.watabou.noosa.MovieClip$Animation)': 'onComplete$Animation', 'zap(int)': 'zap$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  DM300 = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DM300');
  MagicMissile = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  BlastParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.BlastParticle');
  SparkParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.SparkParticle');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
