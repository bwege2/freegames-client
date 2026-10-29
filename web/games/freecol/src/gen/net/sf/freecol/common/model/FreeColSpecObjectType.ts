// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/FreeColSpecObjectType.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { FreeColSpecObject } from './FreeColSpecObject.ts';

let Messages, Ability, FeatureContainer, Modifier, Scope, ScopeContainer, CollectionUtils;

/**
 * The base class for all types defined by the specification. It can
 * be instantiated in order to provide a source for modifiers and
 * abilities that are provided by the code rather than defined in the
 * specification, such as the "artillery in the open" penalty.
 *
 * A FreeColSpecObjectType does not always need a reference to the
 * specification. However, if it has attributes or children that are
 * themselves FreeColSpecObjectTypes, then the specification must be
 * set before the type is de-serialized, otherwise the identifiers
 * therein can not be resolved.
 *
 * FreeColSpecObjectTypes can be abstract. Abstract types can be used
 * to derive other types, but can not be instantiated.  They will be
 * removed from the Specification after it has loaded completely.
 *
 * Many FreeColSpecObjectTypes have ids, but some leaf types do not
 * need them and there they may be omitted.
 */
export class FreeColSpecObjectType extends FreeColSpecObject {
  /**
   * Whether the type is abstract, or can be instantiated.
   */
  abstractType: boolean = false;
  /**
   * The features of this game object type.  Feature containers are
   * created on demand.
   */
  featureContainer: FeatureContainer = null;
  /**
   * Scopes that might limit the action of this object to certain
   * types of objects.
   */
  scopeContainer: ScopeContainer = null;
  /**
   * The index imposes a total ordering consistent with equals on
   * each class extending FreeColSpecObjectType, but this ordering
   * is nothing but the order in which the objects of the respective
   * class were defined.  It is guaranteed to remain stable only for
   * a particular revision of a particular specification.
   */
  index_: number = 0;
  static readonly ABSTRACT_TAG: string = 'abstract';
  static readonly DELETE_TAG: string = 'delete';
  static readonly EXTENDS_TAG: string = 'extends';
  static readonly PRESERVE_TAG: string = 'preserve';
  static readonly PRESERVE_ATTRIBUTES_TAG: string = 'preserve-attributes';
  $init_FreeColSpecObjectType() {
    this.featureContainer = null;
    this.index_ = -1;
  }
  /**
   * Deliberately empty constructor.
   */
  _FreeColSpecObjectType$(): this {
    this._FreeColSpecObject(null);
    this.$init_FreeColSpecObjectType();
    return this;
  }
  /**
   * Create a simple FreeColSpecObjectType without a specification.
   *
   * @param id The object identifier.
   */
  _FreeColSpecObjectType$String(id: string): this {
    this._FreeColSpecObjectType$String$Specification(id, null);
    return this;
  }
  /**
   * Create a FreeColSpecObjectType with a given specification but
   * no object identifier.
   *
   * @param specification The {@code Specification} to refer to.
   */
  _FreeColSpecObjectType$Specification(specification: Specification): this {
    this._FreeColSpecObjectType$String$Specification(null, specification);
    return this;
  }
  /**
   * Create a FreeColSpecObjectType with a given identifier and
   * specification.
   *
   * @param id The object identifier.
   * @param specification The {@code Specification} to refer to.
   */
  _FreeColSpecObjectType$String$Specification(id: string, specification: Specification): this {
    this._FreeColSpecObject(specification);
    this.$init_FreeColSpecObjectType();
    this.setId(id);
    return this;
  }
  /**
   * Gets the index of this FreeColSpecObjectType.
   *
   * The index imposes a total ordering consistent with equals on
   * each class extending FreeColSpecObjectType, but this ordering
   * is nothing but the order in which the objects of the respective
   * class were defined.  It is guaranteed to remain stable only for
   * a particular revision of a particular specification.
   *
   * @return The game object index.
   */
  getIndex(): number {
    return this.index_;
  }
  /**
   * Sets the index of this FreeColSpecObjectType.
   *
   * @param index The new index value.
   */
  setIndex(index: number): void {
    this.index_ = index;
  }
  /**
   * Gets a string suitable for looking up the description of
   * this object in {@link net.sf.freecol.common.i18n.Messages}.
   *
   * @return A description key.
   */
  getDescriptionKey(): string {
    return Messages.descriptionKey$String(this.getId());
  }
  /**
   * Is this an abstract type?
   *
   * @return True if this is an abstract game object type.
   */
  isAbstractType(): boolean {
    return this.abstractType;
  }
  getScopeList(): List<Scope> {
    return ScopeContainer.getScopeList(this.scopeContainer);
  }
  getScopes(): Stream<Scope> {
    return ScopeContainer.getScopes(this.scopeContainer);
  }
  copyScopes(scopes: Collection<Scope>): void {
    this.scopeContainer = ScopeContainer.setScopes(this.scopeContainer, scopes);
  }
  addScope(scope: Scope): void {
    this.scopeContainer = ScopeContainer.addScope(this.scopeContainer, scope);
  }
  removeScope(scope: Scope): void {
    ScopeContainer.removeScope(this.scopeContainer, scope);
  }
  appliesTo(fco: FreeColObject): boolean {
    return ScopeContainer.scopeContainerAppliesTo(this.scopeContainer, fco);
  }
  /**
   * {@inheritDoc}
   */
  getNameKey(): string {
    return Messages.nameKey$String(this.getId());
  }
  /**
   * {@inheritDoc}
   */
  getFeatureContainer(): FeatureContainer {
    if (this.featureContainer == null) {
      this.featureContainer = new FeatureContainer()._FeatureContainer();
    }
    return this.featureContainer;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(FreeColSpecObjectType));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.abstractType = o.isAbstractType();
    this.featureContainer.copy(o.getFeatureContainer());
    this.scopeContainer = ScopeContainer.setScopes(this.scopeContainer, o.getScopeList());
    this.index_ = o.getIndex();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    for (const $it0 = CollectionUtils.sort$Stream(this.getAbilities$()).iterator(); $it0.hasNext(); ) {
      let ability = $it0.next();
      ability.toXML$FreeColXMLWriter(xw);
    }
    for (const $it1 = this.getSortedModifiers().iterator(); $it1.hasNext(); ) {
      let modifier = $it1.next();
      modifier.toXML$FreeColXMLWriter(xw);
    }
    ScopeContainer.scopeContainerToXML(this.scopeContainer, xw);
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.abstractType = xr.getAttribute$String$boolean(FreeColSpecObjectType.ABSTRACT_TAG, false);
  }
  /**
   * {@inheritDoc}
   */
  clearContainers$FreeColXMLReader(xr: FreeColXMLReader): void {
    super.clearContainers$FreeColXMLReader(xr);
    if (this.featureContainer != null) {
      this.featureContainer.clear();
    }
    ScopeContainer.clearScopes(this.scopeContainer);
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
    if ($J.equals(Ability.TAG, tag)) {
      if (xr.getAttribute$String$boolean(FreeColSpecObjectType.DELETE_TAG, false)) {
        this.removeAbilities(xr.readId());
        xr.closeTag$String(Ability.TAG);
      } else {
        let ability = new Ability()._Ability$FreeColXMLReader$Specification(xr, spec);
        if (ability.getSource() == null) {
          ability.setSource(this);
        }
        this.addAbility(ability);
        spec.addAbility$Ability(ability);
      }
    } else if ($J.equals(Modifier.TAG, tag)) {
      if (xr.getAttribute$String$boolean(FreeColSpecObjectType.DELETE_TAG, false)) {
        this.removeModifiers(xr.readId());
        xr.closeTag$String(Modifier.TAG);
      } else {
        let modifier = new Modifier()._Modifier$FreeColXMLReader$Specification(xr, spec);
        if (modifier.getSource() == null) {
          modifier.setSource(this);
        }
        this.addModifier(modifier);
        spec.addModifier(modifier);
      }
    } else if ($J.equals(Scope.TAG, tag)) {
      this.scopeContainer = ScopeContainer.addScope(this.scopeContainer, new Scope()._Scope$FreeColXMLReader(xr));
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    return this.getId();
  }
}

