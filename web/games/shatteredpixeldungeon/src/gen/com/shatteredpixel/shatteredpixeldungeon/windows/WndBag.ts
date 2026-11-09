// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndBag.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../jre/index.ts';
import { WndTabbed } from './WndTabbed.ts';
import { WndTabbed$IconTab } from './WndTabbed.ts';
import { Item } from '../items/Item.ts';

let Dungeon, SPDAction, Belongings$Backpack, Bag, MagicalHolster, PotionBandolier, ScrollHolder, VelvetPouch, Messages, GameScene, PixelScene, ItemSprite, ItemSpriteSheet, Icons, InventorySlot, QuickSlotButton, RightClickMenu, Window, WndInfoItem, WndUseItem, KeyBindings, PointerEvent, BitmapText, Game;

export class WndBag extends WndTabbed {
  static INSTANCE: Window = null;
  static readonly COLS_P: number = 5;
  static readonly COLS_L: number = 5;
  static SLOT_WIDTH_P: number = 0;
  static SLOT_WIDTH_L: number = 0;
  static SLOT_HEIGHT_P: number = 0;
  static SLOT_HEIGHT_L: number = 0;
  static readonly SLOT_MARGIN: number = 1;
  static readonly TITLE_HEIGHT: number = 14;
  selector: WndBag$ItemSelector = null;
  nCols: number = 0;
  nRows: number = 0;
  slotWidth: number = 0;
  slotHeight: number = 0;
  count_: number = 0;
  col: number = 0;
  row: number = 0;
  static lastBag_: Bag = null;
  _WndBag$Bag(bag: Bag): this {
    this._WndBag$Bag$ItemSelector(bag, null);
    return this;
  }
  _WndBag$Bag$ItemSelector(bag: Bag, selector: WndBag$ItemSelector): this {
    this._WndTabbed();
    if (WndBag.INSTANCE != null) {
      WndBag.INSTANCE.hide();
    }
    WndBag.INSTANCE = this;
    this.selector = selector;
    WndBag.lastBag_ = bag;
    this.slotWidth = PixelScene.landscape() ? WndBag.SLOT_WIDTH_L : WndBag.SLOT_WIDTH_P;
    this.slotHeight = PixelScene.landscape() ? WndBag.SLOT_HEIGHT_L : WndBag.SLOT_HEIGHT_P;
    this.nCols = PixelScene.landscape() ? WndBag.COLS_L : WndBag.COLS_P;
    this.nRows = $J.d2i(Math.ceil(Math.fround(25 / Math.fround(this.nCols))));
    let windowWidth = (Math.imul(this.slotWidth, this.nCols) + Math.imul(WndBag.SLOT_MARGIN, ((this.nCols - 1) | 0))) | 0;
    let windowHeight = (WndBag.TITLE_HEIGHT + Math.imul(this.slotHeight, this.nRows) + Math.imul(WndBag.SLOT_MARGIN, ((this.nRows - 1) | 0))) | 0;
    if (PixelScene.landscape()) {
      while (this.slotHeight >= 24 && ((windowHeight + 20 + this.chrome.marginTop()) | 0) > PixelScene.uiCamera.height_) {
        this.slotHeight--;
        windowHeight = (windowHeight - this.nRows) | 0;
      }
    } else {
      while (this.slotWidth >= 26 && ((windowWidth + this.chrome.marginHor()) | 0) > PixelScene.uiCamera.width_) {
        this.slotWidth--;
        windowWidth = (windowWidth - this.nCols) | 0;
      }
    }
    this.placeTitle(bag, windowWidth);
    this.placeItems(bag);
    this.resize(windowWidth, windowHeight);
    let i = 1;
    for (const $it0 = Dungeon.hero.belongings.getBags().iterator(); $it0.hasNext(); ) {
      let b = $it0.next();
      if (b != null) {
        let tab = new WndBag$BagTab().$o(this)._WndBag$BagTab(b, i++);
        this.add$Tab(tab);
        tab.select(b === bag);
        if (b === bag) {
          this.selected = tab;
        }
      }
    }
    this.layoutTabs();
    return this;
  }
  getSelector(): WndBag$ItemSelector {
    return this.selector;
  }
  static lastBag(selector: WndBag$ItemSelector): WndBag {
    if (WndBag.lastBag_ != null && Dungeon.hero.belongings.backpack.contains(WndBag.lastBag_)) {
      return new WndBag()._WndBag$Bag$ItemSelector(WndBag.lastBag_, selector);
    } else {
      return new WndBag()._WndBag$Bag$ItemSelector(Dungeon.hero.belongings.backpack, selector);
    }
  }
  static getBag(selector: WndBag$ItemSelector): WndBag {
    if (selector.preferredBag() === $J.cls(Belongings$Backpack)) {
      return new WndBag()._WndBag$Bag$ItemSelector(Dungeon.hero.belongings.backpack, selector);
    } else if (selector.preferredBag() != null) {
      let bag = Dungeon.hero.belongings.getItem(selector.preferredBag());
      if (bag != null) {
        return new WndBag()._WndBag$Bag$ItemSelector(bag, selector);
      } else {
        return new WndBag()._WndBag$Bag$ItemSelector(Dungeon.hero.belongings.backpack, selector);
      }
    }
    return WndBag.lastBag(selector);
  }
  placeTitle(bag: Bag, width: number): void {
    let titleWidth: number;
    if (Dungeon.energy === 0) {
      let gold = new ItemSprite()._ItemSprite$int$Glowing(ItemSpriteSheet.GOLD, null);
      gold.x = Math.fround(width - gold.width());
      gold.y = Math.fround((Math.fround(WndBag.TITLE_HEIGHT - gold.height())) / 2);
      PixelScene.align$Visual(gold);
      this.add$Gizmo(gold);
      let amt = new BitmapText()._BitmapText$String$Font(String(Dungeon.gold), PixelScene.pixelFont);
      amt.hardlight$int(Window.TITLE_COLOR);
      amt.measure();
      amt.x = Math.fround(Math.fround(Math.fround(width - gold.width()) - amt.width()) - 1);
      amt.y = Math.fround(Math.fround((Math.fround(WndBag.TITLE_HEIGHT - amt.baseLine())) / 2) - 1);
      PixelScene.align$Visual(amt);
      this.add$Gizmo(amt);
      titleWidth = amt.x;
    } else {
      let gold = Icons.get$Icons(Icons.COIN_SML);
      gold.x = Math.fround(Math.fround(width - gold.width()) - 0.5);
      gold.y = 0;
      PixelScene.align$Visual(gold);
      this.add$Gizmo(gold);
      let amt = new BitmapText()._BitmapText$String$Font(String(Dungeon.gold), PixelScene.pixelFont);
      amt.hardlight$int(Window.TITLE_COLOR);
      amt.measure();
      amt.x = Math.fround(Math.fround(Math.fround(width - gold.width()) - amt.width()) - 2);
      amt.y = 0;
      PixelScene.align$Visual(amt);
      this.add$Gizmo(amt);
      titleWidth = amt.x;
      let energy = Icons.get$Icons(Icons.ENERGY_SML);
      energy.x = Math.fround(width - energy.width());
      energy.y = gold.height();
      PixelScene.align$Visual(energy);
      this.add$Gizmo(energy);
      amt = new BitmapText()._BitmapText$String$Font(String(Dungeon.energy), PixelScene.pixelFont);
      amt.hardlight$int(4508927);
      amt.measure();
      amt.x = Math.fround(Math.fround(Math.fround(width - energy.width()) - amt.width()) - 1);
      amt.y = energy.y;
      PixelScene.align$Visual(amt);
      this.add$Gizmo(amt);
      titleWidth = Math.min(titleWidth, amt.x);
    }
    let title = this.selector != null ? this.selector.textPrompt() : null;
    let txtTitle = PixelScene.renderTextBlock$String$int(title != null ? Messages.titleCase(title) : Messages.titleCase(bag.name()), 8);
    txtTitle.hardlight(Window.TITLE_COLOR);
    txtTitle.maxWidth$int(($J.d2i(titleWidth) - 2) | 0);
    txtTitle.setPos(1, Math.fround(Math.fround((Math.fround(WndBag.TITLE_HEIGHT - txtTitle.height())) / 2) - 1));
    PixelScene.align$Component(txtTitle);
    this.add$Gizmo(txtTitle);
  }
  placeItems(container: Bag): void {
    let stuff = Dungeon.hero.belongings;
    this.placeItem(stuff.weapon_ != null ? stuff.weapon_ : new WndBag$Placeholder()._WndBag$Placeholder(ItemSpriteSheet.WEAPON_HOLDER));
    this.placeItem(stuff.armor_ != null ? stuff.armor_ : new WndBag$Placeholder()._WndBag$Placeholder(ItemSpriteSheet.ARMOR_HOLDER));
    this.placeItem(stuff.artifact_ != null ? stuff.artifact_ : new WndBag$Placeholder()._WndBag$Placeholder(ItemSpriteSheet.ARTIFACT_HOLDER));
    this.placeItem(stuff.misc_ != null ? stuff.misc_ : new WndBag$Placeholder()._WndBag$Placeholder(ItemSpriteSheet.SOMETHING));
    this.placeItem(stuff.ring_ != null ? stuff.ring_ : new WndBag$Placeholder()._WndBag$Placeholder(ItemSpriteSheet.RING_HOLDER));
    let equipped = 5;
    if (container !== Dungeon.hero.belongings.backpack) {
      this.placeItem(container);
      this.count_--;
    } else if (stuff.secondWep_ != null) {
      this.placeItem(stuff.secondWep_);
      equipped++;
    }
    for (let item of $J.toArrayInto(container.items_.toArray(), $J.newArray(0, null))) {
      if (!(item instanceof Bag)) {
        this.placeItem(item);
      } else {
        this.count_++;
      }
    }
    while (((this.count_ - equipped) | 0) < container.capacity()) {
      this.placeItem(null);
    }
  }
  placeItem(item: Item): void {
    this.count_++;
    let x = Math.imul(this.col, ((this.slotWidth + WndBag.SLOT_MARGIN) | 0));
    let y = (WndBag.TITLE_HEIGHT + Math.imul(this.row, ((this.slotHeight + WndBag.SLOT_MARGIN) | 0))) | 0;
    let slot = new (WndBag$1())().$o(this)._InventorySlot(item);
    slot.setRect(Math.fround(x), Math.fround(y), Math.fround(this.slotWidth), Math.fround(this.slotHeight));
    this.add$Gizmo(slot);
    if (item == null || (this.selector != null && !this.selector.itemSelectable(item))) {
      slot.enable(false);
    }
    if (++this.col >= this.nCols) {
      this.col = 0;
      this.row++;
    }
  }
  onSignal(event: KeyEvent): boolean {
    if (event.pressed && KeyBindings.getActionForKey(event) === SPDAction.INVENTORY) {
      this.onBackPressed();
      return true;
    } else {
      return super.onSignal(event);
    }
  }
  onBackPressed(): void {
    if (this.selector != null) {
      this.selector.onSelect(null);
    }
    super.onBackPressed();
  }
  onClick(tab: WndTabbed$Tab): void {
    this.hide();
    let w = new WndBag()._WndBag$Bag$ItemSelector((tab).bag_, this.selector);
    if (Game.scene() instanceof GameScene) {
      GameScene.show(w);
    } else {
      Game.scene().addToFront(w);
    }
  }
  hide(): void {
    super.hide();
    if (WndBag.INSTANCE === this) {
      WndBag.INSTANCE = null;
    }
  }
  tabHeight(): number {
    return 20;
  }
  icon(bag: Bag): Image {
    if (bag instanceof VelvetPouch) {
      return Icons.get$Icons(Icons.SEED_POUCH);
    } else if (bag instanceof ScrollHolder) {
      return Icons.get$Icons(Icons.SCROLL_HOLDER);
    } else if (bag instanceof MagicalHolster) {
      return Icons.get$Icons(Icons.WAND_HOLSTER);
    } else if (bag instanceof PotionBandolier) {
      return Icons.get$Icons(Icons.POTION_BANDOLIER);
    } else {
      return Icons.get$Icons(Icons.BACKPACK);
    }
  }
  static $clinit() {
    WndBag.SLOT_WIDTH_P = 28;
    WndBag.SLOT_WIDTH_L = 28;
    WndBag.SLOT_HEIGHT_P = 28;
    WndBag.SLOT_HEIGHT_L = 28;
  }
}

