// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/noosa/PointerArea.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../jre/index.ts';
import { Visual } from './Visual.ts';

let PointerEvent, PointerEvent$Type;

export class PointerArea extends Visual {
  target: Visual = null;
  curEvent: PointerEvent = null;
  hovered: boolean = false;
  blockLevel: number = 0;
  static readonly ALWAYS_BLOCK: number = 0;
  static readonly BLOCK_WHEN_ACTIVE: number = 1;
  static readonly NEVER_BLOCK: number = 2;
  $init_PointerArea() {
    this.curEvent = null;
    this.hovered = false;
    this.blockLevel = PointerArea.BLOCK_WHEN_ACTIVE;
  }
  _PointerArea$Visual(target: Visual): this {
    this._Visual(0, 0, 0, 0);
    this.$init_PointerArea();
    this.target = target;
    PointerEvent.addPointerListener(this);
    return this;
  }
  _PointerArea$float$float$float$float(x: number, y: number, width: number, height: number): this {
    this._Visual(x, y, width, height);
    this.$init_PointerArea();
    this.target = this;
    this.visible_ = false;
    PointerEvent.addPointerListener(this);
    return this;
  }
  onSignal(event: PointerEvent): boolean {
    let hit = event != null && this.target.overlapsScreenPoint($J.d2i(event.current.x), $J.d2i(event.current.y));
    if (!this.isActive()) {
      return (hit && this.blockLevel === PointerArea.ALWAYS_BLOCK);
    }
    if (hit) {
      let returnValue = (event.type_ === PointerEvent$Type.DOWN || event === this.curEvent);
      if (event.type_ === PointerEvent$Type.DOWN) {
        if (this.curEvent == null) {
          this.curEvent = event;
        }
        this.onPointerDown(event);
      } else if (event.type_ === PointerEvent$Type.UP) {
        this.onPointerUp(event);
        if (this.curEvent === event) {
          this.curEvent = null;
          this.onClick(event);
        }
      } else if (event.type_ === PointerEvent$Type.CANCEL) {
        this.onPointerUp(event);
        if (this.curEvent === event) {
          this.curEvent = null;
        }
      } else if (event.type_ === PointerEvent$Type.HOVER) {
        if (event.handled && this.hovered) {
          this.hovered = false;
          this.onHoverEnd(event);
        } else if (!event.handled && !this.hovered) {
          this.hovered = true;
          this.onHoverStart(event);
        }
        event.handle();
      }
      return returnValue && this.blockLevel !== PointerArea.NEVER_BLOCK;
    } else {
      if (event == null && this.curEvent != null) {
        this.onDrag(this.curEvent);
      } else if (this.curEvent != null && (event.type_ === PointerEvent$Type.UP || event.type_ === PointerEvent$Type.CANCEL)) {
        this.onPointerUp(event);
        this.curEvent = null;
      } else if (event != null && event.type_ === PointerEvent$Type.HOVER && this.hovered) {
        this.hovered = false;
        this.onHoverEnd(event);
      }
      return false;
    }
  }
  onPointerDown(event: PointerEvent): void {
  }
  onPointerUp(event: PointerEvent): void {
  }
  onClick(event: PointerEvent): void {
  }
  onDrag(event: PointerEvent): void {
  }
  onHoverStart(event: PointerEvent): void {
  }
  onHoverEnd(event: PointerEvent): void {
  }
  reset(): void {
    this.curEvent = null;
  }
  givePointerPriority(): void {
    PointerEvent.removePointerListener(this);
    PointerEvent.addPointerListener(this);
  }
  destroy(): void {
    PointerEvent.removePointerListener(this);
    super.destroy();
  }
}

$J.define(PointerArea, 'com.watabou.noosa.PointerArea', { kind: 'class', ifaces: ['com.watabou.utils.Signal$Listener'], sup: 'com.watabou.noosa.Visual', ctors: { 'float,float,float,float': '_PointerArea$float$float$float$float', 'com.watabou.noosa.Visual': '_PointerArea$Visual' } });
$J.module(() => {
  PointerEvent = $J.load('com.watabou.input.PointerEvent');
  PointerEvent$Type = $J.load('com.watabou.input.PointerEvent$Type');
});
