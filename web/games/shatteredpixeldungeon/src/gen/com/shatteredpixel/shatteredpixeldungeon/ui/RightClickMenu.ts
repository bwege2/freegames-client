// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/RightClickMenu.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Component } from '../../../watabou/noosa/ui/Component.ts';

let Chrome, Chrome$Type, Dungeon, Messages, GameScene, PixelScene, ItemSprite, InventoryPane, ItemJournalButton, RedButton, Window, PointerEvent$Type, ColorBlock, PointerArea;

export class RightClickMenu extends Component {
  bg: NinePatch = null;
  blocker: PointerArea = null;
  icon_: Image = null;
  titleText: RenderedTextBlock = null;
  separator: ColorBlock = null;
  topRightButton: Button = null;
  buttons: RedButton[] = null;
  item_: Item = null;
  childOffset: Point = null;
  _RightClickMenu$Item(item: Item): this {
    this._Component();
    let actions = item.actions(Dungeon.hero);
    if (actions.remove(item.defaultAction())) {
      actions.add(0, item.defaultAction());
    }
    let options = $J.toArrayInto(actions.toArray(), $J.newArray(0, null));
    this.item_ = item;
    this.setup(new ItemSprite()._ItemSprite$Item(item), Messages.titleCase(item.name()), options);
    return this;
  }
  _RightClickMenu$Image$String$StringArr(icon: Image, title: string, options: string[]): this {
    this._Component();
    this.setup(icon, title, options);
    return this;
  }
  setup(icon: Image, title: string, options: string[]): void {
    this.bg = Chrome.get(Chrome$Type.TOAST_TR_HEAVY);
    this.add$Gizmo(this.bg);
    this.icon_ = icon;
    this.add$Gizmo(icon);
    this.titleText = PixelScene.renderTextBlock$String$int(title, 6);
    this.titleText.maxWidth$int(50);
    this.titleText.hardlight(Window.TITLE_COLOR);
    this.add$Gizmo(this.titleText);
    this.separator = new ColorBlock()._ColorBlock(1, 1, -16777216);
    this.add$Gizmo(this.separator);
    this.blocker = new (RightClickMenu$1())().$o(this)._PointerArea$float$float$float$float(0, 0, 0, 0);
    this.blocker.target = this.bg;
    this.add$Gizmo(this.blocker);
    if (this.item_ != null && Dungeon.hero.belongings.contains(this.item_)) {
      this.topRightButton = new (RightClickMenu$2())().$o(this)._ItemJournalButton(this.item_, null);
      this.topRightButton.setSize(16, 16);
      this.add$Gizmo(this.topRightButton);
    }
    this.buttons = $J.newArray(options.length, null);
    for (let i = 0; i < options.length; i++) {
      let finalI = i;
      this.buttons[i] = new (RightClickMenu$3())().$o(this).$c(options, finalI)._RedButton$String$int(options[finalI], 6);
      if (this.item_ != null) {
        if ($J.equals(options[i], this.item_.defaultAction())) {
          this.buttons[i].textColor(Window.TITLE_COLOR);
        }
        this.buttons[i].text$String(this.item_.actionName(options[i], Dungeon.hero));
      }
      this.add$Gizmo(this.buttons[i]);
    }
  }
  setChildWindowOffset(offset: Point): void {
    this.childOffset = offset;
  }
  onSelect(index: number): void {
  }
  layout(): void {
    super.layout();
    let topHeight = Math.max(this.icon_.height(), this.titleText.height());
    if (this.topRightButton != null) {
      topHeight = Math.max(topHeight, this.topRightButton.height());
    }
    this.height_ = 0;
    this.height_ = Math.fround(this.height_ + this.bg.marginVer());
    this.height_ = Math.fround(this.height_ + topHeight);
    this.height_ = Math.fround(this.height_ + 2);
    this.height_ = Math.fround(this.height_ + Math.imul(13, this.buttons.length));
    this.width_ = Math.fround(Math.fround(Math.fround(this.icon_.width() + 2) + this.titleText.width()) + this.bg.marginVer());
    if (this.topRightButton != null) {
      this.width_ = Math.fround(this.width_ + Math.fround(2 + this.topRightButton.width()));
    }
    for (let button of this.buttons) {
      if (this.width_ < Math.fround(button.reqWidth() + this.bg.marginHor())) {
        this.width_ = Math.fround(button.reqWidth() + this.bg.marginHor());
      }
    }
    if (Math.fround(this.x + this.width_) > (Math.fround(this.camera_.width_ + this.camera_.scroll_.x))) {
      this.x = Math.fround(this.x - (Math.fround(Math.fround(this.x + this.width_) - (Math.fround(this.camera_.width_ + this.camera_.scroll_.x)))));
    }
    if (Math.fround(this.y + this.height_) > (Math.fround(this.camera_.height_ + this.camera_.scroll_.y))) {
      this.y = Math.fround(this.y - (Math.fround(Math.fround(this.y + this.height_) - (Math.fround(this.camera_.height_ + this.camera_.scroll_.y)))));
    }
    this.bg.x = this.x;
    this.bg.y = this.y;
    this.icon_.x = Math.fround(this.x + this.bg.marginLeft());
    this.icon_.y = Math.fround(Math.fround(this.y + this.bg.marginTop()) + Math.fround((Math.fround(topHeight - this.icon_.height())) / 2));
    this.titleText.setPos(Math.fround(Math.fround(this.icon_.x + this.icon_.width()) + 2), Math.fround(Math.fround(this.y + this.bg.marginTop()) + Math.fround((Math.fround(topHeight - this.titleText.height())) / 2)));
    if (this.topRightButton != null) {
      this.topRightButton.setPos(Math.fround(this.titleText.right() + 2), Math.fround(Math.fround(this.y + this.bg.marginTop()) + Math.fround((Math.fround(topHeight - this.topRightButton.height())) / 2)));
    }
    this.separator.x = Math.fround(this.x + this.bg.marginLeft());
    this.separator.y = Math.fround(Math.fround(Math.fround(this.y + this.bg.marginTop()) + topHeight) + 1);
    this.separator.size(Math.fround(this.width_ - this.bg.marginHor()), 1);
    let top = Math.fround(this.separator.y + 2);
    for (let button of this.buttons) {
      button.setRect(Math.fround(this.x + this.bg.marginLeft()), top, Math.fround(this.width_ - this.bg.marginHor()), 12);
      top = Math.fround(button.bottom() + 1);
    }
    this.bg.size(this.width_, this.height_);
  }
}

