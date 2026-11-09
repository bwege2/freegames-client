// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/rings/Ring.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, LinkedHashMap } from '../../../../../../jre/index.ts';
import { KindofMisc } from '../KindofMisc.ts';
import { Buff } from '../../actors/buffs/Buff.ts';

let Badges, Dungeon, Statistics, Actor, EnhancedRings, MagicImmune, Hero, Talent, SpiritForm$SpiritFormBuff, Generator$Category, ItemStatusHandler, ShardOfOblivion, Catalog, Messages, ItemSpriteSheet, GLog, Random;

export class Ring extends KindofMisc {
  buff_: Buff = null;
  buffClass: JClass<Ring$RingBuff> = null;
  static gems: LinkedHashMap<string, number> = null;
  static handler: ItemStatusHandler<Ring> = null;
  gem: string = null;
  levelsToID: number = 0;
  anonymous: boolean = false;
  static readonly LEVELS_TO_ID: string = 'levels_to_ID';
  _Ring(): this {
    this._KindofMisc();
    this.levelsToID = 1;
    this.anonymous = false;
    this.reset();
    return this;
  }
  static initGems(): void {
    Ring.handler = new ItemStatusHandler()._ItemStatusHandler$ClassArr$HashMap(Generator$Category.RING.classes, Ring.gems);
  }
  static clearGems(): void {
    Ring.handler = null;
  }
  static save(bundle: Bundle): void {
    Ring.handler.save(bundle);
  }
  static saveSelectively(bundle: Bundle, items: ArrayList<Item>): void {
    Ring.handler.saveSelectively(bundle, items);
  }
  static restore(bundle: Bundle): void {
    Ring.handler = new ItemStatusHandler()._ItemStatusHandler$ClassArr$HashMap$Bundle(Generator$Category.RING.classes, Ring.gems, bundle);
  }
  anonymize(): void {
    if (!this.isKnown()) {
      this.image_ = ItemSpriteSheet.RING_HOLDER;
    }
    this.anonymous = true;
  }
  reset(): void {
    super.reset();
    this.levelsToID = 1;
    if (Ring.handler != null && Ring.handler.contains$Item(this)) {
      this.image_ = Ring.handler.image$Item(this);
      this.gem = Ring.handler.label$Item(this);
    } else {
      this.image_ = ItemSpriteSheet.RING_GARNET;
      this.gem = 'garnet';
    }
  }
  activate(ch: Char): void {
    if (this.buff_ != null) {
      this.buff_.detach();
      this.buff_ = null;
    }
    this.buff_ = this.buff();
    this.buff_.attachTo(ch);
  }
  doUnequip$Hero$boolean$boolean(hero: Hero, collect: boolean, single: boolean): boolean {
    if (super.doUnequip$Hero$boolean$boolean(hero, collect, single)) {
      if (this.buff_ != null) {
        this.buff_.detach();
        this.buff_ = null;
      }
      return true;
    } else {
      return false;
    }
  }
  isKnown(): boolean {
    return this.anonymous || (Ring.handler != null && Ring.handler.isKnown$Item(this));
  }
  setKnown(): void {
    if (!this.anonymous) {
      if (!this.isKnown()) {
        Ring.handler.know$Item(this);
      }
      if (Dungeon.hero.isAlive()) {
        Catalog.setSeen($J.getClass(this));
        Statistics.itemTypesDiscovered.add($J.getClass(this));
      }
    }
  }
  name(): string {
    return this.isKnown() ? super.name() : Messages.get$Class$String$ObjectArr($J.cls(Ring), this.gem, []);
  }
  desc(): string {
    return this.isKnown() ? super.desc() : Messages.get$Object$String$ObjectArr(this, 'unknown_desc', []);
  }
  info(): string {
    let desc: string;
    if (this.anonymous && (Ring.handler == null || !Ring.handler.isKnown$Item(this))) {
      desc = this.desc();
    } else {
      desc = super.info();
    }
    if (this.cursed && this.isEquipped(Dungeon.hero)) {
      desc += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(Ring), 'cursed_worn', []);
    } else if (this.cursed && this.cursedKnown) {
      desc += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(Ring), 'curse_known', []);
    } else if (!this.isIdentified() && this.cursedKnown) {
      desc += '\n\n' + Messages.get$Class$String$ObjectArr($J.cls(Ring), 'not_cursed', []);
    }
    if (this.isKnown()) {
      desc += '\n\n' + this.statsInfo();
    }
    return desc;
  }
  statsInfo(): string {
    return '';
  }
  upgradeStat1(level: number): string {
    return null;
  }
  upgradeStat2(level: number): string {
    return null;
  }
  upgradeStat3(level: number): string {
    return null;
  }
  upgrade$(): Item {
    super.upgrade$();
    if (Random.Int$int(3) === 0) {
      this.cursed = false;
    }
    return this;
  }
  isIdentified(): boolean {
    return super.isIdentified() && this.isKnown();
  }
  identify$boolean(byHero: boolean): Item {
    this.setKnown();
    this.levelsToID = 0;
    return super.identify$boolean(byHero);
  }
  setIDReady(): void {
    this.levelsToID = -1;
  }
  readyToIdentify(): boolean {
    return !this.isIdentified() && this.levelsToID <= Math.fround(0);
  }
  random(): Item {
    let n = 0;
    if (Random.Int$int(3) === 0) {
      n++;
      if (Random.Int$int(5) === 0) {
        n++;
      }
    }
    this.level$int(n);
    if (Random.Float$() < Math.fround(0.3)) {
      this.cursed = true;
    }
    return this;
  }
  static getKnown(): HashSet<JClass<Ring>> {
    return Ring.handler.known();
  }
  static getUnknown(): HashSet<JClass<Ring>> {
    return Ring.handler.unknown();
  }
  static allKnown(): boolean {
    return Ring.handler != null && Ring.handler.known().size() === Generator$Category.RING.classes.length;
  }
  value(): number {
    let price = 75;
    if (this.cursed && this.cursedKnown) {
      price = $J.idiv(price, 2);
    }
    if (this.levelKnown) {
      if (this.level$() > 0) {
        price = Math.imul(price, ((this.level$() + 1) | 0));
      } else if (this.level$() < 0) {
        price = $J.idiv(price, ((1 - this.level$()) | 0));
      }
    }
    if (price < 1) {
      price = 1;
    }
    return price;
  }
  buff(): Ring$RingBuff {
    return null;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$float(Ring.LEVELS_TO_ID, this.levelsToID);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.levelsToID = bundle.getFloat(Ring.LEVELS_TO_ID);
  }
  onHeroGainExp(levelPercent: number, hero: Hero): void {
    if (this.isIdentified() || !this.isEquipped(hero)) {
      return;
    }
    levelPercent = Math.fround(levelPercent * Talent.itemIDSpeedFactor(hero, this));
    this.levelsToID = Math.fround(this.levelsToID - levelPercent);
    if (this.levelsToID <= Math.fround(0)) {
      if (ShardOfOblivion.passiveIDDisabled()) {
        if (this.levelsToID > Math.fround(-1)) {
          GLog.p(Messages.get$Class$String$ObjectArr($J.cls(ShardOfOblivion), 'identify_ready', []), [this.name()]);
        }
        this.setIDReady();
      } else {
        this.identify$();
        GLog.p(Messages.get$Class$String$ObjectArr($J.cls(Ring), 'identify', []), []);
        Badges.validateItemLevelAquired(this);
      }
    }
  }
  buffedLvl(): number {
    let lvl = super.buffedLvl();
    if (Dungeon.hero.buff($J.cls(EnhancedRings)) != null) {
      lvl++;
    }
    return lvl;
  }
  static getBonus(target: Char, type$: JClass<Ring$RingBuff>): number {
    if (target.buff($J.cls(MagicImmune)) != null) {
      return 0;
    }
    let bonus = 0;
    for (const $it0 = target.buffs$Class(type$).iterator(); $it0.hasNext(); ) {
      let buff = $it0.next();
      bonus = (bonus + buff.level()) | 0;
    }
    let spiritForm = target.buff($J.cls(SpiritForm$SpiritFormBuff));
    if (bonus === 0 && spiritForm != null && spiritForm.ring() != null && spiritForm.ring().buffClass === type$) {
      bonus = (bonus + spiritForm.ring().soloBonus()) | 0;
    }
    return bonus;
  }
  static getBuffedBonus(target: Char, type$: JClass<Ring$RingBuff>): number {
    if (target.buff($J.cls(MagicImmune)) != null) {
      return 0;
    }
    let bonus = 0;
    for (const $it1 = target.buffs$Class(type$).iterator(); $it1.hasNext(); ) {
      let buff = $it1.next();
      bonus = (bonus + buff.buffedLvl()) | 0;
    }
    if (bonus === 0 && target.buff($J.cls(SpiritForm$SpiritFormBuff)) != null && target.buff($J.cls(SpiritForm$SpiritFormBuff)).ring() != null && target.buff($J.cls(SpiritForm$SpiritFormBuff)).ring().buffClass === type$) {
      bonus = (bonus + target.buff($J.cls(SpiritForm$SpiritFormBuff)).ring().soloBuffedBonus()) | 0;
    }
    return bonus;
  }
  soloBonus(): number {
    if (this.cursed) {
      return Math.min(0, (this.level$() - 2) | 0);
    } else {
      return (this.level$() + 1) | 0;
    }
  }
  soloBuffedBonus(): number {
    if (this.cursed) {
      return Math.min(0, (this.buffedLvl() - 2) | 0);
    } else {
      return (this.buffedLvl() + 1) | 0;
    }
  }
  combinedBonus(hero: Hero): number {
    let bonus = 0;
    if (hero.belongings.ring() != null && hero.belongings.ring().getClass() === $J.getClass(this)) {
      bonus = (bonus + hero.belongings.ring().soloBonus()) | 0;
    }
    if (hero.belongings.misc() != null && hero.belongings.misc().getClass() === $J.getClass(this)) {
      bonus = (bonus + (hero.belongings.misc()).soloBonus()) | 0;
    }
    return bonus;
  }
  combinedBuffedBonus(hero: Hero): number {
    let bonus = 0;
    if (hero.belongings.ring() != null && hero.belongings.ring().getClass() === $J.getClass(this)) {
      bonus = (bonus + hero.belongings.ring().soloBuffedBonus()) | 0;
    }
    if (hero.belongings.misc() != null && hero.belongings.misc().getClass() === $J.getClass(this)) {
      bonus = (bonus + (hero.belongings.misc()).soloBuffedBonus()) | 0;
    }
    return bonus;
  }
  static $clinit() {
    Ring.gems = new (Ring$1())()._LinkedHashMap().$init_anon();
  }
}

