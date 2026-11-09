// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Thief.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Mob } from './Mob.ts';
import { Mob$Wandering } from './Mob.ts';
import { Mob$Fleeing } from './Mob.ts';

let Dungeon, Dungeon$LimitedDrops, Char$Alignment, Char$Property, Hero, CellEmitter, Speck, Generator$Category, Gold, Honeypot, Honeypot$ShatteredPot, Item, Messages, ThiefSprite, GLog, Random;

export class Thief extends Mob {
  item_: Item = null;
  static readonly ITEM: string = 'item';
  _Thief(): this {
    this._Mob();
    this.spriteClass = $J.cls(ThiefSprite);
    this.HP = this.HT = 20;
    this.defenseSkill_ = 12;
    this.EXP = 5;
    this.maxLvl = 11;
    this.loot = Random.oneOf([Generator$Category.RING, Generator$Category.ARTIFACT]);
    this.lootChance_ = Math.fround(0.03);
    this.WANDERING = new Thief$Wandering().$o(this)._Thief$Wandering();
    this.FLEEING = new Thief$Fleeing().$o(this)._Thief$Fleeing();
    this.properties_.add(Char$Property.UNDEAD);
    return this;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$Bundlable(Thief.ITEM, this.item_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.item_ = bundle.get$String(Thief.ITEM);
  }
  speed(): number {
    if (this.item_ != null) {
      return Math.fround((Math.fround(5 * super.speed())) / 6);
    } else {
      return super.speed();
    }
  }
  damageRoll(): number {
    return Random.NormalIntRange(1, 10);
  }
  attackDelay(): number {
    return Math.fround(super.attackDelay() * 0.5);
  }
  lootChance(): number {
    return Math.fround(super.lootChance() * Math.fround($J.pow(Math.fround(1 / 3), Dungeon$LimitedDrops.THEIF_MISC.count_)));
  }
  rollToDropLoot(): void {
    if (this.item_ != null) {
      Dungeon.level.drop(this.item_, this.pos).sprite_.drop$();
      if (this.item_ instanceof Honeypot$ShatteredPot) {
        (this.item_).dropPot(this, this.pos);
      }
      this.item_ = null;
    }
    super.rollToDropLoot();
  }
  createLoot(): Item {
    Dungeon$LimitedDrops.THEIF_MISC.count_++;
    return super.createLoot();
  }
  attackSkill(target: Char): number {
    return 12;
  }
  drRoll(): number {
    return (super.drRoll() + Random.NormalIntRange(0, 3)) | 0;
  }
  attackProc(enemy: Char, damage: number): number {
    damage = super.attackProc(enemy, damage);
    if (this.alignment === Char$Alignment.ENEMY && this.item_ == null && enemy instanceof Hero && this.steal(enemy)) {
      this.state_ = this.FLEEING;
    }
    return damage;
  }
  defenseProc(enemy: Char, damage: number): number {
    if (this.state_ === this.FLEEING) {
      Dungeon.level.drop(new Gold()._Gold$(), this.pos).sprite_.drop$();
    }
    return super.defenseProc(enemy, damage);
  }
  steal(hero: Hero): boolean {
    let toSteal = hero.belongings.randomUnequipped();
    if (toSteal != null && !toSteal.unique && toSteal.level$() < 1) {
      GLog.w(Messages.get$Class$String$ObjectArr($J.cls(Thief), 'stole', [toSteal.name()]), []);
      if (!toSteal.stackable) {
        Dungeon.quickslot.convertToPlaceholder(toSteal);
      }
      Item.updateQuickslot();
      this.item_ = toSteal.detach(hero.belongings.backpack);
      if (this.item_ instanceof Honeypot) {
        this.item_ = (this.item_).shatter(this, this.pos);
      } else if (this.item_ instanceof Honeypot$ShatteredPot) {
        (this.item_).pickupPot(this);
      }
      return true;
    } else {
      return false;
    }
  }
  description(): string {
    let desc = super.description();
    if (this.item_ != null) {
      desc += Messages.get$Object$String$ObjectArr(this, 'carries', [this.item_.name()]);
    }
    return desc;
  }
}

export class Thief$Wandering extends Mob$Wandering {
  _Thief$Wandering(): this {
    this._Mob$Wandering();
    return this;
  }
  act(enemyInFOV: boolean, justAlerted: boolean): boolean {
    super.act(enemyInFOV, justAlerted);
    if (this.$outer.state_ === this.$outer.HUNTING && this.$outer.item_ != null) {
      this.$outer.state_ = this.$outer.FLEEING;
    }
    return true;
  }
}

export class Thief$Fleeing extends Mob$Fleeing {
  _Thief$Fleeing(): this {
    this._Mob$Fleeing();
    return this;
  }
  escaped(): void {
    if (this.$outer.item_ != null && !Dungeon.level.heroFOV[this.$outer.pos] && Dungeon.level.distance(Dungeon.hero.pos, this.$outer.pos) >= 6) {
      let count = 32;
      let newPos: number;
      do {
        newPos = Dungeon.level.randomRespawnCell(this.$outer);
        if (count-- <= 0) {
          break;
        }
      } while (newPos === -1 || Dungeon.level.heroFOV[newPos] || Dungeon.level.distance(newPos, this.$outer.pos) < ($J.idiv(count, 3)));
      if (newPos !== -1) {
        this.$outer.pos = newPos;
        this.$outer.sprite_.place(this.$outer.pos);
        this.$outer.sprite_.visible_ = Dungeon.level.heroFOV[this.$outer.pos];
        if (Dungeon.level.heroFOV[this.$outer.pos]) {
          CellEmitter.get(this.$outer.pos).burst(Speck.factory$int(Speck.WOOL), 6);
        }
      }
      if (this.$outer.item_ != null) {
        GLog.n(Messages.get$Class$String$ObjectArr($J.cls(Thief), 'escapes', [this.$outer.item_.name()]), []);
      }
      this.$outer.item_ = null;
      this.$outer.state_ = this.$outer.WANDERING;
    } else {
      this.$outer.state_ = this.$outer.WANDERING;
    }
  }
}

$J.define(Thief, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Thief', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_Thief' } });
$J.define(Thief$Wandering, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Thief$Wandering', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Wandering', ctors: { '': '_Thief$Wandering' }, inner: true });
$J.define(Thief$Fleeing, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Thief$Fleeing', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob$Fleeing', ctors: { '': '_Thief$Fleeing' }, inner: true });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Dungeon$LimitedDrops = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon$LimitedDrops');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  Gold = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Gold');
  Honeypot = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Honeypot');
  Honeypot$ShatteredPot = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Honeypot$ShatteredPot');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ThiefSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ThiefSprite');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Random = $J.load('com.watabou.utils.Random');
});
