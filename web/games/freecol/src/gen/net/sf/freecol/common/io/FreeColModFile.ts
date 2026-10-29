// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/io/FreeColModFile.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, FileNotFoundException, HashMap, IOException, Level, Logger, RuntimeException, XMLStreamException } from '../../../../../../jre/index.ts';
import { FreeColDataFile } from './FreeColDataFile.ts';

let FreeColUserMessageException, Messages, FreeColDirectories, FreeColXMLReader, Specification, StringTemplate;

/**
 * A wrapped for a file containing a FreeCol modification (mod).
 */
export class FreeColModFile extends FreeColDataFile {
  static logger: Logger = null;
  /**
   * A cache of all the mods.
   */
  static allMods: JMap<string, FreeColModFile> = null;
  static readonly SPECIFICATION_FILE: string = 'specification.xml';
  /**
   * The identifier for this mod.
   */
  id_: string = null;
  /**
   * The identifier for the parent of this mod, if any.
   */
  parent: string = null;
  /**
   * Make a FreeColModFile from a File.
   *
   * @param file The {@code File} containing a FreeCol mod.
   * @exception IOException if thrown while opening the file.
   */
  _FreeColModFile(file: File): this {
    this._FreeColDataFile(file);
    this.readModDescriptor();
    return this;
  }
  /**
   * Gets the input stream to the specification.
   *
   * @return An {@code InputStream} to the file
   *     "specification.xml" within this data file, or null if none present.
   * @exception IOException if thrown while opening the input stream.
   */
  getSpecificationInputStream(): InputStream {
    try {
      return this.getInputStream(FreeColModFile.SPECIFICATION_FILE);
    } catch ($e0) {
      if ($J.isa($e0, FileNotFoundException)) {
        let fnfe = $J.exc($e0);
      } else {
        throw $e0;
      }
    }
    return null;
  }
  /**
   * Checks if there is a specification included in this mod.
   *
   * @return {@code true} if the "specification.xml" file exists
   *      and can be opened.
   */
  hasSpecification(): boolean {
    {
      try {
        const is$ = this.getSpecificationInputStream();
        try {
          return is$ != null;
        } finally {
          if (is$ != null) is$.close();
        }
      } catch ($e1) {
        if ($J.isa($e1, IOException)) {
          let e = $J.exc($e1);
          return false;
        } else {
          throw $e1;
        }
      }
    }
  }
  /**
   * Gets the Specification.
   *
   * @return The {@code Specification}, or null if none present.
   * @exception IOException if an error occurs creating a stream to read.
   * @exception XMLStreamException if there is an error reading the stream.
   */
  getSpecification(): Specification {
    {
      try {
        const si = this.getSpecificationInputStream();
        try {
          return (si == null) ? null : new Specification()._Specification$InputStream(si);
        } finally {
          if (si != null) si.close();
        }
      } catch ($e2) {
        if ($J.isa($e2, FreeColUserMessageException)) {
          let e = $J.exc($e2);
          throw e;
        } else if ($J.isa($e2, RuntimeException)) {
          let rte = $J.exc($e2);
          FreeColModFile.logger.log(Level.WARNING, 'Parse error while reading specification ' + this.getId(), rte);
          throw new FreeColUserMessageException()._FreeColUserMessageException$StringTemplate$Throwable(StringTemplate.template$String('error.mod').add$String$String('%id%', this.getId()).add$String$String('%name%', Messages.getName$String('mod.' + this.getId())), rte);
        } else {
          throw $e2;
        }
      }
    }
  }
  /**
   * Gets the input stream to the mod meta file.
   *
   * @return An {@code InputStream} to the file "mod.xml"
   *     within this data file.
   * @exception IOException if thrown while opening the input stream.
   */
  getModDescriptorInputStream(): InputStream {
    return this.getInputStream(FreeColDirectories.MOD_DESCRIPTOR_FILE_NAME);
  }
  /**
   * Reads a file object representing this mod.
   *
   * @exception IOException if thrown while reading the "mod.xml" file.
   */
  readModDescriptor(): void {
    {
      try {
        const xr = new FreeColXMLReader()._FreeColXMLReader$InputStream(this.getModDescriptorInputStream());
        try {
          xr.nextTag();
          this.id_ = xr.readId();
          this.parent = xr.getAttribute$String$String('parent', null);
        } finally {
          if (xr != null) xr.close();
        }
      } catch ($e3) {
        if ($J.isa($e3, XMLStreamException)) {
          let xse = $J.exc($e3);
          throw new IOException(xse);
        } else {
          throw $e3;
        }
      }
    }
  }
  /**
   * Gets the parent of the mod.
   *
   * @return The mod parent name.
   */
  getParent(): string {
    return this.parent;
  }
  /**
   * Get all the standard mods.
   *
   * @return A list of {@code FreeColModFile}s holding the mods.
   */
  static getModsList(): List<FreeColModFile> {
    let ret = new ArrayList();
    for (const $it4 = FreeColDirectories.getModFileList().iterator(); $it4.hasNext(); ) {
      let f = $it4.next();
      try {
        ret.add(new FreeColModFile()._FreeColModFile(f));
      } catch ($e5) {
        if ($J.isa($e5, IOException)) {
          let ioe = $J.exc($e5);
          FreeColModFile.logger.log(Level.WARNING, 'Failed to load mod from: ' + $J.str(f), ioe);
        } else {
          throw $e5;
        }
      }
    }
    return ret;
  }
  /**
   * Gets the object identifier of this mod.
   *
   * @return The object identifier of the mod.
   */
  getId(): string {
    return this.id_;
  }
  /**
   * Require all mods to be loaded.  This must be delayed until
   * the mods directories are defined.
   *
   * User mods are loaded after standard mods to allow user override.
   */
  static loadMods(): void {
    if (FreeColModFile.allMods.isEmpty()) {
      for (const $it6 = FreeColModFile.getModsList().iterator(); $it6.hasNext(); ) {
        let fcmf = $it6.next();
        FreeColModFile.allMods.put(fcmf.getId(), fcmf);
      }
    }
  }
  /**
   * Get a mod by id.
   *
   * @param id The mod file identifier to look for.
   * @return The {@code FreeColModFile} found, or null if none present.
   */
  static getFreeColModFile(id: string): FreeColModFile {
    return FreeColModFile.allMods.get(id);
  }
  static $clinit() {
    FreeColModFile.logger = Logger.getLogger($J.cls(FreeColModFile).getName());
    FreeColModFile.allMods = new HashMap();
  }
}

$J.define(FreeColModFile, 'net.sf.freecol.common.io.FreeColModFile', { kind: 'class', ifaces: ['net.sf.freecol.common.ObjectWithId'], sup: 'net.sf.freecol.common.io.FreeColDataFile', ctors: { 'java.io.File': '_FreeColModFile' }, returns: { 'getId': 'java.lang.String', 'getParent': 'java.lang.String', 'getModDescriptorInputStream': 'java.io.InputStream', 'getSpecification': 'net.sf.freecol.common.model.Specification', 'hasSpecification': 'boolean', 'getSpecificationInputStream': 'java.io.InputStream' }, clinit: true, lazy: ['logger', 'allMods'] });
$J.module(() => {
  FreeColUserMessageException = $J.load('net.sf.freecol.common.FreeColUserMessageException');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  FreeColDirectories = $J.load('net.sf.freecol.common.io.FreeColDirectories');
  FreeColXMLReader = $J.load('net.sf.freecol.common.io.FreeColXMLReader');
  Specification = $J.load('net.sf.freecol.common.model.Specification');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
});
