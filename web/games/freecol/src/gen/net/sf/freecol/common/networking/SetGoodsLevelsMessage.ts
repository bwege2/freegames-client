// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/SetGoodsLevelsMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Exception } from '../../../../../../jre/index.ts';
import { ObjectMessage } from './ObjectMessage.ts';

let FreeColXMLReader$ReadScope, Colony, ExportData, Message$MessagePriority;

/**
 * The message sent when setting goods levels.
 */
export class SetGoodsLevelsMessage extends ObjectMessage {
  static readonly TAG: string = 'setGoodsLevels';
  static readonly COLONY_TAG: string = 'colony';
  /**
   * Create a new {@code SetGoodsLevelsMessage} with the
   * supplied colony and data.
   *
   * @param colony The {@code Colony} where the goods leves are set.
   * @param data The new {@code ExportData}.
   */
  _SetGoodsLevelsMessage$Colony$ExportData(colony: Colony, data: ExportData): this {
    this._ObjectMessage$String$StringArr(SetGoodsLevelsMessage.TAG, [SetGoodsLevelsMessage.COLONY_TAG, colony.getId()]);
    this.appendChild(data);
    return this;
  }
  /**
   * Create a new {@code SetGoodsLevelsMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  _SetGoodsLevelsMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._ObjectMessage$String$FreeColXMLReader$StringArr(SetGoodsLevelsMessage.TAG, xr, [SetGoodsLevelsMessage.COLONY_TAG]);
    let rs = xr.replaceScope(FreeColXMLReader$ReadScope.NOINTERN);
    let data = null;
    try {
      while (xr.moreTags()) {
        let tag = xr.getLocalName();
        if ($J.equals(ExportData.TAG, tag)) {
          if (data == null) {
            data = xr.readFreeColObject$Game$Class(game, $J.cls(ExportData));
          } else {
            this.expected(SetGoodsLevelsMessage.TAG, tag);
          }
        } else {
          this.expected(ExportData.TAG, tag);
        }
        xr.expectTag(tag);
      }
      xr.expectTag(SetGoodsLevelsMessage.TAG);
    } finally {
      xr.replaceScope(rs);
    }
    this.appendChild(data);
    return this;
  }
  /**
   * Get the export data.
   *
   * @return The {@code ExportData}.
   */
  getExportData(): ExportData {
    return this.getChild(0, $J.cls(ExportData));
  }
  /**
   * {@inheritDoc}
   */
  currentPlayerMessage(): boolean {
    return true;
  }
  /**
   * {@inheritDoc}
   */
  getPriority(): Message$MessagePriority {
    return Message$MessagePriority.NORMAL;
  }
  /**
   * {@inheritDoc}
   */
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    let colony: Colony;
    try {
      colony = serverPlayer.getOurFreeColGameObject(this.getStringAttribute(SetGoodsLevelsMessage.COLONY_TAG), $J.cls(Colony));
    } catch ($e0) {
      if ($J.isa($e0, Exception)) {
        let e = $J.exc($e0);
        return serverPlayer.clientError$String(e.getMessage());
      } else {
        throw $e0;
      }
    }
    let exportData = this.getExportData();
    if (exportData == null) {
      return serverPlayer.clientError$String('No export data present.');
    }
    return this.igc$FreeColServer(freeColServer).setGoodsLevels(serverPlayer, colony, exportData);
  }
}

$J.define(SetGoodsLevelsMessage, 'net.sf.freecol.common.networking.SetGoodsLevelsMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.ObjectMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_SetGoodsLevelsMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Colony,net.sf.freecol.common.model.ExportData': '_SetGoodsLevelsMessage$Colony$ExportData' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority', 'getExportData': 'net.sf.freecol.common.model.ExportData' } });
$J.module(() => {
  FreeColXMLReader$ReadScope = $J.load('net.sf.freecol.common.io.FreeColXMLReader$ReadScope');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  ExportData = $J.load('net.sf.freecol.common.model.ExportData');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
