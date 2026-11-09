// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/armor/glyphs/Affection.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../jre/index.ts';
import { Armor$Glyph } from '../Armor.ts';

let Buff, Charm, Speck, ItemSprite$Glowing, Random;

export class Affection extends Armor$Glyph {
  static PINK: ItemSprite$Glowing = null;
  _Affection(): this {
    this._Armor$Glyph();
    return this;
  }
  proc(armor: Armor, attacker: Char, defender: Char, damage: number): number {
    let level = Math.max(0, armor.buffedLvl());
    let procChance = Math.fround(Math.fround((Math.fround(level + 3)) / (Math.fround(level + 20))) * this.procChanceMultiplier(defender));
    if (Random.Float$() < procChance) {
      let powerMulti = Math.max(1, procChance);
      Buff.affect$Char$Class$float(attacker, $J.cls(Charm), Math.fround($J.roundf(Math.fround(Charm.DURATION * powerMulti)))).object = defender.id();
      attacker.sprite_.centerEmitter().start(Speck.factory$int(Speck.HEART), Math.fround(0.2), 5);
    }
    return damage;
  }
  glowing(): ItemSprite$Glowing {
    return Affection.PINK;
  }
  static $clinit() {
    Affection.PINK = new ItemSprite$Glowing()._ItemSprite$Glowing$int(16729224);
  }
}

$J.define(Affection, 'com.shatteredpixel.shatteredpixeldungeon.items.armor.glyphs.Affection', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Glyph', ctors: { '': '_Affection' }, clinit: true, lazy: ['PINK'] });
$J.module(() => {
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Charm = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Charm');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  Random = $J.load('com.watabou.utils.Random');
});
