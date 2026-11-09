// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/armor/ClassArmor.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Armor } from './Armor.ts';
import { Buff } from '../../actors/buffs/Buff.ts';

let Assets$Sounds, Badges, Dungeon, Actor, Regeneration, Hero, HeroClass, Trinity, Speck, Item, ClericArmor, DuelistArmor, HuntressArmor, MageArmor, RogueArmor, WarriorArmor, RingOfEnergy, Messages, GameScene, HeroSprite, ItemSprite, ItemSpriteSheet, GLog, WndBag$ItemSelector, WndChooseAbility, WndOptions, Sample;

export class ClassArmor extends Armor {
  static readonly AC_ABILITY: string = 'ABILITY';
  static readonly AC_TRANSFER: string = 'TRANSFER';
  charger: ClassArmor$Charger = null;
  charge_: number = 0;
  static readonly ARMOR_TIER: string = 'armortier';
  static readonly CHARGE: string = 'charge';
  _ClassArmor(): this {
    this._Armor(5);
    this.levelKnown = true;
    this.cursedKnown = true;
    this.defaultAction_ = ClassArmor.AC_ABILITY;
    this.bones = false;
    this.charge_ = 0;
    return this;
  }
  activate(ch: Char): void {
    super.activate(ch);
    this.charger = new ClassArmor$Charger().$o(this)._ClassArmor$Charger();
    this.charger.attachTo(ch);
  }
  doUnequip$Hero$boolean$boolean(hero: Hero, collect: boolean, single: boolean): boolean {
    if (super.doUnequip$Hero$boolean$boolean(hero, collect, single)) {
      if (this.charger != null) {
        this.charger.detach();
        this.charger = null;
      }
      return true;
    } else {
      return false;
    }
  }
  targetingPos(user: Hero, dst: number): number {
    return user.armorAbility.targetedPos(user, dst);
  }
  static upgrade(owner: Hero, armor: Armor): ClassArmor {
    let classArmor = null;
    switch (owner.heroClass) {
      case HeroClass.WARRIOR:
        classArmor = new WarriorArmor()._WarriorArmor();
        break;
      case HeroClass.ROGUE:
        classArmor = new RogueArmor()._RogueArmor();
        break;
      case HeroClass.MAGE:
        classArmor = new MageArmor()._MageArmor();
        break;
      case HeroClass.HUNTRESS:
        classArmor = new HuntressArmor()._HuntressArmor();
        break;
      case HeroClass.DUELIST:
        classArmor = new DuelistArmor()._DuelistArmor();
        break;
      case HeroClass.CLERIC:
        classArmor = new ClericArmor()._ClericArmor();
        break;
    }
    classArmor.level$int(armor.trueLevel());
    classArmor.tier_ = armor.tier_;
    classArmor.augment = armor.augment;
    classArmor.inscribe$Glyph(armor.glyph_);
    if (armor.seal_ != null) {
      classArmor.seal_ = armor.seal_;
    }
    classArmor.glyphHardened = armor.glyphHardened;
    classArmor.cursed = armor.cursed;
    classArmor.curseInfusionBonus = armor.curseInfusionBonus;
    classArmor.masteryPotionBonus = armor.masteryPotionBonus;
    if (armor.levelKnown && armor.cursedKnown) {
      classArmor.identify$();
    } else {
      classArmor.levelKnown = armor.levelKnown;
      classArmor.cursedKnown = true;
    }
    classArmor.charge_ = 50;
    return classArmor;
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    bundle.put$String$int(ClassArmor.ARMOR_TIER, this.tier_);
    bundle.put$String$float(ClassArmor.CHARGE, this.charge_);
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    this.tier_ = bundle.getInt(ClassArmor.ARMOR_TIER);
    this.charge_ = bundle.getFloat(ClassArmor.CHARGE);
  }
  actions(hero: Hero): ArrayList<string> {
    let actions = super.actions(hero);
    if (this.isEquipped(hero)) {
      actions.add(ClassArmor.AC_ABILITY);
    }
    actions.add(ClassArmor.AC_TRANSFER);
    return actions;
  }
  actionName(action: string, hero: Hero): string {
    if (hero.armorAbility != null && $J.equals(action, ClassArmor.AC_ABILITY)) {
      return Messages.upperCase(hero.armorAbility.name());
    } else {
      return super.actionName(action, hero);
    }
  }
  status(): string {
    return Messages.format('%.0f%%', [$J.boxD(Math.floor(this.charge_))]);
  }
  execute$Hero$String(hero: Hero, action: string): void {
    super.execute$Hero$String(hero, action);
    if ($J.equals(action, ClassArmor.AC_ABILITY)) {
      if (hero.armorAbility == null) {
        GameScene.show(new WndChooseAbility()._WndChooseAbility(null, this, hero));
      } else if (!this.isEquipped(hero)) {
        this.usesTargeting_ = false;
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'not_equipped', []), []);
      } else if (this.charge_ < hero.armorAbility.chargeUse(hero)) {
        this.usesTargeting_ = false;
        GLog.w(Messages.get$Object$String$ObjectArr(this, 'low_charge', []), []);
      } else {
        this.usesTargeting_ = hero.armorAbility.useTargeting();
        hero.armorAbility.use(this, hero);
      }
    } else if ($J.equals(action, ClassArmor.AC_TRANSFER)) {
      GameScene.show(new (ClassArmor$1())().$o(this).$c(hero)._WndOptions$Image$String$String$StringArr(new ItemSprite()._ItemSprite$int(ItemSpriteSheet.CROWN), Messages.get$Class$String$ObjectArr($J.cls(ClassArmor), 'transfer_title', []), Messages.get$Class$String$ObjectArr($J.cls(ClassArmor), 'transfer_desc', []), [Messages.get$Class$String$ObjectArr($J.cls(ClassArmor), 'transfer_prompt', []), Messages.get$Class$String$ObjectArr($J.cls(ClassArmor), 'transfer_cancel', [])]));
    }
  }
  desc(): string {
    let desc = super.desc();
    if (Dungeon.hero != null && Dungeon.hero.belongings.contains(this)) {
      let ability = Dungeon.hero.armorAbility;
      if (ability != null) {
        desc += '\n\n' + ability.shortDesc();
        let chargeUse = ability.chargeUse(Dungeon.hero);
        if (!(ability instanceof Trinity)) {
          desc += ' ' + Messages.get$Object$String$ObjectArr(this, 'charge_use', [Messages.decimalFormat('#.##', chargeUse)]);
        }
      } else {
        desc += '\n\n_' + Messages.get$Object$String$ObjectArr(this, 'no_ability', []) + '_';
      }
    }
    return desc;
  }
  value(): number {
    return 0;
  }
}

