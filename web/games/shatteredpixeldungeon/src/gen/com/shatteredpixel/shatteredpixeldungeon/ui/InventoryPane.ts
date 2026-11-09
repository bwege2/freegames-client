// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/InventoryPane.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, JObject } from '../../../../../jre/index.ts';
import { Component } from '../../../watabou/noosa/ui/Component.ts';
import { InventorySlot } from './InventorySlot.ts';
import { IconButton } from './IconButton.ts';

let Chrome, Chrome$Type, Dungeon, SPDAction, Actor, Char$Alignment, Belongings$Backpack, Bag, MagicalHolster, PotionBandolier, ScrollHolder, VelvetPouch, Messages, GameScene, PixelScene, ItemSpriteSheet, Icons, QuickSlotButton, RightClickMenu, Window, WndBag$Placeholder, WndInfoItem, WndUseItem, TextureCache, KeyBindings, KeyEvent, PointerEvent, BitmapText, ColorBlock, Image, PointerArea, Point;

export class InventoryPane extends Component {
  bg: NinePatch = null;
  blocker: PointerArea = null;
  keyBlocker: Signal$Listener<KeyEvent> = null;
  static instance: InventoryPane = null;
  equipped: ArrayList<InventorySlot> = null;
  bagItems: ArrayList<InventorySlot> = null;
  gold: Image = null;
  goldTxt: BitmapText = null;
  energy: Image = null;
  energyTxt: BitmapText = null;
  promptTxt: RenderedTextBlock = null;
  bags: ArrayList<InventoryPane$BagButton> = null;
  static readonly WIDTH: number = 187;
  static readonly HEIGHT: number = 82;
  static readonly SLOT_WIDTH: number = 17;
  static readonly SLOT_HEIGHT: number = 24;
  selector: WndBag$ItemSelector = null;
  static lastBag: Bag = null;
  lastEnabled: boolean = false;
  static crossB: Image = null;
  static crossM: Image = null;
  static targeting: boolean = false;
  static targetingSlot: InventorySlot = null;
  static lastTarget: Char = null;
  _InventoryPane(): this {
    this._Component();
    this.lastEnabled = true;
    InventoryPane.instance = this;
    return this;
  }
  destroy(): void {
    KeyEvent.removeKeyListener(this.keyBlocker);
    super.destroy();
    if (InventoryPane.instance === this) {
      InventoryPane.instance = null;
    }
  }
  createChildren(): void {
    this.bg = Chrome.get(Chrome$Type.TOAST_TR_HEAVY);
    this.add$Gizmo(this.bg);
    this.blocker = new (InventoryPane$1())().$o(this)._PointerArea$float$float$float$float(0, 0, Math.fround(PixelScene.uiCamera.width_), Math.fround(PixelScene.uiCamera.height_));
    this.blocker.target = this.bg;
    this.add$Gizmo(this.blocker);
    this.keyBlocker = new (InventoryPane$2())().$o(this);
    this.equipped = new ArrayList();
    for (let i = 0; i < 5; i++) {
      let btn = new InventoryPane$InventoryPaneSlot().$o(this)._InventoryPane$InventoryPaneSlot(null);
      this.equipped.add(btn);
      this.add$Gizmo(btn);
    }
    this.gold = Icons.get$Icons(Icons.COIN_SML);
    this.add$Gizmo(this.gold);
    this.goldTxt = new BitmapText()._BitmapText$Font(PixelScene.pixelFont);
    this.goldTxt.hardlight$int(Window.TITLE_COLOR);
    this.add$Gizmo(this.goldTxt);
    this.energy = Icons.get$Icons(Icons.ENERGY_SML);
    this.add$Gizmo(this.energy);
    this.energyTxt = new BitmapText()._BitmapText$Font(PixelScene.pixelFont);
    this.energyTxt.hardlight$int(4508927);
    this.add$Gizmo(this.energyTxt);
    this.promptTxt = PixelScene.renderTextBlock$int(6);
    this.promptTxt.hardlight(Window.TITLE_COLOR);
    this.add$Gizmo(this.promptTxt);
    this.bagItems = new ArrayList();
    for (let i = 0; i < 20; i++) {
      let btn = new InventoryPane$InventoryPaneSlot().$o(this)._InventoryPane$InventoryPaneSlot(null);
      this.bagItems.add(btn);
      this.add$Gizmo(btn);
    }
    this.bags = new ArrayList();
    for (let i = 0; i < 5; i++) {
      let btn = new InventoryPane$BagButton().$o(this)._InventoryPane$BagButton(null, (i + 1) | 0);
      this.bags.add(btn);
      this.add$Gizmo(btn);
    }
    InventoryPane.crossB = Icons.TARGET.get();
    InventoryPane.crossB.visible_ = false;
    this.add$Gizmo(InventoryPane.crossB);
    InventoryPane.crossM = new Image()._Image$();
    InventoryPane.crossM.copy(InventoryPane.crossB);
    this.lastEnabled = true;
    this.updateInventory();
    this.width_ = Math.fround(InventoryPane.WIDTH);
    this.height_ = Math.fround(InventoryPane.HEIGHT);
  }
  layout(): void {
    this.width_ = Math.fround(InventoryPane.WIDTH);
    this.height_ = Math.fround(InventoryPane.HEIGHT);
    this.bg.x = this.x;
    this.bg.y = this.y;
    this.bg.size(this.width_, this.height_);
    let left = Math.fround(this.x + 4);
    for (const $it0 = this.equipped.iterator(); $it0.hasNext(); ) {
      let i = $it0.next();
      i.setRect(left, Math.fround(this.y + 4), Math.fround(InventoryPane.SLOT_WIDTH), Math.fround(InventoryPane.SLOT_HEIGHT));
      left = Math.fround(i.right() + 1);
    }
    this.promptTxt.maxWidth$int($J.d2i((Math.fround(Math.fround(this.width_ - (Math.fround(left - this.x))) - this.bg.marginRight()))));
    if (this.promptTxt.height() > Math.fround(10)) {
      this.promptTxt.setPos(left, Math.fround(Math.fround(this.y + 2) + Math.fround((Math.fround(12 - this.promptTxt.height())) / 2)));
    } else {
      this.promptTxt.setPos(left, Math.fround(Math.fround(this.y + 4) + Math.fround((Math.fround(10 - this.promptTxt.height())) / 2)));
    }
    this.goldTxt.x = left;
    this.goldTxt.y = Math.fround(this.y + 5.5);
    PixelScene.align$Visual(this.goldTxt);
    this.gold.x = Math.fround(Math.fround(this.goldTxt.x + this.goldTxt.width()) + 1);
    this.gold.y = this.goldTxt.y;
    this.energyTxt.x = Math.fround(Math.fround(this.gold.x + this.gold.width()) + 2);
    this.energyTxt.y = Math.fround(this.y + 5.5);
    PixelScene.align$Visual(this.energyTxt);
    this.energy.x = Math.fround(Math.fround(this.energyTxt.x + this.energyTxt.width()) + 1);
    this.energy.y = this.energyTxt.y;
    for (const $it1 = this.bags.iterator(); $it1.hasNext(); ) {
      let b = $it1.next();
      b.setRect(left, Math.fround(this.y + 14), Math.fround(InventoryPane.SLOT_WIDTH), 14);
      left = Math.fround(b.right() + 1);
    }
    left = Math.fround(this.x + 4);
    let top = Math.fround(Math.fround(Math.fround(this.y + 4) + InventoryPane.SLOT_HEIGHT) + 1);
    for (const $it2 = this.bagItems.iterator(); $it2.hasNext(); ) {
      let b = $it2.next();
      b.setRect(left, top, Math.fround(InventoryPane.SLOT_WIDTH), Math.fround(InventoryPane.SLOT_HEIGHT));
      left = Math.fround(b.right() + 1);
      if (Math.fround(left - this.x) > Math.fround(this.width_ - 17)) {
        left = Math.fround(this.x + 4);
        top = Math.fround(top + ((InventoryPane.SLOT_HEIGHT + 1) | 0));
      }
    }
    super.layout();
  }
  alpha(value: number): void {
    this.bg.alpha$float(value);
    for (const $it3 = this.equipped.iterator(); $it3.hasNext(); ) {
      let slot = $it3.next();
      slot.alpha(value);
    }
    for (const $it4 = this.bagItems.iterator(); $it4.hasNext(); ) {
      let slot = $it4.next();
      slot.alpha(value);
    }
    this.gold.alpha$float(value);
    this.goldTxt.alpha$float(value);
    this.energy.alpha$float(value);
    this.energyTxt.alpha$float(value);
    for (const $it5 = this.bags.iterator(); $it5.hasNext(); ) {
      let bag = $it5.next();
      bag.alpha(value);
    }
  }
  static refresh(): void {
    if (InventoryPane.instance != null) {
      InventoryPane.instance.updateInventory();
    }
  }
  updateInventory(): void {
    if (this.selector == null) {
      this.blocker.target = this.bg;
      KeyEvent.removeKeyListener(this.keyBlocker);
    } else {
      this.blocker.target = this.blocker;
      KeyEvent.addKeyListener(this.keyBlocker);
    }
    let stuff = Dungeon.hero.belongings;
    if (InventoryPane.lastBag == null || !stuff.getBags().contains(InventoryPane.lastBag)) {
      InventoryPane.lastBag = stuff.backpack;
    }
    this.equipped.get(0).item$Item(stuff.weapon_ == null ? new WndBag$Placeholder()._WndBag$Placeholder(ItemSpriteSheet.WEAPON_HOLDER) : stuff.weapon_);
    this.equipped.get(1).item$Item(stuff.armor_ == null ? new WndBag$Placeholder()._WndBag$Placeholder(ItemSpriteSheet.ARMOR_HOLDER) : stuff.armor_);
    this.equipped.get(2).item$Item(stuff.artifact_ == null ? new WndBag$Placeholder()._WndBag$Placeholder(ItemSpriteSheet.ARTIFACT_HOLDER) : stuff.artifact_);
    this.equipped.get(3).item$Item(stuff.misc_ == null ? new WndBag$Placeholder()._WndBag$Placeholder(ItemSpriteSheet.SOMETHING) : stuff.misc_);
    this.equipped.get(4).item$Item(stuff.ring_ == null ? new WndBag$Placeholder()._WndBag$Placeholder(ItemSpriteSheet.RING_HOLDER) : stuff.ring_);
    let items = InventoryPane.lastBag.items_.clone();
    if (InventoryPane.lastBag === stuff.backpack && stuff.secondWep_ != null) {
      items.add(0, stuff.secondWep_);
    }
    let j = 0;
    for (let i = 0; i < 20; i++) {
      if (i === 0 && InventoryPane.lastBag !== stuff.backpack) {
        this.bagItems.get(i).item$Item(InventoryPane.lastBag);
        continue;
      }
      if (items.size() > j) {
        if (items.get(j) instanceof Bag) {
          j++;
          i--;
          continue;
        }
        this.bagItems.get(i).item$Item(items.get(j));
        j++;
      } else {
        this.bagItems.get(i).item$Item(null);
      }
    }
    if (this.selector == null) {
      this.promptTxt.visible_ = false;
      this.goldTxt.text$String(String(Dungeon.gold));
      this.goldTxt.measure();
      this.goldTxt.visible_ = this.gold.visible_ = true;
      this.energyTxt.text$String(String(Dungeon.energy));
      this.energyTxt.measure();
      this.energyTxt.visible_ = this.energy.visible_ = Dungeon.energy > 0;
    } else {
      this.promptTxt.text$String(this.selector.textPrompt());
      this.promptTxt.visible_ = true;
      this.goldTxt.visible_ = this.gold.visible_ = false;
      this.energyTxt.visible_ = this.energy.visible_ = false;
    }
    let inventBags = stuff.getBags();
    for (let i = 0; i < this.bags.size(); i++) {
      if (inventBags.size() > i) {
        this.bags.get(i).bag(inventBags.get(i));
      } else {
        this.bags.get(i).bag(null);
      }
    }
    let lostInvent = Dungeon.hero.belongings.lostInventory$();
    for (const $it6 = this.equipped.iterator(); $it6.hasNext(); ) {
      let b = $it6.next();
      b.enable(this.lastEnabled && !(b.item$() instanceof WndBag$Placeholder) && (this.selector == null || this.selector.itemSelectable(b.item$())) && (!lostInvent || b.item$().keptThroughLostInventory()));
    }
    for (const $it7 = this.bagItems.iterator(); $it7.hasNext(); ) {
      let b = $it7.next();
      b.enable(this.lastEnabled && b.item$() != null && (this.selector == null || this.selector.itemSelectable(b.item$())) && (!lostInvent || b.item$().keptThroughLostInventory()));
    }
    for (const $it8 = this.bags.iterator(); $it8.hasNext(); ) {
      let b = $it8.next();
      b.enable(this.lastEnabled);
    }
    this.goldTxt.alpha$float(this.lastEnabled ? 1 : Math.fround(0.3));
    this.gold.alpha$float(this.lastEnabled ? 1 : Math.fround(0.3));
    this.energyTxt.alpha$float(this.lastEnabled ? 1 : Math.fround(0.3));
    this.energy.alpha$float(this.lastEnabled ? 1 : Math.fround(0.3));
    this.layout();
  }
  setSelector(selector: WndBag$ItemSelector): void {
    this.selector = selector;
    if (selector.preferredBag() === $J.cls(Belongings$Backpack)) {
      InventoryPane.lastBag = Dungeon.hero.belongings.backpack;
    } else if (selector.preferredBag() != null) {
      let preferred = Dungeon.hero.belongings.getItem(selector.preferredBag());
      if (preferred != null) {
        InventoryPane.lastBag = preferred;
      } else {
        InventoryPane.lastBag = Dungeon.hero.belongings.backpack;
      }
    }
    this.updateInventory();
  }
  getSelector(): WndBag$ItemSelector {
    return this.selector;
  }
  isSelecting(): boolean {
    return this.selector != null;
  }
  static clearTargetingSlot(): void {
    InventoryPane.targetingSlot = null;
  }
  static useTargeting(): void {
    if (InventoryPane.instance != null && InventoryPane.instance.visible_ && InventoryPane.lastTarget != null && InventoryPane.targetingSlot != null && Actor.chars().contains(InventoryPane.lastTarget) && InventoryPane.lastTarget.isAlive() && InventoryPane.lastTarget.alignment !== Char$Alignment.ALLY && Dungeon.level.heroFOV[InventoryPane.lastTarget.pos]) {
      InventoryPane.targeting = true;
      let sprite = InventoryPane.lastTarget.sprite_;
      if (sprite.parent != null) {
        sprite.parent.addToFront(InventoryPane.crossM);
        InventoryPane.crossM.point$PointF(sprite.center$Visual(InventoryPane.crossM));
      }
      InventoryPane.crossB.point$PointF(InventoryPane.targetingSlot.sprite_.center$Visual(InventoryPane.crossB));
      InventoryPane.crossB.visible_ = true;
    } else {
      InventoryPane.lastTarget = null;
      InventoryPane.targeting = false;
    }
  }
  static cancelTargeting(): void {
    if (InventoryPane.targeting) {
      InventoryPane.crossB.visible_ = false;
      InventoryPane.crossM.remove$();
      InventoryPane.targeting = false;
    }
  }
  update(): void {
    super.update();
    if (this.lastEnabled !== (Dungeon.hero.ready_ || !Dungeon.hero.isAlive())) {
      this.lastEnabled = (Dungeon.hero.ready_ || !Dungeon.hero.isAlive());
      let lostInvent = Dungeon.hero.belongings.lostInventory$();
      for (const $it9 = this.equipped.iterator(); $it9.hasNext(); ) {
        let b = $it9.next();
        b.enable(this.lastEnabled && !(b.item$() instanceof WndBag$Placeholder) && (this.selector == null || this.selector.itemSelectable(b.item$())) && (!lostInvent || b.item$().keptThroughLostInventory()));
      }
      for (const $it10 = this.bagItems.iterator(); $it10.hasNext(); ) {
        let b = $it10.next();
        b.enable(this.lastEnabled && b.item$() != null && (this.selector == null || this.selector.itemSelectable(b.item$())) && (!lostInvent || b.item$().keptThroughLostInventory()));
      }
      for (const $it11 = this.bags.iterator(); $it11.hasNext(); ) {
        let b = $it11.next();
        b.enable(this.lastEnabled);
      }
      this.goldTxt.alpha$float(this.lastEnabled ? 1 : Math.fround(0.3));
      this.gold.alpha$float(this.lastEnabled ? 1 : Math.fround(0.3));
      this.energyTxt.alpha$float(this.lastEnabled ? 1 : Math.fround(0.3));
      this.energy.alpha$float(this.lastEnabled ? 1 : Math.fround(0.3));
    }
  }
  bagIcon(bag: Bag): Image {
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
    InventoryPane.targeting = false;
    InventoryPane.targetingSlot = null;
    InventoryPane.lastTarget = null;
  }
}

