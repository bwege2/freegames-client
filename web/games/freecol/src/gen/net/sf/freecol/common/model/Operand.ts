// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/Operand.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Integer, JBoolean, JEnum, JString, Logger, StringBuilder } from '../../../../../../jre/index.ts';
import { Scope } from './Scope.ts';

let Colony, Constants, FreeColObject, GameOptions, CollectionUtils, Utils;

/**
 * The {@code Operand} class implements Operands to be used in
 * relations, such as the Limit class. The OperandType specifies which
 * types of objects will be considered, and the ScopeLevel specifies
 * the level at which these objects are to be selected. If the
 * ScopeLevel is PLAYER, for example, and the OperandType is UNITS,
 * then all units owned by a particular player will be considered.
 *
 * Since the class inherits from Scope, the choice of objects can be
 * further refined by specifying type, ability or method. However, the
 * return value of the method must be an Integer (or int), since this
 * value will be returned as the value of the Operand itself if the
 * OperandType is NONE.
 */
export class Operand extends Scope {
  static logger: Logger = null;
  /**
   * The type of object the operand really represents.
   */
  operandType: Operand$OperandType = null;
  /**
   * How broadly to apply the operand.
   */
  scopeLevel: Operand$ScopeLevel = null;
  /**
   * The operand amount.
   */
  value_: number = null;
  static readonly OPERAND_TYPE_TAG: string = 'operand-type';
  static readonly SCOPE_LEVEL_TAG: string = 'scope-level';
  static readonly OLD_OPERAND_TYPE_TAG: string = 'operandType';
  static readonly OLD_SCOPE_LEVEL_TAG: string = 'scopeLevel';
  $init_Operand() {
    this.operandType = Operand$OperandType.NONE;
    this.scopeLevel = Operand$ScopeLevel.NONE;
    this.value_ = null;
  }
  /**
   * Deliberately empty constructor.
   */
  _Operand$(): this {
    this._Scope$();
    this.$init_Operand();
    return this;
  }
  /**
   * Creates a new {@code Operand} instance.
   *
   * @param value The initial operand value.
   */
  _Operand$int(value: number): this {
    this._Scope$();
    this.$init_Operand();
    this.value_ = value;
    return this;
  }
  /**
   * Creates a new {@code Operand} instance.
   *
   * @param operandType The {@code OperandType} to use.
   * @param scopeLevel The {@code ScopeLevel} to use.
   */
  _Operand$OperandType$ScopeLevel(operandType: Operand$OperandType, scopeLevel: Operand$ScopeLevel): this {
    this._Scope$();
    this.$init_Operand();
    this.operandType = operandType;
    this.scopeLevel = scopeLevel;
    return this;
  }
  /**
   * Create a new operand by reading a stream.
   *
   * @param xr The {@code FreeColXMLReader} to read.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  _Operand$FreeColXMLReader(xr: FreeColXMLReader): this {
    this._Scope$();
    this.$init_Operand();
    this.readFromXML(xr);
    return this;
  }
  /**
   * Gets the operand type.
   *
   * @return The {@code OperandType}.
   */
  getOperandType(): Operand$OperandType {
    return this.operandType;
  }
  /**
   * Set the operand type.
   *
   * @param newOperandType The new {@code OperandType}.
   */
  setOperandType(newOperandType: Operand$OperandType): void {
    this.operandType = newOperandType;
  }
  /**
   * Gets the scope level.
   *
   * @return The scope level.
   */
  getScopeLevel(): Operand$ScopeLevel {
    return this.scopeLevel;
  }
  /**
   * Sets the scope level.
   *
   * @param newScopeLevel The new {@code ScopeLevel}.
   */
  setScopeLevel(newScopeLevel: Operand$ScopeLevel): void {
    this.scopeLevel = newScopeLevel;
  }
  /**
   * Gets the operand value.
   *
   * @return The operand value.
   */
  getValue$(): number {
    return this.value_;
  }
  /**
   * Sets the operand value.
   *
   * @param newValue The new value.
   */
  setValue(newValue: number): void {
    this.value_ = newValue;
  }
  /**
   * Count the number of objects in a list that this operand is
   * applicable to.
   *
   * @param objects The list of objects to check.
   * @return The number of applicable objects.
   */
  ourCount(objects: Collection<FreeColObject>): number {
    return CollectionUtils.count$Collection$Predicate(objects, (o) => this.appliesTo(o));
  }
  /**
   * Gets the operand value if it is applicable to the given Game.
   *
   * @param game The {@code Game} to check.
   * @return The operand value or null if inapplicable.
   */
  getValue$Game(game: Game): number {
    if (this.value_ != null) {
      return this.value_;
    }
    if (this.scopeLevel !== Operand$ScopeLevel.GAME) {
      return null;
    }
    let methodName = this.getMethodName();
    let result = 0;
    switch (this.operandType) {
      case Operand$OperandType.NONE:
        result = game.invokeMethod(methodName, $J.cls(Integer), 0);
        break;
      case Operand$OperandType.YEAR:
        result = game.getTurn().getYear();
        break;
      case Operand$OperandType.OPTION:
        result = game.getSpecification().getInteger(this.getType());
        break;
      default:
        for (const $it0 = game.getLivePlayerList([]).iterator(); $it0.hasNext(); ) {
          let player = $it0.next();
          switch (this.operandType) {
            case Operand$OperandType.UNITS:
              result = (result + this.ourCount(player.getUnitSet())) | 0;
              break;
            case Operand$OperandType.BUILDINGS:
              result = (result + (CollectionUtils.sum$Stream$ToIntFunction(player.getColonies(), (c) => this.ourCount(c.getBuildings())))) | 0;
              break;
            case Operand$OperandType.SETTLEMENTS:
              result = (result + this.ourCount(player.getSettlementList())) | 0;
              break;
            case Operand$OperandType.FOUNDING_FATHERS:
              result = (result + this.ourCount(player.getFoundingFathers())) | 0;
              break;
            default:
              return null;
          }
        }
    }
    return result;
  }
  /**
   * Gets the operand value if it is applicable to the given Player.
   *
   * @param player The {@code Player} to check.
   * @return The operand value, or null if inapplicable.
   */
  getValue$Player(player: Player): number {
    if (this.value_ != null) {
      return this.value_;
    }
    switch (this.scopeLevel) {
      case Operand$ScopeLevel.GAME:
        return this.getValue$Game(player.getGame());
      case Operand$ScopeLevel.PLAYER:
        break;
      default:
        return null;
    }
    let spec = player.getSpecification();
    let methodName = this.getMethodName();
    {
      let methodValue: string;
      switch (this.operandType) {
        case Operand$OperandType.UNITS:
          return this.ourCount(player.getUnitSet());
        case Operand$OperandType.BUILDINGS:
          return CollectionUtils.sum$Stream$ToIntFunction(player.getColonies(), (c) => this.ourCount(c.getBuildings()));
        case Operand$OperandType.SETTLEMENTS:
          if (methodName == null) {
            return (this.ourCount(player.getSettlementList()) + spec.getInteger(GameOptions.SETTLEMENT_LIMIT_MODIFIER)) | 0;
          }
          methodValue = this.getMethodValue();
          return CollectionUtils.count$Collection$Predicate(player.getSettlementList(), (s) => $J.equals($J.str(s.invokeMethod(methodName, $J.cls(JBoolean), false)), methodValue));
        case Operand$OperandType.FOUNDING_FATHERS:
          return this.ourCount(player.getFoundingFathers());
        default:
          break;
      }
    }
    return player.invokeMethod(methodName, $J.cls(Integer), null);
  }
  /**
   * Gets the operand value if it is applicable to the given Settlement.
   *
   * @param settlement The {@code Settlement} to check.
   * @return The operand value, or null if inapplicable.
   */
  getValue$Settlement(settlement: Settlement): number {
    if (this.value_ != null) {
      return this.value_;
    }
    if (this.scopeLevel !== Operand$ScopeLevel.SETTLEMENT || !(settlement instanceof Colony)) {
      return null;
    }
    let colony = settlement;
    switch (this.operandType) {
      case Operand$OperandType.UNITS:
        return this.ourCount(colony.getUnitList());
      case Operand$OperandType.BUILDINGS:
        return this.ourCount(colony.getBuildings());
      default:
        break;
    }
    return colony.invokeMethod(this.getMethodName(), $J.cls(Integer), null);
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(Operand));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.operandType = o.getOperandType();
    this.scopeLevel = o.getScopeLevel();
    this.value_ = o.getValue$();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$Enum(Operand.OPERAND_TYPE_TAG, this.operandType);
    xw.writeAttribute$String$Enum(Operand.SCOPE_LEVEL_TAG, this.scopeLevel);
    if (this.value_ != null) {
      xw.writeAttribute$String$Object(FreeColObject.VALUE_TAG, this.value_);
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    if (xr.hasAttribute(Operand.OLD_OPERAND_TYPE_TAG)) {
      this.operandType = xr.getAttribute$String$Class$Enum(Operand.OLD_OPERAND_TYPE_TAG, $J.cls(Operand$OperandType), Operand$OperandType.NONE);
    } else {
      this.operandType = xr.getAttribute$String$Class$Enum(Operand.OPERAND_TYPE_TAG, $J.cls(Operand$OperandType), Operand$OperandType.NONE);
    }
    if (xr.hasAttribute(Operand.OLD_SCOPE_LEVEL_TAG)) {
      this.scopeLevel = xr.getAttribute$String$Class$Enum(Operand.OLD_SCOPE_LEVEL_TAG, $J.cls(Operand$ScopeLevel), Operand$ScopeLevel.NONE);
    } else {
      this.scopeLevel = xr.getAttribute$String$Class$Enum(Operand.SCOPE_LEVEL_TAG, $J.cls(Operand$ScopeLevel), Operand$ScopeLevel.NONE);
    }
    let val = xr.getAttribute$String$int(FreeColObject.VALUE_TAG, Constants.INFINITY);
    if (val !== Constants.INFINITY) {
      this.value_ = val;
    }
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (this === o) {
      return true;
    }
    if (o instanceof Operand) {
      let other = o;
      return this.operandType === other.operandType && this.scopeLevel === other.scopeLevel && Utils.equals(this.value_, other.value_) && super.equals(other);
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    hash = (Math.imul(31, hash) + this.operandType.ordinal()) | 0;
    hash = (Math.imul(31, hash) + this.scopeLevel.ordinal()) | 0;
    hash = (Math.imul(31, hash) + this.value_) | 0;
    return hash;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    if (this.value_ != null) {
      return String(this.value_);
    }
    let sb = new StringBuilder();
    sb.append('[Operand type=').append($J.str(this.operandType)).append(' scopeLevel=').append($J.str(this.scopeLevel));
    return JString.replaceFirst(super.toString(), '^[^ ]*', sb.toString());
  }
  static $clinit() {
    Operand.logger = Logger.getLogger($J.cls(Operand).getName());
  }
}

export class Operand$OperandType extends JEnum {
  static UNITS: Operand$OperandType = null;
  static BUILDINGS: Operand$OperandType = null;
  static SETTLEMENTS: Operand$OperandType = null;
  static FOUNDING_FATHERS: Operand$OperandType = null;
  static YEAR: Operand$OperandType = null;
  static OPTION: Operand$OperandType = null;
  static NONE: Operand$OperandType = null;
  static $VALUES: Operand$OperandType[] = null;
  _Operand$OperandType($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Operand$OperandType[] { return Operand$OperandType.$VALUES.slice(); }
  static valueOf(name: string): Operand$OperandType { return $J.enumValueOf(Operand$OperandType, name); }
  static $clinit() {
    Operand$OperandType.UNITS = new Operand$OperandType()._Operand$OperandType('UNITS', 0);
    Operand$OperandType.BUILDINGS = new Operand$OperandType()._Operand$OperandType('BUILDINGS', 1);
    Operand$OperandType.SETTLEMENTS = new Operand$OperandType()._Operand$OperandType('SETTLEMENTS', 2);
    Operand$OperandType.FOUNDING_FATHERS = new Operand$OperandType()._Operand$OperandType('FOUNDING_FATHERS', 3);
    Operand$OperandType.YEAR = new Operand$OperandType()._Operand$OperandType('YEAR', 4);
    Operand$OperandType.OPTION = new Operand$OperandType()._Operand$OperandType('OPTION', 5);
    Operand$OperandType.NONE = new Operand$OperandType()._Operand$OperandType('NONE', 6);
    Operand$OperandType.$VALUES = [Operand$OperandType.UNITS, Operand$OperandType.BUILDINGS, Operand$OperandType.SETTLEMENTS, Operand$OperandType.FOUNDING_FATHERS, Operand$OperandType.YEAR, Operand$OperandType.OPTION, Operand$OperandType.NONE];
  }
}

export class Operand$ScopeLevel extends JEnum {
  static SETTLEMENT: Operand$ScopeLevel = null;
  static PLAYER: Operand$ScopeLevel = null;
  static GAME: Operand$ScopeLevel = null;
  static NONE: Operand$ScopeLevel = null;
  static $VALUES: Operand$ScopeLevel[] = null;
  _Operand$ScopeLevel($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Operand$ScopeLevel[] { return Operand$ScopeLevel.$VALUES.slice(); }
  static valueOf(name: string): Operand$ScopeLevel { return $J.enumValueOf(Operand$ScopeLevel, name); }
  static $clinit() {
    Operand$ScopeLevel.SETTLEMENT = new Operand$ScopeLevel()._Operand$ScopeLevel('SETTLEMENT', 0);
    Operand$ScopeLevel.PLAYER = new Operand$ScopeLevel()._Operand$ScopeLevel('PLAYER', 1);
    Operand$ScopeLevel.GAME = new Operand$ScopeLevel()._Operand$ScopeLevel('GAME', 2);
    Operand$ScopeLevel.NONE = new Operand$ScopeLevel()._Operand$ScopeLevel('NONE', 3);
    Operand$ScopeLevel.$VALUES = [Operand$ScopeLevel.SETTLEMENT, Operand$ScopeLevel.PLAYER, Operand$ScopeLevel.GAME, Operand$ScopeLevel.NONE];
  }
}

$J.define(Operand, 'net.sf.freecol.common.model.Operand', { kind: 'class', sup: 'net.sf.freecol.common.model.Scope', ctors: { 'net.sf.freecol.common.io.FreeColXMLReader': '_Operand$FreeColXMLReader', 'net.sf.freecol.common.model.Operand$OperandType,net.sf.freecol.common.model.Operand$ScopeLevel': '_Operand$OperandType$ScopeLevel', 'int': '_Operand$int', '': '_Operand$' }, returns: { 'hashCode': 'int', 'getValue$': 'java.lang.Integer', 'getScopeLevel': 'net.sf.freecol.common.model.Operand$ScopeLevel', 'getOperandType': 'net.sf.freecol.common.model.Operand$OperandType' }, meths: { 'getValue(net.sf.freecol.common.model.Settlement)': 'getValue$Settlement', 'getValue(net.sf.freecol.common.model.Player)': 'getValue$Player', 'getValue(net.sf.freecol.common.model.Game)': 'getValue$Game', 'getValue()': 'getValue$' }, clinit: true, lazy: ['logger'] });
$J.define(Operand$OperandType, 'net.sf.freecol.common.model.Operand$OperandType', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Operand$OperandType' }, clinit: true, lazy: ['$VALUES', 'UNITS', 'BUILDINGS', 'SETTLEMENTS', 'FOUNDING_FATHERS', 'YEAR', 'OPTION', 'NONE'] });
$J.define(Operand$ScopeLevel, 'net.sf.freecol.common.model.Operand$ScopeLevel', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Operand$ScopeLevel' }, clinit: true, lazy: ['$VALUES', 'SETTLEMENT', 'PLAYER', 'GAME', 'NONE'] });
$J.module(() => {
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  Constants = $J.load('net.sf.freecol.common.model.Constants');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  GameOptions = $J.load('net.sf.freecol.common.option.GameOptions');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
