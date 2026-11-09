// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndKeyBindings.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../jre/index.ts';
import { Window } from '../ui/Window.ts';
import { Component } from '../../../watabou/noosa/ui/Component.ts';

let SPDAction, Messages, PixelScene, CharSprite, RedButton, RenderedTextBlock, ScrollPane, WndMessage, ControllerHandler, GameAction, KeyBindings, KeyEvent, PointerEvent, ColorBlock, Game;

export class WndKeyBindings extends Window {
  static readonly WIDTH: number = 135;
  static readonly BTN_HEIGHT: number = 16;
  static readonly COL1_CENTER: number = 27;
  static readonly COL2_CENTER: number = 67;
  static readonly COL3_CENTER: number = 94;
  static readonly COL4_CENTER: number = 121;
  bindingsList: Component = null;
  listItems: ArrayList<WndKeyBindings$BindingItem> = null;
  changedBindings: LinkedHashMap<number, GameAction> = null;
  static controller: boolean = false;
  _WndKeyBindings(controller: boolean): this {
    this._Window$();
    this.listItems = new ArrayList();
    WndKeyBindings.controller = controller;
    this.changedBindings = controller ? KeyBindings.getAllControllerBindings() : KeyBindings.getAllBindings();
    let ttlAction = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'ttl_action', []), 9);
    ttlAction.setPos(Math.fround(WndKeyBindings.COL1_CENTER - Math.fround(ttlAction.width() / 2)), Math.fround((Math.fround(WndKeyBindings.BTN_HEIGHT - ttlAction.height())) / 2));
    this.add$Gizmo(ttlAction);
    let ttlSep1 = new ColorBlock()._ColorBlock(1, Math.fround(WndKeyBindings.BTN_HEIGHT), -14540254);
    ttlSep1.x = Math.fround(Math.fround(Math.fround(0.4) * WndKeyBindings.WIDTH) - 1);
    this.add$Gizmo(ttlSep1);
    let ttlKey1 = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'ttl_key1', []), 6);
    ttlKey1.maxWidth$int($J.idiv(WndKeyBindings.WIDTH, 5));
    ttlKey1.align(RenderedTextBlock.CENTER_ALIGN);
    ttlKey1.setPos(Math.fround(WndKeyBindings.COL2_CENTER - Math.fround(ttlKey1.width() / 2)), Math.fround((Math.fround(WndKeyBindings.BTN_HEIGHT - ttlKey1.height())) / 2));
    this.add$Gizmo(ttlKey1);
    let ttlSep2 = new ColorBlock()._ColorBlock(1, Math.fround(WndKeyBindings.BTN_HEIGHT), -14540254);
    ttlSep2.x = Math.fround(Math.fround(Math.fround(0.6) * WndKeyBindings.WIDTH) - 1);
    this.add$Gizmo(ttlSep2);
    let ttlKey2 = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'ttl_key2', []), 6);
    ttlKey2.maxWidth$int($J.idiv(WndKeyBindings.WIDTH, 5));
    ttlKey2.align(RenderedTextBlock.CENTER_ALIGN);
    ttlKey2.setPos(Math.fround(WndKeyBindings.COL3_CENTER - Math.fround(ttlKey2.width() / 2)), Math.fround((Math.fround(WndKeyBindings.BTN_HEIGHT - ttlKey2.height())) / 2));
    this.add$Gizmo(ttlKey2);
    let ttlSep3 = new ColorBlock()._ColorBlock(1, Math.fround(WndKeyBindings.BTN_HEIGHT), -14540254);
    ttlSep3.x = Math.fround(Math.fround(Math.fround(0.8) * WndKeyBindings.WIDTH) - 1);
    this.add$Gizmo(ttlSep3);
    let ttlKey3 = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'ttl_key3', []), 6);
    ttlKey3.maxWidth$int($J.idiv(WndKeyBindings.WIDTH, 5));
    ttlKey3.align(RenderedTextBlock.CENTER_ALIGN);
    ttlKey3.setPos(Math.fround(WndKeyBindings.COL4_CENTER - Math.fround(ttlKey2.width() / 2)), Math.fround((Math.fround(WndKeyBindings.BTN_HEIGHT - ttlKey2.height())) / 2));
    this.add$Gizmo(ttlKey3);
    let ttlSep4 = new ColorBlock()._ColorBlock(Math.fround(WndKeyBindings.WIDTH), 1, -14540254);
    ttlSep4.y = Math.fround(WndKeyBindings.BTN_HEIGHT);
    this.add$Gizmo(ttlSep4);
    this.bindingsList = new Component()._Component();
    let scrollingList = new (WndKeyBindings$1())().$o(this)._ScrollPane(this.bindingsList);
    this.add$Gizmo(scrollingList);
    let y = 0;
    if (controller) {
      let controllerInfo = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'controller_info', []), 6);
      controllerInfo.maxWidth$int(WndKeyBindings.WIDTH);
      controllerInfo.setPos(0, 2);
      controllerInfo.hardlight(Window.TITLE_COLOR);
      this.bindingsList.add$Gizmo(controllerInfo);
      y = ($J.d2i(controllerInfo.bottom()) + 3) | 0;
      let sep = new ColorBlock()._ColorBlock(Math.fround(WndKeyBindings.WIDTH), 1, -14540254);
      sep.y = Math.fround(y);
      this.bindingsList.add$Gizmo(sep);
    }
    let defaults = controller ? SPDAction.getControllerDefaults() : SPDAction.getDefaults();
    let actionList = GameAction.allActions();
    for (let action of $J.toArrayInto(actionList.toArray(), $J.newArray(0, null))) {
      if (action.code() < 1) {
        actionList.remove(action);
      } else if ((action === GameAction.LEFT_CLICK || action === GameAction.RIGHT_CLICK || action === GameAction.MIDDLE_CLICK) && !controller) {
        actionList.remove(action);
      } else if (!defaults.containsValue(action)) {
        actionList.remove(action);
        actionList.add(action);
      }
    }
    for (const $it1 = actionList.iterator(); $it1.hasNext(); ) {
      let action = $it1.next();
      let item = new WndKeyBindings$BindingItem().$o(this)._WndKeyBindings$BindingItem(action);
      item.setRect(0, Math.fround(y), Math.fround(WndKeyBindings.WIDTH), Math.fround(WndKeyBindings$BindingItem.HEIGHT));
      this.bindingsList.addToBack(item);
      this.listItems.add(item);
      y = $J.d2i(Math.fround(y + item.height()));
    }
    this.bindingsList.setSize(Math.fround(WndKeyBindings.WIDTH), Math.fround((y + 1) | 0));
    this.resize(WndKeyBindings.WIDTH, Math.min((Math.imul(WndKeyBindings.BTN_HEIGHT, 3) + 3 + Math.imul(WndKeyBindings$BindingItem.HEIGHT, this.listItems.size())) | 0, (PixelScene.uiCamera.height_ - 20) | 0));
    let btnDefaults = new (WndKeyBindings$2())().$o(this).$c(controller)._RedButton$String$int(Messages.get$Object$String$ObjectArr(this, 'default', []), 9);
    btnDefaults.setRect(0, Math.fround((this.height_ - Math.imul(WndKeyBindings.BTN_HEIGHT, 2) - 1) | 0), Math.fround(WndKeyBindings.WIDTH), Math.fround(WndKeyBindings.BTN_HEIGHT));
    this.add$Gizmo(btnDefaults);
    let btnConfirm = new (WndKeyBindings$3())().$o(this).$c(controller)._RedButton$String$int(Messages.get$Object$String$ObjectArr(this, 'confirm', []), 9);
    btnConfirm.setRect(0, Math.fround((this.height_ - WndKeyBindings.BTN_HEIGHT) | 0), Math.fround($J.idiv(WndKeyBindings.WIDTH, 2)), Math.fround(WndKeyBindings.BTN_HEIGHT));
    this.add$Gizmo(btnConfirm);
    let btnCancel = new (WndKeyBindings$4())().$o(this)._RedButton$String$int(Messages.get$Object$String$ObjectArr(this, 'cancel', []), 9);
    btnCancel.setRect(Math.fround(($J.idiv(WndKeyBindings.WIDTH, 2) + 1) | 0), Math.fround((this.height_ - WndKeyBindings.BTN_HEIGHT) | 0), Math.fround(($J.idiv(WndKeyBindings.WIDTH, 2) - 1) | 0), Math.fround(WndKeyBindings.BTN_HEIGHT));
    this.add$Gizmo(btnCancel);
    scrollingList.setRect(0, Math.fround((WndKeyBindings.BTN_HEIGHT + 1) | 0), Math.fround(WndKeyBindings.WIDTH), Math.fround(Math.fround(btnDefaults.top() - WndKeyBindings.BTN_HEIGHT) - 1));
    return this;
  }
  offset$int$int(xOffset: number, yOffset: number): void {
    super.offset$int$int(xOffset, yOffset);
    this.bindingsList.setPos(this.bindingsList.left(), this.bindingsList.top());
  }
  onBackPressed(): void {
  }
  static $clinit() {
    WndKeyBindings.controller = false;
  }
}

