// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/actors/hero/abilities/cleric/Trinity.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../../../jre/index.ts';
import { ArmorAbility } from '../ArmorAbility.ts';
import { WndTitledMessage } from '../../../../windows/WndTitledMessage.ts';

let Assets$Sounds, Dungeon, Statistics, Buff, Invisibility, MagicImmune, Talent, BodyForm, BodyForm$BodyFormBuff, MindForm, MindForm$targetSelector, SpiritForm, SpiritForm$SpiritFormBuff, Enchanting, Item, Armor, Armor$Glyph, ClothArmor, Artifact, ChaliceOfBlood, DriedRose, EtherealChains, HolyTome, SkeletonKey, TalismanOfForesight, TimekeepersHourglass, UnstableSpellbook, Ring, Wand, WandOfFireblast, WandOfRegrowth, Weapon$Enchantment, Crystal, MeleeWeapon, WornShortsword, MissileWeapon, Catalog, Messages, GameScene, ItemSprite, ItemSpriteSheet, HeroIcon, ItemButton, QuickSlotButton, RedButton, GLog, Sample, Reflection;

export class Trinity extends ArmorAbility {
  bodyForm: Bundlable = null;
  mindForm: Bundlable = null;
  spiritForm: Bundlable = null;
  static readonly BODY: string = 'body_form';
  static readonly MIND: string = 'mind_form';
  static readonly SPIRIT: string = 'spirit_form';
  _Trinity(): this {
    this._ArmorAbility();
    this.baseChargeUse_ = 25;
    this.bodyForm = null;
    this.mindForm = null;
    this.spiritForm = null;
    return this;
  }
  activate(armor: ClassArmor, hero: Hero, target: number): void {
    if (this.bodyForm == null && this.mindForm == null && this.spiritForm == null) {
      GLog.w(Messages.get$Object$String$ObjectArr(this, 'no_imbue', []), []);
    } else {
      GameScene.show(new Trinity$WndUseTrinity().$o(this)._Trinity$WndUseTrinity(armor));
    }
  }
  targetedPos(user: Char, dst: number): number {
    if (this.mindForm != null) {
      return (this.mindForm).targetingPos(user, dst);
    }
    return super.targetedPos(user, dst);
  }
  storeInBundle(bundle: Bundle): void {
    super.storeInBundle(bundle);
    if (this.bodyForm != null) {
      bundle.put$String$Bundlable(Trinity.BODY, this.bodyForm);
    }
    if (this.mindForm != null) {
      bundle.put$String$Bundlable(Trinity.MIND, this.mindForm);
    }
    if (this.spiritForm != null) {
      bundle.put$String$Bundlable(Trinity.SPIRIT, this.spiritForm);
    }
  }
  restoreFromBundle(bundle: Bundle): void {
    super.restoreFromBundle(bundle);
    if (bundle.contains(Trinity.BODY)) {
      this.bodyForm = bundle.get$String(Trinity.BODY);
    }
    if (bundle.contains(Trinity.MIND)) {
      this.mindForm = bundle.get$String(Trinity.MIND);
    }
    if (bundle.contains(Trinity.SPIRIT)) {
      this.spiritForm = bundle.get$String(Trinity.SPIRIT);
    }
  }
  icon(): number {
    return HeroIcon.TRINITY;
  }
  talents(): Talent[] {
    return [Talent.BODY_FORM, Talent.MIND_FORM, Talent.SPIRIT_FORM, Talent.HEROIC_ENERGY];
  }
  static trinityItemUseText(cls: JClass<any>): string {
    let chargeUse = Trinity.trinityChargeUsePerEffect(cls);
    if ($J.cls(Weapon$Enchantment).isAssignableFrom(cls) || $J.cls(Armor$Glyph).isAssignableFrom(cls)) {
      for (let ench of Weapon$Enchantment.rare) {
        if ($J.equals(ench, cls)) {
          return Messages.get$Class$String$ObjectArr($J.cls(Trinity), 'rare_ench_glyph_use', [BodyForm.duration(), Messages.decimalFormat('#.##', chargeUse)]);
        }
      }
      for (let glyph of Armor$Glyph.rare) {
        if ($J.equals(glyph, cls)) {
          return Messages.get$Class$String$ObjectArr($J.cls(Trinity), 'rare_ench_glyph_use', [BodyForm.duration(), Messages.decimalFormat('#.##', chargeUse)]);
        }
      }
      return Messages.get$Class$String$ObjectArr($J.cls(Trinity), 'ench_glyph_use', [BodyForm.duration(), Messages.decimalFormat('#.##', chargeUse)]);
    }
    if ($J.cls(MissileWeapon).isAssignableFrom(cls)) {
      return Messages.get$Class$String$ObjectArr($J.cls(Trinity), 'thrown_use', [MindForm.itemLevel(), Messages.decimalFormat('#.##', chargeUse)]);
    }
    if ($J.cls(Wand).isAssignableFrom(cls)) {
      if ($J.equals(cls, $J.cls(WandOfFireblast)) || $J.equals(cls, $J.cls(WandOfRegrowth))) {
        return Messages.get$Class$String$ObjectArr($J.cls(Trinity), 'wand_multi_use', [MindForm.itemLevel(), Messages.decimalFormat('#.##', chargeUse)]);
      }
      return Messages.get$Class$String$ObjectArr($J.cls(Trinity), 'wand_use', [MindForm.itemLevel(), Messages.decimalFormat('#.##', chargeUse)]);
    }
    if ($J.cls(Ring).isAssignableFrom(cls)) {
      return Messages.get$Class$String$ObjectArr($J.cls(Trinity), 'ring_use', [SpiritForm.ringLevel(), Messages.decimalFormat('#.##', chargeUse)]);
    }
    if ($J.cls(Artifact).isAssignableFrom(cls)) {
      return Messages.get$Class$String$ObjectArr($J.cls(Trinity), cls.getSimpleName() + '_use', [SpiritForm.artifactLevel(), Messages.decimalFormat('#.##', chargeUse)]);
    }
    return 'error!';
  }
  static trinityChargeUsePerEffect(cls: JClass<any>): number {
    let chargeUse = Dungeon.hero.armorAbility.chargeUse(Dungeon.hero);
    if ($J.cls(Weapon$Enchantment).isAssignableFrom(cls) || $J.cls(Armor$Glyph).isAssignableFrom(cls)) {
      for (let ench of Weapon$Enchantment.rare) {
        if ($J.equals(ench, cls)) {
          return Math.fround(2 * chargeUse);
        }
      }
      for (let glyph of Armor$Glyph.rare) {
        if ($J.equals(glyph, cls)) {
          return Math.fround(2 * chargeUse);
        }
      }
    }
    if ($J.equals(cls, $J.cls(WandOfFireblast)) || $J.equals(cls, $J.cls(WandOfRegrowth))) {
      return Math.fround(2 * chargeUse);
    }
    if ($J.cls(Artifact).isAssignableFrom(cls)) {
      if ($J.equals(cls, $J.cls(DriedRose)) || $J.equals(cls, $J.cls(UnstableSpellbook)) || $J.equals(cls, $J.cls(SkeletonKey))) {
        return Math.fround(2 * chargeUse);
      }
      if ($J.equals(cls, $J.cls(EtherealChains)) || $J.equals(cls, $J.cls(TalismanOfForesight)) || $J.equals(cls, $J.cls(TimekeepersHourglass))) {
        return Math.fround(Math.fround(1.4) * chargeUse);
      }
    }
    return chargeUse;
  }
}