$J.define(FreeColSpecObjectType, 'net.sf.freecol.common.model.FreeColSpecObjectType', { kind: 'class', ifaces: ['net.sf.freecol.common.model.Named'], sup: 'net.sf.freecol.common.model.FreeColSpecObject', ctors: { 'java.lang.String,net.sf.freecol.common.model.Specification': '_FreeColSpecObjectType$String$Specification', 'net.sf.freecol.common.model.Specification': '_FreeColSpecObjectType$Specification', 'java.lang.String': '_FreeColSpecObjectType$String', '': '_FreeColSpecObjectType$' }, returns: { 'getFeatureContainer': 'net.sf.freecol.common.model.FeatureContainer', 'getNameKey': 'java.lang.String', 'getScopes': 'java.util.stream.Stream', 'getScopeList': 'java.util.List', 'isAbstractType': 'boolean', 'getDescriptionKey': 'java.lang.String', 'getIndex': 'int' }, meths: { 'clearContainers(net.sf.freecol.common.io.FreeColXMLReader)': 'clearContainers$FreeColXMLReader' } });
$J.module(() => {
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  FeatureContainer = $J.load('net.sf.freecol.common.model.FeatureContainer');
  Modifier = $J.load('net.sf.freecol.common.model.Modifier');
  Scope = $J.load('net.sf.freecol.common.model.Scope');
  ScopeContainer = $J.load('net.sf.freecol.common.model.ScopeContainer');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