export class WndKeyBindings$BindingItem extends Component {
  static readonly HEIGHT: number = 13;
  static readonly CHANGED: number = 16777028;
  static readonly DEFAULT: number = 16777215;
  static readonly UNBOUND: number = 8947848;
  static readonly UNBOUND_CHANGED: number = 8947746;
  gameAction: GameAction = null;
  key1: number = 0;
  key2: number = 0;
  key3: number = 0;
  origKey1: number = 0;
  origKey2: number = 0;
  origKey3: number = 0;
  actionName_: RenderedTextBlock = null;
  key1Name: RenderedTextBlock = null;
  key2Name: RenderedTextBlock = null;
  key3Name: RenderedTextBlock = null;
  sep1: ColorBlock = null;
  sep2: ColorBlock = null;
  sep3: ColorBlock = null;
  sep4: ColorBlock = null;
  _WndKeyBindings$BindingItem(action: GameAction): this {
    this._Component();
    this.gameAction = action;
    this.actionName_ = PixelScene.renderTextBlock$String$int(Messages.get$Class$String$ObjectArr($J.cls(WndKeyBindings), action.name(), []), 6);
    this.actionName_.setHightlighting$boolean(false);
    this.add$Gizmo(this.actionName_);
    let keys: ArrayList<number>;
    if (WndKeyBindings.controller) {
      keys = KeyBindings.getControllerKeysForAction(action);
    } else {
      keys = KeyBindings.getKeyboardKeysForAction(action);
    }
    this.origKey1 = this.key1 = keys.isEmpty() ? 0 : keys.removeAt(0);
    this.origKey2 = this.key2 = keys.isEmpty() ? 0 : keys.removeAt(0);
    this.origKey3 = this.key3 = keys.isEmpty() ? 0 : keys.removeAt(0);
    this.key1Name = PixelScene.renderTextBlock$String$int(KeyBindings.getKeyName(this.key1), 6);
    if (this.key1 === 0) {
      this.key1Name.hardlight(WndKeyBindings$BindingItem.UNBOUND);
    }
    this.add$Gizmo(this.key1Name);
    this.key2Name = PixelScene.renderTextBlock$String$int(KeyBindings.getKeyName(this.key2), 6);
    if (this.key2 === 0) {
      this.key2Name.hardlight(WndKeyBindings$BindingItem.UNBOUND);
    }
    this.add$Gizmo(this.key2Name);
    this.key3Name = PixelScene.renderTextBlock$String$int(KeyBindings.getKeyName(this.key3), 6);
    if (this.key3 === 0) {
      this.key3Name.hardlight(WndKeyBindings$BindingItem.UNBOUND);
    }
    this.add$Gizmo(this.key3Name);
    this.sep1 = new ColorBlock()._ColorBlock(1, 1, -14540254);
    this.add$Gizmo(this.sep1);
    this.sep2 = new ColorBlock()._ColorBlock(1, 1, -14540254);
    this.add$Gizmo(this.sep2);
    this.sep3 = new ColorBlock()._ColorBlock(1, 1, -14540254);
    this.add$Gizmo(this.sep3);
    this.sep4 = new ColorBlock()._ColorBlock(1, 1, -14540254);
    this.add$Gizmo(this.sep4);
    return this;
  }
  updateBindings(first: number, second: number, third: number): void {
    if (second === 0 && third !== 0) {
      second = third;
      third = 0;
    }
    if (first === 0 && second !== 0) {
      first = second;
      second = 0;
    }
    this.key1 = first;
    this.key2 = second;
    this.key3 = third;
    this.key1Name.text$String(KeyBindings.getKeyName(this.key1));
    if (this.key1 !== this.origKey1) {
      this.key1Name.hardlight(this.key1 === 0 ? WndKeyBindings$BindingItem.UNBOUND_CHANGED : WndKeyBindings$BindingItem.CHANGED);
    } else {
      this.key1Name.hardlight(this.key1 === 0 ? WndKeyBindings$BindingItem.UNBOUND : WndKeyBindings$BindingItem.DEFAULT);
    }
    this.key2Name.text$String(KeyBindings.getKeyName(this.key2));
    if (this.key2 !== this.origKey2) {
      this.key2Name.hardlight(this.key2 === 0 ? WndKeyBindings$BindingItem.UNBOUND_CHANGED : WndKeyBindings$BindingItem.CHANGED);
    } else {
      this.key2Name.hardlight(this.key2 === 0 ? WndKeyBindings$BindingItem.UNBOUND : WndKeyBindings$BindingItem.DEFAULT);
    }
    this.key3Name.text$String(KeyBindings.getKeyName(this.key3));
    if (this.key3 !== this.origKey3) {
      this.key3Name.hardlight(this.key3 === 0 ? WndKeyBindings$BindingItem.UNBOUND_CHANGED : WndKeyBindings$BindingItem.CHANGED);
    } else {
      this.key3Name.hardlight(this.key3 === 0 ? WndKeyBindings$BindingItem.UNBOUND : WndKeyBindings$BindingItem.DEFAULT);
    }
    this.layout();
  }
  layout(): void {
    super.layout();
    this.actionName_.maxWidth$int($J.d2i((Math.fround(Math.fround(2 * this.width_) / 5))));
    this.key1Name.maxWidth$int(($J.d2i((Math.fround(this.width_ / 5))) - 2) | 0);
    this.key2Name.maxWidth$int(($J.d2i((Math.fround(this.width_ / 5))) - 2) | 0);
    this.key3Name.maxWidth$int(($J.d2i((Math.fround(this.width_ / 5))) - 2) | 0);
    this.actionName_.setPos(this.x, Math.fround(this.y + Math.fround((Math.fround(this.height() - this.actionName_.height())) / 2)));
    this.key1Name.setPos(Math.fround(Math.fround(this.x + Math.fround(Math.fround(2 * this.width()) / 5)) + 1), Math.fround(Math.fround(this.y + 0.5) + Math.fround((Math.fround(this.height() - this.key1Name.height())) / 2)));
    this.key2Name.setPos(Math.fround(Math.fround(this.x + Math.fround(Math.fround(3 * this.width()) / 5)) + 1), Math.fround(Math.fround(this.y + 0.5) + Math.fround((Math.fround(this.height() - this.key2Name.height())) / 2)));
    this.key3Name.setPos(Math.fround(Math.fround(this.x + Math.fround(Math.fround(4 * this.width()) / 5)) + 1), Math.fround(Math.fround(this.y + 0.5) + Math.fround((Math.fround(this.height() - this.key3Name.height())) / 2)));
    this.sep1.size(this.width_, 1);
    this.sep1.x = this.x;
    this.sep1.y = this.bottom();
    this.sep2.size(1, this.height_);
    this.sep2.x = Math.fround(this.key1Name.left() - 2);
    this.sep2.y = this.y;
    this.sep3.size(1, this.height_);
    this.sep3.x = Math.fround(this.key2Name.left() - 2);
    this.sep3.y = this.y;
    this.sep4.size(1, this.height_);
    this.sep4.x = Math.fround(this.key3Name.left() - 2);
    this.sep4.y = this.y;
  }
  onClick(x: number, y: number): boolean {
    if (this.inside(x, y)) {
      if (x >= Math.fround(Math.fround(this.x + Math.fround(Math.fround(4 * this.width()) / 5)) - 1) && this.key2 !== 0) {
        Game.scene().addToFront(new WndKeyBindings$WndChangeBinding().$o(this.$outer)._WndKeyBindings$WndChangeBinding(this.gameAction, this, 3, this.key3, this.key1, this.key2));
      } else if (x >= Math.fround(Math.fround(this.x + Math.fround(Math.fround(3 * this.width()) / 5)) - 1) && this.key1 !== 0) {
        Game.scene().addToFront(new WndKeyBindings$WndChangeBinding().$o(this.$outer)._WndKeyBindings$WndChangeBinding(this.gameAction, this, 2, this.key2, this.key1, this.key3));
      } else if (x >= Math.fround(this.x + Math.fround(Math.fround(2 * this.width()) / 5))) {
        Game.scene().addToFront(new WndKeyBindings$WndChangeBinding().$o(this.$outer)._WndKeyBindings$WndChangeBinding(this.gameAction, this, 1, this.key1, this.key2, this.key3));
      }
      return true;
    } else {
      return false;
    }
  }
}

