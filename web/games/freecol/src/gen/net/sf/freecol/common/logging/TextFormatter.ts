// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/logging/TextFormatter.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Formatter, JDate, JString, PrintWriter, StringBuilder, StringWriter } from '../../../../../../jre/index.ts';

/**
 * Formats a log record's data into human-readable text.
 */
export class TextFormatter extends Formatter {
  /**
   * The constructor to use.
   */
  _TextFormatter(): this {
    this._Formatter();
    return this;
  }
  /**
   * Formats the given log record's data into human-readable text.
   *
   * @param record The log record whose data needs to be formatted.
   * @return The log record's data as a string.
   */
  format(record: LogRecord): string {
    let result = new StringBuilder();
    result.append(record.getSourceClassName()).append(String.fromCharCode(32 /* ' ' */)).append(record.getSourceMethodName()).append('\n\t').append(record.getLevel().getName()).append(': ').append(JString.replaceAll(record.getMessage(), '\n', '\n\t')).append('\n\t').append($J.str(new JDate(record.getMillis()))).append('\n\tThread: ').append(String(record.getThreadID())).append(String.fromCharCode(10 /* \u000a */));
    if (record.getThrown() != null) {
      let sw = new StringWriter();
      let pw = new PrintWriter(sw);
      pw.println('\tStack trace:');
      record.getThrown().printStackTrace(pw);
      pw.println('----------------------------');
      pw.flush();
      result.append($J.str(sw));
    }
    return result.toString();
  }
}

$J.define(TextFormatter, 'net.sf.freecol.common.logging.TextFormatter', { kind: 'class', sup: 'java.util.logging.Formatter', ctors: { '': '_TextFormatter' } });
