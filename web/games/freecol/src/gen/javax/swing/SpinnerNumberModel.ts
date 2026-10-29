// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/SpinnerNumberModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2000, 2021, Oracle and/or its affiliates. All rights reserved.
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * This code is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License version 2 only, as
 * published by the Free Software Foundation.  Oracle designates this
 * particular file as subject to the "Classpath" exception as provided
 * by Oracle in the LICENSE file that accompanied this code.
 *
 * This code is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * version 2 for more details (a copy is included in the LICENSE file that
 * accompanied this code).
 *
 * You should have received a copy of the GNU General Public License version
 * 2 along with this work; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * Please contact Oracle, 500 Oracle Parkway, Redwood Shores, CA 94065 USA
 * or visit www.oracle.com if you need additional information or have any
 * questions.
 */
import { $J, Double, Float, IllegalArgumentException, Integer, JNumber, Long, Short } from '../../../jre/index.ts';
import { AbstractSpinnerModel } from './AbstractSpinnerModel.ts';

/**
 * A <code>SpinnerModel</code> for sequences of numbers.
 * The upper and lower bounds of the sequence are defined
 * by properties called <code>minimum</code> and
 * <code>maximum</code>. The size of the increase or decrease
 * computed by the <code>nextValue</code> and
 * <code>previousValue</code> methods is defined by a property called
 * <code>stepSize</code>.  The <code>minimum</code> and
 * <code>maximum</code> properties can be <code>null</code>
 * to indicate that the sequence has no lower or upper limit.
 * All of the properties in this class are defined in terms of two
 * generic types: <code>Number</code> and
 * <code>Comparable</code>, so that all Java numeric types
 * may be accommodated.  Internally, there's only support for
 * values whose type is one of the primitive <code>Number</code> types:
 * <code>Double</code>, <code>Float</code>, <code>Long</code>,
 * <code>Integer</code>, <code>Short</code>, or <code>Byte</code>.
 * <p>
 * To create a <code>SpinnerNumberModel</code> for the integer
 * range zero to one hundred, with
 * fifty as the initial value, one could write:
 * <pre>
 * Integer value = Integer.valueOf(50);
 * Integer min = Integer.valueOf(0);
 * Integer max = Integer.valueOf(100);
 * Integer step = Integer.valueOf(1);
 * SpinnerNumberModel model = new SpinnerNumberModel(value, min, max, step);
 * int fifty = model.getNumber().intValue();
 * </pre>
 * <p>
 * Spinners for integers and doubles are common, so special constructors
 * for these cases are provided.  For example to create the model in
 * the previous example, one could also write:
 * <pre>
 * SpinnerNumberModel model = new SpinnerNumberModel(50, 0, 100, 1);
 * </pre>
 * <p>
 * This model inherits a <code>ChangeListener</code>.
 * The <code>ChangeListeners</code> are notified
 * whenever the model's <code>value</code>, <code>stepSize</code>,
 * <code>minimum</code>, or <code>maximum</code> properties changes.
 *
 * @see JSpinner
 * @see SpinnerModel
 * @see AbstractSpinnerModel
 * @see SpinnerListModel
 * @see SpinnerDateModel
 *
 * @author Hans Muller
 * @since 1.4
 */
