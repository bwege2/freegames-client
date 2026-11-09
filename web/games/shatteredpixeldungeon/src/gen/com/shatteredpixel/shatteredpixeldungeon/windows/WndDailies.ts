// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndDailies.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, JDate, Locale, NumberFormat, SimpleDateFormat, TimeZone } from '../../../../../jre/index.ts';
import { Window } from '../ui/Window.ts';

let Rankings, Messages, PixelScene, IconButton, Icons, ScrollPane, IconTitle, WndRanking, ColorBlock, Game, Component;

export class WndDailies extends Window {
  static readonly WIDTH: number = 115;
  static readonly HEIGHT: number = 144;
  _WndDailies(): this {
    this._Window$();
    this.resize(WndDailies.WIDTH, WndDailies.HEIGHT);
    let pane = new ScrollPane()._ScrollPane(new Component()._Component());
    this.add$Gizmo(pane);
    pane.setRect(0, 0, Math.fround(WndDailies.WIDTH), Math.fround(WndDailies.HEIGHT));
    let content = pane.content();
    let title = new IconTitle()._IconTitle$Image$String(Icons.CALENDAR.get(), Messages.get$Object$String$ObjectArr(this, 'title', []));
    title.imIcon.hardlight$float$float$float(0.5, 1, 2);
    title.setRect(0, 0, Math.fround(WndDailies.WIDTH), 0);
    title.setPos(0, 0);
    content.add$Gizmo(title);
    if (Rankings.INSTANCE.latestDailyReplay != null) {
      let replayInfo = new (WndDailies$1())().$o(this)._IconButton$Image(Icons.get$Icons(Icons.CALENDAR));
      replayInfo.icon$().hardlight$float$float$float(1, 0.5, 2);
      replayInfo.setRect(Math.fround((WndDailies.WIDTH - 16) | 0), 0, 16, 16);
      this.add$Gizmo(replayInfo);
    }
    let top = ($J.d2i(title.bottom()) + 3) | 0;
    let day = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'date', []), 7);
    day.hardlight(Window.TITLE_COLOR);
    day.setPos(0, Math.fround(top));
    content.add$Gizmo(day);
    let score = PixelScene.renderTextBlock$String$int(Messages.get$Object$String$ObjectArr(this, 'score', []), 7);
    score.hardlight(Window.TITLE_COLOR);
    score.setPos(Math.fround(WndDailies.WIDTH - score.width()), Math.fround(top));
    content.add$Gizmo(score);
    top = ($J.d2i(score.bottom()) + 6) | 0;
    let num = NumberFormat.getInstance(Messages.locale());
    let format = new SimpleDateFormat('yyyy-MM-dd', Locale.ROOT);
    format.setTimeZone(TimeZone.getTimeZone('UTC'));
    let date = new JDate();
    let dates = new ArrayList(Rankings.INSTANCE.dailyScoreHistory.keySet());
    Collections.reverse(dates);
    let first = Rankings.INSTANCE.latestDaily != null;
    for (const $it0 = dates.iterator(); $it0.hasNext(); ) {
      let l = $it0.next();
      if (first) {
        top = (top + 2) | 0;
      }
      let sep = new ColorBlock()._ColorBlock(Math.fround(WndDailies.WIDTH), 1, -16777216);
      sep.y = Math.fround((top - 3 - (first ? 2 : 0)) | 0);
      content.add$Gizmo(sep);
      date.setTime(l);
      day = PixelScene.renderTextBlock$String$int(format.format(date), 7);
      day.setPos(0, Math.fround(top));
      content.add$Gizmo(day);
      if (first) {
        let latestInfo = new (WndDailies$2())().$o(this)._IconButton$Image(Icons.INFO.get());
        latestInfo.setRect(Math.fround(day.right() + 2), Math.fround((top - 5) | 0), 16, 16);
        content.add$Gizmo(latestInfo);
      }
      score = PixelScene.renderTextBlock$String$int(num.format(Rankings.INSTANCE.dailyScoreHistory.get(l)), 7);
      score.setPos(Math.fround(WndDailies.WIDTH - score.width()), Math.fround(top));
      content.add$Gizmo(score);
      top = ($J.d2i(day.bottom()) + 6) | 0;
      if (first) {
        top = (top + 2) | 0;
        first = false;
      }
    }
    content.setRect(0, 0, Math.fround(WndDailies.WIDTH), Math.fround(top));
    pane.setRect(0, 0, Math.fround(WndDailies.WIDTH), Math.fround(WndDailies.HEIGHT));
    return this;
  }
}

let $WndDailies$1: any = null;
/** An anonymous class (WndDailies.java:67). */
function WndDailies$1(): any {
  return $WndDailies$1 ??= $J.local(class extends IconButton {
    onClick(): void {
      Game.scene().addToFront(new WndRanking()._WndRanking(Rankings.INSTANCE.latestDailyReplay));
    }
    onPointerUp(): void {
      super.onPointerUp();
      this.icon_.hardlight$float$float$float(1, 0.5, 2);
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndDailies$1', []);
}

let $WndDailies$2: any = null;
/** An anonymous class (WndDailies.java:121). */
function WndDailies$2(): any {
  return $WndDailies$2 ??= $J.local(class extends IconButton {
    onClick(): void {
      Game.scene().addToFront(new WndRanking()._WndRanking(Rankings.INSTANCE.latestDaily));
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndDailies$2', []);
}

$J.define(WndDailies, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndDailies', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { '': '_WndDailies' } });
$J.module(() => {
  Rankings = $J.load('com.shatteredpixel.shatteredpixeldungeon.Rankings');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  IconButton = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.IconButton');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  ScrollPane = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.ScrollPane');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
  WndRanking = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.WndRanking');
  ColorBlock = $J.load('com.watabou.noosa.ColorBlock');
  Game = $J.load('com.watabou.noosa.Game');
  Component = $J.load('com.watabou.noosa.ui.Component');
});
