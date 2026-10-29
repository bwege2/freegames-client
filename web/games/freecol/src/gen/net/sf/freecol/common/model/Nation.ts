// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/Nation.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { FreeColSpecObjectType } from './FreeColSpecObjectType.ts';

let Color, Messages, Constants, FreeColObject, NationType, CollectionUtils, RandomUtils;

/**
 * Represents one of the nations present in the game.
 */
export class Nation extends FreeColSpecObjectType {
  static readonly TAG: string = 'nation';
  /**
   * The unknown enemy id.
   */
  static readonly UNKNOWN_NATION_ID: string = 'model.nation.unknownEnemy';
  /**
   * The last resort unknown nation color.
   */
  static UNKNOWN_NATION_COLOR: Color = null;
  /**
   * A list of European nation names, where model.nation.X.name exists.
   * Used by getNonPlayerNation().
   */
  static EUROPEAN_NATIONS: List<string> = null;
  /**
   * The nation type, European, native, etc.
   */
  type: NationType = null;
  /**
   * Can this nation be selected?
   */
  selectable: boolean = false;
  /**
   * The REF nation to oppose this nation.
   */
  refNation: Nation = null;
  /**
   * The preferred starting latitude for this nation.
   */
  preferredLatitude: number = 0;
  /**
   * Whether this nation starts on the East coast by default.
   */
  startsOnEastCoast: boolean = false;
  /**
   * The color of this nation.
   */
  color: Color = null;
  static readonly COLOR_TAG: string = 'color';
  static readonly NATION_TYPE_TAG: string = 'nation-type';
  static readonly PREFERRED_LATITUDE_TAG: string = 'preferred-latitude';
  static readonly REF_TAG: string = 'ref';
  static readonly SELECTABLE_TAG: string = 'selectable';
  static readonly STARTS_ON_EAST_COAST_TAG: string = 'starts-on-east-coast';
  static readonly OLD_PREFERRED_LATITUDE_TAG: string = 'preferredLatitude';
  static readonly OLD_STARTS_ON_EAST_COAST_TAG: string = 'startsOnEastCoast';
  /**
   * Create a new nation.
   *
   * @param id The object identifier.
   * @param specification The {@code Specification} to refer to.
   */
  _Nation(id: string, specification: Specification): this {
    this._FreeColSpecObjectType$String$Specification(id, specification);
    this.preferredLatitude = 0;
    this.startsOnEastCoast = true;
    return this;
  }
  /**
   * Is this the unknown enemy nation?
   *
   * @return True if this is the unknown enemy.
   */
  isUnknownEnemy(): boolean {
    return $J.equals(Nation.UNKNOWN_NATION_ID, this.getId());
  }
  /**
   * Get the nation type.
   *
   * @return The nation type.
   */
  getType(): NationType {
    return this.type;
  }
  /**
   * Set the nation type.  Needed to when "no advantages" is selected.
   *
   * @param type The new {@code NationType}.
   */
  setType(type$: NationType): void {
    this.type = type$;
  }
  /**
   * Is this nation selectable?
   *
   * @return True if the nation is selectable.
   */
  isSelectable(): boolean {
    return this.selectable;
  }
  /**
   * Get the REF nation to oppose this nation.
   *
   * @return The REF {@code Nation}, or null if not applicable.
   */
  getREFNation(): Nation {
    return this.refNation;
  }
  /**
   * Get the rebel nation to oppose this REF nation.
   *
   * @return The rebel {@code Nation}, or null if not applicable.
   */
  getRebelNation(): Nation {
    return CollectionUtils.find$Collection$Predicate(this.getSpecification().getEuropeanNations(), CollectionUtils.matchKey$Object$Function(this, ($p0) => $p0.getREFNation()));
  }
  /**
   * Get the preferred latitude of this nation.
   *
   * @return The preferred latitude.
   */
  getPreferredLatitude(): number {
    return this.preferredLatitude;
  }
  /**
   * Does this nation start on the east coast by default?
   *
   * @return True if the nation starts on the east coast.
   */
  getStartsOnEastCoast(): boolean {
    return this.startsOnEastCoast;
  }
  /**
   * Get the nation color.
   *
   * @return The color for this nation.
   */
  getColor(): Color {
    return this.color;
  }
  /**
   * Set the nation color.
   *
   * @param color The new nation color.
   */
  setColor(color: Color): void {
    this.color = color;
  }
  /**
   * Get a message key for the ruler of this nation.
   *
   * @return The name key for the ruler.
   */
  getRulerNameKey(): string {
    return Messages.rulerKey(this.getId());
  }
  /**
   * Get the name of the nation monarch.
   *
   * @return The ruler name.
   */
  getRulerName(): string {
    return Messages.message$String(this.getRulerNameKey());
  }
  /**
   * Get a random player name key that is not in use by an active player.
   *
   * @param game The current {@code Game}.
   * @param random A pseudo-random number source.
   * @return A player name key, or an empty string on failure.
   */
  static getRandomNonPlayerNationNameKey(game: Game, random: Random): string {
    let nations = Nation.EUROPEAN_NATIONS.size();
    let start = RandomUtils.randomInt(FreeColObject.logger, 'Random nation', random, nations);
    for (let index = 0; index < nations; index++) {
      let nationId = 'model.nation.' + Nation.EUROPEAN_NATIONS.get(((start + index) | 0) % nations);
      if (game.getPlayerByNationId(nationId) == null) {
        return Messages.nameKey$String(nationId);
      }
    }
    return '';
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(Nation));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.type = o.getType();
    this.selectable = o.isSelectable();
    this.refNation = o.getREFNation();
    this.preferredLatitude = o.getPreferredLatitude();
    this.startsOnEastCoast = o.getStartsOnEastCoast();
    this.color = o.getColor();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$FreeColObject(Nation.NATION_TYPE_TAG, this.type);
    xw.writeAttribute$String$boolean(Nation.SELECTABLE_TAG, this.selectable);
    xw.writeAttribute$String$int(Nation.PREFERRED_LATITUDE_TAG, this.preferredLatitude);
    xw.writeAttribute$String$boolean(Nation.STARTS_ON_EAST_COAST_TAG, this.startsOnEastCoast);
    if (this.refNation != null) {
      xw.writeAttribute$String$FreeColObject(Nation.REF_TAG, this.refNation);
    }
    if (this.color != null) {
      xw.writeAttribute$String$int(Nation.COLOR_TAG, this.color.getRGB());
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    let spec = this.getSpecification();
    this.type = xr.getType(spec, Nation.NATION_TYPE_TAG, $J.cls(NationType), null);
    this.selectable = xr.getAttribute$String$boolean(Nation.SELECTABLE_TAG, false);
    if (xr.hasAttribute(Nation.OLD_PREFERRED_LATITUDE_TAG)) {
      this.preferredLatitude = xr.getAttribute$String$int(Nation.OLD_PREFERRED_LATITUDE_TAG, 0);
    } else {
      this.preferredLatitude = xr.getAttribute$String$int(Nation.PREFERRED_LATITUDE_TAG, 0);
    }
    if (xr.hasAttribute(Nation.OLD_STARTS_ON_EAST_COAST_TAG)) {
      this.startsOnEastCoast = xr.getAttribute$String$boolean(Nation.OLD_STARTS_ON_EAST_COAST_TAG, true);
    } else {
      this.startsOnEastCoast = xr.getAttribute$String$boolean(Nation.STARTS_ON_EAST_COAST_TAG, true);
    }
    this.refNation = xr.getType(spec, Nation.REF_TAG, $J.cls(Nation), null);
    let rgb = xr.getAttribute$String$int(Nation.COLOR_TAG, Constants.UNDEFINED);
    if (rgb !== Constants.UNDEFINED) {
      this.setColor(new Color()._Color$int(rgb));
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return Nation.TAG;
  }
  static $clinit() {
    Nation.UNKNOWN_NATION_COLOR = Color.BLACK;
    Nation.EUROPEAN_NATIONS = CollectionUtils.makeUnmodifiableList(['dutch', 'english', 'french', 'spanish', 'danish', 'portuguese', 'swedish', 'russian', 'austrian', 'german', 'prussian', 'turkish']);
  }
}

$J.define(Nation, 'net.sf.freecol.common.model.Nation', { kind: 'class', sup: 'net.sf.freecol.common.model.FreeColSpecObjectType', ctors: { 'java.lang.String,net.sf.freecol.common.model.Specification': '_Nation' }, returns: { 'getXMLTagName': 'java.lang.String', 'getRulerName': 'java.lang.String', 'getRulerNameKey': 'java.lang.String', 'getColor': 'java.awt.Color', 'getStartsOnEastCoast': 'boolean', 'getPreferredLatitude': 'int', 'getRebelNation': 'net.sf.freecol.common.model.Nation', 'getREFNation': 'net.sf.freecol.common.model.Nation', 'isSelectable': 'boolean', 'getType': 'net.sf.freecol.common.model.NationType', 'isUnknownEnemy': 'boolean' }, clinit: true, lazy: ['UNKNOWN_NATION_COLOR', 'EUROPEAN_NATIONS'] });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Constants = $J.load('net.sf.freecol.common.model.Constants');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  NationType = $J.load('net.sf.freecol.common.model.NationType');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  RandomUtils = $J.load('net.sf.freecol.common.util.RandomUtils');
});