export class WndKeyBindings$WndChangeBinding extends Window {
  curKeyCode: number = 0;
  otherBoundKey1: number = 0;
  otherBoundKey2: number = 0;
  changedKeyCode: number = 0;
  changedAction: WndKeyBindings$BindingItem = null;
  changedKey: RenderedTextBlock = null;
  warnErr: RenderedTextBlock = null;
  btnUnbind: RedButton = null;
  btnConfirm: RedButton = null;
  btnCancel: RedButton = null;
  _WndKeyBindings$WndChangeBinding(action: GameAction, listItem: WndKeyBindings$BindingItem, keyAssigning: number, curKeyCode: number, otherBoundKey1: number, otherBoundKey2: number): this {
    this._Window$();
    this.changedKeyCode = -1;
    this.curKeyCode = curKeyCode;
    this.otherBoundKey1 = otherBoundKey1;
    this.otherBoundKey2 = otherBoundKey2;
    let descKey = '';
    if (keyAssigning === 1) {
      descKey = 'desc_first';
    } else if (keyAssigning === 2) {
      descKey = 'desc_second';
    } else if (keyAssigning === 3) {
      descKey = 'desc_third';
    }
    let desc = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, descKey, [Messages.get$Class$String$ObjectArr($J.cls(WndKeyBindings), action.name(), []), KeyBindings.getKeyName(curKeyCode)]), 6);
    desc.maxWidth$int(WndKeyBindings.WIDTH);
    desc.setRect(0, 0, Math.fround(WndKeyBindings.WIDTH), desc.height());
    this.add$Gizmo(desc);
    let curBind: RenderedTextBlock;
    curBind = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'desc_current', [KeyBindings.getKeyName(curKeyCode)]), 6);
    curBind.maxWidth$int(WndKeyBindings.WIDTH);
    curBind.setRect(Math.fround((Math.fround(WndKeyBindings.WIDTH - curBind.width())) / 2), Math.fround(desc.bottom() + 6), Math.fround(WndKeyBindings.WIDTH), curBind.height());
    this.add$Gizmo(curBind);
    this.changedKey = PixelScene.renderTextBlock$int(6);
    this.changedKey.maxWidth$int(WndKeyBindings.WIDTH);
    this.changedKey.setRect(0, Math.fround(curBind.bottom() + 2), Math.fround(WndKeyBindings.WIDTH), this.changedKey.height());
    this.add$Gizmo(this.changedKey);
    this.warnErr = PixelScene.renderTextBlock$int(6);
    this.warnErr.maxWidth$int(WndKeyBindings.WIDTH);
    this.warnErr.setRect(0, Math.fround(this.changedKey.bottom() + 10), Math.fround(WndKeyBindings.WIDTH), this.warnErr.height());
    this.add$Gizmo(this.warnErr);
    this.btnUnbind = new (WndKeyBindings$WndChangeBinding$1())().$o(this).$c(action, listItem)._RedButton$String$int(Messages.get$Object$String$ObjectArr(this, 'unbind', []), 9);
    this.btnUnbind.setRect(0, Math.fround(this.warnErr.bottom() + 6), Math.fround(WndKeyBindings.WIDTH), Math.fround(WndKeyBindings.BTN_HEIGHT));
    this.add$Gizmo(this.btnUnbind);
    this.btnConfirm = new (WndKeyBindings$WndChangeBinding$2())().$o(this).$c(listItem, keyAssigning, action)._RedButton$String$int(Messages.get$Object$String$ObjectArr(this, 'confirm', []), 9);
    this.btnConfirm.setRect(0, Math.fround(this.btnUnbind.bottom() + 1), Math.fround($J.idiv(WndKeyBindings.WIDTH, 2)), Math.fround(WndKeyBindings.BTN_HEIGHT));
    this.btnConfirm.enable(false);
    this.add$Gizmo(this.btnConfirm);
    this.btnCancel = new (WndKeyBindings$WndChangeBinding$3())().$o(this)._RedButton$String$int(Messages.get$Object$String$ObjectArr(this, 'cancel', []), 9);
    this.btnCancel.setRect(Math.fround(this.btnConfirm.right() + 1), Math.fround(this.btnUnbind.bottom() + 1), Math.fround(($J.idiv(WndKeyBindings.WIDTH, 2) - 1) | 0), Math.fround(WndKeyBindings.BTN_HEIGHT));
    this.add$Gizmo(this.btnCancel);
    this.resize(WndKeyBindings.WIDTH, $J.d2i(this.btnCancel.bottom()));
    KeyBindings.bindingKey = true;
    return this;
  }
  onSignal(event: KeyEvent): boolean {
    if (KeyBindings.getActionForKey(event) === GameAction.LEFT_CLICK) {
      let hoverPos = this.camera().screenToCamera($J.d2i(PointerEvent.currentHoverPos().x), $J.d2i(PointerEvent.currentHoverPos().y));
      if (this.btnUnbind.inside(hoverPos.x, hoverPos.y)) {
        return true;
      }
      if (this.btnConfirm.inside(hoverPos.x, hoverPos.y)) {
        return true;
      }
      if (this.btnCancel.inside(hoverPos.x, hoverPos.y)) {
        return true;
      }
    }
    if (WndKeyBindings.controller && !ControllerHandler.icControllerKey(event.code_)) {
      return true;
    } else if (!WndKeyBindings.controller && !KeyEvent.isKeyboardKey(event.code_)) {
      return true;
    }
    if (event.pressed) {
      this.changedKey.text$String(Messages.get$Object$String$ObjectArr(this, 'changed_bind', [KeyBindings.getKeyName(event.code_)]));
      this.changedKey.setPos(Math.fround((Math.fround(WndKeyBindings.WIDTH - this.changedKey.width())) / 2), this.changedKey.top());
      this.changedKeyCode = event.code_;
      this.changedAction = null;
      if (event.code_ !== 0 && (event.code_ === this.curKeyCode || event.code_ === this.otherBoundKey1 || event.code_ === this.otherBoundKey2)) {
        this.warnErr.text$String(Messages.get$Object$String$ObjectArr(this, 'error', []));
        this.warnErr.hardlight(CharSprite.NEGATIVE);
        this.btnConfirm.enable(false);
      } else if (event.code_ !== 0 && this.$outer.changedBindings.get(this.changedKeyCode) != null) {
        for (const $it4 = this.$outer.listItems.iterator(); $it4.hasNext(); ) {
          let i = $it4.next();
          if (i.gameAction === this.$outer.changedBindings.get(this.changedKeyCode)) {
            this.changedAction = i;
            break;
          }
        }
        this.warnErr.text$String(Messages.get$Object$String$ObjectArr(this, 'warning', [Messages.get$Class$String$ObjectArr($J.cls(WndKeyBindings), this.$outer.changedBindings.get(this.changedKeyCode).name(), [])]));
        this.warnErr.hardlight(CharSprite.WARNING);
        this.btnConfirm.enable(true);
      } else {
        this.warnErr.text$String(' ');
        this.btnConfirm.enable(true);
      }
    }
    return true;
  }
  destroy(): void {
    super.destroy();
    KeyBindings.bindingKey = false;
  }
}