export class Ring$RingBuff extends Buff {
  _Ring$RingBuff(): this {
    this._Buff();
    return this;
  }
  attachTo(target: Char): boolean {
    if (super.attachTo(target)) {
      if (target instanceof Hero && Dungeon.hero == null && this.cooldown() === Math.fround(0) && target.cooldown() > Math.fround(0)) {
        this.spend(Actor.TICK);
      }
      return true;
    }
    return false;
  }
  act(): boolean {
    this.spend(Actor.TICK);
    return true;
  }
  level(): number {
    return this.$outer.soloBonus();
  }
  buffedLvl(): number {
    return this.$outer.soloBuffedBonus();
  }
}

let $Ring$1: any = null;
/** An anonymous class (Ring.java:55). */
function Ring$1(): any {
  return $Ring$1 ??= $J.local(class extends LinkedHashMap {
    $init_anon() {
      this.put('garnet', ItemSpriteSheet.RING_GARNET);
      this.put('ruby', ItemSpriteSheet.RING_RUBY);
      this.put('topaz', ItemSpriteSheet.RING_TOPAZ);
      this.put('emerald', ItemSpriteSheet.RING_EMERALD);
      this.put('onyx', ItemSpriteSheet.RING_ONYX);
      this.put('opal', ItemSpriteSheet.RING_OPAL);
      this.put('tourmaline', ItemSpriteSheet.RING_TOURMALINE);
      this.put('sapphire', ItemSpriteSheet.RING_SAPPHIRE);
      this.put('amethyst', ItemSpriteSheet.RING_AMETHYST);
      this.put('quartz', ItemSpriteSheet.RING_QUARTZ);
      this.put('agate', ItemSpriteSheet.RING_AGATE);
      this.put('diamond', ItemSpriteSheet.RING_DIAMOND);
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring$1', []);
}

$J.define(Ring, 'com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.KindofMisc', ctors: { '': '_Ring' }, meths: { 'identify(boolean)': 'identify$boolean', 'upgrade()': 'upgrade$', 'doUnequip(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,boolean,boolean)': 'doUnequip$Hero$boolean$boolean' }, clinit: true, lazy: ['gems', 'handler'] });
$J.define(Ring$RingBuff, 'com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring$RingBuff', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_Ring$RingBuff' }, inner: true });
$J.module(() => {
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  EnhancedRings = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.EnhancedRings');
  MagicImmune = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicImmune');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  SpiritForm$SpiritFormBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.SpiritForm$SpiritFormBuff');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  ItemStatusHandler = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.ItemStatusHandler');
  ShardOfOblivion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.trinkets.ShardOfOblivion');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Random = $J.load('com.watabou.utils.Random');
});
