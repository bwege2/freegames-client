// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/input/ControllerHandler.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, Application_ApplicationType, Controllers, Exception, Gdx, Input_Keys, JEnum, JObject, JString } from '../../../../jre/index.ts';

let KeyEvent, PointerEvent, PointerEvent$Type, Game, Cursor, PointF;

export class ControllerHandler extends JObject {
  static lastUsedType: ControllerHandler$ControllerType = null;
  static controllerActive: boolean = false;
  static readonly CONTROLLER_POINTER_ID: number = 19;
  static initialized: boolean = false;
  static failedInit: boolean = false;
  static leftStickPosition: PointF = null;
  static rightStickPosition: PointF = null;
  L2Trigger: number = 0;
  R2Trigger: number = 0;
  static controllerPointerActive_: boolean = false;
  static controllerPointerPos: PointF = null;
  static DPAD_KEY_OFFSET: number = 0;
  _ControllerHandler(): this {
    this.L2Trigger = 0;
    this.R2Trigger = 0;
    return this;
  }
  static setControllerType(controller: Controller): void {
    if (controller.getName().includes('Xbox')) {
      ControllerHandler.lastUsedType = ControllerHandler$ControllerType.XBOX;
    } else if (controller.getName().includes('PS')) {
      ControllerHandler.lastUsedType = ControllerHandler$ControllerType.PLAYSTATION;
    } else if (controller.getName().includes('Nintendo')) {
      ControllerHandler.lastUsedType = ControllerHandler$ControllerType.NINTENDO;
    } else {
      ControllerHandler.lastUsedType = ControllerHandler$ControllerType.OTHER;
    }
  }
  static controllersSupported(): boolean {
    if (ControllerHandler.failedInit) {
      return false;
    } else if (ControllerHandler.initialized) {
      return true;
    } else {
      try {
        Controllers.getCurrent();
        ControllerHandler.initialized = true;
        return true;
      } catch ($e0) {
        if ($J.isa($e0, Exception)) {
          let e = $J.exc($e0);
          Game.reportException(e);
          ControllerHandler.failedInit = true;
          return false;
        } else {
          throw $e0;
        }
      }
    }
  }
  static vibrationSupported(): boolean {
    try {
      return ControllerHandler.isControllerConnected() && Controllers.getCurrent().canVibrate();
    } catch ($e1) {
      if ($J.isa($e1, Exception)) {
        let e = $J.exc($e1);
        return false;
      } else {
        throw $e1;
      }
    }
  }
  static vibrate(millis: number): void {
    if (ControllerHandler.vibrationSupported()) {
      Controllers.getCurrent().startVibration(millis, 1);
    }
  }
  static isControllerConnected(): boolean {
    return ControllerHandler.controllersSupported() && Controllers.getCurrent() != null;
  }
  connected(controller: Controller): void {
    ControllerHandler.controllerActive = true;
    ControllerHandler.setControllerType(controller);
  }
  disconnected(controller: Controller): void {
  }
  buttonDown(controller: Controller, buttonCode: number): boolean {
    ControllerHandler.setControllerType(controller);
    ControllerHandler.controllerActive = true;
    let keyCode = ControllerHandler.buttonToKey(controller, buttonCode);
    if (keyCode !== 0) {
      KeyEvent.addKeyEvent(new KeyEvent()._KeyEvent(keyCode, true));
      return true;
    }
    return false;
  }
  buttonUp(controller: Controller, buttonCode: number): boolean {
    ControllerHandler.setControllerType(controller);
    ControllerHandler.controllerActive = true;
    let keyCode = ControllerHandler.buttonToKey(controller, buttonCode);
    if (keyCode !== 0) {
      KeyEvent.addKeyEvent(new KeyEvent()._KeyEvent(keyCode, false));
      return true;
    }
    return false;
  }
  axisMoved(controller: Controller, axisCode: number, value: number): boolean {
    ControllerHandler.setControllerType(controller);
    let mapping = controller.getMapping();
    if (mapping.axisRightX === axisCode) {
      ControllerHandler.rightStickPosition.x = value;
    } else if (mapping.axisRightY === axisCode) {
      ControllerHandler.rightStickPosition.y = value;
    } else if (mapping.axisLeftX === axisCode) {
      ControllerHandler.leftStickPosition.x = value;
    } else if (mapping.axisLeftY === axisCode) {
      ControllerHandler.leftStickPosition.y = value;
    } else if (axisCode === 4 && Gdx.app.getType() === Application_ApplicationType.Desktop && this.L2Trigger !== value) {
      if (value === Math.fround(1)) {
        KeyEvent.addKeyEvent(new KeyEvent()._KeyEvent(104, true));
        ControllerHandler.controllerActive = true;
      } else if (value === Math.fround(0)) {
        KeyEvent.addKeyEvent(new KeyEvent()._KeyEvent(104, false));
        ControllerHandler.controllerActive = true;
      }
      this.L2Trigger = value;
    } else if (axisCode === 5 && Gdx.app.getType() === Application_ApplicationType.Desktop && this.R2Trigger !== value) {
      if (value === Math.fround(1)) {
        KeyEvent.addKeyEvent(new KeyEvent()._KeyEvent(105, true));
        ControllerHandler.controllerActive = true;
      } else if (value === Math.fround(0)) {
        KeyEvent.addKeyEvent(new KeyEvent()._KeyEvent(105, false));
        ControllerHandler.controllerActive = true;
      }
      this.R2Trigger = value;
    }
    return true;
  }
  static setControllerPointer(active: boolean): void {
    if (active) {
      ControllerHandler.controllerActive = true;
    }
    if (ControllerHandler.controllerPointerActive_ === active) {
      return;
    }
    ControllerHandler.controllerPointerActive_ = active;
    if (active) {
      Gdx.input.setCursorCatched(true);
      ControllerHandler.controllerPointerPos = new PointF()._PointF$PointF(PointerEvent.currentHoverPos());
    } else if (!Cursor.isCursorCaptured()) {
      Gdx.input.setCursorCatched(false);
      Gdx.input.setCursorPosition($J.d2i(ControllerHandler.controllerPointerPos.x), $J.d2i(ControllerHandler.controllerPointerPos.y));
    }
  }
  static controllerPointerActive(): boolean {
    return ControllerHandler.controllerPointerActive_ && !Cursor.isCursorCaptured();
  }
  static getControllerPointerPos(): PointF {
    return ControllerHandler.controllerPointerPos.clone();
  }
  static updateControllerPointer(pos: PointF, sendEvent: boolean): void {
    ControllerHandler.controllerPointerPos.set$PointF(pos);
    if (sendEvent) {
      ControllerHandler.controllerActive = true;
      PointerEvent.addPointerEvent(new PointerEvent()._PointerEvent$int$int$int$Type$int($J.d2i(ControllerHandler.controllerPointerPos.x), $J.d2i(ControllerHandler.controllerPointerPos.y), 10000, PointerEvent$Type.HOVER, PointerEvent.NONE));
    } else {
      PointerEvent.setHoverPos(pos);
    }
  }
  static buttonToKey(controller: Controller, btnCode: number): number {
    let mapping = controller.getMapping();
    if (btnCode === mapping.buttonA) {
      return 96;
    }
    if (btnCode === mapping.buttonB) {
      return 97;
    }
    if (btnCode === mapping.buttonX) {
      return 99;
    }
    if (btnCode === mapping.buttonY) {
      return 100;
    }
    if (btnCode === mapping.buttonBack) {
      return 109;
    }
    if (btnCode === mapping.buttonStart) {
      return 108;
    }
    if (btnCode === mapping.buttonL1) {
      return 102;
    }
    if (btnCode === mapping.buttonL2) {
      return 104;
    }
    if (btnCode === mapping.buttonR1) {
      return 103;
    }
    if (btnCode === mapping.buttonR2) {
      return 105;
    }
    if (btnCode === mapping.buttonDpadUp) {
      return (19 + ControllerHandler.DPAD_KEY_OFFSET) | 0;
    }
    if (btnCode === mapping.buttonDpadDown) {
      return (20 + ControllerHandler.DPAD_KEY_OFFSET) | 0;
    }
    if (btnCode === mapping.buttonDpadLeft) {
      return (21 + ControllerHandler.DPAD_KEY_OFFSET) | 0;
    }
    if (btnCode === mapping.buttonDpadRight) {
      return (22 + ControllerHandler.DPAD_KEY_OFFSET) | 0;
    }
    if (btnCode === mapping.buttonLeftStick) {
      return 106;
    }
    if (btnCode === mapping.buttonRightStick) {
      return 107;
    }
    return 0;
  }
  static icControllerKey(keyCode: number): boolean {
    if (keyCode === 0) {
      return true;
    }
    if (keyCode >= 96 && keyCode <= 110) {
      return true;
    }
    if (keyCode >= ((19 + ControllerHandler.DPAD_KEY_OFFSET) | 0) && keyCode <= ((22 + ControllerHandler.DPAD_KEY_OFFSET) | 0)) {
      return true;
    }
    return false;
  }
  static customButtonName(keyCode: number): string {
    if (ControllerHandler.lastUsedType === ControllerHandler$ControllerType.PLAYSTATION) {
      if (keyCode === 96) {
        return 'Cross Button';
      } else if (keyCode === 97) {
        return 'Circle Button';
      } else if (keyCode === 99) {
        return 'Square Button';
      } else if (keyCode === 100) {
        return 'Triangle Button';
      }
    } else if (ControllerHandler.lastUsedType === ControllerHandler$ControllerType.XBOX) {
      if (keyCode === 102) {
        return 'Left Bumper';
      } else if (keyCode === 104) {
        return 'Left Trigger';
      } else if (keyCode === 103) {
        return 'Right Bumper';
      } else if (keyCode === 105) {
        return 'Right Trigger';
      }
    }
    if (keyCode === ((19 + ControllerHandler.DPAD_KEY_OFFSET) | 0)) {
      return Input_Keys.toString(19);
    } else if (keyCode === ((20 + ControllerHandler.DPAD_KEY_OFFSET) | 0)) {
      return Input_Keys.toString(20);
    } else if (keyCode === ((21 + ControllerHandler.DPAD_KEY_OFFSET) | 0)) {
      return Input_Keys.toString(21);
    } else if (keyCode === ((22 + ControllerHandler.DPAD_KEY_OFFSET) | 0)) {
      return Input_Keys.toString(22);
    }
    return null;
  }
  static $clinit() {
    ControllerHandler.lastUsedType = ControllerHandler$ControllerType.OTHER;
    ControllerHandler.controllerActive = false;
    ControllerHandler.initialized = false;
    ControllerHandler.failedInit = false;
    ControllerHandler.leftStickPosition = new PointF()._PointF$();
    ControllerHandler.rightStickPosition = new PointF()._PointF$();
    ControllerHandler.controllerPointerActive_ = false;
    ControllerHandler.DPAD_KEY_OFFSET = 1000;
  }
}

