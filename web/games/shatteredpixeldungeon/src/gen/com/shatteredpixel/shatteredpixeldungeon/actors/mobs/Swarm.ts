// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Swarm.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Mob } from './Mob.ts';

let Dungeon, Dungeon$LimitedDrops, Actor, Char$Property, Buff, Burning, Poison, Pushing, PotionOfHealing, GameScene, SwarmSprite, Random;

export class Swarm extends Mob {
  static readonly SPLIT_DELAY: number = 1;
  generation: number = 0;
  static readonly GENERATION: string = 'generation';
  _Swarm(): this {
    this._Mob();
    this.spriteClass = $J.cls(SwarmSprite);
    this.HP = this.HT = 50;
    this.defenseSkill_ = 5;
    this.EXP = 3;
    this.maxLvl = 9;
    this.flying = true;
    this.loot = $J.cls(PotionOfHealing);
    this.lootChance_ = Math.fround(0.1667);
    this.generation = 0;
    return this;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(Swarm.GENERATION, this.generation);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.generation = bundle.getInt(Swarm.GENERATION);
    if (this.generation > 0) {
      this.EXP = 0;
    }
  }
  die(cause: any): void {
    this.flying = false;
    super.die(cause);
  }
  damageRoll(): number {
    return Random.NormalIntRange(1, 4);
  }
  defenseProc(enemy: Char, damage: number): number {
    if (this.HP >= ((damage + 2) | 0)) {
      let candidates = new ArrayList();
      let neighbours = [(this.pos + 1) | 0, (this.pos - 1) | 0, (this.pos + Dungeon.level.width()) | 0, (this.pos - Dungeon.level.width()) | 0];
      for (let n of neighbours) {
        if (!Dungeon.level.solid[n] && Actor.findChar(n) == null && (Dungeon.level.passable[n] || Dungeon.level.avoid[n]) && (!this.properties().contains(Char$Property.LARGE) || Dungeon.level.openSpace[n])) {
          candidates.add(n);
        }
      }
      if (candidates.size() > 0) {
        let clone = this.split();
        clone.pos = Random.element$Collection(candidates);
        clone.state_ = clone.HUNTING;
        GameScene.add$Mob$float(clone, Swarm.SPLIT_DELAY);
        clone.HP = $J.idiv(((this.HP - damage) | 0), 2);
        Actor.add$Actor(new Pushing()._Pushing$Char$int$int(clone, this.pos, clone.pos));
        Dungeon.level.occupyCell(clone);
        this.HP = (this.HP - clone.HP) | 0;
      }
    }
    return super.defenseProc(enemy, damage);
  }
  attackSkill(target: Char): number {
    return 10;
  }
  split(): Swarm {
    let clone = new Swarm()._Swarm();
    clone.generation = (this.generation + 1) | 0;
    clone.EXP = 0;
    if (this.buff($J.cls(Burning)) != null) {
      Buff.affect$Char$Class(clone, $J.cls(Burning)).reignite$Char(clone);
    }
    if (this.buff($J.cls(Poison)) != null) {
      Buff.affect$Char$Class(clone, $J.cls(Poison)).set(2);
    }
    for (const $it0 = this.buffs$().iterator(); $it0.hasNext(); ) {
      let b = $it0.next();
      if (b.revivePersists) {
        Buff.affect$Char$Class(clone, b.getClass());
      }
    }
    return clone;
  }
  lootChance(): number {
    this.lootChance_ = Math.fround(1 / (Math.imul(6, ((this.generation + 1) | 0))));
    return Math.fround(Math.fround(super.lootChance() * (Math.fround(5 - Dungeon$LimitedDrops.SWARM_HP.count_))) / 5);
  }
  createLoot(): Item {
    Dungeon$LimitedDrops.SWARM_HP.count_++;
    return super.createLoot();
  }
}

$J.define(Swarm, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Swarm', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_Swarm' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Dungeon$LimitedDrops = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon$LimitedDrops');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Burning = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Burning');
  Poison = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Poison');
  Pushing = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Pushing');
  PotionOfHealing = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfHealing');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  SwarmSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.SwarmSprite');
  Random = $J.load('com.watabou.utils.Random');
});
