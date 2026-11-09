// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndTabbed.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Window } from '../ui/Window.ts';
import { Button } from '../ui/Button.ts';

let Assets$Sounds, Chrome, Chrome$Type, SPDAction, PixelScene, KeyBindings, KeyEvent, Game, Image, Sample;

export class WndTabbed extends Window {
  tabs: ArrayList<WndTabbed$Tab> = null;
  selected: WndTabbed$Tab = null;
  tabListener: Signal$Listener<KeyEvent> = null;
  _WndTabbed(): this {
    this._Window$int$int$NinePatch(0, 0, Chrome.get(Chrome$Type.TAB_SET));
    this.tabs = new ArrayList();
    KeyEvent.addKeyListener(this.tabListener = new (WndTabbed$1())().$o(this));
    return this;
  }
  destroy(): void {
    super.destroy();
    KeyEvent.removeKeyListener(this.tabListener);
  }
  add$Tab(tab: WndTabbed$Tab): WndTabbed$Tab {
    tab.setPos(this.tabs.size() === 0 ? Math.fround((-this.chrome.marginLeft() + 1) | 0) : this.tabs.get((this.tabs.size() - 1) | 0).right(), Math.fround(this.height_));
    tab.select(tab.selected);
    super.add$Gizmo(tab);
    this.tabs.add(tab);
    return tab;
  }
  select$int(index: number): void {
    this.select$Tab(this.tabs.get(index));
  }
  select$Tab(tab: WndTabbed$Tab): void {
    if (tab !== this.selected) {
      for (const $it0 = this.tabs.iterator(); $it0.hasNext(); ) {
        let t = $it0.next();
        if (t === this.selected) {
          t.select(false);
        } else if (t === tab) {
          t.select(true);
        }
      }
      this.selected = tab;
    }
  }
  resize(w: number, h: number): void {
    this.width_ = w;
    this.height_ = h;
    this.chrome.size(Math.fround((this.width_ + this.chrome.marginHor()) | 0), Math.fround((this.height_ + this.chrome.marginVer()) | 0));
    this.camera_.resize($J.d2i(this.chrome.width_), (this.chrome.marginTop() + this.height_ + this.tabHeight()) | 0);
    this.camera_.x = $J.idiv($J.d2i((Math.fround(Game.width - this.camera_.screenWidth()))), 2);
    this.camera_.y = $J.idiv($J.d2i((Math.fround(Game.height - this.camera_.screenHeight()))), 2);
    this.camera_.y = $J.d2i(Math.fround(this.camera_.y + Math.fround(this.yOffset * this.camera_.zoom_)));
    this.shadow.boxRect(Math.fround(this.camera_.x / this.camera_.zoom_), Math.fround(this.camera_.y / this.camera_.zoom_), this.chrome.width(), this.chrome.height_);
    for (const $it1 = this.tabs.iterator(); $it1.hasNext(); ) {
      let tab = $it1.next();
      this.remove$Gizmo(tab);
    }
    let tabs = new ArrayList(this.tabs);
    this.tabs.clear();
    for (const $it2 = tabs.iterator(); $it2.hasNext(); ) {
      let tab = $it2.next();
      this.add$Tab(tab);
    }
  }
  layoutTabs(): void {
    let fullWidth = (this.width_ + this.chrome.marginHor() - 2) | 0;
    let numTabs = Math.fround(this.tabs.size());
    let tabWidth = Math.fround((Math.fround(fullWidth - (Math.fround(numTabs - 1)))) / numTabs);
    let pos = Math.fround((-this.chrome.marginLeft() + 1) | 0);
    for (const $it3 = this.tabs.iterator(); $it3.hasNext(); ) {
      let tab = $it3.next();
      tab.setSize(tabWidth, Math.fround(this.tabHeight()));
      tab.setPos(pos, Math.fround(this.height_));
      pos = Math.fround(tab.right() + 1);
      PixelScene.align$Component(tab);
    }
  }
  tabHeight(): number {
    return 25;
  }
  onClick(tab: WndTabbed$Tab): void {
    this.select$Tab(tab);
  }
}

export class WndTabbed$Tab extends Button {
  CUT: number = 0;
  selected: boolean = false;
  bg: NinePatch = null;
  _WndTabbed$Tab(): this {
    this._Button();
    this.CUT = 5;
    return this;
  }
  layout(): void {
    super.layout();
    if (this.bg != null) {
      this.bg.x = this.x;
      this.bg.y = this.y;
      this.bg.size(this.width_, this.height_);
    }
  }
  select(value: boolean): void {
    this.selected = value;
    if (this.bg != null) {
      this.remove$Gizmo(this.bg);
    }
    this.bg = Chrome.get(this.selected ? Chrome$Type.TAB_SELECTED : Chrome$Type.TAB_UNSELECTED);
    this.addToBack(this.bg);
    this.layout();
  }
  onClick(): void {
    if (!this.selected) {
      Sample.INSTANCE.play$Object$float$float$float(Assets$Sounds.CLICK, Math.fround(0.7), Math.fround(0.7), Math.fround(1.2));
      this.$outer.onClick(this);
    }
  }
}