export class WndBag$BagTab extends WndTabbed$IconTab {
  bag_: Bag = null;
  index: number = 0;
  _WndBag$BagTab(bag: Bag, index: number): this {
    this._WndTabbed$IconTab(this.$outer.icon(bag));
    this.bag_ = bag;
    this.index = index;
    return this;
  }
  keyAction(): GameAction {
    switch (this.index) {
      case 1:
      default:
        return SPDAction.BAG_1;
      case 2:
        return SPDAction.BAG_2;
      case 3:
        return SPDAction.BAG_3;
      case 4:
        return SPDAction.BAG_4;
      case 5:
        return SPDAction.BAG_5;
    }
  }
  hoverText(): string {
    return Messages.titleCase(this.bag_.name());
  }
}

export class WndBag$Placeholder extends Item {
  _WndBag$Placeholder(image: number): this {
    this._Item();
    this.image_ = image;
    return this;
  }
  name(): string {
    return null;
  }
  isIdentified(): boolean {
    return true;
  }
  isEquipped(hero: Hero): boolean {
    return true;
  }
}

export class WndBag$ItemSelector extends JObject {
  _WndBag$ItemSelector(): this {
    return this;
  }
  preferredBag(): JClass<Bag> {
    return null;
  }
  hideAfterSelecting(): boolean {
    return true;
  }
}

