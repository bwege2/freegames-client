// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/items/scrolls/exotic/ScrollOfEnchantment.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../jre/index.ts';
import { ExoticScroll } from './ExoticScroll.ts';
import { WndOptions } from '../../../windows/WndOptions.ts';

let Assets$Sounds, Belongings$Backpack, Enchanting, Item, Armor, Armor$Glyph, InventoryScroll, Scroll, StoneOfEnchantment, SpiritBow, Weapon, Weapon$Enchantment, Messages, GameScene, ItemSprite, ItemSpriteSheet$Icons, Icons, GLog, WndBag$ItemSelector, WndTitledMessage, Sample;

export class ScrollOfEnchantment extends ExoticScroll {
  static identifiedByUse: boolean = false;
  itemSelector: WndBag$ItemSelector = null;
  _ScrollOfEnchantment(): this {
    this._ExoticScroll();
    this.icon_ = ItemSpriteSheet$Icons.SCROLL_ENCHANT;
    this.unique = true;
    this.talentFactor = 2;
    this.itemSelector = new (ScrollOfEnchantment$2())().$o(this)._WndBag$ItemSelector();
    return this;
  }
  doRead(): void {
    if (!this.isKnown()) {
      this.identify$();
      Item.curItem = this.detach(Item.curUser.belongings.backpack);
      ScrollOfEnchantment.identifiedByUse = true;
    } else {
      ScrollOfEnchantment.identifiedByUse = false;
    }
    GameScene.selectItem(this.itemSelector);
  }
  static enchantable(item: Item): boolean {
    return (item instanceof Weapon || item instanceof Armor) && (item.isUpgradable() || item instanceof SpiritBow);
  }
  confirmCancelation(): void {
    GameScene.show(new (ScrollOfEnchantment$1())().$o(this)._WndOptions$Image$String$String$StringArr(new ItemSprite()._ItemSprite$Item(this), Messages.titleCase(this.name()), Messages.get$Class$String$ObjectArr($J.cls(InventoryScroll), 'warning', []), [Messages.get$Class$String$ObjectArr($J.cls(InventoryScroll), 'yes', []), Messages.get$Class$String$ObjectArr($J.cls(InventoryScroll), 'no', [])]));
  }
  static $clinit() {
    ScrollOfEnchantment.identifiedByUse = false;
  }
}

