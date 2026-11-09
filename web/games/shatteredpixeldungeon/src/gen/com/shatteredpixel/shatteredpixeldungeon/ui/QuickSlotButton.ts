// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/QuickSlotButton.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../jre/index.ts';
import { Button } from './Button.ts';

let Dungeon, QuickSlot, SPDAction, SPDSettings, Statistics, Actor, Char, Char$Alignment, Char$Property, Item, Waterskin, Messages, GameScene, PixelScene, Icons, InventoryPane, ItemSlot, TargetHealthIndicator, Toolbar, WndBag$ItemSelector, WndKeyBindings, Image, BArray, PathFinder;

export class QuickSlotButton extends Button {
  static instance: QuickSlotButton[] = null;
  slotNum: number = 0;
  slot_: ItemSlot = null;
  crossB: Image = null;
  crossM: Image = null;
  static targetingSlot: number = 0;
  static lastTarget: Char = null;
  itemSelector: WndBag$ItemSelector = null;
  static lastVisible: number = 0;
  _QuickSlotButton(slotNum: number): this {
    this._Button();
    this.itemSelector = new (QuickSlotButton$2())().$o(this)._WndBag$ItemSelector();
    this.slotNum = slotNum;
    this.item(QuickSlotButton.select(slotNum));
    QuickSlotButton.instance[slotNum] = this;
    return this;
  }
  destroy(): void {
    super.destroy();
    QuickSlotButton.reset();
  }
  static reset(): void {
    QuickSlotButton.instance = $J.newArray(QuickSlot.SIZE, null);
    QuickSlotButton.lastTarget = null;
    QuickSlotButton.targetingSlot = -1;
  }
  createChildren(): void {
    super.createChildren();
    this.slot_ = new (QuickSlotButton$1())().$o(this)._ItemSlot$();
    this.slot_.showExtraInfo(false);
    this.add$Gizmo(this.slot_);
    this.crossB = Icons.TARGET.get();
    this.crossB.visible_ = false;
    this.add$Gizmo(this.crossB);
    this.crossM = new Image()._Image$();
    this.crossM.copy(this.crossB);
  }
  layout(): void {
    super.layout();
    this.slot_.fill(this);
    this.crossB.x = Math.fround(this.x + Math.fround((Math.fround(this.width_ - this.crossB.width_)) / 2));
    this.crossB.y = Math.fround(this.y + Math.fround((Math.fround(this.height_ - this.crossB.height_)) / 2));
    PixelScene.align$Visual(this.crossB);
  }
  alpha(value: number): void {
    this.slot_.alpha(value);
  }
  update(): void {
    super.update();
    if (QuickSlotButton.targetingSlot !== -1 && QuickSlotButton.lastTarget != null && QuickSlotButton.lastTarget.sprite_ != null) {
      this.crossM.point$PointF(QuickSlotButton.lastTarget.sprite_.center$Visual(this.crossM));
    }
  }
  keyAction(): GameAction {
    switch (this.slotNum) {
      case 0:
        return SPDAction.QUICKSLOT_1;
      case 1:
        return SPDAction.QUICKSLOT_2;
      case 2:
        return SPDAction.QUICKSLOT_3;
      case 3:
        return SPDAction.QUICKSLOT_4;
      case 4:
        return SPDAction.QUICKSLOT_5;
      case 5:
        return SPDAction.QUICKSLOT_6;
      default:
        return super.keyAction();
    }
  }
  secondaryTooltipAction(): GameAction {
    return SPDAction.QUICKSLOT_SELECTOR;
  }
  hoverText(): string {
    if (this.slot_.item_ == null) {
      return Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(WndKeyBindings), 'quickslot_' + ((this.slotNum + 1) | 0), []));
    } else {
      return super.hoverText();
    }
  }
  onClick(): void {
    if (Dungeon.hero.ready_ && !GameScene.cancel()) {
      GameScene.selectItem(this.itemSelector);
    }
  }
  onRightClick(): void {
    this.onClick();
  }
  onMiddleClick(): void {
    this.onClick();
  }
  onLongClick(): boolean {
    this.onClick();
    return true;
  }
  static set$Item(item: Item): void {
    for (let i = 0; i < QuickSlotButton.lastVisible; i++) {
      if (QuickSlotButton.select(i) == null || QuickSlotButton.select(i) === item) {
        QuickSlotButton.set$int$Item(i, item);
        return;
      }
    }
    QuickSlotButton.set$int$Item(0, item);
  }
  static set$int$Item(slotNum: number, item: Item): void {
    Dungeon.quickslot.setSlot(slotNum, item);
    Item.updateQuickslot();
    if (Math.fround(Statistics.duration + Actor.now()) <= Math.fround(10)) {
      let containsWaterskin = false;
      for (let i = 0; i < QuickSlotButton.instance.length; i++) {
        if (QuickSlotButton.select(i) instanceof Waterskin) {
          containsWaterskin = true;
        }
      }
      if (containsWaterskin) {
        SPDSettings.quickslotWaterskin$boolean(true);
      }
    }
  }
  static select(slotNum: number): Item {
    return Dungeon.quickslot.getItem(slotNum);
  }
  item(item: Item): void {
    this.slot_.item$Item(item);
    this.enableSlot();
  }
  enable(value: boolean): void {
    this.active = value;
    if (value) {
      this.enableSlot();
    } else {
      this.slot_.enable(false);
    }
  }
  enableSlot(): void {
    this.slot_.enable(Dungeon.quickslot.isNonePlaceholder(this.slotNum) && (!Dungeon.hero.belongings.lostInventory$() || Dungeon.quickslot.getItem(this.slotNum).keptThroughLostInventory()));
  }
  slotMargins(left: number, top: number, right: number, bottom: number): void {
    this.slot_.setMargins(left, top, right, bottom);
  }
  static useTargeting(idx: number): void {
    QuickSlotButton.instance[idx].useTargeting();
  }
  useTargeting(): void {
    if (QuickSlotButton.lastTarget != null && Actor.chars().contains(QuickSlotButton.lastTarget) && QuickSlotButton.lastTarget.isAlive() && QuickSlotButton.lastTarget.alignment !== Char$Alignment.ALLY && Dungeon.level.heroFOV[QuickSlotButton.lastTarget.pos]) {
      QuickSlotButton.targetingSlot = this.slotNum;
      let sprite = QuickSlotButton.lastTarget.sprite_;
      if (sprite.parent != null) {
        sprite.parent.addToFront(this.crossM);
        this.crossM.point$PointF(sprite.center$Visual(this.crossM));
      }
      this.crossB.point$PointF(this.slot_.sprite_.center$Visual(this.crossB));
      this.crossB.visible_ = true;
    } else {
      QuickSlotButton.lastTarget = null;
      QuickSlotButton.targetingSlot = -1;
    }
  }
  static autoAim$Char(target: Char): number {
    return QuickSlotButton.autoAim$Char$Item(target, new Item()._Item());
  }
  static autoAim$Char$Item(target: Char, item: Item): number {
    if (Dungeon.hero == null || target == null) {
      return -1;
    }
    if (item.targetingPos(Dungeon.hero, target.pos) === target.pos) {
      return target.pos;
    }
    PathFinder.buildDistanceMap$int$booleanArr$int(target.pos, BArray.not($J.newArray(Dungeon.level.length(), false), null), 2);
    for (let i = 0; i < PathFinder.distance.length; i++) {
      if (PathFinder.distance[i] < 2147483647 && item.targetingPos(Dungeon.hero, i) === target.pos) {
        return i;
      }
    }
    return -1;
  }
  static refresh(): void {
    for (let i = 0; i < QuickSlotButton.instance.length; i++) {
      if (QuickSlotButton.instance[i] != null) {
        QuickSlotButton.instance[i].item(QuickSlotButton.select(i));
        QuickSlotButton.instance[i].enable(QuickSlotButton.instance[i].active);
      }
    }
    if (Toolbar.SWAP_INSTANCE != null) {
      Toolbar.SWAP_INSTANCE.updateVisuals();
    }
    if (Math.fround(Statistics.duration + Actor.now()) <= Math.fround(10)) {
      let containsWaterskin = false;
      for (let i = 0; i < QuickSlotButton.instance.length; i++) {
        if (QuickSlotButton.select(i) instanceof Waterskin) {
          containsWaterskin = true;
        }
      }
      if (!containsWaterskin) {
        SPDSettings.quickslotWaterskin$boolean(false);
      }
    }
  }
  static target(target: Char): void {
    if (target != null && target.alignment !== Char$Alignment.ALLY && !Char.hasProp(target, Char$Property.OBJECT)) {
      QuickSlotButton.lastTarget = target;
      TargetHealthIndicator.instance.target$Char(target);
      InventoryPane.lastTarget = target;
    }
  }
  static cancel(): void {
    if (QuickSlotButton.targetingSlot !== -1) {
      for (let btn of QuickSlotButton.instance) {
        btn.crossB.visible_ = false;
        btn.crossM.remove$();
        QuickSlotButton.targetingSlot = -1;
      }
    }
  }
  static $clinit() {
    QuickSlotButton.instance = $J.newArray(QuickSlot.SIZE, null);
    QuickSlotButton.targetingSlot = -1;
    QuickSlotButton.lastTarget = null;
    QuickSlotButton.lastVisible = QuickSlotButton.instance.length;
  }
}

