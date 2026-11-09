// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/weapon/missiles/darts/DisplacingDart.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../../../jre/index.ts';
import { TippedDart } from './TippedDart.ts';

let Dungeon, Actor, Char, Char$Property, Buff, TalismanOfForesight$CharAwareness, ScrollOfTeleportation, GameScene, ItemSpriteSheet, BArray, PathFinder;

export class DisplacingDart extends TippedDart {
  _DisplacingDart(): this {
    this._TippedDart();
    this.image_ = ItemSpriteSheet.DISPLACING_DART;
    return this;
  }
  proc(attacker: Char, defender: Char, damage: number): number {
    if (this.processingChargedShot && attacker.alignment === defender.alignment) {
      return super.proc(attacker, defender, damage);
    }
    if (!defender.properties().contains(Char$Property.IMMOVABLE)) {
      let visiblePositions = new ArrayList();
      let nonVisiblePositions = new ArrayList();
      PathFinder.buildDistanceMap$int$booleanArr(attacker.pos, BArray.or$booleanArr$booleanArr$booleanArr(Dungeon.level.passable, Dungeon.level.avoid, null));
      for (let pos = 0; pos < Dungeon.level.length(); pos++) {
        if (Dungeon.level.passable[pos] && PathFinder.distance[pos] >= 8 && PathFinder.distance[pos] <= 10 && (!Char.hasProp(defender, Char$Property.LARGE) || Dungeon.level.openSpace[pos]) && Actor.findChar(pos) == null) {
          if (Dungeon.level.heroFOV[pos]) {
            visiblePositions.add(pos);
          } else {
            nonVisiblePositions.add(pos);
          }
        }
      }
      let chosenPos = -1;
      if (!visiblePositions.isEmpty()) {
        for (const $it0 = visiblePositions.iterator(); $it0.hasNext(); ) {
          let pos = $it0.next();
          if (chosenPos === -1 || Dungeon.level.trueDistance(defender.pos, chosenPos) > Dungeon.level.trueDistance(defender.pos, pos)) {
            chosenPos = pos;
          }
        }
      } else {
        for (const $it1 = nonVisiblePositions.iterator(); $it1.hasNext(); ) {
          let pos = $it1.next();
          if (chosenPos === -1 || Dungeon.level.trueDistance(defender.pos, chosenPos) > Dungeon.level.trueDistance(defender.pos, pos)) {
            chosenPos = pos;
          }
        }
      }
      if (chosenPos !== -1) {
        ScrollOfTeleportation.appear(defender, chosenPos);
        Dungeon.level.occupyCell(defender);
        if (defender === Dungeon.hero) {
          Dungeon.observe$();
          GameScene.updateFog$();
        } else if (!Dungeon.level.heroFOV[chosenPos]) {
          Buff.append$Char$Class$float(attacker, $J.cls(TalismanOfForesight$CharAwareness), 5).charID = defender.id();
        }
      }
    }
    return super.proc(attacker, defender, damage);
  }
}

$J.define(DisplacingDart, 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.DisplacingDart', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.darts.TippedDart', ctors: { '': '_DisplacingDart' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  TalismanOfForesight$CharAwareness = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.TalismanOfForesight$CharAwareness');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
