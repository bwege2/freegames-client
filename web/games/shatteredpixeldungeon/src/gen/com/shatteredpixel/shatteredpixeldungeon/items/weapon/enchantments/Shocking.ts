// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/enchantments/Shocking.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Assets$Sounds, Dungeon, Actor, Lightning, Lightning$Arc, SparkParticle, ItemSprite$Glowing, Sample, BArray, PathFinder, Random;

export class Shocking extends Weapon$Enchantment {
  static WHITE: ItemSprite$Glowing = null;
  affected: ArrayList<Char> = null;
  arcs: ArrayList<Lightning$Arc> = null;
  _Shocking(): this {
    this._Weapon$Enchantment();
    this.affected = new ArrayList();
    this.arcs = new ArrayList();
    return this;
  }
  proc(weapon: Weapon, attacker: Char, defender: Char, damage: number): number {
    let level = Math.max(0, weapon.buffedLvl());
    let procChance = Math.fround((Math.fround(1 / 3)) * this.procChanceMultiplier(attacker));
    if (Random.Float$() < procChance) {
      let powerMulti = Math.max(1, procChance);
      this.affected.clear();
      this.arcs.clear();
      Shocking.arc(attacker, defender, 2, this.affected, this.arcs);
      this.affected.remove(defender);
      for (const $it0 = this.affected.iterator(); $it0.hasNext(); ) {
        let ch = $it0.next();
        if (ch.alignment !== attacker.alignment) {
          ch.damage($J.roundf(Math.fround(Math.fround(damage * 0.5) * powerMulti)), this);
        }
      }
      attacker.sprite_.parent.addToFront(new Lightning()._Lightning$List$Callback(this.arcs, null));
      Sample.INSTANCE.play$Object(Assets$Sounds.LIGHTNING);
    }
    return damage;
  }
  glowing(): ItemSprite$Glowing {
    return Shocking.WHITE;
  }
  static arc(attacker: Char, defender: Char, dist: number, affected: ArrayList<Char>, arcs: ArrayList<Lightning$Arc>): void {
    defender.sprite_.centerEmitter().burst(SparkParticle.FACTORY, 3);
    defender.sprite_.flash();
    let hitThisArc = new ArrayList();
    PathFinder.buildDistanceMap$int$booleanArr$int(defender.pos, BArray.not(Dungeon.level.solid, null), dist);
    for (let i = 0; i < PathFinder.distance.length; i++) {
      if (PathFinder.distance[i] < 2147483647) {
        let n = Actor.findChar(i);
        if (n != null && n !== attacker && !affected.contains(n)) {
          hitThisArc.add(n);
        }
      }
    }
    affected.addAll(hitThisArc);
    for (const $it1 = hitThisArc.iterator(); $it1.hasNext(); ) {
      let hit = $it1.next();
      arcs.add(new Lightning$Arc()._Lightning$Arc$PointF$PointF(defender.sprite_.center$(), hit.sprite_.center$()));
      Shocking.arc(attacker, hit, (Dungeon.level.water[hit.pos] && !hit.flying) ? 2 : 1, affected, arcs);
    }
  }
  static $clinit() {
    Shocking.WHITE = new ItemSprite$Glowing()._ItemSprite$Glowing$int$float(16777215, 0.5);
  }
}

$J.define(Shocking, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Shocking', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment', ctors: { '': '_Shocking' }, clinit: true, lazy: ['WHITE'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Lightning = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Lightning');
  Lightning$Arc = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Lightning$Arc');
  SparkParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.SparkParticle');
  ItemSprite$Glowing = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite$Glowing');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
