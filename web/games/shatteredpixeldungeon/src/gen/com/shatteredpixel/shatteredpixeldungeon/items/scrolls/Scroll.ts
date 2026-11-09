// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/scrolls/Scroll.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, HashMap, LinkedHashMap } from '../../../../../../jre/index.ts';
import { Item } from '../Item.ts';
import { Recipe } from '../Recipe.ts';

let Dungeon, Statistics, Blindness, Invisibility, MagicImmune, Talent, Generator$Category, ItemStatusHandler, UnstableSpellbook$bookRecharge, ScrollOfIdentify, ScrollOfLullaby, ScrollOfMagicMapping, ScrollOfMirrorImage, ScrollOfRage, ScrollOfRecharging, ScrollOfRemoveCurse, ScrollOfRetribution, ScrollOfTeleportation, ScrollOfTerror, ScrollOfTransmutation, ScrollOfUpgrade, ExoticScroll, ScrollOfAntiMagic, Runestone$PlaceHolder, StoneOfAggression, StoneOfAugmentation, StoneOfBlast, StoneOfBlink, StoneOfClairvoyance, StoneOfDeepSleep, StoneOfDetectMagic, StoneOfEnchantment, StoneOfFear, StoneOfFlock, StoneOfIntuition, StoneOfShock, Catalog, Messages, AlchemyScene, ItemSpriteSheet, GLog, Game, Random, Reflection;

export class Scroll extends Item {
  static readonly AC_READ: string = 'READ';
  static readonly TIME_TO_READ: number = 1;
  static runes: LinkedHashMap<string, number> = null;
  static handler: ItemStatusHandler<Scroll> = null;
  rune: string = null;
  talentFactor: number = 0;
  talentChance: number = 0;
  anonymous: boolean = false;
  _Scroll(): this {
    this._Item();
    this.talentFactor = 1;
    this.talentChance = 1;
    this.stackable = true;
    this.defaultAction_ = Scroll.AC_READ;
    this.anonymous = false;
    this.reset();
    return this;
  }
  static initLabels(): void {
    Scroll.handler = new ItemStatusHandler()._ItemStatusHandler$ClassArr$HashMap(Generator$Category.SCROLL.classes, Scroll.runes);
  }
  static clearLabels(): void {
    Scroll.handler = null;
  }
  static save(bundle: Bundle): void {
    Scroll.handler.save(bundle);
  }
  static saveSelectively(bundle: Bundle, items: ArrayList<Item>): void {
    let classes = new ArrayList();
    for (const $it0 = items.iterator(); $it0.hasNext(); ) {
      let i = $it0.next();
      if (i instanceof ExoticScroll) {
        if (!classes.contains(ExoticScroll.exoToReg.get(i.getClass()))) {
          classes.add(ExoticScroll.exoToReg.get(i.getClass()));
        }
      } else if (i instanceof Scroll) {
        if (!classes.contains(i.getClass())) {
          classes.add(i.getClass());
        }
      }
    }
    Scroll.handler.saveClassesSelectively(bundle, classes);
  }
  static restore(bundle: Bundle): void {
    Scroll.handler = new ItemStatusHandler()._ItemStatusHandler$ClassArr$HashMap$Bundle(Generator$Category.SCROLL.classes, Scroll.runes, bundle);
  }
  anonymize(): void {
    if (!this.isKnown()) {
      this.image_ = ItemSpriteSheet.SCROLL_HOLDER;
    }
    this.anonymous = true;
  }
  reset(): void {
    super.reset();
    if (Scroll.handler != null && Scroll.handler.contains$Item(this)) {
      this.image_ = Scroll.handler.image$Item(this);
      this.rune = Scroll.handler.label$Item(this);
    } else {
      this.image_ = ItemSpriteSheet.SCROLL_KAUNAN;
      this.rune = 'KAUNAN';
    }
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    actions.add(Scroll.AC_READ);
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if ($J.equals(action, Scroll.AC_READ)) {
      if (hero.buff($J.cls(MagicImmune)) != null) {
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'no_magic', []), []);
      } else if (hero.buff($J.cls(Blindness)) != null) {
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'blinded', []), []);
      } else if (hero.buff($J.cls(UnstableSpellbook$bookRecharge)) != null && hero.buff($J.cls(UnstableSpellbook$bookRecharge)).isCursed() && !(this instanceof ScrollOfRemoveCurse || this instanceof ScrollOfAntiMagic)) {
        GLog.n(Messages.get$Object$String$ObjectArr(this, 'cursed', []), []);
      } else {
        this.doRead();
      }
    }
  }
  readAnimation(): void {
    Invisibility.dispel$();
    Item.curUser.spend(Scroll.TIME_TO_READ);
    Item.curUser.busy();
    (Item.curUser.sprite_).read();
    if (!this.anonymous) {
      Catalog.countUse($J.getClass(this));
    }
    if (Random.Float$() < this.talentChance) {
      Talent.onScrollUsed(Item.curUser, Item.curUser.pos, this.talentFactor, $J.getClass(this));
    }
  }
  isKnown(): boolean {
    return this.anonymous || (Scroll.handler != null && Scroll.handler.isKnown$Item(this));
  }
  setKnown(): void {
    if (!this.anonymous) {
      if (!this.isKnown()) {
        Scroll.handler.know$Item(this);
        Item.updateQuickslot();
      }
      if (Dungeon.hero.isAlive()) {
        Catalog.setSeen($J.getClass(this));
        Statistics.itemTypesDiscovered.add($J.getClass(this));
      }
    }
  }
  identify$boolean(byHero: boolean): Item {
    super.identify$boolean(byHero);
    if (!this.isKnown()) {
      this.setKnown();
    }
    return this;
  }
  name(): string {
    return this.isKnown() ? super.name() : Messages.get$Object$String$ObjectArr(this, this.rune, []);
  }
  info(): string {
    return (this.anonymous && (Scroll.handler == null || !Scroll.handler.isKnown$Item(this))) ? this.desc() : super.info();
  }
  desc(): string {
    return this.isKnown() ? super.desc() : Messages.get$Object$String$ObjectArr(this, 'unknown_desc', []);
  }
  isUpgradable(): boolean {
    return false;
  }
  isIdentified(): boolean {
    return this.isKnown();
  }
  static getKnown(): HashSet<JClass<Scroll>> {
    return Scroll.handler.known();
  }
  static getUnknown(): HashSet<JClass<Scroll>> {
    return Scroll.handler.unknown();
  }
  static allKnown(): boolean {
    return Scroll.handler != null && Scroll.handler.known().size() === Generator$Category.SCROLL.classes.length;
  }
  value(): number {
    return Math.imul(30, this.quantity);
  }
  energyVal(): number {
    return Math.imul(6, this.quantity);
  }
  static $clinit() {
    Scroll.runes = new (Scroll$1())()._LinkedHashMap().$init_anon();
  }
}

