// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/DM201Sprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Assets$Sprites, DM201, MagicMissile, Speck, Messages, GLog, MovieClip$Animation, TextureFilm, Sample;

export class DM201Sprite extends MobSprite {
  _DM201Sprite(): this {
    this._MobSprite();
    this.texture(Assets$Sprites.DM200);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 21, 18);
    let c = 12;
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(2, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [(c + 0) | 0, (c + 1) | 0]);
    this.run_ = this.idle_.clone();
    this.attack = new MovieClip$Animation()._MovieClip$Animation(15, false);
    this.attack.frames$TextureFilm$ObjectArr(frames, [(c + 4) | 0, (c + 5) | 0, (c + 6) | 0]);
    this.zap_ = new MovieClip$Animation()._MovieClip$Animation(15, false);
    this.zap_.frames$TextureFilm$ObjectArr(frames, [(c + 7) | 0, (c + 8) | 0, (c + 8) | 0, (c + 7) | 0]);
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(8, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [(c + 9) | 0, (c + 10) | 0, (c + 11) | 0]);
    this.play$Animation(this.idle_);
    return this;
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
  zap$int(cell: number): void {
    super.zap$int(cell);
    MagicMissile.boltFromChar(this.parent, MagicMissile.CORROSION, this, cell, new (DM201Sprite$1())().$o(this));
    Sample.INSTANCE.play$Object$float$float(Assets$Sounds.MISS, 1, 1.5);
    GLog.w(Messages.get$Class$String$ObjectArr($J.cls(DM201), 'vent', []), []);
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

let $DM201Sprite$1: any = null;
/** An anonymous class (DM201Sprite.java:82). */
function DM201Sprite$1(): any {
  return $DM201Sprite$1 ??= $J.local(class extends JObject {
    call(): void {
      Sample.INSTANCE.play$Object(Assets$Sounds.GAS);
      (this.$outer.ch).onZapComplete();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.sprites.DM201Sprite$1', ['com.watabou.utils.Callback']);
}

$J.define(DM201Sprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.DM201Sprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_DM201Sprite' }, meths: { 'onComplete(com.watabou.noosa.MovieClip$Animation)': 'onComplete$Animation', 'zap(int)': 'zap$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  DM201 = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DM201');
  MagicMissile = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
