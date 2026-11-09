// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/DM201.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { DM200 } from './DM200.ts';
import { Mob$Hunting } from './Mob.ts';

let Dungeon, Actor, Char, Char$Property, Blob, CorrosiveGas, Corruption, MetalShard, GameScene, DM201Sprite, PathFinder, Random;

export class DM201 extends DM200 {
  threatened: boolean = false;
  _DM201(): this {
    this._DM200();
    this.spriteClass = $J.cls(DM201Sprite);
    this.HP = this.HT = 120;
    this.properties_.add(Char$Property.IMMOVABLE);
    this.HUNTING = new DM201$Hunting().$o(this)._DM201$Hunting();
    this.threatened = false;
    return this;
  }
  damageRoll(): number {
    return Random.NormalIntRange(15, 25);
  }
  damage(dmg: number, src: any): void {
    if (!(src instanceof Corruption)) {
      if ((src instanceof Char && !Dungeon.level.adjacent(this.pos, (src).pos)) || this.enemy == null || !Dungeon.level.adjacent(this.pos, this.enemy.pos)) {
        this.threatened = true;
      }
    }
    super.damage(dmg, src);
  }
  onZapComplete(): void {
    this.zap$$DM201();
    this.next();
  }
  zap$$DM201(): void {
    this.threatened = false;
    this.spend(Actor.TICK);
    GameScene.add$Blob(Blob.seed$int$int$Class(this.enemy.pos, 15, $J.cls(CorrosiveGas)).setStrength$int(8));
    for (let i of PathFinder.NEIGHBOURS8) {
      if (!(Dungeon.level.solid[(this.enemy.pos + i) | 0])) {
        GameScene.add$Blob(Blob.seed$int$int$Class((this.enemy.pos + i) | 0, 5, $J.cls(CorrosiveGas)).setStrength$int(8));
      }
    }
  }
  canVent(target: number): boolean {
    return false;
  }
  getCloser(target: number): boolean {
    return false;
  }
  getFurther(target: number): boolean {
    return false;
  }
  rollToDropLoot(): void {
    if (Dungeon.hero.lvl > ((this.maxLvl + 2) | 0)) {
      return;
    }
    super.rollToDropLoot();
    let ofs: number;
    do {
      ofs = PathFinder.NEIGHBOURS8[Random.Int$int(8)];
    } while (Dungeon.level.solid[(this.pos + ofs) | 0] && !(Dungeon.level.passable[(this.pos + ofs) | 0]));
    Dungeon.level.drop(new MetalShard()._MetalShard(), (this.pos + ofs) | 0).sprite_.drop$int(this.pos);
  }
}

export class DM201$Hunting extends Mob$Hunting {
  _DM201$Hunting(): this {
    this._Mob$Hunting();
    return this;
  }
  act(enemyInFOV: boolean, justAlerted: boolean): boolean {
    if (this.$outer.threatened && enemyInFOV) {
      if (this.$outer.sprite_ != null && (this.$outer.sprite_.visible_ || this.$outer.enemy.sprite_.visible_)) {
        this.$outer.sprite_.zap$int(this.$outer.enemy.pos);
        return false;
      } else {
        this.$outer.zap$$DM201();
        return true;
      }
    } else {
      return super.act(enemyInFOV, justAlerted);
    }
  }
}

$J.define(DM201, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DM201', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DM200', ctors: { '': '_DM201' }, meths: { 'zap()': 'zap$$DM201' } });
$J.define(DM201$Hunting, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.DM201$Hunting', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Hunting', ctors: { '': '_DM201$Hunting' }, inner: true });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  CorrosiveGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.CorrosiveGas');
  Corruption = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Corruption');
  MetalShard = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.quest.MetalShard');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  DM201Sprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.DM201Sprite');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
