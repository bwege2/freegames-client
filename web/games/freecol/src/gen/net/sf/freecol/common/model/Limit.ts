// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/Limit.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JEnum, StringBuilder } from '../../../../../../jre/index.ts';
import { FreeColSpecObjectType } from './FreeColSpecObjectType.ts';

let Operand, Operand$ScopeLevel;

/**
 * The {@code Limit} class encapsulates a limit on the
 * availability of FreeColObjects.  It consists of a left hand side,
 * an operator and a right hand side, and can be used to limit the
 * number of units of a particular type (e.g. wagon trains) to the
 * number of a player's colonies, for example. The left hand side must
 * apply to the object on which a limit is to be placed.
 */
export class Limit extends FreeColSpecObjectType {
  static readonly TAG: string = 'limit';
  /**
   * The operator to apply when evaluating the limit expression.
   */
  operator_: Limit$Operator = null;
  /**
   * The left hand side term of the limit expression.
   */
  leftHandSide: Operand = null;
  /**
   * The right hand side term of the limit expression.
   */
  rightHandSide: Operand = null;
  static readonly LEFT_HAND_SIDE_TAG: string = 'left-hand-side';
  static readonly OPERATOR_TAG: string = 'operator';
  static readonly RIGHT_HAND_SIDE_TAG: string = 'right-hand-side';
  static readonly OLD_LEFT_HAND_SIDE_TAG: string = 'leftHandSide';
  static readonly OLD_RIGHT_HAND_SIDE_TAG: string = 'rightHandSide';
  /**
   * Create a new limit.
   *
   * @param specification The {@code Specification} to refer to.
   */
  _Limit$Specification(specification: Specification): this {
    this._FreeColSpecObjectType$Specification(specification);
    return this;
  }
  /**
   * Create a new limit.
   *
   * @param xr The {@code FreeColXMLReader} to read from.
   * @param specification The {@code Specification} to refer to.
   * @exception XMLStreamException if there is a problem reading.
   */
  _Limit$FreeColXMLReader$Specification(xr: FreeColXMLReader, specification: Specification): this {
    this._FreeColSpecObjectType$Specification(specification);
    this.readFromXML(xr);
    return this;
  }
  /**
   * Create a new limit.
   *
   * @param id The object identifier.
   * @param lhs The left hand side {@code Operand}.
   * @param op The {@code Operator} to apply.
   * @param rhs The right hand side {@code Operand}.
   */
  _Limit$String$Operand$Operator$Operand(id: string, lhs: Operand, op: Limit$Operator, rhs: Operand): this {
    this._FreeColSpecObjectType$();
    this.setId(id);
    this.leftHandSide = lhs;
    this.rightHandSide = rhs;
    this.operator_ = op;
    return this;
  }
  /**
   * Get the {@code Operator} value.
   *
   * @return The {@code Operator} of this limit.
   */
  getOperator(): Limit$Operator {
    return this.operator_;
  }
  setOperator(newOperator: Limit$Operator): void {
    this.operator_ = newOperator;
  }
  /**
   * Get the left hand side {@code Operand}.
   *
   * @return The left hand side {@code Operand}.
   */
  getLeftHandSide(): Operand {
    return this.leftHandSide;
  }
  /**
   * Set the left hand side {@code Operand}.
   *
   * @param newLeftHandSide The new left hand side {@code Operand}.
   */
  setLeftHandSide(newLeftHandSide: Operand): void {
    this.leftHandSide = newLeftHandSide;
  }
  /**
   * Get the right hand side {@code Operand}.
   *
   * @return The right hand side {@code Operand}.
   */
  getRightHandSide(): Operand {
    return this.rightHandSide;
  }
  /**
   * Set the right hand side {@code Operand}.
   *
   * @param newRightHandSide The new right hand side {@code Operand}.
   */
  setRightHandSide(newRightHandSide: Operand): void {
    this.rightHandSide = newRightHandSide;
  }
  /**
   * Does this limit apply to an object?
   *
   * @param object The object to test.
   * @return True if the limit is applicable.
   */
  appliesTo(object$: FreeColObject): boolean {
    return this.leftHandSide.appliesTo(object$);
  }
  /**
   * Evaluate this limit within a game.
   *
   * @param game The {@code Game} to use.
   * @return The result of the evaluation.
   */
  evaluate$Game(game: Game): boolean {
    let lhs = null;
    switch (this.leftHandSide.getScopeLevel()) {
      case Operand$ScopeLevel.GAME:
        lhs = this.leftHandSide.getValue$Game(game);
        break;
      default:
        lhs = this.leftHandSide.getValue$();
        break;
    }
    let rhs = null;
    switch (this.rightHandSide.getScopeLevel()) {
      case Operand$ScopeLevel.GAME:
        rhs = this.rightHandSide.getValue$Game(game);
        break;
      default:
        rhs = this.rightHandSide.getValue$();
        break;
    }
    return this.evaluate$Integer$Integer$Limit(lhs, rhs);
  }
  /**
   * Evaluate this limit with respect to a player.
   *
   * @param player The {@code Player} to use.
   * @return The result of the evaluation.
   */
  evaluate$Player(player: Player): boolean {
    let lhs = null;
    switch (this.leftHandSide.getScopeLevel()) {
      case Operand$ScopeLevel.PLAYER:
        lhs = this.leftHandSide.getValue$Player(player);
        break;
      case Operand$ScopeLevel.GAME:
        lhs = this.leftHandSide.getValue$Game(player.getGame());
        break;
      default:
        lhs = this.leftHandSide.getValue$();
        break;
    }
    let rhs = null;
    switch (this.rightHandSide.getScopeLevel()) {
      case Operand$ScopeLevel.PLAYER:
        rhs = this.rightHandSide.getValue$Player(player);
        break;
      case Operand$ScopeLevel.GAME:
        rhs = this.rightHandSide.getValue$Game(player.getGame());
        break;
      default:
        rhs = this.rightHandSide.getValue$();
        break;
    }
    return this.evaluate$Integer$Integer$Limit(lhs, rhs);
  }
  /**
   * Evaluate this limit with respect to a player.
   *
   * @param settlement The {@code Settlement} to use.
   * @return The result of the evaluation.
   */
  evaluate$Settlement(settlement: Settlement): boolean {
    let lhs = null;
    switch (this.leftHandSide.getScopeLevel()) {
      case Operand$ScopeLevel.SETTLEMENT:
        lhs = this.leftHandSide.getValue$Settlement(settlement);
        break;
      case Operand$ScopeLevel.PLAYER:
        lhs = this.leftHandSide.getValue$Player(settlement.getOwner());
        break;
      case Operand$ScopeLevel.GAME:
        lhs = this.leftHandSide.getValue$Game(settlement.getGame());
        break;
      default:
        lhs = this.leftHandSide.getValue$();
        break;
    }
    let rhs = null;
    switch (this.rightHandSide.getScopeLevel()) {
      case Operand$ScopeLevel.SETTLEMENT:
        rhs = this.rightHandSide.getValue$Settlement(settlement);
        break;
      case Operand$ScopeLevel.PLAYER:
        rhs = this.rightHandSide.getValue$Player(settlement.getOwner());
        break;
      case Operand$ScopeLevel.GAME:
        rhs = this.rightHandSide.getValue$Game(settlement.getGame());
        break;
      default:
        rhs = this.rightHandSide.getValue$();
        break;
    }
    return this.evaluate$Integer$Integer$Limit(lhs, rhs);
  }
  /**
   * Check if at least one of the Operands has a given OperandType.
   *
   * @param type The {@code OperandType} to check for.
   * @return True if the type is present.
   */
  hasOperandType(type$: Operand$OperandType): boolean {
    return this.leftHandSide.getOperandType() === type$ || this.rightHandSide.getOperandType() === type$;
  }
  /**
   * Evaluate two integers using the limit operator.
   *
   * @param lhs The left hand side {@code Integer}.
   * @param rhs The right hand side {@code Integer}.
   * @return The result of the evaluation.
   */
  evaluate$Integer$Integer$Limit(lhs: number, rhs: number): boolean {
    if (lhs == null || rhs == null) {
      return true;
    }
    let cmp = $J.compareTo(lhs, rhs);
    switch (this.operator_) {
      case Limit$Operator.EQ:
        return cmp === 0;
      case Limit$Operator.LT:
        return cmp < 0;
      case Limit$Operator.GT:
        return cmp > 0;
      case Limit$Operator.LE:
        return cmp <= 0;
      case Limit$Operator.GE:
        return cmp >= 0;
      default:
        break;
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(Limit));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.operator_ = o.getOperator();
    this.leftHandSide = o.getLeftHandSide();
    this.rightHandSide = o.getRightHandSide();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$Enum(Limit.OPERATOR_TAG, this.operator_);
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    this.leftHandSide.toXML$FreeColXMLWriter$String(xw, Limit.LEFT_HAND_SIDE_TAG);
    this.rightHandSide.toXML$FreeColXMLWriter$String(xw, Limit.RIGHT_HAND_SIDE_TAG);
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.operator_ = xr.getAttribute$String$Class$Enum(Limit.OPERATOR_TAG, $J.cls(Limit$Operator), null);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let tag = xr.getLocalName();
    if ($J.equals(Limit.LEFT_HAND_SIDE_TAG, tag) || $J.equals(Limit.OLD_LEFT_HAND_SIDE_TAG, tag)) {
      this.leftHandSide = new Operand()._Operand$FreeColXMLReader(xr);
    } else if ($J.equals(Limit.RIGHT_HAND_SIDE_TAG, tag) || $J.equals(Limit.OLD_RIGHT_HAND_SIDE_TAG, tag)) {
      this.rightHandSide = new Operand()._Operand$FreeColXMLReader(xr);
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return Limit.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(64);
    sb.append($J.str(this.leftHandSide)).append(String.fromCharCode(32 /* ' ' */)).append($J.str(this.operator_)).append(String.fromCharCode(32 /* ' ' */)).append($J.str(this.rightHandSide));
    return sb.toString();
  }
}

/**
 * The basic operation used in evaluating this limit.
 */
export class Limit$Operator extends JEnum {
  static EQ: Limit$Operator = null;
  static LT: Limit$Operator = null;
  static GT: Limit$Operator = null;
  static LE: Limit$Operator = null;
  static GE: Limit$Operator = null;
  static $VALUES: Limit$Operator[] = null;
  _Limit$Operator($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Limit$Operator[] { return Limit$Operator.$VALUES.slice(); }
  static valueOf(name: string): Limit$Operator { return $J.enumValueOf(Limit$Operator, name); }
  static $clinit() {
    Limit$Operator.EQ = new Limit$Operator()._Limit$Operator('EQ', 0);
    Limit$Operator.LT = new Limit$Operator()._Limit$Operator('LT', 1);
    Limit$Operator.GT = new Limit$Operator()._Limit$Operator('GT', 2);
    Limit$Operator.LE = new Limit$Operator()._Limit$Operator('LE', 3);
    Limit$Operator.GE = new Limit$Operator()._Limit$Operator('GE', 4);
    Limit$Operator.$VALUES = [Limit$Operator.EQ, Limit$Operator.LT, Limit$Operator.GT, Limit$Operator.LE, Limit$Operator.GE];
  }
}

$J.define(Limit, 'net.sf.freecol.common.model.Limit', { kind: 'class', sup: 'net.sf.freecol.common.model.FreeColSpecObjectType', ctors: { 'java.lang.String,net.sf.freecol.common.model.Operand,net.sf.freecol.common.model.Limit$Operator,net.sf.freecol.common.model.Operand': '_Limit$String$Operand$Operator$Operand', 'net.sf.freecol.common.io.FreeColXMLReader,net.sf.freecol.common.model.Specification': '_Limit$FreeColXMLReader$Specification', 'net.sf.freecol.common.model.Specification': '_Limit$Specification' }, returns: { 'getXMLTagName': 'java.lang.String', 'getRightHandSide': 'net.sf.freecol.common.model.Operand', 'getLeftHandSide': 'net.sf.freecol.common.model.Operand', 'getOperator': 'net.sf.freecol.common.model.Limit$Operator' }, meths: { 'evaluate(java.lang.Integer,java.lang.Integer)': 'evaluate$Integer$Integer$Limit', 'evaluate(net.sf.freecol.common.model.Settlement)': 'evaluate$Settlement', 'evaluate(net.sf.freecol.common.model.Player)': 'evaluate$Player', 'evaluate(net.sf.freecol.common.model.Game)': 'evaluate$Game' } });
$J.define(Limit$Operator, 'net.sf.freecol.common.model.Limit$Operator', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Limit$Operator' }, clinit: true, lazy: ['$VALUES', 'EQ', 'LT', 'GT', 'LE', 'GE'] });
$J.module(() => {
  Operand = $J.load('net.sf.freecol.common.model.Operand');
  Operand$ScopeLevel = $J.load('net.sf.freecol.common.model.Operand$ScopeLevel');
});