export class InventoryPane$InventoryPaneSlot extends InventorySlot {
  _InventoryPane$InventoryPaneSlot(item: Item): this {
    this._InventorySlot(item);
    return this;
  }
  onClick(): void {
    if (InventoryPane.lastBag !== this.item_ && !InventoryPane.lastBag.contains(this.item_) && !this.item_.isEquipped(Dungeon.hero)) {
      this.$outer.updateInventory();
      return;
    }
    if (InventoryPane.targeting) {
      if (InventoryPane.targetingSlot === this) {
        let cell = QuickSlotButton.autoAim$Char$Item(InventoryPane.lastTarget, this.item$());
        if (cell !== -1) {
          GameScene.handleCell(cell);
        } else {
          GameScene.handleCell(InventoryPane.lastTarget.pos);
        }
        return;
      } else {
        InventoryPane.cancelTargeting();
      }
    }
    GameScene.centerNextWndOnInvPane();
    if (this.$outer.selector != null) {
      let activating = this.$outer.selector;
      this.$outer.selector = null;
      activating.onSelect(this.item_);
      this.$outer.updateInventory();
    } else {
      InventoryPane.targetingSlot = this;
      GameScene.show(new WndUseItem()._WndUseItem(null, this.item_));
    }
  }
  onLongClick(): boolean {
    if (this.$outer.selector == null && this.item_.defaultAction() != null) {
      QuickSlotButton.set$Item(this.item_);
      return true;
    } else if (this.$outer.selector != null) {
      GameScene.centerNextWndOnInvPane();
      GameScene.show(new WndInfoItem()._WndInfoItem$Item(this.item_));
      return true;
    } else {
      return false;
    }
  }
  onMiddleClick(): void {
    if (InventoryPane.lastBag !== this.item_ && !InventoryPane.lastBag.contains(this.item_) && !this.item_.isEquipped(Dungeon.hero)) {
      this.$outer.updateInventory();
      return;
    }
    if (!Dungeon.hero.isAlive() || !Dungeon.hero.ready_) {
      return;
    }
    if (InventoryPane.targeting) {
      if (InventoryPane.targetingSlot === this) {
        this.onClick();
      }
      return;
    }
    if (this.$outer.selector == null && this.item_.defaultAction() != null) {
      GameScene.centerNextWndOnInvPane();
      this.item_.execute$Hero(Dungeon.hero);
      if (this.item_ != null && this.item_.usesTargeting_) {
        InventoryPane.targetingSlot = this;
        InventoryPane.useTargeting();
      }
    } else {
      this.onClick();
    }
  }
  onRightClick(): void {
    if (InventoryPane.lastBag !== this.item_ && !InventoryPane.lastBag.contains(this.item_) && !this.item_.isEquipped(Dungeon.hero)) {
      this.$outer.updateInventory();
      return;
    }
    if (!Dungeon.hero.isAlive() || !Dungeon.hero.ready_) {
      return;
    }
    if (InventoryPane.targeting) {
      return;
    }
    if (this.$outer.selector == null) {
      InventoryPane.targetingSlot = this;
      let r = new RightClickMenu()._RightClickMenu$Item(this.item_);
      this.parent.addToFront(r);
      r.camera_ = this.camera();
      let mousePos = PointerEvent.currentHoverPos();
      mousePos = this.camera_.screenToCamera($J.d2i(mousePos.x), $J.d2i(mousePos.y));
      r.setPos(Math.fround(mousePos.x - 3), Math.fround(mousePos.y - 3));
      r.setChildWindowOffset(new Point()._Point$int$int(($J.d2i(this.centerX()) - $J.idiv(this.camera().width_, 2)) | 0, ($J.d2i(this.centerY()) - $J.idiv(this.camera().height_, 2)) | 0));
    } else {
    }
  }
}

