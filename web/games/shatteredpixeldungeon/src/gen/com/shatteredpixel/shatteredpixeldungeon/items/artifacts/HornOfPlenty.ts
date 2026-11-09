// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/artifacts/HornOfPlenty.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Artifact } from './Artifact.ts';
import { Artifact$ArtifactBuff } from './Artifact.ts';

let Assets$Sounds, Badges, Challenges, Dungeon, Statistics, Buff, Hunger, MagicImmune, Belongings$Backpack, Talent, SpellSprite, Item, Blandfruit, Food, MeatPie, Pasty, PhantomMeat, RingOfEnergy, Catalog, Messages, GameScene, ItemSpriteSheet, GLog, WndBag$ItemSelector, Sample;

export class HornOfPlenty extends Artifact {
  storedFoodEnergy: number = 0;
  static readonly AC_SNACK: string = 'SNACK';
  static readonly AC_EAT: string = 'EAT';
  static readonly AC_STORE: string = 'STORE';
  static readonly STORED: string = 'stored';
  static itemSelector: WndBag$ItemSelector = null;
  _HornOfPlenty(): this {
    this._Artifact();
    this.image_ = ItemSpriteSheet.ARTIFACT_HORN1;
    this.levelCap = 10;
    this.charge_ = 0;
    this.partialCharge = 0;
    this.chargeCap_ = (5 + $J.idiv(this.level$(), 2)) | 0;
    this.defaultAction_ = HornOfPlenty.AC_SNACK;
    this.storedFoodEnergy = 0;
    return this;
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    if (hero.buff($J.cls(MagicImmune)) != null) {
      return actions;
    }
    if (this.isEquipped(hero) && this.charge_ > 0) {
      actions.add(HornOfPlenty.AC_SNACK);
      actions.add(HornOfPlenty.AC_EAT);
    }
    if (this.isEquipped(hero) && this.level$() < this.levelCap && !this.cursed) {
      actions.add(HornOfPlenty.AC_STORE);
    }
    return actions;
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if (hero.buff($J.cls(MagicImmune)) != null) {
      return;
    }
    if ($J.equals(action, HornOfPlenty.AC_EAT) || $J.equals(action, HornOfPlenty.AC_SNACK)) {
      if (!this.isEquipped(hero)) {
        GLog.i(Messages.get$Class$String$ObjectArr($J.cls(Artifact), 'need_to_equip', []), []);
      } else if (this.charge_ === 0) {
        GLog.i(Messages.get$Object$String$ObjectArr(this, 'no_food', []), []);
      } else {
        let satietyPerCharge = $J.d2i((Math.fround(Hunger.STARVING / 5)));
        if (Dungeon.isChallenged(Challenges.NO_FOOD)) {
          satietyPerCharge = $J.idiv(satietyPerCharge, 3);
        }
        let hunger = Buff.affect$Char$Class(Dungeon.hero, $J.cls(Hunger));
        let chargesToUse = Math.max(1, $J.idiv(hunger.hunger(), satietyPerCharge));
        if (chargesToUse > this.charge_) {
          chargesToUse = this.charge_;
        }
        if ($J.equals(action, HornOfPlenty.AC_SNACK)) {
          chargesToUse = 1;
        }
        this.doEatEffect(hero, chargesToUse);
      }
    } else if ($J.equals(action, HornOfPlenty.AC_STORE)) {
      GameScene.selectItem(HornOfPlenty.itemSelector);
    }
  }
  doEatEffect(hero: Hero, chargesToUse: number): void {
    let satietyPerCharge = $J.d2i((Math.fround(Hunger.STARVING / 5)));
    if (Dungeon.isChallenged(Challenges.NO_FOOD)) {
      satietyPerCharge = $J.idiv(satietyPerCharge, 3);
    }
    Buff.affect$Char$Class(hero, $J.cls(Hunger)).satisfy(Math.fround(Math.imul(satietyPerCharge, chargesToUse)));
    Statistics.foodEaten++;
    this.charge_ = (this.charge_ - chargesToUse) | 0;
    Talent.onArtifactUsed(hero);
    hero.sprite_.operate$int(hero.pos);
    hero.busy();
    SpellSprite.show$Char$int(hero, SpellSprite.FOOD);
    Sample.INSTANCE.play$Object(Assets$Sounds.EAT);
    GLog.i(Messages.get$Object$String$ObjectArr(this, 'eat', []), []);
    if (Dungeon.hero.hasTalent(Talent.IRON_STOMACH) || Dungeon.hero.hasTalent(Talent.ENERGIZING_MEAL) || Dungeon.hero.hasTalent(Talent.MYSTICAL_MEAL) || Dungeon.hero.hasTalent(Talent.INVIGORATING_MEAL) || Dungeon.hero.hasTalent(Talent.FOCUSED_MEAL) || Dungeon.hero.hasTalent(Talent.ENLIGHTENING_MEAL)) {
      hero.spend(Math.fround(Food.TIME_TO_EAT - 2));
    } else {
      hero.spend(Food.TIME_TO_EAT);
    }
    Talent.onFoodEaten(hero, Math.fround(Math.imul(satietyPerCharge, chargesToUse)), this);
    Badges.validateFoodEaten();
    if (this.charge_ >= 8) {
      this.image_ = ItemSpriteSheet.ARTIFACT_HORN4;
    } else if (this.charge_ >= 5) {
      this.image_ = ItemSpriteSheet.ARTIFACT_HORN3;
    } else if (this.charge_ >= 2) {
      this.image_ = ItemSpriteSheet.ARTIFACT_HORN2;
    } else {
      this.image_ = ItemSpriteSheet.ARTIFACT_HORN1;
    }
    Item.updateQuickslot();
  }
  passiveBuff(): Artifact$ArtifactBuff {
    return new HornOfPlenty$hornRecharge().$o(this)._HornOfPlenty$hornRecharge();
  }
  charge(target: Hero, amount: number): void {
    if (this.charge_ < this.chargeCap_ && !this.cursed && target.buff($J.cls(MagicImmune)) == null) {
      this.partialCharge = Math.fround(this.partialCharge + Math.fround(0.25 * amount));
      while (this.partialCharge >= Math.fround(1)) {
        this.partialCharge--;
        this.charge_++;
        if (this.charge_ === this.chargeCap_) {
          GLog.p(Messages.get$Class$String$ObjectArr($J.cls(HornOfPlenty), 'full', []), []);
          this.partialCharge = 0;
        }
        if (this.charge_ >= 8) {
          this.image_ = ItemSpriteSheet.ARTIFACT_HORN4;
        } else if (this.charge_ >= 5) {
          this.image_ = ItemSpriteSheet.ARTIFACT_HORN3;
        } else if (this.charge_ >= 2) {
          this.image_ = ItemSpriteSheet.ARTIFACT_HORN2;
        } else {
          this.image_ = ItemSpriteSheet.ARTIFACT_HORN1;
        }
        Item.updateQuickslot();
      }
    }
  }
  desc(): string {
    let desc = super.desc();
    if (this.isEquipped(Dungeon.hero)) {
      if (!this.cursed) {
        if (this.level$() < this.levelCap) {
          desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_hint', []);
        }
      } else {
        desc += '\n\n' + Messages.get$Object$String$ObjectArr(this, 'desc_cursed', []);
      }
    }
    return desc;
  }
  level$int(value: number): Item {
    super.level$int(value);
    this.chargeCap_ = (5 + $J.idiv(this.level$(), 2)) | 0;
    return this;
  }
  upgrade$(): Item {
    super.upgrade$();
    this.chargeCap_ = (5 + $J.idiv(this.level$(), 2)) | 0;
    return this;
  }
  gainFoodValue(food: Food): void {
    if (this.level$() >= 10) {
      return;
    }
    this.storedFoodEnergy = $J.d2i(Math.fround(this.storedFoodEnergy + food.energy));
    if (food instanceof Pasty || food instanceof PhantomMeat) {
      this.storedFoodEnergy = $J.d2i(Math.fround(this.storedFoodEnergy + Math.fround(Hunger.HUNGRY / 2)));
    } else if (food instanceof MeatPie) {
      this.storedFoodEnergy = $J.d2i(Math.fround(this.storedFoodEnergy + Hunger.HUNGRY));
    }
    if (Math.fround(this.storedFoodEnergy) >= Hunger.HUNGRY) {
      let upgrades = $J.idiv(this.storedFoodEnergy, $J.d2i(Hunger.HUNGRY));
      upgrades = Math.min(upgrades, (10 - this.level$()) | 0);
      this.upgrade$int(upgrades);
      Catalog.countUse($J.cls(HornOfPlenty));
      this.storedFoodEnergy = $J.d2i(Math.fround(this.storedFoodEnergy - Math.fround(upgrades * Hunger.HUNGRY)));
      if (this.level$() === 10) {
        this.storedFoodEnergy = 0;
        GLog.p(Messages.get$Object$String$ObjectArr(this, 'maxlevel', []), []);
      } else {
        GLog.p(Messages.get$Object$String$ObjectArr(this, 'levelup', []), []);
      }
    } else {
      GLog.i(Messages.get$Object$String$ObjectArr(this, 'feed', []), []);
    }
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(HornOfPlenty.STORED, this.storedFoodEnergy);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.storedFoodEnergy = bundle.getInt(HornOfPlenty.STORED);
    if (this.charge_ >= 8) {
      this.image_ = ItemSpriteSheet.ARTIFACT_HORN4;
    } else if (this.charge_ >= 5) {
      this.image_ = ItemSpriteSheet.ARTIFACT_HORN3;
    } else if (this.charge_ >= 2) {
      this.image_ = ItemSpriteSheet.ARTIFACT_HORN2;
    }
  }
  static $clinit() {
    HornOfPlenty.itemSelector = new (HornOfPlenty$1())()._WndBag$ItemSelector();
  }
}

