// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/Effects.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JEnum, JObject } from '../../../../../jre/index.ts';

let Assets$Effects, Image;

export class Effects extends JObject {
  _Effects(): this {
    return this;
  }
  static get(type$: Effects$Type): Image {
    let icon = new Image()._Image$Object(Assets$Effects.EFFECTS);
    switch (type$) {
      case Effects$Type.RIPPLE:
        icon.frame$RectF(icon.texture_.uvRect(0, 0, 16, 16));
        break;
      case Effects$Type.LIGHTNING:
        icon.frame$RectF(icon.texture_.uvRect(16, 0, 32, 8));
        break;
      case Effects$Type.WOUND:
        icon.frame$RectF(icon.texture_.uvRect(16, 8, 32, 16));
        break;
      case Effects$Type.EXCLAMATION:
        icon.frame$RectF(icon.texture_.uvRect(0, 16, 6, 25));
        break;
      case Effects$Type.CHAIN:
        icon.frame$RectF(icon.texture_.uvRect(6, 16, 11, 22));
        break;
      case Effects$Type.ETHEREAL_CHAIN:
        icon.frame$RectF(icon.texture_.uvRect(11, 16, 16, 22));
        break;
      case Effects$Type.DEATH_RAY:
        icon.frame$RectF(icon.texture_.uvRect(16, 16, 32, 24));
        break;
      case Effects$Type.LIGHT_RAY:
        icon.frame$RectF(icon.texture_.uvRect(16, 23, 32, 31));
        break;
      case Effects$Type.HEALTH_RAY:
        icon.frame$RectF(icon.texture_.uvRect(16, 30, 32, 38));
        break;
    }
    return icon;
  }
}

export class Effects$Type extends JEnum {
  static RIPPLE: Effects$Type = null;
  static LIGHTNING: Effects$Type = null;
  static WOUND: Effects$Type = null;
  static EXCLAMATION: Effects$Type = null;
  static CHAIN: Effects$Type = null;
  static ETHEREAL_CHAIN: Effects$Type = null;
  static DEATH_RAY: Effects$Type = null;
  static LIGHT_RAY: Effects$Type = null;
  static HEALTH_RAY: Effects$Type = null;
  static $VALUES: Effects$Type[] = null;
  _Effects$Type($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Effects$Type[] { return Effects$Type.$VALUES.slice(); }
  static valueOf(name: string): Effects$Type { return $J.enumValueOf(Effects$Type, name); }
  static $clinit() {
    Effects$Type.RIPPLE = new Effects$Type()._Effects$Type('RIPPLE', 0);
    Effects$Type.LIGHTNING = new Effects$Type()._Effects$Type('LIGHTNING', 1);
    Effects$Type.WOUND = new Effects$Type()._Effects$Type('WOUND', 2);
    Effects$Type.EXCLAMATION = new Effects$Type()._Effects$Type('EXCLAMATION', 3);
    Effects$Type.CHAIN = new Effects$Type()._Effects$Type('CHAIN', 4);
    Effects$Type.ETHEREAL_CHAIN = new Effects$Type()._Effects$Type('ETHEREAL_CHAIN', 5);
    Effects$Type.DEATH_RAY = new Effects$Type()._Effects$Type('DEATH_RAY', 6);
    Effects$Type.LIGHT_RAY = new Effects$Type()._Effects$Type('LIGHT_RAY', 7);
    Effects$Type.HEALTH_RAY = new Effects$Type()._Effects$Type('HEALTH_RAY', 8);
    Effects$Type.$VALUES = [Effects$Type.RIPPLE, Effects$Type.LIGHTNING, Effects$Type.WOUND, Effects$Type.EXCLAMATION, Effects$Type.CHAIN, Effects$Type.ETHEREAL_CHAIN, Effects$Type.DEATH_RAY, Effects$Type.LIGHT_RAY, Effects$Type.HEALTH_RAY];
  }
}

$J.define(Effects, 'com.shatteredpixel.shatteredpixeldungeon.effects.Effects', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Effects' } });
$J.define(Effects$Type, 'com.shatteredpixel.shatteredpixeldungeon.effects.Effects$Type', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Effects$Type' }, clinit: true, lazy: ['$VALUES', 'RIPPLE', 'LIGHTNING', 'WOUND', 'EXCLAMATION', 'CHAIN', 'ETHEREAL_CHAIN', 'DEATH_RAY', 'LIGHT_RAY', 'HEALTH_RAY'] });
$J.module(() => {
  Assets$Effects = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Effects');
  Image = $J.load('com.watabou.noosa.Image');
});
