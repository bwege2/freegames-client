// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/enchantments/Blazing.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Buff, Burning, FlameParticle, ItemSprite$Glowing, Random;

export class Blazing extends Weapon$Enchantment {
  static ORANGE: ItemSprite$Glowing = null;
  _Blazing(): this {
    this._Weapon$Enchantment();
    return this;
  }
  proc(weapon: Weapon, attacker: Char, defender: Char, damage: number): number {
    let level = Math.max(0, weapon.buffedLvl());
    let procChance = Math.fround(Math.fround((Math.fround(level + 1)) / (Math.fround(level + 3))) * this.procChanceMultiplier(attacker));
    if (Random.Float$() < procChance) {
      let powerMulti = Math.max(1, procChance);
      if (defender.buff($J.cls(Burning)) == null) {
        Buff.affect$Char$Class(defender, $J.cls(Burning)).reignite$Char$float(defender, 8);
        powerMulti = Math.fround(powerMulti - 1);
      }
      if (powerMulti > Math.fround(0)) {
        let burnDamage = Random.NormalIntRange(1, (3 + $J.idiv(Dungeon.scalingDepth(), 4)) | 0);
        burnDamage = $J.roundf(Math.fround(Math.fround(burnDamage * Math.fround(0.67)) * powerMulti));
        if (burnDamage > 0) {
          defender.damage(burnDamage, this);
        }
      }
      defender.sprite_.emitter().burst(FlameParticle.FACTORY, (level + 1) | 0);
    }
    return damage;
  }
  glowing(): ItemSprite$Glowing {
    return Blazing.ORANGE;
  }
  static $clinit() {
    Blazing.ORANGE = new ItemSprite$Glowing()._ItemSprite$Glowing$int(16729088);
  }
}

$J.define(Blazing, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Blazing', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment', ctors: { '': '_Blazing' }, clinit: true, lazy: ['ORANGE'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Burning = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Burning');
  FlameParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.FlameParticle');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  Random = $J.load('com.watabou.utils.Random');
});
