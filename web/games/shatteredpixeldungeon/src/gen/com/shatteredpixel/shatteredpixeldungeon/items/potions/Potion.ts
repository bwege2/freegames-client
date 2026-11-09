// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/potions/Potion.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, HashMap, HashSet, LinkedHashMap } from '../../../../../../jre/index.ts';
import { Item } from '../Item.ts';
import { Recipe } from '../Recipe.ts';

let Assets$Sounds, Dungeon, Dungeon$LimitedDrops, Statistics, Actor, Char$Alignment, Fire, Buff, Burning, Ooze, Talent, Splash, Generator, Generator$Category, ItemStatusHandler, PotionOfExperience, PotionOfFrost, PotionOfHaste, PotionOfHealing, PotionOfInvisibility, PotionOfLevitation, PotionOfLiquidFlame, PotionOfMindVision, PotionOfParalyticGas, PotionOfPurity, PotionOfStrength, PotionOfToxicGas, AquaBrew, Brew, ElixirOfHoneyedHealing, ExoticPotion, PotionOfCleansing, PotionOfCorrosiveGas, PotionOfShroudingFog, PotionOfSnapFreeze, PotionOfStormClouds, Catalog, Terrain, Messages, Blindweed$Seed, Earthroot$Seed, Fadeleaf$Seed, Firebloom$Seed, Icecap$Seed, Mageroyal$Seed, Plant$Seed, Rotberry$Seed, Sorrowmoss$Seed, Starflower$Seed, Stormvine$Seed, Sungrass$Seed, Swiftthistle$Seed, GameScene, ItemSprite, ItemSpriteSheet, GLog, WndBag$Placeholder, WndOptions, WndUseItem, Sample, Random, Reflection;

