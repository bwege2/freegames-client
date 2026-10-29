// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/generator/FreeColMapLoader.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, HashMap, JObject, Logger } from '../../../../../../jre/index.ts';

let Map_, Map$Layer, Tile, TileItemContainer, TileType, FreeColServer, ServerIndianSettlement, ServerPlayer, ServerRegion;

/**
 * Load a FreeCol map.
 */
export class FreeColMapLoader extends JObject {
  static logger: Logger = null;
  importMap: Map_ = null;
  /**
   * Constructor for the FreeColMapLoader class.
   *
   * @param file The File to load.
   * @exception FreeColException if the format is incompatible.
   * @exception IOException if the stream can not be created.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  _FreeColMapLoader(file: File): this {
    this.importMap = null;
    this.importMap = FreeColServer.readMap(file, null);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  loadMap(game: Game, layer: Map$Layer): Map$Layer {
    let highestLayer = layer.compareTo(this.importMap.getLayer()) < 0 ? layer : this.importMap.getLayer();
    let width = this.importMap.getWidth();
    let height = this.importMap.getHeight();
    let regions = new HashMap();
    let map = new Map_()._Map$Game$int$int(game, width, height);
    if (highestLayer === Map$Layer.LAND) {
      map.populateTiles((x, y) => {
        return new Tile()._Tile$Game$TileType$int$int(game, (this.importMap.getTile$int$int(x, y).getType().isWater()) ? TileType.WATER : TileType.LAND, x, y);
      });
    } else {
      map.populateTiles((x, y) => {
        let template = this.importMap.getTile$int$int(x, y);
        let tile = new Tile()._Tile$Game$TileType$int$int(game, null, x, y);
        tile.setType(game.getSpecification().getTileType(template.getType().getId()));
        tile.setMoveToEurope(template.getMoveToEurope());
        if (highestLayer.compareTo(Map$Layer.REGIONS) >= 0) {
          let region = template.getRegion();
          if (region != null) {
            let ours = regions.get(region.getId());
            if (ours == null) {
              ours = new ServerRegion()._ServerRegion$Game$Region(game, region);
              regions.put(region.getId(), ours);
            }
            tile.setRegion(ours);
            ours.addTile(tile);
          }
          if (highestLayer.compareTo(Map$Layer.RIVERS) >= 0) {
            let newTic = new TileItemContainer()._TileItemContainer$Game$Tile(game, tile);
            newTic.copyFrom(template.getTileItemContainer(), layer);
            tile.setTileItemContainer(newTic);
            if (layer.compareTo(Map$Layer.NATIVES) >= 0) {
              if (template.getOwner() != null) {
                let nationId = template.getOwner().getNationId();
                let player = game.getPlayerByNationId(nationId);
                if (player == null) {
                  let nation = game.getSpecification().getNation(nationId);
                  player = new ServerPlayer()._ServerPlayer$Game$boolean$Nation(game, false, nation);
                  game.addPlayer(player);
                }
                tile.setOwner(player);
                if (template.getOwningSettlement() != null) {
                  let is$ = template.getOwningSettlement();
                  tile.setOwningSettlement(new ServerIndianSettlement()._ServerIndianSettlement$Game$Player$Tile$IndianSettlement(game, player, tile, is$));
                }
              }
            }
          }
        }
        return tile;
      });
    }
    for (const $it0 = regions.values().iterator(); $it0.hasNext(); ) {
      let region = $it0.next();
      map.addRegion(region);
    }
    map.setLayer(highestLayer);
    game.setMap(map);
    return highestLayer;
  }
  /**
   * {@inheritDoc}
   */
  getHighestLayer(): Map$Layer {
    return Map$Layer.NATIVES;
  }
  static $clinit() {
    FreeColMapLoader.logger = Logger.getLogger($J.cls(FreeColMapLoader).getName());
  }
}

$J.define(FreeColMapLoader, 'net.sf.freecol.server.generator.FreeColMapLoader', { kind: 'class', ifaces: ['net.sf.freecol.server.generator.MapLoader'], sup: 'java.lang.Object', ctors: { 'java.io.File': '_FreeColMapLoader' }, returns: { 'getHighestLayer': 'net.sf.freecol.common.model.Map$Layer' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Map_ = $J.load('net.sf.freecol.common.model.Map');
  Map$Layer = $J.load('net.sf.freecol.common.model.Map$Layer');
  Tile = $J.load('net.sf.freecol.common.model.Tile');
  TileItemContainer = $J.load('net.sf.freecol.common.model.TileItemContainer');
  TileType = $J.load('net.sf.freecol.common.model.TileType');
  FreeColServer = $J.load('net.sf.freecol.server.FreeColServer');
  ServerIndianSettlement = $J.load('net.sf.freecol.server.model.ServerIndianSettlement');
  ServerPlayer = $J.load('net.sf.freecol.server.model.ServerPlayer');
  ServerRegion = $J.load('net.sf.freecol.server.model.ServerRegion');
});
