// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/QuickRecipe.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Arrays } from '../../../../../jre/index.ts';
import { Component } from '../../../watabou/noosa/ui/Component.ts';
import { IconButton } from './IconButton.ts';

let Dungeon, ArcaneResin, ArcaneResin$Recipe, Generator$Category, LiquidMetal, LiquidMetal$Recipe, Bomb, Bomb$EnhanceBomb, Blandfruit, Blandfruit$CookFruit, Food, MeatPie, MeatPie$Recipe, MysteryMeat$PlaceHolder, Pasty, StewedMeat$oneMeat, StewedMeat$threeMeat, StewedMeat$twoMeat, Potion, Potion$PlaceHolder, Potion$SeedToPotion, AquaBrew$Recipe, BlizzardBrew$Recipe, CausticBrew$Recipe, InfernalBrew$Recipe, ShockingBrew$Recipe, UnstableBrew, UnstableBrew$Recipe, ElixirOfAquaticRejuvenation$Recipe, ElixirOfArcaneArmor$Recipe, ElixirOfDragonsBlood$Recipe, ElixirOfFeatherFall$Recipe, ElixirOfHoneyedHealing$Recipe, ElixirOfIcyTouch$Recipe, ElixirOfMight$Recipe, ElixirOfToxicEssence$Recipe, ExoticPotion$PotionToExotic, Scroll, Scroll$PlaceHolder, Scroll$ScrollToStone, ExoticScroll$ScrollToExotic, Alchemize, Alchemize$Recipe, BeaconOfReturning$Recipe, CurseInfusion$Recipe, MagicalInfusion$Recipe, PhaseShift$Recipe, ReclaimTrap$Recipe, Recycle$Recipe, SummonElemental$Recipe, TelekineticGrab$Recipe, UnstableSpell, UnstableSpell$Recipe, WildEnergy$Recipe, Runestone$PlaceHolder, Wand$PlaceHolder, MissileWeapon$PlaceHolder, Messages, Plant$Seed$PlaceHolder, AlchemyScene, PixelScene, ItemSpriteSheet, Icons, ItemSlot, Window, WndBag$Placeholder, WndInfoItem, BitmapText, Game, PointerArea, Reflection;

