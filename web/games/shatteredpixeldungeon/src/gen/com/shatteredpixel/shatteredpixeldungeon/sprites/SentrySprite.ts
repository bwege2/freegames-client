// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/SentrySprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Assets$Sprites, Actor, Beam$DeathRay, MagicMissile$MagicParticle, MagicMissile$WardParticle, DungeonTilemap, Game, MovieClip$Animation, Sample;

export class SentrySprite extends MobSprite {
  charging: MovieClip$Animation = null;
  chargeParticles: Emitter = null;
  baseY: number = 0;
  _SentrySprite(): this {
    this._MobSprite();
    this.baseY = NaN;
    this.texture(Assets$Sprites.SENTRY);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(1, true);
    let ofs = this.texOffset();
    this.idle_.frames$RectFArr([this.texture_.uvRect(Math.fround(Math.imul(ofs, 8)), 0, Math.fround(Math.imul(((ofs + 1) | 0), 8)), 15)]);
    this.run_ = this.idle_.clone();
    this.attack = this.idle_.clone();
    this.charging = this.idle_.clone();
    this.die_ = this.idle_.clone();
    this.zap_ = this.idle_.clone();
    this.play$Animation(this.idle_);
    return this;
  }
  zap$int(pos: number): void {
    this.idle();
    this.flash();
    this.emitter().burst(MagicMissile$WardParticle.UP, 2);
    if (Actor.findChar(pos) != null) {
      this.parent.add$Gizmo(new Beam$DeathRay()._Beam$DeathRay(this.center$(), Actor.findChar(pos).sprite_.center$()));
    } else {
      this.parent.add$Gizmo(new Beam$DeathRay()._Beam$DeathRay(this.center$(), DungeonTilemap.raisedTileCenterToWorld(pos)));
    }
    Sample.INSTANCE.play$Object(Assets$Sounds.RAY);
    (this.ch).onZapComplete();
  }
  link(ch: Char): void {
    super.link(ch);
    this.chargeParticles = this.centerEmitter();
    this.chargeParticles.autoKill = false;
    this.chargeParticles.pour(MagicMissile$MagicParticle.ATTRACTING, Math.fround(0.05));
    this.chargeParticles.on = this.curAnim === this.charging;
  }
  die(): void {
    super.die();
    if (this.chargeParticles != null) {
      this.chargeParticles.on = false;
    }
  }
  kill(): void {
    super.kill();
    if (this.chargeParticles != null) {
      this.chargeParticles.killAndErase();
    }
  }
  charge(): void {
    this.play$Animation(this.charging);
    if (this.visible_ && this.ch != null) {
      Sample.INSTANCE.play$Object(Assets$Sounds.CHARGEUP);
    }
  }
  play$Animation(anim: MovieClip$Animation): void {
    if (this.chargeParticles != null) {
      this.chargeParticles.on = anim === this.charging;
    }
    super.play$Animation(anim);
  }
  place(cell: number): void {
    super.place(cell);
    this.baseY = this.y;
  }
  turnTo(from: number, to: number): void {
  }
  update(): void {
    super.update();
    if (this.chargeParticles != null) {
      this.chargeParticles.pos$PointF(this.center$());
      this.chargeParticles.visible_ = this.visible_;
    }
    if (!this.paused_) {
      if ($J.Float_isNaN(this.baseY)) {
        this.baseY = this.y;
      }
      this.y = Math.fround(this.baseY + Math.fround(Math.sin(Game.timeTotal)));
      this.shadowOffset = Math.fround(0.25 - Math.fround(Math.fround(0.8) * Math.fround(Math.sin(Game.timeTotal))));
    }
  }
}

export class SentrySprite$Red extends SentrySprite {
  _SentrySprite$Red(): this {
    this._SentrySprite();
    return this;
  }
  texOffset(): number {
    return 0;
  }
}

export class SentrySprite$VaultScan extends SentrySprite {
  _SentrySprite$VaultScan(): this {
    this._SentrySprite();
    return this;
  }
  texOffset(): number {
    return 1;
  }
}

export class SentrySprite$VaultLaser extends SentrySprite {
  _SentrySprite$VaultLaser(): this {
    this._SentrySprite();
    return this;
  }
  texOffset(): number {
    return 2;
  }
}

$J.define(SentrySprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.SentrySprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_SentrySprite' }, meths: { 'play(com.watabou.noosa.MovieClip$Animation)': 'play$Animation', 'zap(int)': 'zap$int' } });
$J.define(SentrySprite$Red, 'com.shatteredpixel.shatteredpixeldungeon.sprites.SentrySprite$Red', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.SentrySprite', ctors: { '': '_SentrySprite$Red' } });
$J.define(SentrySprite$VaultScan, 'com.shatteredpixel.shatteredpixeldungeon.sprites.SentrySprite$VaultScan', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.SentrySprite', ctors: { '': '_SentrySprite$VaultScan' } });
$J.define(SentrySprite$VaultLaser, 'com.shatteredpixel.shatteredpixeldungeon.sprites.SentrySprite$VaultLaser', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.SentrySprite', ctors: { '': '_SentrySprite$VaultLaser' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Beam$DeathRay = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Beam$DeathRay');
  MagicMissile$MagicParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$MagicParticle');
  MagicMissile$WardParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$WardParticle');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  Game = $J.load('com.watabou.noosa.Game');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
