// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/enchantments/Blooming.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../../jre/index.ts';
import { Weapon$Enchantment } from '../Weapon.ts';

let Dungeon, Regeneration, CellEmitter, LeafParticle, Level, Terrain, GameScene, ItemSprite$Glowing, PathFinder, Random;

export class Blooming extends Weapon$Enchantment {
  static DARK_GREEN: ItemSprite$Glowing = null;
  _Blooming(): this {
    this._Weapon$Enchantment();
    return this;
  }
  proc(weapon: Weapon, attacker: Char, defender: Char, damage: number): number {
    let level = Math.max(0, weapon.buffedLvl());
    let procChance = Math.fround(Math.fround((Math.fround(level + 1)) / (Math.fround(level + 3))) * this.procChanceMultiplier(attacker));
    if (Random.Float$() < procChance) {
      let powerMulti = Math.max(1, procChance);
      let plants = Math.fround((Math.fround(1.5 + Math.fround(Math.fround(0.1) * level))) * powerMulti);
      if (Random.Float$() < Math.fround(plants % 1)) {
        plants = Math.fround(Math.ceil(plants));
      } else {
        plants = Math.fround(Math.floor(plants));
      }
      if (this.plantGrass(defender.pos)) {
        plants--;
        if (plants <= Math.fround(0)) {
          return damage;
        }
      }
      let positions = new ArrayList();
      for (let i of PathFinder.NEIGHBOURS8) {
        if (((defender.pos + i) | 0) !== attacker.pos) {
          positions.add((defender.pos + i) | 0);
        }
      }
      Random.shuffle$List(positions);
      if (Dungeon.level.adjacent(attacker.pos, defender.pos)) {
        positions.add(attacker.pos);
      }
      for (const $it0 = positions.iterator(); $it0.hasNext(); ) {
        let i = $it0.next();
        if (this.plantGrass(i)) {
          plants--;
          if (plants <= Math.fround(0)) {
            return damage;
          }
        }
      }
    }
    return damage;
  }
  plantGrass(cell: number): boolean {
    let t = Dungeon.level.map_[cell];
    if ((t === Terrain.EMPTY || t === Terrain.EMPTY_DECO || t === Terrain.EMBERS || t === Terrain.GRASS || t === Terrain.FURROWED_GRASS) && Dungeon.level.plants.get(cell) == null) {
      if (!Regeneration.regenOn()) {
        Level.set$int$int(cell, Terrain.FURROWED_GRASS);
      } else {
        Level.set$int$int(cell, Terrain.HIGH_GRASS);
      }
      GameScene.updateMap$int(cell);
      CellEmitter.get(cell).burst(LeafParticle.LEVEL_SPECIFIC, 4);
      return true;
    }
    return false;
  }
  glowing(): ItemSprite$Glowing {
    return Blooming.DARK_GREEN;
  }
  static $clinit() {
    Blooming.DARK_GREEN = new ItemSprite$Glowing()._ItemSprite$Glowing$int(34816);
  }
}

$J.define(Blooming, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Blooming', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment', ctors: { '': '_Blooming' }, clinit: true, lazy: ['DARK_GREEN'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Regeneration = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Regeneration');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  LeafParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.LeafParticle');
  Level = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Level');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
