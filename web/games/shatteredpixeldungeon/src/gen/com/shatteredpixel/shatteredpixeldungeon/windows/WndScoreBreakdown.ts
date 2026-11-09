// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/windows/WndScoreBreakdown.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, NumberFormat } from '../../../../../jre/index.ts';
import { Window } from '../ui/Window.ts';

let Dungeon, ShatteredPixelDungeon, Statistics, Messages, PixelScene, Icons, IconTitle;

export class WndScoreBreakdown extends Window {
  static readonly WIDTH: number = 115;
  GAP: number = 0;
  _WndScoreBreakdown(): this {
    this._Window$();
    this.GAP = 4;
    let title = new IconTitle()._IconTitle$Image$String(Icons.get$Icons(Icons.INFO), Messages.get$Object$String$ObjectArr(this, 'title', []));
    title.setRect(0, 0, Math.fround(WndScoreBreakdown.WIDTH), 16);
    this.add$Gizmo(title);
    let pos = Math.fround(title.bottom() + 2);
    let num = NumberFormat.getInstance(Messages.locale());
    if (Dungeon.initialVersion > ShatteredPixelDungeon.v1_2_3) {
      pos = this.statSlot(this, Messages.get$Object$String$ObjectArr(this, 'progress_title', []), num.format(BigInt(Statistics.progressScore)), pos, Statistics.progressScore >= 50000);
      pos = this.addInfo(this, Messages.get$Object$String$ObjectArr(this, 'progress_desc', []), pos);
      pos = this.statSlot(this, Messages.get$Object$String$ObjectArr(this, 'treasure_title', []), num.format(BigInt(Statistics.treasureScore)), pos, Statistics.treasureScore >= 20000);
      pos = this.addInfo(this, Messages.get$Object$String$ObjectArr(this, 'treasure_desc', []), pos);
      pos = this.statSlot(this, Messages.get$Object$String$ObjectArr(this, 'explore_title', []), num.format(BigInt(Statistics.exploreScore)), pos, Statistics.exploreScore >= 20000);
      pos = this.addInfo(this, Messages.get$Object$String$ObjectArr(this, 'explore_desc', []), pos);
      pos = this.statSlot(this, Messages.get$Object$String$ObjectArr(this, 'bosses_title', []), num.format(BigInt(Statistics.totalBossScore)), pos, Statistics.totalBossScore >= 15000);
      pos = this.addInfo(this, Messages.get$Object$String$ObjectArr(this, 'bosses_desc', []), pos);
      pos = this.statSlot(this, Messages.get$Object$String$ObjectArr(this, 'quests_title', []), num.format(BigInt(Statistics.totalQuestScore)), pos, Statistics.totalQuestScore >= 10000);
      pos = this.addInfo(this, Messages.get$Object$String$ObjectArr(this, 'quests_desc', []), pos);
    } else {
      pos = this.statSlot(this, Messages.get$Object$String$ObjectArr(this, 'progress_title', []), num.format(BigInt(Statistics.progressScore)), pos, Statistics.progressScore >= 78000);
      pos = this.addInfo(this, Messages.get$Object$String$ObjectArr(this, 'progress_desc', []), pos);
      pos = this.statSlot(this, Messages.get$Object$String$ObjectArr(this, 'treasure_title', []), num.format(BigInt(Statistics.treasureScore)), pos, Statistics.treasureScore >= 30000);
      pos = this.addInfo(this, Messages.get$Object$String$ObjectArr(this, 'treasure_desc_old', []), pos);
    }
    if (Statistics.winMultiplier > Math.fround(1)) {
      pos = this.statSlot(this, Messages.get$Object$String$ObjectArr(this, 'win_multiplier', []), Messages.decimalFormat('#.##', Statistics.winMultiplier) + 'x', pos, false);
    }
    if (Statistics.chalMultiplier > Math.fround(1)) {
      pos = this.statSlot(this, Messages.get$Object$String$ObjectArr(this, 'challenge_multiplier', []), Messages.decimalFormat('#.##', Statistics.chalMultiplier) + 'x', pos, false);
    }
    pos = this.statSlot(this, Messages.get$Object$String$ObjectArr(this, 'total', []), num.format(BigInt(Statistics.totalScore)), pos, false);
    if (Dungeon.initialVersion <= ShatteredPixelDungeon.v1_2_3) {
      pos = this.addInfo(this, Messages.get$Object$String$ObjectArr(this, 'old_score_desc', []), pos);
    }
    this.resize(WndScoreBreakdown.WIDTH, $J.d2i(pos));
    return this;
  }
  statSlot(parent: Group, label: string, value: string, pos: number, highlight: boolean): number {
    let txt = PixelScene.renderTextBlock$String$int(label, 7);
    if (highlight) {
      txt.hardlight(Window.TITLE_COLOR);
    }
    txt.setPos(0, pos);
    parent.add$Gizmo(txt);
    txt = PixelScene.renderTextBlock$String$int(value, 7);
    if (highlight) {
      txt.hardlight(Window.TITLE_COLOR);
    }
    txt.setPos(Math.fround(WndScoreBreakdown.WIDTH * Math.fround(0.7)), pos);
    PixelScene.align$Component(txt);
    parent.add$Gizmo(txt);
    return Math.fround(Math.fround(pos + this.GAP) + txt.height());
  }
  addInfo(parent: Group, info: string, pos: number): number {
    let txt = PixelScene.renderTextBlock$String$int(info, 5);
    txt.maxWidth$int(WndScoreBreakdown.WIDTH);
    txt.hardlight(10066329);
    txt.setPos(0, Math.fround(pos - 2));
    parent.add$Gizmo(txt);
    return Math.fround(Math.fround(Math.fround(pos - 2) + this.GAP) + txt.height());
  }
}

$J.define(WndScoreBreakdown, 'com.shatteredpixel.shatteredpixeldungeon.windows.WndScoreBreakdown', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.ui.Window', ctors: { '': '_WndScoreBreakdown' } });
$J.module(() => {
  Dungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.Dungeon');
  ShatteredPixelDungeon = $J.load('com.shatteredpixel.shatteredpixeldungeon.ShatteredPixelDungeon');
  Statistics = $J.load('com.shatteredpixel.shatteredpixeldungeon.Statistics');
  Messages = $J.load('com.shatteredpixel.shatteredpixeldungeon.messages.Messages');
  PixelScene = $J.load('com.shatteredpixel.shatteredpixeldungeon.scenes.PixelScene');
  Icons = $J.load('com.shatteredpixel.shatteredpixeldungeon.ui.Icons');
  IconTitle = $J.load('com.shatteredpixel.shatteredpixeldungeon.windows.IconTitle');
});