export class QuickRecipe extends Component {
  ingredients: ArrayList<Item> = null;
  inputs: ArrayList<ItemSlot> = null;
  arrow: QuickRecipe$arrow = null;
  output: ItemSlot = null;
  _QuickRecipe$SimpleRecipe(r: Recipe$SimpleRecipe): this {
    this._QuickRecipe$Recipe$ArrayList$Item(r, r.getIngredients(), r.sampleOutput(null));
    return this;
  }
  _QuickRecipe$Recipe$ArrayList$Item(r: Recipe, inputs: ArrayList<Item>, output: Item): this {
    this._Component();
    this.ingredients = inputs;
    let cost = r.cost(inputs);
    let hasInputs = true;
    this.inputs = new ArrayList();
    for (const $it0 = inputs.iterator(); $it0.hasNext(); ) {
      let in$ = $it0.next();
      this.anonymize(in$);
      let curr: ItemSlot;
      curr = new (QuickRecipe$1())().$o(this).$c(in$)._ItemSlot$Item(in$).$init_anon();
      let quantity = 0;
      if (Dungeon.hero != null) {
        let similar = Dungeon.hero.belongings.getAllSimilar(in$);
        for (const $it1 = similar.iterator(); $it1.hasNext(); ) {
          let sim = $it1.next();
          if (sim.getClass() !== in$.getClass() || sim.isIdentified()) {
            quantity = (quantity + sim.quantity$()) | 0;
          }
        }
        if (quantity < in$.quantity$()) {
          curr.sprite_.alpha$float(Math.fround(0.3));
          hasInputs = false;
        }
      } else {
        hasInputs = false;
      }
      curr.showExtraInfo(false);
      this.add$Gizmo(curr);
      this.inputs.add(curr);
    }
    if (cost > 0) {
      this.arrow = new QuickRecipe$arrow().$o(this)._QuickRecipe$arrow$Image$int(Icons.get$Icons(Icons.ARROW), cost);
      this.arrow.hardlightText(4508927);
    } else {
      this.arrow = new QuickRecipe$arrow().$o(this)._QuickRecipe$arrow$Image(Icons.get$Icons(Icons.ARROW));
    }
    if (hasInputs) {
      this.arrow.icon_.tint$float$float$float$float(1, 1, 0, 1);
      if (!(Game.scene() instanceof AlchemyScene)) {
        this.arrow.enable(false);
      }
    } else {
      this.arrow.icon_.color$float$float$float(0, 0, 0);
      this.arrow.enable(false);
    }
    this.add$Gizmo(this.arrow);
    this.anonymize(output);
    this.output = new (QuickRecipe$2())().$o(this).$c(output)._ItemSlot$Item(output);
    if (Dungeon.hero != null && !hasInputs) {
      this.output.sprite_.alpha$float(Math.fround(0.3));
    }
    this.output.showExtraInfo(false);
    this.add$Gizmo(this.output);
    this.layout();
    return this;
  }
  layout(): void {
    this.height_ = 16;
    this.width_ = 0;
    let padding = this.inputs.size() === 1 ? 8 : 0;
    for (const $it2 = this.inputs.iterator(); $it2.hasNext(); ) {
      let item = $it2.next();
      item.setRect(Math.fround(Math.fround(this.x + this.width_) + padding), this.y, 16, 16);
      this.width_ = Math.fround(this.width_ + ((16 + padding) | 0));
    }
    this.arrow.setRect(Math.fround(this.x + this.width_), this.y, 14, 16);
    this.width_ = Math.fround(this.width_ + 14);
    this.output.setRect(Math.fround(this.x + this.width_), this.y, 16, 16);
    this.width_ = Math.fround(this.width_ + 16);
    this.width_ = Math.fround(this.width_ + padding);
  }
  anonymize(item: Item): void {
    if (item instanceof Potion) {
      (item).anonymize();
    } else if (item instanceof Scroll) {
      (item).anonymize();
    }
  }
  static getRecipes(pageIdx: number): ArrayList<QuickRecipe> {
    let result = new ArrayList();
    {
      let r: Recipe, i: number;
      switch (pageIdx) {
        case 0:
        default:
          result.add(new QuickRecipe()._QuickRecipe$Recipe$ArrayList$Item(new Potion$SeedToPotion()._Potion$SeedToPotion(), new ArrayList(Arrays.asList(new Plant$Seed$PlaceHolder()._Plant$Seed$PlaceHolder().quantity$int(3))), new (QuickRecipe$3())()._WndBag$Placeholder(ItemSpriteSheet.POTION_HOLDER)));
          return result;
        case 1:
          r = new Scroll$ScrollToStone()._Scroll$ScrollToStone();
          for (let cls of Generator$Category.SCROLL.classes) {
            let scroll = Reflection.newInstance(cls);
            if (!scroll.isKnown()) {
              scroll.anonymize();
            }
            let in$ = new ArrayList(Arrays.asList(scroll));
            result.add(new QuickRecipe()._QuickRecipe$Recipe$ArrayList$Item(r, in$, r.sampleOutput(in$)));
          }
          return result;
        case 2:
          result.add(new QuickRecipe()._QuickRecipe$SimpleRecipe(new StewedMeat$oneMeat()._StewedMeat$oneMeat()));
          result.add(new QuickRecipe()._QuickRecipe$SimpleRecipe(new StewedMeat$twoMeat()._StewedMeat$twoMeat()));
          result.add(new QuickRecipe()._QuickRecipe$SimpleRecipe(new StewedMeat$threeMeat()._StewedMeat$threeMeat()));
          result.add(null);
          result.add(new QuickRecipe()._QuickRecipe$Recipe$ArrayList$Item(new MeatPie$Recipe()._MeatPie$Recipe(), new ArrayList(Arrays.asList(new Pasty()._Pasty(), new Food()._Food(), new MysteryMeat$PlaceHolder()._MysteryMeat$PlaceHolder())), new MeatPie()._MeatPie()));
          result.add(null);
          result.add(new QuickRecipe()._QuickRecipe$Recipe$ArrayList$Item(new Blandfruit$CookFruit()._Blandfruit$CookFruit(), new ArrayList(Arrays.asList(new Blandfruit()._Blandfruit(), new Plant$Seed$PlaceHolder()._Plant$Seed$PlaceHolder())), new (QuickRecipe$4())()._Blandfruit()));
          return result;
        case 3:
          r = new ExoticPotion$PotionToExotic()._ExoticPotion$PotionToExotic();
          for (let cls of Generator$Category.POTION.classes) {
            let pot = Reflection.newInstance(cls);
            let in$ = new ArrayList(Arrays.asList(pot));
            result.add(new QuickRecipe()._QuickRecipe$Recipe$ArrayList$Item(r, in$, r.sampleOutput(in$)));
          }
          return result;
        case 4:
          r = new ExoticScroll$ScrollToExotic()._ExoticScroll$ScrollToExotic();
          for (let cls of Generator$Category.SCROLL.classes) {
            let scroll = Reflection.newInstance(cls);
            let in$ = new ArrayList(Arrays.asList(scroll));
            result.add(new QuickRecipe()._QuickRecipe$Recipe$ArrayList$Item(r, in$, r.sampleOutput(in$)));
          }
          return result;
        case 5:
          r = new Bomb$EnhanceBomb()._Bomb$EnhanceBomb();
          i = 0;
          for (const $it3 = Bomb$EnhanceBomb.validIngredients.keySet().iterator(); $it3.hasNext(); ) {
            let cls = $it3.next();
            if (i === 2) {
              result.add(null);
              i = 0;
            }
            let item = Reflection.newInstance(cls);
            let in$ = new ArrayList(Arrays.asList(new Bomb()._Bomb(), item));
            result.add(new QuickRecipe()._QuickRecipe$Recipe$ArrayList$Item(r, in$, r.sampleOutput(in$)));
            i++;
          }
          return result;
        case 6:
          result.add(new QuickRecipe()._QuickRecipe$Recipe$ArrayList$Item(new LiquidMetal$Recipe()._LiquidMetal$Recipe(), new ArrayList(Arrays.asList(new MissileWeapon$PlaceHolder()._MissileWeapon$PlaceHolder())), new LiquidMetal()._LiquidMetal()));
          result.add(new QuickRecipe()._QuickRecipe$Recipe$ArrayList$Item(new ArcaneResin$Recipe()._ArcaneResin$Recipe(), new ArrayList(Arrays.asList(new Wand$PlaceHolder()._Wand$PlaceHolder())), new ArcaneResin()._ArcaneResin()));
          return result;
        case 7:
          result.add(new QuickRecipe()._QuickRecipe$Recipe$ArrayList$Item(new UnstableBrew$Recipe()._UnstableBrew$Recipe(), new ArrayList(Arrays.asList(new Potion$PlaceHolder()._Potion$PlaceHolder(), new Plant$Seed$PlaceHolder()._Plant$Seed$PlaceHolder())), new UnstableBrew()._UnstableBrew()));
          result.add(new QuickRecipe()._QuickRecipe$SimpleRecipe(new CausticBrew$Recipe()._CausticBrew$Recipe()));
          result.add(new QuickRecipe()._QuickRecipe$SimpleRecipe(new BlizzardBrew$Recipe()._BlizzardBrew$Recipe()));
          result.add(new QuickRecipe()._QuickRecipe$SimpleRecipe(new ShockingBrew$Recipe()._ShockingBrew$Recipe()));
          result.add(new QuickRecipe()._QuickRecipe$SimpleRecipe(new InfernalBrew$Recipe()._InfernalBrew$Recipe()));
          result.add(new QuickRecipe()._QuickRecipe$SimpleRecipe(new AquaBrew$Recipe()._AquaBrew$Recipe()));
          result.add(null);
          result.add(null);
          result.add(new QuickRecipe()._QuickRecipe$SimpleRecipe(new ElixirOfHoneyedHealing$Recipe()._ElixirOfHoneyedHealing$Recipe()));
          result.add(new QuickRecipe()._QuickRecipe$SimpleRecipe(new ElixirOfAquaticRejuvenation$Recipe()._ElixirOfAquaticRejuvenation$Recipe()));
          result.add(new QuickRecipe()._QuickRecipe$SimpleRecipe(new ElixirOfArcaneArmor$Recipe()._ElixirOfArcaneArmor$Recipe()));
          result.add(new QuickRecipe()._QuickRecipe$SimpleRecipe(new ElixirOfIcyTouch$Recipe()._ElixirOfIcyTouch$Recipe()));
          result.add(new QuickRecipe()._QuickRecipe$SimpleRecipe(new ElixirOfToxicEssence$Recipe()._ElixirOfToxicEssence$Recipe()));
          result.add(new QuickRecipe()._QuickRecipe$SimpleRecipe(new ElixirOfDragonsBlood$Recipe()._ElixirOfDragonsBlood$Recipe()));
          result.add(new QuickRecipe()._QuickRecipe$SimpleRecipe(new ElixirOfFeatherFall$Recipe()._ElixirOfFeatherFall$Recipe()));
          result.add(new QuickRecipe()._QuickRecipe$SimpleRecipe(new ElixirOfMight$Recipe()._ElixirOfMight$Recipe()));
          return result;
        case 8:
          result.add(new QuickRecipe()._QuickRecipe$Recipe$ArrayList$Item(new UnstableSpell$Recipe()._UnstableSpell$Recipe(), new ArrayList(Arrays.asList(new Scroll$PlaceHolder()._Scroll$PlaceHolder(), new Runestone$PlaceHolder()._Runestone$PlaceHolder())), new UnstableSpell()._UnstableSpell()));
          result.add(new QuickRecipe()._QuickRecipe$SimpleRecipe(new WildEnergy$Recipe()._WildEnergy$Recipe()));
          result.add(new QuickRecipe()._QuickRecipe$SimpleRecipe(new TelekineticGrab$Recipe()._TelekineticGrab$Recipe()));
          result.add(new QuickRecipe()._QuickRecipe$SimpleRecipe(new PhaseShift$Recipe()._PhaseShift$Recipe()));
          if (!PixelScene.landscape()) {
            result.add(null);
          }
          result.add(null);
          result.add(new QuickRecipe()._QuickRecipe$Recipe$ArrayList$Item(new Alchemize$Recipe()._Alchemize$Recipe(), new ArrayList(Arrays.asList(new Plant$Seed$PlaceHolder()._Plant$Seed$PlaceHolder(), new Runestone$PlaceHolder()._Runestone$PlaceHolder())), new Alchemize()._Alchemize().quantity$int(8)));
          result.add(new QuickRecipe()._QuickRecipe$SimpleRecipe(new CurseInfusion$Recipe()._CurseInfusion$Recipe()));
          result.add(new QuickRecipe()._QuickRecipe$SimpleRecipe(new MagicalInfusion$Recipe()._MagicalInfusion$Recipe()));
          result.add(new QuickRecipe()._QuickRecipe$SimpleRecipe(new Recycle$Recipe()._Recycle$Recipe()));
          if (!PixelScene.landscape()) {
            result.add(null);
          }
          result.add(null);
          result.add(new QuickRecipe()._QuickRecipe$SimpleRecipe(new ReclaimTrap$Recipe()._ReclaimTrap$Recipe()));
          result.add(new QuickRecipe()._QuickRecipe$SimpleRecipe(new SummonElemental$Recipe()._SummonElemental$Recipe()));
          result.add(new QuickRecipe()._QuickRecipe$SimpleRecipe(new BeaconOfReturning$Recipe()._BeaconOfReturning$Recipe()));
          return result;
      }
    }
  }
}