export class Trinity$WndUseTrinity extends WndTitledMessage {
  _Trinity$WndUseTrinity(armor: ClassArmor): this {
    this._WndTitledMessage$Image$String$String(new HeroIcon()._HeroIcon$ArmorAbility(this.$outer), Messages.titleCase(this.$outer.name()), Messages.get$Class$String$ObjectArr($J.cls(Trinity$WndUseTrinity), 'text', []));
    let top = this.height_;
    if (this.$outer.bodyForm != null) {
      let btnBody = null;
      if (this.$outer.bodyForm instanceof Weapon$Enchantment) {
        btnBody = new (Trinity$WndUseTrinity$1())().$o(this).$c(armor)._RedButton$String$int(Messages.get$Class$String$ObjectArr($J.cls(Trinity$WndUseTrinity), 'body', [Messages.titleCase((this.$outer.bodyForm).name$())]) + ' ' + Trinity.trinityItemUseText(this.$outer.bodyForm.getClass()), 6);
        if (Dungeon.hero.belongings.weapon() != null) {
          btnBody.icon$Image(new ItemSprite()._ItemSprite$int$Glowing(Dungeon.hero.belongings.weapon().image_, (this.$outer.bodyForm).glowing()));
        } else {
          btnBody.icon$Image(new ItemSprite()._ItemSprite$int$Glowing(ItemSpriteSheet.WORN_SHORTSWORD, (this.$outer.bodyForm).glowing()));
        }
      } else if (this.$outer.bodyForm instanceof Armor$Glyph) {
        btnBody = new (Trinity$WndUseTrinity$2())().$o(this).$c(armor)._RedButton$String$int(Messages.get$Class$String$ObjectArr($J.cls(Trinity$WndUseTrinity), 'body', [Messages.titleCase((this.$outer.bodyForm).name$())]) + ' ' + Trinity.trinityItemUseText(this.$outer.bodyForm.getClass()), 6);
        if (Dungeon.hero.belongings.armor() != null) {
          btnBody.icon$Image(new ItemSprite()._ItemSprite$int$Glowing(Dungeon.hero.belongings.armor().image_, (this.$outer.bodyForm).glowing()));
        } else {
          btnBody.icon$Image(new ItemSprite()._ItemSprite$int$Glowing(ItemSpriteSheet.ARMOR_CLOTH, (this.$outer.bodyForm).glowing()));
        }
      }
      btnBody.multiline = true;
      btnBody.setSize(Math.fround(this.width_), 100);
      btnBody.setRect(0, Math.fround((top + 2) | 0), Math.fround(this.width_), btnBody.reqHeight());
      this.add$Gizmo(btnBody);
      top = $J.d2i(btnBody.bottom());
      btnBody.enable(Dungeon.hero.buff($J.cls(MagicImmune)) == null && armor.charge_ >= Trinity.trinityChargeUsePerEffect(this.$outer.bodyForm.getClass()));
    }
    if (this.$outer.mindForm != null) {
      let btnMind = new (Trinity$WndUseTrinity$3())().$o(this).$c(armor)._RedButton$String$int(Messages.get$Class$String$ObjectArr($J.cls(Trinity$WndUseTrinity), 'mind', [Messages.titleCase((this.$outer.mindForm).name())]) + ' ' + Trinity.trinityItemUseText(this.$outer.mindForm.getClass()), 6);
      btnMind.icon$Image(new ItemSprite()._ItemSprite$Item(this.$outer.mindForm));
      btnMind.multiline = true;
      btnMind.setSize(Math.fround(this.width_), 100);
      btnMind.setRect(0, Math.fround((top + 2) | 0), Math.fround(this.width_), btnMind.reqHeight());
      this.add$Gizmo(btnMind);
      top = $J.d2i(btnMind.bottom());
      btnMind.enable(armor.charge_ >= Trinity.trinityChargeUsePerEffect(this.$outer.mindForm.getClass()));
      if (this.$outer.mindForm instanceof Wand && Dungeon.hero.buff($J.cls(MagicImmune)) != null) {
        btnMind.enable(false);
      }
    }
    if (this.$outer.spiritForm != null) {
      let btnSpirit = new (Trinity$WndUseTrinity$4())().$o(this).$c(armor)._RedButton$String$int(Messages.get$Class$String$ObjectArr($J.cls(Trinity$WndUseTrinity), 'spirit', [Messages.titleCase((this.$outer.spiritForm).name())]) + ' ' + Trinity.trinityItemUseText(this.$outer.spiritForm.getClass()), 6);
      if (this.$outer.spiritForm instanceof Artifact) {
        (this.$outer.spiritForm).resetForTrinity(SpiritForm.artifactLevel());
      }
      btnSpirit.icon$Image(new ItemSprite()._ItemSprite$Item(this.$outer.spiritForm));
      btnSpirit.multiline = true;
      btnSpirit.setSize(Math.fround(this.width_), 100);
      btnSpirit.setRect(0, Math.fround((top + 2) | 0), Math.fround(this.width_), btnSpirit.reqHeight());
      this.add$Gizmo(btnSpirit);
      top = $J.d2i(btnSpirit.bottom());
      btnSpirit.enable(Dungeon.hero.buff($J.cls(MagicImmune)) == null && armor.charge_ >= Trinity.trinityChargeUsePerEffect(this.$outer.spiritForm.getClass()));
    }
    this.resize(this.width_, top);
    return this;
  }
}

