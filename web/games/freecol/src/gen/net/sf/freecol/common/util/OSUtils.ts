// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/util/OSUtils.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, IOException, JObject, JString, Level, Logger, Runtime, URI } from '../../../../../../jre/index.ts';

let Desktop;

/**
 * Class used to deal specifically with the operating system
 */
export class OSUtils extends JObject {
  static logger: Logger = null;
  static SEPARATOR: string = null;
  _OSUtils(): this {
    return this;
  }
  /**
   * What OS are we using?
   *
   * @return The operating system name.
   */
  static getOperatingSystem(): string {
    return $J.system_getProperty('os.name');
  }
  /**
   * Does the OS look like Mac OS X?
   *
   * @return True if Mac OS X appears to be present.
   */
  static onMacOSX(): boolean {
    return $J.equals('Mac OS X', OSUtils.getOperatingSystem());
  }
  /**
   * Does the OS look like some sort of unix?
   *
   * @return True we hope.
   */
  static onUnix(): boolean {
    return $J.equals('/', OSUtils.SEPARATOR);
  }
  /**
   * Does the OS look like some sort of Windows?
   *
   * @return True if Windows appears to be present.
   */
  static onWindows(): boolean {
    return OSUtils.getOperatingSystem().startsWith('Windows');
  }
  /**
   * Launches the web browser based on a given operating system
   *
   * @param url The URL to launch
   */
  static launchBrowser(url: string): void {
    try {
      let uri = URI.create(url);
      Desktop.getDesktop().browse(uri);
    } catch ($e0) {
      if ($J.isa($e0, IOException)) {
        let e = $J.exc($e0);
        OSUtils.logger.log(Level.FINEST, 'Web browser failed to launch via Desktop Class.', e);
        let browser = OSUtils.getBrowserExecString(url);
        try {
          Runtime.getRuntime().exec(browser);
        } catch ($e1) {
          if ($J.isa($e1, IOException)) {
            let re = $J.exc($e1);
            OSUtils.logger.log(Level.FINEST, 'Web browser failed to launch via Runtime Class.', re);
          } else {
            throw $e1;
          }
        }
      } else {
        throw $e0;
      }
    }
  }
  /**
   * What should we run to launch a browser?
   *
   * @param url The URL to launch
   * @return An OS-dependent array of commands to exec a browser.
   *
   * @see #launchBrowser(String)
   */
  static getBrowserExecString(url: string): string[] {
    if (OSUtils.onMacOSX()) {
      return ['open', '-a', 'Safari', url];
    } else if (OSUtils.onUnix()) {
      return ['xdg-open', url];
    } else if (OSUtils.onWindows()) {
      return ['rundll32.exe', 'url.dll,FileProtocolHandler', url];
    } else {
      return ['firefox', url];
    }
  }
  static $clinit() {
    OSUtils.logger = Logger.getLogger($J.cls(OSUtils).getName());
    OSUtils.SEPARATOR = $J.system_getProperty('file.separator');
  }
}

$J.define(OSUtils, 'net.sf.freecol.common.util.OSUtils', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_OSUtils' }, clinit: true, lazy: ['logger', 'SEPARATOR'] });
$J.module(() => {
  Desktop = $J.load('java.awt.Desktop');
});
