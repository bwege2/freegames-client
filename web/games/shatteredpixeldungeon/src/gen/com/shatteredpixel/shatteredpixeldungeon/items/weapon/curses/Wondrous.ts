// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/curses/Wondrous.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Weapon$Enchantment } from '../Weapon.ts';

let RainbowParticle, WondrousResin, CursedWand, Ballistica, ItemSprite$Glowing, Random;

export class Wondrous extends Weapon$Enchantment {
  static BLACK: ItemSprite$Glowing = null;
  _Wondrous(): this {
    this._Weapon$Enchantment();
    return this;
  }
  proc(weapon: Weapon, attacker: Char, defender: Char, damage: number): number {
    let procChance = Math.fround(Math.fround(1 / 8) * this.procChanceMultiplier(attacker));
    if (Random.Float$() < procChance) {
      let positiveOnly = Random.Float$() < WondrousResin.positiveCurseEffectChance$();
      let aim = new Ballistica()._Ballistica(attacker.pos, defender.pos, Ballistica.STOP_TARGET);
      defender.sprite_.emitter().burst(RainbowParticle.BURST, 25);
      CursedWand.randomValidEffect(weapon, attacker, aim, positiveOnly).effect(weapon, attacker, aim, positiveOnly);
    }
    return damage;
  }
  curse(): boolean {
    return true;
  }
  glowing(): ItemSprite$Glowing {
    return Wondrous.BLACK;
  }
  static $clinit() {
    Wondrous.BLACK = new ItemSprite$Glowing()._ItemSprite$Glowing$int(0);
  }
}

$J.define(Wondrous, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.curses.Wondrous', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment', ctors: { '': '_Wondrous' }, clinit: true, lazy: ['BLACK'] });
$J.module(() => {
  RainbowParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.RainbowParticle');
  WondrousResin = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.WondrousResin');
  CursedWand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.CursedWand');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  Random = $J.load('com.watabou.utils.Random');
});
