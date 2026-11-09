// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Statue.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Dungeon, Char, Char$Property, Buff$buffType, ArmoredStatue, Generator, Generator$Category, RatSkull, Weapon$Enchantment, Corrupting$CorruptingTracker, Grim, Notes, Notes$Landmark, Messages, StatueSprite, GLog, Random;

export class Statue extends Mob {
  weapon_: Weapon = null;
  levelGenStatue: boolean = false;
  static readonly WEAPON: string = 'weapon';
  _Statue(): this {
    this._Mob();
    this.spriteClass = $J.cls(StatueSprite);
    this.EXP = 0;
    this.state_ = this.PASSIVE;
    this.properties_.add(Char$Property.INORGANIC);
    this.levelGenStatue = true;
    this.resistances_.add($J.cls(Grim));
    this.HP = this.HT = (15 + Math.imul(Dungeon.depth, 5)) | 0;
    this.defenseSkill_ = (4 + Dungeon.depth) | 0;
    return this;
  }
  createWeapon(useDecks: boolean): void {
    if (useDecks) {
      this.weapon_ = Generator.random$Category(Generator$Category.WEAPON);
    } else {
      this.weapon_ = Generator.randomUsingDefaults$Category(Generator$Category.WEAPON);
    }
    this.levelGenStatue = useDecks;
    this.weapon_.cursed = false;
    this.weapon_.enchant$Enchantment(Weapon$Enchantment.random([]));
  }
  weapon(): Weapon {
    return this.weapon_;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$Bundlable(Statue.WEAPON, this.weapon_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.weapon_ = bundle.get$String(Statue.WEAPON);
  }
  damageRoll(): number {
    return this.weapon_.damageRoll(this);
  }
  attackSkill(target: Char): number {
    return $J.d2i((Math.fround(((9 + Dungeon.depth) | 0) * this.weapon_.accuracyFactor(this, target))));
  }
  attackDelay(): number {
    return Math.fround(super.attackDelay() * this.weapon_.delayFactor(this));
  }
  canAttack(enemy: Char): boolean {
    return super.canAttack(enemy) || this.weapon_.canReach(this, enemy.pos);
  }
  drRoll(): number {
    return (super.drRoll() + (Random.NormalIntRange(0, (Dungeon.depth + this.weapon_.defenseFactor(this)) | 0))) | 0;
  }
  add(buff: Buff): boolean {
    if (super.add(buff)) {
      if (this.state_ === this.PASSIVE && buff.type_ === Buff$buffType.NEGATIVE) {
        this.state_ = this.HUNTING;
      }
      return true;
    }
    return false;
  }
  damage(dmg: number, src: any): void {
    if (this.state_ === this.PASSIVE) {
      this.state_ = this.HUNTING;
    }
    super.damage(dmg, src);
  }
  attackProc(enemy: Char, damage: number): number {
    damage = super.attackProc(enemy, damage);
    damage = this.weapon_.proc(this, enemy, damage);
    if (!enemy.isAlive() && enemy === Dungeon.hero) {
      Dungeon.fail(this);
      GLog.n(Messages.capitalize(Messages.get$Class$String$ObjectArr($J.cls(Char), 'kill', [this.name()])), []);
    }
    return damage;
  }
  beckon(cell: number): void {
    if (this.state_ !== this.PASSIVE) {
      super.beckon(cell);
    }
  }
  die(cause: any): void {
    if (this.buff($J.cls(Corrupting$CorruptingTracker)) == null) {
      this.weapon_.identify$boolean(false);
      Dungeon.level.drop(this.weapon_, this.pos).sprite_.drop$();
    }
    super.die(cause);
  }
  landmark(): Notes$Landmark {
    return this.levelGenStatue ? Notes$Landmark.STATUE : null;
  }
  destroy(): void {
    if (this.landmark() != null) {
      Notes.remove$Landmark(this.landmark());
    }
    super.destroy();
  }
  spawningWeight(): number {
    return 0;
  }
  reset(): boolean {
    return true;
  }
  description(): string {
    let desc = Messages.get$Object$String$ObjectArr(this, 'desc', []);
    if (this.weapon_ != null) {
      desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_weapon', [this.weapon_.name()]);
    }
    return desc;
  }
  static random$(): Statue {
    return Statue.random$boolean(true);
  }
  static random$boolean(useDecks: boolean): Statue {
    let statue: Statue;
    let altChance = Math.fround(Math.fround(1 / 10) * RatSkull.exoticChanceMultiplier$());
    if (altChance > Math.fround(0.1)) {
      altChance = Math.fround((Math.fround(altChance + Math.fround(0.1))) / 2);
    }
    if (Random.Float$() < altChance) {
      statue = new ArmoredStatue()._ArmoredStatue();
    } else {
      statue = new Statue()._Statue();
    }
    Random.pushGenerator$long(Random.Long$());
    statue.createWeapon(useDecks);
    Random.popGenerator();
    return statue;
  }
}

$J.define(Statue, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Statue', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_Statue' }, meths: { 'random(boolean)': 'random$boolean', 'random()': 'random$' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  ArmoredStatue = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.ArmoredStatue');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  RatSkull = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.RatSkull');
  Weapon$Enchantment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment');
  Corrupting$CorruptingTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Corrupting$CorruptingTracker');
  Grim = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Grim');
  Notes = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes');
  Notes$Landmark = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Notes$Landmark');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  StatueSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.StatueSprite');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Random = $J.load('com.watabou.utils.Random');
});
