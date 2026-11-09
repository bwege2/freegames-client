// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/WardSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Assets$Sprites, Actor, Beam$DeathRay, MagicMissile$WardParticle, WandOfWarding$Ward, DungeonTilemap, Game, MovieClip$Animation, Sample, AlphaTweener;

export class WardSprite extends MobSprite {
  tierIdles: MovieClip$Animation[] = null;
  baseY: number = 0;
  _WardSprite(): this {
    this._MobSprite();
    this.tierIdles = $J.newArray(7, null);
    this.baseY = NaN;
    this.texture(Assets$Sprites.WARDS);
    this.tierIdles[1] = new MovieClip$Animation()._MovieClip$Animation(1, true);
    this.tierIdles[1].frames$RectFArr([this.texture_.uvRect(0, 0, 9, 10)]);
    this.tierIdles[2] = new MovieClip$Animation()._MovieClip$Animation(1, true);
    this.tierIdles[2].frames$RectFArr([this.texture_.uvRect(10, 0, 21, 12)]);
    this.tierIdles[3] = new MovieClip$Animation()._MovieClip$Animation(1, true);
    this.tierIdles[3].frames$RectFArr([this.texture_.uvRect(22, 0, 37, 16)]);
    this.tierIdles[4] = new MovieClip$Animation()._MovieClip$Animation(1, true);
    this.tierIdles[4].frames$RectFArr([this.texture_.uvRect(38, 0, 44, 13)]);
    this.tierIdles[5] = new MovieClip$Animation()._MovieClip$Animation(1, true);
    this.tierIdles[5].frames$RectFArr([this.texture_.uvRect(45, 0, 51, 15)]);
    this.tierIdles[6] = new MovieClip$Animation()._MovieClip$Animation(1, true);
    this.tierIdles[6].frames$RectFArr([this.texture_.uvRect(52, 0, 60, 15)]);
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
  turnTo(from: number, to: number): void {
  }
  die(): void {
    super.die();
    this.play$Animation$boolean(this.idle_, true);
    this.emitter().burst(MagicMissile$WardParticle.UP, 10);
    this.parent.add$Gizmo(new (WardSprite$1())().$o(this)._AlphaTweener(this, 0, 2));
  }
  resetColor(): void {
    super.resetColor();
    if (this.ch instanceof WandOfWarding$Ward) {
      let ward = this.ch;
      if (ward.tier_ <= 3) {
        this.brightness(Math.max(Math.fround(0.2), Math.fround(1 - (Math.fround(ward.totalZaps / Math.fround(((Math.imul(2, ward.tier_) - 1) | 0)))))));
      }
    }
  }
  linkVisuals(ch: Char): void {
    if (ch instanceof WandOfWarding$Ward) {
      this.updateTier((ch).tier_);
    } else {
      this.updateTier(5);
    }
  }
  updateTier(tier: number): void {
    this.idle_ = this.tierIdles[tier];
    this.run_ = this.idle_.clone();
    this.attack = this.idle_.clone();
    this.die_ = this.idle_.clone();
    if (this.parent != null) {
      this.parent.sendToBack(this);
    }
    this.resetColor();
    if (this.ch != null) {
      this.place(this.ch.pos);
    }
    this.idle();
    if (tier <= 3) {
      this.shadowWidth = this.shadowHeight = 1;
      this.perspectiveRaise = Math.fround((Math.fround(16 - this.height())) / 32);
    } else {
      this.shadowWidth = Math.fround(1.2);
      this.shadowHeight = 0.25;
      this.perspectiveRaise = Math.fround(6 / 16);
    }
  }
  place(cell: number): void {
    super.place(cell);
    this.baseY = this.y;
  }
  update(): void {
    super.update();
    if (this.perspectiveRaise >= Math.fround(6 / 16) && !this.paused_) {
      if ($J.Float_isNaN(this.baseY)) {
        this.baseY = this.y;
      }
      this.y = Math.fround(this.baseY + Math.fround(Math.sin(Game.timeTotal)));
      this.shadowOffset = Math.fround(0.25 - Math.fround(Math.fround(0.8) * Math.fround(Math.sin(Game.timeTotal))));
    }
  }
  blood(): number {
    return -3394561;
  }
}

let $WardSprite$1: any = null;
/** An anonymous class (WardSprite.java:89). */
function WardSprite$1(): any {
  return $WardSprite$1 ??= $J.local(class extends AlphaTweener {
    onComplete(): void {
      this.$outer.killAndErase();
      this.parent.erase(this);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.sprites.WardSprite$1', []);
}

$J.define(WardSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.WardSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_WardSprite' }, meths: { 'zap(int)': 'zap$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Beam$DeathRay = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Beam$DeathRay');
  MagicMissile$WardParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile$WardParticle');
  WandOfWarding$Ward = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfWarding$Ward');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  Game = $J.load('com.watabou.noosa.Game');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  AlphaTweener = $J.load('com.watabou.noosa.tweeners.AlphaTweener');
});
