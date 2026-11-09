// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/messages/Messages.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Arrays, DecimalFormat, DecimalFormatSymbols, Exception, Gdx, HashMap, HashSet, I18NBundle, IllegalFormatException, JObject, JString, Locale } from '../../../../../jre/index.ts';

let Assets$Messages, SPDSettings, Languages, Game;

export class Messages extends JObject {
  static bundles: ArrayList<I18NBundle> = null;
  static lang_: Languages = null;
  static locale_: Locale = null;
  static readonly NO_TEXT_FOUND: string = '!!!NO TEXT FOUND!!!';
  /**
   * Setup Methods
   */
  static prop_files: string[] = null;
  static formatters: HashMap<string, DecimalFormat> = null;
  static noCaps: HashSet<string> = null;
  _Messages(): this {
    return this;
  }
  static lang(): Languages {
    return Messages.lang_;
  }
  static locale(): Locale {
    return Messages.locale_;
  }
  static setup(lang: Languages): void {
    I18NBundle.setExceptionOnMissingKey(false);
    Messages.lang_ = lang;
    let bundleLocal: Locale;
    if (lang === Languages.ENGLISH) {
      Messages.locale_ = Locale.ENGLISH;
      bundleLocal = Locale.ROOT;
    } else {
      Messages.locale_ = new Locale(lang.code());
      bundleLocal = Messages.locale_;
    }
    Messages.formatters.clear();
    Messages.bundles = new ArrayList();
    for (let file of Messages.prop_files) {
      if ($J.equals(bundleLocal.getLanguage(), 'id')) {
        Messages.bundles.add(I18NBundle.createBundle(Gdx.files.internal(file + '_in'), bundleLocal));
      } else {
        Messages.bundles.add(I18NBundle.createBundle(Gdx.files.internal(file), bundleLocal));
      }
    }
  }
  /**
   * Resource grabbing methods
   */
  static get$String$ObjectArr(key: string, args: any[]): string {
    return Messages.get$Class$String$ObjectArr(null, key, args);
  }
  static get$Object$String$ObjectArr(o: any, k: string, args: any[]): string {
    return Messages.get$Class$String$ObjectArr($J.getClass(o), k, args);
  }
  static get$Class$String$ObjectArr(c: JClass, k: string, args: any[]): string {
    let key: string;
    if (c != null) {
      key = JString.replace(c.getName(), 'com.shatteredpixel.shatteredpixeldungeon.', '');
      key += '.' + k;
    } else {
      key = k;
    }
    let value = Messages.getFromBundle(key.toLowerCase());
    if (value != null) {
      if (args.length > 0) {
        return Messages.format(value, args);
      } else {
        return value;
      }
    } else {
      if (c != null && c.getSuperclass() != null) {
        return Messages.get$Class$String$ObjectArr(c.getSuperclass(), k, args);
      } else {
        return Messages.NO_TEXT_FOUND;
      }
    }
  }
  static getFromBundle(key: string): string {
    let result: string;
    for (const $it0 = Messages.bundles.iterator(); $it0.hasNext(); ) {
      let b = $it0.next();
      result = b.get(key);
      if (result.length !== ((key.length + 6) | 0) || !result.includes(key)) {
        return result;
      }
    }
    return null;
  }
  /**
   * String Utility Methods
   */
  static format(format: string, args: any[]): string {
    try {
      return JString.format(Messages.locale(), format, ...args);
    } catch ($e1) {
      if ($J.isa($e1, IllegalFormatException)) {
        let e = $J.exc($e1);
        Game.reportException(new Exception('formatting error for the string: ' + format, e));
        return format;
      } else {
        throw $e1;
      }
    }
  }
  static decimalFormat(format: string, number$: number): string {
    if (!Messages.formatters.containsKey(format)) {
      Messages.formatters.put(format, new DecimalFormat(format, DecimalFormatSymbols.getInstance(Messages.locale())));
    }
    return Messages.formatters.get(format).format(number$);
  }
  static capitalize(str: string): string {
    if (str.length === 0) {
      return str;
    } else {
      return str.substring(0, 1).toUpperCase() + str.substring(1);
    }
  }
  static titleCase(str: string): string {
    if (Messages.lang_ === Languages.ENGLISH) {
      let result = '';
      for (let word of JString.split(str, '(?<=\\p{Zs})')) {
        if (Messages.noCaps.contains(JString.replaceAll(JString.trim(word).toLowerCase(), ':|[0-9]', ''))) {
          result += word;
        } else {
          result += Messages.capitalize(word);
        }
      }
      return Messages.capitalize(result);
    }
    return Messages.capitalize(str);
  }
  static upperCase(str: string): string {
    return str.toUpperCase();
  }
  static lowerCase(str: string): string {
    return str.toLowerCase();
  }
  static $clinit() {
    Messages.prop_files = [Assets$Messages.ACTORS, Assets$Messages.ITEMS, Assets$Messages.JOURNAL, Assets$Messages.LEVELS, Assets$Messages.MISC, Assets$Messages.PLANTS, Assets$Messages.SCENES, Assets$Messages.UI, Assets$Messages.WINDOWS];
    Messages.formatters = new HashMap();
    Messages.setup(SPDSettings.language$());
    Messages.noCaps = new HashSet(Arrays.asList('a', 'an', 'and', 'of', 'by', 'to', 'the', 'x', 'for'));
  }
}

$J.define(Messages, 'com.shatteredpixel.shatteredpixeldungeon.messages.Messages', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Messages' }, meths: { 'get(java.lang.Class,java.lang.String,java.lang.Object[])': 'get$Class$String$ObjectArr', 'get(java.lang.Object,java.lang.String,java.lang.Object[])': 'get$Object$String$ObjectArr', 'get(java.lang.String,java.lang.Object[])': 'get$String$ObjectArr' }, clinit: true, lazy: ['bundles', 'lang_', 'locale_', 'prop_files', 'formatters', 'noCaps'] });
$J.module(() => {
  Assets$Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.Assets$Messages');
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  Languages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Languages');
  Game = $J.load('com.watabou.noosa.Game');
});