export class ScrollOfEnchantment$WndEnchantSelect extends WndOptions {
  static wep: Weapon = null;
  static enchantments: Weapon$Enchantment[] = null;
  _ScrollOfEnchantment$WndEnchantSelect$(): this {
    this._ScrollOfEnchantment$WndEnchantSelect$Weapon$Enchantment$Enchantment$Enchantment(ScrollOfEnchantment$WndEnchantSelect.wep, ScrollOfEnchantment$WndEnchantSelect.enchantments[0], ScrollOfEnchantment$WndEnchantSelect.enchantments[1], ScrollOfEnchantment$WndEnchantSelect.enchantments[2]);
    return this;
  }
  _ScrollOfEnchantment$WndEnchantSelect$Weapon$Enchantment$Enchantment$Enchantment(wep: Weapon, ench1: Weapon$Enchantment, ench2: Weapon$Enchantment, ench3: Weapon$Enchantment): this {
    this._WndOptions$Image$String$String$StringArr(new ItemSprite()._ItemSprite$Item(new ScrollOfEnchantment()._ScrollOfEnchantment()), Messages.titleCase(new ScrollOfEnchantment()._ScrollOfEnchantment().name()), Messages.get$Class$String$ObjectArr($J.cls(ScrollOfEnchantment), 'weapon', []), [ench1.name$(), ench2.name$(), ench3.name$(), Messages.get$Class$String$ObjectArr($J.cls(ScrollOfEnchantment), 'cancel', [])]);
    ScrollOfEnchantment$WndEnchantSelect.wep = wep;
    ScrollOfEnchantment$WndEnchantSelect.enchantments = $J.newArray(3, null);
    ScrollOfEnchantment$WndEnchantSelect.enchantments[0] = ench1;
    ScrollOfEnchantment$WndEnchantSelect.enchantments[1] = ench2;
    ScrollOfEnchantment$WndEnchantSelect.enchantments[2] = ench3;
    ScrollOfEnchantment$WndGlyphSelect.arm = null;
    return this;
  }
  onSelect(index: number): void {
    if (index < 3) {
      ScrollOfEnchantment$WndEnchantSelect.wep.enchant$Enchantment(ScrollOfEnchantment$WndEnchantSelect.enchantments[index]);
      GLog.p(Messages.get$Class$String$ObjectArr($J.cls(StoneOfEnchantment), 'weapon', []), []);
      (Item.curItem).readAnimation();
      Sample.INSTANCE.play$Object(Assets$Sounds.READ);
      Enchanting.show(Item.curUser, ScrollOfEnchantment$WndEnchantSelect.wep);
    } else {
      GameScene.show(new ScrollOfEnchantment$WndConfirmCancel()._ScrollOfEnchantment$WndConfirmCancel());
    }
  }
  hasInfo(index: number): boolean {
    return index < 3;
  }
  onInfo(index: number): void {
    GameScene.show(new WndTitledMessage()._WndTitledMessage$Image$String$String(Icons.get$Icons(Icons.INFO), Messages.titleCase(ScrollOfEnchantment$WndEnchantSelect.enchantments[index].name$()), ScrollOfEnchantment$WndEnchantSelect.enchantments[index].desc()));
  }
  onBackPressed(): void {
  }
}

export class ScrollOfEnchantment$WndGlyphSelect extends WndOptions {
  static arm: Armor = null;
  static glyphs: Armor$Glyph[] = null;
  _ScrollOfEnchantment$WndGlyphSelect$(): this {
    this._ScrollOfEnchantment$WndGlyphSelect$Armor$Glyph$Glyph$Glyph(ScrollOfEnchantment$WndGlyphSelect.arm, ScrollOfEnchantment$WndGlyphSelect.glyphs[0], ScrollOfEnchantment$WndGlyphSelect.glyphs[1], ScrollOfEnchantment$WndGlyphSelect.glyphs[2]);
    return this;
  }
  _ScrollOfEnchantment$WndGlyphSelect$Armor$Glyph$Glyph$Glyph(arm: Armor, glyph1: Armor$Glyph, glyph2: Armor$Glyph, glyph3: Armor$Glyph): this {
    this._WndOptions$Image$String$String$StringArr(new ItemSprite()._ItemSprite$Item(new ScrollOfEnchantment()._ScrollOfEnchantment()), Messages.titleCase(new ScrollOfEnchantment()._ScrollOfEnchantment().name()), Messages.get$Class$String$ObjectArr($J.cls(ScrollOfEnchantment), 'armor', []), [glyph1.name$(), glyph2.name$(), glyph3.name$(), Messages.get$Class$String$ObjectArr($J.cls(ScrollOfEnchantment), 'cancel', [])]);
    ScrollOfEnchantment$WndGlyphSelect.arm = arm;
    ScrollOfEnchantment$WndGlyphSelect.glyphs = $J.newArray(3, null);
    ScrollOfEnchantment$WndGlyphSelect.glyphs[0] = glyph1;
    ScrollOfEnchantment$WndGlyphSelect.glyphs[1] = glyph2;
    ScrollOfEnchantment$WndGlyphSelect.glyphs[2] = glyph3;
    ScrollOfEnchantment$WndEnchantSelect.wep = null;
    return this;
  }
  onSelect(index: number): void {
    if (index < 3) {
      ScrollOfEnchantment$WndGlyphSelect.arm.inscribe$Glyph(ScrollOfEnchantment$WndGlyphSelect.glyphs[index]);
      GLog.p(Messages.get$Class$String$ObjectArr($J.cls(StoneOfEnchantment), 'armor', []), []);
      (Item.curItem).readAnimation();
      Sample.INSTANCE.play$Object(Assets$Sounds.READ);
      Enchanting.show(Item.curUser, ScrollOfEnchantment$WndGlyphSelect.arm);
    } else {
      GameScene.show(new ScrollOfEnchantment$WndConfirmCancel()._ScrollOfEnchantment$WndConfirmCancel());
    }
  }
  hasInfo(index: number): boolean {
    return index < 3;
  }
  onInfo(index: number): void {
    GameScene.show(new WndTitledMessage()._WndTitledMessage$Image$String$String(Icons.get$Icons(Icons.INFO), Messages.titleCase(ScrollOfEnchantment$WndGlyphSelect.glyphs[index].name$()), ScrollOfEnchantment$WndGlyphSelect.glyphs[index].desc()));
  }
  onBackPressed(): void {
  }
}