let $RightClickMenu$1: any = null;
/** An anonymous class (RightClickMenu.java:88). */
function RightClickMenu$1(): any {
  return $RightClickMenu$1 ??= $J.local(class extends PointerArea {
    onSignal(event: PointerEvent): boolean {
      let hit = event != null && this.target.overlapsScreenPoint($J.d2i(event.current.x), $J.d2i(event.current.y));
      if (event != null && event.type_ === PointerEvent$Type.HOVER && !hit) {
        this.$outer.destroy();
        this.$outer.killAndErase();
      } else if (hit) {
        return true;
      }
      return false;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.RightClickMenu$1', []);
}

let $RightClickMenu$2: any = null;
/** An anonymous class (RightClickMenu.java:105). */
function RightClickMenu$2(): any {
  return $RightClickMenu$2 ??= $J.local(class extends ItemJournalButton {
    onClick(): void {
      this.$outer.destroy();
      this.$outer.killAndErase();
      GameScene.centerNextWndOnInvPane();
      super.onClick();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.RightClickMenu$2', []);
}

let $RightClickMenu$3: any = null;
/** An anonymous class (RightClickMenu.java:121). */
function RightClickMenu$3(): any {
  return $RightClickMenu$3 ??= $J.local(class extends RedButton {
    onClick(): void {
      super.onClick();
      if (this.$outer.childOffset != null) {
        GameScene.nextWndOffset(this.$outer.childOffset);
      }
      if (this.$outer.item_ != null) {
        this.$outer.item_.execute$Hero$String(Dungeon.hero, this.$cv_options[this.$cv_finalI]);
        if ($J.equals(this.$cv_options[this.$cv_finalI], this.$outer.item_.defaultAction()) && this.$outer.item_.usesTargeting_) {
          InventoryPane.useTargeting();
        }
      }
      this.$outer.onSelect(this.$cv_finalI);
      this.$outer.destroy();
      this.$outer.killAndErase();
    }
    $c($options, $finalI): this {
      this.$cv_options = $options; this.$cv_finalI = $finalI;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.RightClickMenu$3', []);
}

$J.define(RightClickMenu, 'com.shatteredpixel.shatteredpixeldungeon.ui.RightClickMenu', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { 'com.watabou.noosa.Image,java.lang.String,java.lang.String[]': '_RightClickMenu$Image$String$StringArr', 'com.shatteredpixel.shatteredpixeldungeon.items.Item': '_RightClickMenu$Item' } });
$J.module(() => {
  Chrome = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome');
  Chrome$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome$Type');
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  GameScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.GameScene');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  ItemSprite = $J.load('com.shatteredpixel.shatteredpixeldungeon.sprites.ItemSprite');
  InventoryPane = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.InventoryPane');
  ItemJournalButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ItemJournalButton');
  RedButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.RedButton');
  Window = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Window');
  PointerEvent$Type = $J.load('com.watabou.input.PointerEvent$Type');
  ColorBlock = $J.load('com.watabou.noosa.ColorBlock');
  PointerArea = $J.load('com.watabou.noosa.PointerArea');
});