let $QuickSlotButton$2: any = null;
/** An anonymous class (QuickSlotButton.java:241). */
function QuickSlotButton$2(): any {
  return $QuickSlotButton$2 ??= $J.local(class extends WndBag$ItemSelector {
    textPrompt(): string {
      return Messages.get$Class$String$ObjectArr($J.cls(QuickSlotButton), 'select_item', []);
    }
    itemSelectable(item: Item): boolean {
      return item.defaultAction() != null;
    }
    onSelect(item: Item): void {
      if (item != null) {
        QuickSlotButton.set$int$Item(this.$outer.slotNum, item);
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.QuickSlotButton$2', []);
}

let $QuickSlotButton$1: any = null;
/** An anonymous class (QuickSlotButton.java:83). */
function QuickSlotButton$1(): any {
  return $QuickSlotButton$1 ??= $J.local(class extends ItemSlot {
    onClick(): void {
      if (!Dungeon.hero.isAlive() || !Dungeon.hero.ready_) {
        return;
      }
      if (QuickSlotButton.targetingSlot === this.$outer.slotNum && QuickSlotButton.lastTarget != null) {
        let cell = QuickSlotButton.autoAim$Char$Item(QuickSlotButton.lastTarget, QuickSlotButton.select(this.$outer.slotNum));
        if (cell !== -1) {
          GameScene.handleCell(cell);
        } else {
          GameScene.handleCell(QuickSlotButton.lastTarget.pos);
        }
      } else {
        let item = QuickSlotButton.select(this.$outer.slotNum);
        if (Dungeon.hero.belongings.contains(item) && !GameScene.cancel()) {
          GameScene.centerNextWndOnInvPane();
          item.execute$Hero(Dungeon.hero);
          if (item.usesTargeting_) {
            this.$outer.useTargeting();
          }
        }
      }
    }
    onRightClick(): void {
      this.$outer.onLongClick();
    }
    onMiddleClick(): void {
      this.onClick();
    }
    keyAction(): GameAction {
      return this.$outer.keyAction();
    }
    secondaryTooltipAction(): GameAction {
      return this.$outer.secondaryTooltipAction();
    }
    onLongClick(): boolean {
      return this.$outer.onLongClick();
    }
    onPointerDown(): void {
      this.sprite_.lightness(Math.fround(0.7));
    }
    onPointerUp(): void {
      this.sprite_.resetColor();
    }
    hoverText(): string {
      if (this.item_ == null) {
        return Messages.titleCase(Messages.get$Class$String$ObjectArr($J.cls(WndKeyBindings), 'quickslot_' + ((this.$outer.slotNum + 1) | 0), []));
      } else {
        return super.hoverText();
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.QuickSlotButton$1', []);
}

$J.define(QuickSlotButton, 'com.shatteredpixel.shatteredpixeldungeon.ui.QuickSlotButton', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Button', ctors: { 'int': '_QuickSlotButton' }, meths: { 'autoAim(com.shatteredpixel.shatteredpixeldungeon.actors.Char,com.shatteredpixel.shatteredpixeldungeon.items.Item)': 'autoAim$Char$Item', 'autoAim(com.shatteredpixel.shatteredpixeldungeon.actors.Char)': 'autoAim$Char', 'set(int,com.shatteredpixel.shatteredpixeldungeon.items.Item)': 'set$int$Item', 'set(com.shatteredpixel.shatteredpixeldungeon.items.Item)': 'set$Item' }, clinit: true, lazy: ['instance', 'targetingSlot', 'lastTarget', 'lastVisible'] });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  QuickSlot = $J.load('com.shatteredpixel.shatteredpixeldungeon.QuickSlot');
  SPDAction = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDAction');
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Actor = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Actor');
  Char = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char');
  Char$Alignment = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Alignment');
  Char$Property = $J.load('com.shatteredpixel.shatteredpixeldungeon.actors.Char$Property');
  Item = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Item');
  Waterskin = $J.load('com.shatteredpixel.shatteredpixeldungeon.items.Waterskin');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  InventoryPane = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.InventoryPane');
  ItemSlot = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ItemSlot');
  TargetHealthIndicator = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.TargetHealthIndicator');
  Toolbar = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Toolbar');
  WndBag$ItemSelector = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndBag$ItemSelector');
  WndKeyBindings = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndKeyBindings');
  Image = $J.load('com.watabou.noosa.Image');
  BArray = $J.load('com.watabou.utils.BArray');
  PathFinder = $J.load('com.watabou.utils.PathFinder');
});
