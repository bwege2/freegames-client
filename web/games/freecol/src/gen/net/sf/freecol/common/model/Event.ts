// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/Event.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
 *  MERCHANTLIMIT or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with FreeCol.  If not, see <http://www.gnu.org/licenses/>.
 */
import { $J, Collections, HashMap } from '../../../../../../jre/index.ts';
import { FreeColSpecObjectType } from './FreeColSpecObjectType.ts';

let FreeColObject, Limit;

/**
 * A special game event.
 */
export class Event extends FreeColSpecObjectType {
  static readonly TAG: string = 'event';
  /**
   * A restriction on the scope of the event.
   */
  value_: string = null;
  /**
   * The score value of this event.
   */
  scoreValue: number = 0;
  /**
   * Limits on this event.
   */
  limits: JMap<string, Limit> = null;
  static readonly SCORE_VALUE_TAG: string = 'score-value';
  static readonly OLD_SCORE_VALUE_TAG: string = 'scoreValue';
  $init_Event() {
    this.scoreValue = 0;
    this.limits = null;
  }
  /**
   * Create a new event.
   *
   * @param id The object identifier.
   * @param specification The {@code Specification} to refer to.
   */
  _Event$String$Specification(id: string, specification: Specification): this {
    this._FreeColSpecObjectType$String$Specification(id, specification);
    this.$init_Event();
    return this;
  }
  /**
   * Create a new event.
   *
   * @param xr The {@code FreeColXMLReader} to read from.
   * @param specification The {@code Specification} to refer to.
   * @exception XMLStreamException if there a problem reading the stream.
   */
  _Event$FreeColXMLReader$Specification(xr: FreeColXMLReader, specification: Specification): this {
    this._FreeColSpecObjectType$Specification(specification);
    this.$init_Event();
    this.readFromXML(xr);
    return this;
  }
  /**
   * Gets the event restriction.
   *
   * @return The restriction.
   */
  getValue(): string {
    return this.value_;
  }
  /**
   * Sets the event restriction.
   *
   * @param newValue The new event restriction.
   */
  setValue(newValue: string): void {
    this.value_ = newValue;
  }
  /**
   * Get the score value of this event.
   *
   * @return The score value.
   */
  getScoreValue(): number {
    return this.scoreValue;
  }
  /**
   * Set the score value of this event.
   *
   * @param newScoreValue The new score value.
   */
  setScoreValue(newScoreValue: number): void {
    this.scoreValue = newScoreValue;
  }
  /**
   * Get the limit map.
   *
   * @return The map of the limits.
   */
  getLimits(): JMap<string, Limit> {
    return this.limits;
  }
  /**
   * Set the limits on this event.
   *
   * @param limits A new limits map.
   */
  setLimits(limits: JMap<string, Limit>): void {
    if (this.limits == null) {
      this.limits = new HashMap();
    } else {
      this.limits.clear();
    }
    this.limits.putAll(limits);
  }
  /**
   * Get the limits on this event.
   *
   * @return A list of limits.
   */
  getLimitValues(): Collection<Limit> {
    return (this.limits == null) ? Collections.emptyList() : this.limits.values();
  }
  /**
   * Gets a particular limit by identifier.
   *
   * @param id The object identifier.
   * @return The corresponding {@code Limit} or null if not found.
   */
  getLimit(id: string): Limit {
    return (this.limits == null) ? null : this.limits.get(id);
  }
  /**
   * Add a limit.
   *
   * @param limit The {@code Limit} to add.
   */
  addLimit(limit: Limit): void {
    if (this.limits == null) {
      this.limits = new HashMap();
    }
    this.limits.put(limit.getId(), limit);
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(Event));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.value_ = o.getValue();
    this.scoreValue = o.getScoreValue();
    this.setLimits(o.getLimits());
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    if (this.value_ != null) {
      xw.writeAttribute(FreeColObject.VALUE_TAG, this.value_);
    }
    if (this.scoreValue !== 0) {
      xw.writeAttribute$String$int(Event.SCORE_VALUE_TAG, this.scoreValue);
    }
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    for (const $it0 = this.getLimitValues().iterator(); $it0.hasNext(); ) {
      let limit = $it0.next();
      limit.toXML$FreeColXMLWriter(xw);
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.value_ = xr.getAttribute$String$String(FreeColObject.VALUE_TAG, null);
    if (xr.hasAttribute(Event.OLD_SCORE_VALUE_TAG)) {
      this.scoreValue = xr.getAttribute$String$int(Event.OLD_SCORE_VALUE_TAG, 0);
    } else {
      this.scoreValue = xr.getAttribute$String$int(Event.SCORE_VALUE_TAG, 0);
    }
  }
  /**
   * {@inheritDoc}
   */
  clearContainers$FreeColXMLReader(xr: FreeColXMLReader): void {
    super.clearContainers$FreeColXMLReader(xr);
    this.limits = null;
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    super.readChildren(xr);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let spec = this.getSpecification();
    let tag = xr.getLocalName();
    if ($J.equals(Limit.TAG, tag)) {
      this.addLimit(new Limit()._Limit$FreeColXMLReader$Specification(xr, spec));
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return Event.TAG;
  }
}

$J.define(Event, 'net.sf.freecol.common.model.Event', { kind: 'class', sup: 'net.sf.freecol.common.model.FreeColSpecObjectType', ctors: { 'net.sf.freecol.common.io.FreeColXMLReader,net.sf.freecol.common.model.Specification': '_Event$FreeColXMLReader$Specification', 'java.lang.String,net.sf.freecol.common.model.Specification': '_Event$String$Specification' }, returns: { 'getXMLTagName': 'java.lang.String', 'getLimitValues': 'java.util.Collection', 'getLimits': 'java.util.Map', 'getScoreValue': 'int', 'getValue': 'java.lang.String' }, meths: { 'clearContainers(net.sf.freecol.common.io.FreeColXMLReader)': 'clearContainers$FreeColXMLReader' } });
$J.module(() => {
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  Limit = $J.load('net.sf.freecol.common.model.Limit');
});
