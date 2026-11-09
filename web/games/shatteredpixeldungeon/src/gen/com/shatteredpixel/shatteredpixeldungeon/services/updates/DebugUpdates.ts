// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/services/updates/DebugUpdates.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { UpdateService } from './UpdateService.ts';

let AvailableUpdateData, Game;

export class DebugUpdates extends UpdateService {
  static debugUpdateInfo: AvailableUpdateData = null;
  _DebugUpdates(): this {
    this._UpdateService();
    return this;
  }
  supportsUpdatePrompts(): boolean {
    return false;
  }
  supportsBetaChannel(): boolean {
    return true;
  }
  checkForUpdate(useMetered: boolean, includeBetas: boolean, callback: UpdateService$UpdateResultCallback): void {
    if (!useMetered && !Game.platform.connectedToUnmeteredNetwork()) {
      callback.onConnectionFailed();
      return;
    }
    DebugUpdates.debugUpdateInfo = new AvailableUpdateData()._AvailableUpdateData();
    DebugUpdates.debugUpdateInfo.versionCode = (Game.versionCode + 1) | 0;
    DebugUpdates.debugUpdateInfo.URL = 'http://www.google.com';
    callback.onUpdateAvailable(DebugUpdates.debugUpdateInfo);
  }
  initializeUpdate(update: AvailableUpdateData): void {
    Game.platform.openURI(update.URL);
  }
  supportsReviews(): boolean {
    return false;
  }
  initializeReview(callback: UpdateService$ReviewResultCallback): void {
    callback.onComplete();
  }
  openReviewURI(): void {
    Game.platform.openURI('https://www.google.com/');
  }
}

$J.define(DebugUpdates, 'com.shatteredpixel.shatteredpixeldungeon.services.updates.DebugUpdates', { kind: 'class', sup: 'com.shatteredpixel.shatteredpixeldungeon.services.updates.UpdateService', ctors: { '': '_DebugUpdates' } });
$J.module(() => {
  AvailableUpdateData = $J.load('com.shatteredpixel.shatteredpixeldungeon.services.updates.AvailableUpdateData');
  Game = $J.load('com.watabou.noosa.Game');
});