export class HornOfPlenty$hornRecharge extends Artifact$ArtifactBuff {
  _HornOfPlenty$hornRecharge(): this {
    this._Artifact$ArtifactBuff();
    return this;
  }
  gainCharge(levelPortion: number): void {
    if (this.$outer.cursed || this.target.buff($J.cls(MagicImmune)) != null) {
      return;
    }
    if (this.$outer.charge_ < this.$outer.chargeCap_) {
      let chargeGain = Math.fround(Math.fround(Hunger.STARVING * levelPortion) * (Math.fround(0.25 + (Math.fround(0.125 * this.$outer.level$())))));
      chargeGain = Math.fround(chargeGain * RingOfEnergy.artifactChargeMultiplier(this.target));
      chargeGain = Math.fround(chargeGain / Math.fround(Hunger.STARVING / 5));
      this.$outer.partialCharge = Math.fround(this.$outer.partialCharge + chargeGain);
      while (this.$outer.partialCharge >= Math.fround(1)) {
        this.$outer.charge_++;
        this.$outer.partialCharge = Math.fround(this.$outer.partialCharge - 1);
        if (this.$outer.charge_ >= 8) {
          this.$outer.image_ = ItemSpriteSheet.ARTIFACT_HORN4;
        } else if (this.$outer.charge_ >= 5) {
          this.$outer.image_ = ItemSpriteSheet.ARTIFACT_HORN3;
        } else if (this.$outer.charge_ >= 2) {
          this.$outer.image_ = ItemSpriteSheet.ARTIFACT_HORN2;
        } else {
          this.$outer.image_ = ItemSpriteSheet.ARTIFACT_HORN1;
        }
        Item.updateQuickslot();
        if (this.$outer.charge_ === this.$outer.chargeCap_) {
          GLog.p(Messages.get$Class$String$ObjectArr($J.cls(HornOfPlenty), 'full', []), []);
          this.$outer.partialCharge = 0;
        }
      }
    } else {
      this.$outer.partialCharge = 0;
    }
  }
}