export class ScrollOfEnchantment$WndConfirmCancel extends WndOptions {
  _ScrollOfEnchantment$WndConfirmCancel(): this {
    this._WndOptions$Image$String$String$StringArr(new ItemSprite()._ItemSprite$Item(new ScrollOfEnchantment()._ScrollOfEnchantment()), Messages.titleCase(new ScrollOfEnchantment()._ScrollOfEnchantment().name()), Messages.get$Class$String$ObjectArr($J.cls(ScrollOfEnchantment), 'cancel_warn', []), [Messages.get$Class$String$ObjectArr($J.cls(ScrollOfEnchantment), 'cancel_warn_yes', []), Messages.get$Class$String$ObjectArr($J.cls(ScrollOfEnchantment), 'cancel_warn_no', [])]);
    return this;
  }
  onSelect(index: number): void {
    super.onSelect(index);
    if (index === 1) {
      if (ScrollOfEnchantment$WndEnchantSelect.wep != null) {
        GameScene.show(new ScrollOfEnchantment$WndEnchantSelect()._ScrollOfEnchantment$WndEnchantSelect$());
      } else {
        GameScene.show(new ScrollOfEnchantment$WndGlyphSelect()._ScrollOfEnchantment$WndGlyphSelect$());
      }
    } else {
      ScrollOfEnchantment$WndEnchantSelect.wep = null;
      ScrollOfEnchantment$WndEnchantSelect.enchantments = null;
      ScrollOfEnchantment$WndGlyphSelect.arm = null;
      ScrollOfEnchantment$WndGlyphSelect.glyphs = null;
    }
  }
  onBackPressed(): void {
  }
}