export class WndTabbed$LabeledTab extends WndTabbed$Tab {
  btLabel: RenderedTextBlock = null;
  _WndTabbed$LabeledTab(label: string): this {
    this._WndTabbed$Tab();
    this.btLabel.text$String(label);
    return this;
  }
  createChildren(): void {
    super.createChildren();
    this.btLabel = PixelScene.renderTextBlock$int(9);
    this.add$Gizmo(this.btLabel);
  }
  layout(): void {
    super.layout();
    this.btLabel.setPos(Math.fround(this.x + Math.fround((Math.fround(this.width_ - this.btLabel.width())) / 2)), Math.fround(Math.fround(this.y + Math.fround((Math.fround(this.height_ - this.btLabel.height())) / 2)) - (this.selected ? 1 : 3)));
    PixelScene.align$Component(this.btLabel);
  }
  select(value: boolean): void {
    super.select(value);
    this.btLabel.alpha(this.selected ? 1 : Math.fround(0.6));
  }
}

export class WndTabbed$IconTab extends WndTabbed$Tab {
  icon_: Image = null;
  defaultFrame: RectF = null;
  _WndTabbed$IconTab(icon: Image): this {
    this._WndTabbed$Tab();
    this.icon_.copy(icon);
    this.defaultFrame = icon.frame$();
    return this;
  }
  createChildren(): void {
    super.createChildren();
    this.icon_ = new Image()._Image$();
    this.add$Gizmo(this.icon_);
  }
  layout(): void {
    super.layout();
    this.icon_.frame$RectF(this.defaultFrame);
    this.icon_.x = Math.fround(this.x + Math.fround((Math.fround(this.width_ - this.icon_.width_)) / 2));
    this.icon_.y = Math.fround(Math.fround(this.y + Math.fround((Math.fround(this.height_ - this.icon_.height_)) / 2)) - 1);
    if (!this.selected) {
      this.icon_.y = Math.fround(this.icon_.y - 2);
      if (this.icon_.y < Math.fround(this.y + this.CUT)) {
        let frame = this.icon_.frame$();
        frame.top_ = Math.fround(frame.top_ + Math.fround((Math.fround(Math.fround(this.y + this.CUT) - this.icon_.y)) / this.icon_.texture_.height_));
        this.icon_.frame$RectF(frame);
        this.icon_.y = Math.fround(this.y + this.CUT);
      }
    }
    PixelScene.align$Visual(this.icon_);
  }
  select(value: boolean): void {
    super.select(value);
    this.icon_.am = this.selected ? 1 : Math.fround(0.6);
  }
}

let $WndTabbed$1: any = null;
/** An anonymous class (WndTabbed.java:52). */
function WndTabbed$1(): any {
  return $WndTabbed$1 ??= $J.local(class extends JObject {
    onSignal(keyEvent: KeyEvent): boolean {
      if (!keyEvent.pressed && KeyBindings.getActionForKey(keyEvent) === SPDAction.CYCLE) {
        let idx = this.$outer.tabs.indexOf(this.$outer.selected);
        idx++;
        if (idx >= this.$outer.tabs.size()) {
          idx = 0;
        }
        this.$outer.tabs.get(idx).onClick();
        return true;
      }
      return false;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTabbed$1', ['com.watabou.utils.Signal$Listener']);
}

$J.define(WndTabbed, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTabbed', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { '': '_WndTabbed' }, meths: { 'select(com.shatteredpixel.shatteredpixeldungeon.windows.WndTabbed$Tab)': 'select$Tab', 'select(int)': 'select$int', 'add(com.shatteredpixel.shatteredpixeldungeon.windows.WndTabbed$Tab)': 'add$Tab' } });
$J.define(WndTabbed$Tab, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTabbed$Tab', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Button', ctors: { '': '_WndTabbed$Tab' }, inner: true });
$J.define(WndTabbed$LabeledTab, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTabbed$LabeledTab', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTabbed$Tab', ctors: { 'java.lang.String': '_WndTabbed$LabeledTab' }, inner: true });
$J.define(WndTabbed$IconTab, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTabbed$IconTab', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.windows.WndTabbed$Tab', ctors: { 'com.watabou.noosa.Image': '_WndTabbed$IconTab' }, inner: true });
$J.module(() => {
  Assets$Sounds = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Sounds');
  Chrome = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome');
  Chrome$Type = $J.load('com.shatteredpixel.shatteredpixeldungeon.Chrome$Type');
  SPDAction = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDAction');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  KeyBindings = $J.load('com.watabou.input.KeyBindings');
  KeyEvent = $J.load('com.watabou.input.KeyEvent');
  Game = $J.load('com.watabou.noosa.Game');
  Image = $J.load('com.watabou.noosa.Image');
  Sample = $J.load('com.watabou.noosa.audio.Sample');
});
