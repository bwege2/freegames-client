// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/logging/DefaultHandler.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Handler, IOException, JObject, JString, Level, StringBuilder } from '../../../../../../jre/index.ts';

let FreeCol, FreeColException, FreeColDebugger, TextFormatter, OSUtils;

/**
 * The default handler for FreeCol's log records. It currently only
 * logs to a file in the format offered by TextFormatter.
 */
export class DefaultHandler extends Handler {
  /**
   * Lock for the writer.
   */
  writerLock: any = null;
  /**
   * A writer to write log records with.
   */
  writer: Writer = null;
  /**
   * Flag to enable console logging.
   */
  consoleLogging: boolean = false;
  /**
   * The constructor to use.
   *
   * @param consoleLogging The flag to log to the console as well.
   * @param writer The {@code Writer} to use for logging.
   */
  _DefaultHandler(consoleLogging: boolean, writer: Writer): this {
    this._Handler();
    this.writerLock = new JObject();
    this.writer = null;
    this.consoleLogging = consoleLogging;
    this.writer = writer;
    this.setFormatter(new TextFormatter()._TextFormatter());
    try {
      let sb = new StringBuilder(512);
      sb.append('FreeCol game version: ').append(FreeCol.getRevision()).append('\nFreeCol protocol version: ').append(FreeCol.getFreeColProtocolVersion()).append('\n\nJava vendor: ').append($J.system_getProperty('java.vendor')).append('\nJava version: ').append($J.system_getProperty('java.version')).append('\nJava WM name: ').append($J.system_getProperty('java.vm.name')).append('\nJava WM vendor: ').append($J.system_getProperty('java.vm.vendor')).append('\nJava WM version: ').append($J.system_getProperty('java.vm.version')).append('\n\nOS name: ').append(OSUtils.getOperatingSystem()).append('\nOS architecture: ').append($J.system_getProperty('os.arch')).append('\nOS version: ').append($J.system_getProperty('os.version')).append('\n\n');
      {
        this.writer.write(sb.toString());
      }
    } catch ($e0) {
      if ($J.isa($e0, IOException)) {
        let ioe = $J.exc($e0);
        ioe.printStackTrace($J.err);
      } else {
        throw $e0;
      }
    }
    return this;
  }
  /**
   * Closes this handler so that it will stop handling log records.
   */
  close(): void {
    {
      if (this.writer != null) {
        try {
          this.writer.close();
          this.writer = null;
        } catch ($e1) {
          if ($J.isa($e1, IOException)) {
            let ioe = $J.exc($e1);
            ioe.printStackTrace($J.err);
          } else {
            throw $e1;
          }
        }
      }
    }
  }
  /**
   * Flushes the data that this handler has logged.
   */
  flush(): void {
    {
      if (this.writer != null) {
        try {
          this.writer.flush();
        } catch ($e2) {
          if ($J.isa($e2, IOException)) {
            let ioe = $J.exc($e2);
            ioe.printStackTrace($J.err);
          } else {
            throw $e2;
          }
        }
      }
    }
  }
  /**
   * Publishes the given LogRecord by writing its data to a file using a
   * TextFormatter.
   *
   * @param record The {@code LogRecord} to publish.
   */
  publish(record: LogRecord): void {
    if (record.getLevel().intValue() < this.getLevel().intValue() && record.getThrown() == null) {
      return;
    }
    let str = this.getFormatter().format(record);
    if (this.consoleLogging && record.getLevel().intValue() >= Level.WARNING.intValue()) {
      $J.err.println(str);
    }
    {
      if (this.writer != null) {
        try {
          this.writer.write(str, 0, str.length);
          this.flush();
        } catch ($e3) {
          if ($J.isa($e3, IOException)) {
            let ioe = $J.exc($e3);
            $J.err.println('Failed to write log record: ' + str);
            ioe.printStackTrace($J.err);
          } else {
            throw $e3;
          }
        }
      }
    }
    let t = record.getThrown();
    if (t != null && !(t instanceof FreeColException && (t).debugAllowed())) {
      FreeColDebugger.handleCrash();
    }
  }
}

$J.define(DefaultHandler, 'net.sf.freecol.common.logging.DefaultHandler', { kind: 'class', sup: 'java.util.logging.Handler', ctors: { 'boolean,java.io.Writer': '_DefaultHandler' } });
$J.module(() => {
  FreeCol = $J.load('net.sf.freecol.FreeCol');
  FreeColException = $J.load('net.sf.freecol.common.FreeColException');
  FreeColDebugger = $J.load('net.sf.freecol.common.debug.FreeColDebugger');
  TextFormatter = $J.load('net.sf.freecol.common.logging.TextFormatter');
  OSUtils = $J.load('net.sf.freecol.common.util.OSUtils');
});
