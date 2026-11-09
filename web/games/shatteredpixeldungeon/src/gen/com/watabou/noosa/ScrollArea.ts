// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/watabou/noosa/ScrollArea.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../jre/index.ts';
import { PointerArea } from './PointerArea.ts';

let ScrollEvent;

export class ScrollArea extends PointerArea {
  scrollListener: Signal$Listener<ScrollEvent> = null;
  $init_ScrollArea() {
    this.scrollListener = new (ScrollArea$1())().$o(this);
  }
  _ScrollArea$Visual(target: Visual): this {
    this._PointerArea$Visual(target);
    this.$init_ScrollArea();
    ScrollEvent.addScrollListener(this.scrollListener);
    return this;
  }
  _ScrollArea$float$float$float$float(x: number, y: number, width: number, height: number): this {
    this._PointerArea$float$float$float$float(x, y, width, height);
    this.$init_ScrollArea();
    ScrollEvent.addScrollListener(this.scrollListener);
    return this;
  }
  onScroll(event: ScrollEvent): void {
  }
  destroy(): void {
    super.destroy();
    ScrollEvent.removeScrollListener(this.scrollListener);
  }
}

let $ScrollArea$1: any = null;
/** An anonymous class (ScrollArea.java:40). */
function ScrollArea$1(): any {
  return $ScrollArea$1 ??= $J.local(class extends JObject {
    onSignal(event: ScrollEvent): boolean {
      let hit = event != null && this.$outer.target.overlapsScreenPoint($J.d2i(event.pos.x), $J.d2i(event.pos.y));
      if (!this.$outer.isActive()) {
        return (hit && this.$outer.blockLevel === PointerArea.ALWAYS_BLOCK);
      }
      if (hit) {
        this.$outer.onScroll(event);
        return true;
      }
      return false;
    }
  }, 'com.watabou.noosa.ScrollArea$1', ['com.watabou.utils.Signal$Listener']);
}

$J.define(ScrollArea, 'com.watabou.noosa.ScrollArea', { kind: 'class', sup: 'com.watabou.noosa.PointerArea', ctors: { 'float,float,float,float': '_ScrollArea$float$float$float$float', 'com.watabou.noosa.Visual': '_ScrollArea$Visual' } });
$J.module(() => {
  ScrollEvent = $J.load('com.watabou.input.ScrollEvent');
});