export class Trinity$WndItemtypeSelect extends WndTitledMessage {
  _Trinity$WndItemtypeSelect(tome: HolyTome, spell: ClericSpell): this {
    this._WndTitledMessage$Image$String$String(new HeroIcon()._HeroIcon$ClericSpell(spell), Messages.titleCase(spell.name()), Messages.get$Class$String$ObjectArr($J.cls(Trinity$WndItemtypeSelect), 'text', []));
    let discoveredClasses = new ArrayList();
    if (spell === BodyForm.INSTANCE) {
      for (const $it0 = Catalog.ENCHANTMENTS.items().iterator(); $it0.hasNext(); ) {
        let cls = $it0.next();
        if (Statistics.itemTypesDiscovered.contains(cls)) {
          discoveredClasses.add(cls);
        }
      }
      for (const $it1 = Catalog.GLYPHS.items().iterator(); $it1.hasNext(); ) {
        let cls = $it1.next();
        if (Statistics.itemTypesDiscovered.contains(cls)) {
          discoveredClasses.add(cls);
        }
      }
    } else if (spell === MindForm.INSTANCE) {
      for (const $it2 = Catalog.WANDS.items().iterator(); $it2.hasNext(); ) {
        let cls = $it2.next();
        if (Statistics.itemTypesDiscovered.contains(cls)) {
          discoveredClasses.add(cls);
        }
      }
      for (const $it3 = Catalog.THROWN_WEAPONS.items().iterator(); $it3.hasNext(); ) {
        let cls = $it3.next();
        if (Statistics.itemTypesDiscovered.contains(cls)) {
          discoveredClasses.add(cls);
        }
      }
      for (const $it4 = Catalog.TIPPED_DARTS.items().iterator(); $it4.hasNext(); ) {
        let cls = $it4.next();
        if (Statistics.itemTypesDiscovered.contains(cls)) {
          discoveredClasses.add(cls);
        }
      }
    } else if (spell === SpiritForm.INSTANCE) {
      for (const $it5 = Catalog.RINGS.items().iterator(); $it5.hasNext(); ) {
        let cls = $it5.next();
        if (Statistics.itemTypesDiscovered.contains(cls)) {
          discoveredClasses.add(cls);
        }
      }
      for (const $it6 = Catalog.ARTIFACTS.items().iterator(); $it6.hasNext(); ) {
        let cls = $it6.next();
        if (Statistics.itemTypesDiscovered.contains(cls)) {
          discoveredClasses.add(cls);
        }
        discoveredClasses.remove($J.cls(HolyTome));
      }
    }
    let options = new ArrayList();
    for (const $it7 = discoveredClasses.iterator(); $it7.hasNext(); ) {
      let cls = $it7.next();
      if ($J.cls(Weapon$Enchantment).isAssignableFrom(cls)) {
        let w = new (Trinity$WndItemtypeSelect$1())().$o(this)._WornShortsword();
        if (Dungeon.hero.belongings.weapon() != null) {
          w.image_ = Dungeon.hero.belongings.weapon().image_;
        }
        w.enchant$Enchantment(Reflection.newInstance(cls));
        w.cursedKnown = true;
        options.add(w);
      } else if ($J.cls(Armor$Glyph).isAssignableFrom(cls)) {
        let a = new (Trinity$WndItemtypeSelect$2())().$o(this)._ClothArmor();
        if (Dungeon.hero.belongings.armor() != null) {
          a.image_ = Dungeon.hero.belongings.armor().image_;
        }
        a.inscribe$Glyph(Reflection.newInstance(cls));
        a.cursedKnown = true;
        options.add(a);
      } else {
        options.add(Reflection.newInstance(cls));
      }
    }
    let top = (this.height_ + 2) | 0;
    let left = 0;
    for (const $it8 = options.iterator(); $it8.hasNext(); ) {
      let item = $it8.next();
      let btn = new (Trinity$WndItemtypeSelect$3())().$o(this).$c(item, tome, spell)._ItemButton();
      btn.item$Item(item);
      btn.slot().textVisible(false);
      btn.setRect(Math.fround(left), Math.fround(top), 19, 19);
      this.add$Gizmo(btn);
      left = (left + 20) | 0;
      if (left >= ((this.width_ - 19) | 0)) {
        top = (top + 20) | 0;
        left = 0;
      }
    }
    if (left > 0) {
      top = (top + 20) | 0;
      left = 0;
    }
    this.resize(this.width_, top);
    return this;
  }
}

