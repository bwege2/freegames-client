// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/NationOptions.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, HashMap, JEnum, Logger, StringBuilder, XMLStreamException } from '../../../../../../jre/index.ts';
import { FreeColSpecObject } from './FreeColSpecObject.ts';

let FreeCol, Messages, FreeColObject, Nation, CollectionUtils, StringUtils;

/**
 * The options specific to a nation.
 */
export class NationOptions extends FreeColSpecObject {
  static logger: Logger = null;
  static readonly TAG: string = 'nationOptions';
  /**
   * The type of European national advantages.
   */
  nationalAdvantages: NationOptions$Advantages = null;
  /**
   * All nations in the game.
   */
  nations: JMap<Nation, NationOptions$NationState> = null;
  static readonly NATIONAL_ADVANTAGES_TAG: string = 'nationalAdvantages';
  static readonly NATION_OPTION_TAG: string = 'nationOption';
  static readonly STATE_TAG: string = 'state';
  static readonly OLD_NATION_TAG: string = 'Nation';
  static readonly OLD_NATIONS_TAG: string = 'Nations';
  $init_NationOptions() {
    this.nations = new HashMap();
  }
  /**
   * Creates a new {@code NationOptions} instance.
   *
   * @param specification The {@code Specification} to refer to.
   */
  _NationOptions$Specification(specification: Specification): this {
    this._FreeColSpecObject(specification);
    this.$init_NationOptions();
    this.nationalAdvantages = FreeCol.getAdvantages();
    if (specification != null) {
      let counter = 0;
      let maxEuropeans = FreeCol.getEuropeanCount();
      for (const $it0 = (CollectionUtils.transform$Collection$Predicate(specification.getNations(), (n) => !n.isUnknownEnemy() && !n.getType().isREF())).iterator(); $it0.hasNext(); ) {
        let nation = $it0.next();
        if (nation.getType().isEuropean() && nation.isSelectable()) {
          if (counter < maxEuropeans) {
            this.nations.put(nation, NationOptions$NationState.AVAILABLE);
            counter++;
          } else {
            this.nations.put(nation, NationOptions$NationState.NOT_AVAILABLE);
          }
        } else {
          this.nations.put(nation, NationOptions$NationState.AI_ONLY);
        }
      }
    }
    return this;
  }
  /**
   * Creates a new {@code NationOptions} instance by reading a stream.
   *
   * @param xr The {@code FreeColXMLReader} to read from.
   * @param specification The {@code Specification} to refer to.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  _NationOptions$FreeColXMLReader$Specification(xr: FreeColXMLReader, specification: Specification): this {
    this._NationOptions$Specification(specification);
    this.readFromXML(xr);
    return this;
  }
  /**
   * Get the national advantages.
   *
   * @return The national advantages.
   */
  getNationalAdvantages(): NationOptions$Advantages {
    return this.nationalAdvantages;
  }
  /**
   * Get the nations in the game.
   *
   * @return A map of the nations.
   */
  getNations(): JMap<Nation, NationOptions$NationState> {
    return this.nations;
  }
  /**
   * Set the nation map.
   *
   * @param nations The new nations map.
   */
  setNations(nations: JMap<Nation, NationOptions$NationState>): void {
    this.nations.clear();
    this.nations.putAll(nations);
  }
  /**
   * Get the {@code NationState} value of a particular Nation.
   *
   * @param nation The {@code Nation} to query.
   * @return The corresponding {@code NationState}.
   */
  getNationState(nation: Nation): NationOptions$NationState {
    return this.nations.get(nation);
  }
  /**
   * Set the {@code NationState} value of a particular Nation.
   *
   * @param nation The {@code Nation} to set the state for.
   * @param state The {@code NationState} to set.
   */
  setNationState(nation: Nation, state: NationOptions$NationState): void {
    this.nations.put(nation, state);
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(NationOptions));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.nationalAdvantages = o.getNationalAdvantages();
    this.setNations(o.getNations());
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    xw.writeAttribute$String$Enum(NationOptions.NATIONAL_ADVANTAGES_TAG, this.nationalAdvantages);
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    for (const $it1 = CollectionUtils.sort$Collection(this.nations.keySet()).iterator(); $it1.hasNext(); ) {
      let nation = $it1.next();
      xw.writeStartElement(NationOptions.NATION_OPTION_TAG);
      xw.writeAttribute$String$FreeColObject(FreeColObject.ID_ATTRIBUTE_TAG, nation);
      xw.writeAttribute$String$Enum(NationOptions.STATE_TAG, this.nations.get(nation));
      xw.writeEndElement();
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    this.nationalAdvantages = xr.getAttribute$String$Class$Enum(NationOptions.NATIONAL_ADVANTAGES_TAG, $J.cls(NationOptions$Advantages), NationOptions$Advantages.SELECTABLE);
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    this.nations.clear();
    super.readChildren(xr);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let spec = this.getSpecification();
    let tag = xr.getLocalName();
    if ($J.equals(NationOptions.NATION_OPTION_TAG, tag)) {
      let nation = xr.getType(spec, FreeColObject.ID_ATTRIBUTE_TAG, $J.cls(Nation), null);
      let state = xr.getAttribute$String$Class$Enum(NationOptions.STATE_TAG, $J.cls(NationOptions$NationState), null);
      if (nation != null && state != null) {
        this.nations.put(nation, state);
      }
      xr.closeTag$String(NationOptions.NATION_OPTION_TAG);
    } else if ($J.equals(NationOptions.OLD_NATIONS_TAG, tag)) {
      while (xr.moreTags()) {
        tag = xr.getLocalName();
        if ($J.equals(NationOptions.OLD_NATION_TAG, tag)) {
          let nation = xr.getType(spec, FreeColObject.ID_ATTRIBUTE_TAG, $J.cls(Nation), null);
          let state = xr.getAttribute$String$Class$Enum(NationOptions.STATE_TAG, $J.cls(NationOptions$NationState), null);
          if (nation != null && state != null) {
            this.nations.put(nation, state);
          }
          xr.closeTag$String(NationOptions.OLD_NATION_TAG);
        } else {
          throw new XMLStreamException('Bogus ' + NationOptions.OLD_NATION_TAG + ' tag: ' + tag);
        }
      }
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return NationOptions.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(128);
    sb.append(NationOptions.NATIONAL_ADVANTAGES_TAG).append(': ').append($J.str(this.nationalAdvantages)).append(String.fromCharCode(10 /* \u000a */));
    CollectionUtils.forEachMapEntry$Map$Consumer(this.nations, (e) => sb.append(String.fromCharCode(32 /* ' ' */)).append(e.getKey().getId()).append(String.fromCharCode(32 /* ' ' */)).append($J.str(e.getValue())).append(String.fromCharCode(10 /* \u000a */)));
    return sb.toString();
  }
  static $clinit() {
    NationOptions.logger = Logger.getLogger($J.cls(NationOptions).getName());
  }
}

/**
 * Type of national advantages for European players.
 */
export class NationOptions$Advantages extends JEnum {
  static NONE: NationOptions$Advantages = null;
  static FIXED: NationOptions$Advantages = null;
  static SELECTABLE: NationOptions$Advantages = null;
  static $VALUES: NationOptions$Advantages[] = null;
  _NationOptions$Advantages($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  /**
   * Get a message key for this Advantages.
   *
   * @return A message key.
   */
  getKey(): string {
    return 'advantages.' + StringUtils.getEnumKey(this);
  }
  getShortDescriptionKey(): string {
    return Messages.shortDescriptionKey('model.' + this.getKey());
  }
  /**
   * {@inheritDoc}
   */
  getNameKey(): string {
    return Messages.nameKey$String('model.' + this.getKey());
  }
  static values(): NationOptions$Advantages[] { return NationOptions$Advantages.$VALUES.slice(); }
  static valueOf(name: string): NationOptions$Advantages { return $J.enumValueOf(NationOptions$Advantages, name); }
  static $clinit() {
    NationOptions$Advantages.NONE = new NationOptions$Advantages()._NationOptions$Advantages('NONE', 0);
    NationOptions$Advantages.FIXED = new NationOptions$Advantages()._NationOptions$Advantages('FIXED', 1);
    NationOptions$Advantages.SELECTABLE = new NationOptions$Advantages()._NationOptions$Advantages('SELECTABLE', 2);
    NationOptions$Advantages.$VALUES = [NationOptions$Advantages.NONE, NationOptions$Advantages.FIXED, NationOptions$Advantages.SELECTABLE];
  }
}

/**
 * Nations may be available to all players, to AI players only, or
 * to no players.
 */
export class NationOptions$NationState extends JEnum {
  static AVAILABLE: NationOptions$NationState = null;
  static AI_ONLY: NationOptions$NationState = null;
  static NOT_AVAILABLE: NationOptions$NationState = null;
  static $VALUES: NationOptions$NationState[] = null;
  _NationOptions$NationState($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  /**
   * Get a message key for a nation state.
   *
   * @return A message key.
   */
  getKey(): string {
    return 'nationState.' + StringUtils.getEnumKey(this);
  }
  getShortDescriptionKey(): string {
    return Messages.shortDescriptionKey('model.' + this.getKey());
  }
  /**
   * {@inheritDoc}
   */
  getNameKey(): string {
    return Messages.nameKey$String('model.' + this.getKey());
  }
  static values(): NationOptions$NationState[] { return NationOptions$NationState.$VALUES.slice(); }
  static valueOf(name: string): NationOptions$NationState { return $J.enumValueOf(NationOptions$NationState, name); }
  static $clinit() {
    NationOptions$NationState.AVAILABLE = new NationOptions$NationState()._NationOptions$NationState('AVAILABLE', 0);
    NationOptions$NationState.AI_ONLY = new NationOptions$NationState()._NationOptions$NationState('AI_ONLY', 1);
    NationOptions$NationState.NOT_AVAILABLE = new NationOptions$NationState()._NationOptions$NationState('NOT_AVAILABLE', 2);
    NationOptions$NationState.$VALUES = [NationOptions$NationState.AVAILABLE, NationOptions$NationState.AI_ONLY, NationOptions$NationState.NOT_AVAILABLE];
  }
}

$J.define(NationOptions, 'net.sf.freecol.common.model.NationOptions', { kind: 'class', sup: 'net.sf.freecol.common.model.FreeColSpecObject', ctors: { 'net.sf.freecol.common.io.FreeColXMLReader,net.sf.freecol.common.model.Specification': '_NationOptions$FreeColXMLReader$Specification', 'net.sf.freecol.common.model.Specification': '_NationOptions$Specification' }, returns: { 'getXMLTagName': 'java.lang.String', 'getNations': 'java.util.Map', 'getNationalAdvantages': 'net.sf.freecol.common.model.NationOptions$Advantages' }, clinit: true, lazy: ['logger'] });
$J.define(NationOptions$Advantages, 'net.sf.freecol.common.model.NationOptions$Advantages', { kind: 'enum', ifaces: ['net.sf.freecol.common.model.Named'], sup: 'java.lang.Enum', ctors: { '': '_NationOptions$Advantages' }, returns: { 'getNameKey': 'java.lang.String', 'getShortDescriptionKey': 'java.lang.String', 'getKey': 'java.lang.String' }, clinit: true, lazy: ['$VALUES', 'NONE', 'FIXED', 'SELECTABLE'] });
$J.define(NationOptions$NationState, 'net.sf.freecol.common.model.NationOptions$NationState', { kind: 'enum', ifaces: ['net.sf.freecol.common.model.Named'], sup: 'java.lang.Enum', ctors: { '': '_NationOptions$NationState' }, returns: { 'getNameKey': 'java.lang.String', 'getShortDescriptionKey': 'java.lang.String', 'getKey': 'java.lang.String' }, clinit: true, lazy: ['$VALUES', 'AVAILABLE', 'AI_ONLY', 'NOT_AVAILABLE'] });
$J.module(() => {
  FreeCol = $J.load('net.sf.freecol.FreeCol');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  Nation = $J.load('net.sf.freecol.common.model.Nation');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
});