let $WndBag$1$1: any = null;
/** An anonymous class (WndBag.java:323). */
function WndBag$1$1(): any {
  return $WndBag$1$1 ??= $J.local(class extends RightClickMenu {
    onSelect(index: number): void {
      this.$outer.$outer.hide();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$1$1', []);
}

let $WndBag$1: any = null;
/** An anonymous class (WndBag.java:287). */
function WndBag$1(): any {
  return $WndBag$1 ??= $J.local(class extends InventorySlot {
    onClick(): void {
      if (WndBag.lastBag_ !== this.item_ && !WndBag.lastBag_.contains(this.item_) && !this.item_.isEquipped(Dungeon.hero)) {
        this.$outer.hide();
      } else if (this.$outer.selector != null) {
        if (this.$outer.selector.hideAfterSelecting()) {
          this.$outer.hide();
        }
        this.$outer.selector.onSelect(this.item_);
      } else {
        Game.scene().addToFront(new WndUseItem()._WndUseItem(this.$outer, this.item_));
      }
    }
    onRightClick(): void {
      if (WndBag.lastBag_ !== this.item_ && !WndBag.lastBag_.contains(this.item_) && !this.item_.isEquipped(Dungeon.hero)) {
        this.$outer.hide();
      } else if (this.$outer.selector != null) {
        if (this.$outer.selector.hideAfterSelecting()) {
          this.$outer.hide();
        }
        this.$outer.selector.onSelect(this.item_);
      } else {
        let r = new (WndBag$1$1())().$o(this)._RightClickMenu$Item(this.item_);
        this.parent.addToFront(r);
        r.camera_ = this.camera();
        let mousePos = PointerEvent.currentHoverPos();
        mousePos = this.camera_.screenToCamera($J.d2i(mousePos.x), $J.d2i(mousePos.y));
        r.setPos(Math.fround(mousePos.x - 3), Math.fround(mousePos.y - 3));
      }
    }
    onLongClick(): boolean {
      if (this.$outer.selector == null && this.item_.defaultAction() != null) {
        this.$outer.hide();
        QuickSlotButton.set$Item(this.item_);
        return true;
      } else if (this.$outer.selector != null) {
        Game.scene().addToFront(new WndInfoItem()._WndInfoItem$Item(this.item_));
        return true;
      } else {
        return false;
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$1', []);
}

$J.define(WndBag, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndBag', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTabbed', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.items.bags.Bag,com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$ItemSelector': '_WndBag$Bag$ItemSelector', 'com.shatteredpixel.shatteredpixeldungeon.items.bags.Bag': '_WndBag$Bag' }, clinit: true, lazy: ['INSTANCE', 'SLOT_WIDTH_P', 'SLOT_WIDTH_L', 'SLOT_HEIGHT_P', 'SLOT_HEIGHT_L', 'lastBag_'] });
$J.define(WndBag$BagTab, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$BagTab', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTabbed$IconTab', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.items.bags.Bag,int': '_WndBag$BagTab' }, inner: true });
$J.define(WndBag$Placeholder, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$Placeholder', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.items.Item', ctors: { 'int': '_WndBag$Placeholder' } });
$J.define(WndBag$ItemSelector, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$ItemSelector', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_WndBag$ItemSelector' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  SPDAction = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDAction');
  Belongings$Backpack = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Belongings$Backpack');
  Bag = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.Bag');
  MagicalHolster = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.MagicalHolster');
  PotionBandolier = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.PotionBandolier');
  ScrollHolder = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.ScrollHolder');
  VelvetPouch = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.VelvetPouch');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  InventorySlot = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.InventorySlot');
  QuickSlotButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.QuickSlotButton');
  RightClickMenu = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RightClickMenu');
  Window = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Window');
  WndInfoItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoItem');
  WndUseItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndUseItem');
  KeyBindings = $J.load('com.watabou.input.KeyBindings');
  PointerEvent = $J.load('com.watabou.input.PointerEvent');
  BitmapText = $J.load('com.watabou.noosa.BitmapText');
  Game = $J.load('com.watabou.noosa.Game');
});
