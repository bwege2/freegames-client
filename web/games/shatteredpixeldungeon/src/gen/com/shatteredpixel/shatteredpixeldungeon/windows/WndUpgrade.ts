// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndUpgrade.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JString } from '../../../../../jre/index.ts';
import { Window } from '../ui/Window.ts';

let Assets$Sounds, Dungeon, HeroClass, Talent, Armor, Ring, ScrollOfUpgrade, MagicalInfusion, Wand, Weapon, Crossbow, Greatshield, MagesStaff, MeleeWeapon, RoundShield, MissileWeapon, Tomahawk, Languages, Messages, GameScene, PixelScene, CharSprite, ItemSprite, Icons, ItemSlot, RedButton, RenderedTextBlock, IconTitle, BitmapText, ColorBlock, Sample, Reflection;

export class WndUpgrade extends Window {
  static readonly WIDTH: number = 120;
  static readonly COL_1: number = 30;
  static readonly COL_2: number = 75;
  static readonly COL_3: number = 105;
  static readonly GAP: number = 2;
  static readonly ITEMSLOT_SIZE: number = 18;
  upgrader: Item = null;
  force: boolean = false;
  btnUpgrade: RedButton = null;
  btnCancel: RedButton = null;
  _WndUpgrade(upgrader: Item, toUpgrade: Item, force: boolean): this {
    this._Window$();
    this.upgrader = upgrader;
    this.force = force;
    let title = new IconTitle()._IconTitle$Image$String(new ItemSprite()._ItemSprite$Item(upgrader), Messages.get$Object$String$ObjectArr(this, 'title', []));
    title.setRect(0, 0, Math.fround(WndUpgrade.WIDTH), 0);
    this.add$Gizmo(title);
    let quantity = upgrader.quantity$();
    let moreUpgradeItem = Dungeon.hero.belongings.getItem(upgrader.getClass());
    if (moreUpgradeItem != null && moreUpgradeItem !== upgrader) {
      quantity = (quantity + moreUpgradeItem.quantity$()) | 0;
    }
    let mainText = Messages.get$Object$String$ObjectArr(this, 'desc', []);
    if (quantity > 1) {
      mainText += '\n' + Messages.get$Object$String$ObjectArr(this, 'remaining', [quantity]);
    }
    let message = PixelScene.renderTextBlock$int(6);
    message.text$String$int(mainText, WndUpgrade.WIDTH);
    message.setPos(0, Math.fround(title.bottom() + WndUpgrade.GAP));
    this.add$Gizmo(message);
    let levelFrom = toUpgrade.isIdentified() ? toUpgrade.level$() : 0;
    let levelTo = (levelFrom + 1) | 0;
    if (toUpgrade instanceof Wand && (toUpgrade).resinBonus > 0) {
      levelTo--;
    }
    let curseInfused = (toUpgrade instanceof Weapon && (toUpgrade).curseInfusionBonus) || (toUpgrade instanceof Armor && (toUpgrade).curseInfusionBonus) || (toUpgrade instanceof Wand && (toUpgrade).curseInfusionBonus);
    if (curseInfused) {
      if ($J.idiv(toUpgrade.trueLevel(), 6) < $J.idiv(((toUpgrade.trueLevel() + 1) | 0), 6)) {
        levelTo++;
      }
    }
    let bg1 = new ColorBlock()._ColorBlock(Math.fround(WndUpgrade.ITEMSLOT_SIZE), Math.fround(WndUpgrade.ITEMSLOT_SIZE), -1722591667);
    bg1.x = Math.fround(WndUpgrade.COL_2 - Math.fround(WndUpgrade.ITEMSLOT_SIZE / 2));
    bg1.y = Math.fround(message.bottom() + Math.imul(2, WndUpgrade.GAP));
    this.add$Gizmo(bg1);
    let bg2 = new ColorBlock()._ColorBlock(Math.fround(WndUpgrade.ITEMSLOT_SIZE), Math.fround(WndUpgrade.ITEMSLOT_SIZE), -1722591667);
    bg2.x = Math.fround(WndUpgrade.COL_3 - Math.fround(WndUpgrade.ITEMSLOT_SIZE / 2));
    bg2.y = Math.fround(message.bottom() + Math.imul(2, WndUpgrade.GAP));
    this.add$Gizmo(bg2);
    if (!toUpgrade.isIdentified()) {
      if (!toUpgrade.cursed && toUpgrade.cursedKnown) {
        bg1.hardlight$float$float$float(1, 1, 2);
        bg2.hardlight$float$float$float(1, 1, 2);
      } else {
        bg1.hardlight$float$float$float(2, 1, 2);
        bg2.hardlight$float$float$float(2, 1, 2);
      }
    } else if (toUpgrade.cursed && toUpgrade.cursedKnown) {
      bg1.hardlight$float$float$float(2, 0.5, 1);
      bg2.hardlight$float$float$float(2, 0.5, 1);
    }
    let i1 = new ItemSprite()._ItemSprite$();
    this.add$Gizmo(i1);
    i1.view$Item(toUpgrade);
    i1.x = Math.fround(WndUpgrade.COL_2 - Math.fround(i1.width() / 2));
    i1.y = Math.fround(bg1.y + Math.fround((Math.fround(WndUpgrade.ITEMSLOT_SIZE - i1.height())) / 2));
    PixelScene.align$Visual(i1);
    this.add$Gizmo(i1);
    let i2 = new ItemSprite()._ItemSprite$();
    this.add$Gizmo(i2);
    i2.view$Item(toUpgrade);
    i2.x = Math.fround(WndUpgrade.COL_3 - Math.fround(i2.width() / 2));
    i2.y = i1.y;
    PixelScene.align$Visual(i2);
    this.add$Gizmo(i2);
    let t1 = new BitmapText()._BitmapText$Font(PixelScene.pixelFont);
    let t2 = new BitmapText()._BitmapText$Font(PixelScene.pixelFont);
    if (toUpgrade.isIdentified()) {
      if (levelFrom > 0) {
        t1.text$String('+' + levelFrom);
      } else {
        t1.text$String('');
      }
      t1.hardlight$int(ItemSlot.UPGRADED);
      t2.text$String('+' + levelTo);
      t2.hardlight$int(ItemSlot.UPGRADED);
      if (curseInfused) {
        t1.hardlight$int(ItemSlot.CURSE_INFUSED);
        t2.hardlight$int(ItemSlot.CURSE_INFUSED);
      }
    } else {
      t1.text$String('?');
      t2.text$String('+1?');
      t2.hardlight$int(ItemSlot.UPGRADED);
    }
    t1.measure();
    t1.x = Math.fround(Math.fround(WndUpgrade.COL_2 + Math.fround(WndUpgrade.ITEMSLOT_SIZE / 2)) - t1.width());
    t1.y = Math.fround(Math.fround(Math.fround(bg1.y + WndUpgrade.ITEMSLOT_SIZE) - t1.baseLine()) - 1);
    this.add$Gizmo(t1);
    t2.measure();
    t2.x = Math.fround(Math.fround(WndUpgrade.COL_3 + Math.fround(WndUpgrade.ITEMSLOT_SIZE / 2)) - t2.width());
    t2.y = Math.fround(Math.fround(Math.fround(bg2.y + WndUpgrade.ITEMSLOT_SIZE) - t2.baseLine()) - 1);
    this.add$Gizmo(t2);
    let bottom = Math.fround(i1.y + WndUpgrade.ITEMSLOT_SIZE);
    if (toUpgrade instanceof Weapon) {
      let aug = (toUpgrade).augment;
      bottom = this.fillFields(Messages.get$Object$String$ObjectArr(this, 'damage', []), aug.damageFactor$int((toUpgrade).min$int(levelFrom)) + '-' + aug.damageFactor$int((toUpgrade).max$int(levelFrom)), aug.damageFactor$int((toUpgrade).min$int(levelTo)) + '-' + aug.damageFactor$int((toUpgrade).max$int(levelTo)), bottom);
    }
    if (toUpgrade instanceof Crossbow) {
      bottom = this.fillFields(Messages.get$Object$String$ObjectArr(this, 'dart_damage', []), (toUpgrade).dartMin$int(levelFrom) + '-' + (toUpgrade).dartMax$int(levelFrom), (toUpgrade).dartMin$int(levelTo) + '-' + (toUpgrade).dartMax$int(levelTo), bottom);
    }
    if (toUpgrade instanceof Tomahawk) {
      bottom = this.fillFields(Messages.get$Object$String$ObjectArr(this, 'bleeding', []), $J.roundf((toUpgrade).minBleed$int(levelFrom)) + '-' + $J.roundf((toUpgrade).maxBleed$int(levelFrom)), $J.roundf((toUpgrade).minBleed$int(levelTo)) + '-' + $J.roundf((toUpgrade).maxBleed$int(levelTo)), bottom);
    }
    if (Dungeon.hero != null && Dungeon.hero.heroClass === HeroClass.DUELIST && toUpgrade instanceof MeleeWeapon && (toUpgrade).upgradeAbilityStat(levelFrom) != null) {
      bottom = this.fillFields(Messages.get$Object$String$ObjectArr(toUpgrade, 'upgrade_ability_stat_name', []), (toUpgrade).upgradeAbilityStat(levelFrom), (toUpgrade).upgradeAbilityStat(levelTo), bottom);
    }
    if (toUpgrade instanceof Armor) {
      let aug = (toUpgrade).augment;
      bottom = this.fillFields(Messages.get$Object$String$ObjectArr(this, 'blocking', []), (toUpgrade).DRMin$int(levelFrom) + '-' + ((toUpgrade).DRMax$int(levelFrom)), (toUpgrade).DRMin$int(levelTo) + '-' + ((toUpgrade).DRMax$int(levelTo)), bottom);
    } else if (toUpgrade instanceof RoundShield) {
      bottom = this.fillFields(Messages.get$Object$String$ObjectArr(this, 'blocking', []), 0 + '-' + (toUpgrade).DRMax$int(levelFrom), 0 + '-' + (toUpgrade).DRMax$int(levelTo), bottom);
    } else if (toUpgrade instanceof Greatshield) {
      bottom = this.fillFields(Messages.get$Object$String$ObjectArr(this, 'blocking', []), 0 + '-' + (toUpgrade).DRMax$int(levelFrom), 0 + '-' + (toUpgrade).DRMax$int(levelTo), bottom);
    }
    if (toUpgrade instanceof Weapon) {
      bottom = this.fillFields(Messages.get$Object$String$ObjectArr(this, 'weight', []), String(((toUpgrade).STRReq$int(levelFrom))), String(((toUpgrade).STRReq$int(levelTo))), bottom);
    } else if (toUpgrade instanceof Armor) {
      bottom = this.fillFields(Messages.get$Object$String$ObjectArr(this, 'weight', []), String(((toUpgrade).STRReq$int(levelFrom))), String(((toUpgrade).STRReq$int(levelTo))), bottom);
    }
    if (toUpgrade instanceof MissileWeapon) {
      let uses1: number;
      let uses2: number;
      uses1 = $J.d2i(Math.ceil(Math.fround(100 / (toUpgrade).durabilityPerUse$int(levelFrom))));
      uses2 = $J.d2i(Math.ceil(Math.fround(100 / (toUpgrade).durabilityPerUse$int(levelTo))));
      bottom = this.fillFields(Messages.get$Object$String$ObjectArr(this, 'durability', []), uses1 > 100 ? '∞' : String(uses1), uses2 > 100 ? '∞' : String(uses2), bottom);
      bottom = this.fillFields(Messages.get$Object$String$ObjectArr(this, 'quantity', []), String(toUpgrade.quantity$()), String((toUpgrade).defaultQuantity()), bottom);
    }
    let wand = toUpgrade;
    if (toUpgrade instanceof MagesStaff && (toUpgrade).wandClass() != null) {
      wand = Reflection.newInstance((toUpgrade).wandClass());
    }
    if (wand instanceof Wand) {
      if ((wand).upgradeStat1(levelFrom) != null) {
        bottom = this.fillFields(Messages.get$Object$String$ObjectArr(wand, 'upgrade_stat_name_1', []), (wand).upgradeStat1(levelFrom), (wand).upgradeStat1(levelTo), bottom);
      }
      if ((wand).upgradeStat2(levelFrom) != null) {
        bottom = this.fillFields(Messages.get$Object$String$ObjectArr(wand, 'upgrade_stat_name_2', []), (wand).upgradeStat2(levelFrom), (wand).upgradeStat2(levelTo), bottom);
      }
      if ((wand).upgradeStat3(levelFrom) != null) {
        bottom = this.fillFields(Messages.get$Object$String$ObjectArr(wand, 'upgrade_stat_name_3', []), (wand).upgradeStat3(levelFrom), (wand).upgradeStat3(levelTo), bottom);
      }
    }
    if (wand instanceof Wand) {
      let chargeboost = (levelFrom + (toUpgrade instanceof MagesStaff ? 1 : 0)) | 0;
      bottom = this.fillFields(Messages.get$Object$String$ObjectArr(this, 'charges', []), String(Math.min(10, ((wand).initialCharges() + chargeboost) | 0)), String(Math.min(10, ((wand).initialCharges() + chargeboost + 1) | 0)), bottom);
    }
    if (toUpgrade instanceof Ring) {
      if ((toUpgrade).isKnown()) {
        if ((toUpgrade).upgradeStat1(levelFrom) != null) {
          bottom = this.fillFields(Messages.get$Object$String$ObjectArr(toUpgrade, 'upgrade_stat_name_1', []), (toUpgrade).upgradeStat1(levelFrom), (toUpgrade).upgradeStat1(levelTo), bottom);
        }
        if ((toUpgrade).upgradeStat2(levelFrom) != null) {
          bottom = this.fillFields(Messages.get$Object$String$ObjectArr(toUpgrade, 'upgrade_stat_name_2', []), (toUpgrade).upgradeStat2(levelFrom), (toUpgrade).upgradeStat2(levelTo), bottom);
        }
        if ((toUpgrade).upgradeStat3(levelFrom) != null) {
          bottom = this.fillFields(Messages.get$Object$String$ObjectArr(toUpgrade, 'upgrade_stat_name_3', []), (toUpgrade).upgradeStat3(levelFrom), (toUpgrade).upgradeStat3(levelTo), bottom);
        }
      }
    }
    let sep = new ColorBlock()._ColorBlock(1, 1, -14540254);
    sep.size(1, Math.fround(bottom - message.bottom()));
    sep.x = Math.fround(WndUpgrade.WIDTH / 2);
    sep.y = Math.fround(message.bottom() + WndUpgrade.GAP);
    this.add$Gizmo(sep);
    sep = new ColorBlock()._ColorBlock(1, 1, -14540254);
    sep.size(1, Math.fround(bottom - message.bottom()));
    sep.x = Math.fround(Math.imul(3, WndUpgrade.WIDTH) / 4);
    sep.y = Math.fround(message.bottom() + WndUpgrade.GAP);
    this.add$Gizmo(sep);
    if (!toUpgrade.isIdentified()) {
      if (toUpgrade instanceof Ring && !(toUpgrade).isKnown()) {
        bottom = this.addMessage(Messages.get$Object$String$ObjectArr(this, 'unknown_ring', []), CharSprite.WARNING, bottom);
      } else {
        bottom = this.addMessage(Messages.get$Object$String$ObjectArr(this, 'unided', []), CharSprite.WARNING, bottom);
      }
    }
    if (!(upgrader instanceof MagicalInfusion)) {
      if ((toUpgrade instanceof Weapon && (toUpgrade).hasGoodEnchant()) || (toUpgrade instanceof Armor && (toUpgrade).hasGoodGlyph())) {
        let lossChance: number;
        if ((toUpgrade instanceof Weapon && (toUpgrade).enchantHardened) || (toUpgrade instanceof Armor && (toUpgrade).glyphHardened)) {
          lossChance = Math.min(100, Math.imul(10, $J.d2i($J.pow(2, (levelFrom - 6) | 0))));
        } else {
          lossChance = Math.min(100, Math.imul(10, $J.d2i($J.pow(2, (levelFrom - 4) | 0))));
          if (Dungeon.hero != null && Dungeon.hero.heroClass !== HeroClass.WARRIOR && Dungeon.hero.hasTalent(Talent.RUNIC_TRANSFERENCE)) {
            if (levelFrom < ((5 + Dungeon.hero.pointsInTalent(Talent.RUNIC_TRANSFERENCE)) | 0)) {
              lossChance = 0;
            }
          }
        }
        if (lossChance >= 10) {
          let warn: string;
          if (toUpgrade instanceof Weapon) {
            if ((toUpgrade).enchantHardened) {
              warn = Messages.get$Object$String$ObjectArr(this, 'harden', [lossChance]);
            } else {
              warn = Messages.get$Object$String$ObjectArr(this, 'enchant', [lossChance]);
            }
          } else {
            if ((toUpgrade).glyphHardened) {
              warn = Messages.get$Object$String$ObjectArr(this, 'harden', [lossChance]);
            } else {
              warn = Messages.get$Object$String$ObjectArr(this, 'glyph', [lossChance]);
            }
          }
          bottom = this.addMessage(warn, CharSprite.WARNING, bottom);
        }
      }
      if ((toUpgrade.cursed || (toUpgrade instanceof Weapon && (toUpgrade).hasCurseEnchant()) || (toUpgrade instanceof Armor && (toUpgrade).hasCurseGlyph())) && toUpgrade.cursedKnown) {
        if (toUpgrade.cursed && (toUpgrade instanceof MeleeWeapon && (toUpgrade).hasCurseEnchant()) || (toUpgrade instanceof Armor && (toUpgrade).hasCurseGlyph())) {
          bottom = this.addMessage(Messages.get$Object$String$ObjectArr(this, 'cursed_weaken', []), CharSprite.POSITIVE, bottom);
        } else {
          bottom = this.addMessage(Messages.get$Object$String$ObjectArr(this, 'cursed', []), CharSprite.POSITIVE, bottom);
        }
        if (curseInfused) {
          bottom = this.addMessage(Messages.get$Object$String$ObjectArr(this, 'curse_infusion', []), CharSprite.WARNING, bottom);
        }
      }
    }
    if (toUpgrade instanceof Wand && (toUpgrade).resinBonus > 0) {
      bottom = this.addMessage(Messages.get$Object$String$ObjectArr(this, 'resin', []), CharSprite.WARNING, bottom);
    }
    if (toUpgrade instanceof MissileWeapon && (toUpgrade).extraThrownLeft) {
      bottom = this.addMessage(Messages.get$Object$String$ObjectArr(this, 'thrown_dust', []), CharSprite.WARNING, bottom);
    }
    this.btnUpgrade = new (WndUpgrade$1())().$o(this).$c(toUpgrade, upgrader, force)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'upgrade', []));
    this.btnUpgrade.setRect(0, Math.fround(bottom + Math.imul(2, WndUpgrade.GAP)), Math.fround(WndUpgrade.WIDTH / 2), 16);
    this.add$Gizmo(this.btnUpgrade);
    this.btnCancel = new (WndUpgrade$2())().$o(this).$c(upgrader, force)._RedButton$String(Messages.get$Object$String$ObjectArr(this, 'back', []));
    this.btnCancel.setRect(Math.fround(this.btnUpgrade.right() + 1), Math.fround(bottom + Math.imul(2, WndUpgrade.GAP)), Math.fround(WndUpgrade.WIDTH / 2), 16);
    this.add$Gizmo(this.btnCancel);
    this.btnUpgrade.enable(Dungeon.hero.ready_);
    this.btnUpgrade.icon$Image(new ItemSprite()._ItemSprite$Item(upgrader));
    this.btnCancel.icon$Image(Icons.EXIT.get());
    bottom = Math.fround($J.d2i(this.btnCancel.bottom()));
    this.resize(WndUpgrade.WIDTH, $J.d2i(bottom));
    return this;
  }
  update(): void {
    super.update();
    if (!this.btnUpgrade.active && Dungeon.hero.ready_) {
      this.btnUpgrade.enable(true);
    }
  }
  onBackPressed(): void {
    super.onBackPressed();
    if (this.upgrader instanceof ScrollOfUpgrade) {
      (this.upgrader).reShowSelector(this.force);
    } else if (this.upgrader instanceof MagicalInfusion) {
      (this.upgrader).reShowSelector();
    }
  }
  getItemSelector(): WndBag$ItemSelector {
    if (this.upgrader instanceof ScrollOfUpgrade) {
      return (this.upgrader).getSelector(this.force);
    } else if (this.upgrader instanceof MagicalInfusion) {
      return (this.upgrader).getSelector();
    }
    return null;
  }
  fillFields(title: string, msg1: string, msg2: string, bottom: number): number {
    if (Messages.lang() === Languages.CHI_SMPL || Messages.lang() === Languages.CHI_TRAD) {
      msg1 = JString.replaceChar(msg1, 45 /* '-' */, 126 /* '~' */);
      msg2 = JString.replaceChar(msg2, 45 /* '-' */, 126 /* '~' */);
    }
    let ttl = PixelScene.renderTextBlock$int(6);
    ttl.align(RenderedTextBlock.CENTER_ALIGN);
    ttl.text$String$int(title, $J.idiv(WndUpgrade.WIDTH, 2));
    ttl.setPos(Math.fround(WndUpgrade.COL_1 - Math.fround(ttl.width() / 2)), Math.fround(bottom + WndUpgrade.GAP));
    PixelScene.align$Component(ttl);
    this.add$Gizmo(ttl);
    let m1 = PixelScene.renderTextBlock$String$int(msg1, 6);
    m1.setPos(Math.fround(WndUpgrade.COL_2 - Math.fround(m1.width() / 2)), ttl.top());
    PixelScene.align$Component(m1);
    this.add$Gizmo(m1);
    let m2 = PixelScene.renderTextBlock$String$int(msg2, 6);
    m2.setPos(Math.fround(WndUpgrade.COL_3 - Math.fround(m2.width() / 2)), ttl.top());
    PixelScene.align$Component(m2);
    this.add$Gizmo(m2);
    return Math.fround(ttl.bottom() + WndUpgrade.GAP);
  }
  addMessage(text: string, color: number, bottom: number): number {
    let message = PixelScene.renderTextBlock$int(6);
    message.text$String$int(text, WndUpgrade.WIDTH);
    message.setPos(0, Math.fround(bottom + WndUpgrade.GAP));
    message.hardlight(color);
    this.add$Gizmo(message);
    return message.bottom();
  }
}

