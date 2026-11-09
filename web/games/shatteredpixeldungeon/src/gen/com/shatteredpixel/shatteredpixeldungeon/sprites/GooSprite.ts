// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/GooSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../jre/index.ts';
import { MobSprite } from './MobSprite.ts';
import { PixelParticle$Shrinking } from '../../../watabou/noosa/particles/PixelParticle.ts';

let Assets$Sounds, Assets$Sprites, Dungeon, CellEmitter, ElmoParticle, Ballistica, MovieClip$Animation, TextureFilm, Sample, Emitter$Factory, PointF, Random;

export class GooSprite extends MobSprite {
  pump: MovieClip$Animation = null;
  pumpAttack_: MovieClip$Animation = null;
  spray_: Emitter = null;
  pumpUpEmitterDist: number = 0;
  lastPumpUpPos: number = 0;
  pumpUpEmitters: ArrayList<Emitter> = null;
  _GooSprite(): this {
    this._MobSprite();
    this.pumpUpEmitterDist = 0;
    this.lastPumpUpPos = -1;
    this.pumpUpEmitters = new ArrayList();
    this.texture(Assets$Sprites.GOO);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 20, 14);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(10, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [2, 1, 0, 0, 1]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(15, true);
    this.run_.frames$TextureFilm$ObjectArr(frames, [3, 2, 1, 2]);
    this.pump = new MovieClip$Animation()._MovieClip$Animation(20, true);
    this.pump.frames$TextureFilm$ObjectArr(frames, [4, 3, 2, 1, 0]);
    this.pumpAttack_ = new MovieClip$Animation()._MovieClip$Animation(20, false);
    this.pumpAttack_.frames$TextureFilm$ObjectArr(frames, [4, 3, 2, 1, 0, 7]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(10, false);
    this.attack.frames$TextureFilm$ObjectArr(frames, [8, 9, 10]);
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(10, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [5, 6, 7]);
    this.play$Animation(this.idle_);
    this.spray_ = this.centerEmitter();
    if (this.spray_ != null) {
      this.spray_.autoKill = false;
      this.spray_.pour(GooSprite$GooParticle.FACTORY, Math.fround(0.04));
      this.spray_.on = false;
    }
    return this;
  }
  link(ch: Char): void {
    super.link(ch);
    if (Math.imul(ch.HP, 2) <= ch.HT) {
      this.spray(true);
    }
  }
  pumpUp(warnDist: number): void {
    this.pumpUpEmitterDist = warnDist;
    if (warnDist > 0) {
      this.play$Animation(this.pump);
      Sample.INSTANCE.play$Object$float$float(Assets$Sounds.CHARGEUP, 1, warnDist === 1 ? Math.fround(0.8) : 1);
    }
    this.updateEmitters();
  }
  updateEmitters(): void {
    this.clearEmitters();
    if (this.pumpUpEmitterDist > 0 && this.ch != null) {
      this.lastPumpUpPos = this.ch.pos;
      if (this.ch.fieldOfView == null || this.ch.fieldOfView.length !== Dungeon.level.length()) {
        this.ch.fieldOfView = $J.newArray(Dungeon.level.length(), false);
        Dungeon.level.updateFieldOfView(this.ch, this.ch.fieldOfView);
      }
      for (let i = 0; i < Dungeon.level.length(); i++) {
        if (this.ch.fieldOfView != null && this.ch.fieldOfView[i] && Dungeon.level.distance(i, this.ch.pos) <= this.pumpUpEmitterDist && (new Ballistica()._Ballistica(this.ch.pos, i, Ballistica.STOP_TARGET | Ballistica.STOP_SOLID | Ballistica.IGNORE_SOFT_SOLID)).collisionPos === i && (new Ballistica()._Ballistica(i, this.ch.pos, Ballistica.STOP_TARGET | Ballistica.STOP_SOLID | Ballistica.IGNORE_SOFT_SOLID)).collisionPos === this.ch.pos) {
          let e = CellEmitter.get(i);
          e.pour(GooSprite$GooParticle.FACTORY, Math.fround(0.04));
          this.pumpUpEmitters.add(e);
        }
      }
    }
  }
  clearEmitters(): void {
    for (const $it0 = this.pumpUpEmitters.iterator(); $it0.hasNext(); ) {
      let e = $it0.next();
      e.on = false;
    }
    this.pumpUpEmitters.clear();
  }
  triggerEmitters(): void {
    for (const $it1 = this.pumpUpEmitters.iterator(); $it1.hasNext(); ) {
      let e = $it1.next();
      e.burst(ElmoParticle.FACTORY, 10);
    }
    Sample.INSTANCE.play$Object(Assets$Sounds.BURNING);
    this.pumpUpEmitterDist = 0;
    this.pumpUpEmitters.clear();
  }
  pumpAttack(): void {
    this.play$Animation(this.pumpAttack_);
  }
  play$Animation(anim: MovieClip$Animation): void {
    if (anim !== this.pump && anim !== this.pumpAttack_) {
      this.pumpUpEmitterDist = 0;
      this.clearEmitters();
    }
    super.play$Animation(anim);
  }
  blood(): number {
    return -16777216;
  }
  spray(on: boolean): void {
    this.spray_.on = on;
  }
  update(): void {
    super.update();
    if (this.spray_ != null) {
      this.spray_.pos$PointF(this.center$());
      this.spray_.visible_ = this.visible_;
    }
    if (this.pumpUpEmitterDist > 0 && this.ch != null && this.ch.pos !== this.lastPumpUpPos) {
      this.updateEmitters();
    }
  }
  onComplete$Animation(anim: MovieClip$Animation): void {
    super.onComplete$Animation(anim);
    if (anim === this.pumpAttack_) {
      this.triggerEmitters();
      this.idle();
      this.ch.onAttackComplete();
    } else if (anim === this.die_) {
      this.spray_.killAndErase();
    }
  }
}

export class GooSprite$GooParticle extends PixelParticle$Shrinking {
  static FACTORY: Emitter$Factory = null;
  _GooSprite$GooParticle(): this {
    this._PixelParticle$Shrinking();
    this.color$int(0);
    this.lifespan = Math.fround(0.3);
    this.acc.set$float$float(0, Math.fround(+50));
    return this;
  }
  reset$float$float(x: number, y: number): void {
    this.revive();
    this.x = x;
    this.y = y;
    this.left_ = this.lifespan;
    this.size_ = 4;
    this.speed_.polar(Math.fround(-Random.Float$float(PointF.PI)), Random.Float$float$float(32, 48));
  }
  update(): void {
    super.update();
    let p = Math.fround(this.left_ / this.lifespan);
    this.am = p > 0.5 ? Math.fround((Math.fround(1 - p)) * 2) : 1;
  }
  static $clinit() {
    GooSprite$GooParticle.FACTORY = new (GooSprite$GooParticle$1())()._Emitter$Factory();
  }
}

let $GooSprite$GooParticle$1: any = null;
/** An anonymous class (GooSprite.java:173). */
function GooSprite$GooParticle$1(): any {
  return $GooSprite$GooParticle$1 ??= $J.local(class extends Emitter$Factory {
    emit(emitter: Emitter, index: number, x: number, y: number): void {
      (emitter.recycle($J.cls(GooSprite$GooParticle))).reset$float$float(x, y);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.sprites.GooSprite$GooParticle$1', []);
}

$J.define(GooSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.GooSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_GooSprite' }, meths: { 'onComplete(com.watabou.noosa.MovieClip$Animation)': 'onComplete$Animation', 'play(com.watabou.noosa.MovieClip$Animation)': 'play$Animation' } });
$J.define(GooSprite$GooParticle, 'com.shatteredpixel.shatteredpixeldungeon.sprites.GooSprite$GooParticle', { kind: 'class', sup: 'com.watabou.noosa.particles.PixelParticle$Shrinking', ctors: { '': '_GooSprite$GooParticle' }, meths: { 'reset(float,float)': 'reset$float$float' }, clinit: true, lazy: ['FACTORY'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  ElmoParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.ElmoParticle');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Emitter$Factory = $J.load('com.watabou.noosa.particles.Emitter$Factory');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
});
