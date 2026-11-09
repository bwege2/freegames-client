// @ts-nocheck
// Colors.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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

let Color, ObjectMap;

/**
 * A general purpose class containing named colors that can be changed at will. For example, the markup language defined by the
 * {@code BitmapFontCache} class uses this class to retrieve colors and the user can define his own colors.
 *
 * @author davebaol
 */
export class Colors extends JObject {
  static map: ObjectMap<string, Color> = null;
  /**
   * Convenience method to lookup a color by {@code name}. The invocation of this method is equivalent to the expression
   * {@code Colors.getColors().get(name)}
   *
   * @param name the name of the color
   * @return the color to which the specified {@code name} is mapped, or {@code null} if there was no mapping for {@code name}
   *         .
   */
  static get(name: string): Color {
    return Colors.map.get$Object(name);
  }
  /**
   * Resets the color map to the predefined colors.
   */
  static reset(): void {
    Colors.map.clear$();
    Colors.map.put('CLEAR', Color.CLEAR);
    Colors.map.put('CLEAR_WHITE', Color.CLEAR_WHITE);
    Colors.map.put('BLACK', Color.BLACK);
    Colors.map.put('WHITE', Color.WHITE);
    Colors.map.put('LIGHT_GRAY', Color.LIGHT_GRAY);
    Colors.map.put('GRAY', Color.GRAY);
    Colors.map.put('DARK_GRAY', Color.DARK_GRAY);
    Colors.map.put('BLUE', Color.BLUE);
    Colors.map.put('NAVY', Color.NAVY);
    Colors.map.put('ROYAL', Color.ROYAL);
    Colors.map.put('SLATE', Color.SLATE);
    Colors.map.put('SKY', Color.SKY);
    Colors.map.put('CYAN', Color.CYAN);
    Colors.map.put('TEAL', Color.TEAL);
    Colors.map.put('GREEN', Color.GREEN);
    Colors.map.put('CHARTREUSE', Color.CHARTREUSE);
    Colors.map.put('LIME', Color.LIME);
    Colors.map.put('FOREST', Color.FOREST);
    Colors.map.put('OLIVE', Color.OLIVE);
    Colors.map.put('YELLOW', Color.YELLOW);
    Colors.map.put('GOLD', Color.GOLD);
    Colors.map.put('GOLDENROD', Color.GOLDENROD);
    Colors.map.put('ORANGE', Color.ORANGE);
    Colors.map.put('BROWN', Color.BROWN);
    Colors.map.put('TAN', Color.TAN);
    Colors.map.put('FIREBRICK', Color.FIREBRICK);
    Colors.map.put('RED', Color.RED);
    Colors.map.put('SCARLET', Color.SCARLET);
    Colors.map.put('CORAL', Color.CORAL);
    Colors.map.put('SALMON', Color.SALMON);
    Colors.map.put('PINK', Color.PINK);
    Colors.map.put('MAGENTA', Color.MAGENTA);
    Colors.map.put('PURPLE', Color.PURPLE);
    Colors.map.put('VIOLET', Color.VIOLET);
    Colors.map.put('MAROON', Color.MAROON);
  }
  static $clinit() {
    Colors.map = new ObjectMap()._ObjectMap$();
    Colors.reset();
  }
}

$J.define(Colors, 'com.badlogic.gdx.graphics.Colors', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Colors' }, clinit: true, lazy: ['map'] });
$J.module(() => {
  Color = $J.load('com.badlogic.gdx.graphics.Color');
  ObjectMap = $J.load('com.badlogic.gdx.utils.ObjectMap');
});
