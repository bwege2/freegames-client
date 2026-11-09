// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/input/PointerEvent.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, HashMap, JEnum, JObject } from '../../../../jre/index.ts';

let ControllerHandler, Game, Cursor, PointF, Signal;

export class PointerEvent extends JObject {
  static readonly NONE: number = -1;
  static readonly LEFT: number = 0;
  static readonly RIGHT: number = 1;
  static readonly MIDDLE: number = 2;
  static readonly BACK: number = 3;
  static readonly FORWARD: number = 4;
  start_: PointF = null;
  current: PointF = null;
  id_: number = 0;
  type_: PointerEvent$Type = null;
  button: number = 0;
  handled: boolean = false;
  static pointerSignal: Signal<PointerEvent> = null;
  static pointerEvents: ArrayList<PointerEvent> = null;
  static activePointers: HashMap<number, PointerEvent> = null;
  static lastHoverPos: PointF = null;
  static clearKeyboardThisPress: boolean = false;
  _PointerEvent$int$int$int$Type(x: number, y: number, id: number, type$: PointerEvent$Type): this {
    this._PointerEvent$int$int$int$Type$int(x, y, id, type$, PointerEvent.NONE);
    return this;
  }
  _PointerEvent$int$int$int$Type$int(x: number, y: number, id: number, type$: PointerEvent$Type, button: number): this {
    if (Cursor.isCursorCaptured()) {
      x = $J.idiv(Game.width, 2);
      y = $J.idiv(Game.width, 2);
    }
    this.start_ = this.current = new PointF()._PointF$float$float(Math.fround(x), Math.fround(y));
    this.id_ = id;
    this.type_ = type$;
    this.handled = false;
    this.button = button;
    return this;
  }
  update$PointerEvent(other: PointerEvent): void {
    this.current = other.current;
  }
  update$int$int(x: number, y: number): void {
    this.current.set$float$float(Math.fround(x), Math.fround(y));
  }
  up(): PointerEvent {
    if (this.type_ === PointerEvent$Type.DOWN) {
      this.type_ = PointerEvent$Type.UP;
    }
    return this;
  }
  cancel(): PointerEvent {
    if (this.type_ === PointerEvent$Type.DOWN) {
      this.type_ = PointerEvent$Type.CANCEL;
    }
    return this;
  }
  handle(): PointerEvent {
    this.handled = true;
    return this;
  }
  static addPointerListener(listener: Signal$Listener<PointerEvent>): void {
    PointerEvent.pointerSignal.add(listener);
  }
  static removePointerListener(listener: Signal$Listener<PointerEvent>): void {
    PointerEvent.pointerSignal.remove(listener);
  }
  static clearListeners(): void {
    PointerEvent.pointerSignal.removeAll();
  }
  static currentHoverPos(): PointF {
    if (PointerEvent.lastHoverPos.x === Math.fround(0) && PointerEvent.lastHoverPos.y === Math.fround(0)) {
      PointerEvent.lastHoverPos.x = Math.fround($J.idiv(Game.width, 2));
      PointerEvent.lastHoverPos.y = Math.fround($J.idiv(Game.height, 2));
    }
    return PointerEvent.lastHoverPos.clone();
  }
  static setHoverPos(pos: PointF): void {
    PointerEvent.lastHoverPos.set$PointF(pos);
  }
  static addPointerEvent(event: PointerEvent): void {
    PointerEvent.pointerEvents.add(event);
  }
  static addIfExisting(event: PointerEvent): void {
    if (PointerEvent.activePointers.containsKey(event.id_)) {
      PointerEvent.pointerEvents.add(event);
    }
  }
  static processPointerEvents(): void {
    if (PointerEvent.pointerEvents.isEmpty()) {
      return;
    }
    let hovered = false;
    for (const $it0 = PointerEvent.pointerEvents.iterator(); $it0.hasNext(); ) {
      let p = $it0.next();
      if (p.type_ === PointerEvent$Type.HOVER) {
        PointerEvent.lastHoverPos.set$PointF(p.current);
        PointerEvent.pointerSignal.dispatch(p);
        hovered = true;
      }
    }
    for (const $it1 = PointerEvent.pointerEvents.iterator(); $it1.hasNext(); ) {
      let p = $it1.next();
      if (p.type_ === PointerEvent$Type.HOVER) {
        continue;
      }
      PointerEvent.clearKeyboardThisPress = true;
      if (PointerEvent.activePointers.containsKey(p.id_)) {
        let existing = PointerEvent.activePointers.get(p.id_);
        existing.current = p.current;
        if (existing.type_ === p.type_) {
          PointerEvent.pointerSignal.dispatch(null);
        } else if (p.type_ === PointerEvent$Type.DOWN) {
          PointerEvent.pointerSignal.dispatch(existing);
        } else if (p.type_ === PointerEvent$Type.UP) {
          PointerEvent.activePointers.remove(existing.id_);
          PointerEvent.pointerSignal.dispatch(existing.up());
        } else if (p.type_ === PointerEvent$Type.CANCEL) {
          PointerEvent.activePointers.remove(existing.id_);
          PointerEvent.pointerSignal.dispatch(existing.cancel());
        }
      } else {
        if (p.type_ === PointerEvent$Type.DOWN) {
          PointerEvent.activePointers.put(p.id_, p);
        }
        PointerEvent.pointerSignal.dispatch(p);
      }
      if (PointerEvent.clearKeyboardThisPress) {
        Game.platform.setOnscreenKeyboardVisible(false, false);
      }
    }
    PointerEvent.pointerEvents.clear();
    if (hovered && PointerEvent.activePointers.containsKey(ControllerHandler.CONTROLLER_POINTER_ID)) {
      Game.inputHandler.emulateDrag(ControllerHandler.CONTROLLER_POINTER_ID);
    }
  }
  static $clinit() {
    PointerEvent.pointerSignal = new Signal()._Signal$boolean(true);
    PointerEvent.pointerEvents = new ArrayList();
    PointerEvent.activePointers = new HashMap();
    PointerEvent.lastHoverPos = new PointF()._PointF$();
    PointerEvent.clearKeyboardThisPress = true;
  }
}

