// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/effects/BannerSprites.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Interfaces, Image;

export class BannerSprites extends JObject {
  _BannerSprites(): this {
    return this;
  }
  static get(type$: BannerSprites$Type): Image {
    let icon = new Image()._Image$Object(Assets$Interfaces.BANNERS);
    switch (type$) {
      case BannerSprites$Type.TITLE_PORT:
        icon.frame$RectF(icon.texture_.uvRect(0, 0, 139, 100));
        break;
      case BannerSprites$Type.TITLE_GLOW_PORT:
        icon.frame$RectF(icon.texture_.uvRect(139, 0, 278, 100));
        break;
      case BannerSprites$Type.TITLE_LAND:
        icon.frame$RectF(icon.texture_.uvRect(0, 100, 240, 157));
        break;
      case BannerSprites$Type.TITLE_GLOW_LAND:
        icon.frame$RectF(icon.texture_.uvRect(240, 100, 480, 157));
        break;
      case BannerSprites$Type.BOSS_SLAIN:
        icon.frame$RectF(icon.texture_.uvRect(0, 157, 127, 225));
        break;
      case BannerSprites$Type.GAME_OVER:
        icon.frame$RectF(icon.texture_.uvRect(128, 157, 256, 192));
        break;
    }
    return icon;
  }
}

export class BannerSprites$Type extends JEnum {
  static TITLE_PORT: BannerSprites$Type = null;
  static TITLE_GLOW_PORT: BannerSprites$Type = null;
  static TITLE_LAND: BannerSprites$Type = null;
  static TITLE_GLOW_LAND: BannerSprites$Type = null;
  static BOSS_SLAIN: BannerSprites$Type = null;
  static GAME_OVER: BannerSprites$Type = null;
  static $VALUES: BannerSprites$Type[] = null;
  _BannerSprites$Type($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): BannerSprites$Type[] { return BannerSprites$Type.$VALUES.slice(); }
  static valueOf(name: string): BannerSprites$Type { return $J.enumValueOf(BannerSprites$Type, name); }
  static $clinit() {
    BannerSprites$Type.TITLE_PORT = new BannerSprites$Type()._BannerSprites$Type('TITLE_PORT', 0);
    BannerSprites$Type.TITLE_GLOW_PORT = new BannerSprites$Type()._BannerSprites$Type('TITLE_GLOW_PORT', 1);
    BannerSprites$Type.TITLE_LAND = new BannerSprites$Type()._BannerSprites$Type('TITLE_LAND', 2);
    BannerSprites$Type.TITLE_GLOW_LAND = new BannerSprites$Type()._BannerSprites$Type('TITLE_GLOW_LAND', 3);
    BannerSprites$Type.BOSS_SLAIN = new BannerSprites$Type()._BannerSprites$Type('BOSS_SLAIN', 4);
    BannerSprites$Type.GAME_OVER = new BannerSprites$Type()._BannerSprites$Type('GAME_OVER', 5);
    BannerSprites$Type.$VALUES = [BannerSprites$Type.TITLE_PORT, BannerSprites$Type.TITLE_GLOW_PORT, BannerSprites$Type.TITLE_LAND, BannerSprites$Type.TITLE_GLOW_LAND, BannerSprites$Type.BOSS_SLAIN, BannerSprites$Type.GAME_OVER];
  }
}

$J.define(BannerSprites, 'com.shatteredpixel.shatteredpixeldungeon.effects.BannerSprites', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_BannerSprites' } });
$J.define(BannerSprites$Type, 'com.shatteredpixel.shatteredpixeldungeon.effects.BannerSprites$Type', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_BannerSprites$Type' }, clinit: true, lazy: ['$VALUES', 'TITLE_PORT', 'TITLE_GLOW_PORT', 'TITLE_LAND', 'TITLE_GLOW_LAND', 'BOSS_SLAIN', 'GAME_OVER'] });
$J.module(() => {
  Assets$Interfaces = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Interfaces');
  Image = $J.load('com.watabou.noosa.Image');
});
