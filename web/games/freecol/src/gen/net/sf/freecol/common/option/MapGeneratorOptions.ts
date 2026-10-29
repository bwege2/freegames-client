// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/option/MapGeneratorOptions.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../jre/index.ts';

/**
 * Keeps track of the available map generator options.
 * More of a handy place to organize the names than an actual option type.
 *
 * @see MapGenerator
 * @see net.sf.freecol.common.option.OptionGroup
 */
export class MapGeneratorOptions extends JObject {
  static readonly TAG: string = 'mapGeneratorOptions';
  /**
   * Map generator options import group.
   */
  static readonly MAPGENERATOROPTIONS_IMPORT: string = 'mapGeneratorOptions.import';
  /**
   * Option for setting a file to be imported (map etc).
   */
  static readonly IMPORT_FILE: string = 'model.option.importFile';
  /**
   * Option for using the terrain imported from a file.
   */
  static readonly IMPORT_TERRAIN: string = 'model.option.importTerrain';
  /**
   * Option for using the bonuses imported from a file.
   */
  static readonly IMPORT_BONUSES: string = 'model.option.importBonuses';
  /**
   * Option for using the lost city rumours imported from a file.
   */
  static readonly IMPORT_RUMOURS: string = 'model.option.importRumours';
  /**
   * Option for using the settlements imported from a file.
   */
  static readonly IMPORT_SETTLEMENTS: string = 'model.option.importSettlements';
  /**
   * Map generator options land generator group.
   */
  static readonly MAPGENERATOROPTIONS_LAND_GENERATOR: string = 'mapGeneratorOptions.landGenerator';
  /**
   * Option for setting the map width.
   */
  static readonly MAP_WIDTH: string = 'model.option.mapWidth';
  /**
   * Option for setting the map height.
   */
  static readonly MAP_HEIGHT: string = 'model.option.mapHeight';
  /**
   * Option for setting the land mass of the map.
   */
  static readonly LAND_MASS: string = 'model.option.landMass';
  /**
   * Option for setting the type of land generator to be used.
   */
  static readonly LAND_GENERATOR_TYPE: string = 'model.option.landGeneratorType';
  static readonly LAND_GENERATOR_CLASSIC: number = 0;
  static readonly LAND_GENERATOR_CONTINENT: number = 1;
  static readonly LAND_GENERATOR_ARCHIPELAGO: number = 2;
  static readonly LAND_GENERATOR_ISLANDS: number = 3;
  /**
   * Option for setting the preferred distance to the map edge.
   */
  static readonly PREFERRED_DISTANCE_TO_EDGE: string = 'model.option.preferredDistanceToEdge';
  /**
   * Option for setting the maximum distance to the map edge.
   */
  static readonly MAXIMUM_DISTANCE_TO_EDGE: string = 'model.option.maximumDistanceToEdge';
  /**
   * Option for setting the distance to the high seas.
   */
  static readonly DISTANCE_TO_HIGH_SEA: string = 'model.option.distanceToHighSea';
  /**
   * Map generator options terrain generator group.
   */
  static readonly MAPGENERATOROPTIONS_TERRAIN_GENERATOR: string = 'mapGeneratorOptions.terrainGenerator';
  /**
   * The minimum latitude of the map.
   */
  static readonly MINIMUM_LATITUDE: string = 'model.option.minimumLatitude';
  /**
   * The maximum latitude of the map.
   */
  static readonly MAXIMUM_LATITUDE: string = 'model.option.maximumLatitude';
  /**
   * Option for enabling generation of great rivers.
   */
  static readonly ENABLE_GREAT_RIVERS: string = 'mapGeneratorOptions.enableGreatRivers';
  /**
   * Option for setting the number of river tiles on the map as a percentage of all possible tiles for a river.
   */
  static readonly RIVER_NUMBER: string = 'model.option.riverNumber';
  /**
   * Option for setting the number of mountains on the map.
   */
  static readonly MOUNTAIN_NUMBER: string = 'model.option.mountainNumber';
  /**
   * Option for setting the number of rumours on the map.
   */
  static readonly RUMOUR_NUMBER: string = 'model.option.rumourNumber';
  /**
   * Option for setting the percentage of forests on the map.
   */
  static readonly FOREST_NUMBER: string = 'model.option.forestNumber';
  /**
   * Option for setting the percentage of bonus tiles on the map.
   */
  static readonly BONUS_NUMBER: string = 'model.option.bonusNumber';
  /**
   * Option for setting the humidity of the map.
   */
  static readonly HUMIDITY: string = 'model.option.humidity';
  /**
   * Option for setting the temperature of the map.
   */
  static readonly TEMPERATURE: string = 'model.option.temperature';
  /**
   * One of the settings used by {@link #TEMPERATURE}.
   */
  static readonly TEMPERATURE_COLD: number = 0;
  /**
   * One of the settings used by {@link #TEMPERATURE}.
   */
  static readonly TEMPERATURE_CHILLY: number = 1;
  /**
   * One of the settings used by {@link #TEMPERATURE}.
   */
  static readonly TEMPERATURE_TEMPERATE: number = 2;
  /**
   * One of the settings used by {@link #TEMPERATURE}.
   */
  static readonly TEMPERATURE_WARM: number = 3;
  /**
   * One of the settings used by {@link #TEMPERATURE}.
   */
  static readonly TEMPERATURE_HOT: number = 4;
  _MapGeneratorOptions(): this {
    return this;
  }
  getXMLTagName(): string {
    return MapGeneratorOptions.TAG;
  }
}

$J.define(MapGeneratorOptions, 'net.sf.freecol.common.option.MapGeneratorOptions', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_MapGeneratorOptions' }, returns: { 'getXMLTagName': 'java.lang.String' } });
