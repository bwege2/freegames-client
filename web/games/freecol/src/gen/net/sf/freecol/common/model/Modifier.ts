// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/Modifier.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Comparator, JEnum, RuntimeException, StringBuilder } from '../../../../../../jre/index.ts';
import { Feature } from './Feature.ts';

let FreeColObject, Turn, Utils;

/**
 * The {@code Modifier} class encapsulates a bonus or penalty
 * that can be applied to any action within the game, most obviously
 * combat. The Modifier may be applicable only to certain Objects
 * specified by means of {@code Scope} objects.
 */
export class Modifier extends Feature {
  static readonly TAG: string = 'modifier';
  /**
   * Comparator to sort by ascending modifier index, then type, then
   * source, then FCO order.
   */
  static ascendingModifierIndexComparator: Comparator<Modifier> = null;
  static readonly AMPHIBIOUS_ATTACK: string = 'model.modifier.amphibiousAttack';
  static readonly ARTILLERY_AGAINST_RAID: string = 'model.modifier.artilleryAgainstRaid';
  static readonly ARTILLERY_IN_THE_OPEN: string = 'model.modifier.artilleryInTheOpen';
  static readonly ATTACK_BONUS: string = 'model.modifier.attackBonus';
  static readonly BIG_MOVEMENT_PENALTY: string = 'model.modifier.bigMovementPenalty';
  static readonly BOMBARD_BONUS: string = 'model.modifier.bombardBonus';
  static readonly BREEDING_DIVISOR: string = 'model.modifier.breedingDivisor';
  static readonly BREEDING_FACTOR: string = 'model.modifier.breedingFactor';
  static readonly BUILDING_PRICE_BONUS: string = 'model.modifier.buildingPriceBonus';
  static readonly CARGO_PENALTY: string = 'model.modifier.cargoPenalty';
  static readonly COLONY_GOODS_PARTY: string = 'model.modifier.colonyGoodsParty';
  static readonly CONSUME_ONLY_SURPLUS_PRODUCTION: string = 'model.modifier.consumeOnlySurplusProduction';
  static readonly CONVERSION_ALARM_RATE: string = 'model.modifier.conversionAlarmRate';
  static readonly CONVERSION_SKILL: string = 'model.modifier.conversionSkill';
  static readonly DEFENCE: string = 'model.modifier.defence';
  static readonly EXPLORE_LOST_CITY_RUMOUR: string = 'model.modifier.exploreLostCityRumour';
  static readonly EXPOSED_TILES_RADIUS: string = 'model.modifier.exposedTilesRadius';
  static readonly FORTIFIED: string = 'model.modifier.fortified';
  static readonly IMMIGRATION: string = 'model.modifier.immigration';
  static readonly LAND_PAYMENT_MODIFIER: string = 'model.modifier.landPaymentModifier';
  static readonly LIBERTY: string = 'model.modifier.liberty';
  static readonly LINE_OF_SIGHT_BONUS: string = 'model.modifier.lineOfSightBonus';
  static readonly MINIMUM_COLONY_SIZE: string = 'model.modifier.minimumColonySize';
  static readonly MISSIONARY_TRADE_BONUS: string = 'model.modifier.missionaryTradeBonus';
  static readonly MOVEMENT_BONUS: string = 'model.modifier.movementBonus';
  static readonly NATIVE_ALARM_MODIFIER: string = 'model.modifier.nativeAlarmModifier';
  static readonly NATIVE_CONVERT_BONUS: string = 'model.modifier.nativeConvertBonus';
  static readonly OFFENCE: string = 'model.modifier.offence';
  static readonly OFFENCE_AGAINST: string = 'model.modifier.offenceAgainst';
  static readonly PEACE_TREATY: string = 'model.modifier.peaceTreaty';
  static readonly POPULAR_SUPPORT: string = 'model.modifier.popularSupport';
  static readonly RELIGIOUS_UNREST_BONUS: string = 'model.modifier.religiousUnrestBonus';
  static readonly SAIL_HIGH_SEAS: string = 'model.modifier.sailHighSeas';
  static readonly SHIP_TRADE_PENALTY: string = 'model.modifier.shipTradePenalty';
  static readonly SMALL_MOVEMENT_PENALTY: string = 'model.modifier.smallMovementPenalty';
  static readonly SOL: string = 'model.modifier.SoL';
  static readonly TILE_TYPE_CHANGE_PRODUCTION: string = 'model.modifier.tileTypeChangeProduction';
  static readonly TRADE_BONUS: string = 'model.modifier.tradeBonus';
  static readonly TRADE_VOLUME_PENALTY: string = 'model.modifier.tradeVolumePenalty';
  static readonly TREASURE_TRANSPORT_FEE: string = 'model.modifier.treasureTransportFee';
  static readonly WAREHOUSE_STORAGE: string = 'model.modifier.warehouseStorage';
  static readonly UNKNOWN: number = Math.fround(1.4E-45);
  static readonly DEFAULT_MODIFIER_INDEX: number = 0;
  static readonly RESOURCE_PRODUCTION_INDEX: number = 10;
  static readonly COLONY_PRODUCTION_INDEX: number = 20;
  static readonly EXPERT_PRODUCTION_INDEX: number = 30;
  static readonly COLONYTILE_PRODUCTION_INDEX: number = 35;
  static readonly FATHER_PRODUCTION_INDEX: number = 40;
  static readonly IMPROVEMENT_PRODUCTION_INDEX: number = 50;
  static readonly AUTO_PRODUCTION_INDEX: number = 60;
  static readonly BUILDING_PRODUCTION_INDEX: number = 70;
  static readonly NATION_PRODUCTION_INDEX: number = 80;
  static readonly PARTY_PRODUCTION_INDEX: number = 90;
  static readonly DISASTER_PRODUCTION_INDEX: number = 100;
  static readonly DEFAULT_PRODUCTION_INDEX: number = 100;
  static readonly BASE_COMBAT_INDEX: number = 10;
  static readonly UNIT_ADDITIVE_COMBAT_INDEX: number = 20;
  static readonly UNIT_NORMAL_COMBAT_INDEX: number = 40;
  static readonly ROLE_COMBAT_INDEX: number = 30;
  static readonly GENERAL_COMBAT_INDEX: number = 50;
  /**
   * The type of this Modifier.
   */
  modifierType: Modifier$ModifierType = null;
  /**
   * The value of this Modifier.
   */
  value_: number = 0;
  /**
   * The value increments per turn.  This can be used to create
   * Modifiers whose values increase or decrease over time.
   */
  increment_: number = 0;
  /**
   * The type of increment.
   */
  incrementType: Modifier$ModifierType = null;
  /**
   * A sorting index.
   */
  modifierIndex: number = 0;
  static readonly INCREMENT_TAG: string = 'increment';
  static readonly INCREMENT_TYPE_TAG: string = 'increment-type';
  static readonly INDEX_TAG: string = 'index';
  static readonly TYPE_TAG: string = 'type';
  static readonly OLD_INCREMENT_TYPE_TAG: string = 'incrementType';
  $init_Modifier() {
    this.modifierIndex = Modifier.DEFAULT_MODIFIER_INDEX;
  }
  /**
   * Deliberately empty constructor.
   *
   * @param specification The defining {@code Specification}.
   */
  _Modifier$Specification(specification: Specification): this {
    this._Feature(specification);
    this.$init_Modifier();
    return this;
  }
  /**
   * Creates a new {@code Modifier} instance.
   *
   * @param id The object identifier.
   * @param value The modifier value.
   * @param type The type of the modifier.
   * @param source The source {@code FreeColObject}.
   * @param modifierIndex The modifier index.
   */
  _Modifier$String$float$ModifierType$FreeColObject$int(id: string, value: number, type$: Modifier$ModifierType, source: FreeColObject, modifierIndex: number): this {
    this._Modifier$Specification((source == null) ? null : source.getSpecification());
    this.setId(id);
    this.setValue(value);
    this.setType(type$);
    this.setSource(source);
    this.setModifierIndex(modifierIndex);
    return this;
  }
  /**
   * Creates a new {@code Modifier} instance.
   *
   * @param id The object identifier.
   * @param value The modifier value.
   * @param type The type of the modifier.
   * @param source The source {@code FreeColObject}.
   */
  _Modifier$String$float$ModifierType$FreeColObject(id: string, value: number, type$: Modifier$ModifierType, source: FreeColObject): this {
    this._Modifier$String$float$ModifierType$FreeColObject$int(id, value, type$, source, Modifier.DEFAULT_MODIFIER_INDEX);
    return this;
  }
  /**
   * Creates a new {@code Modifier} instance.
   *
   * @param id The object identifier.
   * @param value The modifier value.
   * @param type The type of the modifier.
   */
  _Modifier$String$float$ModifierType(id: string, value: number, type$: Modifier$ModifierType): this {
    this._Modifier$String$float$ModifierType$FreeColObject(id, value, type$, null);
    return this;
  }
  /**
   * Creates a new {@code Modifier} instance.
   *
   * @param xr The {@code FreeColXMLReader} to read from.
   * @param specification The {@code Specification} to refer to.
   * @exception XMLStreamException if there is an error reading the
   *     stream.
   */
  _Modifier$FreeColXMLReader$Specification(xr: FreeColXMLReader, specification: Specification): this {
    this._Modifier$Specification(specification);
    this.readFromXML(xr);
    return this;
  }
  /**
   * Make a copy of a modifier.
   *
   * @param modifier The {@code Modifier} to copy.
   * @return A copy of the modifier.
   */
  static makeModifier(modifier: Modifier): Modifier {
    let ret = new Modifier()._Modifier$Specification(modifier.getSpecification());
    ret.setId(modifier.getId());
    ret.copyIn(modifier);
    return ret;
  }
  /**
   * Makes a timed modifier (one with start/end turn and increment)
   * with the specified identifier from a template modifier
   * (containing the increment and value) and given start turn.
   *
   * Currently the only suitable template is
   * "model.modifier.colonyGoodsParty".
   *
   * @param id The id for the new modifier.
   * @param template A template {@code Modifier} with increment.
   * @param start The starting {@code Turn}.
   * @return A new timed modifier.
   */
  static makeTimedModifier(id: string, template: Modifier, start: Turn): Modifier {
    let modifier = Modifier.makeModifier(template);
    modifier.setId(id);
    let inc = template.getIncrement();
    let duration = template.getDuration();
    modifier.setTemporary(template.isTemporary());
    if (duration === 0) {
      duration = $J.d2i((Math.fround(template.getValue$() / Math.fround(-inc))));
    }
    modifier.setIncrement$ModifierType$float$Turn$Turn(template.getIncrementType(), inc, start, new Turn()._Turn((start.getNumber() + duration) | 0));
    return modifier;
  }
  /**
   * Get the modifier type.
   *
   * @return The {@code ModifierType}.
   */
  getType(): Modifier$ModifierType {
    return this.modifierType;
  }
  /**
   * Set the modifier type.
   *
   * @param modifierType The new {@code ModifierType} value.
   * @return This modifier.
   */
  setType(modifierType: Modifier$ModifierType): Modifier {
    this.modifierType = modifierType;
    return this;
  }
  /**
   * Is this a "known" value.
   *
   * @param value The value to test.
   * @return True if the value is known.
   */
  static isFloatKnown(value: number): boolean {
    return $J.dcmp(value, Modifier.UNKNOWN) !== 0;
  }
  /**
   * Does this modifier have a known value?
   *
   * That is, is it not set to the UNKNOWN value.
   *
   * @return True if the value is known.
   */
  isKnown(): boolean {
    return Modifier.isFloatKnown(this.value_);
  }
  /**
   * Get the modifier value.
   *
   * @return The modifier value.
   */
  getValue$(): number {
    return this.value_;
  }
  /**
   * Get the value the modifier during the given Turn.
   *
   * @param turn The {@code Turn} to check.
   * @return The turn-dependent modifier value.
   */
  getValue$Turn(turn: Turn): number {
    if (this.appliesTo$Turn(turn)) {
      if (this.hasIncrement()) {
        let f = Math.fround(((turn.getNumber() - this.getFirstTurn().getNumber()) | 0) * this.increment_);
        return this.apply$float$float$ModifierType$Modifier(this.value_, f, this.incrementType);
      } else {
        return this.value_;
      }
    } else {
      return 0;
    }
  }
  /**
   * Set the modifier value.
   *
   * @param value The new value.
   * @return This modifier.
   */
  setValue(value: number): Modifier {
    this.value_ = value;
    return this;
  }
  /**
   * Does this modifier have an increment?
   *
   * @return True if this modifier has an increment.
   */
  hasIncrement(): boolean {
    return this.incrementType != null;
  }
  /**
   * Get the increment type.
   *
   * @return The increment {@code ModifierType}.
   */
  getIncrementType(): Modifier$ModifierType {
    return this.incrementType;
  }
  /**
   * Set the increment type.
   *
   * @param incrementType The new increment {@code ModifierType}.
   * @return This modifier.
   */
  setIncrementType(incrementType: Modifier$ModifierType): Modifier {
    this.incrementType = incrementType;
    return this;
  }
  /**
   * Get the increment value.
   *
   * @return The increment value.
   */
  getIncrement(): number {
    return this.increment_;
  }
  /**
   * Set the increment value.
   *
   * @param increment The new value.
   * @return This modifier.
   */
  setIncrement$float(increment: number): Modifier {
    this.increment_ = increment;
    return this;
  }
  /**
   * Set the whole increment.
   *
   * @param incrementType The new {@code ModifierType}.
   * @param increment The new increment value.
   * @param firstTurn The first {@code Turn} the increment is
   *     active.
   * @param lastTurn The last {@code Turn} the increment is
   *     active.
   * @return This modifier.
   */
  setIncrement$ModifierType$float$Turn$Turn(incrementType: Modifier$ModifierType, increment: number, firstTurn: Turn, lastTurn: Turn): Modifier {
    if (firstTurn == null) {
      throw new RuntimeException('Null firstTurn: ' + $J.str(this));
    }
    this.incrementType = incrementType;
    this.increment_ = increment;
    this.setFirstTurn(firstTurn);
    this.setLastTurn(lastTurn);
    return this;
  }
  /**
   * Get the modifier index.
   *
   * @return The modifier index.
   */
  getModifierIndex(): number {
    return this.modifierIndex;
  }
  /**
   * Set the modifier index.
   *
   * @param modifierIndex The new modifier index value.
   * @return This modifier.
   */
  setModifierIndex(modifierIndex: number): Modifier {
    this.modifierIndex = modifierIndex;
    return this;
  }
  /**
   * Applies the given value to the given base value, depending on
   * the type of this Modifier.
   *
   * @param base a {@code float} value
   * @param value a {@code float} value
   * @return a {@code float} value
   */
  apply$float$float(base: number, value: number): number {
    return this.apply$float$float$ModifierType$Modifier(base, value, this.getType());
  }
  /**
   * Applies the given value to the given base value, depending on
   * the give modifier Type.
   *
   * @param base The base value.
   * @param value The modifier value.
   * @param type The {@code ModifierType}.
   * @return The result of applying the value to the base.
   */
  apply$float$float$ModifierType$Modifier(base: number, value: number, type$: Modifier$ModifierType): number {
    switch (type$) {
      case Modifier$ModifierType.ADDITIVE:
        return Math.fround(base + value);
      case Modifier$ModifierType.MULTIPLICATIVE:
        return Math.fround(base * value);
      case Modifier$ModifierType.PERCENTAGE:
        return Math.fround(base + Math.fround((Math.fround(base * value)) / 100));
      default:
        return base;
    }
  }
  /**
   * Applies this Modifier to a number. This method does not take
   * scopes, increments or time limits into account.
   *
   * @param number a {@code float} value
   * @return a {@code float} value
   */
  applyTo$float(number$: number): number {
    return this.apply$float$float(number$, this.value_);
  }
  /**
   * Applies this Modifier to a number.  This method does take
   * increments into account.
   *
   * @param number The number to modify.
   * @param turn The {@code Turn} to evaluate increments in.
   * @return The modified number.
   */
  applyTo$float$Turn(number$: number, turn: Turn): number {
    return (this.incrementType == null) ? this.apply$float$float(number$, this.value_) : this.apply$float$float$ModifierType$Modifier(number$, this.getValue$Turn(turn), this.getType());
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(Modifier));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.setType(o.getType());
    this.setValue(o.getValue$());
    this.setIncrement$float(o.getIncrement());
    this.setIncrementType(o.getIncrementType());
    this.setModifierIndex(o.getModifierIndex());
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$float(FreeColObject.VALUE_TAG, this.value_);
    xw.writeAttribute$String$Enum(Modifier.TYPE_TAG, this.modifierType);
    if (this.incrementType != null) {
      xw.writeAttribute$String$Enum(Modifier.INCREMENT_TYPE_TAG, this.incrementType);
      xw.writeAttribute$String$float(Modifier.INCREMENT_TAG, this.increment_);
    }
    if (this.modifierIndex >= 0) {
      xw.writeAttribute$String$int(Modifier.INDEX_TAG, this.modifierIndex);
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.modifierType = xr.getAttribute$String$Class$Enum(Modifier.TYPE_TAG, $J.cls(Modifier$ModifierType), null);
    this.value_ = xr.getAttribute$String$float(FreeColObject.VALUE_TAG, Modifier.UNKNOWN);
    if (xr.hasAttribute(Modifier.OLD_INCREMENT_TYPE_TAG)) {
      this.incrementType = xr.getAttribute$String$Class$Enum(Modifier.OLD_INCREMENT_TYPE_TAG, $J.cls(Modifier$ModifierType), null);
      this.increment_ = xr.getAttribute$String$float(Modifier.INCREMENT_TAG, Modifier.UNKNOWN);
    } else if (xr.hasAttribute(Modifier.INCREMENT_TYPE_TAG)) {
      this.incrementType = xr.getAttribute$String$Class$Enum(Modifier.INCREMENT_TYPE_TAG, $J.cls(Modifier$ModifierType), null);
      this.increment_ = xr.getAttribute$String$float(Modifier.INCREMENT_TAG, Modifier.UNKNOWN);
    } else {
      this.incrementType = null;
      this.increment_ = 0;
    }
    this.modifierIndex = xr.getAttribute$String$int(Modifier.INDEX_TAG, Modifier.DEFAULT_MODIFIER_INDEX);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return Modifier.TAG;
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (o === this) {
      return true;
    }
    if (o instanceof Modifier) {
      let other = o;
      return $J.dcmp(this.value_, other.value_) === 0 && $J.dcmp(this.increment_, other.increment_) === 0 && this.modifierIndex === other.modifierIndex && Utils.equals(this.modifierType, other.modifierType) && Utils.equals(this.incrementType, other.incrementType) && super.equals(other);
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    hash = (Math.imul(31, hash) + $J.Float_floatToIntBits(this.value_)) | 0;
    hash = (Math.imul(31, hash) + $J.Float_floatToIntBits(this.increment_)) | 0;
    hash = (Math.imul(31, hash) + Utils.hashCode(this.modifierType)) | 0;
    hash = (Math.imul(31, hash) + Utils.hashCode(this.incrementType)) | 0;
    return (Math.imul(31, hash) + this.modifierIndex) | 0;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(64);
    sb.append('[Modifier ').append(this.getId());
    if (this.getSource() != null) {
      sb.append(' (').append(this.getSource().getId()).append(String.fromCharCode(41 /* ')' */));
    }
    sb.append(String.fromCharCode(32 /* ' ' */)).append($J.str(this.modifierType)).append(String.fromCharCode(32 /* ' ' */)).append($J.fstr(this.value_));
    if (this.modifierIndex >= Modifier.DEFAULT_MODIFIER_INDEX) {
      sb.append(' index=').append(String(this.modifierIndex));
    }
    let scopes = this.getScopeList();
    if (!scopes.isEmpty()) {
      sb.append(' [');
      for (const $it0 = scopes.iterator(); $it0.hasNext(); ) {
        let s = $it0.next();
        sb.append(String.fromCharCode(32 /* ' ' */)).append($J.str(s));
      }
      sb.append(' ]');
    }
    sb.append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
  static $clinit() {
    Modifier.ascendingModifierIndexComparator = Comparator.thenComparing(Comparator.thenComparing(Comparator.thenComparingInt((Comparator.comparingInt(($p0) => $p0.getModifierIndex())), (m) => m.getType().ordinal()), FreeColObject.fcoComparator), ($p0) => $p0.getSource(), FreeColObject.fcoComparator);
  }
}

export class Modifier$ModifierType extends JEnum {
  static ADDITIVE: Modifier$ModifierType = null;
  static MULTIPLICATIVE: Modifier$ModifierType = null;
  static PERCENTAGE: Modifier$ModifierType = null;
  static $VALUES: Modifier$ModifierType[] = null;
  _Modifier$ModifierType($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Modifier$ModifierType[] { return Modifier$ModifierType.$VALUES.slice(); }
  static valueOf(name: string): Modifier$ModifierType { return $J.enumValueOf(Modifier$ModifierType, name); }
  static $clinit() {
    Modifier$ModifierType.ADDITIVE = new Modifier$ModifierType()._Modifier$ModifierType('ADDITIVE', 0);
    Modifier$ModifierType.MULTIPLICATIVE = new Modifier$ModifierType()._Modifier$ModifierType('MULTIPLICATIVE', 1);
    Modifier$ModifierType.PERCENTAGE = new Modifier$ModifierType()._Modifier$ModifierType('PERCENTAGE', 2);
    Modifier$ModifierType.$VALUES = [Modifier$ModifierType.ADDITIVE, Modifier$ModifierType.MULTIPLICATIVE, Modifier$ModifierType.PERCENTAGE];
  }
}

$J.define(Modifier, 'net.sf.freecol.common.model.Modifier', { kind: 'class', sup: 'net.sf.freecol.common.model.Feature', ctors: { 'net.sf.freecol.common.io.FreeColXMLReader,net.sf.freecol.common.model.Specification': '_Modifier$FreeColXMLReader$Specification', 'java.lang.String,float,net.sf.freecol.common.model.Modifier$ModifierType': '_Modifier$String$float$ModifierType', 'java.lang.String,float,net.sf.freecol.common.model.Modifier$ModifierType,net.sf.freecol.common.model.FreeColObject': '_Modifier$String$float$ModifierType$FreeColObject', 'java.lang.String,float,net.sf.freecol.common.model.Modifier$ModifierType,net.sf.freecol.common.model.FreeColObject,int': '_Modifier$String$float$ModifierType$FreeColObject$int', 'net.sf.freecol.common.model.Specification': '_Modifier$Specification' }, returns: { 'hashCode': 'int', 'getXMLTagName': 'java.lang.String', 'getModifierIndex': 'int', 'getIncrement': 'float', 'getIncrementType': 'net.sf.freecol.common.model.Modifier$ModifierType', 'hasIncrement': 'boolean', 'getValue$': 'float', 'isKnown': 'boolean', 'getType': 'net.sf.freecol.common.model.Modifier$ModifierType' }, meths: { 'applyTo(float,net.sf.freecol.common.model.Turn)': 'applyTo$float$Turn', 'applyTo(float)': 'applyTo$float', 'apply(float,float,net.sf.freecol.common.model.Modifier$ModifierType)': 'apply$float$float$ModifierType$Modifier', 'apply(float,float)': 'apply$float$float', 'setIncrement(net.sf.freecol.common.model.Modifier$ModifierType,float,net.sf.freecol.common.model.Turn,net.sf.freecol.common.model.Turn)': 'setIncrement$ModifierType$float$Turn$Turn', 'setIncrement(float)': 'setIncrement$float', 'getValue(net.sf.freecol.common.model.Turn)': 'getValue$Turn', 'getValue()': 'getValue$' }, clinit: true, lazy: ['ascendingModifierIndexComparator'] });
$J.define(Modifier$ModifierType, 'net.sf.freecol.common.model.Modifier$ModifierType', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Modifier$ModifierType' }, clinit: true, lazy: ['$VALUES', 'ADDITIVE', 'MULTIPLICATIVE', 'PERCENTAGE'] });
$J.module(() => {
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  Turn = $J.load('net.sf.freecol.common.model.Turn');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