export class Scroll$PlaceHolder extends Scroll {
  _Scroll$PlaceHolder(): this {
    this._Scroll();
    this.image_ = ItemSpriteSheet.SCROLL_HOLDER;
    return this;
  }
  isSimilar(item: Item): boolean {
    return ExoticScroll.regToExo.containsKey(item.getClass()) || ExoticScroll.regToExo.containsValue(item.getClass());
  }
  doRead(): void {
  }
  info(): string {
    return '';
  }
}

export class Scroll$ScrollToStone extends Recipe {
  static stones: HashMap<JClass<Scroll>, JClass<Runestone>> = null;
  _Scroll$ScrollToStone(): this {
    this._Recipe();
    return this;
  }
  testIngredients(ingredients: ArrayList<Item>): boolean {
    if (ingredients.size() !== 1 || !(ingredients.get(0) instanceof Scroll) || !Scroll$ScrollToStone.stones.containsKey(ingredients.get(0).getClass())) {
      return false;
    }
    return true;
  }
  cost(ingredients: ArrayList<Item>): number {
    return 0;
  }
  brew(ingredients: ArrayList<Item>): Item {
    if (!this.testIngredients(ingredients)) {
      return null;
    }
    let s = ingredients.get(0);
    s.quantity$int((s.quantity$() - 1) | 0);
    if (Game.scene() instanceof AlchemyScene) {
      if (!s.isIdentified()) {
        (Game.scene()).showIdentify(s);
      }
    } else {
      s.identify$();
    }
    return Reflection.newInstance(Scroll$ScrollToStone.stones.get(s.getClass())).quantity$int(2);
  }
  sampleOutput(ingredients: ArrayList<Item>): Item {
    if (!this.testIngredients(ingredients)) {
      return null;
    }
    let s = ingredients.get(0);
    if (!s.isKnown()) {
      return new Runestone$PlaceHolder()._Runestone$PlaceHolder().quantity$int(2);
    } else {
      return Reflection.newInstance(Scroll$ScrollToStone.stones.get(s.getClass())).quantity$int(2);
    }
  }
  static $clinit() {
    Scroll$ScrollToStone.stones = new HashMap();
    Scroll$ScrollToStone.stones.put($J.cls(ScrollOfIdentify), $J.cls(StoneOfIntuition));
    Scroll$ScrollToStone.stones.put($J.cls(ScrollOfLullaby), $J.cls(StoneOfDeepSleep));
    Scroll$ScrollToStone.stones.put($J.cls(ScrollOfMagicMapping), $J.cls(StoneOfClairvoyance));
    Scroll$ScrollToStone.stones.put($J.cls(ScrollOfMirrorImage), $J.cls(StoneOfFlock));
    Scroll$ScrollToStone.stones.put($J.cls(ScrollOfRetribution), $J.cls(StoneOfBlast));
    Scroll$ScrollToStone.stones.put($J.cls(ScrollOfRage), $J.cls(StoneOfAggression));
    Scroll$ScrollToStone.stones.put($J.cls(ScrollOfRecharging), $J.cls(StoneOfShock));
    Scroll$ScrollToStone.stones.put($J.cls(ScrollOfRemoveCurse), $J.cls(StoneOfDetectMagic));
    Scroll$ScrollToStone.stones.put($J.cls(ScrollOfTeleportation), $J.cls(StoneOfBlink));
    Scroll$ScrollToStone.stones.put($J.cls(ScrollOfTerror), $J.cls(StoneOfFear));
    Scroll$ScrollToStone.stones.put($J.cls(ScrollOfTransmutation), $J.cls(StoneOfAugmentation));
    Scroll$ScrollToStone.stones.put($J.cls(ScrollOfUpgrade), $J.cls(StoneOfEnchantment));
  }
}

