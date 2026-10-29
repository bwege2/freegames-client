// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/FeatureContainer.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, HashMap, HashSet, JObject, Logger, Stream, StringBuilder } from '../../../../../../jre/index.ts';

let Ability, Modifier, CollectionUtils;

/**
 * A container to hold abilities and modifiers for some FreeColObject-subclass.
 *
 * - FreeColSpecObjectType, Europe, Player, Settlement are current
 *   implementors.
 *
 * - Building delegates some functionality to its type.
 *
 * - Unit fakes it by constructing a FeatureContainer on the fly.
 *
 * - FreeColObject itself implements a null version.
 */
export class FeatureContainer extends JObject {
  static logger: Logger = null;
  /**
   * Lock variables.
   */
  abilitiesLock: any = null;
  modifiersLock: any = null;
  /**
   * The abilities in the container.
   */
  abilities: JMap<string, JSet<Ability>> = null;
  /**
   * The modifiers in the container.
   */
  modifiers: JMap<string, JSet<Modifier>> = null;
  _FeatureContainer(): this {
    this.abilitiesLock = new JObject();
    this.modifiersLock = new JObject();
    this.abilities = null;
    this.modifiers = null;
    return this;
  }
  /**
   * Have the abilities map been created?
   *
   * @return True if the abilities are present.
   */
  abilitiesPresent(): boolean {
    {
      return this.abilities != null;
    }
  }
  /**
   * On demand creation of the abilities map.
   */
  requireAbilities(): void {
    {
      if (this.abilities == null) {
        this.abilities = new HashMap();
      }
    }
  }
  /**
   * Have the modifiers map been created?
   *
   * @return True if the modifiers are present.
   */
  modifiersPresent(): boolean {
    {
      return this.modifiers != null;
    }
  }
  /**
   * On demand creation of the modifiers map.
   */
  requireModifiers(): void {
    {
      if (this.modifiers == null) {
        this.modifiers = new HashMap();
      }
    }
  }
  getAbilityValues(): Collection<Ability> {
    let ret = new HashSet();
    {
      if (this.abilities != null) {
        for (const $it0 = this.abilities.values().iterator(); $it0.hasNext(); ) {
          let as$ = $it0.next();
          ret.addAll(as$);
        }
      }
    }
    return ret;
  }
  /**
   * Gets all modifiers with any filtering applied.
   * @return All the modifiers stored in this {@code FeatureContainer}.
   */
  getModifierValues(): Collection<Modifier> {
    let ret = new HashSet();
    {
      if (this.modifiers != null) {
        for (const $it1 = this.modifiers.values().iterator(); $it1.hasNext(); ) {
          let ms = $it1.next();
          ret.addAll(ms);
        }
      }
    }
    return ret;
  }
  /**
   * Is the given set of abilities non-empty and contains no
   * false-valued members?
   *
   * @param abilities A stream of {@code Ability}s to check.
   * @return True if the abilities are `satisfied'.
   */
  static allAbilities(abilities: Stream<Ability>): boolean {
    let ret = false;
    for (const $it2 = CollectionUtils.iterable(abilities).iterator(); $it2.hasNext(); ) {
      let ability = $it2.next();
      if (!ability.getValue()) {
        return false;
      }
      ret = true;
    }
    return ret;
  }
  /**
   * Is the given set of abilities non-empty and contains no
   * false-valued members?
   *
   * @param id The object identifier.
   * @param fcgot An optional {@code FreeColSpecObjectType} the
   *     ability applies to.
   * @param turn An optional applicable {@code Turn}.
   * @return True if the ability is present.
   */
  hasAbility(id: string, fcgot: FreeColSpecObjectType, turn: Turn): boolean {
    return FeatureContainer.allAbilities(this.getAbilities(id, fcgot, turn));
  }
  /**
   * Checks if this container contains a given ability key.
   *
   * @param key The key to check.
   * @return True if the key is present.
   */
  containsAbilityKey(key: string): boolean {
    return CollectionUtils.first$Stream(this.getAbilities(key, null, null)) != null;
  }
  /**
   * Gets the set of abilities with the given identifier from a
   * container.
   *
   * @param id The object identifier (null matches all).
   * @param fcgot An optional {@code FreeColSpecObjectType} the
   *     ability applies to.
   * @param turn An optional applicable {@code Turn}.
   * @return A stream of abilities.
   */
  getAbilities(id: string, fcgot: FreeColSpecObjectType, turn: Turn): Stream<Ability> {
    let result = new HashSet();
    if (this.abilitiesPresent()) {
      {
        if (id == null) {
          for (const $it3 = this.abilities.values().iterator(); $it3.hasNext(); ) {
            let aset = $it3.next();
            result.addAll(aset);
          }
        } else {
          let aset = this.abilities.get(id);
          if (aset != null) {
            result.addAll(aset);
          }
        }
      }
      CollectionUtils.removeInPlace$Collection$Predicate(result, (a) => !a.appliesTo$FreeColSpecObjectType$Turn(fcgot, turn));
    }
    return result.stream();
  }
  /**
   * Add the given ability to a container.
   *
   * @param ability An {@code Ability} to add.
   * @return True if the {@code Ability} was added.
   */
  addAbility(ability: Ability): boolean {
    if (ability == null) {
      return false;
    }
    this.requireAbilities();
    {
      let abilitySet = this.abilities.get(ability.getId());
      if (abilitySet == null) {
        abilitySet = new HashSet();
        this.abilities.put(ability.getId(), abilitySet);
      }
      return abilitySet.add(ability);
    }
  }
  /**
   * Remove the given ability from a container.
   *
   * @param ability An {@code Ability} to remove.
   * @return The ability removed or null on failure.
   */
  removeAbility(ability: Ability): Ability {
    if (ability == null || !this.abilitiesPresent()) {
      return null;
    }
    {
      let abilitySet = this.abilities.get(ability.getId());
      return (abilitySet == null || !abilitySet.remove(ability)) ? null : ability;
    }
  }
  /**
   * Remove all abilities with a given identifier.
   *
   * @param id The object identifier.
   */
  removeAbilities(id: string): void {
    if (!this.abilitiesPresent()) {
      return;
    }
    {
      this.abilities.remove(id);
    }
  }
  /**
   * Gets the set of modifiers with the given identifier from this
   * container.
   *
   * @param id The object identifier.
   * @param fcgot An optional {@code FreeColSpecObjectType} the
   *     modifier applies to.
   * @param turn An optional applicable {@code Turn}.
   * @return A stream of {@code Modifier}s.
   */
  getModifiers(id: string, fcgot: FreeColSpecObjectType, turn: Turn): Stream<Modifier> {
    if (!this.modifiersPresent()) {
      return Stream.empty();
    }
    let mset = new HashSet();
    {
      if (id == null) {
        for (const $it4 = this.modifiers.values().iterator(); $it4.hasNext(); ) {
          let ms = $it4.next();
          mset.addAll(ms);
        }
      } else {
        let ms = this.modifiers.get(id);
        if (ms != null) {
          mset.addAll(ms);
        }
      }
    }
    CollectionUtils.removeInPlace$Collection$Predicate(mset, (m) => !m.appliesTo$FreeColSpecObjectType$Turn(fcgot, turn));
    return (mset.isEmpty()) ? Stream.empty() : mset.stream();
  }
  /**
   * Applies a collection of modifiers to the given float value.
   *
   * @param number The number to modify.
   * @param turn An optional applicable {@code Turn}.
   * @param mods The {@code Modifier}s to apply.
   * @return The modified number.
   */
  static applyModifiers$float$Turn$Collection(number$: number, turn: Turn, mods: Collection<Modifier>): number {
    return (mods == null || mods.isEmpty()) ? number$ : FeatureContainer.applyModifiersInternal(number$, turn, CollectionUtils.sort$Collection$Comparator(mods, Modifier.ascendingModifierIndexComparator));
  }
  /**
   * Applies a stream of modifiers to the given float value.
   *
   * @param number The number to modify.
   * @param turn An optional applicable {@code Turn}.
   * @param mods The {@code Modifier}s to apply.
   * @return The modified number.
   */
  static applyModifiers$float$Turn$Stream(number$: number, turn: Turn, mods: Stream<Modifier>): number {
    return (mods == null) ? number$ : FeatureContainer.applyModifiersInternal(number$, turn, CollectionUtils.sort$Stream$Comparator(mods, Modifier.ascendingModifierIndexComparator));
  }
  /**
   * Implement applyModifiers.
   *
   * @param number The number to modify.
   * @param turn An optional applicable {@code Turn}.
   * @param mods The {@code Modifier}s to apply.
   * @return The modified number.
   */
  static applyModifiersInternal(number$: number, turn: Turn, mods: Collection<Modifier>): number {
    let result = number$;
    for (const $it5 = mods.iterator(); $it5.hasNext(); ) {
      let m = $it5.next();
      let value = m.getValue$Turn(turn);
      if ($J.dcmp(value, Modifier.UNKNOWN) === 0) {
        return value;
      }
      result = m.apply$float$float(result, value);
    }
    return result;
  }
  /**
   * Adds a modifier to a container.
   *
   * @param modifier The {@code Modifier} to add.
   * @return True if the modifier was added.
   */
  addModifier(modifier: Modifier): boolean {
    if (modifier == null) {
      return false;
    }
    this.requireModifiers();
    {
      let modifierSet = this.modifiers.get(modifier.getId());
      if (modifierSet == null) {
        modifierSet = new HashSet();
        this.modifiers.put(modifier.getId(), modifierSet);
      }
      return modifierSet.add(modifier);
    }
  }
  /**
   * Removes a modifier from a container.
   *
   * @param modifier The {@code Modifier} to remove.
   * @return The modifier removed.
   */
  removeModifier(modifier: Modifier): Modifier {
    if (modifier == null || !this.modifiersPresent()) {
      return null;
    }
    {
      let modifierSet = this.modifiers.get(modifier.getId());
      return (modifierSet == null || !modifierSet.remove(modifier)) ? null : modifier;
    }
  }
  /**
   * Removes all modifiers with a given identifier.
   *
   * @param id The object identifier.
   */
  removeModifiers(id: string): void {
    if (!this.modifiersPresent()) {
      return;
    }
    {
      this.modifiers.remove(id);
    }
  }
  /**
   * Adds all the features in an object to this object.
   *
   * @param fco The {@code FreeColObject} to add features from.
   */
  addFeatures(fco: FreeColObject): void {
    let c = fco.getFeatureContainer();
    if (c == null) {
      return;
    }
    if (c.abilitiesPresent()) {
      this.requireAbilities();
      let ca: HashMap<string, JSet<Ability>>;
      {
        ca = new HashMap(c.abilities);
      }
      {
        CollectionUtils.forEachMapEntry$Map$Consumer(ca, (e) => {
          let abilitySet = this.abilities.get(e.getKey());
          if (abilitySet == null) {
            abilitySet = new HashSet();
            this.abilities.put(e.getKey(), abilitySet);
          }
          abilitySet.addAll(e.getValue());
        });
      }
    }
    if (c.modifiersPresent()) {
      this.requireModifiers();
      let cm: HashMap<string, JSet<Modifier>>;
      {
        cm = new HashMap(c.modifiers);
      }
      {
        CollectionUtils.forEachMapEntry$Map$Consumer(cm, (e) => {
          let modifierSet = this.modifiers.get(e.getKey());
          if (modifierSet == null) {
            modifierSet = new HashSet();
            this.modifiers.put(e.getKey(), modifierSet);
          }
          modifierSet.addAll(e.getValue());
        });
      }
    }
  }
  /**
   * Removes all the features in an object from a container.
   *
   * @param fco The {@code FreeColObject} to find features to remove
   *     in.
   */
  removeFeatures(fco: FreeColObject): void {
    let c = fco.getFeatureContainer();
    if (c == null) {
      return;
    }
    if (this.abilitiesPresent() && c.abilitiesPresent()) {
      let ca = new HashSet();
      {
        ca.addAll(c.abilities.keySet());
      }
      {
        for (const $it6 = ca.iterator(); $it6.hasNext(); ) {
          let key = $it6.next();
          let abilitySet = this.abilities.get(key);
          if (abilitySet == null) {
            continue;
          }
          for (const $it7 = new HashSet(abilitySet).iterator(); $it7.hasNext(); ) {
            let a = $it7.next();
            if (a.getSource() === fco) {
              abilitySet.remove(a);
            }
          }
        }
      }
    }
    if (this.modifiersPresent() && c.modifiersPresent()) {
      let cm = new HashSet();
      {
        cm.addAll(c.modifiers.keySet());
      }
      {
        for (const $it8 = cm.iterator(); $it8.hasNext(); ) {
          let key = $it8.next();
          let modifierSet = this.modifiers.get(key);
          if (modifierSet == null) {
            continue;
          }
          for (const $it9 = new HashSet(modifierSet).iterator(); $it9.hasNext(); ) {
            let m = $it9.next();
            if (m.getSource() === fco) {
              modifierSet.remove(m);
            }
          }
        }
      }
    }
  }
  /**
   * Copy anther feature container.
   *
   * @param other The other {@code FeatureContainer}.
   */
  copy(other: FeatureContainer): void {
    this.clear();
    if (other != null) {
      for (const $it10 = other.getAbilityValues().iterator(); $it10.hasNext(); ) {
        let a = $it10.next();
        this.addAbility(a);
      }
      for (const $it11 = other.getModifierValues().iterator(); $it11.hasNext(); ) {
        let m = $it11.next();
        this.addModifier(m);
      }
    }
  }
  /**
   * Clear this feature container.
   */
  clear(): void {
    if (this.abilitiesPresent()) {
      {
        this.abilities.clear();
      }
    }
    if (this.modifiersPresent()) {
      {
        this.modifiers.clear();
      }
    }
  }
  /**
   * Replaces the source field. This is necessary because objects
   * may inherit Features from other abstract objects.
   *
   * @param oldSource The old source {@code FreeColSpecObjectType}.
   * @param newSource The new source {@code FreeColSpecObjectType}.
   */
  replaceSource(oldSource: FreeColSpecObjectType, newSource: FreeColSpecObjectType): void {
    for (const $it12 = (CollectionUtils.transform$Stream$Predicate(this.getAbilities(null, null, null), (a) => oldSource == null || a.getSource() === oldSource)).iterator(); $it12.hasNext(); ) {
      let ability = $it12.next();
      this.removeAbility(ability);
      let newAbility = new Ability()._Ability$Ability(ability);
      newAbility.setSource(newSource);
      this.addAbility(newAbility);
    }
    for (const $it13 = (CollectionUtils.transform$Stream$Predicate(this.getModifiers(null, null, null), (m) => oldSource == null || m.getSource() === oldSource)).iterator(); $it13.hasNext(); ) {
      let modifier = $it13.next();
      this.removeModifier(modifier);
      let mod = Modifier.makeModifier(modifier);
      mod.setSource(newSource);
      this.addModifier(mod);
    }
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(256);
    sb.append('[FeatureContainer');
    let siz = sb.length();
    for (const $it14 = CollectionUtils.iterable(this.getAbilities(null, null, null)).iterator(); $it14.hasNext(); ) {
      let ability = $it14.next();
      sb.append(String.fromCharCode(32 /* ' ' */)).append($J.str(ability));
    }
    if (sb.length() > siz) {
      sb.insert(siz, ' [abilities');
      sb.append(String.fromCharCode(93 /* ']' */));
    }
    siz = sb.length();
    for (const $it15 = CollectionUtils.iterable(this.getModifiers(null, null, null)).iterator(); $it15.hasNext(); ) {
      let modifier = $it15.next();
      sb.append(String.fromCharCode(32 /* ' ' */)).append($J.str(modifier));
    }
    if (sb.length() > siz) {
      sb.insert(siz, '[modifiers');
      sb.append(String.fromCharCode(93 /* ']' */));
    }
    sb.append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
  static $clinit() {
    FeatureContainer.logger = Logger.getLogger($J.cls(FeatureContainer).getName());
  }
}

$J.define(FeatureContainer, 'net.sf.freecol.common.model.FeatureContainer', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_FeatureContainer' }, returns: { 'getModifierValues': 'java.util.Collection', 'getAbilityValues': 'java.util.Collection' }, meths: { 'applyModifiers(float,net.sf.freecol.common.model.Turn,java.util.stream.Stream)': 'applyModifiers$float$Turn$Stream', 'applyModifiers(float,net.sf.freecol.common.model.Turn,java.util.Collection)': 'applyModifiers$float$Turn$Collection' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  Modifier = $J.load('net.sf.freecol.common.model.Modifier');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
