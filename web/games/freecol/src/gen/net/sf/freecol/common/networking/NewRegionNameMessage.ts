// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/NewRegionNameMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { AttributeMessage } from './AttributeMessage.ts';

let Region, Tile, Unit, Message$MessagePriority;

/**
 * The message sent when naming a new region.
 */
export class NewRegionNameMessage extends AttributeMessage {
  static readonly TAG: string = 'newRegionName';
  static readonly NEW_REGION_NAME_TAG: string = 'newRegionName';
  static readonly REGION_TAG: string = 'region';
  static readonly TILE_TAG: string = 'tile';
  static readonly UNIT_TAG: string = 'unit';
  /**
   * Create a new {@code NewRegionNameMessage} with the
   * supplied name.
   *
   * @param region The {@code Region} being discovered.
   * @param tile The {@code Tile} where the region is discovered.
   * @param unit The {@code Unit} that discovers the region.
   * @param newRegionName The default new region name.
   */
  _NewRegionNameMessage$Region$Tile$Unit$String(region: Region, tile: Tile, unit: Unit, newRegionName: string): this {
    this._AttributeMessage$String$StringArr(NewRegionNameMessage.TAG, [NewRegionNameMessage.REGION_TAG, region.getId(), NewRegionNameMessage.TILE_TAG, tile.getId(), NewRegionNameMessage.UNIT_TAG, unit.getId(), NewRegionNameMessage.NEW_REGION_NAME_TAG, newRegionName]);
    return this;
  }
  /**
   * Create a new {@code NewRegionNameMessage} from a stream.
   *
   * @param game The {@code Game} to read within.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _NewRegionNameMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(NewRegionNameMessage.TAG, xr, [NewRegionNameMessage.REGION_TAG, NewRegionNameMessage.TILE_TAG, NewRegionNameMessage.UNIT_TAG, NewRegionNameMessage.NEW_REGION_NAME_TAG]);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getPriority(): Message$MessagePriority {
    return Message$MessagePriority.LATE;
  }
  /**
   * {@inheritDoc}
   */
  aiHandler(freeColServer: FreeColServer, aiPlayer: AIPlayer): void {
    let game = freeColServer.getGame();
    let region = this.getRegion(game);
    let tile = this.getTile(game);
    let unit = this.getUnit(aiPlayer.getPlayer());
    let name = this.getNewRegionName();
    aiPlayer.newRegionNameHandler(region, tile, unit, name);
  }
  /**
   * {@inheritDoc}
   */
  clientHandler(freeColClient: FreeColClient): void {
    let game = freeColClient.getGame();
    let tile = this.getTile(game);
    let unit = this.getUnit(freeColClient.getMyPlayer());
    let region = this.getRegion(game);
    let name = this.getNewRegionName();
    if (name == null || region == null) {
      return;
    }
    this.igc$FreeColClient(freeColClient).newRegionNameHandler(region, tile, unit, name);
    this.clientGeneric(freeColClient);
  }
  /**
   * {@inheritDoc}
   */
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    let game = freeColServer.getGame();
    let tile = this.getTile(game);
    if (!serverPlayer.hasExplored(tile)) {
      return serverPlayer.clientError$String('Can not claim discovery in unexplored tile: ' + this.getStringAttribute(NewRegionNameMessage.TILE_TAG));
    }
    let unit: Unit;
    try {
      unit = this.getUnit(serverPlayer);
    } catch ($e0) {
      if ($J.isa($e0, Exception)) {
        let e = $J.exc($e0);
        return serverPlayer.clientError$String(e.getMessage());
      } else {
        throw $e0;
      }
    }
    let region = tile.getDiscoverableRegion();
    if (region == null) {
      return serverPlayer.clientError$String('No discoverable region in: ' + tile.getId());
    }
    let regionId = this.getStringAttribute(NewRegionNameMessage.REGION_TAG);
    if (!$J.equals(region.getId(), regionId)) {
      return serverPlayer.clientError$String('Region mismatch, ' + region.getId() + ' != ' + regionId);
    }
    return this.igc$FreeColServer(freeColServer).setNewRegionName(serverPlayer, unit, region, this.getNewRegionName());
  }
  /**
   * Public accessor for the region.
   *
   * @param game The {@code Game} to look for a region in.
   * @return The region of this message.
   */
  getRegion(game: Game): Region {
    return game.getFreeColGameObject$String$Class(this.getStringAttribute(NewRegionNameMessage.REGION_TAG), $J.cls(Region));
  }
  /**
   * Public accessor for the tile.
   *
   * @param game The {@code Game} to look for a tile in.
   * @return The tile of this message.
   */
  getTile(game: Game): Tile {
    return game.getFreeColGameObject$String$Class(this.getStringAttribute(NewRegionNameMessage.TILE_TAG), $J.cls(Tile));
  }
  /**
   * Public accessor for the unit.
   *
   * @param player The {@code Player} who owns the unit.
   * @return The {@code Unit} of this message.
   */
  getUnit(player: Player): Unit {
    return player.getOurFreeColGameObject(this.getStringAttribute(NewRegionNameMessage.UNIT_TAG), $J.cls(Unit));
  }
  /**
   * Public accessor for the new region name.
   *
   * @return The new region name of this message.
   */
  getNewRegionName(): string {
    return this.getStringAttribute(NewRegionNameMessage.NEW_REGION_NAME_TAG);
  }
}

$J.define(NewRegionNameMessage, 'net.sf.freecol.common.networking.NewRegionNameMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_NewRegionNameMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Region,net.sf.freecol.common.model.Tile,net.sf.freecol.common.model.Unit,java.lang.String': '_NewRegionNameMessage$Region$Tile$Unit$String' }, returns: { 'getNewRegionName': 'java.lang.String', 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Region = $J.load('net.sf.freecol.common.model.Region');
  Tile = $J.load('net.sf.freecol.common.model.Tile');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