export class ControllerHandler$ControllerType extends JEnum {
  static XBOX: ControllerHandler$ControllerType = null;
  static PLAYSTATION: ControllerHandler$ControllerType = null;
  static NINTENDO: ControllerHandler$ControllerType = null;
  static OTHER: ControllerHandler$ControllerType = null;
  static $VALUES: ControllerHandler$ControllerType[] = null;
  _ControllerHandler$ControllerType($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): ControllerHandler$ControllerType[] { return ControllerHandler$ControllerType.$VALUES.slice(); }
  static valueOf(name: string): ControllerHandler$ControllerType { return $J.enumValueOf(ControllerHandler$ControllerType, name); }
  static $clinit() {
    ControllerHandler$ControllerType.XBOX = new ControllerHandler$ControllerType()._ControllerHandler$ControllerType('XBOX', 0);
    ControllerHandler$ControllerType.PLAYSTATION = new ControllerHandler$ControllerType()._ControllerHandler$ControllerType('PLAYSTATION', 1);
    ControllerHandler$ControllerType.NINTENDO = new ControllerHandler$ControllerType()._ControllerHandler$ControllerType('NINTENDO', 2);
    ControllerHandler$ControllerType.OTHER = new ControllerHandler$ControllerType()._ControllerHandler$ControllerType('OTHER', 3);
    ControllerHandler$ControllerType.$VALUES = [ControllerHandler$ControllerType.XBOX, ControllerHandler$ControllerType.PLAYSTATION, ControllerHandler$ControllerType.NINTENDO, ControllerHandler$ControllerType.OTHER];
  }
}

$J.define(ControllerHandler, 'com.watabou.input.ControllerHandler', { kind: 'class', ifaces: ['com.badlogic.gdx.controllers.ControllerListener'], sup: 'java.lang.Object', ctors: { '': '_ControllerHandler' }, clinit: true, lazy: ['lastUsedType', 'controllerActive', 'initialized', 'failedInit', 'leftStickPosition', 'rightStickPosition', 'controllerPointerActive_', 'controllerPointerPos', 'DPAD_KEY_OFFSET'] });
$J.define(ControllerHandler$ControllerType, 'com.watabou.input.ControllerHandler$ControllerType', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_ControllerHandler$ControllerType' }, clinit: true, lazy: ['$VALUES', 'XBOX', 'PLAYSTATION', 'NINTENDO', 'OTHER'] });
$J.module(() => {
  KeyEvent = $J.load('com.watabou.input.KeyEvent');
  PointerEvent = $J.load('com.watabou.input.PointerEvent');
  PointerEvent$Type = $J.load('com.watabou.input.PointerEvent$Type');
  Game = $J.load('com.watabou.noosa.Game');
  Cursor = $J.load('com.watabou.noosa.ui.Cursor');
  PointF = $J.load('com.watabou.utils.PointF');
});