export class Trinity$WndItemConfirm extends WndTitledMessage {
  _Trinity$WndItemConfirm(parentWnd: Window, item: Item, tome: HolyTome, spell: ClericSpell): this {
    this._WndTitledMessage$Image$String$String(new ItemSprite()._ItemSprite$Item(item), Messages.titleCase(Trinity$WndItemConfirm.getName(item)), Trinity$WndItemConfirm.getText(item));
    let text: string;
    if (spell === BodyForm.INSTANCE) {
      text = Messages.get$Object$String$ObjectArr(this, 'body', []);
    } else if (spell === MindForm.INSTANCE) {
      text = Messages.get$Object$String$ObjectArr(this, 'mind', []);
    } else {
      text = Messages.get$Object$String$ObjectArr(this, 'spirit', []);
    }
    let btnConfirm = new (Trinity$WndItemConfirm$1())().$o(this).$c(parentWnd, item, spell, tome)._RedButton$String(text);
    btnConfirm.setRect(0, Math.fround((this.height_ + 2) | 0), Math.fround(this.width_), 16);
    this.add$Gizmo(btnConfirm);
    this.resize(this.width_, $J.d2i(btnConfirm.bottom()));
    return this;
  }
  static getName(item: Item): string {
    if (item instanceof MeleeWeapon) {
      return (item).enchantment.name$();
    } else if (item instanceof Armor) {
      return ((item).glyph_.name$());
    }
    return item.name();
  }
  static getText(item: Item): string {
    if (item instanceof MeleeWeapon) {
      return (item).enchantment.desc() + '\n\n' + Trinity.trinityItemUseText((item).enchantment.getClass());
    } else if (item instanceof Armor) {
      return (item).glyph_.desc() + '\n\n' + Trinity.trinityItemUseText((item).glyph_.getClass());
    } else {
      return item.desc() + '\n\n' + Trinity.trinityItemUseText(item.getClass());
    }
  }
}

