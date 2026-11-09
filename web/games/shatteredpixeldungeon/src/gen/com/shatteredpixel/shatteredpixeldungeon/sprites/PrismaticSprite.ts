// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/sprites/PrismaticSprite.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { MirrorSprite } from './MirrorSprite.ts';

let Game;

export class PrismaticSprite extends MirrorSprite {
  _PrismaticSprite(): this {
    this._MirrorSprite();
    let interval = Math.fround((Math.fround(Game.timeTotal % 9)) / 3);
    this.tint$float$float$float$float(interval > Math.fround(2) ? Math.fround(interval - 2) : Math.max(0, Math.fround(1 - interval)), interval > Math.fround(1) ? Math.max(0, Math.fround(2 - interval)) : interval, interval > Math.fround(2) ? Math.max(0, Math.fround(3 - interval)) : Math.fround(interval - 1), 0.5);
    return this;
  }
  updateArmor$(): void {
    this.updateArmor$int((this.ch).armTier);
  }
  update(): void {
    super.update();
    if (this.flashTime <= Math.fround(0)) {
      let interval = Math.fround((Math.fround(Game.timeTotal % 9)) / 3);
      this.tint$float$float$float$float(interval > Math.fround(2) ? Math.fround(interval - 2) : Math.max(0, Math.fround(1 - interval)), interval > Math.fround(1) ? Math.max(0, Math.fround(2 - interval)) : interval, interval > Math.fround(2) ? Math.max(0, Math.fround(3 - interval)) : Math.fround(interval - 1), 0.5);
    }
  }
}

$J.define(PrismaticSprite, 'com.shatteredpixel.shatteredpixeldungeon.sprites.PrismaticSprite', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.MirrorSprite', ctors: { '': '_PrismaticSprite' }, meths: { 'updateArmor()': 'updateArmor$' } });
$J.module(() => {
  Game = $J.load('com.watabou.noosa.Game');
});
