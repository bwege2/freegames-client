// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/Region.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, JEnum, Logger, StringBuilder } from '../../../../../../jre/index.ts';
import { FreeColGameObject } from './FreeColGameObject.ts';

let Messages, Constants, FreeColObject, Player, StringTemplate, Turn, CollectionUtils, StringUtils;

/**
 * A named region on the map.
 */
export class Region extends FreeColGameObject {
  static logger: Logger = null;
  static readonly TAG: string = 'region';
  /**
   * The keys for the valid predefined regions.
   */
  static predefinedRegionKeys: List<string> = null;
  /**
   * Hardwired name key for the Pacific for the benefit of isPacific().
   */
  static readonly PACIFIC_KEY: string = 'model.region.pacific';
  /**
   * The name of this region, given by a player.
   */
  name: string = null;
  /**
   * The key for this region if it is a predefined one.
   */
  key: string = null;
  /**
   * The type of region.
   */
  type: Region$RegionType = null;
  /**
   * The parent region of this region.
   */
  parent: Region = null;
  /**
   * The child regions of this region.
   */
  children_: List<Region> = null;
  /**
   * Whether this region is claimable.
   * Ocean regions and non-leaf regions are not claimable.
   */
  claimable: boolean = false;
  /**
   * Whether this region is discoverable.  The Eastern Ocean regions
   * should not be discoverable.  In general, non-leaf regions should
   * not be discoverable.  The Pacific Ocean is an exception however,
   * unless players start there.
   */
  discoverable: boolean = false;
  /**
   * Which Turn the region was discovered in.
   */
  discoveredIn: Turn = null;
  /**
   * Which Player the Region was discovered by.
   */
  discoveredBy: Player = null;
  /**
   * Identifier for the unit the region was discovered by.   Using
   * an identifier as units may subsequently die.
   */
  discoverer: string = null;
  /**
   * How much discovering this region contributes to your score.
   * This should be zero unless the region is discoverable.
   */
  scoreValue: number = 0;
  static readonly CHILD_TAG: string = 'child';
  static readonly CLAIMABLE_TAG: string = 'claimable';
  static readonly DISCOVERABLE_TAG: string = 'discoverable';
  static readonly DISCOVERED_BY_TAG: string = 'discoveredBy';
  static readonly DISCOVERED_IN_TAG: string = 'discoveredIn';
  static readonly KEY_TAG: string = 'key';
  static readonly NAME_TAG: string = 'name';
  static readonly PARENT_TAG: string = 'parent';
  static readonly SCORE_VALUE_TAG: string = 'scoreValue';
  static readonly TYPE_TAG: string = 'type';
  static readonly NAME_KEY_TAG: string = 'nameKey';
  $init_Region() {
    this.children_ = null;
    this.claimable = false;
    this.discoverable = false;
    this.discoverer = null;
    this.scoreValue = 0;
  }
  /**
   * Creates a new {@code Region} instance.
   *
   * @param game The enclosing {@code Game}.
   */
  _Region$Game(game: Game): this {
    this._FreeColGameObject$Game(game);
    this.$init_Region();
    return this;
  }
  /**
   * Creates a new {@code Region} instance.
   *
   * @param game The enclosing {@code Game}.
   * @param id The object identifier.
   */
  _Region$Game$String(game: Game, id: string): this {
    this._FreeColGameObject$Game$String(game, id);
    this.$init_Region();
    return this;
  }
  /**
   * Get the key for this region.
   *
   * @return The region key, which will be null for non-fixed regions.
   */
  getKey(): string {
    return this.key;
  }
  /**
   * Does this region have a name?
   *
   * @return True if the region has been named or was predefined.
   */
  hasName(): boolean {
    return this.name != null || this.key != null;
  }
  /**
   * Is this region the Pacific Ocean?
   *
   * The Pacific Ocean is special in that it is the only Region that
   * could be discovered in the original game.
   *
   * @return True if this region is the Pacific.
   */
  isPacific(): boolean {
    return $J.equals(Region.PACIFIC_KEY, this.key) || (this.parent != null && this.parent.isPacific());
  }
  /**
   * Gets the name or default name of this Region.
   *
   * @return The i18n-ready name for the region.
   */
  getLabel(): StringTemplate {
    return (this.key != null) ? StringTemplate.key$String(Messages.nameKey$String(this.key)) : (this.name != null) ? StringTemplate.name_(this.name) : StringTemplate.key$String(this.type.getUnknownKey());
  }
  /**
   * Gets the type of the region.
   *
   * @return The region type.
   */
  getType(): Region$RegionType {
    return this.type;
  }
  /**
   * Gets the enclosing parent region.
   *
   * @return The parent region
   */
  getParent(): Region {
    return this.parent;
  }
  /**
   * Sets the parent region.
   *
   * @param newParent The new parent region.
   */
  setParent(newParent: Region): void {
    this.parent = newParent;
  }
  /**
   * Get a list of the child regions.
   *
   * @return The child regions.
   */
  getChildren(): List<Region> {
    return (this.children_ == null) ? Collections.emptyList() : this.children_;
  }
  /**
   * Sets the child regions.
   *
   * @param newChildren The new child regions.
   */
  setChildren(newChildren: List<Region>): void {
    this.children_ = newChildren;
  }
  /**
   * Add a child region to this region.
   *
   * @param child The child {@code Region} to add.
   */
  addChild(child: Region): void {
    if (this.children_ == null) {
      this.children_ = new ArrayList();
    }
    this.children_.add(child);
  }
  /**
   * Is this a leaf region?
   *
   * @return True if the region has no children.
   */
  isLeaf(): boolean {
    return this.children_ == null || this.children_.isEmpty();
  }
  /**
   * Can this region be claimed?
   *
   * @return True if the region can be claimed.
   */
  getClaimable(): boolean {
    return this.claimable;
  }
  /**
   * Set the claimability of this region.
   *
   * @param newClaimable True if the region can be claimed.
   */
  setClaimable(newClaimable: boolean): void {
    this.claimable = newClaimable;
  }
  /**
   * Can this region be discovered?
   *
   * @return True if the region can be discovered.
   */
  getDiscoverable(): boolean {
    return this.discoverable;
  }
  /**
   * Set the discoverability of this region.
   *
   * @param newDiscoverable True if the region can be discovered.
   */
  setDiscoverable(newDiscoverable: boolean): void {
    this.discoverable = newDiscoverable;
  }
  /**
   * Get the identifier for the unit that discovered the region.
   *
   * @return The unit identifier, or null if none yet.
   */
  getDiscoverer(): string {
    return this.discoverer;
  }
  /**
   * Gets a discoverable Region or null.  If this region is
   * discoverable, it is returned.  If not, a discoverable parent is
   * returned, unless there is none.  This is intended for
   * discovering the Pacific Ocean when discovering one of its
   * sub-Regions.
   *
   * @return A discoverable a region, or null if none found.
   */
  getDiscoverableRegion(): Region {
    return (this.getDiscoverable()) ? this : (this.getParent() != null) ? this.getParent().getDiscoverableRegion() : null;
  }
  /**
   * Gets the turn the region was discovered in.
   *
   * @return The discovery turn.
   */
  getDiscoveredIn(): Turn {
    return this.discoveredIn;
  }
  /**
   * Sets the discovery turn.
   *
   * @param newDiscoveredIn The new discoveredy turn.
   */
  setDiscoveredIn(newDiscoveredIn: Turn): void {
    this.discoveredIn = newDiscoveredIn;
  }
  /**
   * Gets the player that discovered the region.
   *
   * @return The discovering {@code Player}.
   */
  getDiscoveredBy(): Player {
    return this.discoveredBy;
  }
  /**
   * Sets the discovering player.
   *
   * @param newDiscoveredBy The new discovering player.
   */
  setDiscoveredBy(newDiscoveredBy: Player): void {
    this.discoveredBy = newDiscoveredBy;
  }
  /**
   * Gets the score for discovering this region.
   *
   * @return The score.
   */
  getScoreValue(): number {
    return this.scoreValue;
  }
  /**
   * Sets the score for discovering this region.
   *
   * @param newScoreValue The new score.
   */
  setScoreValue(newScoreValue: number): void {
    this.scoreValue = newScoreValue;
  }
  /**
   * Check if this region is has been discovered.
   *
   * Reserve the ability to discover this region by setting the discoverer
   * field.
   * Called in csCheckDiscoverRegion when the unit moves into a
   * discoverable region.
   *
   * @param unit The {@code Unit} that might have discovered the region.
   * @return True if the region has been discovered.
   */
  checkDiscover(unit: Unit): boolean {
    if (this.discoverable) {
      if (this.discoverer == null) {
        this.discoverer = unit.getId();
        return true;
      } else if ($J.equals(this.discoverer, unit.getId())) {
        return true;
      }
    }
    return false;
  }
  /**
   * Discover this region (and its children).
   *
   * @param player The discovering {@code Player}.
   * @param unit The discovering {@code Unit}.
   * @param turn The {@code Turn} of discovery.
   * @return A list of discovered {@code Region}s.
   */
  discover(player: Player, unit: Unit, turn: Turn): List<Region> {
    if (unit == null || this.discoverer == null || !$J.equals(this.discoverer, unit.getId())) {
      return Collections.emptyList();
    }
    this.discoveredBy = player;
    this.discoveredIn = turn;
    this.discoverable = false;
    let discov = CollectionUtils.transform$Collection$Predicate(this.getChildren(), ($p0) => $p0.getDiscoverable());
    for (const $it0 = discov.iterator(); $it0.hasNext(); ) {
      let r = $it0.next();
      r.discoveredBy = player;
      r.discoverer = unit.getId();
      r.discoveredIn = turn;
      r.discoverable = false;
    }
    let result = new ArrayList((discov.size() + 1) | 0);
    result.add(this);
    result.addAll(discov);
    return result;
  }
  /**
   * Is a key one of the dodgy keys that were generated up to 0.11.3?
   *
   * @param key The key to check.
   * @return A valid key or null if already null or invalid.
   */
  fixRegionKey(key: string): string {
    if (key == null) {
      return key;
    }
    for (const $it1 = Region.predefinedRegionKeys.iterator(); $it1.hasNext(); ) {
      let r = $it1.next();
      if ($J.equals(key, r)) {
        return r;
      } else if ($J.equals(key, Messages.nameKey$String(r))) {
        return StringUtils.lastPart(key, '.');
      }
    }
    return null;
  }
  /**
   * {@inheritDoc}
   */
  getName(): string {
    return this.name;
  }
  /**
   * {@inheritDoc}
   */
  setName(newName: string): void {
    this.name = newName;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(Region));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    let game = this.getGame();
    this.name = o.getName();
    this.key = o.getKey();
    this.type = o.getType();
    this.parent = game.updateRef$FreeColGameObject(o.getParent());
    this.children_ = game.updateRef$Collection(o.getChildren());
    this.claimable = o.getClaimable();
    this.discoverable = o.getDiscoverable();
    this.discoveredIn = o.getDiscoveredIn();
    this.discoveredBy = game.updateRef$FreeColGameObject(o.getDiscoveredBy());
    this.discoverer = o.getDiscoverer();
    this.scoreValue = o.getScoreValue();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    if (this.name != null) {
      xw.writeAttribute(Region.NAME_TAG, this.name);
    }
    if (this.key != null) {
      xw.writeAttribute(Region.KEY_TAG, this.key);
    }
    xw.writeAttribute$String$Enum(Region.TYPE_TAG, this.type);
    xw.writeAttribute$String$boolean(Region.CLAIMABLE_TAG, this.claimable);
    xw.writeAttribute$String$boolean(Region.DISCOVERABLE_TAG, this.discoverable);
    if (this.parent != null) {
      xw.writeAttribute$String$FreeColObject(Region.PARENT_TAG, this.parent);
    }
    if (this.discoveredIn != null) {
      xw.writeAttribute$String$int(Region.DISCOVERED_IN_TAG, this.discoveredIn.getNumber());
    }
    if (this.discoveredBy != null) {
      xw.writeAttribute$String$FreeColObject(Region.DISCOVERED_BY_TAG, this.discoveredBy);
    }
    if (this.scoreValue > 0) {
      xw.writeAttribute$String$int(Region.SCORE_VALUE_TAG, this.scoreValue);
    }
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    for (const $it2 = this.getChildren().iterator(); $it2.hasNext(); ) {
      let child = $it2.next();
      xw.writeStartElement(Region.CHILD_TAG);
      xw.writeAttribute$String$FreeColObject(FreeColObject.ID_ATTRIBUTE_TAG, child);
      xw.writeEndElement();
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.name = xr.getAttribute$String$String(Region.NAME_TAG, null);
    if (xr.hasAttribute(Region.NAME_KEY_TAG)) {
      this.key = xr.getAttribute$String$String(Region.NAME_KEY_TAG, null);
      this.key = this.fixRegionKey(this.key);
    } else {
      this.key = xr.getAttribute$String$String(Region.KEY_TAG, null);
    }
    this.type = xr.getAttribute$String$Class$Enum(Region.TYPE_TAG, $J.cls(Region$RegionType), null);
    this.claimable = xr.getAttribute$String$boolean(Region.CLAIMABLE_TAG, false);
    this.discoverable = xr.getAttribute$String$boolean(Region.DISCOVERABLE_TAG, false);
    this.scoreValue = xr.getAttribute$String$int(Region.SCORE_VALUE_TAG, 0);
    let turn = xr.getAttribute$String$int(Region.DISCOVERED_IN_TAG, Constants.UNDEFINED);
    this.discoveredIn = (turn === Constants.UNDEFINED) ? null : new Turn()._Turn(turn);
    this.discoveredBy = xr.findFreeColGameObject(this.getGame(), Region.DISCOVERED_BY_TAG, $J.cls(Player), null, false);
    this.parent = xr.makeFreeColObject(this.getGame(), Region.PARENT_TAG, $J.cls(Region), false);
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    this.children_ = null;
    super.readChildren(xr);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let tag = xr.getLocalName();
    if ($J.equals(Region.CHILD_TAG, tag)) {
      this.addChild(xr.makeFreeColObject(this.getGame(), FreeColObject.ID_ATTRIBUTE_TAG, $J.cls(Region), true));
      xr.closeTag$String(Region.CHILD_TAG);
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return Region.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(32);
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.getId()).append(String.fromCharCode(32 /* ' ' */)).append((this.key != null) ? this.key : (this.name != null) ? this.name : '<unnamed>').append(String.fromCharCode(32 /* ' ' */)).append($J.str(this.type));
    if (this.getDiscoverable()) {
      sb.append(String.fromCharCode(33 /* '!' */));
    } else {
      sb.append('discoverer=').append(this.discoverer);
    }
    sb.append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
  static $clinit() {
    Region.logger = Logger.getLogger($J.cls(Region).getName());
    Region.predefinedRegionKeys = CollectionUtils.makeUnmodifiableList(['model.region.arctic', 'model.region.antarctic', 'model.region.northWest', 'model.region.north', 'model.region.northEast', 'model.region.west', 'model.region.center', 'model.region.east', 'model.region.southWest', 'model.region.south', 'model.region.southEast', 'model.region.atlantic', 'model.region.northAtlantic', 'model.region.southAtlantic', 'model.region.pacific', 'model.region.northPacific', 'model.region.southPacific']);
  }
}

/**
 * The type of region.
 */
export class Region$RegionType extends JEnum {
  /**
   * Are regions of this type claimable by default?
   */
  claimable: boolean = false;
  static OCEAN: Region$RegionType = null;
  static COAST: Region$RegionType = null;
  static LAKE: Region$RegionType = null;
  static RIVER: Region$RegionType = null;
  static LAND: Region$RegionType = null;
  static MOUNTAIN: Region$RegionType = null;
  static DESERT: Region$RegionType = null;
  static $VALUES: Region$RegionType[] = null;
  /**
   * Create a region type.
   *
   * @param claimable The default claimability of this region type.
   */
  _Region$RegionType($name: string, $ordinal: number, claimable: boolean): this {
    this._JEnum($name, $ordinal);
    this.claimable = claimable;
    return this;
  }
  /**
   * Is this region claimable by default?
   *
   * @return True if this region type is normally claimable.
   */
  getClaimable(): boolean {
    return this.claimable;
  }
  /**
   * Get a stem key for this region type.
   *
   * @return A stem key.
   */
  getKey(): string {
    return 'regionType.' + StringUtils.getEnumKey(this);
  }
  /**
   * Gets a message key for an unknown region of this type.
   *
   * @return A message key.
   */
  getUnknownKey(): string {
    return 'model.' + this.getKey() + '.unknown';
  }
  /**
   * {@inheritDoc}
   */
  getNameKey(): string {
    return Messages.nameKey$String('model.' + this.getKey());
  }
  static values(): Region$RegionType[] { return Region$RegionType.$VALUES.slice(); }
  static valueOf(name: string): Region$RegionType { return $J.enumValueOf(Region$RegionType, name); }
  static $clinit() {
    Region$RegionType.OCEAN = new Region$RegionType()._Region$RegionType('OCEAN', 0, false);
    Region$RegionType.COAST = new Region$RegionType()._Region$RegionType('COAST', 1, false);
    Region$RegionType.LAKE = new Region$RegionType()._Region$RegionType('LAKE', 2, false);
    Region$RegionType.RIVER = new Region$RegionType()._Region$RegionType('RIVER', 3, true);
    Region$RegionType.LAND = new Region$RegionType()._Region$RegionType('LAND', 4, true);
    Region$RegionType.MOUNTAIN = new Region$RegionType()._Region$RegionType('MOUNTAIN', 5, true);
    Region$RegionType.DESERT = new Region$RegionType()._Region$RegionType('DESERT', 6, true);
    Region$RegionType.$VALUES = [Region$RegionType.OCEAN, Region$RegionType.COAST, Region$RegionType.LAKE, Region$RegionType.RIVER, Region$RegionType.LAND, Region$RegionType.MOUNTAIN, Region$RegionType.DESERT];
  }
}

$J.define(Region, 'net.sf.freecol.common.model.Region', { kind: 'class', ifaces: ['net.sf.freecol.common.model.Nameable'], sup: 'net.sf.freecol.common.model.FreeColGameObject', ctors: { 'net.sf.freecol.common.model.Game,java.lang.String': '_Region$Game$String', 'net.sf.freecol.common.model.Game': '_Region$Game' }, returns: { 'getXMLTagName': 'java.lang.String', 'getName': 'java.lang.String', 'getScoreValue': 'int', 'getDiscoveredBy': 'net.sf.freecol.common.model.Player', 'getDiscoveredIn': 'net.sf.freecol.common.model.Turn', 'getDiscoverableRegion': 'net.sf.freecol.common.model.Region', 'getDiscoverer': 'java.lang.String', 'getDiscoverable': 'boolean', 'getClaimable': 'boolean', 'isLeaf': 'boolean', 'getChildren': 'java.util.List', 'getParent': 'net.sf.freecol.common.model.Region', 'getType': 'net.sf.freecol.common.model.Region$RegionType', 'getLabel': 'net.sf.freecol.common.model.StringTemplate', 'isPacific': 'boolean', 'hasName': 'boolean', 'getKey': 'java.lang.String' }, clinit: true, lazy: ['logger', 'predefinedRegionKeys'] });
$J.define(Region$RegionType, 'net.sf.freecol.common.model.Region$RegionType', { kind: 'enum', ifaces: ['net.sf.freecol.common.model.Named'], sup: 'java.lang.Enum', ctors: { 'boolean': '_Region$RegionType' }, returns: { 'getNameKey': 'java.lang.String', 'getUnknownKey': 'java.lang.String', 'getKey': 'java.lang.String', 'getClaimable': 'boolean' }, clinit: true, lazy: ['$VALUES', 'OCEAN', 'COAST', 'LAKE', 'RIVER', 'LAND', 'MOUNTAIN', 'DESERT'] });
$J.module(() => {
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Constants = $J.load('net.sf.freecol.common.model.Constants');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  Player = $J.load('net.sf.freecol.common.model.Player');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Turn = $J.load('net.sf.freecol.common.model.Turn');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
});