let $Trinity$WndUseTrinity$1: any = null;
/** An anonymous class (Trinity.java:124). */
function Trinity$WndUseTrinity$1(): any {
  return $Trinity$WndUseTrinity$1 ??= $J.local(class extends RedButton {
    onClick(): void {
      if (Dungeon.hero.belongings.weapon() != null && (Dungeon.hero.belongings.weapon()).enchantment != null && $J.equals((Dungeon.hero.belongings.weapon()).enchantment.getClass(), this.$outer.$outer.bodyForm.getClass())) {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(Trinity), 'no_duplicate', []), []);
        this.$outer.hide();
      } else {
        Buff.prolong(Dungeon.hero, $J.cls(BodyForm$BodyFormBuff), Math.fround(BodyForm.duration())).setEffect(this.$outer.$outer.bodyForm);
        if (this.$outer.$outer.bodyForm instanceof Crystal) {
          (this.$outer.$outer.bodyForm).setDurability(Math.fround(BodyForm.duration() * 1.5));
        }
        Sample.INSTANCE.play$Object(Assets$Sounds.TELEPORT);
        let w = new WornShortsword()._WornShortsword();
        if (Dungeon.hero.belongings.weapon() != null) {
          w.image_ = Dungeon.hero.belongings.weapon().image_;
        }
        w.enchant$Enchantment(this.$outer.$outer.bodyForm);
        Enchanting.show(Dungeon.hero, w);
        Dungeon.hero.sprite_.operate$int(Dungeon.hero.pos);
        Dungeon.hero.spendAndNext(1);
        this.$cv_armor.charge_ = Math.fround(this.$cv_armor.charge_ - Trinity.trinityChargeUsePerEffect(this.$outer.$outer.bodyForm.getClass()));
        Item.updateQuickslot();
        Invisibility.dispel$();
        this.$outer.hide();
      }
    }
    $c($armor): this {
      this.$cv_armor = $armor;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.Trinity$WndUseTrinity$1', []);
}

let $Trinity$WndUseTrinity$2: any = null;
/** An anonymous class (Trinity.java:164). */
function Trinity$WndUseTrinity$2(): any {
  return $Trinity$WndUseTrinity$2 ??= $J.local(class extends RedButton {
    onClick(): void {
      if (Dungeon.hero.belongings.armor() != null && Dungeon.hero.belongings.armor().glyph_ != null && $J.equals((Dungeon.hero.belongings.armor()).glyph_.getClass(), this.$outer.$outer.bodyForm.getClass())) {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(Trinity), 'no_duplicate', []), []);
        this.$outer.hide();
      } else {
        Buff.prolong(Dungeon.hero, $J.cls(BodyForm$BodyFormBuff), Math.fround(BodyForm.duration())).setEffect(this.$outer.$outer.bodyForm);
        Sample.INSTANCE.play$Object(Assets$Sounds.TELEPORT);
        let a = new ClothArmor()._ClothArmor();
        if (Dungeon.hero.belongings.armor() != null) {
          a.image_ = Dungeon.hero.belongings.armor().image_;
        }
        a.inscribe$Glyph(this.$outer.$outer.bodyForm);
        Enchanting.show(Dungeon.hero, a);
        Dungeon.hero.sprite_.operate$int(Dungeon.hero.pos);
        Dungeon.hero.spendAndNext(1);
        this.$cv_armor.charge_ = Math.fround(this.$cv_armor.charge_ - Trinity.trinityChargeUsePerEffect(this.$outer.$outer.bodyForm.getClass()));
        Item.updateQuickslot();
        Invisibility.dispel$();
        this.$outer.hide();
      }
    }
    $c($armor): this {
      this.$cv_armor = $armor;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.Trinity$WndUseTrinity$2', []);
}

let $Trinity$WndUseTrinity$3: any = null;
/** An anonymous class (Trinity.java:208). */
function Trinity$WndUseTrinity$3(): any {
  return $Trinity$WndUseTrinity$3 ??= $J.local(class extends RedButton {
    onClick(): void {
      this.$outer.hide();
      let mindEffect = new MindForm$targetSelector()._MindForm$targetSelector();
      mindEffect.setEffect(this.$outer.$outer.mindForm);
      GameScene.selectCell(mindEffect);
      Sample.INSTANCE.play$Object(Assets$Sounds.TELEPORT);
      Enchanting.show(Dungeon.hero, this.$outer.$outer.mindForm);
      Dungeon.hero.sprite_.operate$int(Dungeon.hero.pos);
      if ((this.$outer.$outer.mindForm).usesTargeting_ && Dungeon.quickslot.contains(this.$cv_armor)) {
        QuickSlotButton.useTargeting(Dungeon.quickslot.getSlot(this.$cv_armor));
      }
    }
    $c($armor): this {
      this.$cv_armor = $armor;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.Trinity$WndUseTrinity$3', []);
}

let $Trinity$WndUseTrinity$4: any = null;
/** An anonymous class (Trinity.java:240). */
function Trinity$WndUseTrinity$4(): any {
  return $Trinity$WndUseTrinity$4 ??= $J.local(class extends RedButton {
    onClick(): void {
      if ((Dungeon.hero.belongings.ring() != null && $J.equals(Dungeon.hero.belongings.ring().getClass(), this.$outer.$outer.spiritForm.getClass())) || (Dungeon.hero.belongings.misc() != null && $J.equals(Dungeon.hero.belongings.misc().getClass(), this.$outer.$outer.spiritForm.getClass())) || (Dungeon.hero.belongings.artifact() != null && $J.equals(Dungeon.hero.belongings.artifact().getClass(), this.$outer.$outer.spiritForm.getClass()))) {
        GLog.w(Messages.get$Class$String$ObjectArr($J.cls(Trinity), 'no_duplicate', []), []);
        this.$outer.hide();
        return;
      }
      Invisibility.dispel$();
      if (this.$outer.$outer.spiritForm instanceof Ring || this.$outer.$outer.spiritForm instanceof ChaliceOfBlood) {
        Buff.prolong(Dungeon.hero, $J.cls(SpiritForm$SpiritFormBuff), SpiritForm$SpiritFormBuff.DURATION).setEffect(this.$outer.$outer.spiritForm);
        Dungeon.hero.spendAndNext(1);
      } else {
        SpiritForm.applyActiveArtifactEffect(this.$cv_armor, this.$outer.$outer.spiritForm);
      }
      Sample.INSTANCE.play$Object(Assets$Sounds.TELEPORT);
      Enchanting.show(Dungeon.hero, this.$outer.$outer.spiritForm);
      Dungeon.hero.sprite_.operate$int(Dungeon.hero.pos);
      this.$cv_armor.charge_ = Math.fround(this.$cv_armor.charge_ - Trinity.trinityChargeUsePerEffect(this.$outer.$outer.spiritForm.getClass()));
      Item.updateQuickslot();
      this.$outer.hide();
    }
    $c($armor): this {
      this.$cv_armor = $armor;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.Trinity$WndUseTrinity$4', []);
}

let $Trinity$WndItemtypeSelect$1: any = null;
/** An anonymous class (Trinity.java:370). */
function Trinity$WndItemtypeSelect$1(): any {
  return $Trinity$WndItemtypeSelect$1 ??= $J.local(class extends WornShortsword {
    name(): string {
      return this.enchantment.name$();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.Trinity$WndItemtypeSelect$1', []);
}

let $Trinity$WndItemtypeSelect$2: any = null;
/** An anonymous class (Trinity.java:384). */
function Trinity$WndItemtypeSelect$2(): any {
  return $Trinity$WndItemtypeSelect$2 ??= $J.local(class extends ClothArmor {
    name(): string {
      return this.glyph_.name$();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.Trinity$WndItemtypeSelect$2', []);
}

let $Trinity$WndItemtypeSelect$3: any = null;
/** An anonymous class (Trinity.java:406). */
function Trinity$WndItemtypeSelect$3(): any {
  return $Trinity$WndItemtypeSelect$3 ??= $J.local(class extends ItemButton {
    onClick(): void {
      GameScene.show(new Trinity$WndItemConfirm()._Trinity$WndItemConfirm(this.$outer, this.$cv_item, this.$cv_tome, this.$cv_spell));
    }
    $c($item, $tome, $spell): this {
      this.$cv_item = $item; this.$cv_tome = $tome; this.$cv_spell = $spell;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.Trinity$WndItemtypeSelect$3', []);
}

let $Trinity$WndItemConfirm$1: any = null;
/** An anonymous class (Trinity.java:449). */
function Trinity$WndItemConfirm$1(): any {
  return $Trinity$WndItemConfirm$1 ??= $J.local(class extends RedButton {
    onClick(): void {
      this.$cv_parentWnd.hide();
      this.$outer.hide();
      if (this.$cv_item instanceof MeleeWeapon) {
        (Dungeon.hero.armorAbility).bodyForm = (this.$cv_item).enchantment;
      } else if (this.$cv_item instanceof Armor) {
        (Dungeon.hero.armorAbility).bodyForm = (this.$cv_item).glyph_;
      } else if (this.$cv_item instanceof Wand || this.$cv_item instanceof MissileWeapon) {
        (Dungeon.hero.armorAbility).mindForm = this.$cv_item;
      } else {
        (Dungeon.hero.armorAbility).spiritForm = this.$cv_item;
      }
      this.$cv_spell.onSpellCast(this.$cv_tome, Dungeon.hero);
      Dungeon.hero.sprite_.operate$int(Dungeon.hero.pos);
      Enchanting.show(Dungeon.hero, this.$cv_item);
      Sample.INSTANCE.play$Object(Assets$Sounds.TELEPORT);
    }
    $c($parentWnd, $item, $spell, $tome): this {
      this.$cv_parentWnd = $parentWnd; this.$cv_item = $item; this.$cv_spell = $spell; this.$cv_tome = $tome;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.Trinity$WndItemConfirm$1', []);
}

$J.define(Trinity, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.Trinity', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.ArmorAbility', ctors: { '': '_Trinity' } });
$J.define(Trinity$WndUseTrinity, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.Trinity$WndUseTrinity', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTitledMessage', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.items.armor.ClassArmor': '_Trinity$WndUseTrinity' }, inner: true });
$J.define(Trinity$WndItemtypeSelect, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.Trinity$WndItemtypeSelect', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTitledMessage', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.items.artifacts.HolyTome,com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.ClericSpell': '_Trinity$WndItemtypeSelect' } });
$J.define(Trinity$WndItemConfirm, 'com.shatteredpixel.shatteredpixeldungeon.actors.hero.abilities.cleric.Trinity$WndItemConfirm', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTitledMessage', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.ui.Window,com.shatteredpixel.shatteredpixeldungeon.items.Item,com.shatteredpixel.shatteredpixeldungeon.items.artifacts.HolyTome,com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.ClericSpell': '_Trinity$WndItemConfirm' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  Invisibility = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Invisibility');
  MagicImmune = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.MagicImmune');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  BodyForm = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.BodyForm');
  BodyForm$BodyFormBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.BodyForm$BodyFormBuff');
  MindForm = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.MindForm');
  MindForm$targetSelector = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.MindForm$targetSelector');
  SpiritForm = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.SpiritForm');
  SpiritForm$SpiritFormBuff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.spells.SpiritForm$SpiritFormBuff');
  Enchanting = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Enchanting');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Armor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor');
  Armor$Glyph = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Glyph');
  ClothArmor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.ClothArmor');
  Artifact = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.Artifact');
  ChaliceOfBlood = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.ChaliceOfBlood');
  DriedRose = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.DriedRose');
  EtherealChains = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.EtherealChains');
  HolyTome = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.HolyTome');
  SkeletonKey = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.SkeletonKey');
  TalismanOfForesight = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.TalismanOfForesight');
  TimekeepersHourglass = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.TimekeepersHourglass');
  UnstableSpellbook = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.artifacts.UnstableSpellbook');
  Ring = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  WandOfFireblast = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfFireblast');
  WandOfRegrowth = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.WandOfRegrowth');
  Weapon$Enchantment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment');
  Crystal = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.enchantments.Crystal');
  MeleeWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon');
  WornShortsword = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.WornShortsword');
  MissileWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon');
  Catalog = $J.load('com.shatteredpixel.shatteredpixeldungeon.journal.Catalog');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  HeroIcon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.HeroIcon');
  ItemButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ItemButton');
  QuickSlotButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.QuickSlotButton');
  RedButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RedButton');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
