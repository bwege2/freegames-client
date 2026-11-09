// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/Toolbar.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, Exception, JEnum } from '../../../../../jre/index.ts';
import { Component } from '../../../watabou/noosa/ui/Component.ts';
import { Button } from './Button.ts';
import { ItemSprite } from '../sprites/ItemSprite.ts';

let Assets$Interfaces, Dungeon, QuickSlot, SPDAction, SPDSettings, Buff, HoldFast, Talent, Talent$PatientStrikeTracker, Bag, Messages, CellSelector$Listener, GameScene, PixelScene, ItemSpriteSheet, DungeonTilemap, CurrencyIndicator, Icons, InventoryPane, QuickSlotButton, RadialMenu, WndBag, WndBag$ItemSelector, WndKeyBindings, WndMessage, WndQuickBag, WndUseItem, ControllerHandler, GameAction, KeyBindings, Camera, Game, Image, PointerArea;

export class Toolbar extends Component {
  btnWait: Toolbar$Tool = null;
  btnSearch: Toolbar$Tool = null;
  btnInventory: Toolbar$Tool = null;
  btnQuick: Toolbar$QuickslotTool[] = null;
  btnSwap: Toolbar$SlotSwapTool = null;
  pickedUp: Toolbar$PickedUpItem = null;
  lastEnabled: boolean = false;
  examining: boolean = false;
  static instance: Toolbar = null;
  static informer: CellSelector$Listener = null;
  static swappedQuickslots: boolean = false;
  static SWAP_INSTANCE: Toolbar$SlotSwapTool = null;
  _Toolbar(): this {
    this._Component();
    this.lastEnabled = true;
    this.examining = false;
    Toolbar.instance = this;
    this.height_ = this.btnInventory.height();
    return this;
  }
  destroy(): void {
    super.destroy();
    if (Toolbar.instance === this) {
      Toolbar.instance = null;
    }
  }
  createChildren(): void {
    this.add$Gizmo(this.btnSwap = new Toolbar$SlotSwapTool()._Toolbar$SlotSwapTool(128, 0, 21, 23));
    this.btnQuick = $J.newArray(QuickSlot.SIZE, null);
    for (let i = 0; i < this.btnQuick.length; i++) {
      this.add$Gizmo(this.btnQuick[i] = new Toolbar$QuickslotTool()._Toolbar$QuickslotTool(64, 0, 22, 24, i));
    }
    this.add$Gizmo(new (Toolbar$1())().$o(this)._Button());
    this.add$Gizmo(this.btnWait = new (Toolbar$2())().$o(this)._Toolbar$Tool(24, 0, 20, 26));
    this.btnWait.icon(176, 0, 16, 16);
    this.add$Gizmo(new (Toolbar$3())().$o(this)._Button());
    this.add$Gizmo(new (Toolbar$4())().$o(this)._Button());
    this.add$Gizmo(this.btnSearch = new (Toolbar$5())().$o(this)._Toolbar$Tool(44, 0, 20, 26));
    this.btnSearch.icon(192, 0, 16, 16);
    this.add$Gizmo(this.btnInventory = new (Toolbar$6())().$o(this)._Toolbar$Tool(0, 0, 24, 26));
    this.btnInventory.icon(160, 0, 16, 16);
    this.add$Gizmo(new (Toolbar$7())().$o(this)._Button());
    this.add$Gizmo(this.pickedUp = new Toolbar$PickedUpItem()._Toolbar$PickedUpItem());
  }
  layout(): void {
    let right = this.width_;
    let quickslotsToShow = 4;
    if (PixelScene.uiCamera.width_ > 152) {
      quickslotsToShow++;
    }
    if (PixelScene.uiCamera.width_ > 170) {
      quickslotsToShow++;
    }
    let startingSlot: number;
    if (SPDSettings.quickSwapper$() && quickslotsToShow < 6) {
      quickslotsToShow = 3;
      startingSlot = Toolbar.swappedQuickslots ? 3 : 0;
      this.btnSwap.visible_ = true;
      this.btnSwap.active = this.lastEnabled;
      QuickSlotButton.lastVisible = 6;
    } else {
      startingSlot = 0;
      this.btnSwap.visible_ = this.btnSwap.active = false;
      this.btnSwap.setPos(0, Math.fround(PixelScene.uiCamera.height_));
      QuickSlotButton.lastVisible = quickslotsToShow;
    }
    let endingSlot = (startingSlot + quickslotsToShow - 1) | 0;
    for (let i = 0; i < this.btnQuick.length; i++) {
      this.btnQuick[i].visible_ = i >= startingSlot && i <= endingSlot;
      this.btnQuick[i].enable(this.btnQuick[i].visible_ && this.lastEnabled);
      if (i < startingSlot || i > endingSlot) {
        this.btnQuick[i].setPos(this.btnQuick[i].left(), Math.fround(PixelScene.uiCamera.height_));
      }
    }
    if (SPDSettings.interfaceSize$() > 0) {
      this.btnInventory.setPos(Math.fround(right - this.btnInventory.width()), this.y);
      this.btnWait.setPos(Math.fround(this.btnInventory.left() - this.btnWait.width()), this.y);
      this.btnSearch.setPos(Math.fround(this.btnWait.left() - this.btnSearch.width()), this.y);
      right = this.btnSearch.left();
      for (let i = endingSlot; i >= startingSlot; i--) {
        if (i === endingSlot) {
          this.btnQuick[i].border(0, 2);
          this.btnQuick[i].frame(106, 0, 19, 24);
        } else if (i === 0) {
          this.btnQuick[i].border(2, 1);
          this.btnQuick[i].frame(86, 0, 20, 24);
        } else {
          this.btnQuick[i].border(0, 1);
          this.btnQuick[i].frame(88, 0, 18, 24);
        }
        this.btnQuick[i].setPos(Math.fround(right - this.btnQuick[i].width()), Math.fround(this.y + 2));
        right = this.btnQuick[i].left();
      }
      return;
    }
    for (let i = startingSlot; i <= endingSlot; i++) {
      if (i === startingSlot && !SPDSettings.flipToolbar$() || i === endingSlot && SPDSettings.flipToolbar$()) {
        this.btnQuick[i].border(0, 2);
        this.btnQuick[i].frame(106, 0, 19, 24);
      } else if (i === startingSlot && SPDSettings.flipToolbar$() || i === endingSlot && !SPDSettings.flipToolbar$()) {
        this.btnQuick[i].border(2, 1);
        this.btnQuick[i].frame(86, 0, 20, 24);
      } else {
        this.btnQuick[i].border(0, 1);
        this.btnQuick[i].frame(88, 0, 18, 24);
      }
    }
    let shift = 0;
    let mode: Toolbar$Mode;
    try {
      mode = Toolbar$Mode.valueOf(SPDSettings.toolbarMode$());
    } catch ($e1) {
      if ($J.isa($e1, Exception)) {
        let e = $J.exc($e1);
        Game.reportException(e);
        mode = PixelScene.landscape() ? Toolbar$Mode.GROUP : Toolbar$Mode.SPLIT;
      } else {
        throw $e1;
      }
    }
    {
      let left: number, toolbarWidth: number;
      switch (mode) {
        case Toolbar$Mode.SPLIT:
          this.btnWait.setPos(this.x, this.y);
          this.btnSearch.setPos(this.btnWait.right(), this.y);
          this.btnInventory.setPos(Math.fround(right - this.btnInventory.width()), this.y);
          left = 0;
          this.btnQuick[startingSlot].setPos(Math.fround(this.btnInventory.left() - this.btnQuick[startingSlot].width()), Math.fround(this.y + 2));
          for (let i = (startingSlot + 1) | 0; i <= endingSlot; i++) {
            this.btnQuick[i].setPos(Math.fround((this.btnQuick[(i - 1) | 0]).left() - this.btnQuick[i].width()), Math.fround(this.y + 2));
            shift = Math.fround(this.btnSearch.right() - this.btnQuick[i].left());
          }
          if (this.btnSwap.visible_) {
            this.btnSwap.setPos(Math.fround(this.btnQuick[endingSlot].left() - (Math.fround(this.btnSwap.width() - 2))), Math.fround(this.y + 3));
            shift = Math.fround(this.btnSearch.right() - this.btnSwap.left());
          }
          break;
        case Toolbar$Mode.CENTER:
          toolbarWidth = Math.fround(Math.fround(this.btnWait.width() + this.btnSearch.width()) + this.btnInventory.width());
          for (let slot of this.btnQuick) {
            if (slot.visible_) {
              toolbarWidth = Math.fround(toolbarWidth + slot.width());
            }
          }
          if (this.btnSwap.visible_) {
            toolbarWidth = Math.fround(toolbarWidth + Math.fround(this.btnSwap.width() - 2));
          }
          right = Math.fround((Math.fround(this.width_ + toolbarWidth)) / 2);
        case Toolbar$Mode.GROUP:
          this.btnWait.setPos(Math.fround(right - this.btnWait.width()), this.y);
          this.btnSearch.setPos(Math.fround(this.btnWait.left() - this.btnSearch.width()), this.y);
          this.btnInventory.setPos(Math.fround(this.btnSearch.left() - this.btnInventory.width()), this.y);
          this.btnQuick[startingSlot].setPos(Math.fround(this.btnInventory.left() - this.btnQuick[startingSlot].width()), Math.fround(this.y + 2));
          for (let i = (startingSlot + 1) | 0; i <= endingSlot; i++) {
            this.btnQuick[i].setPos(Math.fround((this.btnQuick[(i - 1) | 0]).left() - this.btnQuick[i].width()), Math.fround(this.y + 2));
            shift = Math.fround(-this.btnQuick[i].left());
          }
          if (this.btnSwap.visible_) {
            this.btnSwap.setPos(Math.fround(this.btnQuick[endingSlot].left() - (Math.fround(this.btnSwap.width() - 2))), Math.fround(this.y + 3));
            shift = Math.fround(-this.btnSwap.left());
          }
          break;
      }
    }
    if (shift > Math.fround(0)) {
      shift = Math.fround(shift / 2);
      for (let i = startingSlot; i <= endingSlot; i++) {
        this.btnQuick[i].setPos(Math.fround(this.btnQuick[i].left() + shift), this.btnQuick[i].top());
      }
      if (this.btnSwap.visible_) {
        this.btnSwap.setPos(Math.fround(this.btnSwap.left() + shift), this.btnSwap.top());
      }
    }
    right = this.width_;
    if (SPDSettings.flipToolbar$()) {
      this.btnWait.setPos((Math.fround(right - this.btnWait.right())), this.y);
      this.btnSearch.setPos((Math.fround(right - this.btnSearch.right())), this.y);
      this.btnInventory.setPos((Math.fround(right - this.btnInventory.right())), this.y);
      for (let i = startingSlot; i <= endingSlot; i++) {
        this.btnQuick[i].setPos(Math.fround(right - this.btnQuick[i].right()), Math.fround(this.y + 2));
      }
      if (this.btnSwap.visible_) {
        this.btnSwap.setPos(Math.fround(right - this.btnSwap.right()), Math.fround(this.y + 3));
      }
    }
  }
  static updateLayout(): void {
    if (Toolbar.instance != null) {
      Toolbar.instance.layout();
    }
  }
  update(): void {
    super.update();
    if (this.lastEnabled !== (Dungeon.hero.ready_ && Dungeon.hero.isAlive())) {
      this.lastEnabled = (Dungeon.hero.ready_ && Dungeon.hero.isAlive());
      for (let tool of $J.toArrayInto(this.members.toArray(), $J.newArray(0, null))) {
        if (tool instanceof Toolbar$Tool) {
          (tool).enable(this.lastEnabled);
        }
      }
    }
    if (!Dungeon.hero.isAlive()) {
      this.btnInventory.enable(true);
    }
  }
  alpha(value: number): void {
    this.btnWait.alpha(value);
    this.btnSearch.alpha(value);
    this.btnInventory.alpha(value);
    for (let tool of this.btnQuick) {
      tool.alpha(value);
    }
    this.btnSwap.alpha(value);
  }
  pickup(item: Item, cell: number): void {
    this.pickedUp.reset(item, cell, this.btnInventory.centerX(), this.btnInventory.centerY());
  }
  static $clinit() {
    Toolbar.informer = new (Toolbar$8())()._CellSelector$Listener();
    Toolbar.swappedQuickslots = false;
  }
}

