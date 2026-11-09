// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/GnollTrickster.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Gnoll } from './Gnoll.ts';
import { Mob$Wandering } from './Mob.ts';

let Dungeon, Statistics, Char$Property, Blob, Fire, Buff, Burning, Poison, Ghost$Quest, Generator$Category, Ballistica, GameScene, GnollTricksterSprite, PathFinder, Random;

export class GnollTrickster extends Gnoll {
  combo: number = 0;
  static readonly COMBO: string = 'combo';
  _GnollTrickster(): this {
    this._Gnoll();
    this.spriteClass = $J.cls(GnollTricksterSprite);
    this.HP = this.HT = 20;
    this.defenseSkill_ = 5;
    this.EXP = 5;
    this.WANDERING = new GnollTrickster$Wandering().$o(this)._GnollTrickster$Wandering();
    this.state_ = this.WANDERING;
    this.loot = Generator$Category.MISSILE;
    this.lootChance_ = 1;
    this.properties_.add(Char$Property.MINIBOSS);
    this.combo = 0;
    return this;
  }
  attackSkill(target: Char): number {
    return 16;
  }
  canAttack(enemy: Char): boolean {
    return !Dungeon.level.adjacent(this.pos, enemy.pos) && (super.canAttack(enemy) || new Ballistica()._Ballistica(this.pos, enemy.pos, Ballistica.PROJECTILE).collisionPos === enemy.pos);
  }
  attackProc(enemy: Char, damage: number): number {
    damage = super.attackProc(enemy, damage);
    if (this.combo >= 1) {
      Statistics.questScores[0] = (Statistics.questScores[0] - 50) | 0;
    }
    this.combo++;
    let effect = (Random.Int$int(4) + this.combo) | 0;
    if (effect > 2) {
      if (effect >= 6 && enemy.buff($J.cls(Burning)) == null) {
        if (Dungeon.level.flamable[enemy.pos]) {
          GameScene.add$Blob(Blob.seed$int$int$Class(enemy.pos, 4, $J.cls(Fire)));
        }
        Buff.affect$Char$Class(enemy, $J.cls(Burning)).reignite$Char(enemy);
      } else {
        Buff.affect$Char$Class(enemy, $J.cls(Poison)).set(Math.fround(((effect - 2) | 0)));
      }
    }
    return damage;
  }
  getCloser(target: number): boolean {
    this.combo = 0;
    if (this.state_ === this.HUNTING) {
      return this.enemySeen && this.getFurther(target);
    } else {
      return super.getCloser(target);
    }
  }
  aggro(ch: Char): void {
    if (ch == null || this.fieldOfView == null || this.fieldOfView.length !== Dungeon.level.length() || this.fieldOfView[ch.pos]) {
      super.aggro(ch);
    }
  }
  createLoot(): Item {
    let drop = super.createLoot();
    drop.level$int(0);
    if (drop.hasCurseEnchant()) {
      drop.enchant$Enchantment(null);
    }
    drop.cursed = false;
    drop.identify$boolean(false);
    drop.quantity$int($J.idiv(((drop.quantity$() + 1) | 0), 2));
    return drop;
  }
  die(cause: any): void {
    super.die(cause);
    Ghost$Quest.process();
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(GnollTrickster.COMBO, this.combo);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.combo = bundle.getInt(GnollTrickster.COMBO);
  }
}

export class GnollTrickster$Wandering extends Mob$Wandering {
  _GnollTrickster$Wandering(): this {
    this._Mob$Wandering();
    return this;
  }
  randomDestination(): number {
    let pos1 = super.randomDestination();
    let pos2 = super.randomDestination();
    PathFinder.buildDistanceMap$int$booleanArr(Dungeon.hero.pos, Dungeon.level.passable);
    if (PathFinder.distance[pos2] < PathFinder.distance[pos1]) {
      return pos2;
    } else {
      return pos1;
    }
  }
}

$J.define(GnollTrickster, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollTrickster', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Gnoll', ctors: { '': '_GnollTrickster' } });
$J.define(GnollTrickster$Wandering, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GnollTrickster$Wandering', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Wandering', ctors: { '': '_GnollTrickster$Wandering' }, inner: true });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Blob = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Blob');
  Fire = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Fire');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Burning = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Burning');
  Poison = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Poison');
  Ghost$Quest = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.npcs.Ghost$Quest');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  Ballistica = $J.load('com.shatteredpixel.shatteredpixeldungeon.mechanics.Ballistica');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  GnollTricksterSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.GnollTricksterSprite');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
  Random = $J.load('com.watabou.utils.Random');
});
