// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/MemoryManager.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/**
 *  Copyright (C) 2002-2023   The FreeCol Team
 *
 *  This file is part of FreeCol.
 *
 *  FreeCol is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  FreeCol is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with FreeCol.  If not, see <http://www.gnu.org/licenses/>.
 */
import { $J, JObject, Runtime } from '../../../../../jre/index.ts';

/**
 * Calculates how much memory is available to various tasks.
 */
export class MemoryManager extends JObject {
  static readonly MEMORY_LOW_LIMIT: number = 2000000000;
  /**
   * <code>true</code> if the game has been started with low memory allocated.
   */
  static lowMemory: boolean = false;
  _MemoryManager(): this {
    return this;
  }
  /**
   * Checks if high quality graphics is enabled.
   *
   * No image file named "sizeX" (where X is any number) should be loaded if
   * this method returns false.
   *
   * @return <code>true</code> if high quality graphics has been enabled for the map.
   */
  static isHighQualityGraphicsEnabled(): boolean {
    return !MemoryManager.lowMemory;
  }
  /**
   * Checks if smooth scrolling is enabled.
   * @return <code>true</code> if there is sufficient memory for the image buffer
   *      that is needed to support smooth scrolling.
   */
  static isSmoothScrollingEnabled(): boolean {
    return !MemoryManager.lowMemory;
  }
  static $clinit() {
    MemoryManager.lowMemory = Runtime.getRuntime().maxMemory() < MemoryManager.MEMORY_LOW_LIMIT;
  }
}

$J.define(MemoryManager, 'net.sf.freecol.common.MemoryManager', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_MemoryManager' }, clinit: true, lazy: ['lowMemory'] });