export class Toolbar$Mode extends JEnum {
  static SPLIT: Toolbar$Mode = null;
  static GROUP: Toolbar$Mode = null;
  static CENTER: Toolbar$Mode = null;
  static $VALUES: Toolbar$Mode[] = null;
  _Toolbar$Mode($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Toolbar$Mode[] { return Toolbar$Mode.$VALUES.slice(); }
  static valueOf(name: string): Toolbar$Mode { return $J.enumValueOf(Toolbar$Mode, name); }
  static $clinit() {
    Toolbar$Mode.SPLIT = new Toolbar$Mode()._Toolbar$Mode('SPLIT', 0);
    Toolbar$Mode.GROUP = new Toolbar$Mode()._Toolbar$Mode('GROUP', 1);
    Toolbar$Mode.CENTER = new Toolbar$Mode()._Toolbar$Mode('CENTER', 2);
    Toolbar$Mode.$VALUES = [Toolbar$Mode.SPLIT, Toolbar$Mode.GROUP, Toolbar$Mode.CENTER];
  }
}

export class Toolbar$Tool extends Button {
  static readonly BGCOLOR: number = 8093811;
  base: Image = null;
  icon_: Image = null;
  _Toolbar$Tool(x: number, y: number, width: number, height: number): this {
    this._Button();
    this.hotArea.blockLevel = PointerArea.ALWAYS_BLOCK;
    this.frame(x, y, width, height);
    return this;
  }
  frame(x: number, y: number, width: number, height: number): void {
    this.base.frame$int$int$int$int(x, y, width, height);
    this.width_ = Math.fround(width);
    this.height_ = Math.fround(height);
  }
  icon(x: number, y: number, width: number, height: number): void {
    if (this.icon_ == null) {
      this.icon_ = new Image()._Image$Object(Assets$Interfaces.TOOLBAR);
    }
    this.add$Gizmo(this.icon_);
    this.icon_.frame$int$int$int$int(x, y, width, height);
  }
  createChildren(): void {
    super.createChildren();
    this.base = new Image()._Image$Object(Assets$Interfaces.TOOLBAR);
    this.add$Gizmo(this.base);
  }
  layout(): void {
    super.layout();
    this.base.x = this.x;
    this.base.y = this.y;
    if (this.icon_ != null) {
      this.icon_.x = Math.fround(this.x + Math.fround((Math.fround(this.width() - this.icon_.width())) / 2));
      this.icon_.y = Math.fround(this.y + Math.fround((Math.fround(this.height() - this.icon_.height())) / 2));
    }
  }
  alpha(value: number): void {
    this.base.alpha$float(value);
    if (this.icon_ != null) {
      this.icon_.alpha$float(value);
    }
  }
  onPointerDown(): void {
    this.base.brightness(Math.fround(1.4));
  }
  onPointerUp(): void {
    if (this.active) {
      this.base.resetColor();
    } else {
      this.base.tint$int$float(Toolbar$Tool.BGCOLOR, Math.fround(0.7));
    }
  }
  enable(value: boolean): void {
    if (value !== this.active) {
      if (this.icon_ != null) {
        this.icon_.alpha$float(value ? 1 : Math.fround(0.4));
      }
      this.active = value;
    }
  }
}

export class Toolbar$QuickslotTool extends Toolbar$Tool {
  slot_: QuickSlotButton = null;
  borderLeft: number = 0;
  borderRight: number = 0;
  _Toolbar$QuickslotTool(x: number, y: number, width: number, height: number, slotNum: number): this {
    this._Toolbar$Tool(x, y, width, height);
    this.borderLeft = 2;
    this.borderRight = 2;
    this.slot_ = new QuickSlotButton()._QuickSlotButton(slotNum);
    this.add$Gizmo(this.slot_);
    return this;
  }
  border(left: number, right: number): void {
    this.borderLeft = left;
    this.borderRight = right;
    this.layout();
  }
  layout(): void {
    super.layout();
    this.slot_.setRect(this.x, this.y, this.width_, this.height_);
    this.slot_.slotMargins(this.borderLeft, 2, this.borderRight, 2);
  }
  alpha(value: number): void {
    super.alpha(value);
    this.slot_.alpha(value);
  }
  enable(value: boolean): void {
    super.enable(value && this.visible_);
    this.slot_.enable(value && this.visible_);
  }
}

export class Toolbar$SlotSwapTool extends Toolbar$Tool {
  icons: Image[] = null;
  items_: Item[] = null;
  _Toolbar$SlotSwapTool(x: number, y: number, width: number, height: number): this {
    this._Toolbar$Tool(x, y, width, height);
    this.icons = $J.newArray(4, null);
    this.items_ = $J.newArray(4, null);
    Toolbar.SWAP_INSTANCE = this;
    this.updateVisuals();
    return this;
  }
  destroy(): void {
    super.destroy();
    if (Toolbar.SWAP_INSTANCE === this) {
      Toolbar.SWAP_INSTANCE = null;
    }
  }
  onClick(): void {
    super.onClick();
    Toolbar.swappedQuickslots = !Toolbar.swappedQuickslots;
    Toolbar.updateLayout();
    this.updateVisuals();
  }
  updateVisuals(): void {
    if (this.icons[0] == null) {
      this.icons[0] = Icons.get$Icons(Icons.CHANGES);
      this.icons[0].scale_.set$float(PixelScene.align$float(Math.fround(0.45)));
      this.add$Gizmo(this.icons[0]);
    }
    let slot: number;
    let slotDir: number;
    if (SPDSettings.flipToolbar$()) {
      slot = Toolbar.swappedQuickslots ? 0 : 3;
      slotDir = +1;
    } else {
      slot = Toolbar.swappedQuickslots ? 2 : 5;
      slotDir = -1;
    }
    for (let i = 1; i < 4; i++) {
      if (this.items_[i] === Dungeon.quickslot.getItem(slot)) {
        slot = (slot + slotDir) | 0;
        continue;
      } else {
        this.items_[i] = Dungeon.quickslot.getItem(slot);
      }
      if (this.icons[i] != null) {
        this.icons[i].killAndErase();
        this.icons[i] = null;
      }
      if (this.items_[i] != null) {
        this.icons[i] = new ItemSprite()._ItemSprite$Item(this.items_[i]);
        this.icons[i].scale_.set$float(PixelScene.align$float(Math.fround(0.45)));
        if (Dungeon.quickslot.isPlaceholder(slot)) {
          this.icons[i].alpha$float(Math.fround(0.29));
        }
        this.add$Gizmo(this.icons[i]);
      }
      slot = (slot + slotDir) | 0;
    }
    this.icons[0].x = Math.fround(Math.fround(this.x + 2) + Math.fround((Math.fround(8 - this.icons[0].width())) / 2));
    this.icons[0].y = Math.fround(Math.fround(this.y + 2) + Math.fround((Math.fround(9 - this.icons[0].height())) / 2));
    PixelScene.align$Visual(this.icons[0]);
    if (this.icons[1] != null) {
      this.icons[1].x = Math.fround(Math.fround(this.x + 11) + Math.fround((Math.fround(8 - this.icons[1].width())) / 2));
      this.icons[1].y = Math.fround(Math.fround(this.y + 2) + Math.fround((Math.fround(9 - this.icons[1].height())) / 2));
      PixelScene.align$Visual(this.icons[1]);
    }
    if (this.icons[2] != null) {
      this.icons[2].x = Math.fround(Math.fround(this.x + 2) + Math.fround((Math.fround(8 - this.icons[2].width())) / 2));
      this.icons[2].y = Math.fround(Math.fround(this.y + 12) + Math.fround((Math.fround(9 - this.icons[2].height())) / 2));
      PixelScene.align$Visual(this.icons[2]);
    }
    if (this.icons[3] != null) {
      this.icons[3].x = Math.fround(Math.fround(this.x + 11) + Math.fround((Math.fround(8 - this.icons[3].width())) / 2));
      this.icons[3].y = Math.fround(Math.fround(this.y + 12) + Math.fround((Math.fround(9 - this.icons[3].height())) / 2));
      PixelScene.align$Visual(this.icons[3]);
    }
  }
  layout(): void {
    super.layout();
    this.updateVisuals();
  }
  alpha(value: number): void {
    super.alpha(value);
    for (let im of this.icons) {
      if (im != null) {
        im.alpha$float(value);
      }
    }
  }
  enable(value: boolean): void {
    super.enable(value);
    for (let ic of this.icons) {
      if (ic != null && ic.alpha$() >= Math.fround(0.3)) {
        ic.alpha$float(value ? 1 : Math.fround(0.3));
      }
    }
  }
}

export class Toolbar$PickedUpItem extends ItemSprite {
  static readonly DURATION: number = 0.5;
  startScale: number = 0;
  startX: number = 0;
  startY: number = 0;
  endX: number = 0;
  endY: number = 0;
  left_: number = 0;
  _Toolbar$PickedUpItem(): this {
    this._ItemSprite$();
    this.originToCenter();
    this.active = this.visible_ = false;
    return this;
  }
  reset(item: Item, cell: number, endX: number, endY: number): void {
    this.view$Item(item);
    this.active = this.visible_ = true;
    let tile = DungeonTilemap.raisedTileCenterToWorld(cell);
    let screen = Camera.main.cameraToScreen(tile.x, tile.y);
    let start = this.camera().screenToCamera(screen.x, screen.y);
    this.x = this.startX = Math.fround(start.x - Math.fround(this.width() / 2));
    this.y = this.startY = Math.fround(start.y - Math.fround(this.width() / 2));
    this.endX = Math.fround(endX - Math.fround(this.width() / 2));
    this.endY = Math.fround(endY - Math.fround(this.width() / 2));
    this.left_ = Toolbar$PickedUpItem.DURATION;
    this.scale_.set$float(this.startScale = Math.fround(Camera.main.zoom_ / this.camera().zoom_));
  }
  update(): void {
    super.update();
    if ((this.left_ = Math.fround(this.left_ - Game.elapsed)) <= Math.fround(0)) {
      this.visible_ = this.active = false;
      if (this.emitter_ != null) {
        this.emitter_.on = false;
      }
    } else {
      let p = Math.fround(this.left_ / Toolbar$PickedUpItem.DURATION);
      this.scale_.set$float(Math.fround(this.startScale * Math.fround(Math.sqrt(p))));
      this.x = Math.fround(Math.fround(this.startX * p) + Math.fround(this.endX * (Math.fround(1 - p))));
      this.y = Math.fround(Math.fround(this.startY * p) + Math.fround(this.endY * (Math.fround(1 - p))));
    }
  }
}

let $Toolbar$1$1$1: any = null;
/** An anonymous class (Toolbar.java:160). */
function Toolbar$1$1$1(): any {
  return $Toolbar$1$1$1 ??= $J.local(class extends WndBag$ItemSelector {
    textPrompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(QuickSlotButton), 'select_item', []);
    }
    itemSelectable(item: Item): boolean {
      return item.defaultAction() != null;
    }
    onSelect(item: Item): void {
      if (item != null) {
        QuickSlotButton.set$int$Item(this.$cv_idx, item);
      }
    }
    $c($idx): this {
      this.$cv_idx = $idx;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.Toolbar$1$1$1', []);
}

let $Toolbar$1$1: any = null;
/** An anonymous class (Toolbar.java:150). */
function Toolbar$1$1(): any {
  return $Toolbar$1$1 ??= $J.local(class extends RadialMenu {
    onSelect(idx: number, alt: boolean): void {
      let item = Dungeon.quickslot.getItem(idx);
      if (item == null || Dungeon.quickslot.isPlaceholder(idx) || (Dungeon.hero.belongings.lostInventory$() && !item.keptThroughLostInventory()) || alt) {
        GameScene.selectItem(new (Toolbar$1$1$1())().$o(this).$c(idx)._WndBag$ItemSelector());
      } else {
        item.execute$Hero(Dungeon.hero);
        if (item.usesTargeting_) {
          QuickSlotButton.useTargeting(idx);
        }
      }
      super.onSelect(idx, alt);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.Toolbar$1$1', []);
}

let $Toolbar$1: any = null;
/** An anonymous class (Toolbar.java:107). */
function Toolbar$1(): any {
  return $Toolbar$1 ??= $J.local(class extends Button {
    onClick(): void {
      if (QuickSlotButton.targetingSlot !== -1) {
        let cell = QuickSlotButton.autoAim$Char$Item(QuickSlotButton.lastTarget, Dungeon.quickslot.getItem(QuickSlotButton.targetingSlot));
        if (cell !== -1) {
          GameScene.handleCell(cell);
        } else {
          GameScene.handleCell(QuickSlotButton.lastTarget.pos);
        }
        return;
      }
      if (Dungeon.hero != null && Dungeon.hero.ready_ && !GameScene.cancel()) {
        let slotNames = $J.newArray(6, null);
        let slotIcons = $J.newArray(6, null);
        for (let i = 0; i < 6; i++) {
          let item = Dungeon.quickslot.getItem(i);
          if (item != null && !Dungeon.quickslot.isPlaceholder(i) && (!Dungeon.hero.belongings.lostInventory$() || item.keptThroughLostInventory())) {
            slotNames[i] = Messages.titleCase(item.name());
            slotIcons[i] = new ItemSprite()._ItemSprite$Item(item);
          } else {
            slotNames[i] = Messages.get$Class$String$ObjectArr($J.cls(Toolbar), 'quickslot_assign', []);
            slotIcons[i] = new ItemSprite()._ItemSprite$int(ItemSpriteSheet.SOMETHING);
          }
        }
        let info = '';
        if (ControllerHandler.controllerActive) {
          info += KeyBindings.getKeyName(KeyBindings.getFirstKeyForAction(GameAction.LEFT_CLICK, true)) + ': ' + Messages.get$Class$String$ObjectArr($J.cls(Toolbar), 'quickslot_select', []) + '\n';
          info += KeyBindings.getKeyName(KeyBindings.getFirstKeyForAction(GameAction.RIGHT_CLICK, true)) + ': ' + Messages.get$Class$String$ObjectArr($J.cls(Toolbar), 'quickslot_assign', []) + '\n';
          info += KeyBindings.getKeyName(KeyBindings.getFirstKeyForAction(GameAction.BACK, true)) + ': ' + Messages.get$Class$String$ObjectArr($J.cls(Toolbar), 'quickslot_cancel', []);
        } else {
          info += Messages.get$Class$String$ObjectArr($J.cls(WndKeyBindings), SPDAction.LEFT_CLICK.name(), []) + ': ' + Messages.get$Class$String$ObjectArr($J.cls(Toolbar), 'quickslot_select', []) + '\n';
          info += Messages.get$Class$String$ObjectArr($J.cls(WndKeyBindings), SPDAction.RIGHT_CLICK.name(), []) + ': ' + Messages.get$Class$String$ObjectArr($J.cls(Toolbar), 'quickslot_assign', []) + '\n';
          info += KeyBindings.getKeyName(KeyBindings.getFirstKeyForAction(GameAction.BACK, false)) + ': ' + Messages.get$Class$String$ObjectArr($J.cls(Toolbar), 'quickslot_cancel', []);
        }
        Game.scene().addToFront(new (Toolbar$1$1())().$o(this)._RadialMenu(Messages.get$Class$String$ObjectArr($J.cls(Toolbar), 'quickslot_prompt', []), info, slotNames, slotIcons));
      }
    }
    keyAction(): GameAction {
      if (this.$outer.btnWait.active) {
        return SPDAction.QUICKSLOT_SELECTOR;
      } else {
        return null;
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.Toolbar$1', []);
}

let $Toolbar$2: any = null;
/** An anonymous class (Toolbar.java:198). */
function Toolbar$2(): any {
  return $Toolbar$2 ??= $J.local(class extends Toolbar$Tool {
    onClick(): void {
      if (Dungeon.hero != null && Dungeon.hero.ready_ && !GameScene.cancel()) {
        this.$outer.examining = false;
        Dungeon.hero.rest(false);
      }
    }
    keyAction(): GameAction {
      return SPDAction.WAIT;
    }
    secondaryTooltipAction(): GameAction {
      return SPDAction.WAIT_OR_PICKUP;
    }
    hoverText(): string {
      return Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(WndKeyBindings), 'wait', []));
    }
    onLongClick(): boolean {
      if (Dungeon.hero != null && Dungeon.hero.ready_ && !GameScene.cancel()) {
        this.$outer.examining = false;
        Dungeon.hero.rest(true);
      }
      return true;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.Toolbar$2', []);
}

let $Toolbar$3: any = null;
/** An anonymous class (Toolbar.java:233). */
function Toolbar$3(): any {
  return $Toolbar$3 ??= $J.local(class extends Button {
    onClick(): void {
      if (Dungeon.hero != null && Dungeon.hero.ready_ && !GameScene.cancel()) {
        this.$outer.examining = false;
        Dungeon.hero.rest(true);
      }
    }
    keyAction(): GameAction {
      if (this.$outer.btnWait.active) {
        return SPDAction.REST;
      } else {
        return null;
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.Toolbar$3', []);
}

let $Toolbar$4: any = null;
/** An anonymous class (Toolbar.java:250). */
function Toolbar$4(): any {
  return $Toolbar$4 ??= $J.local(class extends Button {
    onClick(): void {
      if (Dungeon.hero != null && Dungeon.hero.ready_ && !GameScene.cancel()) {
        Dungeon.hero.waitOrPickup = true;
        if ((Dungeon.level.heaps.get(Dungeon.hero.pos) != null || Dungeon.hero.canSelfTrample()) && Dungeon.hero.handle(Dungeon.hero.pos)) {
          if (Dungeon.hero.hasTalent(Talent.HOLD_FAST)) {
            Buff.affect$Char$Class(Dungeon.hero, $J.cls(HoldFast)).pos = Dungeon.hero.pos;
          }
          if (Dungeon.hero.hasTalent(Talent.PATIENT_STRIKE)) {
            Buff.affect$Char$Class(Dungeon.hero, $J.cls(Talent$PatientStrikeTracker)).pos = Dungeon.hero.pos;
          }
          Dungeon.hero.next();
        } else {
          this.$outer.examining = false;
          Dungeon.hero.rest(false);
        }
      }
    }
    onLongClick(): boolean {
      if (Dungeon.hero != null && Dungeon.hero.ready_ && !GameScene.cancel()) {
        this.$outer.examining = false;
        Dungeon.hero.rest(true);
      }
      return true;
    }
    keyAction(): GameAction {
      if (this.$outer.btnWait.active) {
        return SPDAction.WAIT_OR_PICKUP;
      } else {
        return null;
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.Toolbar$4', []);
}

let $Toolbar$5: any = null;
/** An anonymous class (Toolbar.java:287). */
function Toolbar$5(): any {
  return $Toolbar$5 ??= $J.local(class extends Toolbar$Tool {
    onClick(): void {
      if (Dungeon.hero != null && Dungeon.hero.ready_) {
        if (!this.$outer.examining && !GameScene.cancel()) {
          GameScene.selectCell(Toolbar.informer);
          this.$outer.examining = true;
        } else if (this.$outer.examining) {
          Toolbar.informer.onSelect(null);
          Dungeon.hero.search(true);
        }
      }
    }
    keyAction(): GameAction {
      return SPDAction.EXAMINE;
    }
    hoverText(): string {
      return Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(WndKeyBindings), 'examine', []));
    }
    onLongClick(): boolean {
      Dungeon.hero.search(true);
      return true;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.Toolbar$5', []);
}

let $Toolbar$6: any = null;
/** An anonymous class (Toolbar.java:319). */
function Toolbar$6(): any {
  return $Toolbar$6 ??= $J.local(class extends Toolbar$Tool {
    ind: CurrencyIndicator = null;
    arrow: Image = null;
    onClick(): void {
      if (Dungeon.hero != null && (Dungeon.hero.ready_ || !Dungeon.hero.isAlive())) {
        if (SPDSettings.interfaceSize$() === 2) {
          GameScene.toggleInvPane();
        } else {
          if (!GameScene.cancel()) {
            GameScene.show(new WndBag()._WndBag$Bag(Dungeon.hero.belongings.backpack));
          }
        }
      }
    }
    keyAction(): GameAction {
      return SPDAction.INVENTORY;
    }
    secondaryTooltipAction(): GameAction {
      return SPDAction.INVENTORY_SELECTOR;
    }
    hoverText(): string {
      return Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(WndKeyBindings), 'inventory', []));
    }
    onLongClick(): boolean {
      GameScene.show(new WndQuickBag()._WndQuickBag(null));
      return true;
    }
    createChildren(): void {
      super.createChildren();
      this.arrow = Icons.get$Icons(Icons.COMPASS);
      this.arrow.originToCenter();
      this.arrow.visible_ = SPDSettings.interfaceSize$() === 2;
      this.arrow.tint$int$float(4009496, 1);
      this.add$Gizmo(this.arrow);
      this.ind = new CurrencyIndicator()._CurrencyIndicator();
      this.add$Gizmo(this.ind);
    }
    layout(): void {
      super.layout();
      this.ind.fill(this);
      this.bringToFront(this.ind);
      this.arrow.x = Math.fround(this.left() + Math.fround((Math.fround(this.width_ - this.arrow.width())) / 2));
      this.arrow.y = Math.fround(Math.fround(this.bottom() - this.arrow.height_) - 1);
      this.arrow.angle = Math.fround(this.bottom() === Math.fround(this.camera().height_) ? 0 : 180);
      PixelScene.align$Visual(this.arrow);
    }
    enable(value: boolean): void {
      if (value !== this.active) {
        this.arrow.alpha$float(value ? 1 : Math.fround(0.4));
      }
      super.enable(value);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.Toolbar$6', []);
}

let $Toolbar$7$1$1: any = null;
/** An anonymous class (Toolbar.java:459). */
function Toolbar$7$1$1(): any {
  return $Toolbar$7$1$1 ??= $J.local(class extends RadialMenu {
    onSelect(idx: number, alt: boolean): void {
      super.onSelect(idx, alt);
      let item = this.$cv_items.get(idx);
      if (alt && item.defaultAction() != null) {
        item.execute$Hero(Dungeon.hero);
      } else {
        InventoryPane.clearTargetingSlot();
        Game.scene().addToFront(new WndUseItem()._WndUseItem(null, item));
      }
    }
    $c($items): this {
      this.$cv_items = $items;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.Toolbar$7$1$1', []);
}

let $Toolbar$7$1: any = null;
/** An anonymous class (Toolbar.java:414). */
function Toolbar$7$1(): any {
  return $Toolbar$7$1 ??= $J.local(class extends RadialMenu {
    onSelect(idx: number, alt: boolean): void {
      super.onSelect(idx, alt);
      let bag = this.$cv_bags.get(idx);
      let items = bag.items_.clone();
      for (const $it0 = bag.items_.iterator(); $it0.hasNext(); ) {
        let i = $it0.next();
        if (i instanceof Bag) {
          items.remove(i);
        }
        if (Dungeon.hero.belongings.lostInventory$() && !i.keptThroughLostInventory()) {
          items.remove(i);
        }
      }
      if (idx === 0) {
        let b = Dungeon.hero.belongings;
        if (b.ring() != null) {
          items.add(0, b.ring());
        }
        if (b.misc() != null) {
          items.add(0, b.misc());
        }
        if (b.artifact() != null) {
          items.add(0, b.artifact());
        }
        if (b.armor() != null) {
          items.add(0, b.armor());
        }
        if (b.secondWep() != null) {
          items.add(0, b.secondWep());
        }
        if (b.weapon() != null) {
          items.add(0, b.weapon());
        }
      }
      if (items.size() === 0) {
        GameScene.show(new WndMessage()._WndMessage(Messages.get$Class$String$ObjectArr($J.cls(Toolbar), 'container_empty', [])));
        return;
      }
      let itemNames = $J.newArray(items.size(), null);
      let itemIcons = $J.newArray(items.size(), null);
      for (let i = 0; i < items.size(); i++) {
        itemNames[i] = Messages.titleCase(items.get(i).name());
        itemIcons[i] = new ItemSprite()._ItemSprite$Item(items.get(i));
      }
      let info = '';
      if (ControllerHandler.controllerActive) {
        info += KeyBindings.getKeyName(KeyBindings.getFirstKeyForAction(GameAction.LEFT_CLICK, true)) + ': ' + Messages.get$Class$String$ObjectArr($J.cls(Toolbar), 'item_select', []) + '\n';
        info += KeyBindings.getKeyName(KeyBindings.getFirstKeyForAction(GameAction.RIGHT_CLICK, true)) + ': ' + Messages.get$Class$String$ObjectArr($J.cls(Toolbar), 'item_use', []) + '\n';
        info += KeyBindings.getKeyName(KeyBindings.getFirstKeyForAction(GameAction.BACK, true)) + ': ' + Messages.get$Class$String$ObjectArr($J.cls(Toolbar), 'item_cancel', []);
      } else {
        info += Messages.get$Class$String$ObjectArr($J.cls(WndKeyBindings), SPDAction.LEFT_CLICK.name(), []) + ': ' + Messages.get$Class$String$ObjectArr($J.cls(Toolbar), 'item_select', []) + '\n';
        info += Messages.get$Class$String$ObjectArr($J.cls(WndKeyBindings), SPDAction.RIGHT_CLICK.name(), []) + ': ' + Messages.get$Class$String$ObjectArr($J.cls(Toolbar), 'item_use', []) + '\n';
        info += KeyBindings.getKeyName(KeyBindings.getFirstKeyForAction(GameAction.BACK, false)) + ': ' + Messages.get$Class$String$ObjectArr($J.cls(Toolbar), 'item_cancel', []);
      }
      Game.scene().addToFront(new (Toolbar$7$1$1())().$o(this).$c(items)._RadialMenu(Messages.get$Class$String$ObjectArr($J.cls(Toolbar), 'item_prompt', []), info, itemNames, itemIcons));
    }
    $c($bags): this {
      this.$cv_bags = $bags;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.Toolbar$7$1', []);
}

let $Toolbar$7: any = null;
/** An anonymous class (Toolbar.java:394). */
function Toolbar$7(): any {
  return $Toolbar$7 ??= $J.local(class extends Button {
    onClick(): void {
      if (Dungeon.hero != null && Dungeon.hero.ready_ && !GameScene.cancel()) {
        let bags = Dungeon.hero.belongings.getBags();
        let names = $J.newArray(bags.size(), null);
        let images = $J.newArray(bags.size(), null);
        for (let i = 0; i < bags.size(); i++) {
          names[i] = Messages.titleCase(bags.get(i).name());
          images[i] = new ItemSprite()._ItemSprite$Item(bags.get(i));
        }
        let info = '';
        if (ControllerHandler.controllerActive) {
          info += KeyBindings.getKeyName(KeyBindings.getFirstKeyForAction(GameAction.LEFT_CLICK, true)) + ': ' + Messages.get$Class$String$ObjectArr($J.cls(Toolbar), 'container_select', []) + '\n';
          info += KeyBindings.getKeyName(KeyBindings.getFirstKeyForAction(GameAction.BACK, true)) + ': ' + Messages.get$Class$String$ObjectArr($J.cls(Toolbar), 'container_cancel', []);
        } else {
          info += Messages.get$Class$String$ObjectArr($J.cls(WndKeyBindings), SPDAction.LEFT_CLICK.name(), []) + ': ' + Messages.get$Class$String$ObjectArr($J.cls(Toolbar), 'container_select', []) + '\n';
          info += KeyBindings.getKeyName(KeyBindings.getFirstKeyForAction(GameAction.BACK, false)) + ': ' + Messages.get$Class$String$ObjectArr($J.cls(Toolbar), 'container_cancel', []);
        }
        Game.scene().addToFront(new (Toolbar$7$1())().$o(this).$c(bags)._RadialMenu(Messages.get$Class$String$ObjectArr($J.cls(Toolbar), 'container_prompt', []), info, names, images));
      }
    }
    keyAction(): GameAction {
      if (this.$outer.btnWait.active) {
        return SPDAction.INVENTORY_SELECTOR;
      } else {
        return null;
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.Toolbar$7', []);
}

let $Toolbar$8: any = null;
/** An anonymous class (Toolbar.java:688). */
function Toolbar$8(): any {
  return $Toolbar$8 ??= $J.local(class extends CellSelector$Listener {
    onSelect(cell: number): void {
      if (Toolbar.instance != null) {
        Toolbar.instance.examining = false;
        GameScene.examineCell(cell);
      }
    }
    prompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(Toolbar), 'examine_prompt', []);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.Toolbar$8', []);
}

$J.define(Toolbar, 'com.shatteredpixel.shatteredpixeldungeon.ui.Toolbar', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { '': '_Toolbar' }, clinit: true, lazy: ['instance', 'informer', 'swappedQuickslots', 'SWAP_INSTANCE'] });
$J.define(Toolbar$Mode, 'com.shatteredpixel.shatteredpixeldungeon.ui.Toolbar$Mode', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Toolbar$Mode' }, clinit: true, lazy: ['$VALUES', 'SPLIT', 'GROUP', 'CENTER'] });
$J.define(Toolbar$Tool, 'com.shatteredpixel.shatteredpixeldungeon.ui.Toolbar$Tool', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Button', ctors: { 'int,int,int,int': '_Toolbar$Tool' } });
$J.define(Toolbar$QuickslotTool, 'com.shatteredpixel.shatteredpixeldungeon.ui.Toolbar$QuickslotTool', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Toolbar$Tool', ctors: { 'int,int,int,int,int': '_Toolbar$QuickslotTool' } });
$J.define(Toolbar$SlotSwapTool, 'com.shatteredpixel.shatteredpixeldungeon.ui.Toolbar$SlotSwapTool', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Toolbar$Tool', ctors: { 'int,int,int,int': '_Toolbar$SlotSwapTool' } });
$J.define(Toolbar$PickedUpItem, 'com.shatteredpixel.shatteredpixeldungeon.ui.Toolbar$PickedUpItem', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite', ctors: { '': '_Toolbar$PickedUpItem' } });
$J.module(() => {
  Assets$Interfaces = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Interfaces');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  QuickSlot = $J.load('com.shatteredpixel.shatteredpixeldungeon.QuickSlot');
  SPDAction = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDAction');
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  Buff = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.Buff');
  HoldFast = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.buffs.HoldFast');
  Talent = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent');
  Talent$PatientStrikeTracker = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.hero.Talent$PatientStrikeTracker');
  Bag = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.bags.Bag');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  CellSelector$Listener = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.CellSelector$Listener');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  ItemSpriteSheet = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSpriteSheet');
  DungeonTilemap = $J.load('com.shatteredpixel.shatteredpixeldungeon.tiles.DungeonTilemap');
  CurrencyIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.CurrencyIndicator');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  InventoryPane = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.InventoryPane');
  QuickSlotButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.QuickSlotButton');
  RadialMenu = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RadialMenu');
  WndBag = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag');
  WndBag$ItemSelector = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$ItemSelector');
  WndKeyBindings = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndKeyBindings');
  WndMessage = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndMessage');
  WndQuickBag = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndQuickBag');
  WndUseItem = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndUseItem');
  ControllerHandler = $J.load('com.watabou.input.ControllerHandler');
  GameAction = $J.load('com.watabou.input.GameAction');
  KeyBindings = $J.load('com.watabou.input.KeyBindings');
  Camera = $J.load('com.watabou.noosa.Camera');
  Game = $J.load('com.watabou.noosa.Game');
  Image = $J.load('com.watabou.noosa.Image');
  PointerArea = $J.load('com.watabou.noosa.PointerArea');
});
