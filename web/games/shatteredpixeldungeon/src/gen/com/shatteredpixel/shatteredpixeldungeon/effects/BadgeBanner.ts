// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/BadgeBanner.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, HashMap, JEnum } from '../../../../../jre/index.ts';
import { Image } from '../../../watabou/noosa/Image.ts';

let Assets$Interfaces, Assets$Sounds, Badges$Badge, Speck, TextureCache, Game, TextureFilm, Sample, Point, PointF;

export class BadgeBanner extends Image {
  state_: BadgeBanner$State = null;
  static readonly DEFAULT_SCALE: number = 3;
  static readonly SIZE: number = 16;
  static readonly FADE_IN_TIME: number = 0.25;
  static readonly STATIC_TIME: number = 1;
  static readonly FADE_OUT_TIME: number = 1.75;
  index: number = 0;
  time: number = 0;
  static atlas: TextureFilm = null;
  static showing: ArrayList<BadgeBanner> = null;
  static highlightPositions: HashMap<number, Point> = null;
  _BadgeBanner(index: number): this {
    this._Image$Object(Assets$Interfaces.BADGES);
    if (BadgeBanner.atlas == null) {
      BadgeBanner.atlas = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, BadgeBanner.SIZE, BadgeBanner.SIZE);
    }
    this.setup(index);
    return this;
  }
  setup(index: number): void {
    this.index = index;
    this.frame$RectF(BadgeBanner.atlas.get$Object(index));
    this.origin.set$float$float(Math.fround(this.width_ / 2), Math.fround(this.height_ / 2));
    this.alpha$float(0);
    this.scale_.set$float(Math.fround(2 * BadgeBanner.DEFAULT_SCALE));
    this.state_ = BadgeBanner$State.FADE_IN;
    this.time = BadgeBanner.FADE_IN_TIME;
    Sample.INSTANCE.play$Object(Assets$Sounds.BADGE);
  }
  update(): void {
    super.update();
    this.time = Math.fround(this.time - Game.elapsed);
    if (this.time >= Math.fround(0)) {
      {
        let p: number;
        switch (this.state_) {
          case BadgeBanner$State.FADE_IN:
            p = Math.fround(this.time / BadgeBanner.FADE_IN_TIME);
            this.scale_.set$float(Math.fround((Math.fround(1 + p)) * BadgeBanner.DEFAULT_SCALE));
            this.alpha$float(Math.fround(1 - p));
            break;
          case BadgeBanner$State.STATIC:
            break;
          case BadgeBanner$State.FADE_OUT:
            this.alpha$float(Math.fround(this.time / BadgeBanner.FADE_OUT_TIME));
            break;
        }
      }
    } else {
      switch (this.state_) {
        case BadgeBanner$State.FADE_IN:
          this.time = BadgeBanner.STATIC_TIME;
          this.state_ = BadgeBanner$State.STATIC;
          this.scale_.set$float(BadgeBanner.DEFAULT_SCALE);
          this.alpha$float(1);
          BadgeBanner.highlight(this, this.index);
          break;
        case BadgeBanner$State.STATIC:
          this.time = BadgeBanner.FADE_OUT_TIME;
          this.state_ = BadgeBanner$State.FADE_OUT;
          break;
        case BadgeBanner$State.FADE_OUT:
          this.killAndErase();
          break;
      }
    }
  }
  kill(): void {
    BadgeBanner.showing.remove(this);
    super.kill();
  }
  destroy(): void {
    BadgeBanner.showing.remove(this);
    super.destroy();
  }
  static highlight(image: Image, index: number): void {
    let p = new PointF()._PointF$();
    if (BadgeBanner.highlightPositions.containsKey(index)) {
      p.x = Math.fround(BadgeBanner.highlightPositions.get(index).x * image.scale_.x);
      p.y = Math.fround(BadgeBanner.highlightPositions.get(index).y * image.scale_.y);
    } else {
      let tx = TextureCache.get(Assets$Interfaces.BADGES);
      let size = 16;
      let cols = $J.idiv(tx.width_, size);
      let row = $J.idiv(index, cols);
      let col = index % cols;
      let x = 3;
      let y = 4;
      let bgColor = tx.getPixel((Math.imul(col, size) + x) | 0, (Math.imul(row, size) + y) | 0);
      let curColor = 0;
      for (x = 3; x <= 12; x++) {
        curColor = tx.getPixel((Math.imul(col, size) + x) | 0, (Math.imul(row, size) + y) | 0);
        if (curColor !== bgColor) {
          break;
        }
      }
      if (curColor === bgColor) {
        y++;
        for (x = 3; x <= 12; x++) {
          curColor = tx.getPixel((Math.imul(col, size) + x) | 0, (Math.imul(row, size) + y) | 0);
          if (curColor !== bgColor) {
            break;
          }
        }
      }
      p.x = Math.fround(x * image.scale_.x);
      p.y = Math.fround(y * image.scale_.y);
      BadgeBanner.highlightPositions.put(index, new Point()._Point$int$int(x, y));
    }
    p.offset$float$float(Math.fround(Math.fround(-image.origin.x) * (Math.fround(image.scale_.x - 1))), Math.fround(Math.fround(-image.origin.y) * (Math.fround(image.scale_.y - 1))));
    p.offset$PointF(image.point$());
    let star = new Speck()._Speck();
    star.reset(0, p.x, p.y, Speck.DISCOVER);
    star.camera_ = image.camera();
    image.parent.add$Gizmo(star);
  }
  static show(image: number): BadgeBanner {
    let banner = new BadgeBanner()._BadgeBanner(image);
    BadgeBanner.showing.add(banner);
    return banner;
  }
  static isShowingBadges(): boolean {
    return !BadgeBanner.showing.isEmpty();
  }
  static image(index: number): Image {
    let image = new Image()._Image$Object(Assets$Interfaces.BADGES);
    if (BadgeBanner.atlas == null) {
      BadgeBanner.atlas = new TextureFilm()._TextureFilm$Object$int$int(image.texture_, 16, 16);
    }
    image.frame$RectF(BadgeBanner.atlas.get$Object(index));
    return image;
  }
  static $clinit() {
    BadgeBanner.showing = new ArrayList();
    BadgeBanner.highlightPositions = new HashMap();
    BadgeBanner.highlightPositions.put(Badges$Badge.MASTERY_COMBO.image_, new Point()._Point$int$int(3, 7));
  }
}

