// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/ShamanSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Assets$Sprites, MagicMissile, MovieClip$Animation, TextureFilm, Sample;

export class ShamanSprite extends MobSprite {
  boltType: number = 0;
  _ShamanSprite(): this {
    this._MobSprite();
    let c = this.texOffset();
    this.texture(Assets$Sprites.SHAMAN);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 12, 15);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(2, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [(c + 0) | 0, (c + 0) | 0, (c + 0) | 0, (c + 1) | 0, (c + 0) | 0, (c + 0) | 0, (c + 1) | 0, (c + 1) | 0]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(12, true);
    this.run_.frames$TextureFilm$ObjectArr(frames, [(c + 4) | 0, (c + 5) | 0, (c + 6) | 0, (c + 7) | 0]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(12, false);
    this.attack.frames$TextureFilm$ObjectArr(frames, [(c + 2) | 0, (c + 3) | 0, (c + 0) | 0]);
    this.zap_ = this.attack.clone();
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(12, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [(c + 8) | 0, (c + 9) | 0, (c + 10) | 0]);
    this.play$Animation(this.idle_);
    return this;
  }
  zap$int(cell: number): void {
    super.zap$int(cell);
    MagicMissile.boltFromChar(this.parent, this.boltType, this, cell, new (ShamanSprite$1())().$o(this));
    Sample.INSTANCE.play$Object(Assets$Sounds.ZAP);
  }
  onComplete$Animation(anim: MovieClip$Animation): void {
    if (anim === this.zap_) {
      this.idle();
    }
    super.onComplete$Animation(anim);
  }
}

export class ShamanSprite$Red extends ShamanSprite {
  _ShamanSprite$Red(): this {
    this._ShamanSprite();
    this.boltType = MagicMissile.SHAMAN_RED;
    return this;
  }
  texOffset(): number {
    return 0;
  }
}

export class ShamanSprite$Blue extends ShamanSprite {
  _ShamanSprite$Blue(): this {
    this._ShamanSprite();
    this.boltType = MagicMissile.SHAMAN_BLUE;
    return this;
  }
  texOffset(): number {
    return 21;
  }
}

export class ShamanSprite$Purple extends ShamanSprite {
  _ShamanSprite$Purple(): this {
    this._ShamanSprite();
    this.boltType = MagicMissile.SHAMAN_PURPLE;
    return this;
  }
  texOffset(): number {
    return 42;
  }
}

export class ShamanSprite$Vault extends ShamanSprite {
  _ShamanSprite$Vault(): this {
    this._ShamanSprite();
    this.boltType = MagicMissile.SHAMAN_ELMO;
    return this;
  }
  texOffset(): number {
    return 63;
  }
}

let $ShamanSprite$1: any = null;
/** An anonymous class (ShamanSprite.java:71). */
function ShamanSprite$1(): any {
  return $ShamanSprite$1 ??= $J.local(class extends JObject {
    call(): void {
      (this.$outer.ch).onZapComplete();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.sprites.ShamanSprite$1', ['com.watabou.utils.Callback']);
}

$J.define(ShamanSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.ShamanSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_ShamanSprite' }, meths: { 'onComplete(com.watabou.noosa.MovieClip$Animation)': 'onComplete$Animation', 'zap(int)': 'zap$int' } });
$J.define(ShamanSprite$Red, 'com.shatteredpixel.shatteredpixeldungeon.sprites.ShamanSprite$Red', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.ShamanSprite', ctors: { '': '_ShamanSprite$Red' } });
$J.define(ShamanSprite$Blue, 'com.shatteredpixel.shatteredpixeldungeon.sprites.ShamanSprite$Blue', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.ShamanSprite', ctors: { '': '_ShamanSprite$Blue' } });
$J.define(ShamanSprite$Purple, 'com.shatteredpixel.shatteredpixeldungeon.sprites.ShamanSprite$Purple', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.ShamanSprite', ctors: { '': '_ShamanSprite$Purple' } });
$J.define(ShamanSprite$Vault, 'com.shatteredpixel.shatteredpixeldungeon.sprites.ShamanSprite$Vault', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.ShamanSprite', ctors: { '': '_ShamanSprite$Vault' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  MagicMissile = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