let $WndUpgrade$1: any = null;
/** An anonymous class (WndUpgrade.java:431). */
function WndUpgrade$1(): any {
  return $WndUpgrade$1 ??= $J.local(class extends RedButton {
    onClick(): void {
      super.onClick();
      ScrollOfUpgrade.upgrade(Dungeon.hero);
      let upgraded = this.$cv_toUpgrade;
      if (this.$cv_upgrader instanceof ScrollOfUpgrade) {
        (this.$cv_upgrader).readAnimation();
        upgraded = (this.$cv_upgrader).upgradeItem(this.$cv_toUpgrade);
        Sample.INSTANCE.play$Object(Assets$Sounds.READ);
      } else if (this.$cv_upgrader instanceof MagicalInfusion) {
        (this.$cv_upgrader).useAnimation();
        upgraded = (this.$cv_upgrader).upgradeItem(this.$cv_toUpgrade);
      }
      if (!this.$cv_force) {
        this.$cv_upgrader.detach(Dungeon.hero.belongings.backpack);
      }
      let moreUpgradeItem = Dungeon.hero.belongings.getItem(this.$cv_upgrader.getClass());
      this.$outer.hide();
      if (moreUpgradeItem != null && this.$cv_toUpgrade.isUpgradable()) {
        GameScene.show(new WndUpgrade()._WndUpgrade(moreUpgradeItem, upgraded, false));
      }
    }
    $c($toUpgrade, $upgrader, $force): this {
      this.$cv_toUpgrade = $toUpgrade; this.$cv_upgrader = $upgrader; this.$cv_force = $force;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndUpgrade$1', []);
}

let $WndUpgrade$2: any = null;
/** An anonymous class (WndUpgrade.java:461). */
function WndUpgrade$2(): any {
  return $WndUpgrade$2 ??= $J.local(class extends RedButton {
    onClick(): void {
      super.onClick();
      this.$outer.hide();
      if (this.$cv_upgrader instanceof ScrollOfUpgrade) {
        (this.$cv_upgrader).reShowSelector(this.$cv_force);
      } else if (this.$cv_upgrader instanceof MagicalInfusion) {
        (this.$cv_upgrader).reShowSelector();
      }
    }
    $c($upgrader, $force): this {
      this.$cv_upgrader = $upgrader; this.$cv_force = $force;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndUpgrade$2', []);
}

$J.define(WndUpgrade, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndUpgrade', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.items.Item,com.shatteredpixel.shatteredpixeldungeon.items.Item,boolean': '_WndUpgrade' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  HeroClass = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.HeroClass');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Armor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor');
  Ring = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.rings.Ring');
  ScrollOfUpgrade = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.ScrollOfUpgrade');
  MagicalInfusion = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.spells.MagicalInfusion');
  Wand = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.wands.Wand');
  Weapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon');
  Crossbow = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Crossbow');
  Greatshield = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.Greatshield');
  MagesStaff = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MagesStaff');
  MeleeWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.MeleeWeapon');
  RoundShield = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.melee.RoundShield');
  MissileWeapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.MissileWeapon');
  Tomahawk = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.missiles.Tomahawk');
  Languages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Languages');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  ItemSlot = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ItemSlot');
  RedButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RedButton');
  RenderedTextBlock = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RenderedTextBlock');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
  BitmapText = $J.load('com.watabou.noosa.BitmapText');
  ColorBlock = $J.load('com.watabou.noosa.ColorBlock');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
  Reflection = $J.load('com.watabou.utils.Reflection');
});
