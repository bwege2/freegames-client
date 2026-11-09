// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/input/KeyEvent.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, JObject } from '../../../../jre/index.ts';

let ControllerHandler, GameAction, KeyBindings, PointerEvent, Game, Signal;

export class KeyEvent extends JObject {
  code_: number = 0;
  pressed: boolean = false;
  static keySignal: Signal<KeyEvent> = null;
  static keyEvents: ArrayList<KeyEvent> = null;
  _KeyEvent(code: number, pressed: boolean): this {
    this.code_ = code;
    this.pressed = pressed;
    return this;
  }
  static addKeyListener(listener: Signal$Listener<KeyEvent>): void {
    KeyEvent.keySignal.add(listener);
  }
  static removeKeyListener(listener: Signal$Listener<KeyEvent>): void {
    KeyEvent.keySignal.remove(listener);
  }
  static clearListeners(): void {
    KeyEvent.keySignal.removeAll();
  }
  static addKeyEvent(event: KeyEvent): void {
    KeyEvent.keyEvents.add(event);
  }
  static processKeyEvents(): void {
    if (KeyEvent.keyEvents.isEmpty()) {
      return;
    }
    for (const $it0 = KeyEvent.keyEvents.iterator(); $it0.hasNext(); ) {
      let k = $it0.next();
      if (KeyBindings.getActionForKey(k) === GameAction.LEFT_CLICK) {
        Game.inputHandler.emulateTouch(ControllerHandler.CONTROLLER_POINTER_ID, PointerEvent.LEFT, k.pressed);
        if (KeyBindings.bindingKey) {
          KeyEvent.keySignal.dispatch(k);
        }
      } else if (KeyBindings.getActionForKey(k) === GameAction.RIGHT_CLICK) {
        Game.inputHandler.emulateTouch(ControllerHandler.CONTROLLER_POINTER_ID, PointerEvent.RIGHT, k.pressed);
        if (KeyBindings.bindingKey) {
          KeyEvent.keySignal.dispatch(k);
        }
      } else if (KeyBindings.getActionForKey(k) === GameAction.MIDDLE_CLICK) {
        Game.inputHandler.emulateTouch(ControllerHandler.CONTROLLER_POINTER_ID, PointerEvent.MIDDLE, k.pressed);
        if (KeyBindings.bindingKey) {
          KeyEvent.keySignal.dispatch(k);
        }
      } else {
        KeyEvent.keySignal.dispatch(k);
      }
    }
    KeyEvent.keyEvents.clear();
  }
  static isKeyboardKey(keyCode: number): boolean {
    return keyCode === 0 || !ControllerHandler.icControllerKey(keyCode);
  }
  static $clinit() {
    KeyEvent.keySignal = new Signal()._Signal$boolean(true);
    KeyEvent.keyEvents = new ArrayList();
  }
}

$J.define(KeyEvent, 'com.watabou.input.KeyEvent', { kind: 'class', sup: 'java.lang.Object', ctors: { 'int,boolean': '_KeyEvent' }, clinit: true, lazy: ['keySignal', 'keyEvents'] });
$J.module(() => {
  ControllerHandler = $J.load('com.watabou.input.ControllerHandler');
  GameAction = $J.load('com.watabou.input.GameAction');
  KeyBindings = $J.load('com.watabou.input.KeyBindings');
  PointerEvent = $J.load('com.watabou.input.PointerEvent');
  Game = $J.load('com.watabou.noosa.Game');
  Signal = $J.load('com.watabou.utils.Signal');
});
