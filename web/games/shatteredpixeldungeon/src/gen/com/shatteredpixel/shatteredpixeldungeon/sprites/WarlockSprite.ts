// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/WarlockSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class WarlockSprite extends MobSprite {
  _WarlockSprite(): this {
    this._MobSprite();
    this.texture(Assets$Sprites.WARLOCK);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 12, 15);
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(2, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [0, 0, 0, 1, 0, 0, 1, 1]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(15, true);
    this.run_.frames$TextureFilm$ObjectArr(frames, [0, 2, 3, 4]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(12, false);
    this.attack.frames$TextureFilm$ObjectArr(frames, [0, 5, 6]);
    this.zap_ = this.attack.clone();
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(15, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [0, 7, 8, 8, 9, 10]);
    this.play$Animation(this.idle_);
    return this;
  }
  zap$int(cell: number): void {
    super.zap$int(cell);
    MagicMissile.boltFromChar(this.parent, MagicMissile.SHADOW, this, cell, new (WarlockSprite$1())().$o(this));
    Sample.INSTANCE.play$Object(Assets$Sounds.ZAP);
  }
  onComplete$Animation(anim: MovieClip$Animation): void {
    if (anim === this.zap_) {
      this.idle();
    }
    super.onComplete$Animation(anim);
  }
}

let $WarlockSprite$1: any = null;
/** An anonymous class (WarlockSprite.java:65). */
function WarlockSprite$1(): any {
  return $WarlockSprite$1 ??= $J.local(class extends JObject {
    call(): void {
      (this.$outer.ch).onZapComplete();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.sprites.WarlockSprite$1', ['com.watabou.utils.Callback']);
}

$J.define(WarlockSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.WarlockSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_WarlockSprite' }, meths: { 'onComplete(com.watabou.noosa.MovieClip$Animation)': 'onComplete$Animation', 'zap(int)': 'zap$int' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  MagicMissile = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.MagicMissile');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
