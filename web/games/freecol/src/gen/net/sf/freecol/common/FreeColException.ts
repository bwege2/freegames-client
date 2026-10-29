// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/FreeColException.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Exception } from '../../../../../jre/index.ts';

/**
 * The Exception thrown by the FreeCol application.
 */
export class FreeColException extends Exception {
  /**
   * Should this exception allow debug runs to continue?
   */
  allowDebug: boolean = false;
  $init_FreeColException() {
    this.allowDebug = false;
  }
  /**
   * Build a new FreeCol specific exception with the given message.
   *
   * @param message The message for this exception.
   */
  _FreeColException$String(message: string): this {
    this._Exception(message);
    this.$init_FreeColException();
    return this;
  }
  /**
   * Build a new FreeCol specific exception with the given message.
   *
   * @param message The message for this exception.
   * @param throwable The {@code Throwable} cause for the exception.
   */
  _FreeColException$String$Throwable(message: string, throwable: Throwable): this {
    this._Exception(message, throwable);
    this.$init_FreeColException();
    return this;
  }
  /**
   * Build a new FreeCol specific exception with the given message.
   *
   * @param throwable The {@code Throwable} cause for the exception.
   */
  _FreeColException$Throwable(throwable: Throwable): this {
    this._Exception(throwable);
    this.$init_FreeColException();
    return this;
  }
  /**
   * Make this exception *not* cause debug runs to end.
   *
   * @return This exception.
   */
  preserveDebug(): FreeColException {
    this.allowDebug = true;
    return this;
  }
  /**
   * Get the debug state.
   *
   * @return Whether debug runs should continue following this exception.
   */
  debugAllowed(): boolean {
    return this.allowDebug;
  }
}

$J.define(FreeColException, 'net.sf.freecol.common.FreeColException', { kind: 'class', sup: 'java.lang.Exception', ctors: { 'java.lang.Throwable': '_FreeColException$Throwable', 'java.lang.String,java.lang.Throwable': '_FreeColException$String$Throwable', 'java.lang.String': '_FreeColException$String' } });
