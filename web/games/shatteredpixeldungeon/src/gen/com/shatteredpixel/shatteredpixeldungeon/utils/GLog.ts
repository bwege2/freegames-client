// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/utils/GLog.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../jre/index.ts';

let Messages, DeviceCompat, Signal;

export class GLog extends JObject {
  static readonly TAG: string = 'GAME';
  static readonly POSITIVE: string = '++ ';
  static readonly NEGATIVE: string = '-- ';
  static readonly WARNING: string = '** ';
  static readonly HIGHLIGHT: string = '@@ ';
  static readonly NEW_LINE: string = '\n';
  static update: Signal<string> = null;
  _GLog(): this {
    return this;
  }
  static newLine(): void {
    GLog.update.dispatch(GLog.NEW_LINE);
  }
  static i(text: string, args: any[]): void {
    if (args.length > 0) {
      text = Messages.format(text, args);
    }
    DeviceCompat.log(GLog.TAG, text);
    GLog.update.dispatch(text);
  }
  static p(text: string, args: any[]): void {
    GLog.i(GLog.POSITIVE + text, args);
  }
  static n(text: string, args: any[]): void {
    GLog.i(GLog.NEGATIVE + text, args);
  }
  static w(text: string, args: any[]): void {
    GLog.i(GLog.WARNING + text, args);
  }
  static h(text: string, args: any[]): void {
    GLog.i(GLog.HIGHLIGHT + text, args);
  }
  static $clinit() {
    GLog.update = new Signal()._Signal$();
  }
}

$J.define(GLog, 'com.shatteredpixel.shatteredpixeldungeon.utils.GLog', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_GLog' }, clinit: true, lazy: ['update'] });
$J.module(() => {
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  DeviceCompat = $J.load('com.watabou.utils.DeviceCompat');
  Signal = $J.load('com.watabou.utils.Signal');
});
