// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/mobs/Mimic.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Arrays } from '../../../../../../jre/index.ts';
import { Mob } from './Mob.ts';

let Assets$Sounds, Challenges, Dungeon, Actor, Char, Char$Alignment, Char$Property, Buff$buffType, CrystalMimic, EbonyMimic, GoldenMimic, CellEmitter, Speck, Generator, Generator$Category, Gold, Heap, TimekeepersHourglass$timeFreeze, MimicTooth, Messages, Swiftthistle$TimeBubble, MimicSprite, GLog, Sample, Random;

export class Mimic extends Mob {
  level_: number = 0;
  items_: ArrayList<Item> = null;
  stealthy_: boolean = false;
  static readonly LEVEL: string = 'level';
  static readonly ITEMS: string = 'items';
  static readonly STEALTHY: string = 'stealthy';
  _Mimic(): this {
    this._Mob();
    this.spriteClass = $J.cls(MimicSprite);
    this.properties_.add(Char$Property.DEMONIC);
    this.EXP = 0;
    this.alignment = Char$Alignment.NEUTRAL;
    this.state_ = this.PASSIVE;
    this.stealthy_ = false;
    return this;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    if (this.items_ != null) {
      bundle.put$String$Collection(Mimic.ITEMS, this.items_);
    }
    bundle.put$String$int(Mimic.LEVEL, this.level_);
    bundle.put$String$boolean(Mimic.STEALTHY, this.stealthy_);
  }
  restoreFromBundle(bundle: Bundle): void {
    if (bundle.contains(Mimic.ITEMS)) {
      this.items_ = new ArrayList((bundle.getCollection(Mimic.ITEMS)));
    }
    this.level_ = bundle.getInt(Mimic.LEVEL);
    this.adjustStats(this.level_);
    this.stealthy_ = bundle.getBoolean(Mimic.STEALTHY);
    super.restoreFromBundle(bundle);
    if (this.state_ !== this.PASSIVE && this.alignment === Char$Alignment.NEUTRAL) {
      this.alignment = Char$Alignment.ENEMY;
    }
  }
  add(buff: Buff): boolean {
    if (super.add(buff)) {
      if (buff.type_ === Buff$buffType.NEGATIVE && this.alignment === Char$Alignment.NEUTRAL) {
        this.alignment = Char$Alignment.ENEMY;
        this.stopHiding();
        if (this.sprite_ != null) {
          this.sprite_.idle();
        }
      }
      return true;
    }
    return false;
  }
  name(): string {
    if (this.alignment === Char$Alignment.NEUTRAL) {
      return Messages.get$Class$String$ObjectArr($J.cls(Heap), 'chest', []);
    } else {
      return super.name();
    }
  }
  description(): string {
    if (this.alignment === Char$Alignment.NEUTRAL) {
      if (MimicTooth.stealthyMimics()) {
        return Messages.get$Class$String$ObjectArr($J.cls(Heap), 'chest_desc', []);
      } else {
        return Messages.get$Class$String$ObjectArr($J.cls(Heap), 'chest_desc', []) + '\n\n' + Messages.get$Object$String$ObjectArr(this, 'hidden_hint', []);
      }
    } else {
      return super.description();
    }
  }
  act(): boolean {
    if (this.alignment === Char$Alignment.NEUTRAL && this.state_ !== this.PASSIVE) {
      this.alignment = Char$Alignment.ENEMY;
      if (this.sprite_ != null) {
        this.sprite_.idle();
      }
      if (Dungeon.level.heroFOV[this.pos]) {
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'reveal', []), []);
        CellEmitter.get(this.pos).burst(Speck.factory$int(Speck.STAR), 10);
        Sample.INSTANCE.play$Object(Assets$Sounds.MIMIC);
      }
    }
    return super.act();
  }
  sprite(): CharSprite {
    let sprite = super.sprite();
    if (this.alignment === Char$Alignment.NEUTRAL) {
      sprite.hideMimic(this);
    }
    return sprite;
  }
  interact(c: Char): boolean {
    if (this.alignment !== Char$Alignment.NEUTRAL || c !== Dungeon.hero) {
      return super.interact(c);
    }
    this.stopHiding();
    Dungeon.hero.busy();
    Dungeon.hero.sprite_.operate$int(this.pos);
    if (Dungeon.hero.invisible <= 0 && Dungeon.hero.buff($J.cls(Swiftthistle$TimeBubble)) == null && Dungeon.hero.buff($J.cls(TimekeepersHourglass$timeFreeze)) == null) {
      return this.doAttack(Dungeon.hero);
    } else {
      this.sprite_.idle();
      this.alignment = Char$Alignment.ENEMY;
      Dungeon.hero.spendAndNext(1);
      return true;
    }
  }
  onAttackComplete(): void {
    super.onAttackComplete();
    if (this.alignment === Char$Alignment.NEUTRAL) {
      this.alignment = Char$Alignment.ENEMY;
      Dungeon.hero.spendAndNext(1);
      this.enemySeen = true;
    }
  }
  defenseProc(enemy: Char, damage: number): number {
    if (this.state_ === this.PASSIVE) {
      this.alignment = Char$Alignment.ENEMY;
      this.stopHiding();
    }
    return super.defenseProc(enemy, damage);
  }
  damage(dmg: number, src: any): void {
    if (this.state_ === this.PASSIVE) {
      this.alignment = Char$Alignment.ENEMY;
      this.stopHiding();
    }
    super.damage(dmg, src);
  }
  die(cause: any): void {
    if (this.state_ === this.PASSIVE) {
      this.alignment = Char$Alignment.ENEMY;
      this.stopHiding();
    }
    super.die(cause);
  }
  stopHiding(): void {
    this.state_ = this.HUNTING;
    if (this.sprite_ != null) {
      this.sprite_.idle();
    }
    if (Actor.chars().contains(this) && Dungeon.level.heroFOV[this.pos]) {
      this.enemy = Dungeon.hero;
      this.target = Dungeon.hero.pos;
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'reveal', []), []);
      CellEmitter.get(this.pos).burst(Speck.factory$int(Speck.STAR), 10);
      Sample.INSTANCE.play$Object(Assets$Sounds.MIMIC);
    }
  }
  stealthy(): boolean {
    return this.stealthy_;
  }
  damageRoll(): number {
    if (this.alignment === Char$Alignment.NEUTRAL) {
      return Random.NormalIntRange((2 + Math.imul(2, this.level_)) | 0, (2 + Math.imul(2, this.level_)) | 0);
    } else {
      return Random.NormalIntRange((1 + this.level_) | 0, (2 + Math.imul(2, this.level_)) | 0);
    }
  }
  drRoll(): number {
    return (super.drRoll() + (Random.NormalIntRange(0, (1 + $J.idiv(this.level_, 2)) | 0))) | 0;
  }
  beckon(cell: number): void {
    if (this.alignment !== Char$Alignment.NEUTRAL) {
      super.beckon(cell);
    }
  }
  attackSkill(target: Char): number {
    if (target != null && this.alignment === Char$Alignment.NEUTRAL && target.invisible <= 0) {
      return Char.INFINITE_ACCURACY;
    } else {
      return (6 + this.level_) | 0;
    }
  }
  setLevel(level: number): void {
    this.level_ = level;
    this.adjustStats(level);
  }
  adjustStats(level: number): void {
    this.HP = this.HT = Math.imul(((1 + level) | 0), 6);
    this.defenseSkill_ = (2 + $J.idiv(level, 2)) | 0;
    this.enemySeen = true;
  }
  rollToDropLoot(): void {
    if (this.items_ != null) {
      for (const $it0 = this.items_.iterator(); $it0.hasNext(); ) {
        let item = $it0.next();
        Dungeon.level.drop(item, this.pos).sprite_.drop$();
      }
      this.items_ = null;
    }
    super.rollToDropLoot();
  }
  spawningWeight(): number {
    return 0;
  }
  reset(): boolean {
    if (this.state_ !== this.PASSIVE) {
      this.state_ = this.WANDERING;
    }
    return true;
  }
  static spawnAt$int$ItemArr(pos: number, items: Item[]): Mimic {
    return Mimic.spawnAt$int$Class$ItemArr(pos, $J.cls(Mimic), items);
  }
  static spawnAt$int$Class$ItemArr(pos: number, mimicType: JClass, items: Item[]): Mimic {
    return Mimic.spawnAt$int$Class$boolean$ItemArr(pos, mimicType, true, items);
  }
  static spawnAt$int$boolean$ItemArr(pos: number, useDecks: boolean, items: Item[]): Mimic {
    return Mimic.spawnAt$int$Class$boolean$ItemArr(pos, $J.cls(Mimic), useDecks, items);
  }
  static spawnAt$int$Class$boolean$ItemArr(pos: number, mimicType: JClass, useDecks: boolean, items: Item[]): Mimic {
    let m: Mimic;
    if (mimicType === $J.cls(GoldenMimic)) {
      m = new GoldenMimic()._GoldenMimic();
    } else if (mimicType === $J.cls(CrystalMimic)) {
      m = new CrystalMimic()._CrystalMimic();
    } else if (mimicType === $J.cls(EbonyMimic)) {
      m = new EbonyMimic()._EbonyMimic();
    } else {
      m = new Mimic()._Mimic();
    }
    m.items_ = new ArrayList(Arrays.asList(...items));
    m.setLevel(Dungeon.scalingDepth());
    m.pos = pos;
    m.generatePrize(useDecks);
    if (MimicTooth.stealthyMimics()) {
      m.stealthy_ = true;
    }
    return m;
  }
  generatePrize(useDecks: boolean): void {
    let reward = null;
    do {
      switch (Random.Int$int(5)) {
        case 0:
          reward = new Gold()._Gold$().random();
          break;
        case 1:
          reward = Generator.randomMissile$boolean(!useDecks);
          break;
        case 2:
          reward = Generator.randomArmor$();
          break;
        case 3:
          reward = Generator.randomWeapon$boolean(!useDecks);
          break;
        case 4:
          reward = useDecks ? Generator.random$Category(Generator$Category.RING) : Generator.randomUsingDefaults$Category(Generator$Category.RING);
          break;
      }
    } while (reward == null || Challenges.isItemBlocked(reward));
    this.items_.add(reward);
    if (MimicTooth.stealthyMimics()) {
      this.items_.add(Generator.randomUsingDefaults$());
    }
  }
}

