// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/generator/ColonizationMapLoader.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, EOFException, FileNotFoundException, IOException, JObject, Level, Logger, RandomAccessFile } from '../../../../../../jre/index.ts';

let Map$Layer, Tile, TileImprovement, TileImprovementStyle, TileItemContainer, TileType;

/**
 * Just pass the name of a Colonization map file (with extension ".MP").
 *
 * The map file starts with a six-byte header. Byte zero encodes the
 * map width, byte two encodes the map height. The function of the
 * other bytes is unknown, their values, however, are fixed. The
 * header is followed by three "layers", each the size of the map. The
 * first "layer" encodes the terrain type. The function of the other
 * layers is unknown. They are filled with zero bytes.
 *
 * It seems that the least significant three bits encode the basic
 * terrain type, the next two bits encode the forest overlay and
 * the special tile types ice, ocean and sea lanes. The three most
 * significant bits encode combinations of the hill, mountain and
 * river overlays.
 *
 * bits 0-2: tile type
 * bit 3 (8): forest
 * bit 4 (16): forest
 * bits 3+4 (24): special, values larger than 26 are not defined
 *
 * bits 5-7: overlays
 * 0: nothing
 * 1: hill
 * 2: minor river
 * 3: hill + minor river (extremely rare)
 * 4: nothing
 * 5: mountain
 * 6: major river
 * 7: mountain + major river (never seen)
 */
