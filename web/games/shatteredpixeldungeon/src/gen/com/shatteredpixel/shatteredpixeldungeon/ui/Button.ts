// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/ui/Button.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { Component } from '../../../watabou/noosa/ui/Component.ts';

let SPDSettings, Tooltip, ControllerHandler, KeyBindings, KeyEvent, PointerEvent, Game, PointerArea;

export class Button extends Component {
  static longClick: number = 0;
  hotArea: PointerArea = null;
  hoverTip: Tooltip = null;
  static pressedButton: Button = null;
  pressTime: number = 0;
  clickReady: boolean = false;
  keyListener: Signal$Listener<KeyEvent> = null;
  _Button(): this {
    this._Component();
    return this;
  }
  createChildren(): void {
    this.hotArea = new (Button$1())().$o(this)._PointerArea$float$float$float$float(0, 0, 0, 0);
    this.add$Gizmo(this.hotArea);
    KeyEvent.addKeyListener(this.keyListener = new (Button$2())().$o(this));
  }
  keyAction(): GameAction {
    return null;
  }
  secondaryTooltipAction(): GameAction {
    return null;
  }
  update(): void {
    super.update();
    this.hotArea.active = this.visible_;
    if (Button.pressedButton === this && (this.pressTime = Math.fround(this.pressTime + Game.elapsed)) >= Button.longClick) {
      Button.pressedButton = null;
      if (this.onLongClick()) {
        this.hotArea.reset();
        this.clickReady = false;
        this.onPointerUp();
        if (SPDSettings.vibration$()) {
          Game.vibrate(50);
        }
      }
    }
  }
  onPointerDown(): void {
  }
  onPointerUp(): void {
  }
  onClick(): void {
  }
  onRightClick(): void {
  }
  onMiddleClick(): void {
  }
  onLongClick(): boolean {
    return false;
  }
  hoverText(): string {
    return null;
  }
  alignTooltip(tip: Tooltip): void {
    tip.setPos(this.x, Math.fround(Math.fround(this.y - tip.height()) - 1));
    let cam = this.camera();
    if (tip.right() > (Math.fround(cam.width_ + cam.scroll_.x))) {
      tip.setPos(Math.fround(tip.left() - (Math.fround(tip.right() - (Math.fround(cam.width_ + cam.scroll_.x))))), tip.top());
    }
    if (tip.top() < Math.fround(0)) {
      tip.setPos(tip.left(), Math.fround(this.bottom() + 1));
    }
  }
  killTooltip(): void {
    if (this.hoverTip != null) {
      this.hoverTip.killAndErase();
      this.hoverTip = null;
    }
  }
  layout(): void {
    this.hotArea.x = this.x;
    this.hotArea.y = this.y;
    this.hotArea.width_ = this.width_;
    this.hotArea.height_ = this.height_;
  }
  destroy(): void {
    super.destroy();
    KeyEvent.removeKeyListener(this.keyListener);
    this.killTooltip();
  }
  givePointerPriority(): void {
    this.hotArea.givePointerPriority();
  }
  static $clinit() {
    Button.longClick = 0.5;
  }
}

let $Button$1: any = null;
/** An anonymous class (Button.java:51). */
function Button$1(): any {
  return $Button$1 ??= $J.local(class extends PointerArea {
    onPointerDown(event: PointerEvent): void {
      Button.pressedButton = this.$outer;
      this.$outer.pressTime = 0;
      this.$outer.clickReady = true;
      this.$outer.onPointerDown();
    }
    onPointerUp(event: PointerEvent): void {
      if (Button.pressedButton === this.$outer) {
        Button.pressedButton = null;
      } else {
        this.$outer.clickReady = false;
      }
      this.$outer.onPointerUp();
    }
    onClick(event: PointerEvent): void {
      if (this.$outer.clickReady) {
        this.$outer.killTooltip();
        switch (event.button) {
          case PointerEvent.LEFT:
          default:
            this.$outer.onClick();
            break;
          case PointerEvent.RIGHT:
            this.$outer.onRightClick();
            break;
          case PointerEvent.MIDDLE:
            this.$outer.onMiddleClick();
            break;
        }
      }
    }
    onHoverStart(event: PointerEvent): void {
      let text = this.$outer.hoverText();
      if (text != null) {
        let key = 0;
        if (this.$outer.keyAction() != null) {
          key = KeyBindings.getFirstKeyForAction(this.$outer.keyAction(), ControllerHandler.controllerActive);
        }
        if (key === 0 && this.$outer.secondaryTooltipAction() != null) {
          key = KeyBindings.getFirstKeyForAction(this.$outer.secondaryTooltipAction(), ControllerHandler.controllerActive);
        }
        if (key !== 0) {
          text += ' _(' + KeyBindings.getKeyName(key) + ')_';
        }
        this.$outer.hoverTip = new Tooltip()._Tooltip(this.$outer, text, 80);
        let parent = this.$outer.parent;
        while (parent.parent != null) {
          parent = parent.parent;
        }
        parent.addToFront(this.$outer.hoverTip);
        this.$outer.hoverTip.camera_ = this.camera();
        this.$outer.alignTooltip(this.$outer.hoverTip);
      }
    }
    onHoverEnd(event: PointerEvent): void {
      this.$outer.killTooltip();
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.Button$1', []);
}

let $Button$2: any = null;
/** An anonymous class (Button.java:122). */
function Button$2(): any {
  return $Button$2 ??= $J.local(class extends JObject {
    onSignal(event: KeyEvent): boolean {
      if (this.$outer.active && KeyBindings.getActionForKey(event) === this.$outer.keyAction()) {
        if (event.pressed) {
          Button.pressedButton = this.$outer;
          this.$outer.pressTime = 0;
          this.$outer.clickReady = true;
          this.$outer.onPointerDown();
        } else {
          this.$outer.onPointerUp();
          if (Button.pressedButton === this.$outer) {
            Button.pressedButton = null;
            if (this.$outer.clickReady) {
              this.$outer.onClick();
            }
          }
        }
        return true;
      }
      return false;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.ui.Button$2', ['com.watabou.utils.Signal$Listener']);
}

$J.define(Button, 'com.shatteredpixel.shatteredpixeldungeon.ui.Button', { kind: 'class', sup: 'com.watabou.noosa.ui.Component', ctors: { '': '_Button' }, clinit: true, lazy: ['longClick', 'pressedButton'] });
$J.module(() => {
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  Tooltip = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Tooltip');
  ControllerHandler = $J.load('com.watabou.input.ControllerHandler');
  KeyBindings = $J.load('com.watabou.input.KeyBindings');
  KeyEvent = $J.load('com.watabou.input.KeyEvent');
  PointerEvent = $J.load('com.watabou.input.PointerEvent');
  Game = $J.load('com.watabou.noosa.Game');
  PointerArea = $J.load('com.watabou.noosa.PointerArea');
});
