// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/Disaster.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, JEnum, StringBuilder } from '../../../../../../jre/index.ts';
import { FreeColSpecObjectType } from './FreeColSpecObjectType.ts';

let Effect, RandomChoice;

/**
 * This class describes disasters that can happen to a Colony, such as
 * flooding, disease or Indian raids.
 */
export class Disaster extends FreeColSpecObjectType {
  static readonly TAG: string = 'disaster';
  /**
   * Bankruptcy occurs if upkeep is enabled and a player is unable
   * to pay for the maintenance of all buildings.
   */
  static readonly BANKRUPTCY: string = 'model.disaster.bankruptcy';
  /**
   * Whether this disaster is natural.  Defaults to false.
   */
  natural: boolean = false;
  /**
   * The number of effects of this disaster. Defaults to {@code ONE}.
   */
  numberOfEffects: Disaster$Effects = null;
  /**
   * The effects of this disaster.
   */
  effects: List<RandomChoice<Effect>> = null;
  static readonly EFFECT_TAG: string = 'effect';
  static readonly EFFECTS_TAG: string = 'effects';
  static readonly NATURAL_TAG: string = 'natural';
  /**
   * Create a new disaster.
   *
   * @param id The object identifier.
   * @param specification The {@code Specification} to refer to.
   */
  _Disaster(id: string, specification: Specification): this {
    this._FreeColSpecObjectType$String$Specification(id, specification);
    this.natural = false;
    this.numberOfEffects = Disaster$Effects.ONE;
    this.effects = null;
    return this;
  }
  /**
   * Is this a natural disaster?
   *
   * @return True if this is a natural disaster.
   */
  isNatural(): boolean {
    return this.natural;
  }
  /**
   * Get the number of effects.
   *
   * @return The {@code Effects} to apply.
   */
  getNumberOfEffects(): Disaster$Effects {
    return this.numberOfEffects;
  }
  /**
   * Get the random choice list of effects.
   *
   * @return A list of random {@code Effect} choices.
   */
  getEffects(): List<RandomChoice<Effect>> {
    return (this.effects == null) ? Collections.emptyList() : this.effects;
  }
  /**
   * Set the effect list.
   *
   * @param effects The new effects list.
   */
  setEffects(effects: List<RandomChoice<Effect>>): void {
    if (this.effects == null) {
      this.effects = new ArrayList();
    } else {
      this.effects.clear();
    }
    this.effects.addAll(effects);
  }
  /**
   * Add an effect.
   *
   * @param effect The {@code Effect} to add.
   */
  addEffect(effect: Effect): void {
    if (this.effects == null) {
      this.effects = new ArrayList();
    }
    this.effects.add(new RandomChoice()._RandomChoice(effect, effect.getProbability()));
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(Disaster));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.natural = o.isNatural();
    this.numberOfEffects = o.getNumberOfEffects();
    this.setEffects(o.getEffects());
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$boolean(Disaster.NATURAL_TAG, this.natural);
    xw.writeAttribute$String$Enum(Disaster.EFFECTS_TAG, this.numberOfEffects);
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    for (const $it0 = this.getEffects().iterator(); $it0.hasNext(); ) {
      let choice = $it0.next();
      choice.getObject().toXML$FreeColXMLWriter(xw);
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    let spec = this.getSpecification();
    let parent = xr.getAlreadyInitializedType(spec, FreeColSpecObjectType.EXTENDS_TAG, $J.cls(Disaster), this);
    this.natural = xr.getAttribute$String$boolean(Disaster.NATURAL_TAG, parent.natural);
    this.numberOfEffects = (xr.hasAttribute(Disaster.EFFECTS_TAG)) ? xr.getAttribute$String$Class$Enum(Disaster.EFFECTS_TAG, $J.cls(Disaster$Effects), Disaster$Effects.ONE) : parent.numberOfEffects;
  }
  /**
   * {@inheritDoc}
   */
  clearContainers$FreeColXMLReader(xr: FreeColXMLReader): void {
    super.clearContainers$FreeColXMLReader(xr);
    this.effects = null;
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    let spec = this.getSpecification();
    let parent = xr.getAlreadyInitializedType(spec, FreeColSpecObjectType.EXTENDS_TAG, $J.cls(Disaster), this);
    if (parent !== this && !parent.getEffects().isEmpty()) {
      if (this.effects == null) {
        this.effects = new ArrayList();
      }
      for (const $it1 = parent.getEffects().iterator(); $it1.hasNext(); ) {
        let choice = $it1.next();
        let effect = new Effect()._Effect$Effect(choice.getObject());
        effect.getFeatureContainer().replaceSource(parent, this);
        this.addEffect(effect);
      }
    }
    super.readChildren(xr);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let spec = this.getSpecification();
    let tag = xr.getLocalName();
    if ($J.equals(Disaster.EFFECT_TAG, tag)) {
      let effect = new Effect()._Effect$FreeColXMLReader$Specification(xr, spec);
      effect.getFeatureContainer().replaceSource(null, this);
      this.addEffect(effect);
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return Disaster.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(64);
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.getId());
    for (const $it2 = this.getEffects().iterator(); $it2.hasNext(); ) {
      let choice = $it2.next();
      sb.append(String.fromCharCode(32 /* ' ' */)).append($J.str(choice.getObject()));
    }
    sb.append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
}

/**
 * Whether to apply one, many or all applicable disasters.
 */
export class Disaster$Effects extends JEnum {
  static ONE: Disaster$Effects = null;
  static SEVERAL: Disaster$Effects = null;
  static ALL: Disaster$Effects = null;
  static $VALUES: Disaster$Effects[] = null;
  _Disaster$Effects($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Disaster$Effects[] { return Disaster$Effects.$VALUES.slice(); }
  static valueOf(name: string): Disaster$Effects { return $J.enumValueOf(Disaster$Effects, name); }
  static $clinit() {
    Disaster$Effects.ONE = new Disaster$Effects()._Disaster$Effects('ONE', 0);
    Disaster$Effects.SEVERAL = new Disaster$Effects()._Disaster$Effects('SEVERAL', 1);
    Disaster$Effects.ALL = new Disaster$Effects()._Disaster$Effects('ALL', 2);
    Disaster$Effects.$VALUES = [Disaster$Effects.ONE, Disaster$Effects.SEVERAL, Disaster$Effects.ALL];
  }
}

$J.define(Disaster, 'net.sf.freecol.common.model.Disaster', { kind: 'class', sup: 'net.sf.freecol.common.model.FreeColSpecObjectType', ctors: { 'java.lang.String,net.sf.freecol.common.model.Specification': '_Disaster' }, returns: { 'getXMLTagName': 'java.lang.String', 'getEffects': 'java.util.List', 'getNumberOfEffects': 'net.sf.freecol.common.model.Disaster$Effects', 'isNatural': 'boolean' }, meths: { 'clearContainers(net.sf.freecol.common.io.FreeColXMLReader)': 'clearContainers$FreeColXMLReader' } });
$J.define(Disaster$Effects, 'net.sf.freecol.common.model.Disaster$Effects', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Disaster$Effects' }, clinit: true, lazy: ['$VALUES', 'ONE', 'SEVERAL', 'ALL'] });
$J.module(() => {
  Effect = $J.load('net.sf.freecol.common.model.Effect');
  RandomChoice = $J.load('net.sf.freecol.common.util.RandomChoice');
});
