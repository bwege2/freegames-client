// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/levels/traps/PitfallTrap.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Trap } from './Trap.ts';
import { FlavourBuff } from '../../actors/buffs/FlavourBuff.ts';

let Dungeon, Actor, Char, Char$Alignment, Char$Property, Buff, CellEmitter, PitfallParticle, Heap$Type, Chasm, Messages, GameScene, GLog, PathFinder;

export class PitfallTrap extends Trap {
  _PitfallTrap(): this {
    this._Trap();
    this.color_ = Trap.RED;
    this.shape = Trap.DIAMOND;
    return this;
  }
  activate(): void {
    if (Dungeon.bossLevel$() || Dungeon.depth > 25 || Dungeon.branch !== 0) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'no_pit', []), []);
      return;
    }
    let p = Buff.append$Char$Class$float(Dungeon.hero, $J.cls(PitfallTrap$DelayedPit), 1);
    p.depth_ = Dungeon.depth;
    p.branch = Dungeon.branch;
    let positions = new ArrayList();
    for (let i of PathFinder.NEIGHBOURS9) {
      if (!(Dungeon.level.solid[(this.pos + i) | 0]) || Dungeon.level.passable[(this.pos + i) | 0]) {
        (CellEmitter.floor((this.pos + i) | 0)).burst(PitfallParticle.FACTORY4, 8);
        positions.add((this.pos + i) | 0);
      }
    }
    p.setPositions(positions);
    if (this.pos === Dungeon.hero.pos) {
      GLog.n(Messages.get$Object$String$ObjectArr(this, 'triggered_hero', []), []);
    } else if (Dungeon.level.heroFOV[this.pos]) {
      GLog.n(Messages.get$Object$String$ObjectArr(this, 'triggered', []), []);
    }
  }
}

export class PitfallTrap$DelayedPit extends FlavourBuff {
  positions: number[] = null;
  depth_: number = 0;
  branch: number = 0;
  ignoreAllies: boolean = false;
  static readonly POSITIONS: string = 'positions';
  static readonly DEPTH: string = 'depth';
  static readonly BRANCH: string = 'branch';
  static readonly IGNORE_ALLIES: string = 'ignore_allies';
  _PitfallTrap$DelayedPit(): this {
    this._FlavourBuff();
    this.revivePersists = true;
    this.positions = $J.newArray(0, 0);
    this.ignoreAllies = false;
    return this;
  }
  act(): boolean {
    let herofell = false;
    if (this.depth_ === Dungeon.depth && this.branch === Dungeon.branch && this.positions != null) {
      for (let cell of this.positions) {
        if (!Dungeon.level.insideMap(cell) || (Dungeon.level.solid[cell] && !Dungeon.level.passable[cell])) {
          continue;
        }
        CellEmitter.floor(cell).burst(PitfallParticle.FACTORY8, 12);
        let ch = Actor.findChar(cell);
        if (ch != null && !ch.flying && !(ch.alignment === Char$Alignment.NEUTRAL && Char.hasProp(ch, Char$Property.IMMOVABLE)) && !(ch.alignment === Char$Alignment.ALLY && this.ignoreAllies)) {
          if (ch === Dungeon.hero) {
            herofell = true;
          } else {
            Chasm.mobFall(ch);
          }
        }
        let heap = Dungeon.level.heaps.get(cell);
        if (heap != null && !this.ignoreAllies && heap.type_ !== Heap$Type.FOR_SALE && heap.type_ !== Heap$Type.LOCKED_CHEST && heap.type_ !== Heap$Type.CRYSTAL_CHEST) {
          for (const $it0 = heap.items_.iterator(); $it0.hasNext(); ) {
            let item = $it0.next();
            Dungeon.dropToChasm(item);
          }
          heap.sprite_.kill();
          GameScene.discard(heap);
          heap.sprite_.drop$();
          Dungeon.level.heaps.remove(cell);
        }
      }
    }
    if (herofell) {
      Chasm.heroFall(Dungeon.hero.pos);
    }
    this.detach();
    return !herofell;
  }
  setPositions(positions: ArrayList<number>): void {
    this.positions = $J.newArray(positions.size(), 0);
    for (let i = 0; i < this.positions.length; i++) {
      this.positions[i] = positions.get(i);
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$intArr(PitfallTrap$DelayedPit.POSITIONS, this.positions);
    bundle.put$String$int(PitfallTrap$DelayedPit.DEPTH, this.depth_);
    bundle.put$String$int(PitfallTrap$DelayedPit.BRANCH, this.branch);
    bundle.put$String$boolean(PitfallTrap$DelayedPit.IGNORE_ALLIES, this.ignoreAllies);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.positions = bundle.getIntArray(PitfallTrap$DelayedPit.POSITIONS);
    this.depth_ = bundle.getInt(PitfallTrap$DelayedPit.DEPTH);
    this.branch = bundle.getInt(PitfallTrap$DelayedPit.BRANCH);
    this.ignoreAllies = bundle.getBoolean(PitfallTrap$DelayedPit.IGNORE_ALLIES);
  }
}

$J.define(PitfallTrap, 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.PitfallTrap', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.Trap', ctors: { '': '_PitfallTrap' } });
$J.define(PitfallTrap$DelayedPit, 'com.shatteredpixel.shatteredpixeldungeon.levels.traps.PitfallTrap$DelayedPit', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.FlavourBuff', ctors: { '': '_PitfallTrap$DelayedPit' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  PitfallParticle = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.particles.PitfallParticle');
  Heap$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap$Type');
  Chasm = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.features.Chasm');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
