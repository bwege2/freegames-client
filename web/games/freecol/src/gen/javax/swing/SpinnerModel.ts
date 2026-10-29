// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/SpinnerModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2000, 2013, Oracle and/or its affiliates. All rights reserved.
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

/**
 * A model for a potentially unbounded sequence of object values.  This model
 * is similar to <code>ListModel</code> however there are some important differences:
 * <ul>
 * <li> The number of sequence elements isn't necessarily bounded.
 * <li> The model doesn't support indexed random access to sequence elements.
 *      Only three sequence values are accessible at a time: current, next and
 *      previous.
 * <li> The current sequence element, can be set.
 * </ul>
 * <p>
 * A <code>SpinnerModel</code> has three properties, only the first is read/write.
 * <dl>
 *   <dt><code>value</code>
 *   <dd>The current element of the sequence.
 *
 *   <dt><code>nextValue</code>
 *   <dd>The following element or null if <code>value</code> is the
 *     last element of the sequence.
 *
 *   <dt><code>previousValue</code>
 *   <dd>The preceding element or null if <code>value</code> is the
 *     first element of the sequence.
 * </dl>
 * When the <code>value</code> property changes,
 * <code>ChangeListeners</code> are notified.  <code>SpinnerModel</code> may
 * choose to notify the <code>ChangeListeners</code> under other circumstances.
 *
 * @see JSpinner
 * @see AbstractSpinnerModel
 * @see SpinnerListModel
 * @see SpinnerNumberModel
 * @see SpinnerDateModel
 *
 * @author Hans Muller
 * @since 1.4
 */
export class SpinnerModel {
}

$J.define(SpinnerModel, 'javax.swing.SpinnerModel', { kind: 'interface' });
