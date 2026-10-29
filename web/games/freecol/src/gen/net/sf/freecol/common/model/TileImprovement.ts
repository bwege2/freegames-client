// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/TileImprovement.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Character, Collections, Collectors, JFunction, JString, Logger, RuntimeException, Stream, StringBuilder } from '../../../../../../jre/index.ts';
import { TileItem } from './TileItem.ts';

let Direction, FeatureContainer, Map$Layer, Modifier, Modifier$ModifierType, Tile, TileImprovementStyle, TileImprovementType, GameOptions, CollectionUtils;

/**
 * Represents a tile improvement, such as a river or road.
 */
export class TileImprovement extends TileItem {
  static logger: Logger = null;
  static readonly TAG: string = 'tileImprovement';
  static readonly EMPTY_RIVER_STYLE: string = '0000';
  static readonly EMPTY_ROAD_STYLE: string = '00000000';
  /**
   * River magnitudes
   */
  static readonly NO_RIVER: number = 0;
  static readonly SMALL_RIVER: number = 1;
  static readonly LARGE_RIVER: number = 2;
  static readonly FJORD_RIVER: number = 3;
  /**
   * The type of this improvement.
   */
  type: TileImprovementType = null;
  /**
   * Turns remaining until the improvement is complete, if any.
   */
  turnsToComplete: number = 0;
  /**
   * The improvement magnitude.  Default is type.getMagnitude(), but
   * this will override.
   */
  magnitude: number = 0;
  /**
   * Image and overlay style information for the improvement.
   */
  style: TileImprovementStyle = null;
  /**
   * Whether this is a virtual improvement granted by some structure
   * on the tile (a Colony, for example).  Virtual improvements will
   * be removed along with the structure that granted them.
   */
  virtual: boolean = false;
  static readonly MAGNITUDE_TAG: string = 'magnitude';
  static readonly STYLE_TAG: string = 'style';
  static readonly TILE_TAG: string = 'tile';
  static readonly TURNS_TAG: string = 'turns';
  static readonly TYPE_TAG: string = 'type';
  static readonly VIRTUAL_TAG: string = 'virtual';
  /**
   * Creates a standard {@code TileImprovement}-instance.
   *
   * This constructor asserts that the game, tile and type are valid.
   * Does not set the style.
   *
   * @param game The enclosing {@code Game}.
   * @param tile The {@code Tile} on which this object sits.
   * @param type The {@code TileImprovementType} of this
   *     improvement.
   * @param style The {@code TileImprovementStyle} of this improvement.
   */
  _TileImprovement$Game$Tile$TileImprovementType$TileImprovementStyle(game: Game, tile: Tile, type$: TileImprovementType, style: TileImprovementStyle): this {
    this._TileItem$Game$Tile(game, tile);
    if (type$ == null) {
      throw new RuntimeException('Type must not be null: ' + $J.str(this));
    }
    this.type = type$;
    if (!type$.isNatural()) {
      this.turnsToComplete = (tile.getType().getBasicWorkTurns() + type$.getAddWorkTurns()) | 0;
    }
    this.magnitude = type$.getMagnitude();
    this.style = style;
    return this;
  }
  /**
   * Create a new {@code TileImprovement} with the given identifier.
   *
   * The object should be initialized later.
   *
   * @param game The enclosing {@code Game}.
   * @param id The object identifier.
   */
  _TileImprovement$Game$String(game: Game, id: string): this {
    this._TileItem$Game$String(game, id);
    return this;
  }
  /**
   * Gets the type of this tile improvement.
   *
   * @return The type of this improvement.
   */
  getType(): TileImprovementType {
    return this.type;
  }
  /**
   * Is this tile improvement a river?
   *
   * @return True if this is a river improvement.
   */
  isRiver(): boolean {
    return $J.equals('model.improvement.river', this.type.getId());
  }
  /**
   * Is this tile improvement a road?
   *
   * @return True if this is a road improvement.
   */
  isRoad(): boolean {
    return $J.equals('model.improvement.road', this.type.getId());
  }
  /**
   * Gets the directions that a connection can form across for this
   * this type of improvement.
   *
   * - For rivers, it is just the longSided directions.
   * - For roads, it is all directions.
   * - In other cases, no directions are relevant.
   *
   * @return An array of relevant directions, or null if none.
   */
  getConnectionDirections(): List<Direction> {
    return (this.isRoad()) ? Direction.allDirections : (this.isRiver()) ? Direction.longSides : null;
  }
  /**
   * How many turns remain until this improvement is complete?
   *
   * @return The current turns to completion.
   */
  getTurnsToComplete(): number {
    return this.turnsToComplete;
  }
  /**
   * Sets the turns required to complete the improvement.
   *
   * @param turns The new turns to completion.
   */
  setTurnsToComplete(turns: number): void {
    this.turnsToComplete = turns;
  }
  /**
   * Gets the magnitude of this improvement.
   *
   * @return The magnitude of this immprovement.
   */
  getMagnitude(): number {
    return this.magnitude;
  }
  /**
   * Sets the magnitude of this improvement.
   *
   * @param magnitude The new magnitude.
   */
  setMagnitude(magnitude: number): void {
    this.magnitude = magnitude;
  }
  /**
   * Gets the style of this improvement.
   *
   * @return The style
   */
  getStyle(): TileImprovementStyle {
    return this.style;
  }
  /**
   * Set the style of this improvement.
   *
   * @param style The new {@code TileImprovementStyle}.
   */
  setStyle(style: TileImprovementStyle): void {
    this.style = style;
  }
  /**
   * Is this a virtual improvement?
   *
   * @return True if this is a virtual improvement.
   */
  getVirtual(): boolean {
    return this.virtual;
  }
  /**
   * Set the virtual status of this improvement.
   * Used for the roads in a colony center tile.
   *
   * @param virtual The new virtual value.
   */
  setVirtual(virtual: boolean): void {
    this.virtual = virtual;
  }
  /**
   * Get the magnitude of the river branch in the given direction.
   * Precondition: This tile improvement is a river!
   *
   * @param direction The {@code Direction} to check.
   * @return The magnitude of the river branch or 0 if there is none.
   */
  getRiverConnection(direction: Direction): number {
    let index = Direction.longSides.indexOf(direction);
    if (index === -1 || this.style == null) {
      return 0;
    }
    let mag = Character.digit(this.style.getString().charCodeAt(index), 10);
    return (mag === -1) ? 0 : mag;
  }
  /**
   * Is this tile improvement connected to a similar improvement on
   * a neighbouring tile?
   *
   * Public for the test suite.
   *
   * @param direction The {@code Direction} to check.
   * @return True if this improvement is connected.
   */
  isConnectedTo(direction: Direction): boolean {
    let index = this.isRoad() ? direction.ordinal() : this.isRiver() ? Direction.longSides.indexOf(direction) : -1;
    return (index === -1 || this.style == null) ? false : this.style.getString().charCodeAt(index) !== 48 /* '0' */;
  }
  /**
   * Internal helper method to set the connection status in a given direction.
   * There is no check for backwards connections on neighbouring tiles!
   *
   * @param direction The {@code Direction} to set.
   * @param value The new status for the connection.
   */
  setConnected$Direction$boolean$TileImprovement(direction: Direction, value: boolean): void {
    if (this.style == null || this.isConnectedTo(direction) !== value) {
      this.setConnected$Direction$boolean$String$TileImprovement(direction, value, String(this.magnitude));
    }
  }
  setConnected$Direction$boolean$String$TileImprovement(direction: Direction, value: boolean, magnitude: string): void {
    if (this.style == null) {
      this.style = TileImprovementStyle.getInstance(TileImprovement.EMPTY_ROAD_STYLE);
    }
    let old = this.style.toString();
    let directions = this.getConnectionDirections();
    let end = directions.size();
    let updated = new StringBuilder();
    for (let index = 0; index !== end; ++index) {
      if (directions.get(index) === direction) {
        updated.append(value ? magnitude : '0');
      } else {
        updated.append(String.fromCharCode(old.charCodeAt(index)));
      }
    }
    this.style = TileImprovementStyle.getInstance(updated.toString());
  }
  /**
   * Gets a map of connection-direction to magnitude.
   *
   * @return A map of the connections.
   */
  getConnections(): JMap<Direction, number> {
    let dirns = this.getConnectionDirections();
    return (dirns == null) ? Collections.emptyMap() : CollectionUtils.transform$Collection$Predicate$Function$Collector(dirns, (d) => this.isConnectedTo(d), JFunction.identity(), Collectors.toMap(JFunction.identity(), (d) => this.magnitude));
  }
  /**
   * Gets a Modifier for the production bonus this improvement provides
   * for a given type of goods.
   *
   * @param goodsType The {@code GoodsType} to test.
   * @return A production {@code Modifier}, or null if none applicable.
   */
  getProductionModifier(goodsType: GoodsType): Modifier {
    let modifier = (this.isComplete()) ? this.type.getProductionModifier(goodsType) : null;
    if (modifier == null || modifier.getValue$() === Math.fround(0) || this.magnitude <= 0) {
      return modifier;
    }
    let modifierWithMagnitudeBonus = Modifier.makeModifier(modifier);
    modifierWithMagnitudeBonus.setValue(Math.fround(modifierWithMagnitudeBonus.getValue$() * this.magnitude));
    return modifierWithMagnitudeBonus;
  }
  /**
   * Calculates the movement cost on the basis of connected tile
   * improvements.
   *
   * @param direction The {@code Direction} to move.
   * @param moveCost The original movement cost.
   * @return The movement cost with this improvement.
   */
  getMoveCost(direction: Direction, moveCost: number): number {
    return (this.isComplete() && this.isConnectedTo(direction)) ? this.type.getMoveCost$int(moveCost) : moveCost;
  }
  /**
   * What type of tile does this improvement change a given type to?
   *
   * @param tileType The original {@code TileType}.
   * @return The {@code TileType} that results from completing this
   *     improvement, or null if nothing changes.
   */
  getChange(tileType: TileType): TileType {
    return (this.isComplete()) ? this.type.getChange(tileType) : null;
  }
  /**
   * Can a unit build this improvement?
   *
   * @param unit A {@code Unit} to do the building.
   * @return True if the supplied unit can build this improvement.
   */
  isWorkerAllowed(unit: Unit): boolean {
    return (unit == null || this.isComplete()) ? false : this.type.isWorkerAllowed(unit);
  }
  /**
   * Updates the connections from the current style.
   *
   * Public for the test suite.
   *
   * @return The connections implied by the current style.
   */
  getConnectionsFromStyle(): number {
    let conn = 0;
    if (this.style != null) {
      let directions = this.getConnectionDirections();
      if (directions != null) {
        let mask = this.style.getMask();
        for (let i = 0; i < directions.size(); i++) {
          if (mask.charCodeAt(i) !== 48 /* '0' */) {
            conn = $J.lor(conn, $J.lshl(1, directions.get(i).ordinal()));
          }
        }
      }
    }
    return conn;
  }
  /**
   * Sets the river style to be as close as possible to the requested
   * style, even when it has to create neighbouring rivers to prevent
   * broken connections or change the magnitude.
   *
   * @param conns The river style to set.
   */
  setRiverStyle(conns: string): void {
    if (!this.isRiver()) {
      return;
    }
    let tile = this.getTile$();
    let i = 0;
    let counts = [0, 0];
    for (const $it0 = Direction.longSides.iterator(); $it0.hasNext(); ) {
      let d = $it0.next();
      let dReverse = d.getReverseDirection();
      let t = tile.getNeighbourOrNull(d);
      let river = (t == null) ? null : t.getRiver();
      let c = (conns == null) ? '0' : conns.substring(i, (i + 1) | 0);
      if ($J.equals('0', c)) {
        if (river != null) {
          river.setConnected$Direction$boolean$TileImprovement(dReverse, false);
        }
        this.setConnected$Direction$boolean$TileImprovement(d, false);
      } else {
        let mag = $J.parseInt(c);
        if (river != null) {
          river.setConnected$Direction$boolean$TileImprovement(dReverse, true);
          this.setConnected$Direction$boolean$String$TileImprovement(d, true, c);
          (counts[(mag - 1) | 0])++;
        } else if (t != null) {
          if (!t.getType().isWater()) {
            t.addRiver(mag, '0000');
            t.getRiver().setConnected$Direction$boolean$TileImprovement(dReverse, true);
          }
          this.setConnected$Direction$boolean$String$TileImprovement(d, true, c);
          (counts[(mag - 1) | 0])++;
        }
      }
      i++;
    }
    this.magnitude = counts[1] >= counts[0] ? 2 : 1;
  }
  /**
   * Updates the connections from/to this river improvement on the basis
   * of the expected encoded river style, as long as this would not
   * create broken connections.
   * Uses magnitude, not the connection strengths inside conns, when
   * adding new connections.
   *
   * @param conns The encoded river connections, or null to disconnect.
   * @return The actual encoded connections found.
   */
  updateRiverConnections(conns: string): string {
    if (!this.isRiver()) {
      return null;
    }
    let tile = this.getTile$();
    let i = 0;
    for (const $it1 = Direction.longSides.iterator(); $it1.hasNext(); ) {
      let d = $it1.next();
      let dReverse = d.getReverseDirection();
      let t = tile.getNeighbourOrNull(d);
      let river = (t == null) ? null : t.getRiver();
      let c = (conns == null) ? '0' : conns.substring(i, (i + 1) | 0);
      if ($J.equals('0', c)) {
        if (river != null) {
          river.setConnected$Direction$boolean$TileImprovement(dReverse, false);
        }
        this.setConnected$Direction$boolean$TileImprovement(d, false);
      } else {
        if (river != null) {
          river.setConnected$Direction$boolean$TileImprovement(dReverse, true);
          this.setConnected$Direction$boolean$TileImprovement(d, true);
        } else if (t != null && t.getType().isWater()) {
          this.setConnected$Direction$boolean$TileImprovement(d, true);
        }
      }
      i++;
    }
    return (this.style == null) ? null : this.style.getString();
  }
  /**
   * Updates the connections from/to this road improvement.
   *
   * @param connect If true, add connections, otherwise remove them.
   * @return A string encoding of the correct connections for this
   *     improvement.
   */
  updateRoadConnections(connect: boolean): string {
    if (!this.isRoad() || !this.isComplete()) {
      return null;
    }
    let tile = this.getTile$();
    for (let d of Direction.values()) {
      let t = tile.getNeighbourOrNull(d);
      let road = (t == null) ? null : t.getRoad();
      if (road != null && road.isComplete()) {
        road.setConnected$Direction$boolean$TileImprovement(d.getReverseDirection(), connect);
        this.setConnected$Direction$boolean$TileImprovement(d, connect);
      } else {
        this.setConnected$Direction$boolean$TileImprovement(d, false);
      }
    }
    return (this.style == null) ? null : this.style.getString();
  }
  /**
   * Get the disaster choices available for this tile improvement.
   *
   * @return A stream of {@code Disaster} choices.
   */
  getDisasterChoices(): Stream<RandomChoice<Disaster>> {
    return (this.type == null) ? Stream.empty() : this.type.getDisasterChoices();
  }
  /**
   * {@inheritDoc}
   */
  getNameKey(): string {
    return (this.type == null) ? null : this.type.getNameKey();
  }
  /**
   * {@inheritDoc}
   */
  getZIndex(): number {
    return this.type.getZIndex();
  }
  /**
   * {@inheritDoc}
   */
  isTileTypeAllowed(tileType: TileType): boolean {
    return this.type.isTileTypeAllowed(tileType);
  }
  /**
   * {@inheritDoc}
   */
  applyBonus(goodsType: GoodsType, unitType: UnitType, potential: number): number {
    let result = potential;
    if (potential > 0 && this.isComplete()) {
      result = (result + this.getBonus(goodsType)) | 0;
    }
    return result;
  }
  getBonus(goodsType: GoodsType): number {
    let result = this.getProductionModifier(goodsType);
    if (result == null) {
      return 0;
    } else {
      return $J.d2i(result.getValue$());
    }
  }
  /**
   * {@inheritDoc}
   */
  canProduce(goodsType: GoodsType, unitType: UnitType): boolean {
    return false;
  }
  /**
   * {@inheritDoc}
   */
  getProductionModifiers(goodsType: GoodsType, unitType: UnitType): Stream<Modifier> {
    if (goodsType == null || !this.isComplete()) {
      return Stream.empty();
    }
    let spec = this.getSpecification();
    if (unitType == null && this.isNatural() && goodsType.isFoodType()) {
      return Stream.empty();
    }
    if (unitType == null && !this.isNatural() && !goodsType.isFoodType() && spec.getBoolean(GameOptions.ONLY_NATURAL_IMPROVEMENTS)) {
      return Stream.empty();
    }
    let m = this.getProductionModifier(goodsType);
    if (m == null) {
      return Stream.empty();
    }
    if (unitType != null && unitType.getExpertProduction() != null && unitType.getExpertProduction().equals(goodsType)) {
      let expertMultiplicativeModifier = unitType.getModifiers$String$FreeColSpecObjectType$Turn(goodsType.getId(), this.tile.getType(), null).filter((mod) => mod.getType() === Modifier$ModifierType.MULTIPLICATIVE);
      let expertBonus = FeatureContainer.applyModifiers$float$Turn$Stream(m.getValue$(), null, expertMultiplicativeModifier);
      m = Modifier.makeModifier(m);
      m.setValue(expertBonus);
    }
    return Stream.of(m);
  }
  /**
   * {@inheritDoc}
   */
  isNatural(): boolean {
    return this.type.isNatural();
  }
  /**
   * {@inheritDoc}
   */
  isComplete(): boolean {
    return this.turnsToComplete <= 0;
  }
  /**
   * {@inheritDoc}
   */
  getLayer(): Map$Layer {
    return Map$Layer.RIVERS;
  }
  /**
   * {@inheritDoc}
   */
  checkIntegrity(fix: boolean, lb: LogBuilder): Constants$IntegrityType {
    let result = super.checkIntegrity(fix, lb);
    let tile = this.getTile$();
    if (this.isRiver()) {
      if (this.style == null) {
        lb.add(['\n  Broken null style river at ', tile]);
        return result.fail();
      }
      let conns = this.style.getString();
      let i = 0;
      for (const $it2 = Direction.longSides.iterator(); $it2.hasNext(); ) {
        let d = $it2.next();
        let dReverse = d.getReverseDirection();
        let t = tile.getNeighbourOrNull(d);
        let river = (t == null) ? null : t.getRiver();
        if (conns.charCodeAt(i) !== 48 /* '0' */) {
          if (river != null) {
            if (!river.isConnectedTo(dReverse)) {
              if (fix) {
                this.setConnected$Direction$boolean$TileImprovement(d, false);
                lb.add(['\n  Removed broken river connection to ', d, ' at ', tile]);
                result = result.fix();
              } else {
                lb.add(['\n  Broken river connection to ', d, ' at ', tile]);
                result = result.fail();
              }
            }
          } else if (t == null || !t.getType().isWater()) {
            if (fix) {
              this.setConnected$Direction$boolean$TileImprovement(d, false);
              lb.add(['\n  Removed broken river connection to ', d, ' at ', tile]);
              result = result.fix();
            } else {
              lb.add(['\n  Broken river connection to ', d, ' at ', tile]);
              result = result.fail();
            }
          }
        }
        i++;
      }
    } else if (this.isRoad() && this.isComplete()) {
      if (fix) {
        let oldStyle = this.style;
        this.updateRoadConnections(true);
        if (this.style !== oldStyle) {
          lb.add(['\n  Bad road style from ', oldStyle, ' to ', this.style, ' fixed at ', tile]);
          result = result.fix();
        }
      }
      if (this.style == null) {
        lb.add(['\n  Broken road with null style at ', tile]);
        result = result.fail();
      }
    }
    return result;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(TileImprovement));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.type = o.getType();
    this.turnsToComplete = o.getTurnsToComplete();
    this.magnitude = o.getMagnitude();
    this.style = o.getStyle();
    this.virtual = o.getVirtual();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$FreeColObject(TileImprovement.TILE_TAG, this.getTile$());
    xw.writeAttribute$String$FreeColObject(TileImprovement.TYPE_TAG, this.getType());
    xw.writeAttribute$String$int(TileImprovement.TURNS_TAG, this.turnsToComplete);
    xw.writeAttribute$String$int(TileImprovement.MAGNITUDE_TAG, this.magnitude);
    if (this.style != null) {
      xw.writeAttribute$String$Object(TileImprovement.STYLE_TAG, this.style);
    }
    if (this.virtual) {
      xw.writeAttribute$String$boolean(TileImprovement.VIRTUAL_TAG, this.virtual);
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    let spec = this.getSpecification();
    let game = this.getGame();
    this.tile = xr.makeFreeColObject(game, TileImprovement.TILE_TAG, $J.cls(Tile), true);
    this.type = xr.getType(spec, TileImprovement.TYPE_TAG, $J.cls(TileImprovementType), null);
    this.turnsToComplete = xr.getAttribute$String$int(TileImprovement.TURNS_TAG, 0);
    this.magnitude = xr.getAttribute$String$int(TileImprovement.MAGNITUDE_TAG, 0);
    this.virtual = xr.getAttribute$String$boolean(TileImprovement.VIRTUAL_TAG, false);
    this.style = null;
    let str = xr.getAttribute$String$String(TileImprovement.STYLE_TAG, null);
    let dirns = this.getConnectionDirections();
    if (dirns == null) {
      if (str != null && !(str.length === 0)) {
        TileImprovement.logger.warning('At ' + $J.str(this.tile) + ' ignored nonempty style for ' + $J.str(this.type) + ': ' + str);
      }
    } else if (str == null) {
    } else if (str.length !== dirns.size()) {
      TileImprovement.logger.warning('At ' + $J.str(this.tile) + ' ignored bogus style for ' + $J.str(this.type) + ': ' + str);
    } else {
      this.style = TileImprovementStyle.getInstance(str);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return TileImprovement.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(64);
    let ty = this.getType();
    sb.append(String.fromCharCode(91 /* '[' */)).append((ty == null) ? 'NOTYPE' : ty.getId());
    if (this.turnsToComplete > 0) {
      sb.append(' (').append(String(this.turnsToComplete)).append(' turns left)');
    }
    if (this.style != null) {
      sb.append(String.fromCharCode(32 /* ' ' */)).append(this.style.getString());
    }
    sb.append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
  static $clinit() {
    TileImprovement.logger = Logger.getLogger($J.cls(TileImprovement).getName());
  }
}

$J.define(TileImprovement, 'net.sf.freecol.common.model.TileImprovement', { kind: 'class', sup: 'net.sf.freecol.common.model.TileItem', ctors: { 'net.sf.freecol.common.model.Game,java.lang.String': '_TileImprovement$Game$String', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.model.Tile,net.sf.freecol.common.model.TileImprovementType,net.sf.freecol.common.model.TileImprovementStyle': '_TileImprovement$Game$Tile$TileImprovementType$TileImprovementStyle' }, returns: { 'getXMLTagName': 'java.lang.String', 'getLayer': 'net.sf.freecol.common.model.Map$Layer', 'isComplete': 'boolean', 'isNatural': 'boolean', 'getZIndex': 'int', 'getNameKey': 'java.lang.String', 'getDisasterChoices': 'java.util.stream.Stream', 'getConnectionsFromStyle': 'long', 'getConnections': 'java.util.Map', 'getVirtual': 'boolean', 'getStyle': 'net.sf.freecol.common.model.TileImprovementStyle', 'getMagnitude': 'int', 'getTurnsToComplete': 'int', 'getConnectionDirections': 'java.util.List', 'isRoad': 'boolean', 'isRiver': 'boolean', 'getType': 'net.sf.freecol.common.model.TileImprovementType' }, meths: { 'setConnected(net.sf.freecol.common.model.Direction,boolean,java.lang.String)': 'setConnected$Direction$boolean$String$TileImprovement', 'setConnected(net.sf.freecol.common.model.Direction,boolean)': 'setConnected$Direction$boolean$TileImprovement' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Direction = $J.load('net.sf.freecol.common.model.Direction');
  FeatureContainer = $J.load('net.sf.freecol.common.model.FeatureContainer');
  Map$Layer = $J.load('net.sf.freecol.common.model.Map$Layer');
  Modifier = $J.load('net.sf.freecol.common.model.Modifier');
  Modifier$ModifierType = $J.load('net.sf.freecol.common.model.Modifier$ModifierType');
  Tile = $J.load('net.sf.freecol.common.model.Tile');
  TileImprovementStyle = $J.load('net.sf.freecol.common.model.TileImprovementStyle');
  TileImprovementType = $J.load('net.sf.freecol.common.model.TileImprovementType');
  GameOptions = $J.load('net.sf.freecol.common.option.GameOptions');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
