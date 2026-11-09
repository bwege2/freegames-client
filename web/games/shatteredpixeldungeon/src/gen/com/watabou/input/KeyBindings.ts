// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/input/KeyBindings.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Input_Keys, JObject, LinkedHashMap } from '../../../../jre/index.ts';

let ControllerHandler, GameAction;

export class KeyBindings extends JObject {
  static bindings: LinkedHashMap<number, GameAction> = null;
  static controllerBindings: LinkedHashMap<number, GameAction> = null;
  static hardBindings: LinkedHashMap<number, GameAction> = null;
  static bindingKey: boolean = false;
  _KeyBindings(): this {
    return this;
  }
  static getAllBindings(): LinkedHashMap<number, GameAction> {
    return new LinkedHashMap(KeyBindings.bindings);
  }
  static setAllBindings(newBindings: LinkedHashMap<number, GameAction>): void {
    KeyBindings.bindings = new LinkedHashMap(newBindings);
  }
  static getAllControllerBindings(): LinkedHashMap<number, GameAction> {
    return new LinkedHashMap(KeyBindings.controllerBindings);
  }
  static setAllControllerBindings(newBindings: LinkedHashMap<number, GameAction>): void {
    KeyBindings.controllerBindings = new LinkedHashMap(newBindings);
  }
  static addHardBinding(keyCode: number, action: GameAction): void {
    KeyBindings.hardBindings.put(keyCode, action);
  }
  static isKeyBound(keyCode: number): boolean {
    if (keyCode < 0 || (keyCode > 255 && keyCode < 1000)) {
      return false;
    }
    return KeyBindings.bindingKey || KeyBindings.bindings.containsKey(keyCode) || KeyBindings.controllerBindings.containsKey(keyCode) || KeyBindings.hardBindings.containsKey(keyCode);
  }
  static getActionForKey(event: KeyEvent): GameAction {
    if (KeyBindings.bindings.containsKey(event.code_)) {
      return KeyBindings.bindings.get(event.code_);
    } else if (KeyBindings.controllerBindings.containsKey(event.code_)) {
      return KeyBindings.controllerBindings.get(event.code_);
    } else if (KeyBindings.hardBindings.containsKey(event.code_)) {
      return KeyBindings.hardBindings.get(event.code_);
    }
    return GameAction.NONE;
  }
  static getFirstKeyForAction(action: GameAction, preferController: boolean): number {
    let keys = KeyBindings.getKeyboardKeysForAction(action);
    let buttons = KeyBindings.getControllerKeysForAction(action);
    if (preferController) {
      if (!buttons.isEmpty()) {
        return buttons.get(0);
      }
    } else {
      if (!keys.isEmpty()) {
        return keys.get(0);
      }
    }
    return 0;
  }
  static getKeyboardKeysForAction(action: GameAction): ArrayList<number> {
    let result = new ArrayList();
    for (const $it0 = KeyBindings.bindings.keySet().iterator(); $it0.hasNext(); ) {
      let i = $it0.next();
      if (KeyBindings.bindings.get(i) === action) {
        result.add(i);
      }
    }
    return result;
  }
  static getControllerKeysForAction(action: GameAction): ArrayList<number> {
    let result = new ArrayList();
    for (const $it1 = KeyBindings.controllerBindings.keySet().iterator(); $it1.hasNext(); ) {
      let i = $it1.next();
      if (KeyBindings.controllerBindings.get(i) === action) {
        result.add(i);
      }
    }
    return result;
  }
  static getKeyName(keyCode: number): string {
    if (ControllerHandler.customButtonName(keyCode) != null) {
      return ControllerHandler.customButtonName(keyCode);
    }
    if (keyCode === 1003) {
      return 'Mouse 4';
    } else if (keyCode === 1004) {
      return 'Mouse 5';
    }
    if (keyCode === 0) {
      return 'None';
    } else if (keyCode === 81) {
      return '+';
    } else if (keyCode === 67) {
      return 'Backspc';
    } else if (keyCode === 112) {
      return 'Delete';
    } else {
      return Input_Keys.toString(keyCode);
    }
  }
  static $clinit() {
    KeyBindings.bindings = new LinkedHashMap();
    KeyBindings.controllerBindings = new LinkedHashMap();
    KeyBindings.hardBindings = new LinkedHashMap();
    KeyBindings.bindingKey = false;
  }
}

$J.define(KeyBindings, 'com.watabou.input.KeyBindings', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_KeyBindings' }, clinit: true, lazy: ['bindings', 'controllerBindings', 'hardBindings', 'bindingKey'] });
$J.module(() => {
  ControllerHandler = $J.load('com.watabou.input.ControllerHandler');
  GameAction = $J.load('com.watabou.input.GameAction');
});