$J.define(Mimic, 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mimic', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.mobs.Mob', ctors: { '': '_Mimic' }, meths: { 'spawnAt(int,java.lang.Class,boolean,com.shatteredpixel.shatteredpixeldungeon.items.Item[])': 'spawnAt$int$Class$boolean$ItemArr', 'spawnAt(int,boolean,com.shatteredpixel.shatteredpixeldungeon.items.Item[])': 'spawnAt$int$boolean$ItemArr', 'spawnAt(int,java.lang.Class,com.shatteredpixel.shatteredpixeldungeon.items.Item[])': 'spawnAt$int$Class$ItemArr', 'spawnAt(int,com.shatteredpixel.shatteredpixeldungeon.items.Item[])': 'spawnAt$int$ItemArr' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Buff$buffType = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff$buffType');
  CrystalMimic = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.CrystalMimic');
  EbonyMimic = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.EbonyMimic');
  GoldenMimic = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.mobs.GoldenMimic');
  CellEmitter = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.CellEmitter');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  Gold = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Gold');
  Heap = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Heap');
  TimekeepersHourglass$timeFreeze = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.TimekeepersHourglass$timeFreeze');
  MimicTooth = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.MimicTooth');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Swiftthistle$TimeBubble = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Swiftthistle$TimeBubble');
  MimicSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.MimicSprite');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
});
