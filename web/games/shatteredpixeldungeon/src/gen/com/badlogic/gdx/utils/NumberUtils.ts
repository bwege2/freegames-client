// @ts-nocheck
// NumberUtils.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
/*******************************************************************************
 * Copyright 2011 See AUTHORS file.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *   http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ******************************************************************************/
import { $J, JObject } from '../../../../../jre/index.ts';

export class NumberUtils extends JObject {
  static floatToIntBits(value: number): number {
    return $J.Float_floatToIntBits(value);
  }
  static floatToRawIntBits(value: number): number {
    return $J.Float_floatToRawIntBits(value);
  }
  /**
   * Encodes the ABGR int color as a float. The alpha is compressed to use only even numbers between 0-254 to avoid using bits
   * in the NaN range (see {@link Float#intBitsToFloat(int)} javadocs). Rendering which uses colors encoded as floats should
   * expand the 0-254 back to 0-255, else colors cannot be fully opaque.
   */
  static intToFloatColor(value: number): number {
    return $J.Float_intBitsToFloat(value & -16777217);
  }
}

$J.define(NumberUtils, 'com.badlogic.gdx.utils.NumberUtils', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_NumberUtils' } });
