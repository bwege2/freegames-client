// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/DM100Sprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Assets$Sprites, Actor, Lightning, Speck, MovieClip$Animation, TextureFilm, Sample;

export class DM100Sprite extends MobSprite {
  _DM100Sprite(): this {
    this._MobSprite();
    this.texture(Assets$Sprites.DM100);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 16, 14);
    let c = this.texOffset();
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(1, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [(0 + c) | 0, (1 + c) | 0]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(12, true);
    this.run_.frames$TextureFilm$ObjectArr(frames, [(6 + c) | 0, (7 + c) | 0, (8 + c) | 0, (9 + c) | 0]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(12, false);
    this.attack.frames$TextureFilm$ObjectArr(frames, [(2 + c) | 0, (3 + c) | 0, (4 + c) | 0, (0 + c) | 0]);
    this.zap_ = new MovieClip$Animation()._MovieClip$Animation(8, false);
    this.zap_.frames$TextureFilm$ObjectArr(frames, [(5 + c) | 0, (5 + c) | 0, (1 + c) | 0]);
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(12, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [(10 + c) | 0, (11 + c) | 0, (12 + c) | 0, (13 + c) | 0, (14 + c) | 0, (15 + c) | 0]);
    this.play$Animation(this.idle_);
    return this;
  }
  texOffset(): number {
    return 0;
  }
  zap$int(pos: number): void {
    let enemy = Actor.findChar(pos);
    let origin = this.center$();
    if (this.flipHorizontal_) {
      origin.y = Math.fround(origin.y - Math.fround(6 * this.scale_.y));
      origin.x = Math.fround(origin.x - Math.fround(1 * this.scale_.x));
    } else {
      origin.y = Math.fround(origin.y - Math.fround(8 * this.scale_.y));
      origin.x = Math.fround(origin.x + Math.fround(1 * this.scale_.x));
    }
    if (enemy != null) {
      this.parent.add$Gizmo(new Lightning()._Lightning$PointF$PointF$Callback(origin, enemy.sprite_.destinationCenter(), new (DM100Sprite$1())().$o(this)));
    } else {
      this.parent.add$Gizmo(new Lightning()._Lightning$PointF$int$Callback(origin, pos, new (DM100Sprite$2())().$o(this)));
    }
    Sample.INSTANCE.play$Object(Assets$Sounds.LIGHTNING);
    super.zap$int(this.ch.pos);
    this.flash();
  }
  die(): void {
    this.emitter().burst(Speck.factory$int(Speck.WOOL), 5);
    super.die();
  }
  onComplete$Animation(anim: MovieClip$Animation): void {
    if (anim === this.zap_) {
      this.idle();
    }
    super.onComplete$Animation(anim);
  }
  blood(): number {
    return -120;
  }
}

export class DM100Sprite$Vault extends DM100Sprite {
  _DM100Sprite$Vault(): this {
    this._DM100Sprite();
    return this;
  }
  texOffset(): number {
    return 16;
  }
}

let $DM100Sprite$1: any = null;
/** An anonymous class (DM100Sprite.java:83). */
function DM100Sprite$1(): any {
  return $DM100Sprite$1 ??= $J.local(class extends JObject {
    call(): void {
      this.$outer.ch.next();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.sprites.DM100Sprite$1', ['com.watabou.utils.Callback']);
}

let $DM100Sprite$2: any = null;
/** An anonymous class (DM100Sprite.java:92). */
function DM100Sprite$2(): any {
  return $DM100Sprite$2 ??= $J.local(class extends JObject {
    call(): void {
      this.$outer.ch.next();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.sprites.DM100Sprite$2', ['com.watabou.utils.Callback']);
}

$J.define(DM100Sprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.DM100Sprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_DM100Sprite' }, meths: { 'onComplete(com.watabou.noosa.MovieClip$Animation)': 'onComplete$Animation', 'zap(int)': 'zap$int' } });
$J.define(DM100Sprite$Vault, 'com.shatteredpixel.shatteredpixeldungeon.sprites.DM100Sprite$Vault', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.DM100Sprite', ctors: { '': '_DM100Sprite$Vault' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Lightning = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Lightning');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
