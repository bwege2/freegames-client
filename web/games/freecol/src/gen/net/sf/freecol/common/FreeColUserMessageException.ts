// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/FreeColUserMessageException.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Objects, RuntimeException } from '../../../../../jre/index.ts';

let Messages;

/**
 * A translatable exception to be shown to the user.
 */
export class FreeColUserMessageException extends RuntimeException {
  stringTemplate: StringTemplate = null;
  /**
   * Build a new FreeCol specific exception with the given message.
   *
   * @param message The message for this exception.
   */
  _FreeColUserMessageException$StringTemplate(stringTemplate: StringTemplate): this {
    this._RuntimeException(Messages.message$StringTemplate(Objects.requireNonNull(stringTemplate)));
    this.stringTemplate = stringTemplate;
    return this;
  }
  /**
   * Build a new FreeCol specific exception with the given message.
   *
   * @param stringTemplate The message for this exception.
   * @param throwable The {@code Throwable} cause for the exception.
   */
  _FreeColUserMessageException$StringTemplate$Throwable(stringTemplate: StringTemplate, throwable: Throwable): this {
    this._RuntimeException(Messages.message$StringTemplate(Objects.requireNonNull(stringTemplate)), throwable);
    this.stringTemplate = stringTemplate;
    return this;
  }
  /**
   * Gets the <code>StringTemplate</code> for displaying the exception to the user.
   * @return The <code>StringTemplate</code>.
   */
  getStringTemplate(): StringTemplate {
    return this.stringTemplate;
  }
}

$J.define(FreeColUserMessageException, 'net.sf.freecol.common.FreeColUserMessageException', { kind: 'class', sup: 'java.lang.RuntimeException', ctors: { 'net.sf.freecol.common.model.StringTemplate,java.lang.Throwable': '_FreeColUserMessageException$StringTemplate$Throwable', 'net.sf.freecol.common.model.StringTemplate': '_FreeColUserMessageException$StringTemplate' }, returns: { 'getStringTemplate': 'net.sf.freecol.common.model.StringTemplate' } });
$J.module(() => {
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
});