export class ClassArmor$Charger extends Buff {
  _ClassArmor$Charger(): this {
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
    if (Regeneration.regenOn()) {
      let chargeGain = Math.fround(100 / 500);
      chargeGain = Math.fround(chargeGain * RingOfEnergy.armorChargeMultiplier(this.target));
      this.$outer.charge_ = Math.fround(this.$outer.charge_ + chargeGain);
      Item.updateQuickslot();
      if (this.$outer.charge_ > Math.fround(100)) {
        this.$outer.charge_ = 100;
      }
    }
    this.spend(Actor.TICK);
    return true;
  }
}

let $ClassArmor$1$1: any = null;
/** An anonymous class (ClassArmor.java:217). */
function ClassArmor$1$1(): any {
  return $ClassArmor$1$1 ??= $J.local(class extends WndBag$ItemSelector {
    textPrompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(ClassArmor), 'transfer_prompt', []);
    }
    itemSelectable(item: Item): boolean {
      return item instanceof Armor;
    }
    onSelect(item: Item): void {
      if (item == null || item === this.$outer.$outer) {
        return;
      }
      let armor = item;
      armor.detach(this.$cv_hero.belongings.backpack);
      if (this.$cv_hero.belongings.armor_ === armor) {
        this.$cv_hero.belongings.armor_ = null;
        if (this.$cv_hero.sprite_ instanceof HeroSprite) {
          (this.$cv_hero.sprite_).updateArmor();
        }
      }
      this.$outer.$outer.level$int(armor.trueLevel());
      this.$outer.$outer.tier_ = armor.tier_;
      this.$outer.$outer.augment = armor.augment;
      this.$outer.$outer.cursed = armor.cursed;
      this.$outer.$outer.curseInfusionBonus = armor.curseInfusionBonus;
      this.$outer.$outer.masteryPotionBonus = armor.masteryPotionBonus;
      if (armor.checkSeal() != null) {
        this.$outer.$outer.inscribe$Glyph(armor.glyph_);
        this.$outer.$outer.seal_ = armor.checkSeal();
      } else if (this.$outer.$outer.checkSeal() != null) {
        if (this.$outer.$outer.seal_.level$() > 0) {
          let newLevel = (this.$outer.$outer.trueLevel() + 1) | 0;
          this.$outer.$outer.level$int(newLevel);
          Badges.validateItemLevelAquired(this.$outer.$outer);
        }
        if (armor.glyph_ == null && this.$outer.$outer.seal_.canTransferGlyph()) {
        } else {
          this.$outer.$outer.inscribe$Glyph(armor.glyph_);
          this.$outer.$outer.seal_.setGlyph(null);
        }
      } else {
        this.$outer.$outer.inscribe$Glyph(armor.glyph_);
      }
      if (armor.levelKnown && armor.cursedKnown) {
        this.$outer.$outer.identify$();
      } else {
        this.$outer.$outer.levelKnown = armor.levelKnown;
        this.$outer.$outer.cursedKnown = true;
      }
      GLog.p(Messages.get$Class$String$ObjectArr($J.cls(ClassArmor), 'transfer_complete', []), []);
      this.$cv_hero.sprite_.operate$int(this.$cv_hero.pos);
      this.$cv_hero.sprite_.emitter().burst(Speck.factory$int(Speck.CROWN), 12);
      Sample.INSTANCE.play$Object(Assets$Sounds.EVOKE);
      this.$cv_hero.spend(Actor.TICK);
      this.$cv_hero.busy();
    }
    $c($hero): this {
      this.$cv_hero = $hero;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.armor.ClassArmor$1$1', []);
}

let $ClassArmor$1: any = null;
/** An anonymous class (ClassArmor.java:213). */
function ClassArmor$1(): any {
  return $ClassArmor$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      if (index === 0) {
        GameScene.selectItem(new (ClassArmor$1$1())().$o(this).$c(this.$cv_hero)._WndBag$ItemSelector());
      }
    }
    $c($hero): this {
      this.$cv_hero = $hero;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.armor.ClassArmor$1', []);
}

$J.define(ClassArmor, 'com.shatteredpixel.shatteredpixeldungeon.items.armor.ClassArmor', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor', ctors: { '': '_ClassArmor' }, meths: { 'execute(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,java.lang.String)': 'execute$Hero$String', 'doUnequip(com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero,boolean,boolean)': 'doUnequip$Hero$boolean$boolean' } });
$J.define(ClassArmor$Charger, 'com.shatteredpixel.shatteredpixeldungeon.items.armor.ClassArmor$Charger', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff', ctors: { '': '_ClassArmor$Charger' }, inner: true });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Badges = $J.load('com.shatteredpixel.shatteredpixeldungeon.Badges');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Regeneration = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Regeneration');
  Hero = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Hero');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  Trinity = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.Trinity');
  Speck = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Speck');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  ClericArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.ClericArmor');
  DuelistArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.DuelistArmor');
  HuntressArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.HuntressArmor');
  MageArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.MageArmor');
  RogueArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.RogueArmor');
  WarriorArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.WarriorArmor');
  RingOfEnergy = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.RingOfEnergy');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  HeroSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.HeroSprite');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndBag$ItemSelector = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$ItemSelector');
  WndChooseAbility = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndChooseAbility');
  WndOptions = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
