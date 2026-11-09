// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/PhantomPiranha.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../jre/index.ts';
import { Piranha } from './Piranha.ts';

let Dungeon, Actor, Char, Corruption, ClericSpell, PhantomMeat, ScrollOfTeleportation, Wand, Messages, PhantomPiranhaSprite, GLog, PathFinder, Random;

export class PhantomPiranha extends Piranha {
  _PhantomPiranha(): this {
    this._Piranha();
    this.spriteClass = $J.cls(PhantomPiranhaSprite);
    this.loot = $J.cls(PhantomMeat);
    this.lootChance_ = 1;
    return this;
  }
  damage(dmg: number, src: any): void {
    let dmgSource = null;
    if (src instanceof Char) {
      dmgSource = src;
    }
    if (src instanceof Wand || src instanceof ClericSpell) {
      dmgSource = Dungeon.hero;
    }
    if (dmgSource == null || !Dungeon.level.adjacent(this.pos, dmgSource.pos)) {
      dmg = $J.roundf(Math.fround(dmg / 2));
    }
    super.damage(dmg, src);
    if (this.isAlive() && !(src instanceof Corruption)) {
      if (dmgSource != null) {
        if (!Dungeon.level.adjacent(this.pos, dmgSource.pos)) {
          let candidates = new ArrayList();
          for (let i of PathFinder.NEIGHBOURS8) {
            if (Dungeon.level.water[(dmgSource.pos + i) | 0] && (Actor.findChar((dmgSource.pos + i) | 0)) == null) {
              candidates.add((dmgSource.pos + i) | 0);
            }
          }
          if (!candidates.isEmpty()) {
            ScrollOfTeleportation.appear(this, Random.element$Collection(candidates));
            this.aggro(dmgSource);
          } else {
            this.teleportAway();
          }
        }
      } else {
        this.teleportAway();
      }
    }
  }
  defenseProc(enemy: Char, damage: number): number {
    return super.defenseProc(enemy, damage);
  }
  dieOnLand(): void {
    if (!this.teleportAway()) {
      super.dieOnLand();
    }
  }
  teleportAway(): boolean {
    if (this.flying) {
      return false;
    }
    let inFOVCandidates = new ArrayList();
    let outFOVCandidates = new ArrayList();
    for (let i = 0; i < Dungeon.level.length(); i++) {
      if (Dungeon.level.water[i] && Actor.findChar(i) == null) {
        if (Dungeon.level.heroFOV[i]) {
          inFOVCandidates.add(i);
        } else {
          outFOVCandidates.add(i);
        }
      }
    }
    if (!outFOVCandidates.isEmpty()) {
      if (Dungeon.level.heroFOV[this.pos]) {
        GLog.i(Messages.get$Object$String$ObjectArr(this, 'teleport_away', []), []);
      }
      ScrollOfTeleportation.appear(this, Random.element$Collection(outFOVCandidates));
      return true;
    } else if (!inFOVCandidates.isEmpty()) {
      ScrollOfTeleportation.appear(this, Random.element$Collection(inFOVCandidates));
      return true;
    }
    return false;
  }
}

$J.define(PhantomPiranha, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.PhantomPiranha', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Piranha', ctors: { '': '_PhantomPiranha' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Corruption = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Corruption');
  ClericSpell = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.ClericSpell');
  PhantomMeat = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.PhantomMeat');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  PhantomPiranhaSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.PhantomPiranhaSprite');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