export class SpinnerNumberModel extends AbstractSpinnerModel {
  stepSize: number = null;
  value_: number = null;
  minimum: Comparable<any> = null;
  maximum: Comparable<any> = null;
  /**
   * Constructs a <code>SpinnerModel</code> that represents
   * a closed sequence of
   * numbers from <code>minimum</code> to <code>maximum</code>.  The
   * <code>nextValue</code> and <code>previousValue</code> methods
   * compute elements of the sequence by adding or subtracting
   * <code>stepSize</code> respectively.  All of the parameters
   * must be mutually <code>Comparable</code>, <code>value</code>
   * and <code>stepSize</code> must be instances of <code>Integer</code>
   * <code>Long</code>, <code>Float</code>, or <code>Double</code>.
   * <p>
   * The <code>minimum</code> and <code>maximum</code> parameters
   * can be <code>null</code> to indicate that the range doesn't
   * have an upper or lower bound.
   * If <code>value</code> or <code>stepSize</code> is <code>null</code>,
   * or if both <code>minimum</code> and <code>maximum</code>
   * are specified and <code>minimum &gt; maximum</code> then an
   * <code>IllegalArgumentException</code> is thrown.
   * Similarly if <code>(minimum &lt;= value &lt;= maximum</code>) is false,
   * an <code>IllegalArgumentException</code> is thrown.
   *
   * @param value the current (non <code>null</code>) value of the model
   * @param minimum the first number in the sequence or <code>null</code>
   * @param maximum the last number in the sequence or <code>null</code>
   * @param stepSize the difference between elements of the sequence
   *
   * @throws IllegalArgumentException if stepSize or value is
   *     <code>null</code> or if the following expression is false:
   *     <code>minimum &lt;= value &lt;= maximum</code>
   */
  _SpinnerNumberModel$Number$Comparable$Comparable$Number(value: number, minimum: Comparable<any>, maximum: Comparable<any>, stepSize: number): this {
    this._AbstractSpinnerModel();
    if ((value == null) || (stepSize == null)) {
      throw new IllegalArgumentException('value and stepSize must be non-null');
    }
    if (!(((minimum == null) || ($J.compareTo((minimum), value) <= 0)) && ((maximum == null) || ($J.compareTo((maximum), value) >= 0)))) {
      throw new IllegalArgumentException('(minimum <= value <= maximum) is false');
    }
    this.value_ = value;
    this.minimum = minimum;
    this.maximum = maximum;
    this.stepSize = stepSize;
    return this;
  }
  /**
   * Constructs a <code>SpinnerNumberModel</code> with the specified
   * <code>value</code>, <code>minimum</code>/<code>maximum</code> bounds,
   * and <code>stepSize</code>.
   *
   * @param value the current value of the model
   * @param minimum the first number in the sequence
   * @param maximum the last number in the sequence
   * @param stepSize the difference between elements of the sequence
   * @throws IllegalArgumentException if the following expression is false:
   *     <code>minimum &lt;= value &lt;= maximum</code>
   */
  _SpinnerNumberModel$int$int$int$int(value: number, minimum: number, maximum: number, stepSize: number): this {
    this._SpinnerNumberModel$Number$Comparable$Comparable$Number(value, minimum, maximum, stepSize);
    return this;
  }
  /**
   * Constructs a <code>SpinnerNumberModel</code> with no
   * <code>minimum</code> or <code>maximum</code> value,
   * <code>stepSize</code> equal to one, and an initial value of zero.
   */
  _SpinnerNumberModel$(): this {
    this._SpinnerNumberModel$Number$Comparable$Comparable$Number(0, null, null, 1);
    return this;
  }
  /**
   * Changes the lower bound for numbers in this sequence.
   * If <code>minimum</code> is <code>null</code>,
   * then there is no lower bound.  No bounds checking is done here;
   * the new <code>minimum</code> value may invalidate the
   * <code>(minimum &lt;= value &lt;= maximum)</code>
   * invariant enforced by the constructors.  This is to simplify updating
   * the model, naturally one should ensure that the invariant is true
   * before calling the <code>getNextValue</code>,
   * <code>getPreviousValue</code>, or <code>setValue</code> methods.
   * <p>
   * Typically this property is a <code>Number</code> of the same type
   * as the <code>value</code> however it's possible to use any
   * <code>Comparable</code> with a <code>compareTo</code>
   * method for a <code>Number</code> with the same type as the value.
   * For example if value was a <code>Long</code>,
   * <code>minimum</code> might be a Date subclass defined like this:
   * <pre>
   * MyDate extends Date {  // Date already implements Comparable
   *     public int compareTo(Long o) {
   *         long t = getTime();
   *         return (t &lt; o.longValue() ? -1 : (t == o.longValue() ? 0 : 1));
   *     }
   * }
   * </pre>
   * <p>
   * This method fires a <code>ChangeEvent</code>
   * if the <code>minimum</code> has changed.
   *
   * @param minimum a <code>Comparable</code> that has a
   *     <code>compareTo</code> method for <code>Number</code>s with
   *     the same type as <code>value</code>
   * @see #getMinimum
   * @see #setMaximum
   * @see SpinnerModel#addChangeListener
   */
  setMinimum(minimum: Comparable<any>): void {
    if ((minimum == null) ? (this.minimum != null) : !$J.equals(minimum, this.minimum)) {
      this.minimum = minimum;
      this.fireStateChanged();
    }
  }
  /**
   * Returns the first number in this sequence.
   *
   * @return the value of the <code>minimum</code> property
   * @see #setMinimum
   */
  getMinimum(): Comparable<any> {
    return this.minimum;
  }
  /**
   * Changes the upper bound for numbers in this sequence.
   * If <code>maximum</code> is <code>null</code>, then there
   * is no upper bound.  No bounds checking is done here; the new
   * <code>maximum</code> value may invalidate the
   * <code>(minimum &lt;= value &lt; maximum)</code>
   * invariant enforced by the constructors.  This is to simplify updating
   * the model, naturally one should ensure that the invariant is true
   * before calling the <code>next</code>, <code>previous</code>,
   * or <code>setValue</code> methods.
   * <p>
   * Typically this property is a <code>Number</code> of the same type
   * as the <code>value</code> however it's possible to use any
   * <code>Comparable</code> with a <code>compareTo</code>
   * method for a <code>Number</code> with the same type as the value.
   * See {@link #setMinimum(Comparable)} for an example.
   * <p>
   * This method fires a <code>ChangeEvent</code> if the
   * <code>maximum</code> has changed.
   *
   * @param maximum a <code>Comparable</code> that has a
   *     <code>compareTo</code> method for <code>Number</code>s with
   *     the same type as <code>value</code>
   * @see #getMaximum
   * @see #setMinimum
   * @see SpinnerModel#addChangeListener
   */
  setMaximum(maximum: Comparable<any>): void {
    if ((maximum == null) ? (this.maximum != null) : !$J.equals(maximum, this.maximum)) {
      this.maximum = maximum;
      this.fireStateChanged();
    }
  }
  /**
   * Returns the last number in the sequence.
   *
   * @return the value of the <code>maximum</code> property
   * @see #setMaximum
   */
  getMaximum(): Comparable<any> {
    return this.maximum;
  }
  incrValue(dir: number): number {
    let newValue: number;
    if (($J.isa(this.value_, Float)) || ($J.isa(this.value_, Double))) {
      let v = (+this.value_) + ((+this.stepSize) * dir);
      if ($J.isa(this.value_, Double)) {
        newValue = $J.boxD($J.boxD(v));
      } else {
        newValue = $J.boxF($J.boxF(Math.fround(v)));
      }
    } else {
      let v = $J.d2i(+this.value_) + ($J.d2i(+this.stepSize) * dir);
      if ($J.isa(this.value_, Long)) {
        newValue = v;
      } else if ($J.isa(this.value_, Integer)) {
        newValue = (v) | 0;
      } else if ($J.isa(this.value_, Short)) {
        newValue = ((v) << 16) >> 16;
      } else {
        newValue = ((v) << 24) >> 24;
      }
    }
    if ((this.maximum != null) && ($J.compareTo((this.maximum), newValue) < 0)) {
      return null;
    }
    if ((this.minimum != null) && ($J.compareTo((this.minimum), newValue) > 0)) {
      return null;
    } else {
      return newValue;
    }
  }
  /**
   * Returns the next number in the sequence.
   *
   * @return <code>value + stepSize</code> or <code>null</code> if the sum
   *     exceeds <code>maximum</code>.
   *
   * @see SpinnerModel#getNextValue
   * @see #getPreviousValue
   * @see #setStepSize
   */
  getNextValue(): any {
    return this.incrValue(+1);
  }
  /**
   * Returns the previous number in the sequence.
   *
   * @return <code>value - stepSize</code>, or
   *     <code>null</code> if the sum is less
   *     than <code>minimum</code>.
   *
   * @see SpinnerModel#getPreviousValue
   * @see #getNextValue
   * @see #setStepSize
   */
  getPreviousValue(): any {
    return this.incrValue(-1);
  }
  /**
   * Returns the value of the current element of the sequence.
   *
   * @return the value property
   * @see #setValue
   */
  getNumber(): number {
    return this.value_;
  }
  /**
   * Returns the value of the current element of the sequence.
   *
   * @return the value property
   * @see #setValue
   * @see #getNumber
   */
  getValue(): any {
    return this.value_;
  }
  /**
   * Sets the current value for this sequence.  If <code>value</code> is
   * <code>null</code>, or not a <code>Number</code>, an
   * <code>IllegalArgumentException</code> is thrown.  No
   * bounds checking is done here; the new value may invalidate the
   * <code>(minimum &lt;= value &lt;= maximum)</code>
   * invariant enforced by the constructors.   It's also possible to set
   * the value to be something that wouldn't naturally occur in the sequence,
   * i.e. a value that's not modulo the <code>stepSize</code>.
   * This is to simplify updating the model, and to accommodate
   * spinners that don't want to restrict values that have been
   * directly entered by the user. Naturally, one should ensure that the
   * <code>(minimum &lt;= value &lt;= maximum)</code> invariant is true
   * before calling the <code>next</code>, <code>previous</code>, or
   * <code>setValue</code> methods.
   * <p>
   * This method fires a <code>ChangeEvent</code> if the value has changed.
   *
   * @param value the current (non <code>null</code>) <code>Number</code>
   *         for this sequence
   * @throws IllegalArgumentException if <code>value</code> is
   *         <code>null</code> or not a <code>Number</code>
   * @see #getNumber
   * @see #getValue
   * @see SpinnerModel#addChangeListener
   */
  setValue(value: any): void {
    var number$;
    if (!($J.isa((number$ = value), JNumber))) {
      throw new IllegalArgumentException('illegal value');
    }
    if (!$J.equals(number$, this.value_)) {
      this.value_ = number$;
      this.fireStateChanged();
    }
  }
}

$J.define(SpinnerNumberModel, 'javax.swing.SpinnerNumberModel', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'javax.swing.AbstractSpinnerModel', ctors: { '': '_SpinnerNumberModel$', 'double,double,double,double': '_SpinnerNumberModel$double$double$double$double', 'int,int,int,int': '_SpinnerNumberModel$int$int$int$int', 'java.lang.Number,java.lang.Comparable,java.lang.Comparable,java.lang.Number': '_SpinnerNumberModel$Number$Comparable$Comparable$Number' } });
