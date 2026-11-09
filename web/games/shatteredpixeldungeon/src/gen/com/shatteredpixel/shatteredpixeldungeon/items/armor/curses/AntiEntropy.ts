// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/armor/curses/AntiEntropy.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Freezing, Buff, Burning, FlameParticle, ItemSprite$Glowing, PathFinder, Random;

export class AntiEntropy extends Armor$Glyph {
  static BLACK: ItemSprite$Glowing = null;
  _AntiEntropy(): this {
    this._Armor$Glyph();
    return this;
  }
  proc(armor: Armor, attacker: Char, defender: Char, damage: number): number {
    let procChance = Math.fround(Math.fround(1 / 8) * this.procChanceMultiplier(defender));
    if (Random.Float$() < procChance) {
      for (let i of PathFinder.NEIGHBOURS8) {
        Freezing.affect((defender.pos + i) | 0);
      }
      if (!Dungeon.level.water[defender.pos]) {
        Buff.affect$Char$Class(defender, $J.cls(Burning)).reignite$Char$float(defender, 4);
      }
      defender.sprite_.emitter().burst(FlameParticle.FACTORY, 5);
    }
    return damage;
  }
  glowing(): ItemSprite$Glowing {
    return AntiEntropy.BLACK;
  }
  curse(): boolean {
    return true;
  }
  static $clinit() {
    AntiEntropy.BLACK = new ItemSprite$Glowing()._ItemSprite$Glowing$int(0);
  }
}

$J.define(AntiEntropy, 'com.shatteredpixel.shatteredpixeldungeon.items.armor.curses.AntiEntropy', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Glyph', ctors: { '': '_AntiEntropy' }, clinit: true, lazy: ['BLACK'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Freezing = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Freezing');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Burning = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Burning');
  FlameParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.FlameParticle');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
