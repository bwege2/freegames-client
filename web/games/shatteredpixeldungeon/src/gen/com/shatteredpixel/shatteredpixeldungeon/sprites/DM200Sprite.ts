// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/DM200Sprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Assets$Sprites, DM200, MagicMissile, Speck, Messages, GLog, MovieClip$Animation, TextureFilm, Sample;

export class DM200Sprite extends MobSprite {
  _DM200Sprite(): this {
    this._MobSprite();
    this.texture(Assets$Sprites.DM200);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 21, 18);
    let c = this.texOffset();
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(10, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [(c + 0) | 0, (c + 1) | 0]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(10, true);
    this.run_.frames$TextureFilm$ObjectArr(frames, [(c + 2) | 0, (c + 3) | 0]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(15, false);
    this.attack.frames$TextureFilm$ObjectArr(frames, [(c + 4) | 0, (c + 5) | 0, (c + 6) | 0]);
    this.zap_ = new MovieClip$Animation()._MovieClip$Animation(15, false);
    this.zap_.frames$TextureFilm$ObjectArr(frames, [(c + 7) | 0, (c + 8) | 0, (c + 8) | 0, (c + 7) | 0]);
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(8, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [(c + 9) | 0, (c + 10) | 0, (c + 11) | 0]);
    this.play$Animation(this.idle_);
    return this;
  }
  texOffset(): number {
    return 0;
  }
  zap$int(cell: number): void {
    super.zap$int(cell);
    MagicMissile.boltFromChar(this.parent, (MagicMissile.SPECK + Speck.TOXIC) | 0, this, cell, new (DM200Sprite$1())().$o(this));
    Sample.INSTANCE.play$Object(Assets$Sounds.GAS);
    GLog.w(Messages.get$Class$String$ObjectArr($J.cls(DM200), 'vent', []), []);
  }
  place(cell: number): void {
    if (this.parent != null) {
      this.parent.bringToFront(this);
    }
    super.place(cell);
  }
  die(): void {
    this.emitter().burst(Speck.factory$int(Speck.WOOL), 8);
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

export class DM200Sprite$Vault extends DM200Sprite {
  _DM200Sprite$Vault(): this {
    this._DM200Sprite();
    return this;
  }
  texOffset(): number {
    return 24;
  }
}

let $DM200Sprite$1: any = null;
/** An anonymous class (DM200Sprite.java:75). */
function DM200Sprite$1(): any {
  return $DM200Sprite$1 ??= $J.local(class extends JObject {
    call(): void {
      (this.$outer.ch).onZapComplete();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.sprites.DM200Sprite$1', ['com.watabou.utils.Callback']);
}

$J.define(DM200Sprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.DM200Sprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_DM200Sprite' }, meths: { 'onComplete(com.watabou.noosa.MovieClip$Animation)': 'onComplete$Animation', 'zap(int)': 'zap$int' } });
$J.define(DM200Sprite$Vault, 'com.shatteredpixel.shatteredpixeldungeon.sprites.DM200Sprite$Vault', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.DM200Sprite', ctors: { '': '_DM200Sprite$Vault' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  DM200 = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DM200');
  MagicMissile = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