export class Potion extends Item {
  static readonly AC_DRINK: string = 'DRINK';
  static readonly AC_CHOOSE: string = 'CHOOSE';
  static readonly TIME_TO_DRINK: number = 1;
  static colors: LinkedHashMap<string, number> = null;
  static mustThrowPots: HashSet<JClass<Potion>> = null;
  static canThrowPots: HashSet<JClass<Potion>> = null;
  static handler: ItemStatusHandler<Potion> = null;
  color_: string = null;
  talentFactor: number = 0;
  talentChance: number = 0;
  anonymous: boolean = false;
  _Potion(): this {
    this._Item();
    this.talentFactor = 1;
    this.talentChance = 1;
    this.stackable = true;
    this.defaultAction_ = Potion.AC_DRINK;
    this.anonymous = false;
    this.reset();
    return this;
  }
  static initColors(): void {
    Potion.handler = new ItemStatusHandler()._ItemStatusHandler$ClassArr$HashMap(Generator$Category.POTION.classes, Potion.colors);
  }
  static clearColors(): void {
    Potion.handler = null;
  }
  static save(bundle: Bundle): void {
    Potion.handler.save(bundle);
  }
  static saveSelectively(bundle: Bundle, items: ArrayList<Item>): void {
    let classes = new ArrayList();
    for (const $it0 = items.iterator(); $it0.hasNext(); ) {
      let i = $it0.next();
      if (i instanceof ExoticPotion) {
        if (!classes.contains(ExoticPotion.exoToReg.get(i.getClass()))) {
          classes.add(ExoticPotion.exoToReg.get(i.getClass()));
        }
      } else if (i instanceof Potion) {
        if (!classes.contains(i.getClass())) {
          classes.add(i.getClass());
        }
      }
    }
    Potion.handler.saveClassesSelectively(bundle, classes);
  }
  static restore(bundle: Bundle): void {
    Potion.handler = new ItemStatusHandler()._ItemStatusHandler$ClassArr$HashMap$Bundle(Generator$Category.POTION.classes, Potion.colors, bundle);
  }
  anonymize(): void {
    if (!this.isKnown()) {
      this.image_ = ItemSpriteSheet.POTION_HOLDER;
    }
    this.anonymous = true;
  }
  reset(): void {
    super.reset();
    if (Potion.handler != null && Potion.handler.contains$Item(this)) {
      this.image_ = Potion.handler.image$Item(this);
      this.color_ = Potion.handler.label$Item(this);
    } else {
      this.image_ = ItemSpriteSheet.POTION_CRIMSON;
      this.color_ = 'crimson';
    }
  }
  defaultAction(): string {
    if (this.isKnown() && Potion.mustThrowPots.contains(this.getClass())) {
      return Item.AC_THROW;
    } else if (this.isKnown() && Potion.canThrowPots.contains(this.getClass())) {
      return Potion.AC_CHOOSE;
    } else {
      return Potion.AC_DRINK;
    }
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    actions.add(Potion.AC_DRINK);
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if ($J.equals(action, Potion.AC_CHOOSE)) {
      GameScene.show(new WndUseItem()._WndUseItem(null, this));
    } else if ($J.equals(action, Potion.AC_DRINK)) {
      if (this.isKnown() && Potion.mustThrowPots.contains($J.getClass(this))) {
        GameScene.show(new (Potion$2())().$o(this).$c(hero)._WndOptions$Image$String$String$StringArr(new ItemSprite()._ItemSprite$Item(this), Messages.get$Class$String$ObjectArr($J.cls(Potion), 'harmful', []), Messages.get$Class$String$ObjectArr($J.cls(Potion), 'sure_drink', []), [Messages.get$Class$String$ObjectArr($J.cls(Potion), 'yes', []), Messages.get$Class$String$ObjectArr($J.cls(Potion), 'no', [])]));
      } else {
        this.drink(hero);
      }
    }
  }
  doThrow(hero: Hero): void {
    if (this.isKnown() && !Potion.mustThrowPots.contains(this.getClass()) && !Potion.canThrowPots.contains(this.getClass())) {
      GameScene.show(new (Potion$3())().$o(this).$c(hero)._WndOptions$Image$String$String$StringArr(new ItemSprite()._ItemSprite$Item(this), Messages.get$Class$String$ObjectArr($J.cls(Potion), 'beneficial', []), Messages.get$Class$String$ObjectArr($J.cls(Potion), 'sure_throw', []), [Messages.get$Class$String$ObjectArr($J.cls(Potion), 'yes', []), Messages.get$Class$String$ObjectArr($J.cls(Potion), 'no', [])]));
    } else {
      super.doThrow(hero);
    }
  }
  drink(hero: Hero): void {
    this.detach(hero.belongings.backpack);
    hero.spend(Potion.TIME_TO_DRINK);
    hero.busy();
    this.apply(hero);
    Sample.INSTANCE.play$Object(Assets$Sounds.DRINK);
    hero.sprite_.operate$int(hero.pos);
    if (!this.anonymous) {
      Catalog.countUse($J.getClass(this));
      if (Random.Float$() < this.talentChance) {
        Talent.onPotionUsed(Item.curUser, Item.curUser.pos, this.talentFactor);
      }
    }
  }
  onThrow(cell: number): void {
    if (Dungeon.level.map_[cell] === Terrain.WELL || Dungeon.level.pit[cell]) {
      super.onThrow(cell);
    } else {
      if (!(this instanceof AquaBrew) && !(this instanceof PotionOfStormClouds)) {
        Dungeon.level.pressCell$int(cell);
      }
      this.shatter(cell);
      if (!this.anonymous && (Potion.mustThrowPots.contains($J.getClass(this)) || Potion.canThrowPots.contains($J.getClass(this)) || this instanceof Brew)) {
        Catalog.countUse($J.getClass(this));
        if (Random.Float$() < this.talentChance) {
          Talent.onPotionUsed(Item.curUser, cell, this.talentFactor);
        }
      }
    }
  }
  apply(hero: Hero): void {
    this.shatter(hero.pos);
  }
  shatter(cell: number): void {
    this.splash(cell);
    if (Dungeon.level.heroFOV[cell]) {
      GLog.i(Messages.get$Class$String$ObjectArr($J.cls(Potion), 'shatter', []), []);
      Sample.INSTANCE.play$Object(Assets$Sounds.SHATTER);
    }
  }
  cast(user: Hero, dst: number): void {
    super.cast(user, dst);
  }
  isKnown(): boolean {
    return this.anonymous || (Potion.handler != null && Potion.handler.isKnown$Item(this));
  }
  setKnown(): void {
    if (!this.anonymous) {
      if (!this.isKnown()) {
        Potion.handler.know$Item(this);
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
    return this.isKnown() ? super.name() : Messages.get$Object$String$ObjectArr(this, this.color_, []);
  }
  info(): string {
    return (this.anonymous && (Potion.handler == null || !Potion.handler.isKnown$Item(this))) ? this.desc() : super.info();
  }
  desc(): string {
    return this.isKnown() ? super.desc() : Messages.get$Object$String$ObjectArr(this, 'unknown_desc', []);
  }
  isIdentified(): boolean {
    return this.isKnown();
  }
  isUpgradable(): boolean {
    return false;
  }
  static getKnown(): HashSet<JClass<Potion>> {
    return Potion.handler.known();
  }
  static getUnknown(): HashSet<JClass<Potion>> {
    return Potion.handler.unknown();
  }
  static allKnown(): boolean {
    return Potion.handler != null && Potion.handler.known().size() === Generator$Category.POTION.classes.length;
  }
  splashColor(): number {
    return this.anonymous ? 43775 : ItemSprite.pick(this.image_, 5, 9);
  }
  splash(cell: number): void {
    let fire = Dungeon.level.blobs.get($J.cls(Fire));
    if (fire != null) {
      fire.clear(cell);
    }
    let ch = Actor.findChar(cell);
    if (ch != null && ch.alignment === Char$Alignment.ALLY) {
      Buff.detach(ch, $J.cls(Burning));
      Buff.detach(ch, $J.cls(Ooze));
    }
    if (Dungeon.level.heroFOV[cell]) {
      if (ch != null) {
        Splash.at$PointF$int$int(ch.sprite_.center$(), this.splashColor(), 5);
      } else {
        Splash.at$int$int$int(cell, this.splashColor(), 5);
      }
    }
  }
  value(): number {
    return Math.imul(30, this.quantity);
  }
  energyVal(): number {
    return Math.imul(6, this.quantity);
  }
  static $clinit() {
    Potion.colors = new (Potion$1())()._LinkedHashMap().$init_anon();
    Potion.mustThrowPots = new HashSet();
    Potion.mustThrowPots.add($J.cls(PotionOfToxicGas));
    Potion.mustThrowPots.add($J.cls(PotionOfLiquidFlame));
    Potion.mustThrowPots.add($J.cls(PotionOfParalyticGas));
    Potion.mustThrowPots.add($J.cls(PotionOfFrost));
    Potion.mustThrowPots.add($J.cls(PotionOfCorrosiveGas));
    Potion.mustThrowPots.add($J.cls(PotionOfSnapFreeze));
    Potion.mustThrowPots.add($J.cls(PotionOfShroudingFog));
    Potion.mustThrowPots.add($J.cls(PotionOfStormClouds));
    Potion.canThrowPots = new HashSet();
    Potion.canThrowPots.add($J.cls(PotionOfPurity));
    Potion.canThrowPots.add($J.cls(PotionOfLevitation));
    Potion.canThrowPots.add($J.cls(PotionOfCleansing));
    Potion.canThrowPots.add($J.cls(ElixirOfHoneyedHealing));
  }
}

export class Potion$PlaceHolder extends Potion {
  _Potion$PlaceHolder(): this {
    this._Potion();
    this.image_ = ItemSpriteSheet.POTION_HOLDER;
    return this;
  }
  isSimilar(item: Item): boolean {
    return ExoticPotion.regToExo.containsKey(item.getClass()) || ExoticPotion.regToExo.containsValue(item.getClass());
  }
  info(): string {
    return '';
  }
}

export class Potion$SeedToPotion extends Recipe {
  static types: HashMap<JClass<Plant$Seed>, JClass<Potion>> = null;
  _Potion$SeedToPotion(): this {
    this._Recipe();
    return this;
  }
  testIngredients(ingredients: ArrayList<Item>): boolean {
    if (ingredients.size() !== 3) {
      return false;
    }
    for (const $it1 = ingredients.iterator(); $it1.hasNext(); ) {
      let ingredient = $it1.next();
      if (!(ingredient instanceof Plant$Seed && ingredient.quantity$() >= 1 && Potion$SeedToPotion.types.containsKey(ingredient.getClass()))) {
        return false;
      }
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
    for (const $it2 = ingredients.iterator(); $it2.hasNext(); ) {
      let ingredient = $it2.next();
      ingredient.quantity$int((ingredient.quantity$() - 1) | 0);
    }
    let seeds = new ArrayList();
    for (const $it3 = ingredients.iterator(); $it3.hasNext(); ) {
      let i = $it3.next();
      if (!seeds.contains(i.getClass())) {
        seeds.add(i.getClass());
      }
    }
    let result: Potion;
    if ((seeds.size() === 2 && Random.Int$int(4) === 0) || (seeds.size() === 3 && Random.Int$int(2) === 0)) {
      result = Generator.randomUsingDefaults$Category(Generator$Category.POTION);
    } else {
      result = Reflection.newInstance(Potion$SeedToPotion.types.get(Random.element$Collection(ingredients).getClass()));
    }
    if (seeds.size() === 1) {
      result.identify$();
    }
    while (result instanceof PotionOfHealing && Random.Int$int(10) < Dungeon$LimitedDrops.COOKING_HP.count_) {
      result = Generator.randomUsingDefaults$Category(Generator$Category.POTION);
    }
    if (result instanceof PotionOfHealing) {
      Dungeon$LimitedDrops.COOKING_HP.count_++;
    }
    return result;
  }
  sampleOutput(ingredients: ArrayList<Item>): Item {
    return new (Potion$SeedToPotion$1())().$o(this)._WndBag$Placeholder(ItemSpriteSheet.POTION_HOLDER);
  }
  static $clinit() {
    Potion$SeedToPotion.types = new HashMap();
    Potion$SeedToPotion.types.put($J.cls(Blindweed$Seed), $J.cls(PotionOfInvisibility));
    Potion$SeedToPotion.types.put($J.cls(Mageroyal$Seed), $J.cls(PotionOfPurity));
    Potion$SeedToPotion.types.put($J.cls(Earthroot$Seed), $J.cls(PotionOfParalyticGas));
    Potion$SeedToPotion.types.put($J.cls(Fadeleaf$Seed), $J.cls(PotionOfMindVision));
    Potion$SeedToPotion.types.put($J.cls(Firebloom$Seed), $J.cls(PotionOfLiquidFlame));
    Potion$SeedToPotion.types.put($J.cls(Icecap$Seed), $J.cls(PotionOfFrost));
    Potion$SeedToPotion.types.put($J.cls(Rotberry$Seed), $J.cls(PotionOfStrength));
    Potion$SeedToPotion.types.put($J.cls(Sorrowmoss$Seed), $J.cls(PotionOfToxicGas));
    Potion$SeedToPotion.types.put($J.cls(Starflower$Seed), $J.cls(PotionOfExperience));
    Potion$SeedToPotion.types.put($J.cls(Stormvine$Seed), $J.cls(PotionOfLevitation));
    Potion$SeedToPotion.types.put($J.cls(Sungrass$Seed), $J.cls(PotionOfHealing));
    Potion$SeedToPotion.types.put($J.cls(Swiftthistle$Seed), $J.cls(PotionOfHaste));
  }
}

let $Potion$2: any = null;
/** An anonymous class (Potion.java:245). */
function Potion$2(): any {
  return $Potion$2 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      if (index === 0) {
        this.$outer.drink(this.$cv_hero);
      }
    }
    $c($hero): this {
      this.$cv_hero = $hero;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion$2', []);
}

let $Potion$3: any = null;
/** An anonymous class (Potion.java:273). */
function Potion$3(): any {
  return $Potion$3 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      if (index === 0) {
        super.doThrow(this.$cv_hero);
      }
    }
    $c($hero): this {
      this.$cv_hero = $hero;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion$3', []);
}

let $Potion$1: any = null;
/** An anonymous class (Potion.java:91). */
function Potion$1(): any {
  return $Potion$1 ??= $J.local(class extends LinkedHashMap {
    $init_anon() {
      this.put('crimson', ItemSpriteSheet.POTION_CRIMSON);
      this.put('amber', ItemSpriteSheet.POTION_AMBER);
      this.put('golden', ItemSpriteSheet.POTION_GOLDEN);
      this.put('jade', ItemSpriteSheet.POTION_JADE);
      this.put('turquoise', ItemSpriteSheet.POTION_TURQUOISE);
      this.put('azure', ItemSpriteSheet.POTION_AZURE);
      this.put('indigo', ItemSpriteSheet.POTION_INDIGO);
      this.put('magenta', ItemSpriteSheet.POTION_MAGENTA);
      this.put('bistre', ItemSpriteSheet.POTION_BISTRE);
      this.put('charcoal', ItemSpriteSheet.POTION_CHARCOAL);
      this.put('silver', ItemSpriteSheet.POTION_SILVER);
      this.put('ivory', ItemSpriteSheet.POTION_IVORY);
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion$1', []);
}

let $Potion$SeedToPotion$1: any = null;
/** An anonymous class (Potion.java:553). */
function Potion$SeedToPotion$1(): any {
  return $Potion$SeedToPotion$1 ??= $J.local(class extends WndBag$Placeholder {
    name(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(Potion$SeedToPotion), 'name', []);
    }
    info(): string {
      return '';
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion$SeedToPotion$1', []);
}

$J.define(Potion, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { '': '_Potion' }, meths: { 'identify(boolean)': 'identify$boolean', 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' }, clinit: true, lazy: ['colors', 'mustThrowPots', 'canThrowPots', 'handler'] });
$J.define(Potion$PlaceHolder, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion$PlaceHolder', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion', ctors: { '': '_Potion$PlaceHolder' } });
$J.define(Potion$SeedToPotion, 'com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion$SeedToPotion', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe', ctors: { '': '_Potion$SeedToPotion' }, clinit: true, lazy: ['types'] });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Dungeon$LimitedDrops = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon$LimitedDrops');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Fire = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.blobs.Fire');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Burning = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Burning');
  Ooze = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Ooze');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Splash = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Splash');
  Generator = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  ItemStatusHandler = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.ItemStatusHandler');
  PotionOfExperience = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfExperience');
  PotionOfFrost = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfFrost');
  PotionOfHaste = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfHaste');
  PotionOfHealing = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfHealing');
  PotionOfInvisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfInvisibility');
  PotionOfLevitation = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfLevitation');
  PotionOfLiquidFlame = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfLiquidFlame');
  PotionOfMindVision = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfMindVision');
  PotionOfParalyticGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfParalyticGas');
  PotionOfPurity = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfPurity');
  PotionOfStrength = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfStrength');
  PotionOfToxicGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.PotionOfToxicGas');
  AquaBrew = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.AquaBrew');
  Brew = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.Brew');
  ElixirOfHoneyedHealing = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfHoneyedHealing');
  ExoticPotion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.ExoticPotion');
  PotionOfCleansing = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfCleansing');
  PotionOfCorrosiveGas = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfCorrosiveGas');
  PotionOfShroudingFog = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfShroudingFog');
  PotionOfSnapFreeze = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfSnapFreeze');
  PotionOfStormClouds = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.PotionOfStormClouds');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Terrain = $J.load('com.shatteredpixel.shatteredpixeldungeon.levels.Terrain');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Blindweed$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Blindweed$Seed');
  Earthroot$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Earthroot$Seed');
  Fadeleaf$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Fadeleaf$Seed');
  Firebloom$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Firebloom$Seed');
  Icecap$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Icecap$Seed');
  Mageroyal$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Mageroyal$Seed');
  Plant$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Plant$Seed');
  Rotberry$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Rotberry$Seed');
  Sorrowmoss$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Sorrowmoss$Seed');
  Starflower$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Starflower$Seed');
  Stormvine$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Stormvine$Seed');
  Sungrass$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Sungrass$Seed');
  Swiftthistle$Seed = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Swiftthistle$Seed');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndBag$Placeholder = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$Placeholder');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  WndUseItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndUseItem');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Random = $J.load('com.watabou.utils.Random');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
