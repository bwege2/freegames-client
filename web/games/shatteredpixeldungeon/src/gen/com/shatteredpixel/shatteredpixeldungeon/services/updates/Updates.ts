// @ts-nocheck
// Shattered Pixel Dungeon 4.0.2 (re/shatteredpixeldungeon/oracle/patch.py) com/shatteredpixel/shatteredpixeldungeon/services/updates/Updates.java, translated to TypeScript by re/shatteredpixeldungeon/tools/j2ts (do not edit).
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
import { $J, JDate, JObject } from '../../../../../../jre/index.ts';

let SPDSettings, UpdateService$ReviewResultCallback, UpdateService$UpdateResultCallback;

export class Updates extends JObject {
  static service: UpdateService = null;
  static lastCheck: JDate = null;
  static readonly CHECK_DELAY: bigint = 3600000n;
  static updateData_: AvailableUpdateData = null;
  _Updates(): this {
    return this;
  }
  static supportsUpdates(): boolean {
    return Updates.service != null;
  }
  static supportsUpdatePrompts(): boolean {
    return Updates.supportsUpdates() && Updates.service.supportsUpdatePrompts();
  }
  static supportsBetaChannel(): boolean {
    return Updates.supportsUpdates() && Updates.service.supportsBetaChannel();
  }
  static checkForUpdate(): void {
    if (!Updates.supportsUpdatePrompts()) {
      return;
    }
    if (Updates.lastCheck != null && (BigInt.asIntN(64, new JDate().getTime() - Updates.lastCheck.getTime())) < Updates.CHECK_DELAY) {
      return;
    }
    if (SPDSettings.betas$()) {
      SPDSettings.betas$boolean(true);
    }
    Updates.service.checkForUpdate(!SPDSettings.WiFi$(), SPDSettings.betas$(), new (Updates$1())()._UpdateService$UpdateResultCallback());
  }
  static launchUpdate(data: AvailableUpdateData): void {
    Updates.service.initializeUpdate(data);
  }
  static updateAvailable(): boolean {
    return Updates.updateData_ != null;
  }
  static updateData(): AvailableUpdateData {
    return Updates.updateData_;
  }
  static clearUpdate(): void {
    Updates.updateData_ = null;
    Updates.lastCheck = null;
  }
  static supportsReviews(): boolean {
    return Updates.supportsUpdates() && Updates.service.supportsReviews();
  }
  static launchReview(callback: Callback): void {
    if (Updates.supportsUpdates()) {
      Updates.service.initializeReview(new (Updates$2())().$c(callback)._UpdateService$ReviewResultCallback());
    } else {
      callback.call();
    }
  }
  static openReviewURI(): void {
    if (Updates.supportsUpdates()) {
      Updates.service.openReviewURI();
    }
  }
  static $clinit() {
    Updates.lastCheck = null;
    Updates.updateData_ = null;
  }
}

let $Updates$1: any = null;
/** An anonymous class (Updates.java:57). */
function Updates$1(): any {
  return $Updates$1 ??= $J.local(class extends UpdateService$UpdateResultCallback {
    onUpdateAvailable(update: AvailableUpdateData): void {
      Updates.lastCheck = new JDate();
      Updates.updateData_ = update;
    }
    onNoUpdateFound(): void {
      Updates.lastCheck = new JDate();
    }
    onConnectionFailed(): void {
      Updates.lastCheck = null;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.services.updates.Updates$1', []);
}

let $Updates$2: any = null;
/** An anonymous class (Updates.java:101). */
function Updates$2(): any {
  return $Updates$2 ??= $J.local(class extends UpdateService$ReviewResultCallback {
    onComplete(): void {
      this.$cv_callback.call();
    }
    $c($callback): this {
      this.$cv_callback = $callback;
      return this;
    }
  }, 'com.shatteredpixel.shatteredpixeldungeon.services.updates.Updates$2', []);
}

$J.define(Updates, 'com.shatteredpixel.shatteredpixeldungeon.services.updates.Updates', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Updates' }, clinit: true, lazy: ['service', 'lastCheck', 'updateData_'] });
$J.module(() => {
  SPDSettings = $J.load('com.shatteredpixel.shatteredpixeldungeon.SPDSettings');
  UpdateService$ReviewResultCallback = $J.load('com.shatteredpixel.shatteredpixeldungeon.services.updates.UpdateService$ReviewResultCallback');
  UpdateService$UpdateResultCallback = $J.load('com.shatteredpixel.shatteredpixeldungeon.services.updates.UpdateService$UpdateResultCallback');
});