let $HornOfPlenty$1: any = null;
/** An anonymous class (HornOfPlenty.java:314). */
function HornOfPlenty$1(): any {
  return $HornOfPlenty$1 ??= $J.local(class extends WndBag$ItemSelector {
    textPrompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(HornOfPlenty), 'prompt', []);
    }
    preferredBag(): JClass<Bag> {
      return $J.cls(Belongings$Backpack);
    }
    itemSelectable(item: Item): boolean {
      return item instanceof Food;
    }
    onSelect(item: Item): void {
      if (item != null && item instanceof Food) {
        if (item instanceof Blandfruit && (item).potionAttrib == null) {
          GLog.w(Messages.get$Class$String$ObjectArr($J.cls(HornOfPlenty), 'reject', []), []);
        } else {
          let hero = Dungeon.hero;
          hero.sprite_.operate$int(hero.pos);
          hero.busy();
          hero.spend(Food.TIME_TO_EAT);
          (Item.curItem).gainFoodValue((item));
          item.detach(hero.belongings.backpack);
        }
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.HornOfPlenty$1', []);
}

$J.define(HornOfPlenty, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.HornOfPlenty', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact', ctors: { '': '_HornOfPlenty' }, meths: { 'upgrade()': 'upgrade$', 'level(int)': 'level$int', 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String' }, clinit: true, lazy: ['itemSelector'] });
$J.define(HornOfPlenty$hornRecharge, 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.HornOfPlenty$hornRecharge', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact$ArtifactBuff', ctors: { '': '_HornOfPlenty$hornRecharge' }, inner: true });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Challenges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Challenges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Hunger = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Hunger');
  MagicImmune = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicImmune');
  Belongings$Backpack = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Belongings$Backpack');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  SpellSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.SpellSprite');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Blandfruit = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.Blandfruit');
  Food = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.Food');
  MeatPie = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.MeatPie');
  Pasty = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.Pasty');
  PhantomMeat = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.food.PhantomMeat');
  RingOfEnergy = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfEnergy');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndBag$ItemSelector = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$ItemSelector');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
