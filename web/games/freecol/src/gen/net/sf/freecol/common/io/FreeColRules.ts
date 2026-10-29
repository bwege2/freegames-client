// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/io/FreeColRules.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, HashMap, IOException, JObject, Level, Logger } from '../../../../../../jre/index.ts';

let FreeColDirectories, FreeColModFile;

export class FreeColRules extends JObject {
  static logger: Logger = null;
  /**
   * A cache of all the rules.
   */
  static allRules: JMap<string, FreeColModFile> = null;
  _FreeColRules(): this {
    return this;
  }
  /**
   * Get all the standard rule sets.
   *
   * @return A list of {@code FreeColModFile}s holding the rule sets.
   */
  static getRulesList(): List<FreeColModFile> {
    let ret = new ArrayList();
    for (const $it0 = FreeColDirectories.getRulesFileList().iterator(); $it0.hasNext(); ) {
      let f = $it0.next();
      try {
        ret.add(new FreeColModFile()._FreeColModFile(f));
      } catch ($e1) {
        if ($J.isa($e1, IOException)) {
          let ioe = $J.exc($e1);
          FreeColRules.logger.log(Level.WARNING, 'Failed to load TC from: ' + $J.str(f), ioe);
        } else {
          throw $e1;
        }
      }
    }
    return ret;
  }
  /**
   * Require all rules to be loaded.
   */
  static loadRules(): void {
    if (FreeColRules.allRules.isEmpty()) {
      for (const $it2 = FreeColRules.getRulesList().iterator(); $it2.hasNext(); ) {
        let fctf = $it2.next();
        FreeColRules.allRules.put(fctf.getId(), fctf);
      }
    }
  }
  /**
   * Get a rules file by ID.
   *
   * @param id The rules file identifier to look for.
   * @return The {@code FreeColModFile} found, or null if none present.
   */
  static getFreeColRulesFile(id: string): FreeColModFile {
    return FreeColRules.allRules.get(id);
  }
  static $clinit() {
    FreeColRules.logger = Logger.getLogger($J.cls(FreeColRules).getName());
    FreeColRules.allRules = new HashMap();
  }
}

$J.define(FreeColRules, 'net.sf.freecol.common.io.FreeColRules', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_FreeColRules' }, clinit: true, lazy: ['logger', 'allRules'] });
$J.module(() => {
  FreeColDirectories = $J.load('net.sf.freecol.common.io.FreeColDirectories');
  FreeColModFile = $J.load('net.sf.freecol.common.io.FreeColModFile');
});