export class PointerEvent$Type extends JEnum {
  static DOWN: PointerEvent$Type = null;
  static UP: PointerEvent$Type = null;
  static CANCEL: PointerEvent$Type = null;
  static HOVER: PointerEvent$Type = null;
  static $VALUES: PointerEvent$Type[] = null;
  _PointerEvent$Type($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): PointerEvent$Type[] { return PointerEvent$Type.$VALUES.slice(); }
  static valueOf(name: string): PointerEvent$Type { return $J.enumValueOf(PointerEvent$Type, name); }
  static $clinit() {
    PointerEvent$Type.DOWN = new PointerEvent$Type()._PointerEvent$Type('DOWN', 0);
    PointerEvent$Type.UP = new PointerEvent$Type()._PointerEvent$Type('UP', 1);
    PointerEvent$Type.CANCEL = new PointerEvent$Type()._PointerEvent$Type('CANCEL', 2);
    PointerEvent$Type.HOVER = new PointerEvent$Type()._PointerEvent$Type('HOVER', 3);
    PointerEvent$Type.$VALUES = [PointerEvent$Type.DOWN, PointerEvent$Type.UP, PointerEvent$Type.CANCEL, PointerEvent$Type.HOVER];
  }
}

$J.define(PointerEvent, 'com.watabou.input.PointerEvent', { kind: 'class', sup: 'java.lang.Object', ctors: { 'int,int,int,com.watabou.input.PointerEvent$Type,int': '_PointerEvent$int$int$int$Type$int', 'int,int,int,com.watabou.input.PointerEvent$Type': '_PointerEvent$int$int$int$Type' }, meths: { 'update(int,int)': 'update$int$int', 'update(com.watabou.input.PointerEvent)': 'update$PointerEvent' }, clinit: true, lazy: ['pointerSignal', 'pointerEvents', 'activePointers', 'lastHoverPos', 'clearKeyboardThisPress'] });
$J.define(PointerEvent$Type, 'com.watabou.input.PointerEvent$Type', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_PointerEvent$Type' }, clinit: true, lazy: ['$VALUES', 'DOWN', 'UP', 'CANCEL', 'HOVER'] });
$J.module(() => {
  ControllerHandler = $J.load('com.watabou.input.ControllerHandler');
  Game = $J.load('com.watabou.noosa.Game');
  Cursor = $J.load('com.watabou.noosa.ui.Cursor');
  PointF = $J.load('com.watabou.utils.PointF');
  Signal = $J.load('com.watabou.utils.Signal');
});
