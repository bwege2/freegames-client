// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/EyeSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Assets$Sprites, Actor, Beam$DeathRay, MagicMissile$MagicParticle, DungeonTilemap, MovieClip$Animation, TextureFilm, Sample;

export class EyeSprite extends MobSprite {
  zapPos: number = 0;
  charging: MovieClip$Animation = null;
  chargeParticles: Emitter = null;
  _EyeSprite(): this {
    this._MobSprite();
    this.texture(Assets$Sprites.EYE);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 16, 18);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(8, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [0, 1, 2]);
    this.charging = new MovieClip$Animation()._MovieClip$Animation(12, true);
    this.charging.frames$TextureFilm$ObjectArr(frames, [3, 4]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(12, true);
    this.run_.frames$TextureFilm$ObjectArr(frames, [5, 6]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(8, false);
    this.attack.frames$TextureFilm$ObjectArr(frames, [4, 3]);
    this.zap_ = this.attack.clone();
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(8, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [7, 8, 9]);
    this.play$Animation(this.idle_);
    return this;
  }
  link(ch: Char): void {
    super.link(ch);
    this.chargeParticles = this.centerEmitter();
    this.chargeParticles.autoKill = false;
    this.chargeParticles.pour(MagicMissile$MagicParticle.ATTRACTING, Math.fround(0.05));
    this.chargeParticles.on = false;
    if ((ch).beamCharged) {
      this.play$Animation(this.charging);
    }
  }
  update(): void {
    super.update();
    if (this.chargeParticles != null) {
      this.chargeParticles.pos$PointF(this.center$());
      this.chargeParticles.visible_ = this.visible_;
    }
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
  charge(pos: number): void {
    this.turnTo(this.ch.pos, pos);
    this.play$Animation(this.charging);
    if (this.visible_) {
      Sample.INSTANCE.play$Object(Assets$Sounds.CHARGEUP);
    }
  }
  play$Animation(anim: MovieClip$Animation): void {
    if (this.chargeParticles != null) {
      this.chargeParticles.on = anim === this.charging;
    }
    super.play$Animation(anim);
  }
  zap$int(pos: number): void {
    this.zapPos = pos;
    super.zap$int(pos);
  }
  onComplete$Animation(anim: MovieClip$Animation): void {
    super.onComplete$Animation(anim);
    if (anim === this.zap_) {
      this.idle();
      if (Actor.findChar(this.zapPos) != null) {
        this.parent.add$Gizmo(new Beam$DeathRay()._Beam$DeathRay(this.center$(), Actor.findChar(this.zapPos).sprite_.center$()));
      } else {
        this.parent.add$Gizmo(new Beam$DeathRay()._Beam$DeathRay(this.center$(), DungeonTilemap.raisedTileCenterToWorld(this.zapPos)));
      }
      Sample.INSTANCE.play$Object(Assets$Sounds.RAY);
      (this.ch).deathGaze();
      this.ch.next();
    } else if (anim === this.die_) {
      this.chargeParticles.killAndErase();
    }
  }
}

$J.define(EyeSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.EyeSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_EyeSprite' }, meths: { 'onComplete(com.watabou.noosa.MovieClip$Animation)': 'onComplete$Animation', 'zap(int)': 'zap$int', 'play(com.watabou.noosa.MovieClip$Animation)': 'play$Animation' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Beam$DeathRay = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Beam$DeathRay');
  MagicMissile$MagicParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$MagicParticle');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