export class QuickRecipe$arrow extends IconButton {
  text_: BitmapText = null;
  _QuickRecipe$arrow$(): this {
    this._IconButton$();
    return this;
  }
  _QuickRecipe$arrow$Image(icon: Image): this {
    this._IconButton$Image(icon);
    return this;
  }
  _QuickRecipe$arrow$Image$int(icon: Image, count: number): this {
    this._IconButton$Image(icon);
    this.hotArea.blockLevel = PointerArea.NEVER_BLOCK;
    this.text_ = new BitmapText()._BitmapText$String$Font(String(count), PixelScene.pixelFont);
    this.text_.measure();
    this.add$Gizmo(this.text_);
    return this;
  }
  layout(): void {
    super.layout();
    if (this.text_ != null) {
      this.text_.x = this.x;
      this.text_.y = this.y;
      PixelScene.align$Visual(this.text_);
    }
  }
  onPointerUp(): void {
    this.icon_.brightness(1);
  }
  onClick(): void {
    super.onClick();
    let parent = this.parent;
    while (parent != null) {
      if (parent instanceof Window) {
        (parent).hide();
        break;
      } else {
        parent = parent.parent;
      }
    }
    (Game.scene()).populate(this.$outer.ingredients, Dungeon.hero.belongings);
  }
  hardlightText(color: number): void {
    if (this.text_ != null) {
      this.text_.hardlight$int(color);
    }
  }
}

