// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/noosa/MovieClip.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../jre/index.ts';
import { Image } from './Image.ts';

let Game;

export class MovieClip extends Image {
  curAnim: MovieClip$Animation = null;
  curFrame: number = 0;
  frameTimer: number = 0;
  finished: boolean = false;
  paused_: boolean = false;
  listener: MovieClip$Listener = null;
  $init_MovieClip() {
    this.paused_ = false;
  }
  _MovieClip$(): this {
    this._Image$();
    this.$init_MovieClip();
    return this;
  }
  _MovieClip$Object(tx: any): this {
    this._Image$Object(tx);
    this.$init_MovieClip();
    return this;
  }
  update(): void {
    super.update();
    if (!this.paused_) {
      this.updateAnimation();
    }
  }
  looping(): boolean {
    return this.curAnim != null && this.curAnim.looped;
  }
  updateAnimation(): void {
    if (this.curAnim != null && this.curAnim.delay_ > Math.fround(0) && (this.curAnim.looped || !this.finished)) {
      let lastFrame = this.curFrame;
      this.frameTimer = Math.fround(this.frameTimer + Game.elapsed);
      while (this.frameTimer > this.curAnim.delay_) {
        this.frameTimer = Math.fround(this.frameTimer - this.curAnim.delay_);
        if (this.curFrame >= ((this.curAnim.frames.length - 1) | 0)) {
          if (this.curAnim.looped) {
            this.curFrame = 0;
          } else {
            this.curFrame = (this.curAnim.frames.length - 1) | 0;
            this.frameTimer = 0;
          }
          this.finished = true;
          if (this.listener != null) {
            this.listener.onComplete$Animation(this.curAnim);
            if (this.curAnim == null) {
              return;
            }
          }
        } else {
          this.curFrame++;
        }
      }
      if (this.curFrame !== lastFrame) {
        this.frame$RectF(this.curAnim.frames[this.curFrame]);
      }
    }
  }
  play$Animation(anim: MovieClip$Animation): void {
    this.play$Animation$boolean(anim, false);
  }
  play$Animation$boolean(anim: MovieClip$Animation, force: boolean): void {
    if (!force && (this.curAnim != null) && (this.curAnim === anim) && (this.curAnim.looped || !this.finished)) {
      return;
    }
    this.curAnim = anim;
    this.curFrame = 0;
    this.finished = false;
    this.frameTimer = 0;
    if (anim != null) {
      this.frame$RectF(anim.frames[this.curFrame]);
    }
  }
}

export class MovieClip$Animation extends JObject {
  delay_: number = 0;
  frames: RectF[] = null;
  looped: boolean = false;
  _MovieClip$Animation(fps: number, looped: boolean): this {
    this.delay_ = Math.fround(1 / fps);
    this.looped = looped;
    return this;
  }
  frames$RectFArr(frames: RectF[]): MovieClip$Animation {
    this.frames = frames;
    return this;
  }
  frames$TextureFilm$ObjectArr(film: TextureFilm, frames: any[]): MovieClip$Animation {
    this.frames = $J.newArray(frames.length, null);
    for (let i = 0; i < frames.length; i++) {
      this.frames[i] = film.get$Object(frames[i]);
    }
    return this;
  }
  clone(): MovieClip$Animation {
    return new MovieClip$Animation()._MovieClip$Animation($J.roundf(Math.fround(1 / this.delay_)), this.looped).frames$RectFArr(this.frames);
  }
}

export class MovieClip$Listener {
}

$J.define(MovieClip, 'com.watabou.noosa.MovieClip', { kind: 'class', sup: 'com.watabou.noosa.Image', ctors: { 'java.lang.Object': '_MovieClip$Object', '': '_MovieClip$' }, meths: { 'play(com.watabou.noosa.MovieClip$Animation,boolean)': 'play$Animation$boolean', 'play(com.watabou.noosa.MovieClip$Animation)': 'play$Animation' } });
$J.define(MovieClip$Animation, 'com.watabou.noosa.MovieClip$Animation', { kind: 'class', sup: 'java.lang.Object', ctors: { 'int,boolean': '_MovieClip$Animation' }, meths: { 'frames(com.watabou.noosa.TextureFilm,java.lang.Object[])': 'frames$TextureFilm$ObjectArr', 'frames(com.watabou.utils.RectF[])': 'frames$RectFArr' } });
$J.define(MovieClip$Listener, 'com.watabou.noosa.MovieClip$Listener', { kind: 'interface', meths: { 'onComplete(com.watabou.noosa.MovieClip$Animation)': 'onComplete$Animation' } });
$J.module(() => {
  Game = $J.load('com.watabou.noosa.Game');
});
