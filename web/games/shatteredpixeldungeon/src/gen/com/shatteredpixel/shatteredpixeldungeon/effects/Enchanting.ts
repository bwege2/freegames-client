// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/Enchanting.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JEnum } from '../../../../../jre/index.ts';
import { ItemSprite } from '../sprites/ItemSprite.ts';

let Game;

export class Enchanting extends ItemSprite {
  static readonly FADE_IN_TIME: number = Math.fround(0.2);
  static readonly STATIC_TIME: number = 1;
  static readonly FADE_OUT_TIME: number = Math.fround(0.4);
  static readonly ALPHA: number = Math.fround(0.6);
  color_: number = 0;
  target: Char = null;
  phase$Enchanting: Enchanting$Phase = null;
  duration: number = 0;
  passed: number = 0;
  _Enchanting(item: Item): this {
    this._ItemSprite$int$Glowing(item.image(), null);
    if (item.glowing() != null) {
      this.color_ = item.glowing().color_;
    } else {
      this.color_ = -1;
    }
    this.phase$Enchanting = Enchanting$Phase.FADE_IN;
    this.duration = Enchanting.FADE_IN_TIME;
    this.passed = 0;
    return this;
  }
  update(): void {
    super.update();
    this.x = Math.fround(this.target.sprite_.center$().x - Math.fround(this.width() / 2));
    this.y = Math.fround(Math.fround(this.target.sprite_.y - 8) - Math.fround(this.height() / 2));
    switch (this.phase$Enchanting) {
      case Enchanting$Phase.FADE_IN:
        this.alpha$float(Math.fround(Math.fround(this.passed / this.duration) * Enchanting.ALPHA));
        this.scale_.set$float(Math.fround(this.passed / this.duration));
        break;
      case Enchanting$Phase.STATIC:
        if (this.color_ !== -1) {
          this.tint$int$float(this.color_, Math.fround(Math.fround(this.passed / this.duration) * Math.fround(0.8)));
        }
        break;
      case Enchanting$Phase.FADE_OUT:
        this.alpha$float(Math.fround((Math.fround(1 - Math.fround(this.passed / this.duration))) * Enchanting.ALPHA));
        this.scale_.set$float(Math.fround(1 + Math.fround(this.passed / this.duration)));
        break;
    }
    if ((this.passed = Math.fround(this.passed + Game.elapsed)) > this.duration) {
      switch (this.phase$Enchanting) {
        case Enchanting$Phase.FADE_IN:
          this.phase$Enchanting = Enchanting$Phase.STATIC;
          this.duration = Enchanting.STATIC_TIME;
          break;
        case Enchanting$Phase.STATIC:
          this.phase$Enchanting = Enchanting$Phase.FADE_OUT;
          this.duration = Enchanting.FADE_OUT_TIME;
          break;
        case Enchanting$Phase.FADE_OUT:
          this.kill();
          break;
      }
      this.passed = 0;
    }
  }
  static show(ch: Char, item: Item): void {
    if (!ch.sprite_.visible_) {
      return;
    }
    let sprite = new Enchanting()._Enchanting(item);
    sprite.target = ch;
    ch.sprite_.parent.add$Gizmo(sprite);
  }
}

export class Enchanting$Phase extends JEnum {
  static FADE_IN: Enchanting$Phase = null;
  static STATIC: Enchanting$Phase = null;
  static FADE_OUT: Enchanting$Phase = null;
  static $VALUES: Enchanting$Phase[] = null;
  _Enchanting$Phase($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Enchanting$Phase[] { return Enchanting$Phase.$VALUES.slice(); }
  static valueOf(name: string): Enchanting$Phase { return $J.enumValueOf(Enchanting$Phase, name); }
  static $clinit() {
    Enchanting$Phase.FADE_IN = new Enchanting$Phase()._Enchanting$Phase('FADE_IN', 0);
    Enchanting$Phase.STATIC = new Enchanting$Phase()._Enchanting$Phase('STATIC', 1);
    Enchanting$Phase.FADE_OUT = new Enchanting$Phase()._Enchanting$Phase('FADE_OUT', 2);
    Enchanting$Phase.$VALUES = [Enchanting$Phase.FADE_IN, Enchanting$Phase.STATIC, Enchanting$Phase.FADE_OUT];
  }
}

$J.define(Enchanting, 'com.shatteredpixel.shatteredpixeldungeon.effects.Enchanting', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.items.Item': '_Enchanting' } });
$J.define(Enchanting$Phase, 'com.shatteredpixel.shatteredpixeldungeon.effects.Enchanting$Phase', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Enchanting$Phase' }, clinit: true, lazy: ['$VALUES', 'FADE_IN', 'STATIC', 'FADE_OUT'] });
$J.module(() => {
  Game = $J.load('com.watabou.noosa.Game');
});