export class InventoryPane$BagButton extends IconButton {
  static readonly ACTIVE: number = -1722591667;
  static readonly INACTIVE: number = -1723710403;
  bgTop: ColorBlock = null;
  bgBottom: ColorBlock = null;
  bag_: Bag = null;
  index: number = 0;
  _InventoryPane$BagButton(bag: Bag, index: number): this {
    this._IconButton$Image(this.$outer.bagIcon(bag));
    this.bag_ = bag;
    this.index = index;
    this.visible_ = this.active = bag != null;
    return this;
  }
  bag(bag: Bag): void {
    this.bag_ = bag;
    this.icon$Image(this.$outer.bagIcon(bag));
    this.visible_ = this.active = bag != null;
    if (InventoryPane.lastBag === bag) {
      this.bgTop.texture(TextureCache.createSolid(InventoryPane$BagButton.ACTIVE));
      this.bgBottom.texture(TextureCache.createSolid(InventoryPane$BagButton.ACTIVE));
    } else {
      this.bgTop.texture(TextureCache.createSolid(InventoryPane$BagButton.INACTIVE));
      this.bgBottom.texture(TextureCache.createSolid(InventoryPane$BagButton.INACTIVE));
    }
  }
  createChildren(): void {
    super.createChildren();
    this.bgTop = new ColorBlock()._ColorBlock(1, 1, InventoryPane$BagButton.ACTIVE);
    this.add$Gizmo(this.bgTop);
    this.bgBottom = new ColorBlock()._ColorBlock(1, 1, InventoryPane$BagButton.ACTIVE);
    this.add$Gizmo(this.bgBottom);
  }
  layout(): void {
    super.layout();
    this.bgTop.size(Math.fround(this.width_ - 2), 1);
    this.bgTop.y = this.y;
    this.bgTop.x = Math.fround(this.x + 1);
    this.bgBottom.size(this.width_, Math.fround(this.height_ - 1));
    this.bgBottom.y = Math.fround(this.y + 1);
    this.bgBottom.x = this.x;
  }
  alpha(value: number): void {
    this.bgTop.alpha$float(value);
    this.bgBottom.alpha$float(value);
    this.icon_.alpha$float(value);
  }
  onClick(): void {
    super.onClick();
    GameScene.cancel();
    InventoryPane.lastBag = this.bag_;
    InventoryPane.refresh();
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
  secondaryTooltipAction(): GameAction {
    return SPDAction.INVENTORY_SELECTOR;
  }
  hoverText(): string {
    if (this.bag_ != null) {
      return Messages.titleCase(this.bag_.name());
    } else {
      return null;
    }
  }
}

let $InventoryPane$1: any = null;
/** An anonymous class (InventoryPane.java:120). */
function InventoryPane$1(): any {
  return $InventoryPane$1 ??= $J.local(class extends PointerArea {
    onClick(event: PointerEvent): void {
      if (this.$outer.selector != null && !this.$outer.bg.overlapsScreenPoint($J.d2i(event.current.x), $J.d2i(event.current.y))) {
        GameScene.centerNextWndOnInvPane();
        this.$outer.selector.onSelect(null);
        this.$outer.selector = null;
        this.$outer.updateInventory();
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.InventoryPane$1', []);
}

let $InventoryPane$2: any = null;
/** An anonymous class (InventoryPane.java:135). */
function InventoryPane$2(): any {
  return $InventoryPane$2 ??= $J.local(class extends JObject {
    onSignal(keyEvent: KeyEvent): boolean {
      if (keyEvent.pressed && this.$outer.isSelecting() && this.$outer.visible_ && KeyBindings.getActionForKey(keyEvent) !== SPDAction.BAG_1 && KeyBindings.getActionForKey(keyEvent) !== SPDAction.BAG_2 && KeyBindings.getActionForKey(keyEvent) !== SPDAction.BAG_3 && KeyBindings.getActionForKey(keyEvent) !== SPDAction.BAG_4 && KeyBindings.getActionForKey(keyEvent) !== SPDAction.BAG_5) {
        GameScene.centerNextWndOnInvPane();
        this.$outer.selector.onSelect(null);
        this.$outer.selector = null;
        this.$outer.updateInventory();
        return true;
      }
      return false;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.InventoryPane$2', ['com.watabou.utils.Signal$Listener']);
}

$J.define(InventoryPane, 'com.shatteredpixel.shatteredpixeldungeon.ui.InventoryPane', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { '': '_InventoryPane' }, clinit: true, lazy: ['instance', 'lastBag', 'crossB', 'crossM', 'targeting', 'targetingSlot', 'lastTarget'] });
$J.define(InventoryPane$InventoryPaneSlot, 'com.shatteredpixel.shatteredpixeldungeon.ui.InventoryPane$InventoryPaneSlot', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.InventorySlot', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.items.Item': '_InventoryPane$InventoryPaneSlot' }, inner: true });
$J.define(InventoryPane$BagButton, 'com.shatteredpixel.shatteredpixeldungeon.ui.InventoryPane$BagButton', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.IconButton', ctors: { 'com.shatteredpixel.shatteredpixeldungeon.items.bags.Bag,int': '_InventoryPane$BagButton' }, inner: true });
$J.module(() => {
  Chrome = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome');
  Chrome$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome$Type');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  SPDAction = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDAction');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Belongings$Backpack = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Belongings$Backpack');
  Bag = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.Bag');
  MagicalHolster = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.MagicalHolster');
  PotionBandolier = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.PotionBandolier');
  ScrollHolder = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.ScrollHolder');
  VelvetPouch = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.VelvetPouch');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  QuickSlotButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.QuickSlotButton');
  RightClickMenu = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RightClickMenu');
  Window = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Window');
  WndBag$Placeholder = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$Placeholder');
  WndInfoItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndInfoItem');
  WndUseItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndUseItem');
  TextureCache = $J.load('com.watabou.gltextures.TextureCache');
  KeyBindings = $J.load('com.watabou.input.KeyBindings');
  KeyEvent = $J.load('com.watabou.input.KeyEvent');
  PointerEvent = $J.load('com.watabou.input.PointerEvent');
  BitmapText = $J.load('com.watabou.noosa.BitmapText');
  ColorBlock = $J.load('com.watabou.noosa.ColorBlock');
  Image = $J.load('com.watabou.noosa.Image');
  PointerArea = $J.load('com.watabou.noosa.PointerArea');
  Point = $J.load('com.watabou.utils.Point');
});
