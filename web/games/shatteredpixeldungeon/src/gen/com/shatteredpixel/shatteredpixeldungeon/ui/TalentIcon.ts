// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/TalentIcon.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

export class TalentIcon extends Image {
  static film: TextureFilm = null;
  static readonly SIZE: number = 16;
  _TalentIcon$Talent(talent: Talent): this {
    this._TalentIcon$int(talent.icon());
    return this;
  }
  _TalentIcon$int(icon: number): this {
    this._Image$Object(Assets$Interfaces.TALENT_ICONS);
    if (TalentIcon.film == null) {
      TalentIcon.film = new TextureFilm()._TextureFilm$Object$int$int(this.texture_, TalentIcon.SIZE, TalentIcon.SIZE);
    }
    this.frame$RectF(TalentIcon.film.get$Object(icon));
    return this;
  }
}

$J.define(TalentIcon, 'com.shatteredpixel.shatteredpixeldungeon.ui.TalentIcon', { kind: 'class', sup: 'com.watabou.noosa.Image', ctors: { 'int': '_TalentIcon$int', 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent': '_TalentIcon$Talent' } });
$J.module(() => {
  Assets$Interfaces = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Interfaces');
  TextureFilm = $J.load('com.watabou.noosa.TextureFilm');
});
