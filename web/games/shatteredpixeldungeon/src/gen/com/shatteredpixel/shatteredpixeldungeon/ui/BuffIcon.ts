// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/BuffIcon.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Interfaces, TextureFilm;

export class BuffIcon extends Image {
  static smallFilm: TextureFilm = null;
  static readonly SML_SIZE: number = 7;
  static largeFilm: TextureFilm = null;
  static readonly LRG_SIZE: number = 16;
  large: boolean = false;
  _BuffIcon$Buff$boolean(buff: Buff, large: boolean): this {
    this._Image$Object(large ? Assets$Interfaces.BUFFS_LARGE : Assets$Interfaces.BUFFS_SMALL);
    this.large = large;
    this.refresh$Buff(buff);
    return this;
  }
  _BuffIcon$int$boolean(icon: number, large: boolean): this {
    this._Image$Object(large ? Assets$Interfaces.BUFFS_LARGE : Assets$Interfaces.BUFFS_SMALL);
    this.large = large;
    this.refresh$int(icon);
    return this;
  }
  refresh$Buff(buff: Buff): void {
    this.refresh$int(buff.icon());
    buff.tintIcon(this);
  }
  refresh$int(icon: number): void {
    if (this.large) {
      if (BuffIcon.largeFilm == null) {
        BuffIcon.largeFilm = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, BuffIcon.LRG_SIZE, BuffIcon.LRG_SIZE);
      }
      this.frame$RectF(BuffIcon.largeFilm.get$Object(icon));
    } else {
      if (BuffIcon.smallFilm == null) {
        BuffIcon.smallFilm = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, BuffIcon.SML_SIZE, BuffIcon.SML_SIZE);
      }
      this.frame$RectF(BuffIcon.smallFilm.get$Object(icon));
    }
  }
}

$J.define(BuffIcon, 'com.shatteredpixel.shatteredpixeldungeon.ui.BuffIcon', { kind: 'class', sup: 'com.watabou.noosa.Image', ctors: { 'int,boolean': '_BuffIcon$int$boolean', 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff,boolean': '_BuffIcon$Buff$boolean' }, meths: { 'refresh(int)': 'refresh$int', 'refresh(com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff)': 'refresh$Buff' } });
$J.module(() => {
  Assets$Interfaces = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Interfaces');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
});