export class ColonizationMapLoader extends JObject {
  static logger: Logger = null;
  static readonly WIDTH: number = 0;
  static readonly HEIGHT: number = 2;
  static readonly OCEAN: number = 25;
  static readonly HIGH_SEAS: number = 26;
  /**
   * A String array of title types. Each represents
   *      a single type of tile available in FreeCol.
   */
  static tiletypes: string[] = null;
  /**
   * A byte array of file headers
   */
  static header: number[] = null;
  layer1: number[] = null;
  _ColonizationMapLoader(file: File): this {
    {
      try {
        const reader = new RandomAccessFile(file, 'r');
        try {
          reader.readFully(ColonizationMapLoader.header);
          let size = Math.imul(ColonizationMapLoader.header[ColonizationMapLoader.WIDTH], ColonizationMapLoader.header[ColonizationMapLoader.HEIGHT]);
          this.layer1 = $J.newArray(size, 0);
          reader.readFully(this.layer1);
        } finally {
          if (reader != null) reader.close();
        }
      } catch ($e0) {
        if ($J.isa($e0, EOFException)) {
          let ee = $J.exc($e0);
          ColonizationMapLoader.logger.log(Level.SEVERE, 'File (' + $J.str(file) + ') is too short.', ee);
        } else if ($J.isa($e0, FileNotFoundException)) {
          let fe = $J.exc($e0);
          ColonizationMapLoader.logger.log(Level.SEVERE, 'File (' + $J.str(file) + ') was not found.', fe);
        } else if ($J.isa($e0, IOException)) {
          let e = $J.exc($e0);
          ColonizationMapLoader.logger.log(Level.SEVERE, 'File (' + $J.str(file) + ') is corrupt and cannot be read.', e);
        } else {
          throw $e0;
        }
      }
    }
    return this;
  }
  /**
   * {@inheritDoc}
   *
   * @return The highest {@code Layer} value
   */
  loadMap(game: Game, layer: Map$Layer): Map$Layer {
    let spec = game.getSpecification();
    let tiles = $J.newArrayN([ColonizationMapLoader.header[ColonizationMapLoader.WIDTH], ColonizationMapLoader.header[ColonizationMapLoader.HEIGHT]], null);
    let highestLayer = layer.compareTo(this.getHighestLayer()) < 0 ? layer : this.getHighestLayer();
    let index = 0;
    let tileType = null;
    if (highestLayer === Map$Layer.LAND) {
      for (let y = 0; y < ColonizationMapLoader.header[ColonizationMapLoader.HEIGHT]; y++) {
        for (let x = 0; x < ColonizationMapLoader.header[ColonizationMapLoader.WIDTH]; x++) {
          let decimal = this.layer1[index] & 255;
          let terrain = decimal & 31;
          tileType = (terrain === ColonizationMapLoader.OCEAN || terrain === ColonizationMapLoader.HIGH_SEAS) ? TileType.WATER : TileType.LAND;
          index++;
        }
      }
    } else {
      let riverType = spec.getTileImprovementType('model.improvement.river');
      for (let y = 0; y < ColonizationMapLoader.header[ColonizationMapLoader.HEIGHT]; y++) {
        for (let x = 0; x < ColonizationMapLoader.header[ColonizationMapLoader.WIDTH]; x++) {
          let decimal = this.layer1[index] & 255;
          let terrain = decimal & 31;
          let overlay = decimal >> 5;
          if (terrain < ColonizationMapLoader.tiletypes.length) {
            tileType = spec.getTileType('model.tile.' + ColonizationMapLoader.tiletypes[terrain]);
          } else if (overlay === 1 || overlay === 3) {
            tileType = spec.getTileType('model.tile.hills');
          } else if (overlay === 5 || overlay === 7) {
            tileType = spec.getTileType('model.tile.mountains');
          }
          tiles[x][y] = new Tile()._Tile$Game$TileType$int$int(game, tileType, x, y);
          if (highestLayer === Map$Layer.RIVERS && (overlay === 2 || overlay === 3 || overlay === 6 || overlay === 7)) {
            let container = new TileItemContainer()._TileItemContainer$Game$Tile(game, tiles[x][y]);
            let river = new TileImprovement()._TileImprovement$Game$Tile$TileImprovementType$TileImprovementStyle(game, tiles[x][y], riverType, TileImprovementStyle.getInstance(TileImprovement.EMPTY_RIVER_STYLE));
            river.setMagnitude(overlay <= 3 ? 1 : 2);
            container.tryAddTileItem(river);
            tiles[x][y].setTileItemContainer(container);
          }
          index++;
        }
      }
    }
    return highestLayer;
  }
  /**
   * {@inheritDoc}
   *
   *  @return The {@code Layer} value for RIVERS
   */
  getHighestLayer(): Map$Layer {
    return Map$Layer.RIVERS;
  }
  static $clinit() {
    ColonizationMapLoader.logger = Logger.getLogger($J.cls(ColonizationMapLoader).getName());
    ColonizationMapLoader.tiletypes = ['tundra', 'desert', 'plains', 'prairie', 'grassland', 'savannah', 'marsh', 'swamp', 'borealForest', 'scrubForest', 'mixedForest', 'broadleafForest', 'coniferForest', 'tropicalForest', 'wetlandForest', 'rainForest', 'borealForest', 'scrubForest', 'mixedForest', 'broadleafForest', 'coniferForest', 'tropicalForest', 'wetlandForest', 'rainForest', 'arctic', 'ocean', 'highSeas'];
    ColonizationMapLoader.header = [58, 0, 72, 0, 4, 0];
  }
}

$J.define(ColonizationMapLoader, 'net.sf.freecol.server.generator.ColonizationMapLoader', { kind: 'class', ifaces: ['net.sf.freecol.server.generator.MapLoader'], sup: 'java.lang.Object', ctors: { 'java.io.File': '_ColonizationMapLoader' }, returns: { 'getHighestLayer': 'net.sf.freecol.common.model.Map$Layer' }, clinit: true, lazy: ['logger', 'tiletypes', 'header'] });
$J.module(() => {
  Map$Layer = $J.load('net.sf.freecol.common.model.Map$Layer');
  Tile = $J.load('net.sf.freecol.common.model.Tile');
  TileImprovement = $J.load('net.sf.freecol.common.model.TileImprovement');
  TileImprovementStyle = $J.load('net.sf.freecol.common.model.TileImprovementStyle');
  TileItemContainer = $J.load('net.sf.freecol.common.model.TileItemContainer');
  TileType = $J.load('net.sf.freecol.common.model.TileType');
});
