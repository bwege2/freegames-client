// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/armor/curses/Overgrowth.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Hero, HeroSubClass, CellEmitter, LeafParticle, Generator, Generator$Category, ItemSprite$Glowing, Random;

export class Overgrowth extends Armor$Glyph {
  static BLACK: ItemSprite$Glowing = null;
  _Overgrowth(): this {
    this._Armor$Glyph();
    return this;
  }
  proc(armor: Armor, attacker: Char, defender: Char, damage: number): number {
    let procChance = Math.fround(Math.fround(1 / 20) * this.procChanceMultiplier(defender));
    if (Random.Float$() < procChance) {
      let p = (Generator.randomUsingDefaults$Category(Generator$Category.SEED)).couch(defender.pos, null);
      if (defender instanceof Hero && (defender).subClass === HeroSubClass.WARDEN) {
        (defender).subClass = HeroSubClass.NONE;
        p.activate(defender);
        (defender).subClass = HeroSubClass.WARDEN;
      } else {
        p.activate(defender);
      }
      CellEmitter.get(defender.pos).burst(LeafParticle.LEVEL_SPECIFIC, 10);
    }
    return damage;
  }
  glowing(): ItemSprite$Glowing {
    return Overgrowth.BLACK;
  }
  curse(): boolean {
    return true;
  }
  static $clinit() {
    Overgrowth.BLACK = new ItemSprite$Glowing()._ItemSprite$Glowing$int(0);
  }
}

$J.define(Overgrowth, 'com.shatteredpixel.shatteredpixeldungeon.items.armor.curses.Overgrowth', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Glyph', ctors: { '': '_Overgrowth' }, clinit: true, lazy: ['BLACK'] });
$J.module(() => {
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroSubClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroSubClass');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  LeafParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.LeafParticle');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  Random = $J.load('com.watabou.utils.Random');
});
