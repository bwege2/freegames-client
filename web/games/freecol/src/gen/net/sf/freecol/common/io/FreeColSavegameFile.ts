// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/io/FreeColSavegameFile.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, NumberFormatException, Properties } from '../../../../../../jre/index.ts';
import { FreeColDataFile } from './FreeColDataFile.ts';

let FreeColXMLReader, CollectionUtils;

/**
 * Represents a FreeCol savegame.
 */
export class FreeColSavegameFile extends FreeColDataFile {
  /**
   * The tag for the version string in the saved game.
   */
  static readonly VERSION_TAG: string = 'version';
  /**
   * The name of the file that contains the actual savegame.
   */
  static readonly SAVEGAME_FILE: string = 'savegame.xml';
  /**
   * The name of a properties file that contains information about
   * the saved game, such as the size of the map, the date and time
   * it was started, and so on.  The map size is used in the
   * {@link MapGeneratorOptionsDialog},
   * for example.
   */
  static readonly SAVEGAME_PROPERTIES: string = 'savegame.properties';
  /**
   * The name of the file that contains the
   * {@link net.sf.freecol.client.ClientOptions} saved with the game.
   */
  static readonly CLIENT_OPTIONS: string = 'client-options.xml';
  /**
   * The name of the image file that contains the map thumbnail,
   * i.e. a view of the game map as seen by the owner of the game
   * when saving. The thumbnail image is used by
   * {@link MapGeneratorOptionsDialog}..
   */
  static readonly THUMBNAIL_FILE: string = 'thumbnail.png';
  /**
   * Static argument list for getVersion.
   */
  static versionList: List<string> = null;
  /**
   * Create a new save game file from a given file.
   *
   * @param file The base {@code File}.
   * @exception IOException if the file can not be read.
   */
  _FreeColSavegameFile(file: File): this {
    this._FreeColDataFile(file);
    return this;
  }
  /**
   * Peek at the attributes in a saved game.
   *
   * @param attributes A list of attribute names to peek at.
   * @return A list of corresponding attribute values, or null on error.
   * @exception IOException if there is a problem reading the attributes.
   * @exception XMLStreamException on stream error.
   */
  peekAttributes(attributes: List<string>): List<string> {
    {
      const xr = this.getSavedGameFreeColXMLReader();
      try {
        xr.nextTag();
        let ret = CollectionUtils.transform$Collection$Predicate$Function(attributes, CollectionUtils.alwaysTrue(), (a) => xr.getAttribute$String$String(a, null));
        return ret;
      } finally {
        if (xr != null) xr.close();
      }
    }
  }
  /**
   * Get the properties in this save game.
   *
   * @return The {@code Properties} found.
   * @exception IOException if there is a problem reading the properties.
   */
  getProperties(): Properties {
    let properties = new Properties();
    {
      const in$ = this.getInputStream(FreeColSavegameFile.SAVEGAME_PROPERTIES);
      try {
        properties.load(in$);
      } finally {
        if (in$ != null) in$.close();
      }
    }
    return properties;
  }
  /**
   * Gets the save game version from this saved game.
   *
   * @return The saved game version, or negative on error.
   * @exception IOException if there is a problem reading the attributes.
   * @exception XMLStreamException on stream error.
   */
  getSavegameVersion(): number {
    let v = this.peekAttributes(FreeColSavegameFile.versionList);
    let ret = -1;
    if (v != null && v.size() === 1) {
      try {
        ret = $J.parseInt(v.get(0));
      } catch ($e0) {
        if ($J.isa($e0, NumberFormatException)) {
          let nfe = $J.exc($e0);
        } else {
          throw $e0;
        }
      }
    }
    return ret;
  }
  /**
   * Gets the input stream to the saved game data.
   *
   * Only still needed by the validator.
   *
   * @return An {@code InputStream} to the save game file within
   *     this data file.
   * @exception IOException if there is a problem opening the input stream.
   */
  getSavegameInputStream(): BufferedInputStream {
    return this.getInputStream(FreeColSavegameFile.SAVEGAME_FILE);
  }
  /**
   * Gets the input stream to the thumbnail file.
   *
   * @return An {@code InputStream} to the thumbnail file within
   *      this data file.
   * @exception IOException if there is a problem opening the input stream.
   */
  getThumbnailInputStream(): BufferedInputStream {
    return this.getInputStream(FreeColSavegameFile.THUMBNAIL_FILE);
  }
  /**
   * Get a reader for the client options data.
   *
   * @return A reader for the file "client-options.xml" within this file.
   * @exception IOException if there is a problem opening the input stream.
   * @exception XMLStreamException if there is a problem creating the reader.
   */
  getClientOptionsFreeColXMLReader(): FreeColXMLReader {
    return new FreeColXMLReader()._FreeColXMLReader$BufferedInputStream(this.getInputStream(FreeColSavegameFile.CLIENT_OPTIONS));
  }
  /**
   * Get a reader for the saved game data.
   *
   * @return A reader for the file "savegame.xml" within this file.
   * @exception IOException if there is a problem opening the input stream.
   * @exception XMLStreamException if there is a problem creating the reader.
   */
  getSavedGameFreeColXMLReader(): FreeColXMLReader {
    return new FreeColXMLReader()._FreeColXMLReader$BufferedInputStream(this.getInputStream(FreeColSavegameFile.SAVEGAME_FILE));
  }
  static $clinit() {
    FreeColSavegameFile.versionList = CollectionUtils.makeUnmodifiableList([FreeColSavegameFile.VERSION_TAG]);
  }
}

$J.define(FreeColSavegameFile, 'net.sf.freecol.common.io.FreeColSavegameFile', { kind: 'class', sup: 'net.sf.freecol.common.io.FreeColDataFile', ctors: { 'java.io.File': '_FreeColSavegameFile' }, returns: { 'getSavedGameFreeColXMLReader': 'net.sf.freecol.common.io.FreeColXMLReader', 'getClientOptionsFreeColXMLReader': 'net.sf.freecol.common.io.FreeColXMLReader', 'getThumbnailInputStream': 'java.io.BufferedInputStream', 'getSavegameInputStream': 'java.io.BufferedInputStream', 'getSavegameVersion': 'int', 'getProperties': 'java.util.Properties' }, clinit: true, lazy: ['versionList'] });
$J.module(() => {
  FreeColXMLReader = $J.load('net.sf.freecol.common.io.FreeColXMLReader');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
