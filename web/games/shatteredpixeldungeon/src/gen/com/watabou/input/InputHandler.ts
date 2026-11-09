// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/input/InputHandler.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, InputAdapter, InputMultiplexer } from '../../../../jre/index.ts';

let ControllerHandler, KeyBindings, KeyEvent, PointerEvent, PointerEvent$Type, ScrollEvent, Game;

export class InputHandler extends InputAdapter {
  multiplexer: InputMultiplexer = null;
  _InputHandler(input: Input): this {
    this._InputAdapter();
    this.multiplexer = new InputMultiplexer();
    input.setInputProcessor(this.multiplexer);
    this.addInputProcessor(this);
    input.setCatchKey(4, true);
    input.setCatchKey(82, true);
    return this;
  }
  addInputProcessor(processor: InputProcessor): void {
    this.multiplexer.addProcessor(0, processor);
  }
  removeInputProcessor(processor: InputProcessor): void {
    this.multiplexer.removeProcessor(processor);
  }
  emulateTouch(id: number, button: number, down: boolean): void {
    let hoverPos = PointerEvent.currentHoverPos();
    if (down) {
      this.multiplexer.touchDown($J.d2i(hoverPos.x), $J.d2i(hoverPos.y), id, button);
    } else {
      this.multiplexer.touchUp($J.d2i(hoverPos.x), $J.d2i(hoverPos.y), id, button);
    }
  }
  emulateDrag(id: number): void {
    let hoverPos = PointerEvent.currentHoverPos();
    this.multiplexer.touchDragged($J.d2i(hoverPos.x), $J.d2i(hoverPos.y), id);
  }
  processAllEvents(): void {
    PointerEvent.processPointerEvents();
    KeyEvent.processKeyEvents();
    ScrollEvent.processScrollEvents();
  }
  touchDown(screenX: number, screenY: number, pointer: number, button: number): boolean {
    if (screenX < 0 || screenX > Game.width || screenY < 0 || screenY > Game.height) {
      return true;
    }
    if (pointer !== ControllerHandler.CONTROLLER_POINTER_ID) {
      ControllerHandler.setControllerPointer(false);
      ControllerHandler.controllerActive = false;
    }
    if (button >= 3 && KeyBindings.isKeyBound((button + 1000) | 0)) {
      KeyEvent.addKeyEvent(new KeyEvent()._KeyEvent((button + 1000) | 0, true));
    } else if (button < 3) {
      PointerEvent.addPointerEvent(new PointerEvent()._PointerEvent$int$int$int$Type$int(screenX, screenY, pointer, PointerEvent$Type.DOWN, button));
    }
    return true;
  }
  touchUp(screenX: number, screenY: number, pointer: number, button: number): boolean {
    if (button >= 3 && KeyBindings.isKeyBound((button + 1000) | 0)) {
      KeyEvent.addKeyEvent(new KeyEvent()._KeyEvent((button + 1000) | 0, false));
    } else if (button < 3) {
      PointerEvent.addPointerEvent(new PointerEvent()._PointerEvent$int$int$int$Type$int(screenX, screenY, pointer, PointerEvent$Type.UP, button));
    }
    return true;
  }
  touchCancelled(screenX: number, screenY: number, pointer: number, button: number): boolean {
    if (button >= 3 && KeyBindings.isKeyBound((button + 1000) | 0)) {
      KeyEvent.addKeyEvent(new KeyEvent()._KeyEvent((button + 1000) | 0, false));
    } else if (button < 3) {
      PointerEvent.addPointerEvent(new PointerEvent()._PointerEvent$int$int$int$Type$int(screenX, screenY, pointer, PointerEvent$Type.CANCEL, button));
    }
    return true;
  }
  touchDragged(screenX: number, screenY: number, pointer: number): boolean {
    PointerEvent.addIfExisting(new PointerEvent()._PointerEvent$int$int$int$Type(screenX, screenY, pointer, PointerEvent$Type.DOWN));
    return true;
  }
  mouseMoved(screenX: number, screenY: number): boolean {
    if (ControllerHandler.controllerPointerActive()) {
      ControllerHandler.setControllerPointer(false);
      let hover = ControllerHandler.getControllerPointerPos();
      screenX = $J.d2i(hover.x);
      screenY = $J.d2i(hover.y);
    }
    PointerEvent.addPointerEvent(new PointerEvent()._PointerEvent$int$int$int$Type(screenX, screenY, -1, PointerEvent$Type.HOVER));
    return true;
  }
  keyDown(keyCode: number): boolean {
    if (KeyBindings.isKeyBound(keyCode)) {
      KeyEvent.addKeyEvent(new KeyEvent()._KeyEvent(keyCode, true));
      return true;
    } else {
      return false;
    }
  }
  keyUp(keyCode: number): boolean {
    if (KeyBindings.isKeyBound(keyCode)) {
      KeyEvent.addKeyEvent(new KeyEvent()._KeyEvent(keyCode, false));
      return true;
    } else {
      return false;
    }
  }
  scrolled(amountX: number, amountY: number): boolean {
    ScrollEvent.addScrollEvent(new ScrollEvent()._ScrollEvent(PointerEvent.currentHoverPos(), amountY));
    return true;
  }
}

$J.define(InputHandler, 'com.watabou.input.InputHandler', { kind: 'class', sup: 'com.badlogic.gdx.InputAdapter', ctors: { 'com.badlogic.gdx.Input': '_InputHandler' } });
$J.module(() => {
  ControllerHandler = $J.load('com.watabou.input.ControllerHandler');
  KeyBindings = $J.load('com.watabou.input.KeyBindings');
  KeyEvent = $J.load('com.watabou.input.KeyEvent');
  PointerEvent = $J.load('com.watabou.input.PointerEvent');
  PointerEvent$Type = $J.load('com.watabou.input.PointerEvent$Type');
  ScrollEvent = $J.load('com.watabou.input.ScrollEvent');
  Game = $J.load('com.watabou.noosa.Game');
});