let $ScrollOfEnchantment$2: any = null;
/** An anonymous class (ScrollOfEnchantment.java:96). */
function ScrollOfEnchantment$2(): any {
  return $ScrollOfEnchantment$2 ??= $J.local(class extends WndBag$ItemSelector {
    textPrompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(ScrollOfEnchantment), 'inv_title', []);
    }
    preferredBag(): JClass<Bag> {
      return $J.cls(Belongings$Backpack);
    }
    itemSelectable(item: Item): boolean {
      return ScrollOfEnchantment.enchantable(item);
    }
    onSelect(item: Item): void {
      if (item instanceof Weapon) {
        if (!ScrollOfEnchantment.identifiedByUse) {
          Item.curItem.detach(Item.curUser.belongings.backpack);
        }
        ScrollOfEnchantment.identifiedByUse = false;
        let enchants = $J.newArray(3, null);
        let existing = (item).enchantment != null ? (item).enchantment.getClass() : null;
        enchants[0] = Weapon$Enchantment.randomCommon([existing]);
        enchants[1] = Weapon$Enchantment.randomUncommon([existing]);
        enchants[2] = Weapon$Enchantment.random([existing, enchants[0].getClass(), enchants[1].getClass()]);
        GameScene.show(new ScrollOfEnchantment$WndEnchantSelect()._ScrollOfEnchantment$WndEnchantSelect$Weapon$Enchantment$Enchantment$Enchantment(item, enchants[0], enchants[1], enchants[2]));
      } else if (item instanceof Armor) {
        if (!ScrollOfEnchantment.identifiedByUse) {
          Item.curItem.detach(Item.curUser.belongings.backpack);
        }
        ScrollOfEnchantment.identifiedByUse = false;
        let glyphs = $J.newArray(3, null);
        let existing = (item).glyph_ != null ? (item).glyph_.getClass() : null;
        glyphs[0] = Armor$Glyph.randomCommon([existing]);
        glyphs[1] = Armor$Glyph.randomUncommon([existing]);
        glyphs[2] = Armor$Glyph.random([existing, glyphs[0].getClass(), glyphs[1].getClass()]);
        GameScene.show(new ScrollOfEnchantment$WndGlyphSelect()._ScrollOfEnchantment$WndGlyphSelect$Armor$Glyph$Glyph$Glyph(item, glyphs[0], glyphs[1], glyphs[2]));
      } else if (ScrollOfEnchantment.identifiedByUse) {
        (Item.curItem).confirmCancelation();
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfEnchantment$2', []);
}

let $ScrollOfEnchantment$1: any = null;
/** An anonymous class (ScrollOfEnchantment.java:79). */
function ScrollOfEnchantment$1(): any {
  return $ScrollOfEnchantment$1 ??= $J.local(class extends WndOptions {
    onSelect(index: number): void {
      switch (index) {
        case 0:
          Item.curUser.spendAndNext(Scroll.TIME_TO_READ);
          ScrollOfEnchantment.identifiedByUse = false;
          break;
        case 1:
          GameScene.selectItem(this.$outer.itemSelector);
          break;
      }
    }
    onBackPressed(): void {
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfEnchantment$1', []);
}

$J.define(ScrollOfEnchantment, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfEnchantment', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ExoticScroll', ctors: { '': '_ScrollOfEnchantment' }, clinit: true, lazy: ['identifiedByUse'] });
$J.define(ScrollOfEnchantment$WndEnchantSelect, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfEnchantment$WndEnchantSelect', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon,com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment,com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment,com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment': '_ScrollOfEnchantment$WndEnchantSelect$Weapon$Enchantment$Enchantment$Enchantment', '': '_ScrollOfEnchantment$WndEnchantSelect$' } });
$J.define(ScrollOfEnchantment$WndGlyphSelect, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfEnchantment$WndGlyphSelect', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor,com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Glyph,com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Glyph,com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Glyph': '_ScrollOfEnchantment$WndGlyphSelect$Armor$Glyph$Glyph$Glyph', '': '_ScrollOfEnchantment$WndGlyphSelect$' } });
$J.define(ScrollOfEnchantment$WndConfirmCancel, 'com.shatteredpixel.shatteredpixeldungeon.items.scrolls.exotic.ScrollOfEnchantment$WndConfirmCancel', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndOptions', ctors: { '': '_ScrollOfEnchantment$WndConfirmCancel' } });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Belongings$Backpack = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Belongings$Backpack');
  Enchanting = $J.load('com.shatteredpixel.shatteredpixeldungeon.effects.Enchanting');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Armor = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor');
  Armor$Glyph = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.armor.Armor$Glyph');
  InventoryScroll = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.InventoryScroll');
  Scroll = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.scrolls.Scroll');
  StoneOfEnchantment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.stones.StoneOfEnchantment');
  SpiritBow = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.SpiritBow');
  Weapon = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon');
  Weapon$Enchantment = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.weapon.Weapon$Enchantment');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet$Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet$Icons');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  GLog = $J.load('com.shatteredpixel.shatteredpixeldungeon.utils.GLog');
  WndBag$ItemSelector = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$ItemSelector');
  WndTitledMessage = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndTitledMessage');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
