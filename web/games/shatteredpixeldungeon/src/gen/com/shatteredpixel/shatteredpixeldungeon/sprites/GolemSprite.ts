// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/GolemSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Assets$Sprites, Golem, MagicMissile, ElmoParticle, MovieClip$Animation, TextureFilm, Sample;

export class GolemSprite extends MobSprite {
  teleParticles_: Emitter = null;
  died: boolean = false;
  _GolemSprite(): this {
    this._MobSprite();
    this.died = false;
    this.texture(Assets$Sprites.GOLEM);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 17, 19);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(4, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [0, 1]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(12, true);
    this.run_.frames$TextureFilm$ObjectArr(frames, [2, 3, 4, 5]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(10, false);
    this.attack.frames$TextureFilm$ObjectArr(frames, [6, 7, 8]);
    this.zap_ = this.attack.clone();
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(15, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [9, 10, 11, 12, 13]);
    this.play$Animation(this.idle_);
    return this;
  }
  link(ch: Char): void {
    super.link(ch);
    this.teleParticles_ = this.emitter();
    this.teleParticles_.autoKill = false;
    this.teleParticles_.pour(ElmoParticle.FACTORY, Math.fround(0.05));
    this.teleParticles_.on = false;
  }
  update(): void {
    super.update();
    if (this.teleParticles_ != null) {
      this.teleParticles_.pos$Visual(this);
      this.teleParticles_.visible_ = this.visible_;
    }
  }
  kill(): void {
    super.kill();
    if (this.teleParticles_ != null) {
      this.teleParticles_.on = false;
    }
  }
  teleParticles(value: boolean): void {
    if (this.teleParticles_ != null) {
      this.teleParticles_.on = value;
    }
  }
  play$Animation$boolean(anim: MovieClip$Animation, force: boolean): void {
    if (this.teleParticles_ != null) {
      this.teleParticles_.on = false;
    }
    super.play$Animation$boolean(anim, force);
  }
  blood(): number {
    return -8359828;
  }
  zap$int(cell: number): void {
    super.zap$int(cell);
    MagicMissile.boltFromChar(this.parent, MagicMissile.ELMO, this, cell, new (GolemSprite$1())().$o(this));
    Sample.INSTANCE.play$Object(Assets$Sounds.ZAP);
  }
  onComplete$Animation(anim: MovieClip$Animation): void {
    if (anim === this.die_ && !this.died) {
      this.died = true;
      this.emitter().burst(ElmoParticle.FACTORY, 4);
    }
    if (anim === this.zap_) {
      this.idle();
    }
    super.onComplete$Animation(anim);
  }
}

let $GolemSprite$1: any = null;
/** An anonymous class (GolemSprite.java:114). */
function GolemSprite$1(): any {
  return $GolemSprite$1 ??= $J.local(class extends JObject {
    call(): void {
      if (this.$outer.ch instanceof Golem) {
        (this.$outer.ch).onZapComplete();
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.sprites.GolemSprite$1', ['com.watabou.utils.Callback']);
}

$J.define(GolemSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.GolemSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_GolemSprite' }, meths: { 'onComplete(com.watabou.noosa.MovieClip$Animation)': 'onComplete$Animation', 'zap(int)': 'zap$int', 'play(com.watabou.noosa.MovieClip$Animation,boolean)': 'play$Animation$boolean' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Golem = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Golem');
  MagicMissile = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile');
  ElmoParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ElmoParticle');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
