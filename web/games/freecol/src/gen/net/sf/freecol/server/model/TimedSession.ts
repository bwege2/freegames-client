// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/model/TimedSession.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger, Timer, TimerTask } from '../../../../../../jre/index.ts';
import { Session } from './Session.ts';

/**
 * Root class for timed sessions.
 */
export class TimedSession extends Session {
  static logger: Logger = null;
  /**
   * The timer that controls the session duration.
   */
  timer: Timer = null;
  /**
   * Protected constructor, we only really instantiate specific types
   * of transactions.
   *
   * @param key A unique key to lookup this transaction with.
   * @param timeout The timeout for the session.
   */
  _TimedSession(key: string, timeout: number): this {
    this._Session(key);
    this.timer = new Timer();
    this.timer.schedule(new (TimedSession$1())().$o(this)._TimerTask(), timeout * 1000);
    return this;
  }
  /**
   * Cancel the timer task.
   */
  cancel(): void {
    if (this.timer != null) {
      this.timer.cancel();
      this.timer = null;
    }
  }
  /**
   * {@inheritDoc}
   */
  complete$ChangeSet(cs: ChangeSet): boolean {
    let ret = super.complete$ChangeSet(cs);
    this.cancel();
    return ret;
  }
  static $clinit() {
    TimedSession.logger = Logger.getLogger($J.cls(TimedSession).getName());
  }
}

let $TimedSession$1: any = null;
/** An anonymous class (TimedSession.java:51). */
function TimedSession$1(): any {
  return $TimedSession$1 ??= $J.local(class extends TimerTask {
    run(): void {
      this.$outer.complete$boolean(false);
    }
  }, 'net.sf.freecol.server.model.TimedSession$1', []);
}

$J.define(TimedSession, 'net.sf.freecol.server.model.TimedSession', { kind: 'class', sup: 'net.sf.freecol.server.model.Session', ctors: { 'java.lang.String,long': '_TimedSession' }, meths: { 'complete(net.sf.freecol.common.networking.ChangeSet)': 'complete$ChangeSet', 'complete(boolean)': 'complete$boolean' }, clinit: true, lazy: ['logger'] });
