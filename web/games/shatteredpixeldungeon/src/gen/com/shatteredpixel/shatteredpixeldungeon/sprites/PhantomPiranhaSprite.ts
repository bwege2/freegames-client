// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/PhantomPiranhaSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sprites, Speck, GameScene, MovieClip$Animation, TextureFilm;

export class PhantomPiranhaSprite extends MobSprite {
  sparkles: Emitter = null;
  _PhantomPiranhaSprite(): this {
    this._MobSprite();
    this.renderShadow = false;
    this.perspectiveRaise = Math.fround(0.2);
    this.texture(Assets$Sprites.PIRANHA);
    let frames = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, 12, 16);
    let c = 21;
    this.idle_ = new MovieClip$Animation()._MovieClip$Animation(8, true);
    this.idle_.frames$TextureFilm$ObjectArr(frames, [(c + 0) | 0, (c + 1) | 0, (c + 2) | 0, (c + 1) | 0]);
    this.run_ = new MovieClip$Animation()._MovieClip$Animation(20, true);
    this.run_.frames$TextureFilm$ObjectArr(frames, [(c + 0) | 0, (c + 1) | 0, (c + 2) | 0, (c + 1) | 0]);
    this.attack = new MovieClip$Animation()._MovieClip$Animation(20, false);
    this.attack.frames$TextureFilm$ObjectArr(frames, [(c + 3) | 0, (c + 4) | 0, (c + 5) | 0, (c + 6) | 0, (c + 7) | 0, (c + 8) | 0, (c + 9) | 0, (c + 10) | 0, (c + 11) | 0]);
    this.die_ = new MovieClip$Animation()._MovieClip$Animation(4, false);
    this.die_.frames$TextureFilm$ObjectArr(frames, [(c + 12) | 0, (c + 13) | 0, (c + 14) | 0]);
    this.play$Animation(this.idle_);
    return this;
  }
  link(ch: Char): void {
    super.link(ch);
    this.renderShadow = false;
    if (this.sparkles == null) {
      this.sparkles = this.emitter();
      this.sparkles.pour(Speck.factory$int(Speck.LIGHT), 0.5);
    }
  }
  update(): void {
    super.update();
    if (this.sparkles != null) {
      this.sparkles.visible_ = this.visible_;
    }
  }
  die(): void {
    super.die();
    if (this.sparkles != null) {
      this.sparkles.on = false;
    }
  }
  kill(): void {
    super.kill();
    if (this.sparkles != null) {
      this.sparkles.on = false;
    }
  }
  onComplete$Animation(anim: MovieClip$Animation): void {
    super.onComplete$Animation(anim);
    if (anim === this.attack) {
      GameScene.ripple(this.ch.pos);
    }
  }
}

$J.define(PhantomPiranhaSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.PhantomPiranhaSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MobSprite', ctors: { '': '_PhantomPiranhaSprite' }, meths: { 'onComplete(com.watabou.noosa.MovieClip$Animation)': 'onComplete$Animation' } });
$J.module(() => {
  Assets$Sprites = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sprites');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  MovieClip$Animation = $J.load('com.watabou.noosa.MovieClip$Animation');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
});
