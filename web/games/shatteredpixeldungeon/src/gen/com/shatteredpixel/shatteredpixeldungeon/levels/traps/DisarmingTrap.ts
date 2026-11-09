// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/traps/DisarmingTrap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { Trap } from './Trap.ts';

let Assets$Sounds, Dungeon, Actor, Statue, CellEmitter, Speck, Heap$Type, Honeypot$ShatteredPot, Item, Messages, GameScene, GLog, Sample, PathFinder;

export class DisarmingTrap extends Trap {
  _DisarmingTrap(): this {
    this._Trap();
    this.color_ = Trap.RED;
    this.shape = Trap.LARGE_DOT;
    return this;
  }
  activate(): void {
    let heap = Dungeon.level.heaps.get(this.pos);
    if (heap != null && heap.type_ === Heap$Type.HEAP) {
      let cell: number;
      do {
        cell = Dungeon.level.randomRespawnCell(null);
      } while (cell !== -1 && Dungeon.level.heaps.get(this.pos) != null && Dungeon.level.heaps.get(this.pos).type_ !== Heap$Type.HEAP);
      if (cell !== -1) {
        let item = heap.pickUp();
        let dropped = Dungeon.level.drop(item, cell);
        dropped.seen = true;
        if (item instanceof Honeypot$ShatteredPot) {
          (item).movePot(this.pos, cell);
        }
        for (let i of PathFinder.NEIGHBOURS9) {
          (Dungeon.level.visited[(cell + i) | 0]) = true;
        }
        GameScene.updateFog$();
        Sample.INSTANCE.play$Object(Assets$Sounds.TELEPORT);
        CellEmitter.get(this.pos).burst(Speck.factory$int(Speck.LIGHT), 4);
      }
    }
    if (Actor.findChar(this.pos) instanceof Statue) {
      Actor.findChar(this.pos).die(this);
      Sample.INSTANCE.play$Object(Assets$Sounds.TELEPORT);
      CellEmitter.get(this.pos).burst(Speck.factory$int(Speck.LIGHT), 4);
    }
    if (Dungeon.hero.pos === this.pos && !Dungeon.hero.flying) {
      let hero = Dungeon.hero;
      let weapon = hero.belongings.weapon_;
      if (weapon != null && !weapon.cursed) {
        let cell: number;
        let tries = 50;
        do {
          cell = Dungeon.level.randomRespawnCell(null);
          if (tries-- < 0 && cell !== -1) {
            break;
          }
          PathFinder.buildDistanceMap$int$booleanArr(this.pos, Dungeon.level.passable);
        } while (cell === -1 || PathFinder.distance[cell] < 10 || PathFinder.distance[cell] > 20);
        if (tries < 0) {
          return;
        }
        hero.belongings.weapon_ = null;
        Dungeon.quickslot.clearItem(weapon);
        Item.updateQuickslot();
        Dungeon.level.drop(weapon, cell).seen = true;
        for (let i of PathFinder.NEIGHBOURS9) {
          (Dungeon.level.mapped[(cell + i) | 0]) = true;
        }
        GameScene.updateFog$int$int(cell, 1);
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'disarm', []), []);
        Sample.INSTANCE.play$Object(Assets$Sounds.TELEPORT);
        CellEmitter.get(this.pos).burst(Speck.factory$int(Speck.LIGHT), 4);
      }
    }
  }
}

$J.define(DisarmingTrap, 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.DisarmingTrap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap', ctors: { '': '_DisarmingTrap' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Statue = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Statue');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  Honeypot$ShatteredPot = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Honeypot$ShatteredPot');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
