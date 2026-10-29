// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/SpinnerDateModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../jre/index.ts';
import { AbstractSpinnerModel } from './AbstractSpinnerModel.ts';

/**
 * A <code>SpinnerModel</code> for sequences of <code>Date</code>s.
 * The upper and lower bounds of the sequence are defined by properties called
 * <code>start</code> and <code>end</code> and the size
 * of the increase or decrease computed by the <code>nextValue</code>
 * and <code>previousValue</code> methods is defined by a property
 * called <code>calendarField</code>.  The <code>start</code>
 * and <code>end</code> properties can be <code>null</code> to
 * indicate that the sequence has no lower or upper limit.
 * <p>
 * The value of the <code>calendarField</code> property must be one of the
 * <code>java.util.Calendar</code> constants that specify a field
 * within a <code>Calendar</code>.  The <code>getNextValue</code>
 * and <code>getPreviousValue</code>
 * methods change the date forward or backwards by this amount.
 * For example, if <code>calendarField</code> is <code>Calendar.DAY_OF_WEEK</code>,
 * then <code>nextValue</code> produces a <code>Date</code> that's 24
 * hours after the current <code>value</code>, and <code>previousValue</code>
 * produces a <code>Date</code> that's 24 hours earlier.
 * <p>
 * The legal values for <code>calendarField</code> are:
 * <ul>
 *   <li><code>Calendar.ERA</code>
 *   <li><code>Calendar.YEAR</code>
 *   <li><code>Calendar.MONTH</code>
 *   <li><code>Calendar.WEEK_OF_YEAR</code>
 *   <li><code>Calendar.WEEK_OF_MONTH</code>
 *   <li><code>Calendar.DAY_OF_MONTH</code>
 *   <li><code>Calendar.DAY_OF_YEAR</code>
 *   <li><code>Calendar.DAY_OF_WEEK</code>
 *   <li><code>Calendar.DAY_OF_WEEK_IN_MONTH</code>
 *   <li><code>Calendar.AM_PM</code>
 *   <li><code>Calendar.HOUR</code>
 *   <li><code>Calendar.HOUR_OF_DAY</code>
 *   <li><code>Calendar.MINUTE</code>
 *   <li><code>Calendar.SECOND</code>
 *   <li><code>Calendar.MILLISECOND</code>
 * </ul>
 * However some UIs may set the calendarField before committing the edit
 * to spin the field under the cursor. If you only want one field to
 * spin you can subclass and ignore the setCalendarField calls.
 * <p>
 * This model inherits a <code>ChangeListener</code>.  The
 * <code>ChangeListeners</code> are notified whenever the models
 * <code>value</code>, <code>calendarField</code>,
 * <code>start</code>, or <code>end</code> properties changes.
 *
 * @see JSpinner
 * @see SpinnerModel
 * @see AbstractSpinnerModel
 * @see SpinnerListModel
 * @see SpinnerNumberModel
 * @see Calendar#add
 *
 * @author Hans Muller
 * @since 1.4
 */
export class SpinnerDateModel extends AbstractSpinnerModel {
  start_: Comparable<JDate> = null;
  end_: Comparable<JDate> = null;
  value_: Calendar = null;
  calendarField: number = 0;
}

$J.define(SpinnerDateModel, 'javax.swing.SpinnerDateModel', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'javax.swing.AbstractSpinnerModel', ctors: { '': '_SpinnerDateModel$', 'java.util.Date,java.lang.Comparable,java.lang.Comparable,int': '_SpinnerDateModel$Date$Comparable$Comparable$int' } });
