// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/io/FreeColTcFile.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, File, IOException, Logger, RuntimeException } from '../../../../../../jre/index.ts';
import { FreeColModFile } from './FreeColModFile.ts';

let FreeColDirectories, ResourceMapping;

/**
 * A Total Conversion (TC).  Rules are TCs.
 */
export class FreeColTcFile extends FreeColModFile {
  static logger: Logger = null;
  /**
   * Opens the given file for reading.
   *
   * @param file The file to load.
   * @throws IOException if thrown while opening the file.
   */
  _FreeColTcFile(file: File): this {
    this._FreeColModFile(file);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getResourceMapping(): ResourceMapping {
    let result = new ResourceMapping()._ResourceMapping();
    if (this.getParent() != null) {
      let parentTcData = FreeColTcFile.getFreeColTcFile(this.getParent());
      result.addAll(parentTcData.getResourceMapping());
    }
    result.addAll(super.getResourceMapping());
    return result;
  }
  /**
   * Get a TC by id.
   *
   * @param id The TC file identifier to look for.
   * @return The {@code FreeColTcFile} found, or null if none present.
   */
  static getFreeColTcFile(id: string): FreeColTcFile {
    try {
      return new FreeColTcFile()._FreeColTcFile(new File(FreeColDirectories.getDataDirectory(), id));
    } catch ($e0) {
      if ($J.isa($e0, IOException)) {
        let e = $J.exc($e0);
        throw new RuntimeException(e);
      } else {
        throw $e0;
      }
    }
  }
  static $clinit() {
    FreeColTcFile.logger = Logger.getLogger($J.cls(FreeColTcFile).getName());
  }
}

$J.define(FreeColTcFile, 'net.sf.freecol.common.io.FreeColTcFile', { kind: 'class', sup: 'net.sf.freecol.common.io.FreeColModFile', ctors: { 'java.io.File': '_FreeColTcFile' }, returns: { 'getResourceMapping': 'net.sf.freecol.common.resources.ResourceMapping' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  FreeColDirectories = $J.load('net.sf.freecol.common.io.FreeColDirectories');
  ResourceMapping = $J.load('net.sf.freecol.common.resources.ResourceMapping');
});
