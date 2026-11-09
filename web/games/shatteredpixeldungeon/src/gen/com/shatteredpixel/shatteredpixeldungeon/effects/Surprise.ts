// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/Surprise.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Effects, Effects$Type, DungeonTilemap, Game;

export class Surprise extends Image {
  static readonly TIME_TO_FADE: number = 1;
  time: number = 0;
  _Surprise(): this {
    this._Image$Image(Effects.get(Effects$Type.EXCLAMATION));
    this.origin.set$float$float(Math.fround(this.width_ / 2), Math.fround(this.height_ / 2));
    return this;
  }
  reset$int(p: number): void {
    this.revive();
    this.x = Math.fround(Math.imul((p % Dungeon.level.width()), DungeonTilemap.SIZE) + Math.fround((Math.fround(DungeonTilemap.SIZE - this.width_)) / 2));
    this.y = Math.fround(Math.imul(($J.idiv(p, Dungeon.level.width())), DungeonTilemap.SIZE) + Math.fround((Math.fround(DungeonTilemap.SIZE - this.height_)) / 2));
    this.time = Surprise.TIME_TO_FADE;
  }
  reset$Visual(v: Visual): void {
    this.revive();
    this.point$PointF(v.center$Visual(this));
    this.time = Surprise.TIME_TO_FADE;
  }
  update(): void {
    super.update();
    if ((this.time = Math.fround(this.time - Game.elapsed)) <= Math.fround(0)) {
      this.kill();
    } else {
      let p = Math.fround(this.time / Surprise.TIME_TO_FADE);
      this.alpha$float(Math.fround(Math.sqrt(p)));
      this.scale_.y = Math.fround(1 + p);
      this.scale_.x = Math.fround(1 + Math.fround(p / 4));
    }
  }
  static hit$Char(ch: Char): void {
    Surprise.hit$Char$float(ch, 0);
  }
  static hit$Char$float(ch: Char, angle: number): void {
    if (ch.sprite_ != null && ch.sprite_.parent != null) {
      let s = ch.sprite_.parent.recycle($J.cls(Surprise));
      ch.sprite_.parent.bringToFront(s);
      s.reset$Visual(ch.sprite_);
      s.angle = angle;
    }
  }
  static hit$int(pos: number): void {
    Surprise.hit$int$float(pos, 0);
  }
  static hit$int$float(pos: number, angle: number): void {
    let parent = Dungeon.hero.sprite_.parent;
    let s = parent.recycle($J.cls(Surprise));
    parent.bringToFront(s);
    s.reset$int(pos);
    s.angle = angle;
  }
}

$J.define(Surprise, 'com.shatteredpixel.shatteredpixeldungeon.effects.Surprise', { kind: 'class', sup: 'com.watabou.noosa.Image', ctors: { '': '_Surprise' }, meths: { 'hit(int,float)': 'hit$int$float', 'hit(int)': 'hit$int', 'hit(com.shatteredpixel.shatteredpixeldungeon.actors.Char,float)': 'hit$Char$float', 'hit(com.shatteredpixel.shatteredpixeldungeon.actors.Char)': 'hit$Char', 'reset(com.watabou.noosa.Visual)': 'reset$Visual', 'reset(int)': 'reset$int' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Effects = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Effects');
  Effects$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Effects$Type');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  Game = $J.load('com.watabou.noosa.Game');
});
