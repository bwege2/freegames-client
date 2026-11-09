// @ts-nocheck
// Align.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

/**
 * Provides bit flag constants for alignment.
 * @author Nathan Sweet
 */
export class Align extends JObject {
  static readonly center: number = 1;
  static readonly top: number = 2;
  static readonly bottom: number = 4;
  static readonly left: number = 8;
  static readonly right: number = 16;
  static readonly topLeft: number = 10;
  static readonly topRight: number = 18;
  static readonly bottomLeft: number = 12;
  static readonly bottomRight: number = 20;
}

$J.define(Align, 'com.badlogic.gdx.utils.Align', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Align' } });
