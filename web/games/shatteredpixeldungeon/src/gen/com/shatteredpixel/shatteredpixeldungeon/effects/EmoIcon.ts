// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/EmoIcon.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Image } from '../../../watabou/noosa/Image.ts';

let GameScene, PixelScene, Icons, Game, PointF, Random;

export class EmoIcon extends Image {
  maxSize: number = 0;
  timeScale: number = 0;
  growing: boolean = false;
  owner: CharSprite = null;
  _EmoIcon(owner: CharSprite): this {
    this._Image$();
    this.maxSize = 2;
    this.timeScale = 1;
    this.growing = true;
    this.owner = owner;
    GameScene.add$EmoIcon(this);
    return this;
  }
  update(): void {
    super.update();
    if (this.visible_) {
      if (this.growing) {
        this.scale_.set$float(Math.min(Math.fround(this.scale_.x + Math.fround(Game.elapsed * this.timeScale)), this.maxSize));
        if (this.scale_.x >= this.maxSize) {
          this.growing = false;
        }
      } else {
        this.scale_.set$float(Math.max(Math.fround(this.scale_.x - Math.fround(Game.elapsed * this.timeScale)), 1));
        if (this.scale_.x <= Math.fround(1)) {
          this.growing = true;
        }
      }
      if (this.camera_ != null) {
        let center = this.centerPoint();
        this.x = PixelScene.align$Camera$float(this.camera_, Math.fround(Math.fround(this.owner.x + this.owner.width()) - center.x));
        this.y = PixelScene.align$Camera$float(this.camera_, Math.fround(this.owner.y - center.y));
      }
    }
  }
  centerPoint(): PointF {
    return new PointF()._PointF$float$float(Math.fround(this.width() / 2), Math.fround(this.height() / 2));
  }
}

export class EmoIcon$Sleep extends EmoIcon {
  _EmoIcon$Sleep(owner: CharSprite): this {
    this._EmoIcon(owner);
    this.copy(Icons.get$Icons(Icons.SLEEP));
    this.maxSize = Math.fround(1.2);
    this.timeScale = 0.5;
    this.scale_.set$float(Random.Float$float$float(1, this.maxSize));
    this.x = Math.fround(Math.fround(owner.x + owner.width_) - Math.fround(this.width_ / 2));
    this.y = Math.fround(owner.y - this.height_);
    return this;
  }
  centerPoint(): PointF {
    return new PointF()._PointF$float$float(Math.fround(this.width() / 2), Math.fround(4 + Math.fround(this.height() / 2)));
  }
}

export class EmoIcon$Alert extends EmoIcon {
  _EmoIcon$Alert(owner: CharSprite): this {
    this._EmoIcon(owner);
    this.copy(Icons.get$Icons(Icons.ALERT));
    this.maxSize = Math.fround(1.3);
    this.timeScale = 2;
    this.scale_.set$float(Random.Float$float$float(1, this.maxSize));
    this.x = Math.fround(Math.fround(owner.x + owner.width_) - Math.fround(this.width_ / 2));
    this.y = Math.fround(owner.y - this.height_);
    return this;
  }
  centerPoint(): PointF {
    return new PointF()._PointF$float$float(Math.fround(2.5 + Math.fround(0.25 * this.width())), Math.fround(2.5 + Math.fround(0.75 * this.height())));
  }
}

export class EmoIcon$Investigate extends EmoIcon {
  _EmoIcon$Investigate(owner: CharSprite): this {
    this._EmoIcon(owner);
    this.copy(Icons.get$Icons(Icons.INVESTIGATE));
    this.maxSize = Math.fround(1.3);
    this.timeScale = 1.5;
    this.scale_.set$float(Random.Float$float$float(1, this.maxSize));
    this.x = Math.fround(Math.fround(owner.x + owner.width_) - Math.fround(this.width_ / 2));
    this.y = Math.fround(owner.y - this.height_);
    return this;
  }
  centerPoint(): PointF {
    return new PointF()._PointF$float$float(Math.fround(2.5 + Math.fround(0.25 * this.width())), Math.fround(2.5 + Math.fround(0.75 * this.height())));
  }
}

export class EmoIcon$Lost extends EmoIcon {
  _EmoIcon$Lost(owner: CharSprite): this {
    this._EmoIcon(owner);
    this.copy(Icons.get$Icons(Icons.LOST));
    this.maxSize = 1.25;
    this.timeScale = 1;
    this.scale_.set$float(Random.Float$float$float(1, this.maxSize));
    this.x = Math.fround(Math.fround(owner.x + owner.width_) - Math.fround(this.width_ / 2));
    this.y = Math.fround(owner.y - this.height_);
    return this;
  }
  centerPoint(): PointF {
    return new PointF()._PointF$float$float(Math.fround(2.5 + Math.fround(0.25 * this.width())), Math.fround(2.5 + Math.fround(0.75 * this.height())));
  }
}

$J.define(EmoIcon, 'com.shatteredpixel.shatteredpixeldungeon.effects.EmoIcon', { kind: 'class', sup: 'com.watabou.noosa.Image', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite': '_EmoIcon' } });
$J.define(EmoIcon$Sleep, 'com.shatteredpixel.shatteredpixeldungeon.effects.EmoIcon$Sleep', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.effects.EmoIcon', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite': '_EmoIcon$Sleep' } });
$J.define(EmoIcon$Alert, 'com.shatteredpixel.shatteredpixeldungeon.effects.EmoIcon$Alert', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.effects.EmoIcon', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite': '_EmoIcon$Alert' } });
$J.define(EmoIcon$Investigate, 'com.shatteredpixel.shatteredpixeldungeon.effects.EmoIcon$Investigate', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.effects.EmoIcon', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite': '_EmoIcon$Investigate' } });
$J.define(EmoIcon$Lost, 'com.shatteredpixel.shatteredpixeldungeon.effects.EmoIcon$Lost', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.effects.EmoIcon', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite': '_EmoIcon$Lost' } });
$J.module(() => {
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  Game = $J.load('com.watabou.noosa.Game');
  PointF = $J.load('com.watabou.utils.PointF');
  Random = $J.load('com.watabou.utils.Random');
});