let $QuickRecipe$1: any = null;
/** An anonymous class (QuickRecipe.java:108). */
function QuickRecipe$1(): any {
  return $QuickRecipe$1 ??= $J.local(class extends ItemSlot {
    $init_anon() {
      this.hotArea.blockLevel = PointerArea.NEVER_BLOCK;
      return this;
    }
    onClick(): void {
      Game.scene().addToFront(new WndInfoItem()._WndInfoItem$Item(this.$cv_in));
    }
    $c($in): this {
      this.$cv_in = $in;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.QuickRecipe$1', []);
}

let $QuickRecipe$2: any = null;
/** An anonymous class (QuickRecipe.java:158). */
function QuickRecipe$2(): any {
  return $QuickRecipe$2 ??= $J.local(class extends ItemSlot {
    onClick(): void {
      Game.scene().addToFront(new WndInfoItem()._WndInfoItem$Item(this.$cv_output));
    }
    $c($output): this {
      this.$cv_output = $output;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.QuickRecipe$2', []);
}

let $QuickRecipe$3: any = null;
/** An anonymous class (QuickRecipe.java:270). */
function QuickRecipe$3(): any {
  return $QuickRecipe$3 ??= $J.local(class extends WndBag$Placeholder {
    name(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(Potion$SeedToPotion), 'name', []);
    }
    info(): string {
      return '';
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.QuickRecipe$3', []);
}

let $QuickRecipe$4: any = null;
/** An anonymous class (QuickRecipe.java:302). */
function QuickRecipe$4(): any {
  return $QuickRecipe$4 ??= $J.local(class extends Blandfruit {
    name(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(Blandfruit), 'cooked', []);
    }
    info(): string {
      return '';
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.QuickRecipe$4', []);
}

$J.define(QuickRecipe, 'com.shatteredpixel.shatteredpixeldungeon.ui.QuickRecipe', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe,java.util.ArrayList,com.shatteredpixel.shatteredpixeldungeon.items.Item': '_QuickRecipe$Recipe$ArrayList$Item', 'com.shatteredpixel.shatteredpixeldungeon.items.Recipe$SimpleRecipe': '_QuickRecipe$SimpleRecipe' } });
$J.define(QuickRecipe$arrow, 'com.shatteredpixel.shatteredpixeldungeon.ui.QuickRecipe$arrow', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.IconButton', ctors: { 'com.watabou.noosa.Image,int': '_QuickRecipe$arrow$Image$int', 'com.watabou.noosa.Image': '_QuickRecipe$arrow$Image', '': '_QuickRecipe$arrow$' }, inner: true });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  ArcaneResin = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.ArcaneResin');
  ArcaneResin$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.ArcaneResin$Recipe');
  Generator$Category = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Generator$Category');
  LiquidMetal = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.LiquidMetal');
  LiquidMetal$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.LiquidMetal$Recipe');
  Bomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb');
  Bomb$EnhanceBomb = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bombs.Bomb$EnhanceBomb');
  Blandfruit = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.Blandfruit');
  Blandfruit$CookFruit = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.Blandfruit$CookFruit');
  Food = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.Food');
  MeatPie = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.MeatPie');
  MeatPie$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.MeatPie$Recipe');
  MysteryMeat$PlaceHolder = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.MysteryMeat$PlaceHolder');
  Pasty = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.Pasty');
  StewedMeat$oneMeat = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.StewedMeat$oneMeat');
  StewedMeat$threeMeat = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.StewedMeat$threeMeat');
  StewedMeat$twoMeat = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.StewedMeat$twoMeat');
  Potion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion');
  Potion$PlaceHolder = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion$PlaceHolder');
  Potion$SeedToPotion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.Potion$SeedToPotion');
  AquaBrew$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.AquaBrew$Recipe');
  BlizzardBrew$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.BlizzardBrew$Recipe');
  CausticBrew$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.CausticBrew$Recipe');
  InfernalBrew$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.InfernalBrew$Recipe');
  ShockingBrew$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.ShockingBrew$Recipe');
  UnstableBrew = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.UnstableBrew');
  UnstableBrew$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.brews.UnstableBrew$Recipe');
  ElixirOfAquaticRejuvenation$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfAquaticRejuvenation$Recipe');
  ElixirOfArcaneArmor$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfArcaneArmor$Recipe');
  ElixirOfDragonsBlood$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfDragonsBlood$Recipe');
  ElixirOfFeatherFall$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfFeatherFall$Recipe');
  ElixirOfHoneyedHealing$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfHoneyedHealing$Recipe');
  ElixirOfIcyTouch$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfIcyTouch$Recipe');
  ElixirOfMight$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfMight$Recipe');
  ElixirOfToxicEssence$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.elixirs.ElixirOfToxicEssence$Recipe');
  ExoticPotion$PotionToExotic = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.potions.exotic.ExoticPotion$PotionToExotic');
  Scroll = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll');
  Scroll$PlaceHolder = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll$PlaceHolder');
  Scroll$ScrollToStone = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll$ScrollToStone');
  ExoticScroll$ScrollToExotic = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ExoticScroll$ScrollToExotic');
  Alchemize = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.Alchemize');
  Alchemize$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.Alchemize$Recipe');
  BeaconOfReturning$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.BeaconOfReturning$Recipe');
  CurseInfusion$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.CurseInfusion$Recipe');
  MagicalInfusion$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.MagicalInfusion$Recipe');
  PhaseShift$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.PhaseShift$Recipe');
  ReclaimTrap$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.ReclaimTrap$Recipe');
  Recycle$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.Recycle$Recipe');
  SummonElemental$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.SummonElemental$Recipe');
  TelekineticGrab$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.TelekineticGrab$Recipe');
  UnstableSpell = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.UnstableSpell');
  UnstableSpell$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.UnstableSpell$Recipe');
  WildEnergy$Recipe = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.WildEnergy$Recipe');
  Runestone$PlaceHolder = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.Runestone$PlaceHolder');
  Wand$PlaceHolder = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand$PlaceHolder');
  MissileWeapon$PlaceHolder = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon$PlaceHolder');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  Plant$Seed$PlaceHolder = $J.load('com.shatteredpixel.shatteredpixeldungeon.plants.Plant$Seed$PlaceHolder');
  AlchemyScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.AlchemyScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  ItemSlot = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ItemSlot');
  Window = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Window');
  WndBag$Placeholder = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$Placeholder');
  WndInfoItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoItem');
  BitmapText = $J.load('com.watabou.noosa.BitmapText');
  Game = $J.load('com.watabou.noosa.Game');
  PointerArea = $J.load('com.watabou.noosa.PointerArea');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