let $Scroll$1: any = null;
/** An anonymous class (Scroll.java:73). */
function Scroll$1(): any {
  return $Scroll$1 ??= $J.local(class extends LinkedHashMap {
    $init_anon() {
      this.put('KAUNAN', ItemSpriteSheet.SCROLL_KAUNAN);
      this.put('SOWILO', ItemSpriteSheet.SCROLL_SOWILO);
      this.put('LAGUZ', ItemSpriteSheet.SCROLL_LAGUZ);
      this.put('YNGVI', ItemSpriteSheet.SCROLL_YNGVI);
      this.put('GYFU', ItemSpriteSheet.SCROLL_GYFU);
      this.put('RAIDO', ItemSpriteSheet.SCROLL_RAIDO);
      this.put('ISAZ', ItemSpriteSheet.SCROLL_ISAZ);
      this.put('MANNAZ', ItemSpriteSheet.SCROLL_MANNAZ);
      this.put('NAUDIZ', ItemSpriteSheet.SCROLL_NAUDIZ);
      this.put('BERKANAN', ItemSpriteSheet.SCROLL_BERKANAN);
      this.put('ODAL', ItemSpriteSheet.SCROLL_ODAL);
      this.put('TIWAZ', ItemSpriteSheet.SCROLL_TIWAZ);
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll$1', []);
}

$J.define(Scroll, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_Scroll' }, meths: { 'identify(boolean)': 'identify$boolean', 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' }, clinit: true, lazy: ['runes', 'handler'] });
$J.define(Scroll$PlaceHolder, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll$PlaceHolder', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll', ctors: { '': '_Scroll$PlaceHolder' } });
$J.define(Scroll$ScrollToStone, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll$ScrollToStone', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe', ctors: { '': '_Scroll$ScrollToStone' }, clinit: true, lazy: ['stones'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Blindness = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Blindness');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  MagicImmune = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicImmune');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  ItemStatusHandler = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.ItemStatusHandler');
  UnstableSpellbook$bookRecharge = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.UnstableSpellbook$bookRecharge');
  ScrollOfIdentify = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfIdentify');
  ScrollOfLullaby = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfLullaby');
  ScrollOfMagicMapping = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfMagicMapping');
  ScrollOfMirrorImage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfMirrorImage');
  ScrollOfRage = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRage');
  ScrollOfRecharging = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRecharging');
  ScrollOfRemoveCurse = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRemoveCurse');
  ScrollOfRetribution = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfRetribution');
  ScrollOfTeleportation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTeleportation');
  ScrollOfTerror = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTerror');
  ScrollOfTransmutation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfTransmutation');
  ScrollOfUpgrade = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfUpgrade');
  ExoticScroll = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ExoticScroll');
  ScrollOfAntiMagic = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfAntiMagic');
  Runestone$PlaceHolder = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.Runestone$PlaceHolder');
  StoneOfAggression = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfAggression');
  StoneOfAugmentation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfAugmentation');
  StoneOfBlast = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfBlast');
  StoneOfBlink = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfBlink');
  StoneOfClairvoyance = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfClairvoyance');
  StoneOfDeepSleep = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfDeepSleep');
  StoneOfDetectMagic = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfDetectMagic');
  StoneOfEnchantment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfEnchantment');
  StoneOfFear = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfFear');
  StoneOfFlock = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfFlock');
  StoneOfIntuition = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfIntuition');
  StoneOfShock = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfShock');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  AlchemyScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.AlchemyScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Game = $J.load('com.watabou.noosa.Game');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