let $WndKeyBindings$1: any = null;
/** An anonymous class (WndKeyBindings.java:109). */
function WndKeyBindings$1(): any {
  return $WndKeyBindings$1 ??= $J.local(class extends ScrollPane {
    onClick(x: number, y: number): void {
      for (const $it0 = this.$outer.listItems.iterator(); $it0.hasNext(); ) {
        let i = $it0.next();
        if (i.onClick(x, y)) {
          break;
        }
      }
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndKeyBindings$1', []);
}

let $WndKeyBindings$2: any = null;
/** An anonymous class (WndKeyBindings.java:169). */
function WndKeyBindings$2(): any {
  return $WndKeyBindings$2 ??= $J.local(class extends RedButton {
    onClick(): void {
      this.$outer.changedBindings = this.$cv_controller ? SPDAction.getControllerDefaults() : SPDAction.getDefaults();
      for (const $it2 = this.$outer.listItems.iterator(); $it2.hasNext(); ) {
        let i = $it2.next();
        let key1 = 0;
        let key2 = 0;
        let key3 = 0;
        for (const $it3 = this.$outer.changedBindings.keySet().iterator(); $it3.hasNext(); ) {
          let k = $it3.next();
          if (this.$outer.changedBindings.get(k) === i.gameAction) {
            if (key1 === 0) {
              key1 = k;
            } else if (key2 === 0) {
              key2 = k;
            } else {
              key3 = k;
            }
          }
        }
        i.updateBindings(key1, key2, key3);
      }
    }
    $c($controller): this {
      this.$cv_controller = $controller;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndKeyBindings$2', []);
}

let $WndKeyBindings$3: any = null;
/** An anonymous class (WndKeyBindings.java:191). */
function WndKeyBindings$3(): any {
  return $WndKeyBindings$3 ??= $J.local(class extends RedButton {
    onClick(): void {
      if (this.$cv_controller) {
        KeyBindings.setAllControllerBindings(this.$outer.changedBindings);
      } else {
        KeyBindings.setAllBindings(this.$outer.changedBindings);
      }
      SPDAction.saveBindings();
      this.$outer.hide();
    }
    $c($controller): this {
      this.$cv_controller = $controller;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndKeyBindings$3', []);
}

let $WndKeyBindings$4: any = null;
/** An anonymous class (WndKeyBindings.java:203). */
function WndKeyBindings$4(): any {
  return $WndKeyBindings$4 ??= $J.local(class extends RedButton {
    onClick(): void {
      this.$outer.hide();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndKeyBindings$4', []);
}

let $WndKeyBindings$WndChangeBinding$1: any = null;
/** An anonymous class (WndKeyBindings.java:429). */
function WndKeyBindings$WndChangeBinding$1(): any {
  return $WndKeyBindings$WndChangeBinding$1 ??= $J.local(class extends RedButton {
    onClick(): void {
      if (this.$cv_action === GameAction.LEFT_CLICK && this.$cv_listItem.key2 === 0 && this.$cv_listItem.key3 === 0) {
        Game.scene().addToFront(new WndMessage()._WndMessage(Messages.get$Class$String$ObjectArr($J.cls(WndKeyBindings$WndChangeBinding), 'cant_unbind', [])));
      } else {
        this.$outer.onSignal(new KeyEvent()._KeyEvent(0, true));
      }
    }
    $c($action, $listItem): this {
      this.$cv_action = $action; this.$cv_listItem = $listItem;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndKeyBindings$WndChangeBinding$1', []);
}

let $WndKeyBindings$WndChangeBinding$2: any = null;
/** An anonymous class (WndKeyBindings.java:442). */
function WndKeyBindings$WndChangeBinding$2(): any {
  return $WndKeyBindings$WndChangeBinding$2 ??= $J.local(class extends RedButton {
    onClick(): void {
      if (this.$outer.changedKeyCode !== -1) {
        this.$outer.$outer.changedBindings.remove(this.$outer.changedKeyCode);
        this.$outer.$outer.changedBindings.remove(this.$cv_listItem.key1);
        this.$outer.$outer.changedBindings.remove(this.$cv_listItem.key2);
        this.$outer.$outer.changedBindings.remove(this.$cv_listItem.key3);
        if (this.$cv_keyAssigning === 1) {
          if (this.$outer.changedKeyCode !== 0) {
            this.$outer.$outer.changedBindings.put(this.$outer.changedKeyCode, this.$cv_action);
          }
          if (this.$cv_listItem.key2 !== 0) {
            this.$outer.$outer.changedBindings.put(this.$cv_listItem.key2, this.$cv_action);
          }
          if (this.$cv_listItem.key3 !== 0) {
            this.$outer.$outer.changedBindings.put(this.$cv_listItem.key3, this.$cv_action);
          }
          this.$cv_listItem.updateBindings(this.$outer.changedKeyCode, this.$cv_listItem.key2, this.$cv_listItem.key3);
        } else if (this.$cv_keyAssigning === 2) {
          if (this.$cv_listItem.key1 !== 0) {
            this.$outer.$outer.changedBindings.put(this.$cv_listItem.key1, this.$cv_action);
          }
          if (this.$outer.changedKeyCode !== 0) {
            this.$outer.$outer.changedBindings.put(this.$outer.changedKeyCode, this.$cv_action);
          }
          if (this.$cv_listItem.key3 !== 0) {
            this.$outer.$outer.changedBindings.put(this.$cv_listItem.key3, this.$cv_action);
          }
          this.$cv_listItem.updateBindings(this.$cv_listItem.key1, this.$outer.changedKeyCode, this.$cv_listItem.key3);
        } else {
          if (this.$cv_listItem.key1 !== 0) {
            this.$outer.$outer.changedBindings.put(this.$cv_listItem.key1, this.$cv_action);
          }
          if (this.$cv_listItem.key2 !== 0) {
            this.$outer.$outer.changedBindings.put(this.$cv_listItem.key2, this.$cv_action);
          }
          if (this.$outer.changedKeyCode !== 0) {
            this.$outer.$outer.changedBindings.put(this.$outer.changedKeyCode, this.$cv_action);
          }
          this.$cv_listItem.updateBindings(this.$cv_listItem.key1, this.$cv_listItem.key2, this.$outer.changedKeyCode);
        }
        if (this.$outer.changedAction != null) {
          if (this.$outer.changedAction.key1 === this.$outer.changedKeyCode) {
            this.$outer.changedAction.updateBindings(0, this.$outer.changedAction.key2, this.$outer.changedAction.key3);
          } else if (this.$outer.changedAction.key2 === this.$outer.changedKeyCode) {
            this.$outer.changedAction.updateBindings(this.$outer.changedAction.key1, 0, this.$outer.changedAction.key3);
          } else if (this.$outer.changedAction.key3 === this.$outer.changedKeyCode) {
            this.$outer.changedAction.updateBindings(this.$outer.changedAction.key1, this.$outer.changedAction.key2, 0);
          }
        }
      }
      this.$outer.hide();
    }
    $c($listItem, $keyAssigning, $action): this {
      this.$cv_listItem = $listItem; this.$cv_keyAssigning = $keyAssigning; this.$cv_action = $action;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndKeyBindings$WndChangeBinding$2', []);
}

let $WndKeyBindings$WndChangeBinding$3: any = null;
/** An anonymous class (WndKeyBindings.java:487). */
function WndKeyBindings$WndChangeBinding$3(): any {
  return $WndKeyBindings$WndChangeBinding$3 ??= $J.local(class extends RedButton {
    onClick(): void {
      this.$outer.hide();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndKeyBindings$WndChangeBinding$3', []);
}

$J.define(WndKeyBindings, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndKeyBindings', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { 'java.lang.Boolean': '_WndKeyBindings' }, meths: { 'offset(int,int)': 'offset$int$int' }, clinit: true, lazy: ['controller'] });
$J.define(WndKeyBindings$BindingItem, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndKeyBindings$BindingItem', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { 'com.watabou.input.GameAction': '_WndKeyBindings$BindingItem' }, inner: true });
$J.define(WndKeyBindings$WndChangeBinding, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndKeyBindings$WndChangeBinding', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { 'com.watabou.input.GameAction,com.shatteredpixel.shatteredpixeldungeon.windows.WndKeyBindings$BindingItem,int,int,int,int': '_WndKeyBindings$WndChangeBinding' }, inner: true });
$J.module(() => {
  SPDAction = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDAction');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  CharSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.CharSprite');
  RedButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RedButton');
  RenderedTextBlock = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RenderedTextBlock');
  ScrollPane = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ScrollPane');
  WndMessage = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndMessage');
  ControllerHandler = $J.load('com.watabou.input.ControllerHandler');
  GameAction = $J.load('com.watabou.input.GameAction');
  KeyBindings = $J.load('com.watabou.input.KeyBindings');
  KeyEvent = $J.load('com.watabou.input.KeyEvent');
  PointerEvent = $J.load('com.watabou.input.PointerEvent');
  ColorBlock = $J.load('com.watabou.noosa.ColorBlock');
  Game = $J.load('com.watabou.noosa.Game');
});