export class BadgeBanner$State extends JEnum {
  static FADE_IN: BadgeBanner$State = null;
  static STATIC: BadgeBanner$State = null;
  static FADE_OUT: BadgeBanner$State = null;
  static $VALUES: BadgeBanner$State[] = null;
  _BadgeBanner$State($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): BadgeBanner$State[] { return BadgeBanner$State.$VALUES.slice(); }
  static valueOf(name: string): BadgeBanner$State { return $J.enumValueOf(BadgeBanner$State, name); }
  static $clinit() {
    BadgeBanner$State.FADE_IN = new BadgeBanner$State()._BadgeBanner$State('FADE_IN', 0);
    BadgeBanner$State.STATIC = new BadgeBanner$State()._BadgeBanner$State('STATIC', 1);
    BadgeBanner$State.FADE_OUT = new BadgeBanner$State()._BadgeBanner$State('FADE_OUT', 2);
    BadgeBanner$State.$VALUES = [BadgeBanner$State.FADE_IN, BadgeBanner$State.STATIC, BadgeBanner$State.FADE_OUT];
  }
}

$J.define(BadgeBanner, 'com.shatteredpixel.shatteredpixeldungeon.effects.BadgeBanner', { kind: 'class', sup: 'com.watabou.noosa.Image', ctors: { 'int': '_BadgeBanner' }, clinit: true, lazy: ['atlas', 'showing', 'highlightPositions'] });
$J.define(BadgeBanner$State, 'com.shatteredpixel.shatteredpixeldungeon.effects.BadgeBanner$State', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_BadgeBanner$State' }, clinit: true, lazy: ['$VALUES', 'FADE_IN', 'STATIC', 'FADE_OUT'] });
$J.module(() => {
  Assets$Interfaces = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Interfaces');
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges$Badge = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges$Badge');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  TextureCache = $J.load('com.watabou.gltextures.TextureCache');
  Game = $J.load('com.watabou.noosa.Game');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Point = $J.load('com.watabou.utils.Point');
  PointF = $J.load('com.watabou.utils.PointF');
});
