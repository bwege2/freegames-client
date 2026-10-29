// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/FreeColObject.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ClassCastException, Exception, Files, IOException, JObject, JString, Level, Logger, NumberFormatException, Stream, StringReader, StringWriter, XMLStreamException } from '../../../../../../jre/index.ts';

let PropertyChangeSupport, FreeColXMLReader, FreeColXMLWriter, FreeColXMLWriter$WriteScope, FeatureContainer, Modifier, CollectionUtils, Introspector, Introspector$IntrospectorException, StringUtils, Utils;

/**
 * The FreeCol root class.  Maintains an identifier, and an optional link
 * to the specification this object uses.
 *
 * All FreeColObjects are trivially sortable on the basis of their
 * identifiers as a consequence of the Comparable implementation here.
 * Do not override this any further, use explicit comparators if more fully
 * featured sorting is required.
 */
export class FreeColObject extends JObject {
  static logger: Logger = null;
  /**
   * Comparator by FCO identifier.
   */
  static fcoComparator: Comparator<any> = null;
  /**
   * Fallback class index.
   */
  static readonly DEFAULT_CLASS_INDEX: number = 1000;
  /**
   * The identifier of an object.
   */
  id_: string = null;
  /**
   * An optional property change container, allocated on demand.
   */
  pcs: PropertyChangeSupport = null;
  /**
   * XML tag name for identifier attribute.
   */
  static readonly ID_ATTRIBUTE_TAG: string = 'id';
  /**
   * XML tag name for array elements.
   */
  static readonly ARRAY_SIZE_TAG: string = 'xLength';
  /**
   * XML attribute tag to denote partial updates.
   */
  static readonly PARTIAL_ATTRIBUTE_TAG: string = 'partial';
  /**
   * XML tag name for value attributes, used in many places.
   */
  static readonly VALUE_TAG: string = 'value';
  _FreeColObject(): this {
    this.pcs = null;
    return this;
  }
  /**
   * Get the FreeColObject class corresponding to a class name.
   *
   * @param <T> A FreeColObject subclass.
   * @param name The class name.
   * @return The class, or null if none found.
   */
  static getFreeColObjectClassByName<T>(name: string): JClass<T> {
    let type$ = 'net.sf.freecol.common.model.' + StringUtils.capitalize$String(name);
    let c = Introspector.getClassByName(type$);
    if (c != null) {
      return c;
    }
    FreeColObject.logger.warning('getFreeColObjectClass could not find: ' + type$);
    return null;
  }
  /**
   * Get the FreeColObject class for this object.
   *
   * @param <T> A FreeColObject subclass.
   * @return The class, or null on error.
   */
  getFreeColObjectClass<T>(): JClass<T> {
    return this.getClass();
  }
  /**
   * Get the object unique identifier.
   *
   * @return The identifier.
   */
  getId(): string {
    return this.id_;
  }
  /**
   * Set the object identifier.
   *
   * @param newId The new object identifier.
   */
  setId(newId: string): void {
    this.id_ = newId;
  }
  /**
   * Does another FreeColObject have the same identifier?
   *
   * @param other The other {@code FreeColObject} to check.
   * @return True if the identifiers are non-null and equal.
   */
  idEquals(other: FreeColObject): boolean {
    return other != null && this.id_ != null && $J.equals(this.id_, other.getId());
  }
  /**
   * Gets the identifier of this object with the given prefix
   * removed if the id of the object starts with the prefix, and the
   * entire id otherwise.
   *
   * @param prefix The prefix to test.
   * @return An identifier.
   */
  getSuffix$String(prefix: string): string {
    return (this.getId().startsWith(prefix)) ? this.getId().substring(prefix.length) : this.getId();
  }
  /**
   * Gets the usual suffix of this object's identifier, that is
   * everything after the last '.'.
   *
   * @return The usual identifier suffix.
   */
  getSuffix$(): string {
    let id = this.getId();
    return (id == null) ? null : StringUtils.lastPart(id, '.');
  }
  /**
   * Get the type part of the identifier.
   *
   * @param id The identifier to examine.
   * @return The type part of the identifier, or null on error.
   */
  static getIdTypeByName(id: string): string {
    if (id != null) {
      let col = id.lastIndexOf(String.fromCharCode(58 /* ':' */));
      return (col >= 0) ? id.substring(0, col) : id;
    }
    return null;
  }
  /**
   * Get the type part of the identifier of this object.
   *
   * @return The type part of the identifier, or null on error.
   */
  getIdType(): string {
    return FreeColObject.getIdTypeByName(this.getId());
  }
  /**
   * Gets the numeric part of the identifier.
   *
   * @return The numeric part of the identifier, or negative on error.
   */
  getIdNumber(): number {
    if (this.id_ != null) {
      let col = this.id_.lastIndexOf(String.fromCharCode(58 /* ':' */));
      if (col >= 0) {
        let s = this.id_.substring((col + 1) | 0);
        if (s.startsWith('am')) {
          s = s.substring(2);
        }
        try {
          return $J.parseInt(s);
        } catch ($e0) {
          if ($J.isa($e0, NumberFormatException)) {
            let nfe = $J.exc($e0);
          } else {
            throw $e0;
          }
        }
      }
    }
    return -1;
  }
  /**
   * Compare two FreeColObjects by their identifiers.
   *
   * @param fco1 The first {@code FreeColObject} to compare.
   * @param fco2 The second {@code FreeColObject} to compare.
   * @return The comparison result.
   */
  static compareIds(fco1: FreeColObject, fco2: FreeColObject): number {
    if (fco1 == null) {
      return (fco2 == null) ? 0 : -1;
    } else if (fco2 == null) {
      return 1;
    }
    let id1 = fco1.getId();
    let id2 = fco2.getId();
    if (id1 == null) {
      return (id2 == null) ? 0 : -1;
    } else if (id2 == null) {
      return 1;
    }
    let cmp = $J.compareTo(fco1.getIdType(), fco2.getIdType());
    return (cmp > 0) ? 1 : (cmp < 0) ? -1 : $J.icmp(fco1.getIdNumber(), fco2.getIdNumber());
  }
  /**
   * Accessor for the class index.
   *
   * @return The class index used by
   *      {@link net.sf.freecol.client.ClientOptions}.
   */
  getClassIndex(): number {
    return FreeColObject.DEFAULT_CLASS_INDEX;
  }
  /**
   * Get the class index, handling null and non-FCO objects.
   *
   * @param o The object to examine.
   * @return The class index.
   */
  static getObjectClassIndex(o: any): number {
    return (o instanceof FreeColObject) ? (o).getClassIndex() : FreeColObject.DEFAULT_CLASS_INDEX;
  }
  /**
   * Get the specification.
   *
   * @return The {@code Specification} used by this object.
   */
  getSpecification(): Specification {
    return null;
  }
  /**
   * Sets the specification for this object. 
   *
   * @param specification The {@code Specification} to use.
   */
  setSpecification(specification: Specification): void {
  }
  /**
   * Gets the game this object belongs to.
   *
   * @return The {@code Game} this object belongs to.
   */
  getGame(): Game {
    return null;
  }
  /**
   * Sets the game object this object belongs to.
   *
   * @param game The {@code Game} to set.
   */
  setGame(game: Game): void {
  }
  getPropertyChangeSupport(): PropertyChangeSupport {
    return this.pcs;
  }
  addPropertyChangeListener$PropertyChangeListener(listener: PropertyChangeListener): void {
    if (this.pcs == null) {
      this.pcs = new PropertyChangeSupport()._PropertyChangeSupport(this);
    }
    this.pcs.addPropertyChangeListener$PropertyChangeListener(listener);
  }
  addPropertyChangeListener$String$PropertyChangeListener(propertyName: string, listener: PropertyChangeListener): void {
    if (this.pcs == null) {
      this.pcs = new PropertyChangeSupport()._PropertyChangeSupport(this);
    }
    this.pcs.addPropertyChangeListener$String$PropertyChangeListener(propertyName, listener);
  }
  fireIndexedPropertyChange$String$int$boolean$boolean(propertyName: string, index: number, oldValue: boolean, newValue: boolean): void {
    if (this.pcs != null) {
      this.pcs.fireIndexedPropertyChange$String$int$boolean$boolean(propertyName, index, oldValue, newValue);
    }
  }
  fireIndexedPropertyChange$String$int$int$int(propertyName: string, index: number, oldValue: number, newValue: number): void {
    if (this.pcs != null) {
      this.pcs.fireIndexedPropertyChange$String$int$int$int(propertyName, index, oldValue, newValue);
    }
  }
  fireIndexedPropertyChange$String$int$Object$Object(propertyName: string, index: number, oldValue: any, newValue: any): void {
    if (this.pcs != null) {
      this.pcs.fireIndexedPropertyChange$String$int$Object$Object(propertyName, index, oldValue, newValue);
    }
  }
  firePropertyChange$PropertyChangeEvent(event: PropertyChangeEvent): void {
    if (this.pcs != null) {
      this.pcs.firePropertyChange$PropertyChangeEvent(event);
    }
  }
  firePropertyChange$String$boolean$boolean(propertyName: string, oldValue: boolean, newValue: boolean): void {
    if (this.pcs != null) {
      this.pcs.firePropertyChange$String$boolean$boolean(propertyName, oldValue, newValue);
    }
  }
  firePropertyChange$String$int$int(propertyName: string, oldValue: number, newValue: number): void {
    if (this.pcs != null) {
      this.pcs.firePropertyChange$String$int$int(propertyName, oldValue, newValue);
    }
  }
  firePropertyChange$String$Object$Object(propertyName: string, oldValue: any, newValue: any): void {
    if (this.pcs != null) {
      this.pcs.firePropertyChange$String$Object$Object(propertyName, oldValue, newValue);
    }
  }
  getPropertyChangeListeners$(): PropertyChangeListener[] {
    return (this.pcs == null) ? $J.newArray(0, null) : this.pcs.getPropertyChangeListeners$();
  }
  getPropertyChangeListeners$String(propertyName: string): PropertyChangeListener[] {
    return (this.pcs == null) ? $J.newArray(0, null) : this.pcs.getPropertyChangeListeners$String(propertyName);
  }
  hasListeners(propertyName: string): boolean {
    return (this.pcs == null) ? false : this.pcs.hasListeners(propertyName);
  }
  removePropertyChangeListener$PropertyChangeListener(listener: PropertyChangeListener): void {
    if (this.pcs != null) {
      this.pcs.removePropertyChangeListener$PropertyChangeListener(listener);
    }
  }
  removePropertyChangeListener$String$PropertyChangeListener(propertyName: string, listener: PropertyChangeListener): void {
    if (this.pcs != null) {
      this.pcs.removePropertyChangeListener$String$PropertyChangeListener(propertyName, listener);
    }
  }
  /**
   * Gets the feature container for this object, if any.
   *
   * @return The {@code FeatureContainer} for this object.
   */
  getFeatureContainer(): FeatureContainer {
    return null;
  }
  /**
   * Is an ability present in this object?
   *
   * @param id The object identifier.
   * @return True if the ability is present.
   */
  hasAbility$String(id: string): boolean {
    return this.hasAbility$String$FreeColSpecObjectType(id, null);
  }
  /**
   * Is an ability present in this object?
   *
   * @param id The object identifier.
   * @param fcgot An optional {@code FreeColSpecObjectType} the
   *     ability applies to.
   * @return True if the ability is present.
   */
  hasAbility$String$FreeColSpecObjectType(id: string, fcgot: FreeColSpecObjectType): boolean {
    return this.hasAbility$String$FreeColSpecObjectType$Turn(id, fcgot, null);
  }
  /**
   * Is an ability present in this object?
   *
   * @param id The object identifier.
   * @param fcgot An optional {@code FreeColSpecObjectType} the
   *     ability applies to.
   * @param turn An optional applicable {@code Turn}.
   * @return True if the ability is present.
   */
  hasAbility$String$FreeColSpecObjectType$Turn(id: string, fcgot: FreeColSpecObjectType, turn: Turn): boolean {
    return FeatureContainer.allAbilities(this.getAbilities$String$FreeColSpecObjectType$Turn(id, fcgot, turn));
  }
  /**
   * Checks if this object contains a given ability key.
   *
   * @param key The key to check.
   * @return True if the key is present.
   */
  containsAbilityKey(key: string): boolean {
    return CollectionUtils.first$Stream(this.getAbilities$String$FreeColSpecObjectType$Turn(key, null, null)) != null;
  }
  /**
   * Gets a sorted copy of the abilities of this object.
   *
   * @return A list of abilities.
   */
  getSortedAbilities(): List<Ability> {
    return CollectionUtils.sort$Stream(this.getAbilities$());
  }
  /**
   * Gets a copy of the abilities of this object.
   *
   * @return A stream of abilities.
   */
  getAbilities$(): Stream<Ability> {
    return this.getAbilities$String(null);
  }
  /**
   * Gets the set of abilities with the given identifier from this object.
   *
   * @param id The object identifier.
   * @return A stream of abilities.
   */
  getAbilities$String(id: string): Stream<Ability> {
    return this.getAbilities$String$FreeColSpecObjectType(id, null);
  }
  /**
   * Gets the set of abilities with the given identifier from this object.
   *
   * @param id The object identifier.
   * @param fcgot An optional {@code FreeColSpecObjectType} the
   *     ability applies to.
   * @return A stream of abilities.
   */
  getAbilities$String$FreeColSpecObjectType(id: string, fcgot: FreeColSpecObjectType): Stream<Ability> {
    return this.getAbilities$String$FreeColSpecObjectType$Turn(id, fcgot, null);
  }
  /**
   * Gets the set of abilities with the given identifier from this
   * object.  Subclasses with complex ability handling should
   * override this as all prior routines are derived from it.
   *
   * @param id The object identifier.
   * @param fcgot An optional {@code FreeColSpecObjectType} the
   *     ability applies to.
   * @param turn An optional applicable {@code Turn}.
   * @return A set of abilities.
   */
  getAbilities$String$FreeColSpecObjectType$Turn(id: string, fcgot: FreeColSpecObjectType, turn: Turn): Stream<Ability> {
    let fc = this.getFeatureContainer();
    return (fc == null) ? Stream.empty() : fc.getAbilities(id, fcgot, turn);
  }
  /**
   * Add the given ability to this object.
   *
   * @param ability An {@code Ability} to add.
   * @return True if the ability was added.
   */
  addAbility(ability: Ability): boolean {
    let fc = this.getFeatureContainer();
    return (fc == null) ? false : fc.addAbility(ability);
  }
  /**
   * Remove the given ability from this object.
   *
   * @param ability An {@code Ability} to remove.
   * @return The ability removed or null on failure.
   */
  removeAbility(ability: Ability): Ability {
    let fc = this.getFeatureContainer();
    return (fc == null) ? null : fc.removeAbility(ability);
  }
  /**
   * Remove all abilities with a given identifier.
   *
   * @param id The object identifier.
   */
  removeAbilities(id: string): void {
    let fc = this.getFeatureContainer();
    if (fc != null) {
      fc.removeAbilities(id);
    }
  }
  /**
   * Is an modifier present in this object?
   *
   * @param id The object identifier.
   * @return True if the modifier is present.
   */
  hasModifier$String(id: string): boolean {
    return this.hasModifier$String$FreeColSpecObjectType(id, null);
  }
  /**
   * Is an modifier present in this object?
   *
   * @param id The object identifier.
   * @param fcgot An optional {@code FreeColSpecObjectType} the
   *     modifier applies to.
   * @return True if the modifier is present.
   */
  hasModifier$String$FreeColSpecObjectType(id: string, fcgot: FreeColSpecObjectType): boolean {
    return this.hasModifier$String$FreeColSpecObjectType$Turn(id, fcgot, null);
  }
  /**
   * Is an modifier present in this object?
   *
   * @param id The object identifier.
   * @param fcgot An optional {@code FreeColSpecObjectType} the
   *     modifier applies to.
   * @param turn An optional applicable {@code Turn}.
   * @return True if the modifier is present.
   */
  hasModifier$String$FreeColSpecObjectType$Turn(id: string, fcgot: FreeColSpecObjectType, turn: Turn): boolean {
    return CollectionUtils.any$Stream(this.getModifiers$String$FreeColSpecObjectType$Turn(id, fcgot, turn));
  }
  /**
   * Checks if this object contains a given modifier key.
   *
   * @param key The key to check.
   * @return True if the key is present.
   */
  containsModifierKey(key: string): boolean {
    return CollectionUtils.any$Stream(this.getModifiers$String(key));
  }
  /**
   * Gets a sorted copy of the modifiers of this object.
   *
   * @return A list of modifiers.
   */
  getSortedModifiers(): List<Modifier> {
    return CollectionUtils.sort$Stream$Comparator(this.getModifiers$(), Modifier.ascendingModifierIndexComparator);
  }
  /**
   * Gets a copy of the modifiers of this object.
   *
   * @return A set of modifiers.
   */
  getModifiers$(): Stream<Modifier> {
    let fc = this.getFeatureContainer();
    return (fc == null) ? Stream.empty() : fc.getModifierValues().stream();
  }
  /**
   * Gets the set of modifiers with the given identifier from this object.
   *
   * @param id The object identifier.
   * @return A set of modifiers.
   */
  getModifiers$String(id: string): Stream<Modifier> {
    return this.getModifiers$String$FreeColSpecObjectType(id, null);
  }
  /**
   * Gets the set of modifiers with the given identifier from this object.
   *
   * @param id The object identifier.
   * @param fcgot An optional {@code FreeColSpecObjectType} the
   *     modifier applies to.
   * @return A set of modifiers.
   */
  getModifiers$String$FreeColSpecObjectType(id: string, fcgot: FreeColSpecObjectType): Stream<Modifier> {
    return this.getModifiers$String$FreeColSpecObjectType$Turn(id, fcgot, null);
  }
  /**
   * Gets the set of modifiers with the given identifier from this object.
   *
   * Subclasses with complex modifier handling may override this
   * routine.
   *
   * @param id The object identifier.
   * @param fcgot An optional {@code FreeColSpecObjectType} the
   *     modifier applies to.
   * @param turn An optional applicable {@code Turn}.
   * @return A set of modifiers.
   */
  getModifiers$String$FreeColSpecObjectType$Turn(id: string, fcgot: FreeColSpecObjectType, turn: Turn): Stream<Modifier> {
    let fc = this.getFeatureContainer();
    return (fc == null) ? Stream.empty() : fc.getModifiers(id, fcgot, turn);
  }
  /**
   * Applies this objects modifiers with the given identifier to the
   * given number.
   *
   * @param number The number to modify.
   * @param turn An optional applicable {@code Turn}.
   * @param id The object identifier.
   * @return The modified number.
   */
  apply$float$Turn$String(number$: number, turn: Turn, id: string): number {
    return this.apply$float$Turn$String$FreeColSpecObjectType(number$, turn, id, null);
  }
  /**
   * Applies this objects modifiers with the given identifier to the
   * given number.
   *
   * @param number The number to modify.
   * @param turn An optional applicable {@code Turn}.
   * @param id The object identifier.
   * @param fcgot An optional {@code FreeColSpecObjectType} the
   *     modifier applies to.
   * @return The modified number.
   */
  apply$float$Turn$String$FreeColSpecObjectType(number$: number, turn: Turn, id: string, fcgot: FreeColSpecObjectType): number {
    return FreeColObject.applyModifiers$float$Turn$Stream(number$, turn, this.getModifiers$String$FreeColSpecObjectType$Turn(id, fcgot, turn));
  }
  /**
   * Applies a stream of modifiers to the given number.
   *
   * @param number The number to modify.
   * @param turn An optional applicable {@code Turn}.
   * @param mods The {@code Modifier}s to apply.
   * @return The modified number.
   */
  static applyModifiers$float$Turn$Stream(number$: number, turn: Turn, mods: Stream<Modifier>): number {
    return FeatureContainer.applyModifiers$float$Turn$Stream(number$, turn, mods);
  }
  /**
   * Applies a collection of modifiers to the given number.
   *
   * @param number The number to modify.
   * @param turn An optional applicable {@code Turn}.
   * @param mods The {@code Modifier}s to apply.
   * @return The modified number.
   */
  static applyModifiers$float$Turn$Collection(number$: number, turn: Turn, mods: Collection<Modifier>): number {
    return FeatureContainer.applyModifiers$float$Turn$Collection(number$, turn, mods);
  }
  /**
   * Add the given modifier to this object.
   *
   * @param modifier An {@code Modifier} to add.
   * @return True if the modifier was added.
   */
  addModifier(modifier: Modifier): boolean {
    let fc = this.getFeatureContainer();
    if (fc == null) {
      return false;
    }
    return fc.addModifier(modifier);
  }
  /**
   * Remove the given modifier from this object.
   *
   * @param modifier An {@code Modifier} to remove.
   * @return The modifier removed.
   */
  removeModifier(modifier: Modifier): Modifier {
    let fc = this.getFeatureContainer();
    if (fc == null) {
      return null;
    }
    return fc.removeModifier(modifier);
  }
  /**
   * Remove all abilities with a given identifier.
   *
   * @param id The object identifier.
   */
  removeModifiers(id: string): void {
    let fc = this.getFeatureContainer();
    if (fc != null) {
      fc.removeModifiers(id);
    }
  }
  /**
   * Adds all the features in an object to this object.
   *
   * @param fco The {@code FreeColObject} to add features from.
   */
  addFeatures(fco: FreeColObject): void {
    let fc = this.getFeatureContainer();
    if (fc != null) {
      fc.addFeatures(fco);
    }
  }
  /**
   * Removes all the features in an object from this object.
   *
   * @param fco The {@code FreeColObject} to find features to remove in.
   */
  removeFeatures(fco: FreeColObject): void {
    let fc = this.getFeatureContainer();
    if (fc != null) {
      fc.removeFeatures(fco);
    }
  }
  /**
   * Get the defence modifiers applicable to this object.
   *
   * @return A list of defence {@code Modifier}s.
   */
  getDefenceModifiers(): List<Modifier> {
    return CollectionUtils.toList$Stream(this.getModifiers$String(Modifier.DEFENCE));
  }
  /**
   * Base for Comparable implementations.
   *
   * @param other The other {@code FreeColObject} subclass to compare.
   * @return The comparison result.
   */
  compareTo(other: FreeColObject): number {
    return FreeColObject.compareIds(this, other);
  }
  /**
   * Log a collection of {@code FreeColObject}s.
   *
   * @param <T> The collection member type.
   * @param c The {@code Collection} to log.
   * @param lb A {@code LogBuilder} to log to.
   */
  static logFreeColObjects<T>(c: Collection<T>, lb: LogBuilder): void {
    lb.add(['[']);
    for (const $it1 = c.iterator(); $it1.hasNext(); ) {
      let t = $it1.next();
      lb.add([t.getSuffix$(), ' ']);
    }
    lb.shrink(' ');
    lb.add([']']);
  }
  /**
   * Invoke a method for this object.
   *
   * @param <T> The actual return type.
   * @param methodName The name of the method.
   * @param returnClass The expected return class.
   * @param defaultValue The default value.
   * @return The result of invoking the method, or the default value
   *     on failure.
   */
  invokeMethod<T>(methodName: string, returnClass: JClass<T>, defaultValue: T): T {
    if (methodName != null && returnClass != null) {
      try {
        return Introspector.invokeMethod(this, methodName, returnClass);
      } catch ($e2) {
        if ($J.isa($e2, Exception)) {
          let ex = $J.exc($e2);
          FreeColObject.logger.log(Level.WARNING, 'Invoke failed: ' + methodName, ex);
        } else {
          throw $e2;
        }
      }
    }
    return defaultValue;
  }
  /**
   * Get an object to display when showing the user messages for this object.
   *
   * Example: If this object is a Building, the object to display will be the
   * BuildingType.
   *
   * @return A suitable {@code FreeColObject} to display, defaults to this.
   */
  getDisplayObject(): FreeColObject {
    return this;
  }
  /**
   * Debugging tool, dump object XML to System.err.
   */
  dumpObject(): void {
    this.save$OutputStream$WriteScope$boolean($J.err, FreeColXMLWriter$WriteScope.toSave(), false);
  }
  /**
   * Writes the object to the given file.
   *
   * @param file The {@code File} to write to.
   * @return True if the save proceeded without error.
   */
  save$File(file: File): boolean {
    return this.save$File$WriteScope(file, FreeColXMLWriter$WriteScope.toSave());
  }
  /**
   * Writes the object to the given file.
   *
   * @param file The {@code File} to write to.
   * @param scope The {@code WriteScope} to use.
   * @return True if the save proceeded without error.
   */
  save$File$WriteScope(file: File, scope: FreeColXMLWriter$WriteScope): boolean {
    return this.save$File$WriteScope$boolean(file, scope, false);
  }
  /**
   * Writes the object to the given file.
   *
   * @param file The {@code File} to write to.
   * @param scope The {@code WriteScope} to use.
   * @param pretty Attempt to indent the output nicely.
   * @return True if the save proceeded without error.
   */
  save$File$WriteScope$boolean(file: File, scope: FreeColXMLWriter$WriteScope, pretty: boolean): boolean {
    {
      try {
        const fos = Files.newOutputStream(file.toPath());
        try {
          return this.save$OutputStream$WriteScope$boolean(fos, scope, pretty);
        } finally {
          if (fos != null) fos.close();
        }
      } catch ($e3) {
        if ($J.isa($e3, IOException)) {
          let ioe = $J.exc($e3);
          FreeColObject.logger.log(Level.WARNING, 'Error creating output stream', ioe);
        } else {
          throw $e3;
        }
      }
    }
    return false;
  }
  /**
   * Writes the object to the given output stream
   *
   * @param out The {@code OutputStream} to write to.
   * @param scope The {@code WriteScope} to use.
   * @param pretty Attempt to indent the output nicely.
   * @return True if the save proceeded without error.
   */
  save$OutputStream$WriteScope$boolean(out: OutputStream, scope: FreeColXMLWriter$WriteScope, pretty: boolean): boolean {
    let ret = false;
    if (scope == null) {
      scope = FreeColXMLWriter$WriteScope.toSave();
    }
    {
      try {
        const xw = new FreeColXMLWriter()._FreeColXMLWriter$OutputStream$WriteScope$boolean(out, scope, pretty);
        try {
          xw.writeStartDocument('UTF-8', '1.0');
          this.toXML$FreeColXMLWriter(xw);
          xw.writeEndDocument();
          ret = true;
        } finally {
          if (xw != null) xw.close();
        }
      } catch ($e4) {
        if ($J.isa($e4, XMLStreamException)) {
          let xse = $J.exc($e4);
          FreeColObject.logger.log(Level.WARNING, 'Exception writing object.', xse);
        } else if ($J.isa($e4, IOException)) {
          let ioe = $J.exc($e4);
          FreeColObject.logger.log(Level.WARNING, 'Error creating FreeColXMLWriter.', ioe);
        } else {
          throw $e4;
        }
      }
    }
    return ret;
  }
  /**
   * Serialize this FreeColObject to a string.
   *
   * @return The serialized object, or null if the stream could not be
   *     created.
   * @exception XMLStreamException if there are any problems writing
   *     to the stream.
   */
  serialize$(): string {
    return this.serialize$WriteScope(FreeColXMLWriter$WriteScope.toServer());
  }
  /**
   * Serialize this FreeColObject to a string for a target player.
   *
   * @param player The {@code Player} to serialize the object to.
   * @return The serialized object, or null if the stream could not be
   *     created.
   * @exception XMLStreamException if there are any problems writing
   *     to the stream.
   */
  serialize$Player(player: Player): string {
    return this.serialize$WriteScope(FreeColXMLWriter$WriteScope.toClient(player));
  }
  /**
   * Serialize this FreeColObject to a string.
   *
   * @param scope The write scope to use.
   * @return The serialized object, or null if the stream could not be
   *     created.
   * @exception XMLStreamException if there are any problems writing
   *     to the stream.
   */
  serialize$WriteScope(scope: FreeColXMLWriter$WriteScope): string {
    return this.serialize$WriteScope$List(scope, null);
  }
  /**
   * Serialize this FreeColObject to a string, possibly partially.
   *
   * @param scope The write scope to use.
   * @param fields A list of field names, which if non-null indicates this
   *     should be a partial write.
   * @return The serialized object, or null if the stream could not be
   *     created.
   * @exception XMLStreamException if there are any problems writing
   *     to the stream.
   */
  serialize$WriteScope$List(scope: FreeColXMLWriter$WriteScope, fields: List<string>): string {
    let sw = new StringWriter();
    {
      try {
        const xw = new FreeColXMLWriter()._FreeColXMLWriter$Writer$WriteScope(sw, scope);
        try {
          if (fields == null) {
            this.toXML$FreeColXMLWriter(xw);
          } else {
            this.toXMLPartial$FreeColXMLWriter$List(xw, fields);
          }
        } finally {
          if (xw != null) xw.close();
        }
      } catch ($e5) {
        if ($J.isa($e5, IOException)) {
          let ioe = $J.exc($e5);
          FreeColObject.logger.log(Level.WARNING, 'Error creating FreeColXMLWriter,', ioe);
          return null;
        } else {
          throw $e5;
        }
      }
    }
    return sw.toString();
  }
  /**
   * Copy a FreeColObject.
   *
   * @param <T> The actual return type.
   * @param game The {@code Game} to add the object to.
   * @return The copied object, or null on error.
   */
  copy$Game<T>(game: Game): T {
    let returnClass = this.getClass();
    return this.copy$Game$Class(game, returnClass);
  }
  /**
   * Copy a FreeColObject for a player.
   *
   * @param <T> The actual return type.
   * @param game The {@code Game} to add the object to.
   * @param player The {@code Player} to copy for,
   * @return The copied object, or null on error.
   */
  copy$Game$Player<T>(game: Game, player: Player): T {
    let returnClass = this.getClass();
    return this.copy$Game$Class$Player(game, returnClass, player);
  }
  /**
   * Copy a FreeColObject.
   *
   * The copied object and its internal descendents will be
   * identical to the original objects, but not present in the game.
   * Newly created objects will prefer to refer to other newly
   * created objects.  Thus if you copy a tile, an internal colony
   * on the tile will also be copied, and the copied tile will refer
   * to the copied colony and the copied colony refer to the copied
   * tile, but both will refer to the original uncopied owning player. 
   *
   * @param <T> The actual return type.
   * @param game The {@code Game} to add the object to.
   * @param returnClass The expected return class.
   * @return The copied object, or null on error.
   */
  copy$Game$Class<T>(game: Game, returnClass: JClass<T>): T {
    let ret = null;
    {
      try {
        const xr = new FreeColXMLReader()._FreeColXMLReader$Reader(new StringReader(this.serialize$()));
        try {
          ret = xr.copy(game, returnClass);
        } finally {
          if (xr != null) xr.close();
        }
      } catch ($e6) {
        if ($J.isa($e6, XMLStreamException)) {
          let xse = $J.exc($e6);
          FreeColObject.logger.log(Level.WARNING, 'Copy of ' + this.getId() + ' to ' + returnClass.getName() + 'failed', xse);
        } else {
          throw $e6;
        }
      }
    }
    return ret;
  }
  /**
   * Copy a FreeColObject for a target player.
   *
   * @param <T> The actual return type.
   * @param game The {@code Game} to add the object to.
   * @param returnClass The expected return class.
   * @param player The {@code Player} that will see the result.
   * @return The copied object, or null on error.
   */
  copy$Game$Class$Player<T>(game: Game, returnClass: JClass<T>, player: Player): T {
    let ret = null;
    {
      try {
        const xr = new FreeColXMLReader()._FreeColXMLReader$Reader(new StringReader(this.serialize$Player(player)));
        try {
          ret = xr.copy(game, returnClass);
        } finally {
          if (xr != null) xr.close();
        }
      } catch ($e7) {
        if ($J.isa($e7, XMLStreamException)) {
          let xse = $J.exc($e7);
          FreeColObject.logger.log(Level.WARNING, 'Copy of ' + this.getId() + ' to ' + returnClass.getName() + ' for ' + player.getId() + 'failed', xse);
        } else {
          throw $e7;
        }
      }
    }
    return ret;
  }
  /**
   * Copy another FreeColObject into this one if it is compatible.
   *
   * @param <T> The {@code FreeColObject} subclass of the object to copy in.
   * @param other The other object.
   * @return True if the copy in is succesful.
   */
  copyIn<T>(other: T): boolean {
    let fco = this.copyInCast(other, $J.cls(FreeColObject));
    if (fco == null) {
      return false;
    }
    for (let pcl of fco.getPropertyChangeListeners$()) {
      fco.removePropertyChangeListener$PropertyChangeListener(pcl);
      this.addPropertyChangeListener$PropertyChangeListener(pcl);
    }
    return true;
  }
  /**
   * If another object can be copied into this one, 
   *
   * @param <T> The {@code FreeColObject} subclass of the object to copy in.
   * @param other The {@code FreeColObject} to copy in.
   * @param <R> The {@code FreeColObject} subclass to copy in to.
   * @param returnClass The return class.
   * @return The other object cast to the return class, or null
   *     if incompatible in any way.
   */
  copyInCast<T, R>(other: T, returnClass: JClass<R>): R {
    if (other == null) {
      return null;
    }
    if (!this.idEquals(other)) {
      FreeColObject.logger.warning('copyInCast ' + other.getId() + ' onto ' + this.getId());
      return null;
    }
    try {
      return returnClass.cast(other);
    } catch ($e8) {
      if ($J.isa($e8, ClassCastException)) {
        let cce = $J.exc($e8);
      } else {
        throw $e8;
      }
    }
    return null;
  }
  /**
   * This method writes an XML-representation of this object to
   * the given stream.
   *
   * All attributes will be made visible.
   *
   * @param xw The {@code FreeColXMLWriter} to write to.
   * @exception XMLStreamException if there are any problems writing
   *      to the stream.
   */
  toXML$FreeColXMLWriter(xw: FreeColXMLWriter): void {
    this.toXML$FreeColXMLWriter$String(xw, this.getXMLTagName());
  }
  /**
   * This method writes an XML-representation of this object with
   * a specified tag to the given stream.
   *
   * Almost all FreeColObjects end up calling these, and implementing
   * their own write{Attributes,Children} methods which begin by
   * calling their superclass.  This allows a clean nesting of the
   * serialization routines throughout the class hierarchy.
   *
   * All attributes will be made visible.
   *
   * @param xw The {@code FreeColXMLWriter} to write to.
   * @param tag The tag to use.
   * @exception XMLStreamException if there are any problems writing
   *     to the stream.
   */
  toXML$FreeColXMLWriter$String(xw: FreeColXMLWriter, tag: string): void {
    xw.writeStartElement(tag);
    this.writeAttributes(xw);
    this.writeChildren(xw);
    xw.writeEndElement();
  }
  /**
   * Write the attributes of this object to a stream.
   *
   * To be overridden if required by any object that has attributes
   * and uses the toXML(FreeColXMLWriter, String) call.
   *
   * @param xw The {@code FreeColXMLWriter} to write to.
   * @exception XMLStreamException if there are any problems writing
   *     to the stream.
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    if (this.getId() == null) {
      FreeColObject.logger.warning('FreeColObject with null identifier: ' + $J.str(this));
    } else {
      xw.writeAttribute(FreeColObject.ID_ATTRIBUTE_TAG, this.getId());
    }
  }
  /**
   * Write the children of this object to a stream.
   *
   * To be overridden if required by any object that has children
   * and uses the toXML(FreeColXMLWriter, String) call.
   *
   * @param xw The {@code FreeColXMLWriter} to write to.
   * @exception XMLStreamException if there are any problems writing
   *     to the stream.
   */
  writeChildren(xw: FreeColXMLWriter): void {
  }
  /**
   * This method writes a partial XML-representation of this object to
   * the given stream using only the mandatory and specified fields.
   *
   * All attributes are considered visible as this is
   * server-to-owner-client functionality, but it depends ultimately
   * on the presence of a getFieldName() method that returns a type
   * compatible with String.valueOf.
   *
   * @param xw The {@code FreeColXMLWriter} to write to.
   * @param fields The fields to write.
   * @exception XMLStreamException if there are any problems writing
   *      to the stream.
   */
  toXMLPartial$FreeColXMLWriter$StringArr(xw: FreeColXMLWriter, fields: string[]): void {
    let theClass = $J.getClass(this);
    xw.writeStartElement(this.getXMLTagName());
    xw.writeAttribute(FreeColObject.ID_ATTRIBUTE_TAG, this.getId());
    xw.writeAttribute$String$boolean(FreeColObject.PARTIAL_ATTRIBUTE_TAG, true);
    for (let field of fields) {
      let intro = new Introspector()._Introspector(theClass, field);
      try {
        let value = intro.getter(this);
        xw.writeAttribute(field, value);
      } catch ($e9) {
        if ($J.isa($e9, Introspector$IntrospectorException)) {
          let ie = $J.exc($e9);
          FreeColObject.logger.log(Level.WARNING, 'Failed to write field: ' + field, ie);
        } else {
          throw $e9;
        }
      }
    }
    xw.writeEndElement();
  }
  /**
   * Simpler version of toXMLPartial, where the fields are pre-filled
   * with key,value pairs.  We thus no longer need call the introspector.
   *
   * @param xw The {@code FreeColXMLWriter} to write to.
   * @param fields The fields to write.
   * @exception XMLStreamException if there are any problems writing
   *      to the stream.
   */
  toXMLPartial$FreeColXMLWriter$List(xw: FreeColXMLWriter, fields: List<string>): void {
    let theClass = $J.getClass(this);
    try {
      xw.writeStartElement(this.getXMLTagName());
      xw.writeAttribute(FreeColObject.ID_ATTRIBUTE_TAG, this.getId());
      xw.writeAttribute$String$boolean(FreeColObject.PARTIAL_ATTRIBUTE_TAG, true);
      let n = fields.size();
      for (let i = 0; i < ((n - 1) | 0); i = (i + 2) | 0) {
        xw.writeAttribute(fields.get(i), fields.get((i + 1) | 0));
      }
      xw.writeEndElement();
    } catch ($e10) {
      if ($J.isa($e10, Exception)) {
        let e = $J.exc($e10);
        FreeColObject.logger.log(Level.WARNING, 'Partial write failed for ' + theClass.getName(), e);
      } else {
        throw $e10;
      }
    }
  }
  /**
   * Initializes this object from an XML-representation of this object,
   * unless the PARTIAL_ATTRIBUTE tag is present which indicates
   * a partial update of an existing object.
   *
   * @param xr The input stream with the XML.
   * @exception XMLStreamException if there are any problems reading
   *     the stream.
   */
  readFromXML(xr: FreeColXMLReader): void {
    if (xr.hasAttribute(FreeColObject.PARTIAL_ATTRIBUTE_TAG)) {
      this.readFromXMLPartial(xr);
    } else {
      if (xr.shouldClearContainers()) {
        this.clearContainers$FreeColXMLReader(xr);
      }
      if (xr.shouldReadAttributes()) {
        this.readAttributes(xr);
      }
      this.readChildren(xr);
    }
  }
  /**
   * Clears containers before reading the object.
   *
   * @param xr The {@code FreeColXMLReader} to read from.
   * @throws XMLStreamException if there is a problem reading the stream.
   */
  clearContainers$FreeColXMLReader(xr: FreeColXMLReader): void {
  }
  /**
   * Reads the attributes of this object from an XML stream.
   *
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  readAttributes(xr: FreeColXMLReader): void {
    let newId = xr.readId();
    if (newId != null) {
      this.setId(newId);
    }
  }
  /**
   * Reads the children of this object from an XML stream.
   *
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  readChildren(xr: FreeColXMLReader): void {
    let tag = xr.getLocalName();
    if (tag == null) {
      throw new XMLStreamException('Parse error, null opening tag: ' + $J.str(this));
    }
    try {
      while (xr.moreTags()) {
        this.readChild(xr);
      }
    } catch ($e11) {
      if ($J.isa($e11, XMLStreamException)) {
        let xse = $J.exc($e11);
        FreeColObject.logger.log(Level.SEVERE, 'nextTag failed at ' + tag, xse);
      } else {
        throw $e11;
      }
    }
    xr.expectTag(tag);
  }
  /**
   * Reads a single child object.  Subclasses must override to read
   * their enclosed elements.  This particular instance of the
   * routine always throws XMLStreamException because we should
   * never arrive here.  However it is very useful to always call
   * super.readChild() when an unexpected tag is encountered, as the
   * exception thrown here provides some useful debugging context.
   *
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  readChild(xr: FreeColXMLReader): void {
    xr.unexpectedTag(this.getXMLTagName());
  }
  /**
   * Updates this object from an XML-representation of this object.
   *
   * All attributes are considered visible as this is
   * server-to-owner-client functionality.  It depends ultimately on
   * the presence of a setFieldName() method that takes a parameter
   * type T where T.valueOf(String) exists.
   *
   * @param xr The input stream with the XML.
   * @exception XMLStreamException if a problem was encountered
   *      during parsing.
   */
  readFromXMLPartial(xr: FreeColXMLReader): void {
    let theClass = $J.getClass(this);
    let tag = xr.getLocalName();
    let n = xr.getAttributeCount();
    this.setId(xr.readId());
    for (let i = 0; i < n; i++) {
      let name = xr.getAttributeLocalName(i);
      if ($J.equals(FreeColObject.ID_ATTRIBUTE_TAG, name) || $J.equals(FreeColObject.PARTIAL_ATTRIBUTE_TAG, name)) {
        continue;
      }
      try {
        let intro = new Introspector()._Introspector(theClass, name);
        intro.setter(this, xr.getAttributeValue(i));
      } catch ($e12) {
        if ($J.isa($e12, Exception)) {
          let e = $J.exc($e12);
          FreeColObject.logger.log(Level.WARNING, 'Could not set field ' + name, e);
        } else {
          throw $e12;
        }
      }
    }
    xr.closeTag$String(tag);
  }
  /**
   * Make the standard array key.
   *
   * @param i The array index.
   * @return The array key.
   */
  static arrayKey(i: number): string {
    return 'x' + String(i);
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (o instanceof FreeColObject) {
      let other = o;
      return Utils.equals(this.id_, other.id_);
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    return Utils.hashCode(this.id_);
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    return $J.getClass(this).getName() + ':' + this.getId();
  }
  static $clinit() {
    FreeColObject.logger = Logger.getLogger($J.cls(FreeColObject).getName());
    FreeColObject.fcoComparator = (fco1, fco2) => {
      return FreeColObject.compareIds(fco1, fco2);
    };
  }
}

$J.define(FreeColObject, 'net.sf.freecol.common.model.FreeColObject', { kind: 'class', ifaces: ['java.lang.Comparable', 'net.sf.freecol.common.ObjectWithId'], sup: 'java.lang.Object', ctors: { '': '_FreeColObject' }, returns: { 'hashCode': 'int', 'getXMLTagName': 'java.lang.String', 'getDisplayObject': 'net.sf.freecol.common.model.FreeColObject', 'getDefenceModifiers': 'java.util.List', 'getModifiers$': 'java.util.stream.Stream', 'getSortedModifiers': 'java.util.List', 'getAbilities$': 'java.util.stream.Stream', 'getSortedAbilities': 'java.util.List', 'getFeatureContainer': 'net.sf.freecol.common.model.FeatureContainer', 'getPropertyChangeSupport': 'java.beans.PropertyChangeSupport', 'getGame': 'net.sf.freecol.common.model.Game', 'getSpecification': 'net.sf.freecol.common.model.Specification', 'getClassIndex': 'int', 'getIdNumber': 'int', 'getIdType': 'java.lang.String', 'getSuffix$': 'java.lang.String', 'getId': 'java.lang.String', 'getFreeColObjectClass': 'java.lang.Class' }, meths: { 'clearContainers(net.sf.freecol.common.io.FreeColXMLReader)': 'clearContainers$FreeColXMLReader', 'toXMLPartial(net.sf.freecol.common.io.FreeColXMLWriter,java.util.List)': 'toXMLPartial$FreeColXMLWriter$List', 'toXMLPartial(net.sf.freecol.common.io.FreeColXMLWriter,java.lang.String[])': 'toXMLPartial$FreeColXMLWriter$StringArr', 'toXML(net.sf.freecol.common.io.FreeColXMLWriter,java.lang.String)': 'toXML$FreeColXMLWriter$String', 'toXML(net.sf.freecol.common.io.FreeColXMLWriter)': 'toXML$FreeColXMLWriter', 'copy(net.sf.freecol.common.model.Game,java.lang.Class,net.sf.freecol.common.model.Player)': 'copy$Game$Class$Player', 'copy(net.sf.freecol.common.model.Game,java.lang.Class)': 'copy$Game$Class', 'copy(net.sf.freecol.common.model.Game,net.sf.freecol.common.model.Player)': 'copy$Game$Player', 'copy(net.sf.freecol.common.model.Game)': 'copy$Game', 'serialize(net.sf.freecol.common.io.FreeColXMLWriter$WriteScope,java.util.List)': 'serialize$WriteScope$List', 'serialize(net.sf.freecol.common.io.FreeColXMLWriter$WriteScope)': 'serialize$WriteScope', 'serialize(net.sf.freecol.common.model.Player)': 'serialize$Player', 'serialize()': 'serialize$', 'save(java.io.OutputStream,net.sf.freecol.common.io.FreeColXMLWriter$WriteScope,boolean)': 'save$OutputStream$WriteScope$boolean', 'save(java.io.File,net.sf.freecol.common.io.FreeColXMLWriter$WriteScope,boolean)': 'save$File$WriteScope$boolean', 'save(java.io.File,net.sf.freecol.common.io.FreeColXMLWriter$WriteScope)': 'save$File$WriteScope', 'save(java.io.File)': 'save$File', 'applyModifiers(float,net.sf.freecol.common.model.Turn,java.util.Collection)': 'applyModifiers$float$Turn$Collection', 'applyModifiers(float,net.sf.freecol.common.model.Turn,java.util.stream.Stream)': 'applyModifiers$float$Turn$Stream', 'apply(float,net.sf.freecol.common.model.Turn,java.lang.String,net.sf.freecol.common.model.FreeColSpecObjectType)': 'apply$float$Turn$String$FreeColSpecObjectType', 'apply(float,net.sf.freecol.common.model.Turn,java.lang.String)': 'apply$float$Turn$String', 'getModifiers(java.lang.String,net.sf.freecol.common.model.FreeColSpecObjectType,net.sf.freecol.common.model.Turn)': 'getModifiers$String$FreeColSpecObjectType$Turn', 'getModifiers(java.lang.String,net.sf.freecol.common.model.FreeColSpecObjectType)': 'getModifiers$String$FreeColSpecObjectType', 'getModifiers(java.lang.String)': 'getModifiers$String', 'getModifiers()': 'getModifiers$', 'hasModifier(java.lang.String,net.sf.freecol.common.model.FreeColSpecObjectType,net.sf.freecol.common.model.Turn)': 'hasModifier$String$FreeColSpecObjectType$Turn', 'hasModifier(java.lang.String,net.sf.freecol.common.model.FreeColSpecObjectType)': 'hasModifier$String$FreeColSpecObjectType', 'hasModifier(java.lang.String)': 'hasModifier$String', 'getAbilities(java.lang.String,net.sf.freecol.common.model.FreeColSpecObjectType,net.sf.freecol.common.model.Turn)': 'getAbilities$String$FreeColSpecObjectType$Turn', 'getAbilities(java.lang.String,net.sf.freecol.common.model.FreeColSpecObjectType)': 'getAbilities$String$FreeColSpecObjectType', 'getAbilities(java.lang.String)': 'getAbilities$String', 'getAbilities()': 'getAbilities$', 'hasAbility(java.lang.String,net.sf.freecol.common.model.FreeColSpecObjectType,net.sf.freecol.common.model.Turn)': 'hasAbility$String$FreeColSpecObjectType$Turn', 'hasAbility(java.lang.String,net.sf.freecol.common.model.FreeColSpecObjectType)': 'hasAbility$String$FreeColSpecObjectType', 'hasAbility(java.lang.String)': 'hasAbility$String', 'removePropertyChangeListener(java.lang.String,java.beans.PropertyChangeListener)': 'removePropertyChangeListener$String$PropertyChangeListener', 'removePropertyChangeListener(java.beans.PropertyChangeListener)': 'removePropertyChangeListener$PropertyChangeListener', 'getPropertyChangeListeners(java.lang.String)': 'getPropertyChangeListeners$String', 'getPropertyChangeListeners()': 'getPropertyChangeListeners$', 'firePropertyChange(java.lang.String,java.lang.Object,java.lang.Object)': 'firePropertyChange$String$Object$Object', 'firePropertyChange(java.lang.String,int,int)': 'firePropertyChange$String$int$int', 'firePropertyChange(java.lang.String,boolean,boolean)': 'firePropertyChange$String$boolean$boolean', 'firePropertyChange(java.beans.PropertyChangeEvent)': 'firePropertyChange$PropertyChangeEvent', 'fireIndexedPropertyChange(java.lang.String,int,java.lang.Object,java.lang.Object)': 'fireIndexedPropertyChange$String$int$Object$Object', 'fireIndexedPropertyChange(java.lang.String,int,int,int)': 'fireIndexedPropertyChange$String$int$int$int', 'fireIndexedPropertyChange(java.lang.String,int,boolean,boolean)': 'fireIndexedPropertyChange$String$int$boolean$boolean', 'addPropertyChangeListener(java.lang.String,java.beans.PropertyChangeListener)': 'addPropertyChangeListener$String$PropertyChangeListener', 'addPropertyChangeListener(java.beans.PropertyChangeListener)': 'addPropertyChangeListener$PropertyChangeListener', 'getSuffix()': 'getSuffix$', 'getSuffix(java.lang.String)': 'getSuffix$String' }, clinit: true, lazy: ['logger', 'fcoComparator'] });
$J.module(() => {
  PropertyChangeSupport = $J.load('java.beans.PropertyChangeSupport');
  FreeColXMLReader = $J.load('net.sf.freecol.common.io.FreeColXMLReader');
  FreeColXMLWriter = $J.load('net.sf.freecol.common.io.FreeColXMLWriter');
  FreeColXMLWriter$WriteScope = $J.load('net.sf.freecol.common.io.FreeColXMLWriter$WriteScope');
  FeatureContainer = $J.load('net.sf.freecol.common.model.FeatureContainer');
  Modifier = $J.load('net.sf.freecol.common.model.Modifier');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  Introspector = $J.load('net.sf.freecol.common.util.Introspector');
  Introspector$IntrospectorException = $J.load('net.sf.freecol.common.util.Introspector$IntrospectorException');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
