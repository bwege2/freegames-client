// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/ExportData.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { FreeColObject } from './FreeColObject.ts';

/**
 * Objects of this class hold the export data for a particular type of
 * goods.
 */
export class ExportData extends FreeColObject {
  static readonly TAG: string = 'exportData';
  static readonly HIGH_LEVEL_DEFAULT: number = 90;
  static readonly LOW_LEVEL_DEFAULT: number = 10;
  static readonly EXPORT_LEVEL_DEFAULT: number = 50;
  /**
   * The high water mark for the goods type.
   */
  highLevel: number = 0;
  /**
   * The low water mark for the goods type.
   */
  lowLevel: number = 0;
  /**
   * The amount of goods to import to, do not import when this is present.
   */
  importLevel: number = 0;
  /**
   * The amount of goods to retain, goods beyond this amount are exported.
   */
  exportLevel: number = 0;
  /**
   * Whether to export or not.
   */
  exported: boolean = false;
  static readonly EXPORTED_TAG: string = 'exported';
  static readonly EXPORT_LEVEL_TAG: string = 'exportLevel';
  static readonly IMPORT_LEVEL_TAG: string = 'importLevel';
  static readonly HIGH_LEVEL_TAG: string = 'highLevel';
  static readonly LOW_LEVEL_TAG: string = 'lowLevel';
  $init_ExportData() {
    this.highLevel = ExportData.HIGH_LEVEL_DEFAULT;
    this.lowLevel = ExportData.LOW_LEVEL_DEFAULT;
    this.importLevel = -1;
    this.exportLevel = ExportData.EXPORT_LEVEL_DEFAULT;
    this.exported = false;
  }
  /**
   * Trivial constructor for Game.newInstance.
   */
  _ExportData$(): this {
    this._FreeColObject();
    this.$init_ExportData();
    return this;
  }
  /**
   * Creates a new {@code ExportData} instance with default settings.
   *
   * @param goodsType The {@code GoodsType} this data refers to.
   * @param importLevel The import level to use.
   */
  _ExportData$GoodsType$int(goodsType: GoodsType, importLevel: number): this {
    this._FreeColObject();
    this.$init_ExportData();
    this.setId(goodsType.getId());
    this.setImportLevel(importLevel);
    return this;
  }
  /**
   * Create a new {@code ExportData} by reading a stream.
   *
   * @param xr The {@code FreeColXMLReader} to read.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  _ExportData$FreeColXMLReader(xr: FreeColXMLReader): this {
    this._FreeColObject();
    this.$init_ExportData();
    this.readFromXML(xr);
    return this;
  }
  /**
   * Get the high water mark for this data.
   *
   * @return The high water mark.
   */
  getHighLevel(): number {
    return this.highLevel;
  }
  /**
   * Set the high water mark for this data.
   *
   * @param newHighLevel The new high water mark value.
   * @return This export data.
   */
  setHighLevel(newHighLevel: number): ExportData {
    this.highLevel = newHighLevel;
    return this;
  }
  /**
   * Get the low water mark for this data.
   *
   * @return The low water mark.
   */
  getLowLevel(): number {
    return this.lowLevel;
  }
  /**
   * Set the low water mark for this data.
   *
   * @param newLowLevel The new low water mark value.
   * @return This export data.
   */
  setLowLevel(newLowLevel: number): ExportData {
    this.lowLevel = newLowLevel;
    return this;
  }
  /**
   * Get the import level.
   *
   * @return The import level.
   */
  getImportLevel(): number {
    return this.importLevel;
  }
  /**
   * Get the effective import level given the warehouse capacity to default
   * to when the actual import level is invalid.
   *
   * @param capacity The warehouse capacity.
   * @return The effective import level.
   */
  getEffectiveImportLevel(capacity: number): number {
    return (this.importLevel >= 0) ? this.importLevel : capacity;
  }
  /**
   * Set the import level.
   *
   * @param newImportLevel The new import level value.
   * @return This export data.
   */
  setImportLevel(newImportLevel: number): ExportData {
    this.importLevel = newImportLevel;
    return this;
  }
  /**
   * Get the export level.
   *
   * @return The export level.
   */
  getExportLevel(): number {
    return this.exportLevel;
  }
  /**
   * Set the export level.
   *
   * @param newExportLevel The new export level value.
   * @return This export data.
   */
  setExportLevel(newExportLevel: number): ExportData {
    this.exportLevel = newExportLevel;
    return this;
  }
  /**
   * Can the goods type of this export data to be exported?
   *
   * @return True if this goods type is to be exported.
   */
  getExported(): boolean {
    return this.exported;
  }
  /**
   * Set export status of the goods type of this export data.
   *
   * @param newExport The new export status.
   */
  setExported(newExport: boolean): void {
    this.exported = newExport;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(ExportData));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.highLevel = o.getHighLevel();
    this.lowLevel = o.getLowLevel();
    this.importLevel = o.getImportLevel();
    this.exportLevel = o.getExportLevel();
    this.exported = o.getExported();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$boolean(ExportData.EXPORTED_TAG, this.exported);
    xw.writeAttribute$String$int(ExportData.HIGH_LEVEL_TAG, this.highLevel);
    xw.writeAttribute$String$int(ExportData.LOW_LEVEL_TAG, this.lowLevel);
    xw.writeAttribute$String$int(ExportData.IMPORT_LEVEL_TAG, this.importLevel);
    xw.writeAttribute$String$int(ExportData.EXPORT_LEVEL_TAG, this.exportLevel);
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.exported = xr.getAttribute$String$boolean(ExportData.EXPORTED_TAG, false);
    this.highLevel = xr.getAttribute$String$int(ExportData.HIGH_LEVEL_TAG, ExportData.HIGH_LEVEL_DEFAULT);
    this.lowLevel = xr.getAttribute$String$int(ExportData.LOW_LEVEL_TAG, ExportData.LOW_LEVEL_DEFAULT);
    this.importLevel = xr.getAttribute$String$int(ExportData.IMPORT_LEVEL_TAG, -1);
    this.exportLevel = xr.getAttribute$String$int(ExportData.EXPORT_LEVEL_TAG, ExportData.EXPORT_LEVEL_DEFAULT);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return ExportData.TAG;
  }
}

$J.define(ExportData, 'net.sf.freecol.common.model.ExportData', { kind: 'class', sup: 'net.sf.freecol.common.model.FreeColObject', ctors: { 'net.sf.freecol.common.io.FreeColXMLReader': '_ExportData$FreeColXMLReader', 'net.sf.freecol.common.model.GoodsType,int': '_ExportData$GoodsType$int', '': '_ExportData$' }, returns: { 'getXMLTagName': 'java.lang.String', 'getExported': 'boolean', 'getExportLevel': 'int', 'getImportLevel': 'int', 'getLowLevel': 'int', 'getHighLevel': 'int' } });
