// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/FreeColSeed.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/**
 *  Copyright (C) 2002-2022   The FreeCol Team
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
import { $J, JObject, NumberFormatException, SecureRandom } from '../../../../../jre/index.ts';

/**
 * A wrapper for the pseudo-random number generator seed.
 */
export class FreeColSeed extends JObject {
  static readonly DEFAULT_SEED: number = 0;
  /**
   * The seed to use for pseudo-random number generators.
   */
  static freeColSeed: number = 0;
  /**
   * Has a seed been set?
   */
  static seeded: boolean = false;
  _FreeColSeed(): this {
    return this;
  }
  /**
   * Gets the seed for the PRNG.
   *
   * @return The seed.
   */
  static getFreeColSeed(): number {
    return FreeColSeed.freeColSeed;
  }
  /**
   * Has the game been seeded?
   *
   * @return True if a seed has been set.
   */
  static hasFreeColSeed(): boolean {
    return FreeColSeed.seeded;
  }
  /**
   * Generate a new seed.
   */
  static generateFreeColSeed(): void {
    FreeColSeed.freeColSeed = new SecureRandom().nextLong();
  }
  /**
   * Sets the seed for the PRNG.
   *
   * @param arg A string defining the seed.
   * @return True if the seed was set successfully.
   */
  static setFreeColSeed(arg: string): boolean {
    try {
      FreeColSeed.freeColSeed = $J.parseLong(arg);
      FreeColSeed.seeded = true;
      return true;
    } catch ($e0) {
      if ($J.isa($e0, NumberFormatException)) {
        let nfe = $J.exc($e0);
      } else {
        throw $e0;
      }
    }
    return false;
  }
  static $clinit() {
    FreeColSeed.freeColSeed = FreeColSeed.DEFAULT_SEED;
    FreeColSeed.seeded = false;
  }
}

$J.define(FreeColSeed, 'net.sf.freecol.common.FreeColSeed', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_FreeColSeed' }, clinit: true, lazy: ['freeColSeed', 'seeded'] });
